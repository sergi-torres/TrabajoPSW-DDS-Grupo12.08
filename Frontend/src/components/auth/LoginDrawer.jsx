import { useState } from "react";
import { Drawer } from "vaul";
import { AuthForm } from "./AuthForm";

/**
 * LoginDrawer.jsx
 * 
 * Modal inferior que desliza hacia arriba en vista móvil.
 * Soporta cambio entre login y register con scroll correcto.
 */
export function LoginDrawer() {
    const [mode, setMode] = useState("login");

    return (
        <Drawer.Root shouldScaleBackground>

            <Drawer.Trigger asChild>
                <button className="text-muted-foreground font-body font-semibold hover:text-[var(--color-org)] transition-colors py-4 px-6 rounded-full hover:bg-black/5">
                    ¿Eres organizador, participante o jurado? <br />
                    <span className="text-[var(--color-org)] underline decoration-2 underline-offset-4">Inicia sesión</span>
                </button>
            </Drawer.Trigger>

            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />

                <Drawer.Content className="bg-card flex flex-col rounded-t-[32px] fixed bottom-0 left-0 right-0 z-50 outline-none shadow-[0_-10px_40px_rgba(0,0,0,0.1)]" style={{ maxHeight: '92dvh' }}>
                    <div className="p-4 px-6 bg-card rounded-t-[32px] flex-1 overflow-y-auto font-body">

                        {/* Handle / tirador */}
                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-border mb-6 mt-2" />

                        <div className="max-w-md mx-auto w-full pb-8">

                            {/* Tabs login / register dentro del drawer */}
                            <div className="flex p-1.5 bg-muted rounded-full relative mb-8">
                                <button
                                    onClick={() => setMode("login")}
                                    className={`flex-1 relative z-10 py-2.5 text-sm font-heading font-bold rounded-full text-center transition-colors ${mode === "login"
                                            ? "bg-card shadow-sm text-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    Iniciar Sesión
                                </button>
                                <button
                                    onClick={() => setMode("register")}
                                    className={`flex-1 relative z-10 py-2.5 text-sm font-heading font-bold rounded-full text-center transition-colors ${mode === "register"
                                            ? "bg-card shadow-sm text-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    Registrarse
                                </button>
                            </div>

                            <h3 className="text-2xl font-heading font-bold text-foreground mb-8 text-center">
                                {mode === "login" ? "Bienvenido de nuevo" : "Crea tu cuenta"}
                            </h3>

                            <AuthForm mode={mode} isMobile={true} />
                        </div>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
