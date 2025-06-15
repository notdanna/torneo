import type {AgregarGrupoRequest, AgregarGrupoResponse} from '../models/torneo';
  /**
   * Agrega un jugador a un grupo específico
   * @param jugadorId ID del jugador
   * @param grupoId ID del grupo
   * @param juegoId ID del juego
   * @returns Promise con la respuesta de la API
   */
  export const agregarJugadorAGrupo = async (
    jugadorId: number,
    grupoId: number,
    juegoId: number
  ): Promise<AgregarGrupoResponse> => {
    const url = 'https://api-e3mal3grqq-uc.a.run.app/api/jugador-grupo';
    
    const requestBody: AgregarGrupoRequest = {
      jugadorId,
      grupoId,
      juegoId
    };
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al agregar jugador al grupo:', error);
      throw error;
    }
  };
  
  /**
   * Función alternativa que acepta un objeto con los parámetros
   * @param params Objeto con jugadorId, grupoId y juegoId
   * @returns Promise con la respuesta de la API
   */
  export const agregarJugadorAGrupoConParams = async (
    params: AgregarGrupoRequest
  ): Promise<AgregarGrupoResponse> => {
    return agregarJugadorAGrupo(params.jugadorId, params.grupoId, params.juegoId);
  };
  
 