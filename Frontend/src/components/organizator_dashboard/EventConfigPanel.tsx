// components/organizator_dashboard/EventConfigPanel.tsx
import { useState } from "react";
import { Sliders, Wrench, Clock, Users, MessageSquare, Lock } from "lucide-react";
import { ConfigSlider } from "../ui/ConfigSlider";
import { ConfigWrench } from "../ui/ConfigWrench";

export function EventConfigPanel({ eventConfig, onUpdateConfig }) {
  const [localConfig, setLocalConfig] = useState(eventConfig);

  const handleChange = (key: string, value: any) => {
    const updated = { ...localConfig, [key]: value };
    setLocalConfig(updated);
    onUpdateConfig(updated);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Cabecera con ícono de llave inglesa */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="p-2.5 rounded-xl bg-gray-100 text-gray-700">
          <Wrench className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-heading font-bold text-gray-900">
            Parámetros del Evento
          </h2>
          <p className="text-sm text-gray-500">Ajusta la configuración de la votación</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Sliders para valores numéricos */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Sliders className="w-4 h-4" />
            <span>Límites y Umbrales</span>
          </div>
          
          <ConfigSlider
            label="Límite de votos por usuario"
            value={localConfig.voteLimit}
            min={1}
            max={10}
            icon={<Users className="w-4 h-4" />}
            onChange={(val) => handleChange("voteLimit", val)}
          />

          <ConfigSlider
            label="Duración de categoría (minutos)"
            value={localConfig.categoryDuration || 30}
            min={5}
            max={120}
            step={5}
            unit=" min"
            icon={<Clock className="w-4 h-4" />}
            onChange={(val) => handleChange("categoryDuration", val)}
          />
        </div>

        {/* Configuración avanzada con Wrench */}
        <ConfigWrench title="Configuración Avanzada">
          <div className="space-y-4">
            {/* Toggle: Permitir comentarios */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Permitir comentarios</span>
              </div>
              <button
                onClick={() => handleChange("allowComments", !localConfig.allowComments)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${localConfig.allowComments ? "bg-purple-600" : "bg-gray-300"}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${localConfig.allowComments ? "translate-x-6" : "translate-x-1"}
                  `}
                />
              </button>
            </div>

            {/* Toggle: Votación anónima */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Votación anónima</span>
              </div>
              <button
                onClick={() => handleChange("anonymousVoting", !localConfig.anonymousVoting)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${localConfig.anonymousVoting ? "bg-purple-600" : "bg-gray-300"}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${localConfig.anonymousVoting ? "translate-x-6" : "translate-x-1"}
                  `}
                />
              </button>
            </div>
          </div>
        </ConfigWrench>

        {/* Configuración de ponderaciones */}
        <ConfigWrench title="Ponderación de Puntuaciones">
          <div className="space-y-4">
            <ConfigSlider
              label="Peso del Jurado"
              value={localConfig.juryWeight || 60}
              min={0}
              max={100}
              unit="%"
              onChange={(val) => handleChange("juryWeight", val)}
            />
            <ConfigSlider
              label="Peso del Público"
              value={localConfig.publicWeight || 40}
              min={0}
              max={100}
              unit="%"
              onChange={(val) => handleChange("publicWeight", val)}
            />
            <p className="text-xs text-gray-400 text-center">
              Total: {(localConfig.juryWeight || 60) + (localConfig.publicWeight || 40)}%
            </p>
          </div>
        </ConfigWrench>
      </div>
    </div>
  );
}