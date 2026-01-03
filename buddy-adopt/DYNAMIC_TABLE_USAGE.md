# Componente Tabla Dinámico - Guía de Uso

El componente `TableComponent` ha sido transformado en un **componente completamente dinámico y reutilizable**. Permite configurar columnas, acciones, filtros y más sin modificar el template.

## 📋 Interfaces de Configuración

### TableColumn
Define la estructura de una columna en la tabla.

```typescript
interface TableColumn {
  key: string;                    // Ruta de la propiedad en el objeto (ej: 'petdto.0.name')
  label: string;                  // Etiqueta mostrada en el header
  icon?: string;                  // Ícono de Material Symbols
  sortable?: boolean;             // Si es sorteable (futuro)
  filterable?: boolean;           // Si es filterable (futuro)
  width?: string;                 // Ancho personalizado (ej: '200px')
  render?: (item: any) => string; // Función personalizada para renderizar
  customTemplate?: boolean;       // Si usa template personalizado
}
```

### TableAction
Define una acción/botón que puede ejecutarse en la tabla.

```typescript
interface TableAction {
  name: string;                          // Identificador único de la acción
  label?: string;                        // Texto del botón
  icon: string;                          // Ícono de Material Symbols
  color?: string;                        // Color Tailwind (ej: 'green-500')
  condition?: (item: any) => boolean;    // Función para mostrar condicionalmente
  bulkAction?: boolean;                  // Si es acción en lote
}
```

### FilterOption
Define una opción para los filtros.

```typescript
interface FilterOption {
  label: string;  // Etiqueta visible
  value: any;     // Valor para filtrar
}
```

## 🚀 Ejemplo de Uso Básico

### 1. Importar en el componente padre

```typescript
import { TableComponent, TableColumn, TableAction } from './shared/table/table.component';

@Component({
  selector: 'app-solicitudes',
  imports: [TableComponent, CommonModule],
  templateUrl: './solicitudes.component.html',
})
export class SolicitudesComponent {
  items: any[] = [];
  
  // Configurar columnas
  columns: TableColumn[] = [
    {
      key: 'petdto.0.name',
      label: 'Mascota',
      icon: 'pets',
      width: '200px'
    },
    {
      key: 'userdto.0.username',
      label: 'Adoptante',
      icon: 'person'
    },
    {
      key: 'createdAt',
      label: 'Fecha',
      icon: 'calendar_month',
      render: (item) => new Date(item.createdAt).toLocaleDateString('es-ES')
    }
  ];

  // Configurar acciones
  actions: TableAction[] = [
    {
      name: 'view',
      label: 'Ver',
      icon: 'visibility',
      color: 'blue-500'
    },
    {
      name: 'approve',
      label: 'Aprobar',
      icon: 'check_circle',
      color: 'green-500',
      condition: (item) => item.status !== 'Aceptada'
    },
    {
      name: 'reject',
      label: 'Rechazar',
      icon: 'close',
      color: 'red-500',
      condition: (item) => item.status !== 'Rechazada'
    },
    {
      name: 'delete',
      label: 'Eliminar',
      icon: 'delete',
      color: 'red-600',
      bulkAction: true
    }
  ];

  // Filtros personalizados
  filterOptions: FilterOption[] = [
    { label: 'Pendiente', value: 'Pendiente' },
    { label: 'Aprobado', value: 'Aprobado' },
    { label: 'Rechazado', value: 'Rechazado' }
  ];
}
```

### 2. Usar en el template

```html
<app-table
  [items]="items"
  [columns]="columns"
  [actions]="actions"
  [filterOptions]="filterOptions"
  [userLogin]="currentUser"
  [totalItems]="totalCount"
  [searchFields]="['petdto.0.name', 'userdto.0.username']"
  [filterField]="'status'"
  [statusField]="'status'"
  [userIdField]="'userId'"
  [enableSearch]="true"
  [enableFilter]="true"
  [enableCheckbox]="true"
  [enableViewToggle]="true"
  [selectionDisabledStatuses]="['Finalizado', 'Rechazada']"
  (actionTriggered)="onAction($event)"
  (onClickEmmiter)="onItemClick($event)"
></app-table>
```

### 3. Manejar eventos en el componente padre

