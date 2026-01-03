
export class User {
    constructor(
        public accountType?: string,
        public username?: string,
        public email?: string,
        public lastname?: string,
        public name?: string,
        public id?: string,
        public bio?: string,
        public password?: string,
        public roles?: string,
        public avatarUrl?: string,
        public enabled?: boolean,
        public createdAt?:Date,
        public updatedAt?:Date,
        public direction?: string,
        public phone?: string,
        public website?: string,
        public cif?: string,
        public pet:any[] = [],
        // Datos de contacto
        public address?: string,
        public houseType?: string,
        public hasGarden?: boolean,
        public hasKids?: boolean,
        public hasOtherPets?: boolean,
        public hasVeterinarian?: boolean,
        public isOpen24h?: boolean,
        public acceptsVolunteers?: boolean,
        public acceptsDonations?: boolean,
        public distance?: number,

    ){}
}
