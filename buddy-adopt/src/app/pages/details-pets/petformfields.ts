import { FormData, Type } from '../../core/interfaces';
import { PetConstans } from './constans';

export namespace PetFormFields {
  const title1 = () => {
    return {
      type: 'label',
      label: PetConstans.title1.label,
      grid: 100,
    };
  };
  const name = (required = true) => {
    return {
      type: 'text',
      label: PetConstans.name.label,
      name: PetConstans.name.name,
      required,
    };
  };

  const lastname = (required = true) => {
    return {
      type: 'text',
      label: PetConstans.lastname.label,
      name: PetConstans.lastname.name,
      required,
    };
  };
  const email = (required = true) => {
    return {
      type: 'text',
      label: PetConstans.email.label,
      name: PetConstans.email.name,
      required,
    };
  };

  export const createGroup: FormData = {
    type: Type.update,
    data: [name(), lastname(), email()],
  };
}
