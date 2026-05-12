"use client";

import { useEffect, useState } from "react";
import PostDetailModal from "../components/Modals/PostDetailModal";
import PostCard from "../components/PostCard";
import FeedSkeleton from "../components/FeedSkeleton";
import { API_URL, authHeaders } from "@/lib/api";
import { IPublicacion, getPubId, getPubUser, getPubFoto, getPubComentarios, getPubLikes, getPubLiked } from "@/types/instagram";

export default function InicioPage() {
    const [publicaciones, setPublicaciones] = useState<IPublicacion[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    // Para el Modal de comentarios
    const [selectedPost, setSelectedPost] = useState<IPublicacion | null>(null);

    useEffect(() => {
        const cargarFeed = async () => {
            try {
                const res = await fetch(`${API_URL}/api/publicaciones`, {
                    method: "GET",
                    headers: authHeaders()
                });

                if (!res.ok) {
                    if (res.status === 401) {
                        document.cookie = "ig_token=; Max-Age=0; path=/";
                        document.cookie = "ig_user=; Max-Age=0; path=/";
                        window.location.replace("/Login");
                        return;
                    }
                    setError("No se pudieron cargar las publicaciones.");
                    return;
                }

                const data: IPublicacion[] = await res.json();
                setPublicaciones(data);
            } catch (err) {
                setError("Ocurrió un error al conectar con el servidor.");
            } finally {
                setCargando(false);
            }
        };

        cargarFeed();
    }, []);

    // Efecto para escuchar eventos globales
    useEffect(() => {
        const handleNewComment = (e: any) => {
            const pubId = e.detail;
            setPublicaciones(prev => prev.map(p => {
                if (getPubId(p) === pubId) {
                    return { ...p, cantidadComentarios: (getPubComentarios(p)) + 1 };
                }
                return p;
            }));
        };

        const handleLikeToggled = (e: any) => {
            const { publicacionId, isLiked, localLikes } = e.detail;
            const pureLikes = Number(localLikes) || 0;

            setPublicaciones(prev => prev.map(p => {
                if (getPubId(p) === publicacionId) {
                    return { ...p, cantidadLikes: pureLikes, haDadoLike: isLiked };
                }
                return p;
            }));
            
            setSelectedPost(prev => {
                if (prev && getPubId(prev) === publicacionId) {
                    return { ...prev, cantidadLikes: pureLikes, haDadoLike: isLiked };
                }
                return prev;
            });
        };

        window.addEventListener('commentAdded', handleNewComment);
        window.addEventListener('likeToggled', handleLikeToggled);
        return () => {
            window.removeEventListener('commentAdded', handleNewComment);
            window.removeEventListener('likeToggled', handleLikeToggled);
        };
    }, []);

    const handleToggleLike = async (pubId: number) => {
        const postIndex = publicaciones.findIndex(p => getPubId(p) === pubId);
        if (postIndex === -1) return;
        
        const targetPost = publicaciones[postIndex];
        const pWasLiked = getPubLiked(targetPost);
        const pLikes = Number(getPubLikes(targetPost)) || 0;
        
        const willLike = !pWasLiked;
        const newCount = willLike ? pLikes + 1 : Math.max(0, pLikes - 1);
        
        setPublicaciones(prev => {
            const newList = [...prev];
            const idx = newList.findIndex(p => getPubId(p) === pubId);
            if (idx !== -1) {
                newList[idx] = { 
                    ...newList[idx], 
                    cantidadLikes: newCount, 
                    haDadoLike: willLike 
                };
            }
            return newList;
        });

        // MODO LOCAL: No enviamos al backend
    };

    return (
        <div className="w-full max-w-[630px] mx-auto pt-10 px-4 pb-20">
            {cargando ? (
                <FeedSkeleton />
            ) : error ? (
                <div className="text-center mt-20 p-8 rounded-xl bg-red-500/10 border border-red-500/20 text-[#ff4d4d]">
                    <p className="font-semibold">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            ) : publicaciones.length === 0 ? (
                <div className="text-center mt-20 text-[#e5e7eb] p-10 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-white/20 flex items-center justify-center">
                        <svg className="w-10 h-10 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        </svg>
                    </div>
                    <h2 className="text-[24px] font-bold mb-2">Aún no hay publicaciones</h2>
                    <p className="text-[14px] text-gray-400">Sigue a algunas personas para ver sus fotos y videos aquí.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-10 w-full max-w-[470px] mx-auto">
                    {publicaciones.map((post) => (
                        <PostCard 
                            key={getPubId(post)} 
                            post={post} 
                            onLike={handleToggleLike}
                            onCommentClick={setSelectedPost}
                        />
                    ))}
                </div>
            )}

            {selectedPost && (
                <PostDetailModal
                    post={selectedPost}
                    onClose={() => setSelectedPost(null)}
                    profilePic={getPubFoto(selectedPost) ?? ""}
                    displayUsername={getPubUser(selectedPost)}
                    setShowOptions={() => { }}
                />
            )}
        </div>
    );
}
