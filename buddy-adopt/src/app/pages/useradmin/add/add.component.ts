import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  OnChanges,
  Output,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Constans } from '../../../core/consts';
import { environment } from '../../../../enviroments/environment';
import { BaseServiceService } from '../../../core/services/base-service.service';
import { UserService } from '../../../core/services/users/users.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsDynamicComponent } from '../../../shared/forms-dynamic/forms-dynamic.component';
import { UserFormFields } from '../userformfields';
import { PreloadComponent } from '../../../shared/preload/preload.component';
import { Utils } from '../../../core/utils';

const endpoint = environment.baseUrlSpring;
const url = `${endpoint}pet`;

@Component({
  selector: 'app-add',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FormsDynamicComponent,
    PreloadComponent,
  ],
  templateUrl: './add.component.html',
  styleUrl: './add.component.css',
})
export class AddComponent implements OnInit, OnChanges {
  // ======================================
  // 🔹 Inputs & Outputs
  // ======================================
  @Input() typeForm: string = '';
  @Input() animalInput: any;
  @Output() sendAnimalForm = new EventEmitter<any>();
  @Output() finishEmitter = new EventEmitter<any>();

  // ======================================
  // 🔹 Formularios
  // ======================================
  petForm: FormGroup;
  dynamicForm: FormGroup | any;

  // ======================================
  // 🔹 Datos principales
  // ======================================
  animal: any = {};
  animalId!: string;

  // ======================================
  // 🔹 Listas y selects
  // ======================================
  availableQuestions = Constans.QUESTIONSSOLICITUD;
  selectedQuestions: any[] = [];
  specie = Constans.ESPECIES;
  breed = Constans.DOG_BREEDS;
  sizes = Constans.SIZES;
  statuses = Constans.STATUSES;
  provincias = Constans.PROVINCIAS_ESPAÑA;

  // ======================================
  // 🔹 Imágenes
  // ======================================
  previewImages: string[] = [];
  selectedFiles: File[] = [];
  deletedImages: string[] = [];
  filesImg: File[] = [];
  imgPet: string = '';

