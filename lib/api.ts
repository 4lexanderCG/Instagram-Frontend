/**
 * Utilidades centralizadas para comunicación con el backend.
 * Importa estas funciones en lugar de repetir el mismo código en cada componente.
 */

/** URL base del backend. Configurar NEXT_PUBLIC_API_URL en .env.local para producción. */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Lee el token JWT almacenado en las cookies del navegador.
 * @returns El token como string, o undefined si no existe sesión.
 */
export const getToken = (): string | undefined => {
    return document.cookie
        .split("; ")
        .find((row) => row.startsWith("ig_token="))
        ?.split("=")[1];
};

/**
 * Retorna los headers de autorización listos para usar en fetch().
 */
export const authHeaders = (): HeadersInit => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Retorna los headers de autorización + Content-Type JSON.
 */
export const jsonAuthHeaders = (): HeadersInit => {
    const token = getToken();
    const headers: any = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
};
