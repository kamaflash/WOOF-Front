import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../../core/services/users/users.service';
import { BaseServiceService } from '../../../core/services/base-service.service';
import { SnackbackService } from '../../../core/services/snackback.service';
import { environment } from '../../../../enviroments/environment';
import { SnackbackComponent } from '../../../shared/snackback/snackback.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../../core/models/user';
import { PreloadComponent } from '../../../shared/preload/preload.component';
import { Constans } from '../../../core/consts';
const endpoint = environment.baseUrlSpring + 'users';

@Component({
  selector: 'app-register-confirm',

  imports: [
    CommonModule,
    ReactiveFormsModule,
    SnackbackComponent,
    PreloadComponent,
  ],
  templateUrl: './register-confirm.component.html',
  styleUrl: './register-confirm.component.css',
})
export class RegisterConfirmComponent implements OnInit {
  registerForm: FormGroup;
  spinner: boolean = true;
  snackbarState = { message: '', type: 'info', show: true };
  userData!: any;
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private baseService: BaseServiceService,
    private snackbarService: SnackbackService,
    private route: ActivatedRoute
  ) {
    this.snackbarService.snackbarState$.subscribe((state) => {
      this.snackbarState = state;
    });
    this.registerForm = this.fb.group({
      password: ['user', Validators.required],
      confirm: ['', Validators.required],
    });
  }
  ngOnInit(): void {
    // Escuchar los query params y rellenar el formulario
    this.route.queryParams.subscribe((params) => {
      this.userData = { ...params };
    });
    setTimeout(() => {
      this.spinner = false;
    }, 2000);
  }

  async onSubmit() {
    if (
      this.registerForm.valid &&
      this.registerForm.value.password === this.registerForm.value.confirm
    ) {
      const url = `${endpoint}`;
      this.userData.password = this.registerForm.value.password;
      this.userData.avatarUrl = "https://res.cloudinary.com/dfnywietn/image/upload/v1764780490/qi0ajvktr8xibpxx2ugk.jpg";
      this.spinner = true;
      this.baseService.postItem(url, this.userData).subscribe({
        next: (resp: any) => {
          if (resp) {
            this.userService.user = resp;
            sessionStorage.setItem('us', JSON.stringify(resp));
            setTimeout(() => {
              this.spinner = false;
              this.router.navigate(['']);
            }, 1000);
          } else {
            this.snackbarService.show(
              'Algo ha fallado. Consulte con administrador',
              'error'
            );
          }
        },
        error: (err: any) => {
          this.spinner = false;
          this.snackbarService.show(
            'Ha ocurrido un error al procesar el registro. Inténtalo más tarde.',
            'error'
          );
          console.error('Error en register:', err);
        },
        complete: () => {
          console.log('Petición completada');
        },
      });

      // Aquí llamas a tu servicio de login
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
