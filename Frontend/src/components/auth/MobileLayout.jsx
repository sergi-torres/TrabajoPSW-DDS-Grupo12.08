import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { LoginDrawer } from "./LoginDrawer";
import logo from "../../assets/LogoSinTexto.png";
import { useNavigate } from "react-router-dom";
import { joinEvento } from "../../api/eventosApi";

/**
 * MobileLayout.jsx
 * 
 * Vista exclusiva para dispositivos móviles (app. Público / Gamificada).
 * Muestra el logo, un Input gigante centrado para el PIN del evento
 * y un `LoginDrawer` en la parte inferior para los demás roles.
 */

export function MobileLayout() {
    const navigate = useNavigate();
    const [pin, setPin] = useState("");

    const handleJoin = async (e) => {
        e.preventDefault();

        if (pin.length > 0) {
            try {
                const data = await joinEvento(pin);

                // PIN flow: siempre sesión pública nueva, sin identidad de jurado
                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                localStorage.removeItem("userName");
                localStorage.setItem("votacionSessionId", crypto.randomUUID());

                localStorage.setItem("eventoId", data.id);
                localStorage.setItem("eventoNombre", data.nombre || "Evento");
                navigate("/dashboard-votacion-categorias");
            } catch (error) {
                console.error("Error validando PIN:", error);
                alert(error.message);
            }
        }
    };

    return (
        <div className="flex flex-col h-[100dvh] p-6 bg-background text-primary">

            {/* Cabecera con el Logo */}
            <header className="flex justify-center pt-8 mb-12">
                <div className="flex items-center gap-2 text-3xl font-heading font-black tracking-tighter text-[var(--color-org)]">
                    <img src={logo} alt="Votify Logo" className="w-10 h-10 object-contain drop-shadow-sm" />
                    Votify
                </div>
            </header>

            {/* Contenido Principal */}
            <main className="flex-1 flex flex-col justify-center items-center w-full max-w-sm mx-auto space-y-8">
                <div className="w-full text-center space-y-6">

                    {/* Tarjeta Blanca */}
                    <div className="bg-card p-8 rounded-[32px] shadow-modal border border-border">
                        <h2 className="text-2xl font-heading font-bold text-foreground mb-2">¡Únete a la votación!</h2>
                        <p className="text-muted-foreground mb-8 font-medium">Introduce el PIN del evento</p>

                        <form onSubmit={handleJoin} className="space-y-4">
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="000000"
                                maxLength={6}
                                value={pin}
                                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                className="w-full text-center text-4xl font-body font-black tracking-widest py-6 px-4 rounded-xl bg-muted border-2 border-border focus:border-[var(--color-pub)] focus:ring-4 focus:ring-[var(--color-pub)]/20 outline-none transition-all placeholder:text-muted-foreground text-foreground"
                            />

                            <button
                                type="submit"
                                className="w-full py-5 rounded-xl bg-[var(--color-pub)] hover:opacity-90 active:scale-95 text-white text-xl font-heading font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <span>Entrar</span>
                                <ArrowRight className="w-6 h-6" strokeWidth={3} />
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            {/* Pie de página */}
            <footer className="py-8 text-center flex justify-center">
                <LoginDrawer />
            </footer>
        </div>
    );
}
