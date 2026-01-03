import { Component, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// Services & Models
import { BaseServiceService } from '../../core/services/base-service.service';
import { UserService } from '../../core/services/users/users.service';
import { User } from '../../core/models/user';
import { Question } from '../../core/models/question';

// Components
import { RequestComponent } from './request/request.component';
import { RequesviewComponent } from './requesview/requesview.component';
import { AddComponent } from '../useradmin/add/add.component';
import { DialogComponent } from '../../shared/dialog/dialog.component';
import { DilogConfirmacionComponent } from '../../shared/dilog-confirmacion/dilog-confirmacion.component';
import { PreloadComponent } from '../../shared/preload/preload.component';
import { TableComponent } from '../../shared/table/table.component';
import { NadvarAnimalComponent } from "../animaladmin/components/nadvar-animal/nadvar-animal.component";

// Pipes & Forms
import { CustomDatePipe } from '../../core/pipes/custom-date-pipe';
import { PetFormFields } from './petformfields';

import { environment } from '../../../enviroments/environment';
import { ProfileComponent } from "../useradmin/profile/profile.component";

const endpoint = environment.baseUrlSpring;
const urlPet = `${endpoint}pet`;
const urlRequest = `${endpoint}request`;

@Component({
  selector: 'app-details-pets',
  standalone: true,
  imports: [
    CommonModule,
    RequestComponent,
    CustomDatePipe,
    RequesviewComponent,
    DialogComponent,
    PreloadComponent,
    AddComponent,
    DilogConfirmacionComponent,
    TableComponent,
    NadvarAnimalComponent,
    ProfileComponent
],
  templateUrl: './details-pets.component.html',
  styleUrl: './details-pets.component.css',
})
export class DetailsPetsComponent {

  mascotaId!: string;
  mascota: any;
  imgPet: string = '';
  requests: any[] = [];
  request: Question = {
    userId: '',
    petId: '',
    proUid: '',
    images: [],
    questions: [],
    answers: [],
  };

  // User info
  userLogin: User | null = null;
  userProperty: any;

  // Estados UI
  isLogin = false;
  spinner = false;
  menuOpen = false;
  submitDisabled = true;
  viewRequest = false;
  isSolicited = false;
  mostrarMas = false;
  mostrarRequest = false;
  showDialog = false;

  tipeDialog: string = '';
  typeForm: string = 'modify';

  // Form fields
  formData = PetFormFields.createGroup;

  // Salud items
  saludItems = [
    { label: 'Esterilizado', value: true },
    { label: 'Vacunado', value: true },
    { label: 'Desparasitado', value: true },
    { label: 'Microchip', value: true }
  ];

  // Stats
  estadisticas = [
    { value: 10, label: 'Total Likes', trend: '+12% este mes', trendColor: 'text-green-600', icon: 'favorite', bgColor: 'bg-blue-500' },
    { value: 10, label: 'Matches Activos', trend: '+5% esta semana', trendColor: 'text-green-600', icon: 'auto_awesome', bgColor: 'bg-green-500' },
    { value: 10, label: 'Solicitudes Pendientes', trend: '10 rechazadas', trendColor: 'text-red-600', icon: 'description', bgColor: 'bg-orange-500' },
    { value: 0, label: 'Visitas Totales', trend: '+23% este mes', trendColor: 'text-green-600', icon: 'visibility', bgColor: 'bg-purple-500' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private baseService: BaseServiceService
  ) {}

  // -------------------------------
  // 🔄 INIT
  // -------------------------------
  ngOnInit(): void {
    this.loadUserSession();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.mascotaId = id;
        this.getMascota(id);
        this.getRequests(id);
        this.checkSolicited();
      }
    });
  }

  private loadUserSession() {
    this.userLogin = this.userService?.user
      ? this.userService.user
      : JSON.parse(sessionStorage.getItem('us')!);
  }

  // -------------------------------
  // 🐾 GET MASCOTA
  // -------------------------------
  getMascota(id: string) {
    this.spinner = true;

    this.baseService.getItems(`${urlPet}/${id}/${this.userLogin?.id || 0}`).subscribe({
      next: (resp: any) => {
        this.mascota = resp;
        this.userProperty = resp.userdto[0];
        this.imgPet = resp.img ? resp.img[0] : resp.images[0];
        this.isLogin = this.userLogin?.id && (this.userLogin?.id === this.userProperty?.id) ? true : false;
        this.spinner = false;
      },
      error: () => this.spinner = false,
    });
  }

  // -------------------------------
  // 📩 CHECK SOLICITED
  // -------------------------------
  checkSolicited() {
    if (!this.userLogin) return;

    const url = `${urlRequest}/exits/${this.userLogin.id}/${this.mascotaId}`;
    this.spinner = true;

    this.baseService.getItems(url).subscribe({
      next: (resp: any) => {
        if (resp) {
          this.isSolicited = true;
          this.request = resp;
        }
        this.spinner = false;
      },
      error: () => this.spinner = false,
    });
  }

  // -------------------------------
  // 📨 GET REQUESTS
  // -------------------------------
  getRequests(id: string) {
    const url = `${urlRequest}/petId/${id}`;
    this.baseService.getItems(url).subscribe({
      next: (resp: any) => this.requests = resp || [],
      error: (err) => console.error("Error al obtener solicitudes:", err)
    });
  }

  // -------------------------------
  // 🎛️ UI CONTROLS
  // -------------------------------
  toggleVerMas() { this.mostrarMas = !this.mostrarMas; }
  toggleVerMasRequest() { this.mostrarRequest = !this.mostrarRequest; }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.relative')) {
      this.menuOpen = false;
    }
  }

  // -------------------------------
  // 📤 FORM EMITTER
  // -------------------------------
  formEmitterAndReturn(question: any) {
    if (question) {
      this.submitDisabled = false;
      this.request.petId = this.mascotaId;
      this.request.userId = this.userLogin?.id || '';
      this.request.proUid = this.mascota.uid;
      this.request.questions = this.mascota.questions;
      this.request.answers = question.answers;
    }
  }

  // -------------------------------
  // 📞 ACCIONES DEL PROPIETARIO
  // -------------------------------
  contactarPropietario() {
    console.log("Contactando propietario:", this.userProperty);
  }

  verPerfilPropietario(): void {
    if (this.userProperty?.id) {
      this.tipeDialog = 'perfil'
      this.showDialog = true
    }
  }

  getStatusBadgeClass(status: string): string {
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    switch (status) {
      case 'Adoptado': return `${base} bg-green-100 text-green-800`;
      case 'En adopción': return `${base} bg-blue-100 text-blue-800`;
      case 'reservado': return `${base} bg-orange-400 text-orange-800`;
      default: return `${base} bg-gray-100 text-gray-800`;
    }

  }

  // -------------------------------
  // 📋 TABLA → CLICK EN UNA SOLICITUD
  // -------------------------------
  onClick(event: any) {
    this.request = event;
    this.tipeDialog = 'request';
    this.showDialog = true;
  }

  // -------------------------------
  // 🖼️ DIALOGS
  // -------------------------------
  openAdoptionModal(type: string) {
    // if (!this.userLogin) this.router.navigate(['/login']);
    this.tipeDialog = type;
    this.showDialog = true;
  }

  getViewEmitter(event: any) {
    this.tipeDialog = 'request';
    this.request = event;
    this.showDialog = true;
  }

  dialogConfirmar() {
    this.tipeDialog = 'delete-animal';
    this.showDialog = true;
  }
