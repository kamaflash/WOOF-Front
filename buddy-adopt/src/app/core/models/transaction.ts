export class Trasanction {
  constructor(
      public uid: string,
      public accountId: string,
      public tipe: string,
      public name: string,
      public category: string,
      public createAt: string,
      public amount: string,
      public event: string,
      public active: boolean,
      public description: string,
  ){}
}
