// hooks/useFirebaseGanadores.ts
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase';

// Estructura de datos para un ganador individual
export interface GanadorInfo {
  nombre: string;
  nombreAcompanante?: string;
  empresa: string;
  empresaAcompanante?: string;
  nivel: number;
}

// Estructura completa del documento /ganadores/actual
export interface GanadoresData {
  ganadores: { [key: string]: GanadorInfo };
  mostrar: boolean;
}

interface UseFirebaseGanadoresReturn {
  ganadoresData: GanadoresData | null;
  loading: boolean;
  error: string | null;
  ultimaActualizacion: Date | null;
  // Helper computed properties
  deberiaOcultarArbol: boolean;
  ganadoresArray: Array<{ id: string } & GanadorInfo>;
  totalGanadores: number;
}

export const useFirebaseGanadores = (): UseFirebaseGanadoresReturn => {
  const [ganadoresData, setGanadoresData] = useState<GanadoresData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);

  useEffect(() => {
    console.log('🏆 Conectando a Firebase - Ganadores');
    
    // Referencia al documento /ganadores/actual
    const ganadoresRef = doc(db, 'ganadores', 'actual');
    
    const unsubscribe = onSnapshot(
      ganadoresRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as GanadoresData;
          
          console.log('🎯 Datos de ganadores actualizados:', data);
          console.log(`📊 Mostrar ganadores: ${data.mostrar ? 'SÍ' : 'NO'}`);
          console.log(`🏅 Total de ganadores: ${Object.keys(data.ganadores || {}).length}`);
          
          setGanadoresData(data);
          setError(null);
          setUltimaActualizacion(new Date());
        } else {
          console.log('❌ Documento /ganadores/actual no existe, creando estructura por defecto');
          
          // Estructura por defecto si el documento no existe
          const dataDefault: GanadoresData = {
            ganadores: {},
            mostrar: false
          };
          
          setGanadoresData(dataDefault);
          setError(null);
        }
        
        setLoading(false);
      },
      (error) => {
        console.error('💥 Error obteniendo ganadores:', error);
        setLoading(false);
        setError(error.message);
        setGanadoresData(null);
      }
    );

    return () => {
      console.log('🔄 Desconectando listener de ganadores');
      unsubscribe();
    };
  }, []);

  // Computed properties para facilitar el uso del hook
  const deberiaOcultarArbol = ganadoresData?.mostrar === true;
  
  const ganadoresArray = ganadoresData?.ganadores 
    ? Object.entries(ganadoresData.ganadores).map(([id, info]) => ({
        id,
        ...info
      }))
    : [];
  
  const totalGanadores = ganadoresArray.length;

  return {
    ganadoresData,
    loading,
    error,
    ultimaActualizacion,
    deberiaOcultarArbol,
    ganadoresArray,
    totalGanadores
  };
};