import { empty } from 'rxjs';
import { FormData, Type } from '../../core/interfaces';
import { UserConstans } from './constans';

export namespace UserFormFields {
  const titleBienestar = () => {
    return {
      type: 'label',
      label: UserConstans.titleBienestar.label,
      grid: 100,
      icon:'home'
    };
  };
  const titleInfo = () => {
    return {
      type: 'label',
      label: UserConstans.titleInfo.label,
      grid: 100,
      icon:'person'
    };
  };
  const titleBio = () => {
    return {
      type: 'label',
      label: UserConstans.titleBio.label,
      grid: 100,
      icon:'info'
    };
  };
  const username = (required = true) => ({
    type: 'text',
    label: UserConstans.username.label,
    name: UserConstans.username.name,
    required,
  });
  const name = (required = true) => ({
    type: 'text',
    label: UserConstans.name.label,
    name: UserConstans.name.name,
    required,
  });

  const lastname = (required = true) => ({
    type: 'text',
    label: UserConstans.lastname.label,
    name: UserConstans.lastname.name,
    required,
  });

  const email = (required = true) => ({
    type: 'text',
    label: UserConstans.email.label,
    name: UserConstans.email.name,
    required,
  });

  const password = (required = true) => ({
    type: 'password',
    label: UserConstans.password.label,
    name: UserConstans.password.name,
    required,
  });

  const phone = (required = true) => ({
    type: 'text',
    label: UserConstans.phone.label,
    name: UserConstans.phone.name,
    required,
  });

  const address = (required = true) => ({
    type: 'direction',
    label: UserConstans.address.label,
    name: UserConstans.address.name,
    required,
  });

  const birthdate = (required = false) => ({
    type: 'date',
    label: UserConstans.birthdate.label,
    name: UserConstans.birthdate.name,
    required,
  });

  const bio = (required = false) => ({
    type: 'textarea',
    label: UserConstans.bio.label,
    name: UserConstans.bio.name,
    grid: true,
    required,
  });

  const avatar = (required = false) => ({
    type: 'file',
    label: UserConstans.avatar.label,
    name: UserConstans.avatar.name,
    required,
  });

  const houseType = (required = false) => ({
    type: 'select',
    label: UserConstans.houseType.label,
    name: UserConstans.houseType.name,
    option: UserConstans.houseType.option,
    required,
  });

  const hasGarden = (required = false) => ({
    type: 'select',
    label: UserConstans.hasGarden.label,
    name: UserConstans.hasGarden.name,
    option: UserConstans.hasGarden.option,
    required,
  });

  const hasKids = (required = false) => ({
    type: 'select',
    label: UserConstans.hasKids.label,
    name: UserConstans.hasKids.name,
    option: UserConstans.hasKids.option,
    required,
  });

  const hasOtherPets = (required = false) => ({
    type: 'select',
    label: UserConstans.hasOtherPets.label,
    name: UserConstans.hasOtherPets.name,
    option: UserConstans.hasOtherPets.option,
    required,
  });

  const specie = (required = true) => {
    return {
      type: 'select',
      label: UserConstans.specie.label,
      name: UserConstans.specie.name,
      option: UserConstans.specie.option,
      required,
    };
  };
  const breed = (required = true) => {
    return {
      type: 'select',
      label: UserConstans.breed.label,
      name: UserConstans.breed.name,
      option: UserConstans.breed.option,
      required,
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
      required,
    };
  };
  const sex = (required = true) => {
    return {
      type: 'select',
      label: UserConstans.sex.label,
      name: UserConstans.sex.name,
      option: UserConstans.sex.option,
      required,
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
  const check = (required = true) => {
    return {
      type: 'checkbox-group',
      label: UserConstans.check.label,
      name: UserConstans.check.name,
      option: UserConstans.check.option,
      required,
    };
  };
  const checkGood = (required = true) => {
    return {
      type: 'checkbox-group',
      label: UserConstans.checkGood.label,
      name: UserConstans.checkGood.name,
      option: UserConstans.checkGood.option,
      required,
    };
  };
  const checkShelter = (required = true) => {
    return {
      type: 'checkbox-group',
      label: UserConstans.checkShelter.label,
      name: UserConstans.checkShelter.name,
      option: UserConstans.checkShelter.option,
      required,
    };
  };
  const checkShelter2 = (required = true) => {
    return {
      type: 'checkbox-group',
      label: UserConstans.checkShelter.label,
      name: UserConstans.checkShelter.name2,
      option: UserConstans.checkShelter.option2,
      required,
    };
  };
  const empty = () => {
    return {
      type: 'emty',
    };
  };
  export const createGroup: FormData = {
    type: Type.update,
    data: [name(), lastname(), email()],
  };
  export const updateUserGroup: FormData = {
    type: Type.update,
    data: [
      titleInfo(),
      username(),
      empty(),
      name(),
      lastname(),
      phone(),
      address(),
      titleBienestar(),

      avatar(false),
      houseType(),
      hasGarden(),
      hasKids(),
      hasOtherPets(),
      titleBio(),
      bio(false),
    ],
  };
  export const updateSheltterGroup: FormData = {
    type: Type.update,
    data: [
      titleInfo(),
      username(),
      empty(),
      phone(),
      address(),

      titleBio(),
      bio(false),
      checkShelter(false),
      checkShelter2(false)
    ],
  };

  export const createPetGroup: FormData = {
    type: Type.update,
    data: [
      name(),
      specie(),
      breed(),
      age(),
      size(),
      sex(),
      description(),
      check(),
      checkGood(),
    ],
  };
}
