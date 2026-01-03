export class Account {
  constructor(
      public uid: string,
      public IBAN: string,
      public name: string,
      public balance: string,
      public createAt: string,
      public active: boolean,
      public description: string,
  ){}
}
