import { useCallback, useState } from "react";
import {toast} from "sonner";
import {premiosApi} from "../api/premiosApi";
import {categoriasApi} from "../api/categoriasApi";
import {Categoria, CrearPremioRequest, Premio} from "../types/index";

interface UsePremioReturn {
    categorias: Categoria[];
    premios: Premio[];
    cargando: {
        categorias: boolean;
        premios: boolean;
        creando: boolean;
        actualizando: boolean;
        eliminando: boolean;
    };
    obtenerCategorias: (eventoId: number) => Promise<void>;
    crearPremio: (premioDto: CrearPremioRequest) => Promise<void>;
    obtenerPremios: (eventoId: number) => Promise<void>;
    actualizarPremio: (premioDto: Premio) => Promise<void>;
    eliminarPremio: (premioId: number) => Promise<void>;
}

export const usePremio = (): UsePremioReturn => {
    
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [premios, setPremios] = useState<Premio[]>([]);

    const [cargandoCategorias, setCargandoCategorias] = useState(false);
    const [cargandoPremio, setcargandoPremio] = useState(false);

    const [actualizandoPremio, setActualizandoPremio] = useState(false);
    const [creandoPremio, setCreandoPremio] = useState(false);
    const [eliminandoPremio, setEliminandoPremio] = useState(false);

    const obtenerCategorias = useCallback(async (eventoId: number) =>{
        
        if(eventoId === null || eventoId === undefined){
            toast.error("Evento no encontrado"); return;
        }

        setCargandoCategorias(true);
        try{
            const categorias = await categoriasApi.getByEvento(eventoId);
            setCategorias(categorias);
        }catch{
            toast.error("Error al obtener categorías");
        }finally{
            setCargandoCategorias(false);
        }
    },[]);

    const crearPremios = useCallback(async (premioDto : CrearPremioRequest) => {
        if(premioDto=== null ||premioDto === undefined){
            toast.dismiss();
            toast.error("No se asigno categoria al guardar"); return;
        }
        setCreandoPremio(true);
        try{
            await premiosApi.crearPremio(premioDto);
            toast.dismiss();
            toast.success("Se guardo el premio correctamente");
        }catch{
            toast.dismiss();
            toast.error("Error al guardar el premio");
        }finally{
            setCreandoPremio(false);
        }
    },[]);

    const obtenerPremios = useCallback(async (eventoId: number) => {
        if(eventoId === null || eventoId === undefined){
            toast.dismiss();
            toast.error("No se trajo ningún premio"); return;
        }
        setcargandoPremio(true);
        try{
            setPremios(await premiosApi.obtenerPremios(eventoId));
        }catch{
            toast.dismiss();
            toast.error("Error al obtener los premios");
        }finally{
            setcargandoPremio(false);
        }
    },[]);

    const actualizarPremio = useCallback(async (premioDto : Premio) => {
        if(premioDto=== null ||premioDto === undefined){
            toast.dismiss();
            toast.error("No se asigno categoria al modificar"); return;
        }
        setActualizandoPremio(true);
        try{
            await premiosApi.actualizarPremio(premioDto);
            toast.dismiss();
            toast.success("Se actualizo el premio correctamente");
        }catch{
            toast.dismiss();
            toast.error("Error al actualizar el premio");
        }finally{
            setActualizandoPremio(false);
        }
    },[]);

    const eliminarPremio = useCallback(async (premioId : number) => {
        if(premioId === null || premioId === undefined){
            toast.dismiss();
            toast.error("No se asigno premio al eliminar"); return;
        }  
        setEliminandoPremio(true);
        try{
            await premiosApi.eliminarPremio(premioId);
            toast.dismiss();
            toast.success("Se elimino el premio correctamente");
        }catch{
            toast.dismiss();
            toast.error("Error al eliminar el premio");
        }finally{
            setEliminandoPremio(false);
        }
    },[]);

    return {
        categorias,
        premios,
        cargando:{

            categorias: cargandoCategorias,
            premios: cargandoPremio,
            creando: creandoPremio,
            actualizando: actualizandoPremio,
            eliminando: eliminandoPremio,
        },
        
        obtenerCategorias,
        crearPremio: crearPremios,
        obtenerPremios,
        actualizarPremio,
        eliminarPremio
    };
};
