"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import CreatePostModal from "./CreatePostModal";

export default function Sidebar() {
    const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const createMenuRef = useRef<HTMLDivElement>(null);
    const moreMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (createMenuRef.current && !createMenuRef.current.contains(event.target as Node)) {
                setIsCreateMenuOpen(false);
            }
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
                setIsMoreMenuOpen(false);
            }
        }

        if (isCreateMenuOpen || isMoreMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isCreateMenuOpen, isMoreMenuOpen]);

    useEffect(() => {
        const handleOpenModal = () => setIsCreateModalOpen(true);
        window.addEventListener('openCreatePostModal', handleOpenModal);
        return () => window.removeEventListener('openCreatePostModal', handleOpenModal);
    }, []);

    // Deshabilitado temporalmente ya que el backend no tiene este endpoint
    /*
    useEffect(() => {
        const token = document.cookie.split("; ").find(r => r.startsWith("ig_token="))?.split("=")[1];
        if (token) {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
            fetch(`${API_URL}/api/Perfil/yo`, { headers: { "Authorization": `Bearer ${token}` } })
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (data) {
                        const pf = data.perfil || data.Perfil;
                        if (pf?.FotoPerfilUrl) setProfilePic(pf.FotoPerfilUrl);
                    }
                })
                .catch(() => {});
        }
    }, []);
    */

    return (
        <>
        <nav
            className={`fixed left-0 top-0 h-screen bg-[#0c1014] border-r border-[#363636] 
                       z-40 flex flex-col py-5 px-3 transition-all duration-300
                       w-[72px] hover:w-[244px] group ${(isCreateMenuOpen || isMoreMenuOpen) ? 'w-[244px] expanded' : ''}`}
        >
            <div className="mb-8 mt-2 flex items-center">
                <Link href="/Inicio" className="flex items-center justify-center w-12 h-12 rounded-lg hover:bg-[#25282c] transition-all shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                </Link>
            </div>

            <div className="flex flex-col gap-1 w-full relative">
                <NavItem href="/Inicio" label="Inicio" isActive={true}>
                    <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9.005 16.545a2.997 2.997 0 0 1 2.997-2.997A2.997 2.997 0 0 1 15 16.545V22h7V11.543L12 2 2 11.543V22h7v-5.455Z" />
                    </svg>
                </NavItem>

                <div className="relative" ref={createMenuRef}>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="group/item flex items-center gap-4 w-[48px] overflow-hidden group-hover:w-full [.expanded_&]:w-full h-12 px-3 rounded-lg hover:bg-[#25282c] transition-all"
                    >
                        <div className="shrink-0 transition-transform group-hover/item:scale-105">
                            <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" x2="12" y1="5" y2="19" />
                                <line x1="5" x2="19" y1="12" y2="12" />
                                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                            </svg>
                        </div>
                        <span className="text-[16px] whitespace-nowrap opacity-0 group-hover:opacity-100 [.expanded_&]:opacity-100 transition-opacity duration-300 font-normal">
                            Crear
                        </span>
                    </button>
                </div>

                <NavItem href="/Perfil" label="Perfil">
                    <div className="w-6 h-6 shrink-0 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-[#262626]">
                        {profilePic ? (
                            <img src={profilePic} alt="Perfil" className="w-full h-full object-cover" />
                        ) : (
                            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0 2c3.31 0 10 1.66 10 5v2H2v-2c0-3.34 6.69-5 10-5z" />
                            </svg>
                        )}
                    </div>
                </NavItem>
            </div>
        </nav>

        <CreatePostModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
        </>
    );
}

function NavItem({ href, label, children, isActive = false }: { href: string; label: string; children: React.ReactNode; isActive?: boolean }) {
    return (
        <Link href={href} className="group/item flex items-center gap-4 w-[48px] overflow-hidden group-hover:w-full [.expanded_&]:w-full h-12 px-3 rounded-lg hover:bg-[#25282c] transition-all">
            <div className="shrink-0 transition-transform group-hover/item:scale-105">
                {children}
            </div>
            <span className={`text-[16px] whitespace-nowrap opacity-0 group-hover:opacity-100 [.expanded_&]:opacity-100 transition-opacity duration-300 ${isActive ? "font-bold" : "font-normal"}`}>
                {label}
            </span>
        </Link>
    );
}
