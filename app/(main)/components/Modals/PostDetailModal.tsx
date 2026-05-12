import { IPublicacion, getPubLikes, getPubLiked } from "@/types/instagram";
import { useEffect, useState } from "react";
import { API_URL, authHeaders, jsonAuthHeaders } from "@/lib/api";

interface IComentario {
    comentarioId?: number;
    texto: string;
    fechaCreacion: string | Date;
    usuarioId?: number;
    nombreUsuario: string;
    fotoPerfilUrl: string | null;
    estaVerificado?: boolean | null;
}

interface PostDetailModalProps {
    post: IPublicacion;
    onClose: () => void;
    profilePic: string;
    displayUsername: string;
    setShowOptions: (show: boolean) => void;
}

const tiempoTranscurrido = (fechaString: string | Date) => {
    if (!fechaString) return "";
    const fecha = new Date(fechaString);
    const ahora = new Date();
    const diffMs = ahora.getTime() - fecha.getTime();
    const diffSegundos = Math.floor(diffMs / 1000);
    if (diffSegundos < 60) return `Hace ${Math.max(1, diffSegundos)} segundo${Math.max(1, diffSegundos) === 1 ? '' : 's'}`;
    const diffMinutos = Math.floor(diffSegundos / 60);
    if (diffMinutos < 60) return `Hace ${diffMinutos} minuto${diffMinutos === 1 ? '' : 's'}`;
    const diffHoras = Math.floor(diffMinutos / 60);
    if (diffHoras < 24) return `Hace ${diffHoras} hora${diffHoras === 1 ? '' : 's'}`;
    const diffDias = Math.floor(diffHoras / 24);
    if (diffDias < 7) return `Hace ${diffDias} día${diffDias === 1 ? '' : 's'}`;
    const diffSemanas = Math.floor(diffDias / 7);
    return `Hace ${diffSemanas} semana${diffSemanas === 1 ? '' : 's'}`;
};

const tiempoCorto = (fechaString: string | Date) => {
    if (!fechaString) return "";
    const fecha = new Date(fechaString);
    const ahora = new Date();
    const diffMs = ahora.getTime() - fecha.getTime();
    const diffSegundos = Math.floor(diffMs / 1000);
    if (diffSegundos < 60) return `${Math.max(1, diffSegundos)} s`;
    const diffMinutos = Math.floor(diffSegundos / 60);
    if (diffMinutos < 60) return `${diffMinutos} min`;
    const diffHoras = Math.floor(diffMinutos / 60);
    if (diffHoras < 24) return `${diffHoras} h`;
    const diffDias = Math.floor(diffHoras / 24);
    if (diffDias < 7) return `${diffDias} d`;
    const diffSemanas = Math.floor(diffDias / 7);
    return `${diffSemanas} sem`;
};

