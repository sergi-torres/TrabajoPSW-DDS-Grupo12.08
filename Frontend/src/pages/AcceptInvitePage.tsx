import { useSearchParams } from "react-router-dom";
import { AuthTabs } from "../components/auth/AuthTabs";
import logo from "../assets/LogoSinTexto.png";

export default function AcceptInvitePage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-app font-body text-primary">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold">Invitación no válida</h1>
                    <p>No se ha proporcionado un token de invitación válido.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-app font-body text-primary">
            {/* Vista Escritorio */}
            <div className="hidden lg:flex h-screen w-full overflow-hidden">
                <div className="w-1/2 bg-gradient-to-br from-[var(--color-org)] to-[var(--color-part)] relative flex flex-col justify-between p-16">
                     <div className="relative z-10">
                        <div className="flex items-center gap-2 text-4xl font-heading font-black tracking-tighter text-white">
                            <img src={logo} alt="Votify Logo" className="w-12 h-12 object-contain" />
                            Votify
                        </div>
                    </div>
                    <div className="relative z-10 max-w-lg">
                        <h1 className="text-6xl font-heading font-black leading-tight mb-6 tracking-tight text-white">
                            Aceptar Invitación <br />
                            <span className="text-white/70">como Jurado.</span>
                        </h1>
                        <p className="text-xl text-white/80 font-medium leading-relaxed">
                            Únete al evento y comienza a evaluar proyectos con Votify.
                        </p>
                    </div>
                    <div></div>
                </div>
                <div className="w-1/2 bg-background flex flex-col items-center px-12 py-12 overflow-y-auto">
                    <div className="w-full max-w-md space-y-10 my-auto">
                        <div className="bg-card p-10 rounded-[32px] shadow-modal border border-border">
                            <h2 className="text-2xl font-heading font-bold text-center mb-6">Completa tu perfil</h2>
                            <AuthTabs invitationToken={token} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Vista Móvil */}
            <div className="lg:hidden p-6 space-y-8">
                 <div className="flex items-center gap-2 text-2xl font-heading font-black tracking-tighter text-primary">
                    <img src={logo} alt="Votify Logo" className="w-8 h-8 object-contain" />
                    Votify
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-heading font-black">Aceptar Invitación</h1>
                    <p className="text-muted-foreground">Únete como jurado al evento.</p>
                </div>
                <div className="bg-card p-6 rounded-3xl shadow-sm border border-border">
                    <AuthTabs invitationToken={token} />
                </div>
            </div>
        </div>
    );
}
