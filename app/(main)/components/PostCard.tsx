"use client";

import { useState } from "react";
import { IPublicacion, getPubId, getPubUrl, getPubTipo, getPubLey, getPubFecha, getPubUser, getPubFoto, getPubComentarios, getPubLikes, getPubLiked } from "@/types/instagram";

interface PostCardProps {
    post: IPublicacion;
    onLike: (id: number) => void;
    onCommentClick: (post: IPublicacion) => void;
}

export default function PostCard({ post, onLike, onCommentClick }: PostCardProps) {
    const [heartAnimId, setHeartAnimId] = useState<number | null>(null);

    const handleDoubleTap = () => {
        setHeartAnimId(getPubId(post));
        setTimeout(() => setHeartAnimId(null), 1000);
        if (!getPubLiked(post)) {
            onLike(getPubId(post));
        }
    };

    const tiempoTranscurrido = (fechaString: string | Date) => {
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

    const formatNumero = (num: number) => {
        if (!num) return "0";
        if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + " M";
        if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + " mil";
        return num.toString();
    };

    return (
        <div className="w-full pb-5 border-b border-[#262626] animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* CABECERA */}
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[1.5px]">
                        <div className="w-full h-full rounded-full bg-[#0c1014] p-[1px]">
                            <div className="w-full h-full rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer">
                                {getPubFoto(post) ? (
                                    <img src={getPubFoto(post)!} alt={getPubUser(post)} className="w-full h-full object-cover" />
                                ) : (
                                    <svg className="w-5 h-5 text-[#8e8e93]" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0 2c3.31 0 10 1.66 10 5v2H2v-2c0-3.34 6.69-5 10-5z" />
                                    </svg>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-[14px] font-semibold cursor-pointer text-[#F5F5F5] hover:text-gray-400 transition-colors">
                            {getPubUser(post)}
                        </span>
                        <span className="text-[#a8a8a8] mx-1 font-bold">·</span>
                        <span className="text-[14px] text-[#a8a8a8] font-normal">{tiempoTranscurrido(getPubFecha(post))}</span>
                    </div>
                </div>
                <button className="text-white hover:text-[#a8a8a8] transition-colors p-1 rounded-full hover:bg-white/5">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="19" cy="12" r="1.5" />
                        <circle cx="5" cy="12" r="1.5" />
                    </svg>
                </button>
            </div>

            {/* MEDIA */}
            <div 
                className="w-full bg-[#121212] rounded-[4px] border border-[#262626] overflow-hidden mb-3 aspect-auto max-h-[585px] flex items-center justify-center relative select-none group"
                onDoubleClick={handleDoubleTap}
            >
                {getPubTipo(post) === "Video" ? (
                    <video src={getPubUrl(post)} controls className="w-full max-h-[585px] object-contain" />
                ) : (
                    <img src={getPubUrl(post)} alt="Publicación" className="w-full max-h-[585px] object-contain pointer-events-none transition-transform duration-500 group-hover:scale-[1.02]" />
                )}

                {heartAnimId === getPubId(post) && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24 text-white/90 drop-shadow-2xl animate-heart-beat">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </div>
                )}
            </div>

            {/* INTERACCIÓN */}
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => onLike(getPubId(post))}
                        className={`flex items-center gap-1.5 transition-all active:scale-90 ${getPubLiked(post) ? 'text-[#ff3040]' : 'hover:text-gray-400'}`}
                    >
                        {getPubLiked(post) ? (
                            <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" stroke="currentColor" strokeWidth="1">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                        )}
                    </button>
                    <button
                        onClick={() => onCommentClick(post)}
                        className="flex items-center hover:text-gray-400 transition-colors"
                    >
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                        </svg>
                    </button>
                    <button className="flex items-center hover:text-gray-400 transition-colors">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                            <line x1="22" x2="11" y1="2" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    </button>
                </div>
                <button className="hover:text-gray-400 transition-colors">
                    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                </button>
            </div>

            {/* INFO */}
            <div className="px-1">
                {getPubLikes(post) > 0 && (
                    <p className="text-[14px] font-bold mb-1">{formatNumero(getPubLikes(post))} Me gusta</p>
                )}
                {getPubLey(post) && (
                    <div className="text-[14px] leading-relaxed break-words font-normal text-[#F5F5F5] mb-1">
                        <span className="font-semibold text-white mr-2 cursor-pointer hover:opacity-70">{getPubUser(post)}</span>
                        {getPubLey(post)}
                    </div>
                )}
                {getPubComentarios(post) > 0 && (
                    <button 
                        onClick={() => onCommentClick(post)}
                        className="text-[14px] text-[#a8a8a8] font-normal hover:text-gray-500 transition-colors"
                    >
                        Ver los {formatNumero(getPubComentarios(post))} comentarios
                    </button>
                )}
            </div>
        </div>
    );
}
