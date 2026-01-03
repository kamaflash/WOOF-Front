import { UserService } from './services/users/users.service';
import {
  AbstractControl,
  FormArray,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { BaseServiceService } from './services/base-service.service';
import { User } from './models/user';
import { environment } from '../../enviroments/environment';
import { Observable, tap } from 'rxjs';
import { LocationService } from './services/location.service';
const endpoint = environment.baseUrlSpring;

export class Utils {
  TODAY: Date = new Date();

  constructor(private userService: UserService) {}

  // Método para formatear la fecha
  static formatDate(date: Date): string {
    const formatter = new Intl.DateTimeFormat('es-ES', {
      weekday: 'short', // Día de la semana abreviado (Lun, Mar, etc.)
      day: '2-digit', // Día del mes con dos dígitos
      month: 'short', // Mes abreviado (ene, feb, mar, etc.)
      year: 'numeric', // Año completo
    });

    // Formatear la fecha
    const formattedDate = formatter.format(date);

    // Capitalizar la primera letra del mes
    return formattedDate.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  static formatDateAndTime(date: Date): string {
    const formatter = new Intl.DateTimeFormat('es-ES', {
      weekday: 'short', // Día de la semana abreviado (Lun, Mar, etc.)
      day: '2-digit', // Día del mes con dos dígitos
      month: 'short', // Mes abreviado (ene, feb, mar, etc.)
      year: 'numeric', // Año completo
      hour: '2-digit', // Hora con dos dígitos
      minute: '2-digit', // Minutos con dos dígitos
    });

    // Formatear la fecha
    const formattedDate = formatter.format(date);

    // Capitalizar la primera letra del mes
    return formattedDate.replace(/\b\w/g, (char) => char.toUpperCase());
  }
  static paintMothActuallity(passData?: boolean): string {
    // Obtener la fecha actual
    const date = new Date();

    if (passData) {
      // Ajustar el día al 1 para evitar problemas con meses de diferente duración
      date.setDate(1);

      // Restar un mes a la fecha actual
      date.setMonth(date.getMonth() - 1);
    }

    // Formatear el mes en español y capitalizar la primera letra
    return new Intl.DateTimeFormat('es-ES', { month: 'long' })
      .format(date)
      .replace(/^\w/, (c) => c.toUpperCase());
  }

  static parseSpanishDate(dateString: string): Date | null {
    // Mapea los nombres de los meses en español a índices (0 = enero, 11 = diciembre)
    const monthsMap: { [key: string]: number } = {
      Ene: 0,
      Feb: 1,
      Mar: 2,
      Abr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Ago: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dic: 11,
    };

    // Elimina el nombre del día (por ejemplo, "Mié, ")
    const cleanDateString = dateString.split(', ')[1]; // "02 Abr 2025"

    // Divide el string en partes (día, mes, año)
    const [day, month, year] = cleanDateString.split(' ');

    // Obtén el índice del mes usando el mapa
    const monthIndex = monthsMap[month];

    // Si el mes no es válido, devuelve null
    if (monthIndex === undefined) {
      console.error('Mes no válido:', month);
      return null;
    }

    // Crea un objeto Date usando los valores procesados
    return new Date(Number(year), monthIndex, Number(day));
  }

  static setItemMenu(artist: User, isLogged: boolean = true) {
    const baseMenuItems = [
      {
        label: 'Datos',
        icon: 'pi pi-bolt',
        routerLink: [`/profile/${artist?.id}/arthist`],
      },
      {
        label: 'Obras',
        icon: 'pi pi-image',
        expanded: false,
        children: [
          {
            label: 'Galería',
            routerLink: `/profile/artwork/${artist?.id}/gallery/${artist?.id}`,
          },
        ],
      },
      {
        label: 'Favoritos',
        icon: 'pi pi-pencil',
        routerLink: 'dashboard',
      },
    ];
    if (isLogged) {
      const obrasMenuItem = baseMenuItems.find(
        (item) => item.label === 'Obras'
      );
      if (obrasMenuItem && obrasMenuItem.children) {
        obrasMenuItem.children.push({
          label: 'Gestión',
          routerLink: `/profile/artwork/${artist?.id}/table`,
        });
      }
    }
    return baseMenuItems;
  }

  static reloadUser(
    baseService: BaseServiceService,
    userService: UserService
  ): Observable<any> {
    let userLogin = JSON.parse(sessionStorage.getItem('us')!);
    const url = endpoint + 'users/full/' + userLogin.id;

    return baseService.getItems(url).pipe(
      tap((resp: any) => {
        userLogin = resp;
        userService.user = userLogin;
        sessionStorage.setItem('us', JSON.stringify(userLogin));
      })
    );
  }

  static getMonthsBetweenDates(startDate: Date, endDate: Date): number {
    // Aseguramos que las fechas sean objetos Date válidos
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculamos la diferencia en años y meses
    const yearsDiff = end.getFullYear() - start.getFullYear();
    const monthsDiff = end.getMonth() - start.getMonth();

    // Total de meses (años convertidos a meses + meses restantes)
    const totalMonths = yearsDiff * 12 + monthsDiff;

    // Ajuste por días (opcional, si quieres precisión exacta)
    if (end.getDate() < start.getDate()) {
      return totalMonths - 1; // Resta 1 mes si el día de endDate es menor
    }

    return totalMonths;
  }
  static getDaysBetweenDates(startDate: Date, endDate: Date): number {
    // Convertir ambas fechas a milisegundos
    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();

    // Calcular la diferencia en milisegundos
    const differenceInMillis = endTimestamp - startTimestamp;

    // Convertir la diferencia de milisegundos a días
    const days = differenceInMillis / (1000 * 3600 * 24);

    return Math.floor(days); // Redondear hacia abajo si es necesario
  }

  static getInvalidControls(form: FormGroup): string[] {
    const invalid: string[] = [];

    const recurse = (fg: FormGroup | FormArray, prefix: string = '') => {
      Object.keys(fg.controls).forEach((key) => {
        const control = fg.get(key)!;
        const controlPath = prefix ? `${prefix}.${key}` : key;

        if (control instanceof FormGroup || control instanceof FormArray) {
          recurse(control, controlPath);
        } else if (control.invalid) {
          invalid.push(controlPath);
        }
      });
    };

    recurse(form);

    return invalid;
  }

  // ======================================
  // 🔹 Backend Helpers
  // ======================================
  static pushImg(file: File, baseService: BaseServiceService): Promise<string> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);

      baseService.postItemImage(`${endpoint}pet/image`, formData).subscribe({
        next: (data: any) => resolve(data.url),
        error: (err) => reject(err),
      });
    });
  }

  static deleteImg(
    file: string,
    baseService: BaseServiceService
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      baseService.postItemImage(`${endpoint}pet/delimage`, { file }).subscribe({
        next: (data: any) => resolve(data.url),
        error: (err) => reject(err),
      });
    });
  }

}
