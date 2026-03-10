import { useState } from "react";
import { motion as Motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { AuthForm } from "./AuthForm";

/**
 * AuthTabs.jsx
 * 
 * Componente interactivo que gestiona la alternancia entre Login y Registro.
 * Utiliza Framer Motion para lograr una transición visual premium en el 
 * botón activo y anima la entrada/salida de los formularios (<AuthForm />).
 */
export function AuthTabs() {
    // ESTADO: Guarda qué pestaña está activa en este momento.
    // Por defecto es "login".
    const [activeTab, setActiveTab] = useState("login");

    return (
        <div className="space-y-8">
            {/* 1. EL CONTENEDOR DE PESTAÑAS */}
            <div className="flex p-1.5 bg-muted rounded-full relative">

                {/* LA PASTILLA ANIMADA (Framer Motion) */}
                <Motion.div
                    className="absolute top-1.5 bottom-1.5 rounded-full bg-card shadow-sm"
                    initial={false}
                    animate={{
                        x: activeTab === "login" ? 0 : "94%", // Si es login está en la posición 0, si no, se mueve 100% a la derecha
                        width: "50%"
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />

                {/* BOTÓN INICIAR SESIÓN */}
                <button
                    onClick={() => setActiveTab("login")}
                    className={clsx(
                        "flex-1 relative z-10 py-2.5 text-sm font-heading font-bold transition-colors duration-fast rounded-full text-center outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-org)] focus-visible:ring-offset-2",
                        // Si está activo es oscuro, si no, gris interactivo
                        activeTab === "login" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Iniciar Sesión
                </button>

                {/* BOTÓN REGISTRARSE */}
                <button
                    onClick={() => setActiveTab("register")}
                    className={clsx(
                        "flex-1 relative z-10 py-2.5 text-sm font-heading font-bold transition-colors duration-fast rounded-full text-center outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-part)] focus-visible:ring-offset-2",
                        activeTab === "register" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Registrarse
                </button>
            </div>

            {/* 2. EL CONTENEDOR DEL FORMULARIO CON ANIMACIÓN FADE-IN */}
            <AnimatePresence mode="wait">
                <Motion.div
                    // El key={activeTab} es le dice a Framer Motion que cuando 'activeTab' cambia, este div debe destruirse y crearse uno nuevo
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                    {/* Le pasamos al componente AuthForm el modo actual para que dibuje o esconda campos */}
                    <AuthForm mode={activeTab} />
                </Motion.div>
            </AnimatePresence>
        </div>
    );
}