```typescript
onAction(event: { action: string; item: any }) {
  const { action, item } = event;
  
  switch(action) {
    case 'view':
      this.viewItem(item);
      break;
    case 'approve':
      this.approveItem(item);
      break;
    case 'reject':
      this.rejectItem(item);
      break;
    case 'delete':
      this.deleteItems(Array.isArray(item) ? item : [item]);
      break;
  }
}

onItemClick(item: any) {
  console.log('Item clicked:', item);
}
```

## ⚙️ Propiedades de Entrada (Inputs)

### Datos y Configuración
| Propiedad | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `items` | `any[]` | `[]` | Array de elementos a mostrar |
| `columns` | `TableColumn[]` | `[]` | Configuración de columnas |
| `actions` | `TableAction[]` | `[]` | Acciones disponibles |
| `filterOptions` | `FilterOption[]` | `[]` | Opciones de filtro |
| `userLogin` | `User \| null` | `null` | Usuario actual |
| `totalItems` | `number \| null` | `null` | Total de registros |

### Campos de Datos
| Propiedad | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `searchFields` | `string[]` | `[]` | Campos para búsqueda (notación punto: 'user.name') |
| `filterField` | `string` | `''` | Campo principal para filtrar |
| `statusField` | `string` | `'status'` | Campo de estado |
| `userIdField` | `string` | `'userId'` | Campo de ID de usuario |

### Funcionalidades
| Propiedad | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `enableSearch` | `boolean` | `true` | Activar búsqueda |
| `enableFilter` | `boolean` | `true` | Activar filtros |
| `enableCheckbox` | `boolean` | `true` | Activar selección |
| `enableViewToggle` | `boolean` | `true` | Cambio tabla/tarjetas |
| `enablePagination` | `boolean` | `false` | Mostrar paginación |
| `pageSize` | `number` | `10` | Items por página |

### Estados y Validaciones
| Propiedad | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `selectionDisabledStatuses` | `string[]` | `['Finalizado', 'Rechazada']` | Estados no seleccionables |
| `disabledActionStatuses` | `string[]` | `[]` | Estados donde las acciones se deshabilitan |
| `spinner` | `boolean \| null` | `null` | Mostrar indicador de carga |

## 📤 Eventos (Outputs)

| Evento | Tipo | Descripción |
|--------|------|-------------|
| `actionTriggered` | `EventEmitter<{action, item}>` | Se dispara cuando el usuario hace clic en una acción |
| `onClickEmmiter` | `EventEmitter<any>` | Se dispara cuando se hace clic en un item |
| `onConfirmEmmiter` | `EventEmitter<any>` | Se dispara al confirmar (aprobar) |
| `onCancelEmmiter` | `EventEmitter<any>` | Se dispara al cancelar (rechazar) |
| `filterChangeEmitter` | `EventEmitter<any>` | Se dispara al cambiar filtros |
| `scrollEmitter` | `EventEmitter<boolean>` | Se dispara al hacer scroll infinito |

## 🎨 Personalización Avanzada

### Renderización Personalizada de Columnas

Usa la propiedad `render` en `TableColumn` para personalizar cómo se muestra el contenido:

```typescript
{
  key: 'createdAt',
  label: 'Fecha de Creación',
  render: (item) => {
    const date = new Date(item.createdAt);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
```

### Acciones Condicionales

Controla cuándo se muestran las acciones:

```typescript
{
  name: 'edit',
  icon: 'edit',
  condition: (item) => item.userId === this.currentUserId
}
```

### Filtros Dinámicos

Cambia los filtros en tiempo de ejecución:

```typescript
cambiarFiltros(newFilters: FilterOption[]) {
  this.filterOptions = newFilters;
}
```

## 🔍 Búsqueda y Filtros

### Búsqueda en Múltiples Campos

```typescript
[searchFields]="['petdto.0.name', 'userdto.0.username', 'userdto.0.email']"
```

### Filtrado por Campo Único

```typescript
[filterField]="'status'"
```

El componente filtrará automáticamente cuando se seleccione una opción en el filtro.

## 🎯 Ejemplo Completo: Sistema de Solicitudes

