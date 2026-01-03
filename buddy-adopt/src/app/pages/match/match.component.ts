import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormsDynamicComponent } from '../../shared/forms-dynamic/forms-dynamic.component';
import { MatchFormFields } from './matchformfields';
import { environment } from '../../../enviroments/environment';
import { BaseServiceService } from '../../core/services/base-service.service';
import { UserService } from '../../core/services/users/users.service';
import { HttpClient } from '@angular/common/http';
import { DialogComponent } from '../../shared/dialog/dialog.component';
import { Match } from '../../core/models/match';
import { User } from '../../core/models/user';
import { Subject, takeUntil } from 'rxjs';
import { PreloadComponent } from '../../shared/preload/preload.component';
import { LocationService } from '../../core/services/location.service';
import { Utils } from '../../core/utils';
import { Animal } from '../../core/models/animal';
import { Router } from '@angular/router';

const endpoint: string = environment.baseUrlSpring;
const url: string = `${endpoint}pet`;

@Component({
  selector: 'app-match',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsDynamicComponent,
    DialogComponent,
    PreloadComponent,
  ],
  templateUrl: './match.component.html',
})
export class MatchComponent implements OnInit, OnDestroy {
  // Propiedades de formulario
  dynamicForm: FormGroup | any;
  userLogin: User | any;
  formData = MatchFormFields.filterPetGroup;
  spinnerButtonm: boolean = false;

  // Estado de la aplicación
  spinner: boolean = false;
  menuOpen = false;
  showDialog: boolean = false;
  showTutorial: boolean = false;
  showMatchAnimation: boolean = false;

  // Gestión de animales
  animals: Animal[] = [];
  filteredAnimals: Animal[] = [];

  // Navegación actual
  currentIndex: number = 0;
  currentImageIndex: number = 0;
  currentAnimal: Animal | null = null;

  // Filtros y diálogo
  dialog: any = null;

  // Swipe animation
  swipeDirection: 'left' | 'right' | null = null;
  swipeOpacity: number = 0;

  // Image loading
  imageLoading: boolean = true;

  typeDialog: string = 'filter';

  // Touch handling for swipe
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private touchEndX: number = 0;
  private touchEndY: number = 0;

  // Gestión de suscripciones
  private destroy$ = new Subject<void>();

  // Platform check
  private isBrowser: boolean;