setDisabledButton(event: boolean) {
  this.submitDisabled = !event;
}
  // -------------------------------
  // ✔ CONFIRM DIALOG
  // -------------------------------
  handleConfirm(type: string) {
    if (type === 'request') return this.onSubmitRequest();
    if (type === 'request-add') return this.onSubmitAddRequest();
    if (type === 'modify-animal') {
      this.typeForm = 'update';
      setTimeout(() => (this.showDialog = false), 3000);
    }
  }

  handleRechazar(type: string) {
    if (type === 'request') this.onSubmitRechazoRequest();
  }

  // -------------------------------
  // 📤 ENVIAR SOLICITUD
  // -------------------------------
  onSubmitRequest() {
    this.spinner = true;
    const url = `${urlRequest}/${this.request.id}`;

    this.baseService.putItem(url, this.request).subscribe({
      next: () => {
        this.spinner = false;
        this.showDialog = false;
        this.isSolcited();
      },
      error: (err) => console.error('Error al enviar solicitud:', err),
    });
  }

  onSubmitAddRequest() {
    this.spinner = true;
    const data = this.request;
    data.status = 'Pendiente';

    this.baseService.postItem(urlRequest, data).subscribe({
      next: () => this.afterRequestAction(),
      error: () => this.spinner = false,
    });
  }

  onSubmitRechazoRequest() {
    const url = `${urlRequest}/${this.request.id}`;
    this.spinner = true;
    this.request.status = 'Rechazada';

    this.baseService.putItem(url, this.request).subscribe({
      next: () => this.afterRequestAction(),
      error: () => this.spinner = false,
    });
  }

  isSolcited() {
    const urlId = `${urlRequest}/exits/${this.userLogin?.id}/${this.mascotaId}`;
    this.spinner = true;

    this.baseService.getItems(urlId).subscribe({
      next: (resp: any) => {
        if (resp) {
          this.isSolicited = true;
          this.request = resp;
        }
        this.spinner = false;
      },
      error: () => this.spinner = false,
    });
  }

  private afterRequestAction() {
    this.spinner = false;
    this.showDialog = false;
    this.checkSolicited();
  }

  // -------------------------------
  // 🐶 CRUD PET
  // -------------------------------
  onSubmitPet() {
    const url = `${urlPet}/${this.mascotaId}`;
    this.spinner = true;

    this.baseService.putItem(url, this.mascota).subscribe({
      next: () => setTimeout(() => {
        this.spinner = false;
        this.getMascota(this.mascotaId);
      }, 500),
      error: () => this.spinner = false,
    });
  }

  submitDelete() {
    const url = `${urlPet}/${this.mascotaId}`;
    this.spinner = true;

    this.baseService.delItem(url).subscribe({
      next: async (resp: any) => {
        for (const img of resp.images) await this.deleteImg(img);

        setTimeout(() => {
          this.spinner = false;
          this.showDialog = false;
          this.router.navigate(['/admin']);
        }, 500);
      },
      error: () => this.spinner = false,
    });
  }

  deleteImg(file: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.baseService
        .postItemImage(`${urlPet}/delimage`, { file })
        .subscribe({
          next: (data: any) => resolve(data.url),
          error: (err) => reject(err),
        });
    });
  }

  // -------------------------------
  // ✔ ACEPTAR SOLICITUD (ADOPCIÓN)
  // -------------------------------
  async confirmRequest(event: any) {
    try {
      event.status = 'Aceptada';
      await this.updateRequest(event);

      const pet = event.petdto[0];
      pet.status = 'Adoptado';
      pet.uid = event.userdto[0]?.id;
      await this.updatePet(pet);

      this.getRequests(pet.id);

    } catch (error) {
      console.error("Error en confirmRequest:", error);
    }
  }

  cancelRequest(event: any) {
    console.log("Cancelar solicitud:", event);
  }

  private updateRequest(event: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.baseService.putItem(`${urlRequest}/${event.id}`, event).subscribe({
        next: () => resolve(),
        error: (err) => reject(err)
      });
    });
  }

  private updatePet(pet: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.baseService.putItem(`${urlPet}/${pet.id}`, pet).subscribe({
        next: () => resolve(),
        error: (err) => reject(err)
      });
    });
  }
}