export default function PostDetailModal({
    post,
    onClose,
    profilePic,
    displayUsername,
    setShowOptions,
}: PostDetailModalProps) {
    const tipoMedia = post.tipoMedia;
    const urlMedia = post.urlMedia;
    const leyendaText = post.leyenda;
    const fechaCreacion = post.fechaCreacion;
    const publicacionId = post.id;

    const [comentarios, setComentarios] = useState<IComentario[]>([]);
    const [nuevoComentario, setNuevoComentario] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [isLiked, setIsLiked] = useState(() => getPubLiked(post));
    const [localLikes, setLocalLikes] = useState(() => Number(getPubLikes(post)) || 0);
    const [showHeartAnim, setShowHeartAnim] = useState(false);

    const handleToggleLike = async () => {
        // 1. Guardamos una foto estricta del estado ACTUAL antes del click
        const prevLiked = isLiked;
        const prevCount = localLikes;

        // 2. Calculamos el FUTURO
        const willLike = !prevLiked;
        const newCount = willLike ? prevCount + 1 : Math.max(0, prevCount - 1);

        // 3. Aplicamos el FUTURO a la UI inmediatamente
        setIsLiked(willLike);
        setLocalLikes(newCount);
        
        window.dispatchEvent(new CustomEvent('likeToggled', { 
            detail: { publicacionId, isLiked: willLike, localLikes: newCount } 
        }));

        // MODO LOCAL: No enviamos al backend
    };

    const handleDoubleClick = () => {
        setShowHeartAnim(true);
        setTimeout(() => setShowHeartAnim(false), 1000);
        
        if (!isLiked) {
            handleToggleLike();
        }
    };

    useEffect(() => {
        setIsLoading(false);
        // COMENTADO POR EL MOMENTO: No cargamos comentarios del backend
        /*
        setIsLoading(true);
        fetch(`${API_URL}/api/Publicacion/${publicacionId}/comentarios`, {
            headers: authHeaders()
        })
            .then(res => res.json())
            .then(data => {
                setComentarios(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
        */
    }, [publicacionId]);

    const handlePublicarComentario = async () => {
        if (!nuevoComentario.trim() || isSubmitting) return;
        setIsSubmitting(true);

        try {
            // MODO LOCAL: No enviamos al backend, solo agregamos al estado
            const newComm: IComentario = {
                comentarioId: Date.now(), // ID temporal
                texto: nuevoComentario,
                fechaCreacion: new Date(),
                nombreUsuario: displayUsername,
                fotoPerfilUrl: profilePic
            };
            
            setComentarios(prev => [...prev, newComm]);
            
            // Avisamos al feed que hay un nuevo comentario (para el contador visual)
            window.dispatchEvent(new CustomEvent('commentAdded', { detail: publicacionId }));
            
            setNuevoComentario("");
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 md:p-[5vh]" onClick={onClose}>
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:opacity-70 p-2"
            >
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <div className="flex w-full max-w-[1200px] h-full max-h-[900px] bg-black rounded-lg overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
                {/* Izquierda: Media */}
                <div className="flex-1 flex items-center justify-center relative bg-black select-none" onDoubleClick={handleDoubleClick}>
                    {tipoMedia === 'Video' ? (
                        <video src={urlMedia} controls autoPlay className="w-full h-full object-contain" />
                    ) : (
                        <img src={urlMedia} alt="Post" className="w-[100%] h-[100%] object-contain pointer-events-none" />
                    )}

                    {/* Animación del doble toque (Corazón flotante) */}
                    {showHeartAnim && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-28 h-28 text-white drop-shadow-2xl animate-ping opacity-80">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </div>
                    )}
                </div>

                {/* Derecha: Detalles */}
                <div className="w-[350px] md:w-[400px] bg-[#212328] hidden md:flex flex-col border-l border-[#2b3036]">
                    {/* Cabecera del post */}
                    <div className="h-[60px] px-4 flex items-center justify-between border-b border-[#2b3036]">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800">
                                {profilePic ? (
                                    <img src={profilePic} alt="Perfil" className="w-full h-full object-cover" />
                                ) : (
                                    <svg className="w-full h-full text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0 2c3.31 0 10 1.66 10 5v2H2v-2c0-3.34 6.69-5 10-5z" />
                                    </svg>
                                )}
                            </div>
                            <span className="font-semibold text-[14px]">{displayUsername}</span>
                        </div>
                        <button className="p-2 hover:opacity-70" onClick={() => setShowOptions(true)}>
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><circle cx="12" cy="12" r="1.5"></circle><circle cx="19" cy="12" r="1.5"></circle><circle cx="5" cy="12" r="1.5"></circle></svg>
                        </button>
                    </div>

                    {/* Comentarios */}
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col">
                        {leyendaText && (
                            <div className="w-full flex gap-3 text-left mb-6 items-start">
                                <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden bg-zinc-800">
                                    {profilePic ? <img src={profilePic} className="w-full h-full object-cover" /> : <svg className="w-full h-full text-gray-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0 2c3.31 0 10 1.66 10 5v2H2v-2c0-3.34 6.69-5 10-5z" /></svg>}
                                </div>
                                <div className="flex-1 flex flex-col pt-[2px]">
                                    <div className="text-[14px] leading-[18px] break-words text-[#F5F5F5]">
                                        <span className="font-semibold mr-2 cursor-pointer hover:text-gray-300">{displayUsername}</span>
                                        <span className="font-normal">{leyendaText}</span>
                                    </div>
                                    <div className="text-[12px] text-[#a8a8a8] mt-2 font-normal">
                                        {tiempoCorto(fechaCreacion)}
                                    </div>
                                </div>
                            </div>
                        )}

                        {isLoading ? (
                            <div className="flex flex-col gap-4 mt-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex gap-3 items-start">
                                        <div className="w-8 h-8 rounded-full bg-zinc-700 shrink-0 animate-pulse" />
                                        <div className="flex-1 flex flex-col gap-2 pt-1">
                                            <div className="h-3 w-24 bg-zinc-700 rounded animate-pulse" />
                                            <div className="h-3 w-full bg-zinc-700 rounded animate-pulse" />
                                            <div className="h-2 w-12 bg-zinc-700 rounded animate-pulse mt-1" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : comentarios.length > 0 ? (
                            comentarios.map((c, idx) => (
                                <div key={c.comentarioId || idx} className="w-full flex gap-3 text-left mb-5 items-start">
                                    <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden bg-zinc-800">
                                        {c.fotoPerfilUrl ? <img src={c.fotoPerfilUrl} className="w-full h-full object-cover" /> : <svg className="w-full h-full text-gray-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0 2c3.31 0 10 1.66 10 5v2H2v-2c0-3.34 6.69-5 10-5z" /></svg>}
                                    </div>
                                    <div className="flex-1 flex flex-col pt-[2px]">
                                        <div className="text-[14px] leading-[18px] break-words text-[#F5F5F5]">
                                            <span className="font-semibold mr-2 cursor-pointer hover:text-gray-300">{c.nombreUsuario || (c as any).NombreUsuario}</span>
                                            <span className="font-normal">{c.texto || (c as any).Texto}</span>
                                        </div>
                                        <div className="text-[12px] text-[#a8a8a8] mt-2 font-normal flex gap-4">
                                            <span>{tiempoCorto(c.fechaCreacion || (c as any).FechaCreacion)}</span>
                                            <span className="font-semibold cursor-pointer">Responder</span>
                                        </div>
                                    </div>
                                    <button className="p-1 shrink-0 ml-2 hover:opacity-70 mt-1">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                    </button>
                                </div>
                            ))
                        ) : !leyendaText && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center mt-8">
                                <h3 className="text-[18px] font-bold mb-1">Todavía no hay comentarios.</h3>
                                <p className="text-[14px] text-gray-400">Inicia la conversación.</p>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-[#2b3036] p-4">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex gap-4">
                                <button className="hover:opacity-70 transition-transform active:scale-90" onClick={handleToggleLike}>
                                    {isLiked ? (
                                        <svg viewBox="0 0 24 24" width="24" height="24" fill="#ff3040" stroke="#ff3040" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                    )}
                                </button>
                                <button className="hover:opacity-70"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg></button>
                                <button className="hover:opacity-70"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></button>
                            </div>
                            <button className="hover:opacity-70"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg></button>
                        </div>
                        <div className="text-[14px]">
                            {localLikes > 0 ? (
                                <p className="mb-1 font-semibold">{localLikes.toLocaleString('es')} Me gusta</p>
                            ) : (
                                <p className="mb-1">Sé el primero en <span className="font-bold cursor-pointer" onClick={handleToggleLike}>indicar que te gusta esto</span></p>
                            )}
                            <p className="text-[11px] text-[#a8a8a8] mt-1">{tiempoTranscurrido(fechaCreacion)}</p>
                        </div>
                    </div>

                    <div className="border-t border-[#2b3036] p-3 flex items-center gap-3">
                        <button className="hover:opacity-70"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg></button>
                        <input
                            type="text"
                            placeholder="Agrega un comentario..."
                            className="bg-transparent flex-1 outline-none text-[14px]"
                            value={nuevoComentario}
                            onChange={(e) => setNuevoComentario(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handlePublicarComentario();
                            }}
                        />
                        <button
                            onClick={handlePublicarComentario}
                            disabled={!nuevoComentario.trim() || isSubmitting}
                            className={`text-[14px] font-semibold transition-opacity ${nuevoComentario.trim() && !isSubmitting ? 'text-[#0095f6] cursor-pointer' : 'text-[#0095f6] opacity-50 cursor-default'}`}
                        >
                            Publicar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
