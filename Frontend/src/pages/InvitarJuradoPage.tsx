import { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    ArrowLeft, Users, Trash2, Mail, Loader2, 
    CheckCircle2, AlertCircle, Send, FileText, RefreshCw, 
    ShieldCheck, Clock, X, AlertTriangle, LogOut
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { EventSidebar } from "../components/layout/EventSidebar";
import { EventContext } from "../context/EventContext";
import { AuthContext } from "../context/AuthContext";
import { getJuradosEvento, asignarJurado, eliminarJurado, reenviarInvitacion } from "../api/juradoApi";
import { getDashboard } from "../api/orgDashboardApi";
import logoVotify from "../assets/LogoVotify.png";

/**
 * Componente interno para el Modal de Confirmación
 */
function ConfirmModal({ isOpen, onClose, onConfirm, title, message, isLoading }: any) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <Motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />
                
                <Motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden"
                >
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        
                        <h3 className="text-2xl font-heading font-bold text-gray-900 mb-2">{title}</h3>
                        <p className="text-gray-500 leading-relaxed">{message}</p>
                    </div>

                    <div className="flex border-t border-gray-100">
                        <button 
                            onClick={onClose}
                            className="flex-1 px-6 py-5 text-sm font-bold text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors border-r border-gray-100"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="flex-1 px-6 py-5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Eliminar"}
                        </button>
                    </div>
                </Motion.div>
            </div>
        </AnimatePresence>
    );
}

