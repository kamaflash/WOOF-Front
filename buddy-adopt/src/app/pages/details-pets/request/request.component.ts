import { BaseServiceService } from './../../../core/services/base-service.service';
import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { environment } from '../../../../enviroments/environment';
import { User } from '../../../core/models/user';
import { UserService } from '../../../core/services/users/users.service';
const endpoint: any = environment.baseUrlSpring;
const url: any = `${endpoint}request`;
@Component({
  selector: 'app-request',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './request.component.html',
  styleUrl: './request.component.css',
})
export class RequestComponent implements OnInit {
  @Input() animal!: any; // 🐶 Recibe el animal con sus preguntas
  form!: FormGroup;
  spinner: boolean = false;
  @Input() userLogin: User | null = null;
  @Input() answers: any[] = [];
  @Input() tipe: string = '';
  dynamicForm: any;
  spinnerButtonm: boolean = false;

  @Output() formEmitter = new EventEmitter<any>();
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private baseService: BaseServiceService
  ) {}

  ngOnInit(): void {
    this.userLogin = this.userService?.user
      ? this.userService.user
      : JSON.parse(sessionStorage.getItem('us')!);

    this.initForm();
  }
  // 🔹 Inicializa el formulario según el número de preguntas
  initForm(): void {
    this.form = this.fb.group({
      answers: this.fb.array([]), // Un array dinámico de respuestas
    });

    if (this.animal?.questions?.length) {
      this.animal.questions.forEach(() => {
        (this.form.get('answers') as FormArray).push(
          new FormControl('', Validators.required)
        );
      });
    }
    if (this.answers[0]?.answers.length) {
      this.form.get('answers')?.setValue(this.answers[0]?.answers);
      this.form.disable();
    }
    this.form.valueChanges.subscribe(() => {
      if (this.form.valid) {
        this.formEmitter.emit(this.form.value);
      }
    });
  }

  // 🧩 Getter para acceder al FormArray fácilmente desde el template
  get answersArray(): FormArray {
    return this.form.get('answers') as FormArray  ?? null;
  }

  onFormGroupChange(formGroup: FormGroup) {
    this.dynamicForm = formGroup;
    this.onFormCreated(this.dynamicForm);
  }
  onFormCreated = (form: any) => {
    this.setValuesDefault(form);
  };

  setValuesDefault(form: FormGroup) {
    const controls = form.controls;
    controls['name'].setValue(this.userLogin?.name || '');
    controls['lastname'].setValue(this.userLogin?.lastname || '');
    controls['email'].setValue(this.userLogin?.email || '');
  }
}
