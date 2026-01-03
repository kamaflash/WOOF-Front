import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormData } from '../../core/interfaces';
import { UserFormFields } from '../../pages/useradmin/userformfields';
import { GooglePlacesServiceService } from '../../core/services/google-places-service.service';

export interface FormField {
  name: string;
  label: string;
  type:
    | 'text'
    | 'email'
    | 'number'
    | 'select'
    | 'checkbox'
    | 'textarea'
    | 'radio'
    | 'date'
    | 'label';
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  options?: { label: string; value: any }[];
  value?: any;
  hidden?: boolean;
  grid?: boolean; // Para controlar tamaño
}

@Component({
  standalone: true,
  selector: 'app-forms-dynamic',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forms-dynamic.component.html',
  styleUrls: ['./forms-dynamic.component.css'],
})
export class FormsDynamicComponent {
  @Input() dynamicGroup!: FormGroup; // FormGroup recibido desde afuera
  @Input() formData: FormData = UserFormFields.createGroup; // metadata de cada control
  @Input() columns: number = 1;
  @Input() butoms: boolean = true;
  @Input() next: boolean = false;
  @Output() submitForm = new EventEmitter<any>();
  @Output() cancelForm = new EventEmitter<void>();
  private _spinner = false;
  @Input()
  set spinner(value: boolean) {
    this._spinner = value;
    // aquí puedes también activar/desactivar la UI del hijo
  }
  get spinner() {
    return this._spinner;
  }

  dropdownOpen: { [key: string]: boolean } = {};
  @Output() formGroupChange = new EventEmitter<FormGroup>();
  hide = true;
   @ViewChild('direccionInput') direccionInput!: ElementRef;

  constructor(private fb: FormBuilder, private placesService: GooglePlacesServiceService) {
    this.dynamicGroup = fb.group({});
  }

  ngOnInit(): void {
    this.formData?.data.forEach((field) => {
      if (!field.name) return;

      const validators = field.required ? [Validators.required] : [];

      if (field.type === 'checkbox-group') {
        // Creamos un grupo para cada grupo de checkboxes
        const checkboxGroup: any = {};

        field.option?.forEach((opt: any) => {
          checkboxGroup[opt.name] = new FormControl(false);
        });

        this.dynamicGroup.addControl(field.name, new FormGroup(checkboxGroup));
      } else {
        // Cualquier otro campo normal
        const value = field.value || '';
        this.dynamicGroup.addControl(
          field.name,
          this.fb.control(value, validators)
        );
      }

      this.handleConditionalVisibility(field);
    });
    // this.haveButtons();

    this.formGroupChange.emit(this.dynamicGroup);
  }
  ngOnChanges(changes: SimpleChanges): void {
    // Si el spinner ha cambiado, actualiza su valor en el componente
    if (changes['spinner']) {
      this.spinner = changes['spinner'].currentValue;
    }
  }
ngAfterViewInit(): void {
  this.placesService.initAutocomplete(
    this.direccionInput.nativeElement,
    (place) => this.onPlaceSelected(place)
  );}
  onPlaceSelected(place: any) {
  const fullAddress = place.formatted_address;

  this.dynamicGroup.get('address')?.setValue({
    text: fullAddress,
    isGoogle: true
  });

  this.dynamicGroup.get('address')?.updateValueAndValidity();
}
  private handleConditionalVisibility(field: any): void {
    if (field.showWen) {
      const controlToWatch = this.dynamicGroup.get(field.showWen.name!);

      // Subscribirse a cambios del control de referencia
      controlToWatch?.valueChanges.subscribe((value) => {
        field.hidden = this.evaluateVisibilityCondition(field, value);
      });

      // Condición inicial
      field.hidden = this.evaluateVisibilityCondition(
        field,
        controlToWatch?.value
      );
    }
  }

  private evaluateVisibilityCondition(field: any, value: any): boolean {
    if (Array.isArray(field.selectionValueShowWen)) {
      return !field.selectionValueShowWen.includes(value);
    }
    return value == null || value === '';
  }

  private haveButtons() {
    this.dynamicGroup.statusChanges.subscribe((status) => {
      this.submitForm.emit(this.dynamicGroup.value);
    });
  }
  onDateInput(event: Event, fieldName?: string): void {
    const input = event.target as HTMLInputElement;
    this.dynamicGroup.get(fieldName!)?.setValue(input.value);
  }
  // Dropdown
  toggleDropdown(name: string) {
    this.dropdownOpen[name] = !this.dropdownOpen[name];
  }

  selectOption(name: string, option: any) {
    this.dynamicGroup.get(name)?.setValue(option.value);
    this.dropdownOpen[name] = false;
  }

  onSubmit() {
    if (this.dynamicGroup.valid) {
      this.submitForm.emit(this.dynamicGroup.value);
    } else {
      this.dynamicGroup.markAllAsTouched();
    }
  }

  onCancel() {
    this.cancelForm.emit();
    this.dynamicGroup.reset();
  }

  onClear() {
    this.dynamicGroup.reset();
  }

}