export default function InvitarJuradoPage() {
    const { eventoId: paramEventoId } = useParams<{ eventoId: string }>();
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext)!;
    const { eventoId: contextId, userRole, userColor, isCollapsed, clearEventContext } = useContext(EventContext)!;
    const [jurados, setJurados] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [eventInfo, setEventInfo] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<any>(null);

    // Estado para el modal de eliminación
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [juradoToDelete, setJuradoToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Estado para reenvío
    const [isResending, setIsResending] = useState<string | null>(null); 

    const eventoId = paramEventoId || (contextId ? contextId.toString() : null);

    // Estados del formulario
    const [emailInput, setEmailInput] = useState("");
    const [emailsList, setEmailsList] = useState<string[]>([]); 
    const [customMessage, setCustomMessage] = useState("");

    const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    }, []);

    const handleLogout = () => {
        logout();
        clearEventContext();
        navigate('/login');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (["Enter", ",", " "].includes(e.key)) {
            e.preventDefault();
            addEmail();
        }
    };

    const addEmail = useCallback(() => {
        const trimmedEmail = emailInput.trim().replace(/,$/, "");
        if (!trimmedEmail) return;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(trimmedEmail)) {
            if (!emailsList.includes(trimmedEmail)) {
                setEmailsList([...emailsList, trimmedEmail]);
            }
            setEmailInput("");
        }
    }, [emailInput, emailsList]);

    const removeEmail = (emailToRemove: string) => {
        setEmailsList(prev => prev.filter(email => email !== emailToRemove));
    };

    const fetchJurados = useCallback(async () => {
        if (!eventoId || eventoId === "undefined") return;
        try {
            const data = await getJuradosEvento(Number(eventoId));
            setJurados(data);
        } catch (err: any) {
            console.error("Error cargando jurados:", err);
            showToast("Error al cargar la lista de jurados", "error");
        }
    }, [eventoId, showToast]);

    const fetchEventInfo = useCallback(async () => {
        if (!eventoId || eventoId === "undefined") return;
        try {
            const data = await getDashboard(Number(eventoId));
            setEventInfo(data.liveInfo);
        } catch (err) {
            console.error("Error cargando info del evento:", err);
        }
    }, [eventoId]);

    useEffect(() => {
        if (eventoId && eventoId !== "undefined") {
            Promise.all([fetchJurados(), fetchEventInfo()]).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [eventoId, fetchJurados, fetchEventInfo]);

    const handleAsignar = async (e: React.FormEvent) => {
        e.preventDefault();
        let finalEmails = [...emailsList];
        if (emailInput.trim()) {
            const trimmedEmail = emailInput.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(trimmedEmail) && !finalEmails.includes(trimmedEmail)) {
                finalEmails.push(trimmedEmail);
            }
        }
        if (finalEmails.length === 0 || !eventoId) return;
        setIsSubmitting(true);
        try {
            for (const email of finalEmails) {
                // Pasamos el mensaje personalizado
                await asignarJurado(Number(eventoId), email, customMessage);
            }
            showToast("Invitaciones enviadas correctamente", "success");
            setEmailInput("");
            setEmailsList([]); 
            setCustomMessage("");
            fetchJurados();
        } catch (err: any) {
            showToast(err.message, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReenviar = async (email: string) => {
        if (!eventoId) return;
        setIsResending(email);
        try {
            await reenviarInvitacion(Number(eventoId), email);
            showToast(`Invitación reenviada a ${email}`, "success");
        } catch (err: any) {
            showToast(err.message, "error");
        } finally {
            setIsResending(null);
        }
    };

    const handleOpenDeleteModal = (jurado: any) => {
        setJuradoToDelete(jurado);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!juradoToDelete || !eventoId) return;
        setIsDeleting(true);
        const isInvitation = juradoToDelete.id < 0;
        try {
            await eliminarJurado(Number(eventoId), juradoToDelete.id);
            showToast(isInvitation ? "Invitación eliminada" : "Jurado eliminado", "success");
            fetchJurados();
            setIsDeleteModalOpen(false);
        } catch (err: any) {
            showToast(err.message, "error");
        } finally {
            setIsDeleting(false);
            setJuradoToDelete(null);
        }
    };

    const activos = jurados.filter(j => j.nombreCompleto);
    const pendientes = jurados.filter(j => !j.nombreCompleto);

    const isPublicRole = userRole === "Público";

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <EventSidebar />
                <div className={`transition-all duration-300 ${isPublicRole ? 'lg:pl-10' : (isCollapsed ? 'lg:pl-28' : 'lg:pl-80')}`}>
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                </div>
            </div>
        );
    }

    if (!eventoId || eventoId === "undefined") {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
                <EventSidebar />
                <div className={`max-w-md bg-white p-8 rounded-3xl shadow-sm border border-red-100 transition-all duration-300 ${isPublicRole ? 'lg:pl-10' : (isCollapsed ? 'lg:pl-28' : 'lg:pl-80')}`}>
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Error de Identificación</h2>
                    <p className="text-gray-500 mb-6">No se ha podido identificar el evento.</p>
                    <button onClick={() => navigate('/eventos')} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">
                        Volver a Eventos
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-body relative">
            <EventSidebar />

            <div className="pb-[88px] lg:pb-12">
                <header 
                    className={`bg-blue-600 text-white p-6 lg:p-10 transition-all duration-300 ${isPublicRole ? 'lg:pl-10' : (isCollapsed ? 'lg:pl-28' : 'lg:pl-80')}`} 
                    style={{ backgroundColor: userColor || undefined }}
                >
                    <div className="max-w-7xl mx-auto">
                        <div className="flex justify-between items-start mb-6">
                            {!isPublicRole ? (
                                <button
                                    onClick={() => navigate('/eventos')}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all font-heading font-semibold text-sm group"
                                >
                                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
                                    Volver a eventos
                                </button>
                            ) : (
                                <div />
                            )}

                            {isPublicRole && (
                                <button
                                    onClick={handleLogout}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 backdrop-blur-sm rounded-xl transition-all duration-200 border border-white/10 font-heading font-semibold text-sm group"
                                >
                                    <LogOut className="w-4 h-4" strokeWidth={2.5} />
                                    Salir
                                </button>
                            )}
                        </div>

                        <h1 className="text-3xl lg:text-4xl font-heading font-bold tracking-tight mb-2">
                            Jurado
                        </h1>
                        <p className="text-blue-100 text-lg opacity-90">Gestión de Invitaciones al Jurado</p>
                    </div>
                </header>

                <main className={`max-w-7xl mx-auto p-6 lg:p-10 space-y-12 transition-all duration-300 ${isPublicRole ? 'lg:pl-10' : (isCollapsed ? 'lg:pl-28' : 'lg:pl-80')}`}>
                    <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 lg:p-8 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-xl font-heading font-bold text-gray-900 flex items-center gap-2">
                                <Users className="w-6 h-6 text-blue-600" /> Panel de Expertos
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                            <div className="p-6 lg:p-8">
                                <h3 className="text-sm font-bold text-green-600 mb-6 flex items-center gap-2 uppercase tracking-widest">
                                    <CheckCircle2 className="w-4 h-4" /> Activos ({activos.length})
                                </h3>
                                <div className="space-y-4">
                                    {activos.length === 0 ? (
                                        <p className="text-sm text-gray-400 italic">No hay jurados registrados aún.</p>
                                    ) : (
                                        activos.map(j => (
                                            <div key={j.id} className="flex items-center justify-between group p-2 hover:bg-gray-50 rounded-2xl transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-sm">
                                                        {j.nombreCompleto?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{j.nombreCompleto}</p>
                                                        <p className="text-[11px] text-gray-500">{j.email}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleOpenDeleteModal(j)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="p-6 lg:p-8 bg-gray-50/20">
                                <h3 className="text-sm font-bold text-orange-500 mb-6 flex items-center gap-2 uppercase tracking-widest">
                                    <Clock className="w-4 h-4" /> Pendientes ({pendientes.length})
                                </h3>
                                <div className="space-y-4">
                                    {pendientes.length === 0 ? (
                                        <p className="text-sm text-gray-400 italic">No hay invitaciones pendientes.</p>
                                    ) : (
                                        pendientes.map(j => (
                                            <div key={j.id || j.email} className="flex items-center justify-between group p-2 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-200 text-gray-500 rounded-xl flex items-center justify-center font-bold text-sm">
                                                        ?
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-700">{j.email}</p>
                                                        <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold">Esperando respuesta</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button 
                                                        onClick={() => handleReenviar(j.email)}
                                                        disabled={isResending === j.email}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-50" 
                                                        title="Reenviar invitación"
                                                    >
                                                        {isResending === j.email ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                                    </button>
                                                    <button onClick={() => handleOpenDeleteModal(j)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-7 space-y-6">
                            <section className="bg-white rounded-3xl shadow-sm p-6 lg:p-8 border border-gray-100">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-3 bg-blue-50 rounded-2xl">
                                        <Send className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h2 className="text-xl font-heading font-bold text-gray-900">Nueva Invitación</h2>
                                </div>

                                <form onSubmit={handleAsignar} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Destinatarios</label>
                                        <div className="min-h-[48px] flex flex-wrap gap-2 p-2 bg-gray-50 border border-gray-200 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all">
                                            {emailsList.map((email) => (
                                                <div 
                                                    key={email} 
                                                    className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 rounded-lg text-[11px] font-semibold shadow-sm animate-in zoom-in-50 duration-200"
                                                >
                                                    <span>{email}</span>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeEmail(email)}
                                                        className="hover:bg-blue-200 text-blue-400 hover:text-blue-800 rounded-md p-0.5 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            
                                            <input
                                                placeholder={emailsList.length === 0 ? "ejemplo@correo.com..." : ""}
                                                value={emailInput}
                                                onChange={(e) => setEmailInput(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                onBlur={addEmail}
                                                className="flex-1 min-w-[120px] bg-transparent outline-none text-sm py-1"
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-2 ml-1 italic">Presiona espacio, coma o enter para añadir el correo.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Asunto</label>
                                        <div className="relative">
                                            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                                            <input
                                                type="text"
                                                value={`Invitación a formar parte del Jurado - ${eventInfo?.eventName || 'Evento'}`}
                                                disabled
                                                className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-2xl text-gray-400 text-sm cursor-not-allowed font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Mensaje Personalizado (Opcional)</label>
                                        <textarea
                                            placeholder="Añade un saludo o instrucciones específicas para tus jurados..."
                                            value={customMessage}
                                            onChange={(e) => setCustomMessage(e.target.value)}
                                            rows={4}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-sm"
                                        />
                                        <p className="text-[11px] text-gray-400 mt-2 ml-1 flex items-center gap-1">
                                            <ShieldCheck className="w-3 h-3" />
                                            Este texto se insertará en la plantilla profesional de Votify.
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting || (emailsList.length === 0 && !emailInput.trim())}
                                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-blue-100"
                                    >
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Enviar Invitaciones</>}
                                    </button>
                                </form>
                            </section>
                        </div>

                        <div className="lg:col-span-5">
                            <div className="sticky top-10">
                                <h3 className="text-sm font-bold text-gray-500 mb-4 ml-1 flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Vista Previa del Email
                                </h3>
                                <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-8 shadow-inner overflow-hidden">
                                    <div className="bg-white rounded-xl">
                                        <img src={logoVotify} alt="Votify" className="h-10 mb-8 mx-auto" />
                                        <div className="space-y-4 text-gray-600">
                                            <p className="font-bold text-gray-900 text-lg">Hola,</p>
                                            <p className="text-sm leading-relaxed">
                                                Has sido invitado a evaluar los proyectos de <span className="font-bold text-blue-600">{eventInfo?.eventName || 'el evento'}</span> en Votify.
                                            </p>
                                            
                                            {customMessage && (
                                                <div className="bg-blue-50/50 border-l-4 border-blue-500 p-4 rounded-r-xl italic text-sm text-blue-800 my-4">
                                                    "{customMessage}"
                                                </div>
                                            )}

                                            <p className="text-sm leading-relaxed">
                                                Tu experiencia es fundamental para garantizar una evaluación justa y analítica de los participantes.
                                            </p>

                                            <div className="pt-6">
                                                <div className="w-full py-3 bg-blue-600 text-white rounded-xl text-center font-bold text-sm shadow-md">
                                                    Aceptar Invitación
                                                </div>
                                            </div>
                                            
                                            <div className="pt-8 border-t border-gray-100 text-[10px] text-gray-400 text-center">
                                                © 2026 Votify Platform. Enviado por el organizador del evento.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 bg-white rounded-2xl shadow-xl p-4 border-l-4 ${
                    toast.type === 'success' ? 'border-green-500' : 'border-red-500'
                } animate-in fade-in slide-in-from-right-8 duration-300`}>
                    {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
                    <p className="font-medium text-gray-900">{toast.message}</p>
                </div>
            )}

            {/* Modal de Confirmación para Eliminar */}
            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setJuradoToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                isLoading={isDeleting}
                title={juradoToDelete?.id < 0 ? "¿Eliminar Invitación?" : "¿Eliminar Jurado?"}
                message={`Estás a punto de eliminar a ${juradoToDelete?.nombreCompleto || juradoToDelete?.email} del panel de expertos. Esta acción no se puede deshacer.`}
            />
        </div>
    );
}