```typescript
// solicitudes.component.ts
import { Component, OnInit } from '@angular/core';
import { TableComponent, TableColumn, TableAction } from './shared/table/table.component';
import { SolicitudesService } from './services/solicitudes.service';

@Component({
  selector: 'app-solicitudes',
  imports: [TableComponent],
  template: `
    <app-table
      [items]="solicitudes"
      [columns]="columns"
      [actions]="actions"
      [filterOptions]="filterOptions"
      [userLogin]="currentUser"
      [totalItems]="totalSolicitudes"
      [searchFields]="['petdto.0.name', 'userdto.0.username']"
      [filterField]="'status'"
      (actionTriggered)="manejarAccion($event)"
    ></app-table>
  `
})
export class SolicitudesComponent implements OnInit {
  solicitudes: any[] = [];
  currentUser: any;
  totalSolicitudes = 0;

  columns: TableColumn[] = [
    { key: 'petdto.0.name', label: 'Mascota', icon: 'pets', width: '150px' },
    { key: 'userdto.0.username', label: 'Adoptante', icon: 'person' },
    {
      key: 'createdAt',
      label: 'Fecha',
      icon: 'calendar_month',
      render: (item) => new Date(item.createdAt).toLocaleDateString('es-ES')
    },
    {
      key: 'status',
      label: 'Estado',
      render: (item) => this.getEstadoLabel(item.status)
    }
  ];

  actions: TableAction[] = [
    { name: 'view', icon: 'visibility', color: 'blue-500' },
    {
      name: 'approve',
      icon: 'check_circle',
      color: 'green-500',
      condition: (item) => item.status === 'Pendiente'
    },
    {
      name: 'reject',
      icon: 'close',
      color: 'red-500',
      condition: (item) => item.status === 'Pendiente'
    },
    {
      name: 'delete',
      icon: 'delete',
      color: 'red-600',
      bulkAction: true,
      condition: () => this.currentUser?.isAdmin
    }
  ];

  filterOptions = [
    { label: 'Pendiente', value: 'Pendiente' },
    { label: 'Aprobado', value: 'Aprobado' },
    { label: 'Rechazado', value: 'Rechazado' }
  ];

  constructor(private solicitudesService: SolicitudesService) {}

  ngOnInit() {
    this.cargarSolicitudes();
  }

  cargarSolicitudes() {
    this.solicitudesService.obtener().subscribe(data => {
      this.solicitudes = data.solicitudes;
      this.totalSolicitudes = data.total;
    });
  }

  manejarAccion(event: { action: string; item: any }) {
    switch(event.action) {
      case 'view':
        console.log('Ver solicitud:', event.item);
        break;
      case 'approve':
        this.aprobarSolicitud(event.item);
        break;
      case 'reject':
        this.rechazarSolicitud(event.item);
        break;
      case 'delete':
        const items = Array.isArray(event.item) ? event.item : [event.item];
        this.eliminarSolicitudes(items);
        break;
    }
  }

  aprobarSolicitud(solicitud: any) {
    this.solicitudesService.aprobar(solicitud.id).subscribe(() => {
      this.cargarSolicitudes();
    });
  }

  rechazarSolicitud(solicitud: any) {
    this.solicitudesService.rechazar(solicitud.id).subscribe(() => {
      this.cargarSolicitudes();
    });
  }

  eliminarSolicitudes(solicitudes: any[]) {
    const ids = solicitudes.map(s => s.id);
    this.solicitudesService.eliminar(ids).subscribe(() => {
      this.cargarSolicitudes();
    });
  }

  getEstadoLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'Pendiente': '⏳ Pendiente',
      'Aprobado': '✅ Aprobado',
      'Rechazado': '❌ Rechazado'
    };
    return labels[status] || status;
  }
}
```

## 💡 Tips y Mejores Prácticas

1. **Usa notación de punto para campos anidados**: `'user.profile.name'` se convierte automáticamente
2. **Renderización personalizada**: Utiliza `render` para lógica compleja
3. **Acciones condicionales**: Usa `condition` para mostrar botones dinámicamente
4. **Estados deshabilitados**: Define `selectionDisabledStatuses` para estados finales
5. **Búsqueda múltiple**: Especifica varios `searchFields` para mejor UX
6. **Colores Tailwind**: Los colores de acciones usan clases Tailwind estándar

## 🔧 Migración desde la Versión Anterior

Si tienes código usando la versión anterior, actualiza así:

```typescript
// Antes
<app-table [items]="requests"></app-table>

// Después
<app-table
  [items]="requests"
  [columns]="columns"
  [actions]="actions"
  [searchFields]="['petdto.0.name', 'userdto.0.username']"
  (actionTriggered)="onAction($event)"
></app-table>
```

## ✅ Conclusión

El componente `TableComponent` ahora es **completamente dinámico y reutilizable** en cualquier parte de tu aplicación. No necesitas modificar el template para casos diferentes, solo configura las propiedades de entrada.
