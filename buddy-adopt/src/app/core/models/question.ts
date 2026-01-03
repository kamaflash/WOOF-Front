export class Question {
  constructor(
    public id?: string | number, // ID único (MongoDB, UUID o numérico)
    public userId: string | number = '', // ID del usuario que publicó
    public petId: string | number = '', // ID del usuario que publicó
    public proUid: string | number = '', // ID del usuario que publicó
    public status?: 'Pendiente' | 'Adoptado' | 'Reservado' | 'Rechazada', // Estado actual
    public adoptionAt?: string | Date, // Fecha en que fue adoptado o publicado
    public images: string[] = [], // URLs de imágenes o base64 temporales
    public favorites?: number, // Número de veces marcado como favorito
    public createdAt?: string | Date, // Fecha de creación del registro
    public updatedAt?: string | Date, // Última actualización
    public questions: string[] = [], // Pr
    public answers: string[] = [],
  ) {}
}
