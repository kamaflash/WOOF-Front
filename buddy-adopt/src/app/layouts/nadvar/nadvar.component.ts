import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { User } from '../../core/models/user';
import { Subscription } from 'rxjs';
import { BaseServiceService } from '../../core/services/base-service.service';
import { UserService } from '../../core/services/users/users.service';
import { NoUserComponent } from '../../pages/auth/no-user/no-user.component';
import { environment } from '../../../enviroments/environment';
import { DialogComponent } from "../../shared/dialog/dialog.component";

const endpoint: string = environment.baseUrlSpring;
const url: string = `${endpoint}notification`;
@Component({
  selector: 'app-nadvar',
  standalone: true,
  imports: [CommonModule, RouterModule, NoUserComponent, DialogComponent],
  templateUrl: './nadvar.component.html',
  styleUrl: './nadvar.component.scss',
})
export class NadvarComponent implements OnInit, OnDestroy {
  user: User | null = null;
  private userSubscription!: Subscription;
  dataSource: any = [];

  // Estados del menú
  isMobileMenuOpen = false;
  isMobile = false;

  // Notificaciones (ejemplo)
  unreadNotifications = 3;

  // Variable para almacenar el índice del botón activo
  activeButton: number = 0;
  showDialog: boolean = false;
  showDialogNotification: boolean = false;
  spinner: boolean = false;
  constructor(
    public baseService: BaseServiceService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    // Suscribirse a los cambios de usuario
    this.userSubscription = this.userService.userChange.subscribe((user) => {
      this.user = user;
    });

    // Inicializar con el usuario almacenado en el servicio
    this.user = this.userService.user;

    // Verificar tamaño de pantalla inicial
    this.checkScreenSize();
    this.loadNotifications();
  }

  ngOnDestroy() {
    // Limpiar suscripciones
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  @HostListener('window:resize', [])
  onResize() {
    this.checkScreenSize();
    // Cerrar menú móvil si se cambia a desktop
    if (!this.isMobile && this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
      this.restoreBodyScroll();
    }
  }

  checkScreenSize() {
    // MD breakpoint de Tailwind es 768px
    this.isMobile = window.innerWidth < 768;
  }

  closedSession() {
    sessionStorage.clear();
    this.userService.logout(); // Si tienes método logout en UserService
    this.user = null;
    this.closeMobileMenu();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;

    // Bloquear/restaurar scroll del body
    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      this.restoreBodyScroll();
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    this.restoreBodyScroll();
  }

  private restoreBodyScroll(): void {
    document.body.style.overflow = '';
  }

  // Método para navegar y cerrar menú móvil
  navigateAndCloseMenu(route: string): void {
    this.closeMobileMenu();
    this.router.navigate([route]);
  }

  // Método para logout
  logout(): void {
    this.closedSession();
    this.closeMobileMenu();
  }

  // Métodos para notificaciones (puedes implementarlos después)
  getNotifications(): void {
    // Lógica para obtener notificaciones
    console.log('Obteniendo notificaciones...');
  }

  markAllAsRead(): void {
    // Lógica para marcar notificaciones como leídas
    this.unreadNotifications = 0;
  }


  validateRouter(url: string, event: Event) {
    {
      if (!this.user) {
        this.showDialog = this.showDialog ? false : true;
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }


  loadNotifications() {
    // Lógica para cargar notificaciones
    console.log('Cargando notificaciones...');
this.spinner = true;
    const urlNotification = `${url}/${this.user?.id}`;
    this.baseService.getItems(urlNotification).subscribe((data) => {
      this.dataSource = data;
      this.unreadNotifications = this.dataSource.notification?.filter((n:any) => !n.read)?.length || 0
      this.spinner = false;
    });
  }

  onClick(event: any) {
    console.log('Evento recibido del componente hijo:', event);
    this.showDialogNotification = false;
    this.loadNotifications(); }

    onClickRouter(notification:any) {
      notification.read = true
      const urlNotification = `${url}/${notification.id}`;
      this.baseService.putItem(urlNotification, notification).subscribe((data) => {
        this.router.navigate(['/admin']);
      } );


    }
}
