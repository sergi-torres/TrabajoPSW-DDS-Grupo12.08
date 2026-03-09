import { Hash } from "lucide-react";
import { AuthTabs } from "./AuthTabs";
import logo from "../../assets/LogoSinTexto.png";

/**
 * DesktopLayout.jsx
 */
export function DesktopLayout() {
    return (
        <div className="flex h-screen w-full overflow-hidden font-body">

            {/* PANEL IZQUIERDO: Branding */}
            <div className="w-1/2 bg-gradient-to-br from-[var(--color-org)] to-[var(--color-part)] relative flex flex-col justify-between p-16 overflow-hidden">

                {/* Geometría Abstracta de Fondo */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-[80px] opacity-40" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-[var(--color-part)] rounded-full blur-[100px] opacity-60" />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-[40px] border-white/10 rounded-full" />
                </div>

                {/* Logo */}
                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-4xl font-heading font-black tracking-tighter text-white">
                        <img src={logo} alt="Votify Logo" className="w-12 h-12 object-contain drop-shadow-md brightness-0 invert" />
                        Votify
                    </div>
                </div>

                {/* Texto Hero */}
                <div className="relative z-10 max-w-lg">
                    <h1 className="text-6xl font-heading font-black leading-tight mb-6 tracking-tight text-white">
                        Juzgar y competir <br />
                        <span className="text-white/70">en un solo clic.</span>
                    </h1>
                    <p className="text-xl text-white/80 font-medium leading-relaxed">
                        La plataforma inteligente de evaluación para eventos, hackathons y concursos.
                        Gamificación y análisis en tiempo real.
                    </p>
                </div>

                {/* Pie de página */}
                <div>
                </div>
            </div>

            {/* PANEL DERECHO: Formularios */}
            <div className="w-1/2 bg-background flex flex-col justify-center items-center p-12 overflow-y-auto">
                <div className="w-full max-w-md space-y-10">

                    {/* Tarjeta Principal */}
                    <div className="bg-card p-10 rounded-[32px] shadow-modal border border-border">
                        <AuthTabs />
                    </div>

                    {/* Separador "O" */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-background text-muted-foreground font-bold uppercase tracking-wider">O</span>
                        </div>
                    </div>

                    {/* Tarjeta PIN */}
                    <div className="bg-card p-8 rounded-[24px] shadow-sm border border-border flex flex-col gap-4 group hover:shadow-hover hover:-translate-y-1 transition-all">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-[var(--color-state-success-bg)] text-[var(--color-state-success)] rounded-lg">
                                <Hash className="w-5 h-5" />
                            </div>
                            <h3 className="font-heading font-bold text-foreground text-lg">¿Tienes un código de evento?</h3>
                        </div>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                placeholder="PIN del evento"
                                className="flex-1 bg-muted border border-border rounded-xl px-4 py-3 font-mono font-bold text-lg focus:ring-2 focus:ring-[var(--color-pub)]/20 focus:border-[var(--color-pub)] outline-none transition-all placeholder:font-body placeholder:font-normal placeholder:text-muted-foreground text-foreground"
                            />
                            <button
                                type="button"
                                className="bg-[var(--color-pub)] hover:opacity-90 text-white font-heading font-bold py-3 px-6 rounded-xl transition-colors flex items-center shadow-md active:scale-95"
                            >
                                Unirse
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
