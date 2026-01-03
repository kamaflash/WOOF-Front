import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../core/models/user';
import { SlideComponent } from './components/slide/slide.component';
import { FilterUserComponent } from '../../pages/useradmin/components/filter-user/filter-user.component';

/**
 * Interfaz para configurar las columnas de la tabla
 */
export interface TableColumn {
  key: string;
  label: string;
  icon?: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  render?: (item: any) => string;
  customTemplate?: TemplateRef<{ $implicit: any }>;
  // Propiedades para mostrar imagen + texto
  imageField?: string; // Ruta al campo de imagen (ej: 'petdto.0.images.0')
  textField?: string; // Ruta al campo de texto (ej: 'petdto.0.name')
  imageAlt?: string; // Texto alternativo para imagen
}

/**
 * Interfaz para configurar los filtros disponibles
 */
export interface FilterOption {
  label: string;
  value: any;
}

/**
 * Interfaz para configurar las acciones de la tabla
 */
export interface TableAction {
  name: string;
  label?: string;
  icon: string;
  color?: string;
  condition?: (item: any, userLogin?: any) => boolean;
  bulkAction?: boolean;
}

@Component({
  selector: 'app-table',
  imports: [CommonModule, FormsModule, SlideComponent, FilterUserComponent],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class TableComponent implements OnChanges {
  // ========== INPUTS ==========
  @Input() items: any[] = [];
  @Input() userLogin: User | null = null;
  @Input() totalItems: number | null = null;
  @Input() seeplus: boolean | null = null;
  @Input() searchSee: boolean | null = null;
  @Input() seeFilter: boolean | null = null;
  @Input() spinner: boolean | null = null;
  @Input() defaultFilterStatus: string = '';
  // ========== CONFIGURACIÓN DINÁMICA ==========
  @Input() columns: TableColumn[] = [];
  @Input() filterOptions: FilterOption[] = [];
  @Input() actions: TableAction[] = [];
  @Input() enableSearch: boolean = true;
  @Input() enableFilter: boolean = true;
  @Input() enableCheckbox: boolean = true;
  @Input() enableViewToggle: boolean = true;
  @Input() enablePagination: boolean = false;
  @Input() pageSize: number = 10;
  @Input() searchFields: string[] = [];
  @Input() filterField: string = '';
  @Input() userIdField: string = 'userId';
  @Input() statusField: string = 'status';
  @Input() selectionDisabledStatuses: string[] = ['Finalizado', 'Rechazada'];
  @Input() disabledActionStatuses: string[] = [];
  @Input() viewMode: string = 'table';

  // ========== OUTPUTS ==========
  @Output() onConfirmEmmiter = new EventEmitter<any>();
  @Output() onCancelEmmiter = new EventEmitter<any>();
  @Output() onActionEmmiter = new EventEmitter<any>();
  @Output() onClickEmmiter = new EventEmitter<any>();
  @Output() scrollEmitter = new EventEmitter<any>();
  @Output() filterChangeEmitter = new EventEmitter<any>();
  @Output() actionTriggered = new EventEmitter<{ action: string; item: any }>();

  // ========== PROPIEDADES INTERNAS ==========
  searchTerm = '';
  filterStatus = '';
  selectedItems: any[] = [];
  scrollValidate: boolean = false;

  // Valores por defecto para filtros
  statusFilterLabel: any[] = [
    { label: 'Enviado', value: 'Enviado' },
    { label: 'Evaluación', value: 'Evaluación' },
    { label: 'En revisión', value: 'En revisión' },
    { label: 'Aceptada', value: 'Aceptada' },
    { label: 'Rechazada', value: 'Rechazada' },
    { label: 'Pendiente entrega', value: 'Pendiente entrega' },
    { label: 'Finalizada', value: 'Finalizada' },
  ];

  // ========== CICLO DE VIDA ==========
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['defaultFilterStatus']) {
      this.filterStatus = changes['defaultFilterStatus'].currentValue || '';

      this.filterChangeEmitter.emit({
        status: this.filterStatus,
        searchTerm: this.searchTerm,
      });
    }

    if (changes['items']) {
      this.selectedItems = [];
      this.items = changes['items'].currentValue || [];
      this.scrollValidate = false;
    }

    if (changes['filterOptions'] && this.filterOptions.length > 0) {
      this.statusFilterLabel = this.filterOptions;
    }

    if (changes['spinner']) {
      this.spinner = changes['spinner'].currentValue;
    }
  }

  // ========== MÉTODOS DE FILTRADO Y BÚSQUEDA ==========
  get filteredItems() {
    return this.items.filter((item) => {
      const matchesSearch = this.matchesSearch(item);
      const matchesStatus = this.matchesFilter(item);
      return matchesSearch && matchesStatus;
    });
  }

  private matchesSearch(item: any): boolean {
    if (!this.enableSearch || !this.searchTerm) return true;

    if (this.searchFields.length > 0) {
      return this.searchFields.some((field) =>
        this.getNestedValue(item, field)
          ?.toString()
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase())
      );
    }
    return true;
  }

  private matchesFilter(item: any): boolean {
    if (!this.enableFilter || !this.filterStatus || !this.filterField)
      return true;
    return this.getNestedValue(item, this.filterField) === this.filterStatus;
  }

  /**
   * Obtiene un valor anidado de un objeto usando punto o notación de array
   * Acepta path opcional para evitar errores al usar expresiones como columns[0]?.key
   */
  getNestedValue(obj: any, path?: string): any {
    if (!path) return '';
    const parts = path.split('.');
    let current = obj;

    for (let i = 0; i < parts.length; i++) {
      const prop = parts[i];

      // Evaluar si es notación de array (e.g., petdto.0.name)
      if (!isNaN(Number(prop))) {
        // Es un índice de array
        current = current?.[Number(prop)];
      } else {
        // Es una propiedad normal
        current = current?.[prop];

        // Si es un array y no es el último elemento, tomar el primero
        if (current instanceof Array && i < parts.length - 1) {
          current = current[0];
        }
      }

      if (current === undefined || current === null) {
        return '';
      }
    }

    return current;
  }

  // ========== MÉTODOS DE SELECCIÓN ==========
  onSelect(item: any) {
    item.selected
      ? this.selectedItems.push(item)
      : (this.selectedItems = this.selectedItems.filter(
          (r) => r.id !== item.id
        ));
  }

  areAllSelected(): boolean {
    return (
      this.filteredItems.length > 0 &&
      this.filteredItems.every((item) =>
        this.isItemSelectable(item) ? item.selected : true
      )
    );
  }

  toggleSelectAll(event: any): void {
    const checked = event.target.checked;
    this.selectedItems = [];

    this.filteredItems.forEach((item) => {
      if (!this.isItemSelectable(item)) {
        item.selected = false;
      } else {
        item.selected = checked;
        if (checked) {
          this.selectedItems.push(item);
        }
      }
    });
  }

  toggleCardSelection(item: any): void {
    if (this.isItemSelectable(item)) {
      item.selected = !item.selected;
      this.onSelect(item);
    }
  }

  isItemSelectable(item: any): boolean {
    if (!this.enableCheckbox) return false;
    const status = this.getNestedValue(item, this.statusField);
    return !this.selectionDisabledStatuses.includes(status);
  }

  // ========== MÉTODOS DE ACCIONES ==========
  accept(items: any[]) {
    if (this.selectedItems.length > 0) {
      this.onConfirmEmmiter.emit(this.selectedItems);
    } else {
      this.onConfirmEmmiter.emit(items);
    }
  }

  reject(items: any[]) {
    if (this.selectedItems.length > 0) {
      this.onCancelEmmiter.emit(this.selectedItems);
    } else {
      this.onCancelEmmiter.emit(items);
    }
  }

  action(item: any, actionName: string): void {
    const resp = { item, action: actionName };
    this.onActionEmmiter.emit(resp);
    this.actionTriggered.emit({ action: actionName, item });
  }

  onClick(item: any): void {
    this.onClickEmmiter.emit(item);
  }

  triggerAction(actionName: string, item: any): void {
    const action = this.actions.find((a) => a.name === actionName);
    if (action) {
      this.action(item, actionName);
    }
  }

  // ========== MÉTODOS AUXILIARES ==========
  getBulkActions(): TableAction[] {
    return this.actions.filter((a) => a.bulkAction);
  }

  getNonBulkActions(): TableAction[] {
    return this.actions.filter((a) => !a.bulkAction);
  }

  filterChange(event: any): void {
    this.filterStatus = event.status || '';
    this.searchTerm = event.searchTerm || '';
    this.filterChangeEmitter.emit({
      status: this.filterStatus,
      searchTerm: this.searchTerm,
    });
  }

  getStatusColor(item: any): string {
    const status = this.getNestedValue(item, this.statusField);
    const colorMap: { [key: string]: string } = {
      Enviado: 'text-orange-400 border-orange-400',
      Pendiente: 'text-orange-400 border-orange-400',
      Aceptada:
        'bg-gradient-to-r from-green-50 to-emerald-50 text-emerald-700 border-emerald-200',
      Rechazada:
        'bg-gradient-to-r from-red-50 to-rose-50 text-rose-700 border-rose-200',
      'En revisión':
        'bg-gradient-to-r from-purple-500 to-violet-50 text-purple-700 border-purple-200',
      Evaluación:
        'bg-gradient-to-r from-yellow-50 to-gray-50 text-yellow-700 border-yellow-200',
      'Pendiente entrega':
        'bg-gradient-to-r from-blue-50 to-gray-50 text-blue-700 border-blue-200',
      Finalizado:
        'bg-gradient-to-r from-gray-50 to-gray-50 text-gray-700 border-gray-200',
    };
    return colorMap[status] || 'text-gray-400 border-gray-400';
  }

  getStatusDotColor(item: any): string {
    const status = this.getNestedValue(item, this.statusField);
    const dotMap: { [key: string]: string } = {
      Enviado: 'bg-orange-500',
      Pendiente: 'bg-orange-500',
      Aceptada: 'bg-green-500',
      Rechazada: 'bg-red-500',
      'En revisión': 'bg-purple-500',
      Evaluación: 'bg-yellow-500',
      'Pendiente entrega': 'bg-blue-500',
      Finalizado: 'bg-gray-500',
    };
    return dotMap[status] || 'bg-gray-400';
  }

  isActionVisible(action: TableAction, item: any): boolean {
    if (action.condition) {
      // Pasar tanto item como userLogin al callback de condition
      return action.condition(item, this.userLogin);
    }
    return true;
  }

  isActionDisabled(action: TableAction, item: any): boolean {
    const status = this.getNestedValue(item, this.statusField);
    return this.disabledActionStatuses.includes(status);
  }

  /**
   * Construye la URL de imagen con manejo de rutas relativas/absolutas
   */
  getImageUrl(imageUrl?: string | any[]): string {
    // Acepta strings con múltiples URLs separadas por comas, pipes o punto y coma.
    // También acepta arrays y toma el primer elemento
    if (!imageUrl || imageUrl === '') {
      return 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22%3E%3Crect width=%2240%22 height=%2240%22 fill=%22%23f3e8ff%22/%3E%3Ctext x=%2220%22 y=%2220%22 font-size=%2224%22 text-anchor=%22middle%22 dy=%22.3em%22%3E🐾%3C/text%3E%3C/svg%3E';
    }

    // Si es un array, tomar el primer elemento
    let url = Array.isArray(imageUrl) ? imageUrl[0] : imageUrl;

    url = String(url).trim();

    // Si viene una lista, tomar la primera válida
    if (url.includes(',') || url.includes('|') || url.includes(';')) {
      const parts = url
        .split(/[,|;]+/)
        .map((p: string) => p.trim())
        .filter(Boolean);
      if (parts.length > 0) url = parts[0];
    }

    // Si es una URL absoluta o data URL, retornarla tal cual
    if (url.startsWith('http') || url.startsWith('data:')) {
      return url;
    }

    // Devolver fallback para valores extraños (p.ej. un solo caracter)
    if (url.length < 5) {
      return 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22%3E%3Crect width=%2240%22 height=%2240%22 fill=%22%23f3e8ff%22/%3E%3Ctext x=%2220%22 y=%2220%22 font-size=%2224%22 text-anchor=%22middle%22 dy=%22.3em%22%3E🐾%3C/text%3E%3C/svg%3E';
    }

    // Si es relativo, devolver tal cual (puedes añadir prefijo de servidor si hace falta)
    return url;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src =
      'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22%3E%3Crect width=%2240%22 height=%2240%22 fill=%22%23f3e8ff%22/%3E%3Ctext x=%2220%22 y=%2220%22 font-size=%2224%22 text-anchor=%22middle%22 dy=%22.3em%22%3E🐾%3C/text%3E%3C/svg%3E';
    console.warn('⚠️ Error cargando imagen, usando fallback');
  }

  onImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
  }

  /**
   * Retorna las clases CSS dinámicas para el badge de estado
   */
  getStatusBadgeClass(status: string): string {
    if (!status) return 'bg-gray-100 text-gray-700';

    const statusMap: { [key: string]: string } = {
      Pendiente: 'bg-yellow-100 text-yellow-700',
      Enviado: 'bg-blue-100 text-blue-700',
      Evaluación: 'bg-orange-100 text-orange-700',
      Finalizado: 'bg-green-100 text-green-700',
      Rechazada: 'bg-red-100 text-red-700',
    };

    return statusMap[status] || 'bg-gray-100 text-gray-700';
  }

  /**
   * Retorna las clases CSS dinámicas para los botones de acciones según color
   */
  getActionButtonClass(color?: string): string {
    if (!color) {
      return 'border border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50';
    }

    const colorMap: { [key: string]: string } = {
      'gray-500':
        'border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50',
      'orange-500':
        'border border-orange-200 text-orange-600 hover:border-orange-300 hover:bg-orange-50',
      'green-500':
        'border border-green-200 text-green-600 hover:border-green-300 hover:bg-green-50',
      'red-500':
        'border border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50',
      'red-600':
        'border border-red-300 text-red-700 hover:border-red-400 hover:bg-red-50',
      'blue-500':
        'border border-blue-200 text-blue-600 hover:border-blue-300 hover:bg-blue-50',
    };

    return (
      colorMap[color] ||
      'border border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50'
    );
  }

  // ========== EVENT LISTENERS ==========
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const threshold = 150;
    const position = window.innerHeight + window.scrollY;
    const height = document.documentElement.scrollHeight;

    if (height - position <= threshold) {
      this.scrollValidate = true;
      this.scrollEmitter.emit(true);
    }
  }
}
