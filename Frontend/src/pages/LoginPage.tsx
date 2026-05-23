import { MobileLayout } from "../components/auth/MobileLayout";
import { DesktopLayout } from "../components/auth/DesktopLayout";
import { useState } from "react";
import { MessageCircle, X, Mail, ExternalLink } from "lucide-react";

/**
 * LoginPage.tsx
 * 
 * Punto de entrada principal (Ruta `/login`).
 * Es un contenedor inteligente que, basándose en el ancho de la pantalla,
 * decide si montar el layout del móvil (`<MobileLayout />`) 
 * o el layout de escritorio (`<DesktopLayout />`).
 */
export default function LoginPage() {
    const [showContact, setShowContact] = useState(false);

    return (
        <div className="min-h-screen bg-app font-body text-primary">
            {/* Vista Móvil */}
            <div className="lg:hidden">
                <MobileLayout />
            </div>

            {/* Vista Escritorio */}
            <div className="hidden lg:block">
                <DesktopLayout />
            </div>

            {/* ── Contact Floating Button ── */}
            <button
                onClick={() => setShowContact(!showContact)}
                className="contact-fab"
                aria-label="Contactar soporte"
            >
                {showContact ? <X size={22} /> : <MessageCircle size={22} />}
            </button>

            {/* ── Contact Popup ── */}
            {showContact && (
                <div className="contact-popup">
                    <div className="contact-popup__header">
                        <MessageCircle size={18} />
                        <span>¿Necesitas ayuda?</span>
                    </div>
                    <p className="contact-popup__text">
                        Si tienes problemas para acceder o dudas sobre la plataforma, no dudes en contactarnos.
                    </p>
                    <div className="contact-popup__actions">
                        <a
                            href="mailto:soporte@votify.app"
                            className="contact-popup__btn contact-popup__btn--primary"
                        >
                            <Mail size={16} />
                            soporte@votify.app
                        </a>
                        <a
                            href="https://github.com/sergiitorrres/TrabajoPSW-DDS"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contact-popup__btn contact-popup__btn--secondary"
                        >
                            <ExternalLink size={16} />
                            Documentación
                        </a>
                    </div>
                    <p className="contact-popup__footer">Votify v2.x · Equipo de soporte</p>
                </div>
            )}

            <style>{`
                .contact-fab {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    z-index: 100;
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    border: none;
                    background: linear-gradient(135deg, #2563eb, #1d4ed8);
                    color: #ffffff;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 6px 24px rgba(37, 99, 235, 0.4);
                    transition: all 200ms ease;
                }

                .contact-fab:hover {
                    transform: scale(1.08);
                    box-shadow: 0 8px 32px rgba(37, 99, 235, 0.5);
                }

                .contact-popup {
                    position: fixed;
                    bottom: 92px;
                    right: 24px;
                    z-index: 100;
                    width: 320px;
                    max-width: calc(100vw - 48px);
                    background: #ffffff;
                    border-radius: 20px;
                    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04);
                    padding: 20px;
                    animation: contact-pop-in 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                @keyframes contact-pop-in {
                    from {
                        opacity: 0;
                        transform: translateY(12px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .contact-popup__header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-family: 'Poppins', sans-serif;
                    font-weight: 700;
                    font-size: 0.95rem;
                    color: #1e293b;
                    margin-bottom: 10px;
                }

                .contact-popup__header svg {
                    color: #2563eb;
                }

                .contact-popup__text {
                    font-family: 'Inter', sans-serif;
                    font-size: 0.82rem;
                    line-height: 1.55;
                    color: #64748b;
                    margin: 0 0 16px;
                }

                .contact-popup__actions {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .contact-popup__btn {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 16px;
                    border-radius: 14px;
                    font-family: 'Inter', sans-serif;
                    font-size: 0.82rem;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 150ms ease;
                }

                .contact-popup__btn--primary {
                    background: linear-gradient(135deg, #2563eb, #1d4ed8);
                    color: #ffffff;
                }

                .contact-popup__btn--primary:hover {
                    opacity: 0.9;
                    transform: translateY(-1px);
                }

                .contact-popup__btn--secondary {
                    background: #f1f5f9;
                    color: #475569;
                    border: 1px solid #e2e8f0;
                }

                .contact-popup__btn--secondary:hover {
                    background: #e2e8f0;
                }

                .contact-popup__footer {
                    font-family: 'Inter', sans-serif;
                    font-size: 0.65rem;
                    color: #94a3b8;
                    text-align: center;
                    margin: 14px 0 0;
                }

                @media (prefers-reduced-motion: reduce) {
                    .contact-popup { animation: none; }
                }
            `}</style>
        </div>
    );
}
