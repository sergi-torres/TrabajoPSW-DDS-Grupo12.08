import React, { useEffect, useState, useCallback, useContext } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { usePremio } from "../hooks/usePremio";
import CategoriasPremioCard from "../components/premios/CategoriasPremioCard";
import ContenidoEditable from "../components/premios/ContenidoEditable";
import { EventSidebar } from "../components/layout/EventSidebar";
import { ConfirmModal } from "../components/layout/ConfirmModal";
import { EventContext } from "../context/EventContext";
import { getDashboard } from "../api/orgDashboardApi";
import { Categoria, CrearPremioRequest, Premio } from "../types";



const AsignarPremios: React.FC = () => {
    const { eventoId } = useParams<{ eventoId: string }>();
    const navigate = useNavigate();
    const eventoIdNum = eventoId ? parseInt(eventoId, 10) : null;
    const { categorias, premios, obtenerCategorias, obtenerPremios, crearPremio, actualizarPremio, eliminarPremio, cargando } = usePremio();
    const { userRole, userColor, isCollapsed } = useContext(EventContext)!;
    const [eventInfo, setEventInfo] = useState<any>(null);
    const [selectedCategory, setSelectedCategory] = useState<Categoria | null>(null);
    const [selectedPremio, setSelectedPremio] = useState<Premio | null>(null);
    const [selectedPosition, setSelectedPosition] = useState<number>(1);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [prizeToDelete, setPrizeToDelete] = useState<Premio | null>(null);

    const isPublicRole = userRole === "Público";

    const fetchEventInfo = useCallback(async () => {
        if (!eventoId || eventoId === "undefined") return;
        try {
            const data: any = await getDashboard(eventoId as any);
            setEventInfo(data.liveInfo);
        } catch {
            // Non-critical: event name in header degrades gracefully
        }
    }, [eventoId]);

    useEffect(() => {
        if (eventoId) {
            fetchEventInfo();
        }
    }, [eventoId, fetchEventInfo]);

    useEffect(() => {
        if (!eventoIdNum) return;
        obtenerCategorias(eventoIdNum);
        obtenerPremios(eventoIdNum);
    }, [eventoIdNum, obtenerCategorias, obtenerPremios]);

    const handleOpenEditor = (categoria: Categoria, posicion: number, premio?: Premio | null) => {
        setSelectedCategory(categoria);
        setSelectedPosition(posicion);
        setSelectedPremio(premio ?? null);
        setIsEditorOpen(true);
    };

    const handleCloseEditor = () => {
        setIsEditorOpen(false);
        setSelectedCategory(null);
        setSelectedPremio(null);
        setSelectedPosition(1);
    };

    const handleSavePremio = async (premioDto: CrearPremioRequest, existingPremioId?: number) => {
        if (!eventoIdNum) return;

        if (existingPremioId) {
            await actualizarPremio({ id: existingPremioId, ...premioDto });
        } else {
            await crearPremio(premioDto);
        }

        await obtenerPremios(eventoIdNum);
        handleCloseEditor();
    };

    const handleDeleteClick = (premio: Premio) => {
        setPrizeToDelete(premio);
    };

    const confirmDeletePremio = async () => {
        if (!eventoIdNum || !prizeToDelete) return;
        await eliminarPremio(prizeToDelete.id);
        await obtenerPremios(eventoIdNum);
        setPrizeToDelete(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-body relative">
            <EventSidebar />

            <div className="pb-[120px] lg:pb-12">
                <header
                    className={`text-white p-6 lg:p-10 transition-all duration-300 ${isPublicRole ? 'lg:pl-10' : (isCollapsed ? 'lg:pl-28' : 'lg:pl-80')}`}
                    style={{ backgroundColor: userColor ?? undefined }}
                >
                    <div className="max-w-7xl mx-auto">
                        <div className="flex justify-between items-start mb-6">
                        <button
                            onClick={() => navigate('/eventos')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all font-heading font-semibold text-sm"
                        >
                            <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
                            <span>Volver a eventos</span>
                        </button>
                    </div>

                        <h1 className="text-3xl lg:text-4xl font-heading font-bold tracking-tight mb-2">Premios</h1>
                        <p className="text-blue-100 text-lg opacity-90">Configura y asigna premios para las categorías del evento</p>
                    </div>
                </header>

                <main className={`max-w-7xl mx-auto p-6 lg:p-10 space-y-12 transition-all duration-300 ${isPublicRole ? 'lg:pl-10' : (isCollapsed ? 'lg:pl-28' : 'lg:pl-80')}`}>
                    <section>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {cargando.categorias ? (
                                <div>Cargando categorías...</div>
                            ) : (
                                categorias
                                    .filter((c: any) => c.estado !== "Finalizada")
                                    .map((c: Categoria) => {
                                        const premiosCategoria = premios.filter((p) => p.idCategoria === c.id);
                                        return (
                                            <CategoriasPremioCard
                                                key={c.id}
                                                categoria={c}
                                                premios={premiosCategoria}
                                                onOpenEditor={handleOpenEditor}
                                                onDelete={handleDeleteClick}
                                            />
                                        );
                                    })
                            )}
                        </div>
                    </section>
                </main>
            </div>

            <ConfirmModal
                isOpen={!!prizeToDelete}
                danger
                title="Eliminar premio"
                message={
                    <>
                        ¿Estás seguro de que deseas eliminar el premio <strong>{prizeToDelete?.nombre}</strong> de la categoría{" "}
                        <strong>{categorias.find((c) => c.id === prizeToDelete?.idCategoria)?.nombre}</strong>?
                    </>
                }
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
                onConfirm={confirmDeletePremio}
                onCancel={() => setPrizeToDelete(null)}
            />


            <ContenidoEditable
                isOpen={isEditorOpen}
                categoria={selectedCategory}
                premios={selectedCategory ? premios.filter((p) => p.idCategoria === selectedCategory.id) : []}
                initialPosition={selectedPosition}
                onClose={handleCloseEditor}
                onSave={handleSavePremio}
            />
        </div>
    );
};

export default AsignarPremios;