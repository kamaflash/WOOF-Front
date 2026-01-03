import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { User } from '../../../../core/models/user';
import { Question } from '../../../../core/models/question';
import { BaseServiceService } from '../../../../core/services/base-service.service';
import { environment } from '../../../../../enviroments/environment';
import { DialogComponent } from '../../../../shared/dialog/dialog.component';
import { NoUserComponent } from '../../../auth/no-user/no-user.component';

interface Tab {
  id: string;
  name: string;
  shortName?: string; // Nombre corto para móvil
  icon: string;
  count: number;
}

const endpoint: string = environment.baseUrlSpring;
const urlPet: string = `${endpoint}pet`;
const urlRequest: string = `${endpoint}request`;

@Component({
  selector: 'app-nadvar-animal',
  imports: [CommonModule, DialogComponent, NoUserComponent],
  templateUrl: './nadvar-animal.component.html',
  styleUrl: './nadvar-animal.component.css',
})
export class NadvarAnimalComponent implements OnInit, OnChanges {
  @Input() mascota: any = null;
  @Input() isSolicited: any = null;
  @Input() userLogin: User | null = null;
  @Input() requests: Request[] | null = null;

  isAdmin: boolean = false;
  @Output() accionEmitter = new EventEmitter<any>();
  @Output() tabsEmitter = new EventEmitter<any>();

  tabs: Tab[] = [];
  tabActiva: string = 'info';
  isMobileTabsMenuOpen = false;

  request: Question = {
    userId: '',
    petId: '',
    proUid: '',
    images: [],
    questions: [],
    answers: [],
  };

  spinner = false;
  showDialog = false;
  constructor(
    private router: Router,
    private baseService: BaseServiceService,
    private location: Location
  ) {}