  // ======================================
  // 🔹 Estado UI
  // ======================================
  spinner: boolean = false;
  spinnerButtonm: boolean = false;
  disabledSubmit: boolean = true;
  next: boolean = false;
  animalModify: any;
  formData = UserFormFields.createPetGroup;
animalInputLoaded:boolean = false;
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private baseService: BaseServiceService,
    private userService: UserService
  ) {
    // 👉 Inicialización del formulario principal
    this.petForm = this.fb.group({
      name: ['', Validators.required],
      specie: ['', Validators.required],
      breed: ['', Validators.required],
      age: [null, Validators.required],
      sex: ['', Validators.required],
      size: ['', Validators.required],
      color: ['', Validators.required],
      description: ['', Validators.required],
      address: [this.userService.user?.address, Validators.required],
      vaccinated: [false],
      sterilized: [false],
      images: [[]],
      questions: [[]],
    });
  }

  // ======================================
  // 🔹 Lifecycle
  // ======================================
  ngOnInit(): void {
    this.initSpeciesListener();
    this.imgPet = this.animalInput?.images[0] || '';
          this.getAnimalInput();

  }

  ngOnChanges(changes: any): void {
  // 🔹 Solo actuamos cuando cambia animalInput por PRIMERA VEZ
  if (
    !this.animalInputLoaded &&
    changes['animalInput']?.currentValue &&
    (this.typeForm === 'modify' || this.typeForm === 'update')
  ) {
    this.animalInputLoaded = true; // 👉 ya no volverá a entrar
    this.getAnimalInput();

    setTimeout(() => this.updateSubmitState(), 50);
  }

  // 🔹 Si cambia el modo del formulario
  if (changes['typeForm']?.currentValue) {
    this.typeForm = changes['typeForm'].currentValue;

    if (this.typeForm === 'new') {
      this.onSubmit();
    } else if (this.typeForm === 'update') {
      this.onSubmitUpdate();
    }
  }
}


  getAnimalInput() {
    this.animalId = this.animalInput?.id || '';
      // Preseleccionar preguntas
      this.availableQuestions.forEach((q) => {
        q.selected = this.animalInput?.questions?.includes(q.text);
      });

      // Prellenar imágenes
      this.filesImg = this.animalInput?.images
        ? [...this.animalInput?.images]
        : [];
  }
  // ======================================
  // 🔹 Listeners de formularios reactivos
  // ======================================
  initSpeciesListener() {
    this.petForm.get('specie')!.valueChanges.subscribe((val) => {
      this.petForm.get('breed')?.setValue('');

      if (val === 'Gato') this.breed = Constans.CAT_BREEDS;
      else if (val === 'Perro') this.breed = Constans.DOG_BREEDS;
      else this.breed = [{ value: 'Desconocido', label: 'Desconocido' }];

      this.petForm.get('breed')?.setValidators([Validators.required]);
      this.petForm.get('breed')?.updateValueAndValidity();
    });
    this.petForm.valueChanges.subscribe(() => {});
  }
  // ======================================
  // 🔹 Manejo de imágenes
  // ======================================
  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    this.selectedFiles.push(...files);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => this.previewImages.push(reader.result as string);
      reader.readAsDataURL(file);
    });

    this.filesImg.push(...files);
    this.updateSubmitState();
  }

  removeImage(index: number): void {
    this.deletedImages.push(this.animalInput?.images[index]);

    this.previewImages.splice(index, 1);
    this.animalInput?.images.splice(index, 1);
  }

  // ======================================
  // 🔹 Control de preguntas (checkboxes)
  // ======================================
  areAllSelected(): boolean {
    return this.availableQuestions.every((q) => q.selected);
  }

  toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.availableQuestions.forEach((q) => (q.selected = checked));
    this.updateSubmitState();
  }

  onQuestionChange() {
    this.updateSubmitState();
  }

  private updateSubmitState() {
  const selectedQuestions = this.availableQuestions.filter(q => q.selected);

  // 👉 Reglas para habilitar submit
  const hasQuestions = selectedQuestions.length > 0;
  const isValidForm = this.dynamicForm?.valid === true;
  const hasImages = this.filesImg?.length > 0;
  const isEditing = this.typeForm === 'update' || this.typeForm === 'modify';
  const isNewAnimal = !this.animalId;

  // 👉 Caso creación: requiere preguntas + form válido + imágenes
  // 👉 Caso modificación: requiere preguntas + form válido (no exige imágenes)
  const canSubmit =
    (isNewAnimal && hasQuestions && isValidForm && hasImages) ||
    (isEditing && hasQuestions && isValidForm);

  // Estado final
  this.disabledSubmit = !canSubmit;

  // Siempre actualizamos el objeto base
  const baseData = {
    ...this.dynamicForm.value,
    questions: selectedQuestions.map(q => q.text),
    disabledButton: !canSubmit,
  };

  // -----------------------------------------
  // 👉 MODO MODIFY
  // -----------------------------------------
  if (isEditing) {
    this.animalModify = { ...this.animalInput, ...baseData };

    this.sendAnimalForm.emit(this.animalModify);

    // // Si queda deshabilitado, volvemos a modo submit
    // if (!canSubmit) {
    //   this.typeForm = 'submit';
    // }

    return;
  }

  // -----------------------------------------
  // 👉 MODO CREAR (submit normal)
  // -----------------------------------------
  const animal = {
    ...this.animalModify,
    ...baseData,
    images: this.filesImg,
  };

  this.sendAnimalForm.emit(animal);
}


  // ======================================
  // 🔹 Enviar nueva mascota
  // ======================================
  async onSubmit(): Promise<void> {
    if (!this.dynamicForm.valid) return;

    this.animal = this.dynamicForm.value;
    this.animal.uid = this.userService.user?.id ?? null;
    this.animal.address = this.userService.user?.address
    const imageUrls = await Promise.all(
      this.filesImg.map((file) => this.pushImg(file))
    );
    this.animal.images = imageUrls;
    this.animal.status = 'En adopción';

    this.animal.questions = this.availableQuestions
      .filter((q) => q.selected)
      .map((q) => q.text);

    this.animal.goodWithDogs = this.animal.checkGood.goodWithDogs
    this.animal.goodWithCats = this.animal.checkGood.goodWithCats
    this.animal.goodWithKids = this.animal.checkGood.goodWithKids
    this.animal.hasDesparasite = this.animal.check.hasDesparasite
    this.animal.hasMicrochip = this.animal.check.hasMicrochip
    this.animal.sterilized = this.animal.check.sterilized
    this.animal.vaccinated = this.animal.check.vaccinated

    this.baseService.postItem(url, this.animal).subscribe({
      next: (data: any) => {
        this.animal.id = data.id;
        // this.petForm.reset();
        // this.previewImages = [];
        // this.selectedFiles = [];
        this.finishEmitter.emit(true);
      },
      error: (error) => console.error('❌ Error al agregar:', error),
    });
  }

  // ======================================
  // 🔹 Actualizar mascota existente
  // ======================================
  async onSubmitUpdate(): Promise<void> {
    if (!this.animalId) return;

    this.dynamicForm.get('images')?.setValue(this.animalInput.images);

    Object.assign(this.animalInput, this.dynamicForm.value);

    this.animalInput.questions = this.availableQuestions
      .filter((q) => q.selected)
      .map((q) => q.text);

    const imageUrls = await Promise.all(
  this.filesImg
    .filter(file => file instanceof File)   // solo Files
    .map(file => this.pushImg(file))
);
    this.animalInput.images.push(...imageUrls);
    this.animalInput.sterilized =
      this.dynamicForm.get('check')?.value.sterilized;
    this.animalInput.vaccinated =
      this.dynamicForm.get('check')?.value.vaccinated;
    this.animalInput.hasMicrochip =
      this.dynamicForm.get('check')?.value.hasMicrochip;
    this.animalInput.hasDesparasite =
      this.dynamicForm.get('check')?.value.hasDesparasite;
    this.animalInput.goodWithDogs =
      this.dynamicForm.get('checkGood')?.value.goodWithDogs;
    this.animalInput.goodWithCats =
      this.dynamicForm.get('checkGood')?.value.goodWithCats;
    this.animalInput.goodWithKids =
      this.dynamicForm.get('checkGood')?.value.goodWithKids;
    if (this.deletedImages.length > 0) {
      await Promise.all(this.deletedImages.map((file) => this.deleteImg(file)));
    }
    const urlSend = `${url}/${this.animalId}`;
    this.baseService.putItem(urlSend, this.animalInput).subscribe({
      next: (data: any) => {
        this.animalInput.id = data.id;
        this.typeForm = 'submit';
        // this.petForm.reset();
        // this.previewImages = [];
        // this.selectedFiles = [];
        this.finishEmitter.emit(true);
      },
      error: (error) => console.error('❌ Error al agregar:', error),
    });
    // this.finishEmitter.emit(this.animalInput);
  }

  // ======================================
  // 🔹 Form dinámico (forms-dynamic)
  // ======================================
  async setFormValue(event: any) {
    // this.spinnerButtonm = true;
    if (this.typeForm === 'create') {
      this.animalInput = event;

      this.petForm.setValue({
        name: this.animalInput.name,
        specie: this.animalInput.specie,
        breed: this.animalInput.breed,
        address: this.animalInput.address,
        color: this.animalInput.address,
        age: this.animalInput.age,
        sex: this.animalInput.sex,
        size: this.animalInput.size,
        sterilized: this.animalInput.check.sterilized,
        vaccinated: this.animalInput.check.vaccinated,
        hasMicrochip: this.animalInput.check.hasMicrochip,
        hasDesparasite: this.animalInput.check.hasDesparasite,
        goodWithDogs: this.animalInput.check.goodWithDogs,
        goodWithCats: this.animalInput.check.goodWithCats,
        goodWithKids: this.animalInput.check.goodWithKids,
        description: this.animalInput.description,
        images: this.animalInput.images,
        questions: this.animalInput.questions,
      });
      // 📋 Guardar preguntas seleccionadas
      const selectedQuestions = this.availableQuestions
        .filter((q) => q.selected)
        .map((q) => q.text);
      this.animalInput.questions = selectedQuestions;
      // if (this.availableQuestions.length > 0 && this.petForm.valid) {
      //   this.disabledSubmit = false;
      // } else {
      //   this.disabledSubmit = true;
      // }
      this.updateSubmitState();
      this.animalInput.uid = this.userService.user?.id ?? null;

      // ⏳ Subida de imágenes y obtención de URLs
      const imageUrls = await Promise.all(
        this.filesImg.map((file) => this.pushImg(file))
      );

      this.animalInput.images = imageUrls;
      this.animalInput.status = 'En adopción';
    }
  }
  onFormGroupChange(formGroup: FormGroup) {
    this.dynamicForm = formGroup;
    this.onFormCreated(formGroup);
  }

  onFormCreated(form: FormGroup) {
    this.ifValueChange(form);
    this.setValuesDefault(form);
    this.setValidatorFormsStatic(form);
  }

  setValidatorFormsStatic(form: FormGroup) {}

  setValuesDefault(form: FormGroup) {
    const controls = form.controls;
    if (this.animalId) {
      controls['name'].setValue(this.animalInput.name);
      controls['specie'].setValue(this.animalInput?.specie);
      controls['breed'].setValue(this.animalInput?.breed);
      controls['age'].setValue(this.animalInput?.age);
      controls['sex'].setValue(this.animalInput?.sex);
      controls['size'].setValue(this.animalInput?.size);
      controls['description'].setValue(this.animalInput?.description);
      controls['address'].setValue(this.animalInput?.address);
      controls['images']?.setValue(this.animalInput?.images);
      controls['check']?.setValue({
        vaccinated: this.animalInput?.vaccinated || false,
        sterilized: this.animalInput?.sterilized || false,
        hasMicrochip: this.animalInput?.hasMicrochip || false,
        hasDesparasite: this.animalInput?.hasDesparasite || false,
      });
      controls['checkGood']?.setValue({
        goodWithDogs: this.animalInput?.goodWithDogs || false,
        goodWithCats: this.animalInput?.goodWithCats || false,
        goodWithKids: this.animalInput?.goodWithKids || false,
      });
      controls['questions']?.setValue(this.animalInput?.questions);

      this.disabledSubmit = !(this.availableQuestions.length > 0 && form.valid);
    }
  }

  ifValueChange(form: FormGroup) {
    form.valueChanges.subscribe(() => {
      this.updateSubmitState();
    });
    form.get('specie')?.valueChanges.subscribe((value) => {
      this.updateBreedOptions(value);
    });
  }

  updateBreedOptions(specie: string) {
    const breedField = this.formData.data.find((f) => f.name === 'breed');

    if (!breedField) return;

    if (specie === 'Perro') {
      breedField.option = Constans.DOG_BREEDS;
    } else if (specie === 'Gato') {
      breedField.option = Constans.CAT_BREEDS;
    } else {
      breedField.option = [];
    }
  }
  // ======================================
  // 🔹 Backend Helpers
  // ======================================
  pushImg(file: File): Promise<string> {
    return Utils.pushImg(file,this.baseService)
  }

  deleteImg(file: string): Promise<string> {
    return Utils.deleteImg(file,this.baseService)

  }
}
