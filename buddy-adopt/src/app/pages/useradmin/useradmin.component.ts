import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormGroup, FormsModule } from '@angular/forms';
import { BaseServiceService } from '../../core/services/base-service.service';
import { UserService } from '../../core/services/users/users.service';
import { Router } from '@angular/router';
import { User } from '../../core/models/user';
import { environment } from '../../../enviroments/environment';
import { GalleryComponent } from '../../shared/gallery/gallery.component';
import { AddComponent } from './add/add.component';
import { TableComponent, TableColumn, TableAction, FilterOption } from '../../shared/table/table.component';
import { DialogComponent } from '../../shared/dialog/dialog.component';
import { Animal } from '../../core/models/animal';
import { RequestaddComponent } from './requestadd/requestadd.component';
import { ProfileComponent } from './profile/profile.component';
import { FormsDynamicComponent } from '../../shared/forms-dynamic/forms-dynamic.component';
import { UserFormFields } from './userformfields';
import { PreloadComponent } from '../../shared/preload/preload.component';
import { NadvarUserComponent } from './components/nadvar-user/nadvar-user.component';
import { DilogConfirmacionComponent } from '../../shared/dilog-confirmacion/dilog-confirmacion.component';
import { LoginComponent } from '../auth/login/login.component';
import { Utils } from '../../core/utils';
import { ConfigurationComponent } from './configuration/configuration.component';
import { MatchListComponent } from './match-list/match-list.component';
import { Constans } from '../../core/consts';
import { FilterUserComponent } from './components/filter-user/filter-user.component';

const endpoint = environment.baseUrlSpring;
const url = `${endpoint}users`;
const urlPet = `${endpoint}pet`;
const urlRequest = `${endpoint}request`;

@Component({
  selector: 'app-useradmin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GalleryComponent,
    AddComponent,
    TableComponent,
    DialogComponent,
    RequestaddComponent,
    ProfileComponent,
    PreloadComponent,
    NadvarUserComponent,
    DilogConfirmacionComponent,
    FormsDynamicComponent,
    ConfigurationComponent,
    MatchListComponent,
    FilterUserComponent,
  ],
  templateUrl: './useradmin.component.html',
  styleUrls: ['./useradmin.component.css'],
})
export class UseradminComponent implements OnInit {
  activeSection:
    | 'mascotas'
    | 'match'
    | 'solicitudes'
    | 'perfil'
    | 'add-animal'
    | 'ajustes' = 'mascotas';

  userLogin: any | null = null;
  userUpdate: any | null = null;
  lastLogin: Date = new Date();

  showDialog = false;
  spinner = false;
  spinnerMini = false;
  spinnerButtonm = false;

  animals: any[] = [];
  requests: any[] = [];
  requestsClick: any = null;

  submitDisabled = true;
  pendingCount = 0;

  formData = UserFormFields.createPetGroup;
  dynamicForm: any;

  typeForm: string = 'create';
  mascota: any = null;
  tipeDialog: string = 'new';
  avatar: string = '';
  filesImg: File[] = [];
  page: number = 0;
  totalPage: number = 100;
  selectedFile: File | null = null;
  hasNext = true;

  // Configuración de la tabla dinámica
  requestColumns: TableColumn[] = [
    {
      key: 'petdto.name',
      label: 'Mascota',
      icon: 'pets',
      width: '200px',
      imageField: 'petdto.images',
      textField: 'petdto.name',
      imageAlt: 'Mascota'
    },
    {
      key: 'userdto.username',
      label: 'Adoptante',
      icon: 'person',
      width: '200px',
      imageField: 'userdto.avatarUrl',
      textField: 'userdto.username',
      imageAlt: 'Avatar'
    },
    {
      key: 'userdto.email',
      label: 'Email',
      icon: 'mail',
      width: '200px',
      render: (item: any) => item.userdto?.[0]?.email || item.userdto?.email || 'Sin email'
    },
    {
      key: 'createdAt',
      label: 'Fecha',
      icon: 'calendar_month',
      render: (item: any) => {
        try {
          return new Date(item.createdAt).toLocaleDateString('es-ES');
        } catch {
          return 'Fecha inválida';
        }
      }
    },
    {
      key: 'status',
      label: 'Estado',
      render: (item: any) => item.status || 'Pendiente'
    }
  ];

