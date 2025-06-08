export const JUEGOS_NOMBRE = {
    1: "Futbolito",
    2: "Futbolito Soplado",
    3: "Ruelas",
    4: "Beer Pong"
} as const;

export const juegosMap = (id: number): string => {
    return JUEGOS_NOMBRE[id as keyof typeof JUEGOS_NOMBRE] ?? "Juego Desconocido";
};