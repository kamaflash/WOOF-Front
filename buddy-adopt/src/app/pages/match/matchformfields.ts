import { FormData, Type } from '../../core/interfaces';
import { UserConstans } from '../useradmin/constans';

export namespace MatchFormFields {

  const title1 = () => {
    return {
      type: 'label',
      label: UserConstans.title1.label,
      grid: 100,
    };
  };
  const name = (required = true) => {
    return {
      type: 'text',
      label: UserConstans.name.label,
      name: UserConstans.name.name,
      required,
    };
  };

  const lastname = (required = true) => {
    return {
      type: 'text',
      label: UserConstans.lastname.label,
      name: UserConstans.lastname.name,
      required,
    };
  };
  const email = (required = true) => {
    return {
      type: 'text',
      label: UserConstans.email.label,
      name: UserConstans.email.name,
      required,
    };
  };

  const specie = (required = true) => {
    return {
      type: 'select',
      label: UserConstans.specie.label,
      name: UserConstans.specie.name,
      option: UserConstans.specie.option,
    };
  };
  const breed = (required = true) => {
    return {
      type: 'select',
      label: UserConstans.breed.label,
      name: UserConstans.breed.name,
      option: UserConstans.breed.option,
    };
  };
  const age = (required = true) => {
    return {
      type: 'number',
      label: UserConstans.age.label,
      name: UserConstans.age.name,
      required,
    };
  };
  const size = (required = true) => {
    return {
      type: 'select',
      label: UserConstans.size.label,
      name: UserConstans.size.name,
      option: UserConstans.size.option,
    };
  };
  const sex = (required = true) => {
    return {
      type: 'select',
      label: UserConstans.sex.label,
      name: UserConstans.sex.name,
      option: UserConstans.sex.option,
    };
  };
  const city = (required = true) => {
    return {
      type: 'select',
      label: UserConstans.provincias.label,
      name: UserConstans.provincias.name,
      option: UserConstans.provincias.option,
    };
  };
  const description = (required = true) => {
    return {
      type: 'textarea',
      label: UserConstans.description.label,
      name: UserConstans.description.name,
      required,
    };
  };
  const submit = (required = true) => {
    return {
      type: 'button-submit',
      label: UserConstans.submit.label,
      name: UserConstans.submit.name,
    };
  };
  const clear = (required = true) => {
    return {
      type: 'slide',
      label: UserConstans.km.label,
      name: UserConstans.km.name,
      grid:10,
      min:1,
      max:300,
    };
  };
  const hasOtherDogs = (required = true) => {
    return {
      type: 'select',
      label: UserConstans.hasOtherDogs.label,
      name: UserConstans.hasOtherDogs.name,
      option: UserConstans.hasOtherDogs.option,
    };
  };
  const hasOtherCats = (required = true) => {
    return {
      type: 'select',
      label: UserConstans.hasOtherCats.label,
      name: UserConstans.hasOtherCats.name,
      option: UserConstans.hasOtherCats.option,
    };
  };
  const experienceWithPets = (required = true) => {
    return {
      type: 'select',
      label: UserConstans.experienceWithPets.label,
      name: UserConstans.experienceWithPets.name,
      option: UserConstans.experienceWithPets.option,
    };
  };
  const activityLevel = (required = true) => {
    return {
      type: 'select',
      label: UserConstans.activityLevel.label,
      name: UserConstans.activityLevel.name,
      option: UserConstans.activityLevel.option,
    };
  };
const timeAtHome = (required = true) => {
    return {
      type: 'select',
      label: UserConstans.timeAtHome.label,
      name: UserConstans.timeAtHome.name,
      option: UserConstans.timeAtHome.option,
    };
  };
  const budgetLevel = (required = true) => {
    return {
      type: 'select',
      label: UserConstans.budgetLevel.label,
      name: UserConstans.budgetLevel.name,
      option: UserConstans.budgetLevel.option,
    };
  };

  export const createGroup: FormData = {
    type: Type.update,
    data: [name(), lastname(), email()],
  };
  export const filterPetGroup: FormData = {
    type: Type.update,
    data: [clear(), specie(), breed(), size(), sex(), city(), ],
  };
  export const preferencePetGroup: FormData = {
    type: Type.update,
    data: [hasOtherDogs(), hasOtherCats(), experienceWithPets(), activityLevel(), timeAtHome(), budgetLevel(),  ],
  };
}