  requestActions: TableAction[] = [
    {
      name: 'view',
      label: 'Ver',
      icon: 'visibility',
      color: 'blue-500'
    },
    {
      name: 'file',
      label: 'Documento',
      icon: 'description',
      color: 'gray-500',
      condition: (item) => item.status !== 'Enviado' && item.status !== 'Pendiente' && item.status !== 'Evaluación'
    },
    {
      name: 'contact',
      label: 'Contacto',
      icon: 'phone',
      color: 'orange-500',
      condition: (item) => item.status === 'Evaluación'
    },
    {
      name: 'approve',
      label: 'Aprobar',
      icon: 'check_circle',
      color: 'green-500',
      condition: (item, userLogin) => {
        // Solo mostrar si es una solicitud entrante (incoming)
        // Solicitud entrante: el propietario de la mascota es el usuario actual
        const isIncoming = item.petdto?.[0]?.uid === userLogin?.id;
        return isIncoming && item.status !== 'Finalizado' && item.status !== 'Rechazada';
      }
    },
    {
      name: 'reject',
      label: 'Rechazar',
      icon: 'close',
      color: 'red-500',
      condition: (item, userLogin) => {
        // Solo mostrar si es una solicitud entrante (incoming)
        const isIncoming = item.petdto?.[0]?.uid === userLogin?.id;
        return isIncoming && item.status !== 'Finalizado' && item.status !== 'Rechazada';
      }
    },
    {
      name: 'delete',
      label: 'Eliminar',
      icon: 'delete',
      color: 'red-600',
      bulkAction: true
    }
  ];

  requestFilterOptions: FilterOption[] = [
    { label: 'Enviado', value: 'Enviado' },
    { label: 'Evaluación', value: 'Evaluación' },
    { label: 'En revisión', value: 'En revisión' },
    { label: 'Aceptada', value: 'Aceptada' },
    { label: 'Rechazada', value: 'Rechazada' },
    { label: 'Pendiente entrega', value: 'Pendiente entrega' },
    { label: 'Finalizado', value: 'Finalizado' },
  ];

  statusFilterLabel: any[] = [
    { label: 'En adopción', value: 'En adopción' },
    { label: 'Adoptado', value: 'Adoptado' },
  ];
  statusFilter: any = null;
  searchTermFilter: any = null;
  totalItems: number = 0;
  seeplus: boolean = false;
  constructor(
    public baseService: BaseServiceService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userLogin = this.userService.user;
    if (!this.userLogin) {
      return;
    }

    // Guardamos la última sesión real si viene del backend
    this.lastLogin = this.userLogin.lastLogin
      ? new Date(this.userLogin.lastLogin)
      : new Date();
    this.avatar = this.userLogin.avatarUrl || '';
    this.getsData();
    this.getRequests();
    //this.getDataMoreRequests();
  }

