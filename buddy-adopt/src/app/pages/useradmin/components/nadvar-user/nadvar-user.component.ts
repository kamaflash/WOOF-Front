import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { User } from '../../../../core/models/user';
import { BaseServiceService } from '../../../../core/services/base-service.service';
import { environment } from '../../../../../enviroments/environment';

interface Tab {
  id: string;
  name: string;
  shortName?: string;
  icon: string;
  count: number;
}

const endpoint: string = environment.baseUrlSpring;
const urlPet: string = `${endpoint}pet`;
const urlRequest: string = `${endpoint}request`;

@Component({
  selector: 'app-nadvar-user',
  imports: [CommonModule],
  templateUrl: './nadvar-user.component.html',
  styleUrl: './nadvar-user.component.css'
})
export class NadvarUserComponent implements OnInit {

  @Input() userLogin: User | null = null;
  @Output() accionEmitter = new EventEmitter<any>();
  @Output() tabsEmitter = new EventEmitter<any>();

  tabs: Tab[] = [];
  tabActiva: string = 'mascotas';
  isMobileTabsMenuOpen = false;

  // ELIMINADO: La propiedad 'request' no se usa en ningún lugar
  // ELIMINADO: La propiedad 'spinner' no se usa en ningún lugar

  constructor(
    private location: Location,
    private baseService: BaseServiceService
  ) {}

  // ELIMINADO: El Router no se usa en ningún método

  ngOnInit(): void {
    this.initializeTabs();
  }

  // -----------------------------------------------------------------------
  // 🧭 CONFIGURACIÓN DE LAS PESTAÑAS
  // -----------------------------------------------------------------------
  private initializeTabs(): void {
    this.tabs = [
      {
        id: 'mascotas',
        name: 'Mascotas',
        shortName: 'Mascotas',
        icon: 'pets',
        count: 0
      },
      {
        id: 'match',
        name: 'Match',
        shortName: 'Match',
        icon: 'favorite',
        count: 0
      },
      {
        id: 'solicitudes',
        name: 'Solicitudes',
        shortName: 'Solic.',
        icon: 'description',
        count: 0
      },
      {
        id: 'perfil',
        name: 'Perfil',
        shortName: 'Perfil',
        icon: 'account_circle',
        count: 0
      },
      {
        id: 'ajustes',
        name: 'Ajustes',
        shortName: 'Ajustes',
        icon: 'settings',
        count: 0
      }
    ];
  }

  // -----------------------------------------------------------------------
  // 🔙 NAVEGACIÓN
  // -----------------------------------------------------------------------
  volver(): void {
    this.location.back();
  }

  // -----------------------------------------------------------------------
  // 📌 ACCIONES: EDITAR / LOGOUT
  // -----------------------------------------------------------------------
  openAdoptionModal(type: string): void {
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

  toggleMobileTabsMenu(): void {
    this.isMobileTabsMenuOpen = !this.isMobileTabsMenuOpen;
  }

  selectTabMobile(tabId: string): void {
    this.sendTabActiva(tabId);
    this.isMobileTabsMenuOpen = false;
  }

  // -----------------------------------------------------------------------
  // 🎯 MÉTODOS AUXILIARES PARA VISTA MÓVIL
  // -----------------------------------------------------------------------

  getActiveTabIcon(): string {
    const activeTab = this.tabs.find(tab => tab.id === this.tabActiva);
    return activeTab ? activeTab.icon : 'pets';
  }

  getActiveTabName(): string {
    const activeTab = this.tabs.find(tab => tab.id === this.tabActiva);
    return activeTab ? activeTab.name : 'Mascotas';
  }

  getActiveTabCount(): number {
    const activeTab = this.tabs.find(tab => tab.id === this.tabActiva);
    return activeTab ? activeTab.count : 0;
  }

  // -----------------------------------------------------------------------
  // 🔄 ACTUALIZAR CONTADORES DE TABS
  // -----------------------------------------------------------------------

  updateTabCount(tabId: string, count: number): void {
    const tabIndex = this.tabs.findIndex(tab => tab.id === tabId);
    if (tabIndex !== -1) {
      this.tabs[tabIndex].count = count;
    }
  }

  // ELIMINADO: El método updateAllTabCounts() no se llama en ningún lugar
  // ELIMINADO: El método loadTabCounts() no se llama en ningún lugar
}
