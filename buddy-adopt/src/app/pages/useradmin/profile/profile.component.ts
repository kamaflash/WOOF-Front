import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BaseServiceService } from '../../../core/services/base-service.service';
import { UserService } from '../../../core/services/users/users.service';
import { Router } from '@angular/router';
import { User } from '../../../core/models/user';
import { CommonModule } from '@angular/common';
import { UserFormFields } from '../userformfields';
import { FormGroup } from '@angular/forms';
import { environment } from '../../../../enviroments/environment';
const endpoint = environment.baseUrlSpring;
@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  activeSection: 'home' | 'edit' | 'setting' = 'home';
  user = {
    name: 'Laura',
    lastname: 'Martínez',
    email: 'laura@mail.com',
    role: 'Admin',
  };
  requests = [];
  requestsClick: any;
  dynamicForm: any;

  lastLogin = new Date();
  userLogin: User | null = null;
  formData = UserFormFields.createGroup;
  spinnerButtonm: boolean = false;
  spinner: boolean = false;
  submitDisabled: boolean = true;
  dynamicGroup: any = UserFormFields.createGroup;
  @Output() formGroupChange = new EventEmitter<FormGroup>();
  @Input() userProfile!: User;
  totalPendingPets: number = 0;
  totalPetAdopted: number = 0;
  constructor(
    public baseService: BaseServiceService,
    private userService: UserService,
    private router: Router
  ) {}
  ngOnInit(): void {
    if (this.userProfile) {
      this.userLogin = this.userProfile;
    } else {
      this.userLogin = this.userService.user || null;
      // Llamamos a la función y le pasamos los datos del usuario
      if (!this.userLogin) {
        this.router.navigate(['/login']);
      }
    }
this.getTotalAdoptions();
  }

  onFormGroupChange(formGroup: FormGroup) {
    this.dynamicForm = formGroup;
    this.onFormCreated(this.dynamicForm);
  }
  onFormCreated = (form: any) => {
    this.ifValueChange(form);
    this.setValuesDefault(form);
    this.setValidatorFormsStatic(form);
  };
  setValidatorFormsStatic(
    form: FormGroup,
    credit: boolean = false,
    mov: boolean = false
  ) {
    const controls = form.controls;
  }
  setValuesDefault(form: FormGroup) {
    const controls = form.controls;
    controls['name'].setValue(this.userLogin?.name || '');
    controls['lastname'].setValue(this.userLogin?.lastname || '');
    controls['email'].setValue(this.userLogin?.email || '');
  }
  ifValueChange(form: FormGroup) {
    const controls = form.controls;
  }

  getsData() {
    const urlId = `/${this.userLogin?.id}`;
    this.spinner = true;
    this.baseService.getItems(urlId).subscribe({
      next: (resp: any) => {
        this.userLogin = resp;
        setTimeout(() => {
          this.spinner = false;
        }, 500);
      },
      error: (err) => {
        console.error('Error al obtener mascota:', err);
      },
    });
  }

  onSubmit(formData: any) {
    this.spinnerButtonm = true;
    const urlUser = `${endpoint}users/${this.userLogin?.id}`;
    const userData = { ...this.userLogin, ...formData };
    this.baseService.putItem(urlUser, userData).subscribe({
      next: (resp: any) => {
        setTimeout(() => {
          this.userLogin = resp;
          this.userService.user = this.userLogin;
          this.spinnerButtonm = false;
        }, 500);
      },
    });
  }
  dropdownOpen: boolean = false;
  setValueForm() {
    this.dynamicGroup.a;
  }
  setPage(section: 'edit' | 'setting') {
    this.activeSection = section;
    this.dropdownOpen = false;
  }
  onSubmitForm() {
    // Lógica para manejar el envío del formulario dinámico
  }

  onResetForm() {
    // Lógica para manejar el reseteo del formulario dinámico
  }

  logout() {
    // Lógica para cerrar sesión
    this.dropdownOpen = false;
  }


  getTotalAdoptions() {

  const urlUser = `${endpoint}pet/total/${this.userLogin?.id}`;
this.baseService.getItems(urlUser).subscribe({
  next: (resp: any) => {
    this.totalPendingPets = resp.filter((p:any) => p.status === "En adopción").length;
    this.totalPetAdopted = resp.filter((p:any) => p.status === "Adoptado").length;
    this.getsData()
  },
  error: (err) => {
    console.error('Error al obtener total de adopciones:', err);
    return 0;
  },
});
  // Corrección: cerrar el paréntesis correctamente y usar filter
}
}