  logout() {
    this.userService.user = null;
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  /** DATOS DEL USUARIO Y SUS MASCOTAS */
  getsData() {
    const urlId = `${url}/fulluser/${this.userLogin?.id}`;
    this.spinner = true;

    this.baseService.getItems(urlId).subscribe({
      next: (resp: any) => {
        this.userLogin = resp;
        this.getDataMorePets(this.statusFilter);
      },
      error: (err) => {
        this.spinner = false;
        console.error('Error al obtener mascota:', err);
      },
    });
  }
  getDataMorePets(status?: string, searchTermFilter?: string) {
    if (this.spinnerMini || !this.hasNext) {
       this.showDialog = false;
        this.spinner = false;

      return;
    }

    let urlId = `${urlPet}/${this.userLogin?.id}?page=${this.page}`;
    if (status && !searchTermFilter) {
      urlId = `${urlPet}/${this.userLogin?.id}?page=${this.page}&status=${status}`;
    } else if (!status && searchTermFilter) {
      urlId = `${urlPet}/${this.userLogin?.id}?page=${this.page}&search=${searchTermFilter}`;
    } else if (status && searchTermFilter) {
      urlId = `${urlPet}/${this.userLogin?.id}?page=${this.page}&status=${status}&search=${searchTermFilter}`;
    }

    if (this.totalPage === this.page) return;
    this.spinnerMini = true;
    this.baseService.getItems(urlId).subscribe({
      next: (resp: any) => {
        if (resp) {
          resp.pets?.forEach((element: any) => {
            this.animals.push(element);
          });
        }

        this.showDialog = false;
        this.page++;
        this.totalPage = resp.totalPages;
        this.hasNext = resp.hasNext;
      },
      error: (err) => {
        this.spinner = false;
        this.spinnerMini = false;

        console.error('Error al obtener mascota:', err);
      },
      complete: () => {
        this.spinner = false;
        this.spinnerMini = false;
      },
    });
  }
  getDataMoreRequests(status?: string) {
    if (this.spinnerMini || !this.hasNext) {
      return;
    }

    let urlId = `${endpoint}request/proUid/${this.userLogin?.id}?page=${this.page}`;
    if (status) {
      urlId = `${endpoint}request/proUid/${this.userLogin?.id}?page=${this.page}&status=${status}`;
    }
    if (this.totalPage === this.page) return;
    this.spinnerMini = true;
    this.baseService.getItems(urlId).subscribe({
      next: (resp: any) => {

          resp.request?.forEach((element: any) => {
            this.requests.push(element);
          });

        this.totalItems = resp.totalItems;
        // this.updatePendingCount();
        this.showDialog = false;
        this.page++;
        this.totalPage = resp.totalPages;
        this.hasNext = this.totalPage !== this.page ? true : false;
      },
      error: (err) => {
        this.spinner = false;
        this.spinnerMini = false;

        console.error('Error al obtener mascota:', err);
      },
      complete: () => {
        this.spinner = false;
        this.spinnerMini = false;
      },
    });
  }
  /** TÍTULO DEL CONTENIDO */
  getSectionTitle() {
    switch (this.activeSection) {
      case 'mascotas':
        return 'Administrar mascotas';
      case 'solicitudes':
        return 'Solicitudes de adopción';
      case 'perfil':
        return 'Tu perfil';
      case 'ajustes':
        return 'Configuración';
      case 'add-animal':
        return 'Nueva adopción';
      default:
        return '';
    }
  }

  /** NUEVA MASCOTA */
  newAnimals() {
    this.tipeDialog = 'add-animal';
    this.showDialog = true;
    this.typeForm = 'create';
  }
  admiAnimals(id: number) {
    this.router.navigate(['/admin-animals/' + id]);
  }
  /** EVENTO DESDE app-add */
  setDisabledButton(event: any) {
    if (event) {
      this.mascota = event;
      this.submitDisabled = event.disabledButton;
    }
  }
  sendDIsableRequest(event: boolean) {
    this.submitDisabled = event;
  }
  /** SOLICITUDES */
  getRequests() {
    const urlReq = `${endpoint}request/proUid/${this.userLogin?.id}`;
    this.baseService.getItems(urlReq).subscribe({
      next: (resp: any) => {
        this.requests = resp.request;
        this.totalItems = resp.totalItems;
        this.showDialog = false;
      },
      error: (err) => console.error(err),
    });
  }

  updatePendingCount() {
    this.pendingCount = this.requests?.filter(
      (r: any) => r.status === 'Pendiente'
    ).length;
  }

  /** CONFIRMAR SOLICITUD */
  async confirmRequest(event?: any, status: string = 'Evaluación') {
    let request: any = null;
    if (event) {
      request = event[0];
    } else {
      request = this.requestsClick;
    }
    try {
      switch (request.status) {
        case 'Enviado':
        case 'Pendiente':
          request.status = 'Evaluación';
          break;
        case 'Evaluación':
          request.status = 'En revisión';
          break;
        case 'En revisión':
          request.status = 'Aceptada';
          break;
        case 'Aceptada':
          request.status = 'Pendiente entrega';
          break;
        case 'Pendiente entrega':
          request.status = 'Finalizado';
          break;
          default:
          request.status = 'Enviado';

          break;
      }

      await this.updateRequest(request);

      if (request.status === 'Finalizado') {
        const pet = request.petdto[0];
        pet.status = 'Adoptado';
      pet.uid = request.userdto[0]?.id;
      pet.address = request.userdto[0]?.address;

        await this.updatePet(pet);
      }

      this.getDataMoreRequests();
    } catch (error) {
      console.error(error);
    }
  }

  async updateUser(event?: any) {
    const urlPutUser = url + '/' + this.userLogin?.id;
    await this.onActualizar();
    this.userUpdate.avatarUrl = this.avatar;
    this.baseService
      .putItem(urlPutUser, this.userUpdate)
      .subscribe((resp: any) => {
        this.userLogin = resp;
        this.userService.user = resp;
        sessionStorage.setItem('us', JSON.stringify(resp));
        setTimeout(() => {
          this.ngOnInit();
          this.showDialog = false;
        }, 1000);
      });
  }
  async onActualizar() {
    if (this.selectedFile) {
      try {
        await this.deleteImg(this.avatar);
        const uploadedUrl = await this.pushImg(this.selectedFile);
        this.avatar = uploadedUrl; // actualizamos con la URL de Cloudinary
        console.log('Imagen subida:', uploadedUrl);

        // Aquí puedes continuar con tu lógica de guardar el perfil, formulario, etc.
      } catch (error) {
        console.error('Error subiendo la imagen:', error);
      }
    } else {
      console.log('No hay imagen seleccionada');
    }
  }
  private async updateRequest(event: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.baseService.putItem(`${urlRequest}/${event.id}`, event).subscribe({
        next: () => resolve(),
        error: (err) => reject(err),
      });
    });
  }

  private async updatePet(pet: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.baseService.putItem(`${urlPet}/${pet.id}`, pet).subscribe({
        next: () => resolve(),
        error: (err) => reject(err),
      });
    });
  }

  async cancelRequest(event: any) {
    try {
      this.requestsClick.status = 'Rechazada';
      await this.updateRequest(this.requestsClick);

      this.getDataMoreRequests();
    } catch (error) {
      console.error(error);
    }
  }

  onClick(event: Event) {
    this.showDialog = true;
    this.tipeDialog = 'solicitudes';
    this.requestsClick = event;
  }

  /** CONFIRMAR EN EL DIALOG */
  handleConfirm() {
    this.typeForm = 'new';

    setTimeout(() => {
      this.page = 0;
      this.animals = [];
      this.ngOnInit();
    }, 3000);
  }

  /** PERFIL */
  onSubmit(formData: any) {
    this.spinnerButtonm = true;

    const urlUser = `${endpoint}users/${this.userLogin?.id}`;
    const userData = { ...this.userLogin, ...formData };

    this.baseService.putItem(urlUser, userData).subscribe({
      next: (resp: any) => {
        setTimeout(() => {
          this.userLogin = resp;
          this.userService.user = resp;
          this.spinnerButtonm = false;
        }, 500);
      },
    });
  }

  /** FORMULARIO DINÁMICO */
  onFormGroupChange(formGroup: FormGroup) {
    this.dynamicForm = formGroup;
    this.onFormCreated(formGroup);

    if (!this.dynamicForm || !this.userLogin) return;

    if (this.dynamicForm.valid) {
      this.submitDisabled = false;
    } else {
      this.submitDisabled = true;
    }
    const invalidControls = Utils.getInvalidControls(this.dynamicForm);

    console.log(invalidControls);
  }
  onFormCreated(form: FormGroup) {
    this.ifValueChange(form);
    this.setValuesDefault(form);
    this.setValidatorFormsStatic(form);
  }

  setValidatorFormsStatic(form: FormGroup) {}

  setValuesDefault(form: FormGroup) {
    const controls = form.controls;
    Object.keys(this.dynamicForm.controls).forEach((key) => {
      if (this.userLogin.hasOwnProperty(key)) {
        this.dynamicForm.get(key)?.patchValue(this.userLogin[key]);
      }
      if (key === 'checkShelter') {
        this.dynamicForm.get(['checkShelter'])?.setValue({
          hasVeterinarian: this.userLogin.hasVeterinarian,
          isOpen24h: this.userLogin.isOpen24h,
        });
      }
      if (key === 'checkShelter2') {
        this.dynamicForm.get('checkShelter2')?.setValue({
          acceptsDonations: this.userLogin.acceptsDonations,
          acceptsVolunteers: this.userLogin.acceptsVolunteers,
        });
      }
    });
  }

  ifValueChange(form: FormGroup) {
    form.valueChanges.subscribe(() => {
      this.userUpdate = { ...this.userLogin, ...form.value };
      this.userUpdate.hasVeterinarian = form.value.checkShelter.hasVeterinarian;
      this.userUpdate.isOpen24h = form.value.checkShelter.isOpen24h;
      this.userUpdate.acceptsDonations =
        form.value.checkShelter2.acceptsDonations;
      this.userUpdate.acceptsVolunteers =
        form.value.checkShelter2.acceptsVolunteers;
      if (form.valid) {
        this.submitDisabled = false;
      } else {
        this.submitDisabled = true;
      }
    });
  }

  closedDialog(router: any = 'add-animal') {
    this.showDialog = false;
  }

  accion(event: any) {
    if (event === 'edit') {
      this.tipeDialog = 'perfil';
      //this.activeSection = 'perfil';
      this.formData =
        this.userLogin.accountType === 'user'
          ? UserFormFields.updateUserGroup
          : UserFormFields.updateSheltterGroup;
    } else if (event === 'logout') {
      this.tipeDialog = 'logout';
    }
    this.showDialog = true;
  }

  setFormValue(event: any) {
    this.dynamicForm.patchValue(event);
    if (this.dynamicForm.valid) {
      this.submitDisabled = false;
    } else {
      this.submitDisabled = true;
    }
  }

  previewImage: string | null = null;

  onImagesSelected(event: any) {
    const file: File = event.target.files[0];

    if (file) {
      this.selectedFile = file; // guardamos el File
      const reader = new FileReader();
      reader.onload = () => {
        this.avatar = reader.result as string; // previsualización
      };
      reader.readAsDataURL(file);
    }
  }
  submitConfirm() {
    switch (this.tipeDialog) {
      case 'add-animal':
        this.handleConfirm();
        break;
      case 'solicitudes':
        this.confirmRequest();
        break;
      case 'perfil':
        this.updateUser();
        break;
    }
  }
  // ======================================
  // 🔹 Backend Helpers
  // ======================================
  pushImg(file: File): Promise<string> {
    return Utils.pushImg(file, this.baseService);
  }

  deleteImg(file: string): Promise<string> {
    return Utils.deleteImg(file, this.baseService);
  }

  filterChange(event: any) {
    this.statusFilter = event.status;
    this.searchTermFilter = event.searchTerm;
    this.page = 0;
    this.animals = [];
    this.hasNext = true;
    this.getDataMorePets(this.statusFilter, this.searchTermFilter);
  }
  setActivationSection(activeSection: any) {
    this.activeSection = activeSection;
    this.page = 0;
    this.hasNext = true;
    switch(activeSection) {
      case 'mascotas':
        this.animals = [];
        this.getDataMorePets(this.statusFilter, this.searchTermFilter);
        break;
      case 'solicitudes':
        this.requests = [];
        this.getDataMoreRequests(this.statusFilter);
        break;
    }
  }
  filterChangeRequests(event: any) {
    this.statusFilter = event.status;
    this.page = 0;
    this.requests = [];
    this.hasNext = true;
    this.getDataMoreRequests(this.statusFilter);
  }

  actionRequest(event?: any) {
    const { action, item } = event;

    switch (action) {
      case 'view':
        this.onClick(item);
        break;
      case 'approve':
        this.confirmarSolicitud(item);
        break;
      case 'reject':
        this.rechazarSolicitud(item);
        break;
      case 'file':
        this.abrirDocumentos(item);
        break;
      case 'contact':
        this.contactarAdoptante(item);
        break;
      case 'delete':
        const itemsToDelete = Array.isArray(item) ? item : [item];
        this.eliminarSolicitudes(itemsToDelete);
        break;
    }
  }

  confirmarSolicitud(request: any) {
    this.requestsClick = request;
    this.confirmRequest();
  }

  rechazarSolicitud(request: any) {
    this.requestsClick = request;
    this.requestsClick.status = 'Rechazada';
    this.updateRequest(this.requestsClick).then(() => {
      this.getDataMoreRequests();
    });
  }

  abrirDocumentos(request: any) {
    this.tipeDialog = 'file';
    this.showDialog = true;
    this.requestsClick = request;
  }

  contactarAdoptante(request: any) {
    this.tipeDialog = 'contac';
    this.showDialog = true;
    this.requestsClick = request;
  }

  eliminarSolicitudes(solicitudes: any[]) {
    if (confirm(`¿Eliminar ${solicitudes.length} solicitud(es)?`)) {
      solicitudes.forEach((req) => {
        this.baseService.delItem(`${urlRequest}/${req.id}`).subscribe({
          next: () => {
            this.getDataMoreRequests();
          },
          error: (err: any) => console.error('Error al eliminar:', err),
        });
      });
    }
  }

  copyToClipboard(text: string): void {
    if (!text) return;

    navigator.clipboard
      .writeText(text)
      .then(() => {
        // Solo log en consola
        console.log('Copiado:', text);
      })
      .catch((err) => {
        console.error('Error al copiar:', err);
      });
  }

  sendDocuments(event?: any) {
    switch (this.tipeDialog) {
      case 'file':
        this.confirmRequest(event, 'Pendiente entrega');
        break;
      case 'contac':
        this.confirmRequest(event, 'En revisión');
        break;
    }
    this.spinner = false;
  }
}
