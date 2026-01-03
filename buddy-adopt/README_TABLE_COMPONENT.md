# 🎯 Componente Tabla Dinámico - Resumen Rápido

Tu componente `TableComponent` ha sido **transformado completamente en un componente dinámico y reutilizable**. Ya no necesitas modificar el template para diferentes casos de uso.

## ✨ Cambios Principales

### Antes (Rígido)
```html
<!-- Template hardcodeado para un caso específico -->
<app-table [items]="requests"></app-table>
<!-- Las columnas, acciones y filtros estaban fijos en el template -->
```

### Ahora (Dinámico)
```html
<!-- Configuración flexible por Input -->
<app-table
  [items]="items"
  [columns]="columns"
  [actions]="actions"
  [filterOptions]="filterOptions"
  (actionTriggered)="onAction($event)"
></app-table>
```

## 🚀 Uso Rápido

### 1. Define las columnas
```typescript
columns: TableColumn[] = [
  { key: 'name', label: 'Nombre', icon: 'person' },
  { key: 'email', label: 'Email', icon: 'mail' },
  { key: 'createdAt', label: 'Fecha', render: (item) => formatDate(item) }
];
```

### 2. Define las acciones
```typescript
actions: TableAction[] = [
  { name: 'view', icon: 'visibility', color: 'blue-500' },
  { name: 'edit', icon: 'edit', color: 'orange-500' },
  { name: 'delete', icon: 'delete', color: 'red-500', bulkAction: true }
];
```

### 3. Maneja los eventos
```typescript
manejarAccion(event: { action: string; item: any }) {
  switch(event.action) {
    case 'view':
      this.ver(event.item);
      break;
    case 'edit':
      this.editar(event.item);
      break;
    case 'delete':
      this.eliminar(event.item);
      break;
  }
}
```

## 📋 Propiedades Principales

| Propiedad | Descripción |
|-----------|-------------|
| `[items]` | Array de datos a mostrar |
| `[columns]` | Configuración de columnas |
| `[actions]` | Botones/acciones disponibles |
| `[filterOptions]` | Opciones para el filtro |
| `[searchFields]` | Campos donde buscar (ej: `['name', 'email']`) |
| `[filterField]` | Campo que se filtra (ej: `'status'`) |
| `[enableSearch]` | Activar búsqueda (default: `true`) |
| `[enableFilter]` | Activar filtros (default: `true`) |
| `[enableCheckbox]` | Activar selección (default: `true`) |
| `[enableViewToggle]` | Cambio tabla/tarjetas (default: `true`) |

## 🎨 Características

✅ **Dos vistas:** Tabla y Tarjetas (intercambiables)
✅ **Búsqueda:** En múltiples campos
✅ **Filtros:** Dinámicos y personalizables
✅ **Selección:** Checkboxes con seleccionar todo
✅ **Acciones:** Individuales y en lote
✅ **Renderizado personalizado:** Usa funciones `render`
✅ **Campos anidados:** Soporta `user.profile.name`
✅ **Sin errores:** Todo tipado con TypeScript

## 📁 Archivos Modificados

- `src/app/shared/table/table.component.ts` - Lógica dinámica
- `src/app/shared/table/table.component.html` - Template genérico
- `DYNAMIC_TABLE_USAGE.md` - Documentación completa
- `EXAMPLE_USAGE.ts` - Ejemplo real de uso

## 🔧 Migración desde Versión Anterior

Si usabas la versión anterior, solo necesitas:

1. Definir `columns` array
2. Definir `actions` array  
3. Cambiar el handler de eventos a `actionTriggered`

¡Eso es todo!

## 💡 Ejemplo Rápido

```typescript
@Component({...})
export class MyComponent {
  items = [{ id: 1, name: 'Juan', status: 'Activo' }];

  columns: TableColumn[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'status', label: 'Estado' }
  ];

  actions: TableAction[] = [
    { name: 'view', icon: 'visibility' },
    { name: 'delete', icon: 'delete', bulkAction: true }
  ];

  onAction(event: { action: string; item: any }) {
    if(event.action === 'delete') {
      // Eliminar item(s)
    }
  }
}
```

## 📚 Documentación Completa

Ver `DYNAMIC_TABLE_USAGE.md` para documentación detallada con:
- Todas las interfaces
- Ejemplos completos
- Personalización avanzada
- Tips y mejores prácticas

## ❓ Preguntas Frecuentes

**P: ¿Cómo busco en campos anidados?**
R: Usa notación de punto: `searchFields: ['user.name', 'user.email']`

**P: ¿Cómo personalizo el renderizado de una columna?**
R: Usa la propiedad `render`:
```typescript
{ key: 'date', label: 'Fecha', render: (item) => item.date.toLocaleDateString() }
```

**P: ¿Cómo muestro un botón solo bajo ciertas condiciones?**
R: Usa `condition`:
```typescript
{ name: 'edit', icon: 'edit', condition: (item) => item.userId === currentUserId }
```

**P: ¿Cómo tengo acciones en lote?**
R: Usa `bulkAction: true` en la acción:
```typescript
{ name: 'delete', icon: 'delete', bulkAction: true }
```

---

¡Tu componente tabla es ahora **100% reutilizable** en cualquier parte de tu aplicación! 🎉
