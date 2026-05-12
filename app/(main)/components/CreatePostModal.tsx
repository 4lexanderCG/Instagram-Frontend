"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import EmojiPicker, { Theme } from "emoji-picker-react";

const ModalOverlay = ({ children, isDarkForm = false, onClose }: { children: React.ReactNode, isDarkForm?: boolean, onClose: () => void }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 pt-5 pr-5 pb-5 pl-5" onClick={onClose}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white hover:opacity-70 transition-opacity">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
        <div onClick={(e) => e.stopPropagation()} className={`bg-[#212328] rounded-xl overflow-hidden flex flex-col shadow-2xl transition-all duration-300 transform scale-100 opacity-100 ${isDarkForm ? 'bg-[#1c1e21]' : ''}`}>
            {children}
        </div>
    </div>
);

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
    // Control de Pantallas/Pasos:
    const [step, setStep] = useState<number>(1);
    const [file, setFile] = useState<File | null>(null);
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);
    const [caption, setCaption] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // Usuario para la UI 
    const [nombreUsuario, setNombreUsuario] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isOpen) {
            // Reiniciar estado al CERRAR
            setStep(1);
            setFile(null);
            setMediaUrl(null);
            setCaption("");
            setIsUploading(false);
            document.body.style.overflow = 'unset';
        } else {
            // Al abrir
            const cookieUser = document.cookie
                .split("; ")
                .find((row) => row.startsWith("ig_user="))
                ?.split("=")[1];
            if (cookieUser) setNombreUsuario(cookieUser);
            document.body.style.overflow = 'hidden';
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // --- MANEJO DE ARCHIVOS ---
    const handleFile = (selectedFile: File) => {
        if (!selectedFile) return;

        setFile(selectedFile);
        const url = URL.createObjectURL(selectedFile);
        setMediaUrl(url);

        if (selectedFile.type.startsWith("video/")) {
            setStep(1.5);
        } else {
            setStep(2);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    // --- COMPARTIR FINAL ---
    const handleCompartir = async () => {
        if (!file) return;

        setIsUploading(true);
        setStep(4); // Cargando

        try {
            const token = document.cookie.split("; ").find((row) => row.startsWith("ig_token="))?.split("=")[1];

            const formData = new FormData();
            
            // 1. Parte de la publicación (JSON)
            const publicacionData = {
                leyenda: caption,
                tipoMedia: file.type.startsWith("video/") ? "Video" : "Imagen",
                usuario: { id: 1 } // Usuario por defecto para pruebas sin login
            };
            formData.append("publicacion", new Blob([JSON.stringify(publicacionData)], { type: "application/json" }));
            
            // 2. Parte del archivo
            formData.append("file", file);

            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

            const res = await fetch(`${API_URL}/api/publicaciones`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData
            });

            if (res.ok) {
                setStep(5);
            } else {
                const errorText = await res.text();
                console.error("Error backend:", errorText);
                alert("Error al compartir la publicación. Verifica el backend.");
                setStep(3);
            }
        } catch (err) {
            console.error(err);
            alert("Error de conexión al intentar publicar.");
            setStep(3);
        } finally {
            setIsUploading(false);
        }
    };

    // ==========================================
    // RENDERIZADO POR PASOS
    // ==========================================

    // PASO 1: Subir
    if (step === 1) {
        return (
            <ModalOverlay onClose={onClose}>
                <div className="w-[450px] h-[500px] flex flex-col bg-[#212328]">
                    <div className="h-[42px] border-b border-[#363636] flex items-center justify-center bg-[#0c1014]">
                        <span className="font-semibold text-[16px]">Crear nueva publicación</span>
                    </div>

                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        className="flex-1 flex flex-col items-center justify-center gap-4"
                    >
                        <svg aria-label="Icono para representar contenido multimedia" color="#ffffff" fill="#ffffff" height="77" role="img" viewBox="0 0 97.6 77.3" width="96">
                            <path d="M16.3 24h.3c2.8-.2 4.9-2.6 4.8-5.4-.2-2.8-2.6-4.9-5.4-4.8s-4.9 2.6-4.8 5.4c.1 2.7 2.4 4.8 5.1 4.8zm-2.4-7.2c.5-.6 1.3-1 2.1-1h.2c1.7 0 3.1 1.4 3.1 3.1 0 1.7-1.4 3.1-3.1 3.1-1.7 0-3.1-1.4-3.1-3.1 0-.8.3-1.5.8-2.1z" fill="currentColor"></path>
                            <path d="M84.7 18.4L58.6 12l-1.1-5c-.3-1.6-1.9-2.7-3.5-2.4L23.7 12c-1.6.4-2.6 2-2.2 3.6l.7 3.4h-5c-2.3 0-4.2 1.9-4.2 4.2v50.5c0 2.3 1.9 4.2 4.2 4.2h67.1c2.3 0 4.2-1.9 4.2-4.2V22.6c0-2.3-1.9-4.2-4.2-4.2h-3v-4.6c.4-1.6-.7-3.2-2.3-3.6zM24.7 15l29.1-6.1.6 2.5-30.8 6.5-.4-1.8c-.3-1.2.6-2.4 1.5-2.7zM15 72.8V25.2c0-.5.4-.9.9-.9h62.8c.5 0 .9.4.9.9v19.4c-1.7-1-3.6-1.5-5.6-1.5h-1v-4.1c0-2.3-1.9-4.2-4.2-4.2h-3C63.2 34.6 61.3 36.5 61.3 38.8v4.1h-4c-2.3 0-4.2 1.9-4.2 4.2v4.1H49c-2.3 0-4.2 1.9-4.2 4.2v17H15.9c-.5 0-.9-.4-.9-.9z" fill="currentColor"></path>
                            <path d="M91.8 38.8v29.4c0 .5-.4.9-.9.9H69c-.5 0-.9-.4-.9-.9V38.8c0-.5.4-.9.9-.9h21.9c.5 0 .9.4.9.9z" fill="currentColor"></path>
                            <path d="M68.5 61.5L81 49l11.4 11.4" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path>
                            <path d="M15 61.5L34.1 42l15.1 15" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path>
                            <circle cx="83.8" cy="48.5" r="3.2" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></circle>
                        </svg>
                        <p className="text-[20px] font-normal mt-2">Arrastra las fotos y los videos aquí</p>

                        <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-[#4a5df9] hover:bg-[#3b4bcf] text-white font-semibold text-[14px] px-4 py-1.5 rounded-lg mt-4 transition-colors"
                        >
                            Seleccionar de la computadora
                        </button>
                    </div>
                </div>
            </ModalOverlay>
        );
    }

    // PASO 1.5: Advertencia Reels
    if (step === 1.5) {
        return (
            <ModalOverlay isDarkForm={true} onClose={onClose}>
                <div className="w-[400px] flex flex-col items-center bg-[#212328] rounded-xl pb-5 pt-8 px-6 text-center shadow-lg relative">
                    <div className="w-16 h-16 rounded-full border border-[#fbad50] flex items-center justify-center mb-4">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#fbad50" strokeWidth="1.5" className="w-8 h-8">
                            <rect x="2" y="2" width="20" height="20" rx="3"></rect>
                            <path d="M15 12l-6-4v8l6-4z"></path>
                        </svg>
                    </div>
                    <h2 className="text-[20px] font-semibold tracking-wide mb-6 leading-tight">Las publicaciones con video ahora se<br />comparten como reels</h2>

                    <div className="flex gap-4 items-start text-left mb-6 w-full">
                        <svg className="w-6 h-6 mt-1 text-gray-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="12" cy="7" r="4"></circle>
                            <path d="M4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2"></path>
                        </svg>
                        <p className="text-[14px] text-gray-300">Tu cuenta es pública, por lo que cualquier persona puede descubrir el video y usar el audio original para crear un reel.</p>
                    </div>

                    <button
                        onClick={() => setStep(2)}
                        className="w-full bg-[#4a5df9] hover:bg-[#3b4bcf] text-white font-semibold text-[14px] py-3 rounded-lg transition-colors"
                    >
                        Aceptar
                    </button>
                </div>
            </ModalOverlay>
        );
    }

    // PASO 2: Recortar / Preview
    if (step === 2) {
        return (
            <ModalOverlay onClose={onClose}>
                <div className="w-[450px] h-[500px] flex flex-col bg-[#212328]">
                    <div className="h-[42px] border-b border-[#363636] flex items-center justify-between px-4 bg-[#0c1014]">
                        <button onClick={() => setStep(1)} className="text-white hover:opacity-70 p-1">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        </button>
                        <span className="font-semibold text-[16px]">Recortar</span>
                        <button onClick={() => setStep(3)} className="text-[#4a5df9] hover:text-white font-semibold text-[14px] transition-colors">
                            Siguiente
                        </button>
                    </div>
                    <div className="flex-1 bg-black flex items-center justify-center overflow-hidden">
                        {file?.type.startsWith("video/") ? (
                            <video src={mediaUrl!} controls className="w-full h-full object-contain" />
                        ) : (
                            <img src={mediaUrl!} alt="Preview" className="w-full h-full object-contain" />
                        )}
                    </div>
                </div>
            </ModalOverlay>
        );
    }

    // PASO 3: Etiquetar, Subir
    if (step === 3) {
        return (
            <ModalOverlay onClose={onClose}>
                <div className="w-[750px] h-[500px] flex flex-col bg-[#212328]">
                    <div className="h-[42px] border-b border-[#363636] flex items-center justify-between px-4 shrink-0 bg-[#0c1014]">
                        <button onClick={() => setStep(2)} className="text-white hover:opacity-70 p-1">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        </button>
                        <span className="font-semibold text-[16px]">Crear nueva publicación</span>
                        <button onClick={handleCompartir} className="text-[#4a5df9] hover:text-white font-semibold text-[14px] transition-colors">
                            Compartir
                        </button>
                    </div>

                    <div className="flex-1 flex overflow-hidden">
                        <div className="w-[450px] h-full bg-black flex items-center justify-center shrink-0 border-r border-[#363636]">
                            {file?.type.startsWith("video/") ? (
                                <video src={mediaUrl!} className="w-full h-full object-contain" />
                            ) : (
                                <img src={mediaUrl!} alt="Preview" className="w-full h-full object-contain" />
                            )}
                        </div>

                        <div className="flex-1 bg-[#212328] flex flex-col">
                            <div className="p-4 flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-zinc-600 flex items-center justify-center overflow-hidden shrink-0">
                                    <svg className="w-5 h-5 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0 2c3.31 0 10 1.66 10 5v2H2v-2c0-3.34 6.69-5 10-5z" />
                                    </svg>
                                </div>
                                <span className="font-semibold text-[14px]">{nombreUsuario || "Usuario"}</span>
                            </div>

                            <div className="px-4 pb-2">
                                <textarea
                                    className="w-full bg-transparent resize-none outline-none text-[#F5F5F5] placeholder-[#a8a8a8] h-[160px] text-[15px]"
                                    placeholder="Escribe una leyenda..."
                                    maxLength={2200}
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                ></textarea>

                                <div className="flex justify-between items-center text-[#a8a8a8] mt-2 relative">
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            className={`transition-colors ${showEmojiPicker ? 'text-[#4a5df9]' : 'hover:text-white'}`}
                                        >
                                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10"></circle>
                                                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                                                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                                                <line x1="15" y1="9" x2="15.01" y2="9"></line>
                                            </svg>
                                        </button>

                                        {showEmojiPicker && (
                                            <div className="absolute top-8 left-[-10px] z-[150] shadow-2xl">
                                                <EmojiPicker
                                                    theme={Theme.DARK}
                                                    height={250}
                                                    width={280}
                                                    searchDisabled={true}
                                                    skinTonesDisabled={true}
                                                    previewConfig={{ showPreview: false }}
                                                    onEmojiClick={(emojiData) => {
                                                        setCaption((prev) => prev + emojiData.emoji);
                                                        setShowEmojiPicker(false);
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[12px]">{caption.length}/2200</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ModalOverlay>
        );
    }

    // PASO 4: Cargando Upload
    if (step === 4) {
        return (
            <ModalOverlay onClose={onClose}>
                <div className="w-[450px] h-[500px] flex flex-col bg-[#212328] items-center justify-center relative">
                    <span className="text-[#a8a8a8] absolute top-4 font-semibold text-[16px] border-b border-transparent w-full text-center pb-3">Compartiendo</span>
                    <p className="mt-4 text-[16px] text-gray-300">Publicando...</p>
                </div>
            </ModalOverlay>
        );
    }

    // PASO 5: Éxito final
    if (step === 5) {
        return (
            <ModalOverlay onClose={() => {
                onClose();
                window.location.reload();
            }}>
                <div className="w-[450px] h-[500px] flex flex-col bg-[#212328]">
                    <div className="h-[42px] border-b border-[#363636] flex items-center justify-center bg-[#0c1014]">
                        <span className="font-semibold text-[16px] text-white">Publicación compartida</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center gap-6">
                        <p className="text-[20px] text-white font-normal">Se compartió tu publicación.</p>
                    </div>
                </div>
            </ModalOverlay>
        );
    }

    return null;
}
