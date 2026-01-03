export class Animal {
  constructor(
    public id?: number, // ID único (MongoDB, UUID o numérico)
    public uid?: number, // ID del usuario que publicó
    public name: string = '', // Nombre del animal
    public specie: string = '', // Especie (Perro, Gato, etc.)
    public breed?: string, // Raza (opcional)
    public age?: number, // Edad en años
    public sex?: 'Macho' | 'Hembra', // Sexo del animal
    public size?: 'Pequeño' | 'Mediano' | 'Grande', // Tamaño aproximado
    public color?: string, // Color o combinación de colores
    public description?: string, // Descripción libre o historia
    public address?: string, // Descripción libre o historia
    public distance?: number, // Descripción libre o historia
    public city?: string, // Ciudad o ubicación
    public vaccinated?: boolean, // Si está vaccinated
    public sterilized?: boolean, // Si está sterilized
    public status?: 'En adopción' | 'Adoptado' | 'Reservado', // Estado actual
    public adoptionAt?: string | Date, // Fecha en que fue adoptado o publicado
    public images: string[] = [], // URLs de imágenes o base64 temporales
    public favorites?: number, // Número de veces marcado como favorito
    public createdAt?: string | Date, // Fecha de creación del registro
    public updatedAt?: string | Date, // Última actualización
    public questions: string[] = [], // Preguntas de solicitud de adopción
    public userdto: string[] = [], // Preguntas de solicitud de adopción
    public petdto: string[] = [], // Preguntas de solicitud de adopción
    public goodWithDogs: boolean = false,
    public goodWithCats: boolean = false,
    public goodWithKids: boolean = false,
    public houseTrained: boolean = false, // Está acostumbrado a vivir en interiores
    public hasMicrochip: boolean = false,
    public hasDesparasite: boolean = false
  ) {}
}
