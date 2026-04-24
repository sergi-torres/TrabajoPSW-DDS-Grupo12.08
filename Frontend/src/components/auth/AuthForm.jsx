import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus, User, AtSign } from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "../../hooks/useAuth";

/**
 * Componente "tonto" (Dumb Component) que renderiza el formulario real.
 * Si mode="login", muestra [Email, Password]. 
 * Si mode="register", muestra [NombreCompleto, Username, Email, Password].
 * 
 * Toda la lógica de red y estado global vive en useAuth().
 */
export function AuthForm({ mode = "login", isMobile = false, invitationToken = null }) {
    const { handleLogin, handleRegister } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nombreCompleto, setNombreCompleto] = useState("");
    const [nombreUsuario, setNombreUsuario] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (mode === "login") {
            await handleLogin(email, password, invitationToken);
        } else {
            await handleRegister({ nombreCompleto, nombreUsuario, email, password }, invitationToken);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5 font-body">

            {mode === "register" && (
                <>
                    <div className="space-y-1.5">
                        <label className="text-sm font-heading font-bold text-foreground ml-1">Nombre Completo</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-[var(--color-part)] transition-colors" />
                            <input
                                type="text"
                                value={nombreCompleto}
                                onChange={(e) => setNombreCompleto(e.target.value)}
                                placeholder="Juan Pérez"
                                required
                                className="w-full pl-12 pr-4 py-4 bg-muted border-2 border-border rounded-xl focus:bg-card focus:border-[var(--color-part)] focus:ring-4 focus:ring-[var(--color-part)]/15 outline-none transition-all font-medium text-foreground placeholder:text-muted-foreground"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-heading font-bold text-foreground ml-1">Nombre de Usuario</label>
                        <div className="relative group">
                            <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-[var(--color-part)] transition-colors" />
                            <input
                                type="text"
                                value={nombreUsuario}
                                onChange={(e) => setNombreUsuario(e.target.value)}
                                placeholder="juan_p"
                                required
                                className="w-full pl-12 pr-4 py-4 bg-muted border-2 border-border rounded-xl focus:bg-card focus:border-[var(--color-part)] focus:ring-4 focus:ring-[var(--color-part)]/15 outline-none transition-all font-medium text-foreground placeholder:text-muted-foreground"
                            />
                        </div>
                    </div>
                </>
            )}

            <div className="space-y-1.5">
                <label className="text-sm font-heading font-bold text-foreground ml-1">Correo Electrónico</label>
                <div className="relative group">
                    <Mail className={clsx(
                        "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors",
                        mode === "login" ? "group-focus-within:text-[var(--color-org)]" : "group-focus-within:text-[var(--color-part)]"
                    )} />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nombre@ejemplo.com"
                        required
                        className={clsx(
                            "w-full pl-12 pr-4 py-4 bg-muted border-2 border-border rounded-xl focus:bg-card focus:ring-4 outline-none transition-all font-medium text-foreground placeholder:text-muted-foreground",
                            mode === "login"
                                ? "focus:border-[var(--color-org)] focus:ring-[var(--color-org)]/15"
                                : "focus:border-[var(--color-part)] focus:ring-[var(--color-part)]/15"
                        )}
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                    <label className="text-sm font-heading font-bold text-foreground">Contraseña</label>
                    {mode === "login" && (
                        <a href="#" className="text-xs font-semibold text-[var(--color-org)] hover:opacity-80 transition-colors">¿Olvidaste tu contraseña?</a>
                    )}
                </div>

                <div className="relative group">
                    <Lock className={clsx(
                        "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors",
                        mode === "login" ? "group-focus-within:text-[var(--color-org)]" : "group-focus-within:text-[var(--color-part)]"
                    )} />
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className={clsx(
                            "w-full pl-12 pr-12 py-4 bg-muted border-2 border-border rounded-xl focus:bg-card focus:ring-4 outline-none transition-all font-medium text-foreground placeholder:text-muted-foreground",
                            mode === "login"
                                ? "focus:border-[var(--color-org)] focus:ring-[var(--color-org)]/15"
                                : "focus:border-[var(--color-part)] focus:ring-[var(--color-part)]/15"
                        )}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <button
                type="submit"
                className={clsx(
                    "w-full py-4 rounded-xl text-white font-heading font-bold text-lg shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4",
                    mode === "login"
                        ? "bg-[var(--color-org)] hover:opacity-90"
                        : "bg-[var(--color-part)] hover:opacity-90"
                )}
            >
                {mode === "login" ? (
                    <><LogIn className="w-5 h-5" /> Iniciar Sesión</>
                ) : (
                    <><UserPlus className="w-5 h-5" /> Crear Cuenta</>
                )}
            </button>

            {isMobile && (
                <p className="text-center text-sm text-muted-foreground mt-6">
                    {mode === "login" ? "¿Aún no tienes cuenta? " : "¿Ya tienes cuenta? "}
                    <span className="text-[var(--color-org)] font-bold cursor-pointer hover:underline" onClick={() => alert('Pronto añadiremos el registro desde el móvil :)')}>
                        {mode === "login" ? "Regístrate" : "Inicia Sesión"}
                    </span>
                </p>
            )}
        </form>
    );
}