  constructor(
    public baseService: BaseServiceService,
    private userService: UserService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private locationService: LocationService,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.userLogin = this.userService?.user;

    this.getLocal();

    if (this.isBrowser) {
      this.setupResizeListener();

      // Mostrar tutorial en primer uso
      if (!localStorage.getItem('matchTutorialShown')) {
        setTimeout(() => {
          this.showTutorial = true;
        }, 1000);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.isBrowser) {
      window.removeEventListener('resize', this.setColumns.bind(this));
    }
  }

  // Getters computados para el template
  get hasActiveFilters(): boolean {
    return (
      this.dialog &&
      Object.values(this.dialog).some(
        (val) => val !== null && val !== undefined && val !== ''
      )
    );
  }

  getMatchesCount(): number {
    // Esto debería venir de un servicio real
    // Por ahora retornamos un número fijo o calculado
    return Math.floor(Math.random() * 15) + 5;
  }

  getRemainingAnimals(): number {
    return Math.max(0, this.filteredAnimals.length - this.currentIndex - 1);
  }

  getMatchPercentage(animal: Animal | null): number {
    if (!animal) return 0;

    // Lógica para calcular porcentaje de match
    let score = 50; // Base

    // Bonus por características
    if (animal.sterilized) score += 10;
    if (animal.vaccinated) score += 10;
    if (animal.age && animal.age < 5) score += 10;

    return Math.min(100, score);
  }

  // Gestión de datos
  getLocal() {
    if (this.isBrowser) {
      this.dialog = JSON.parse(localStorage.getItem('dialog')!) || null;
    }

    this.getPets();

    if (!this.dialog) {
      setTimeout(() => {
        this.showDialog = true;
      }, 500);
    }
  }

  getPets() {
    this.spinner = true;
    let urlPoint = `${url}/notMatch/${this.userLogin.id}`;

    this.baseService
      .getItems(urlPoint)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async (resp: any) => {
          if (resp) {
            this.animals = resp.pets
          }

          setTimeout(() => {
            this.spinner = false;
            this.filteredAnimals = [...this.animals];

            if (this.dialog) {
              this.applyFilters();
            } else {
              this.updateCurrentAnimal();
            }
          }, 500);
        },
        error: (err) => {
          console.error('Error al obtener mascota:', err);
          this.spinner = false;
        },
      });
  }

  private async calculateDistance(animal: any): Promise<number | null> {
    return await this.showDistance(animal);
  }

  // Navegación de imágenes
  prevImage(): void {
    if (!this.currentAnimal?.images?.length) return;
    this.currentImageIndex =
      (this.currentImageIndex - 1 + this.currentAnimal.images.length) %
      this.currentAnimal.images.length;
  }

  nextImage(): void {
    if (!this.currentAnimal?.images?.length) return;
    this.currentImageIndex =
      (this.currentImageIndex + 1) % this.currentAnimal.images.length;
  }

  // Swipe actions
  onSwipe(direction: 'left' | 'right'): void {
    if (!this.currentAnimal) return;

    // Animar swipe
    this.swipeDirection = direction;
    this.swipeOpacity = 1;

    if (direction === 'left') {
      console.log('Rechazado:', this.currentAnimal.name);
    } else {
      console.log('Aceptado:', this.currentAnimal.name);
      this.postMatch(this.currentAnimal);
    }

    // Desvanecer animación
    setTimeout(() => {
      this.swipeOpacity = 0;
    }, 300);

    // Pasar al siguiente animal después de un delay
    setTimeout(() => {
      this.currentIndex++;
      this.updateCurrentAnimal();
      this.swipeDirection = null;
    }, 500);
  }

  skipAnimal(): void {
    this.currentIndex++;
    this.updateCurrentAnimal();
  }

  updateCurrentAnimal(): void {
    if (this.filteredAnimals.length === 0) {
      this.currentAnimal = null;
      return;
    }

    this.currentImageIndex = 0;
    this.currentAnimal = this.filteredAnimals[this.currentIndex] || null;
    this.imageLoading = false;
  }

  // Match functionality
  postMatch(animal: Animal): void {
    const matchData: Match = {
      uid: this.userLogin.id,
      aid: animal.id || 0,
      status: 'Enviado',
      createdAt: new Date().toISOString(),
      aceptAt: '',
    };

    const urlAddMatch = `${endpoint}match`;

    this.baseService
      .postItem(urlAddMatch, matchData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp: any) => {
          this.showMatchAnimation = resp.status === 'Aceptado';
        },
        error: (err) => {
          console.error('Error al enviar match:', err);
        },
      });
  }

  // Filtros
  filterAnimals(filters: any): Animal[] {
    return this.animals.filter((animal) => {
      return Object.keys(filters).every((key) => {
        const value = filters[key];
        const animalValue = animal[key as keyof Animal];

        // Si el filtro está vacío, no se aplica
        if (value === null || value === undefined || value === '') {
          return true;
        }

        // 🔥 Filtro especial: distancia menor que...
        if (key === 'distance') {
          return Number(animalValue) <= Number(value); // o < si quieres estrictamente menor
        }

        // Comparación flexible (igualdad para el resto)
        return animalValue == value;
      });
    });
  }

  applyFilters(): void {
    if (this.dialog) {
      this.filteredAnimals = this.filterAnimals(this.dialog);
    } else {
      this.filteredAnimals = [...this.animals];
    }

    this.currentIndex = 0;
    this.updateCurrentAnimal();
  }

  // Form handling
  onFormGroupChange(formGroup: FormGroup): void {
    this.dynamicForm = formGroup;
    this.onFormCreated(formGroup);
  }

  setFormValue(event: any): void {
    console.log('Form submitted with values:', event);
    this.menuOpen = false;
  }

  onFormCreated(form: FormGroup): void {
    this.ifValueChange(form);
    this.setValuesDefault(form);
    this.setValidatorFormsStatic(form);
  }

  setValidatorFormsStatic(form: FormGroup): void {
    // Validadores estáticos si es necesario
  }

  setValuesDefault(form: FormGroup): void {
    if (this.isBrowser && this.typeDialog === 'filter') {
      const local = JSON.parse(localStorage.getItem('dialog')!);
      if (local) {
        form.patchValue(local);
      }
    } else if(this.isBrowser && this.typeDialog === 'preferent') {
      form.patchValue(this.userLogin);
    }
  }

  ifValueChange(form: FormGroup): void {
    form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      // Lógica cuando cambian los valores del formulario
    });
  }

  handleConfirm(): void {
    if (this.dynamicForm?.valid && this.isBrowser && this.typeDialog === 'filter') {
      localStorage.setItem('dialog', JSON.stringify(this.dynamicForm.value));
      this.dialog = this.dynamicForm.value;
      this.showDialog = false;
      this.applyFilters();
    } else if(this.dynamicForm?.valid && this.isBrowser && this.typeDialog === 'preferent') {
        this.setPreferent()
    }
  }

  // UI Helpers
  setColumns(): void {
    if (!this.isBrowser) return;

    const width = window.innerWidth;

    if (width < 640) {
      this._formColumns = 1;
    } else if (width >= 640 && width < 1024) {
      this._formColumns = 3;
    } else {
      this._formColumns = 7;
    }
  }

  setupResizeListener(): void {
    if (this.isBrowser) {
      window.addEventListener('resize', () => this.setColumns());
    }
  }

  // Funcionalidades adicionales del HTML
  viewShelterInfo(): void {
    if (this.currentAnimal?.name) {
      console.log('Ver info del refugio:', this.currentAnimal.name);
      // Aquí iría la navegación o modal con info del refugio
    }
  }

  viewDetails(): void {
    if (this.currentAnimal) {
      console.log('Ver detalles de:', this.currentAnimal.name);
      // Aquí iría la navegación o modal con detalles completos
    }
  }

  goToChat(): void {
    console.log('Ir al chat con:', this.currentAnimal?.name);
    this.showMatchAnimation = false;
    // Navegación al chat
  }

  // Touch handlers for swipe gestures
  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    if (!this.isBrowser) return;

    this.touchStartX = event.changedTouches[0].screenX;
    this.touchStartY = event.changedTouches[0].screenY;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    if (!this.isBrowser) return;

    this.touchEndX = event.changedTouches[0].screenX;
    this.touchEndY = event.changedTouches[0].screenY;
    this.handleSwipeGesture();
  }

  private handleSwipeGesture(): void {
    const minSwipeDistance = 50;
    const deltaX = this.touchEndX - this.touchStartX;
    const deltaY = this.touchEndY - this.touchStartY;

    // Solo considerar swipes horizontales
    if (
      Math.abs(deltaX) > Math.abs(deltaY) &&
      Math.abs(deltaX) > minSwipeDistance
    ) {
      if (deltaX > 0) {
        this.onSwipe('right'); // Swipe derecha = like
      } else {
        this.onSwipe('left'); // Swipe izquierda = dislike
      }
    }
  }

  // Helper methods for the template - fixed version
  private _formColumns: number = 7;

  get formColumns(): number {
    if (!this.isBrowser) return 1;

    const width = window.innerWidth;
    if (width < 640) return 1;
    if (width < 1024) return 3;
    return 7;
  }

  set formColumns(value: number) {
    this._formColumns = value;
  }

  closeTutorial(): void {
    this.showTutorial = false;
    if (this.isBrowser) {
      localStorage.setItem('matchTutorialShown', 'true');
    }
  }

  // Método para manejar errores de imagen
  onImageError(event: any): void {
    event.target.src =
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&h=1067&fit=crop';
  }

  // Método para calcular si hay más animales
  hasMoreAnimals(): boolean {
    return this.currentIndex < this.filteredAnimals.length - 1;
  }

  async showDistance(animal: Animal) {
    return await this.locationService.locationDis(
      this.userLogin.address!,
      animal.address!
    );
  }

  setTypeDialog(type: string) {
    this.showDialog = !this.showDialog;
    this.typeDialog = type;
    if (type === 'filter') {
      this.formData = MatchFormFields.filterPetGroup;
    } else {
      this.formData = MatchFormFields.preferencePetGroup;
    }
  }
  setPreferent() {
    const user = { ...this.userLogin, ...this.dynamicForm.value}
    delete user.id;
    delete user.pet;
    delete user.product;
    delete user.movements;
    const urlPut = `${endpoint}users/${this.userLogin.id}`
    this.baseService.putItem(urlPut,user).subscribe({
        next: (resp:any) => {
          this.userLogin = resp;
          this.userService.user = resp
          sessionStorage.setItem('us', JSON.stringify(resp))
        },
        error: (err) => {

          console.error('Error en register:', err);
        },
        complete: () => {
              this.showDialog = !this.showDialog;
              this.ngOnInit()
          console.log('Petición completada');
        },
      });
  }
}
