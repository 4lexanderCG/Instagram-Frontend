/**
 * Publicación — Coincide con PublicacionDTO de Spring Boot
 */
export interface IPublicacion {
    id: number;
    urlMedia: string;
    tipoMedia: string;
    leyenda: string | null;
    fechaCreacion: string | Date;
    usuario: {
        id: number;
        nombreUsuario: string;
        nombreCompleto?: string;
        fotoPerfilUrl?: string | null;
    };
    
    // Campos opcionales para compatibilidad o UI
    cantidadComentarios?: number;
    cantidadLikes?: number;
    haDadoLike?: boolean;
}

/** Helpers para leer una publicación adaptados al DTO de Spring Boot */
export const getPubId = (p: IPublicacion) => p.id;
export const getPubUrl = (p: IPublicacion) => p.urlMedia;
export const getPubTipo = (p: IPublicacion) => p.tipoMedia;
export const getPubLey = (p: IPublicacion) => p.leyenda;
export const getPubFecha = (p: IPublicacion) => p.fechaCreacion;
export const getPubUser = (p: IPublicacion) => p.usuario?.nombreUsuario || "usuario";
export const getPubFoto = (p: IPublicacion) => p.usuario?.fotoPerfilUrl || null;
export const getPubComentarios = (p: IPublicacion) => p.cantidadComentarios ?? 0;
export const getPubLikes = (p: IPublicacion) => p.cantidadLikes ?? 0;
export const getPubLiked = (p: IPublicacion) => p.haDadoLike ?? false;

export interface IUsuarioPerfil {
    id: number;
    nombreUsuario: string;
    nombreCompleto?: string;
    biografia?: string;
    sitioWebUrl?: string;
    fotoPerfilUrl?: string;
}
