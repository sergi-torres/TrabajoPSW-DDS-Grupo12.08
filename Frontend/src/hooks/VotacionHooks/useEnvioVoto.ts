import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { enviarDatosVoto } from '../../api/votacionApi';
import { Voto } from '../../types';

export interface UseEnviarVotoReturn {
    enviarVoto: (voto: Voto) => Promise<boolean>;
    cargando: boolean;
    error: string | null;
}

export const useEnviarVoto = (): UseEnviarVotoReturn => {
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const enviarVoto = useCallback(async (voto: Voto) => {
        try {
            setCargando(true);
            await enviarDatosVoto(voto);
            toast.success("¡Voto registrado correctamente!");
            return true;
        } catch (err) {
            console.error(err);
            const errorMessage = (err as any).message || "Ocurrió un error al enviar el voto";
            setError(errorMessage);
            toast.error(errorMessage);
            return false;
        } finally {
            setCargando(false);
        }
    }, []);

    return { enviarVoto, cargando, error };
};
