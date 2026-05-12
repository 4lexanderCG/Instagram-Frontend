import Sidebar from "@/app/(main)/components/Sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-[#0c1014] text-white">

            {/* COMPONENTE SIDEBAR REUTILIZABLE Y EXPANDIBLE */}
            <Sidebar />

            {/* CONTENEDOR PRINCIPAL */}
            <main className="flex-1 ml-[72px] min-h-screen flex justify-center">
                <div className="w-full relative">
                    {children}
                </div>
            </main>

        </div>
    );
}