  // -----------------------------------------------------------------------
  // 🔄 CICLOS DE VIDA
  // -----------------------------------------------------------------------
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userLogin'] || changes['mascota']) {
      this.checkAdminStatus();
    }

    if (changes['isSolicited'] || changes['userLogin'] || changes['mascota']) {
      if (!this.isAdmin) {
        this.checkSolicited();
      }
    }
  }

  ngOnInit(): void {
    this.initializeTabs();
    this.checkAdminStatus();
  }

  // -----------------------------------------------------------------------
  // 🔍 VERIFICAR ROL DE ADMIN
  // -----------------------------------------------------------------------
  private checkAdminStatus(): void {
    this.isAdmin = !!(
      this.userLogin?.id && this.mascota?.uid === this.userLogin?.id
    );
  }

  // -----------------------------------------------------------------------
  // 🧭 CONFIGURACIÓN DE LAS PESTAÑAS (con nombres cortos para móvil)
  // -----------------------------------------------------------------------
  private initializeTabs(): void {
    this.tabs = [
      {
        id: 'info',
        name: 'Información',
        shortName: 'Info',
        icon: 'info',
        count: 0,
      },
      {
        id: 'likes',
        name: 'Likes',
        shortName: 'Likes',
        icon: 'favorite',
        count: 0,
      },
      {
        id: 'matches',
        name: 'Matches',
        shortName: 'Matches',
        icon: 'auto_awesome',
        count: 0,
      },
      {
        id: 'solicitudes',
        name: 'Solicitudes',
        shortName: 'Solic.',
        icon: 'description',
        count: 0,
      },
    ];
  }

  // -----------------------------------------------------------------------
  // 🔙 NAVEGACIÓN
  // -----------------------------------------------------------------------
  volver(): void {
    this.location.back();
  }

  // -----------------------------------------------------------------------
  // 📌 ACCIONES: EDITAR / ELIMINAR / SOLICITAR
  // -----------------------------------------------------------------------
  openAdoptionModal(type: string): void {
    if (!this.userLogin) {
      this.showDialog = this.showDialog ? false : true;
      return;
    }
    this.accionEmitter.emit(type);
  }

  // -----------------------------------------------------------------------
  // 🗂️ TABS
  // -----------------------------------------------------------------------
  sendTabActiva(tabId: string): void {
    this.tabActiva = tabId;
    this.tabsEmitter.emit(tabId);
  }

  // -----------------------------------------------------------------------
  // 📱 FUNCIONALIDAD RESPONSIVE
  // -----------------------------------------------------------------------

  // Alternar menú de tabs en móvil
  toggleMobileTabsMenu(): void {
    this.isMobileTabsMenuOpen = !this.isMobileTabsMenuOpen;
  }

  // Seleccionar tab desde el menú móvil
  selectTabMobile(tabId: string): void {
    this.sendTabActiva(tabId);
    this.isMobileTabsMenuOpen = false;
  }

  // -----------------------------------------------------------------------
  // 🎯 MÉTODOS AUXILIARES PARA VISTA MÓVIL
  // -----------------------------------------------------------------------

  // Obtener icono de la tab activa
  getActiveTabIcon(): string {
    const activeTab = this.tabs.find((tab) => tab.id === this.tabActiva);
    return activeTab ? activeTab.icon : 'info';
  }

  // Obtener nombre de la tab activa
  getActiveTabName(): string {
    const activeTab = this.tabs.find((tab) => tab.id === this.tabActiva);
    return activeTab ? activeTab.name : 'Información';
  }

  // Obtener contador de la tab activa
  getActiveTabCount(): number {
    const activeTab = this.tabs.find((tab) => tab.id === this.tabActiva);
    return activeTab ? activeTab.count : 0;
  }

  // Obtener icono según estado de solicitud
  getStatusIcon(status: string): string {
    const statusIcons: { [key: string]: string } = {
      Pendiente: 'hourglass_empty',
      Adoptado: 'check_circle',
      Rechazada: 'cancel',
      Aceptada: 'thumb_up',
      'En proceso': 'sync',
    };
    return statusIcons[status] || 'info';
  }

  // -----------------------------------------------------------------------
  // 🔍 VERIFICAR SI YA HAY SOLICITUD
  // -----------------------------------------------------------------------
  checkSolicited() {
    if (!this.userLogin || !this.mascota?.id || this.isAdmin) return;

    const url = `${endpoint}request/exits/${this.userLogin.id}/${this.mascota?.id}`;
    this.spinner = true;

    this.baseService.getItems(url).subscribe({
      next: (resp: any) => {
        if (resp) {
          this.isSolicited = true;
          this.request = resp;
        } else {
          this.isSolicited = false;
        }
        this.spinner = false;
      },
      error: (err) => {
        console.error('Error verificando solicitud:', err);
        this.isSolicited = false;
        this.spinner = false;
      },
    });
  }

  // -----------------------------------------------------------------------
  // 🔄 ACTUALIZAR CONTADORES DE TABS
  // -----------------------------------------------------------------------

  // Método para actualizar el contador de una tab específica
  updateTabCount(tabId: string, count: number): void {
    const tabIndex = this.tabs.findIndex((tab) => tab.id === tabId);
    if (tabIndex !== -1) {
      this.tabs[tabIndex].count = count;
    }
  }

  // Método para actualizar todos los contadores
  updateAllTabCounts(counts: { [key: string]: number }): void {
    this.tabs.forEach((tab) => {
      if (counts[tab.id] !== undefined) {
        tab.count = counts[tab.id];
      }
    });
  }

  // -----------------------------------------------------------------------
  // 📊 CARGAR CONTADORES DESDE API
  // -----------------------------------------------------------------------

  loadTabCounts(): void {
    if (!this.mascota?.id) return;

    // Cargar contador de likes
    this.baseService
      .getItems(`${urlPet}/${this.mascota.id}/likes/count`)
      .subscribe({
        next: (count: any) => {
          this.updateTabCount('likes', count || 0);
        },
        error: (err) => {
          console.error('Error cargando likes:', err);
        },
      });

    // Cargar contador de matches
    this.baseService
      .getItems(`${urlPet}/${this.mascota.id}/matches/count`)
      .subscribe({
        next: (count: any) => {
          this.updateTabCount('matches', count || 0);
        },
        error: (err) => {
          console.error('Error cargando matches:', err);
        },
      });

    // Cargar contador de solicitudes (solo admin)
    if (this.isAdmin) {
      this.baseService
        .getItems(`${urlRequest}/pet/${this.mascota.id}/count`)
        .subscribe({
          next: (count: any) => {
            this.updateTabCount('solicitudes', count || 0);
          },
          error: (err) => {
            console.error('Error cargando solicitudes:', err);
          },
        });
    }
  }

  // -----------------------------------------------------------------------
  // 🎨 OBTENER CLASES PARA BOTÓN DE ESTADO
  // -----------------------------------------------------------------------

  getStatusButtonClasses(): any {
    if (!this.request?.status) {
      return {
        'bg-gray-100': true,
        'text-gray-800': true,
        border: true,
        'border-gray-200': true,
      };
    }

    return {
      'bg-orange-100': this.request.status === 'Pendiente',
      'text-orange-800': this.request.status === 'Pendiente',
      'border-orange-200': this.request.status === 'Pendiente',

      'bg-green-100': this.request.status === 'Adoptado',
      'text-green-800': this.request.status === 'Adoptado',
      'border-green-200': this.request.status === 'Adoptado',

      'bg-red-100': this.request.status === 'Rechazada',
      'text-red-800': this.request.status === 'Rechazada',
      'border-red-200': this.request.status === 'Rechazada',

      border: true,
    };
  }
}
