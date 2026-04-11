import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { enviarDatosVoto } from '../../api/votacionApi';

export const useEnviarVoto = () => {
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);

    const enviarVoto = useCallback(async (voto) => {
        try {
            setCargando(true);
            const result = await enviarDatosVoto(voto);
            toast.success("¡Voto registrado correctamente!");
            return true;
        } catch (err) {
            console.error(err);
            setError(err.message);
            toast.error("Ocurrió un error al enviar el voto");
            return false;
        } finally {
            setCargando(false);
        }
    }, []);

    return { enviarVoto, cargando, error };
};
