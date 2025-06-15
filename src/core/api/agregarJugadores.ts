const API_BASE_URL = 'https://api-e3mal3grqq-uc.a.run.app/api';

export interface JugadorData {
  nombre: string;
  nombreAcompanante: string;
  empresa: string;
  empresaAcompanante: string;
  nivel: number;
  activo: boolean;
}

export interface JugadorRequest {
  jugadores: JugadorData[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const insertarJugadores = async (jugadores: JugadorData[]): Promise<ApiResponse<any>> => {
  try {
    const requestBody: JugadorRequest = {
      jugadores: jugadores.map(jugador => ({
        ...jugador,
        activo: jugador.activo ?? true // Asegurar que activo tenga un valor
      }))
    };

    console.log('📤 Enviando datos a la API:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${API_BASE_URL}/insertJugadores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error HTTP: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Error al insertar jugadores:', error);    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al insertar jugadores'
    };
  }
};

export const insertarJugador = async (jugador: Omit<JugadorData, 'activo'> & { activo?: boolean }): Promise<ApiResponse<any>> => {
  const jugadorCompleto: JugadorData = {
    ...jugador,
    activo: jugador.activo ?? true
  };
  
  return insertarJugadores([jugadorCompleto]);
};

// Funciones de utilidad para validación
export const validarJugador = (jugador: Partial<JugadorData>): string[] => {
  const errores: string[] = [];
  
  if (!jugador.nombre || jugador.nombre.trim().length === 0) {
    errores.push('El nombre del jugador principal es requerido');
  }
  
  if (!jugador.nombreAcompanante || jugador.nombreAcompanante.trim().length === 0) {
    errores.push('El nombre del acompañante es requerido');
  }
  
  if (!jugador.empresa || jugador.empresa.trim().length === 0) {
    errores.push('La empresa del jugador principal es requerida');
  }
  
  if (!jugador.empresaAcompanante || jugador.empresaAcompanante.trim().length === 0) {
    errores.push('La empresa del acompañante es requerida');
  }
  
  if (jugador.nivel === undefined || jugador.nivel === null) {
    errores.push('El nivel es requerido');
  } else if (jugador.nivel < 0 || jugador.nivel > 10) {
    errores.push('El nivel debe estar entre 0 y 10');
  }
  
  return errores;
};