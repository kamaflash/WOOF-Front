import { Component, HostListener, OnInit } from '@angular/core';
import { environment } from '../../../enviroments/environment';
import { Question } from '../../core/models/question';
import { PetFormFields } from '../details-pets/petformfields';
import { User } from '../../core/models/user';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../core/services/users/users.service';
import { BaseServiceService } from '../../core/services/base-service.service';
import { DialogComponent } from '../../shared/dialog/dialog.component';
import { DilogConfirmacionComponent } from '../../shared/dilog-confirmacion/dilog-confirmacion.component';
import {
  TableAction,
  TableColumn,
  TableComponent,
} from '../../shared/table/table.component';
import { AddComponent } from '../useradmin/add/add.component';
import { RequestComponent } from '../details-pets/request/request.component';
import { RequesviewComponent } from '../details-pets/requesview/requesview.component';
import { PreloadComponent } from '../../shared/preload/preload.component';
import { CustomDatePipe } from '../../core/pipes/custom-date-pipe';
import { CommonModule } from '@angular/common';
import { GalleryComponent } from '../../shared/gallery/gallery.component';
import { NadvarAnimalComponent } from './components/nadvar-animal/nadvar-animal.component';
import { ProfileComponent } from '../useradmin/profile/profile.component';

// Endpoints
const endpoint: string = environment.baseUrlSpring;
const urlPet: string = `${endpoint}pet`;
const urlRequest: string = `${endpoint}request`;

interface Tab {
  id: string;
  name: string;
  icon: string;
  count: number;
}

interface Like {
  id: string;
  usuario: {
    id: string;
    nombre: string;
    email: string;
    telefono?: string;
    fotoPerfil: string;
    ciudad?: string;
    activo: boolean;
    ultimaConexion: Date;
  };
  fechaLike: Date;
}

interface Match {
  id: string;
  usuario: {
    id: string;
    nombre: string;
    email: string;
    telefono?: string;
    fotoPerfil: string;
  };
  fechaMatch: Date;
  compatibilidad: number;
  puntuacion: number;
  nivelInteres: string;
  ultimaActividad: Date;
  experienciaPrevia: boolean;
  tipoVivienda: string;
  tiempoEnCasa: number;
  mensajesIntercambiados: number;
  visitasPerfil: number;
  ultimaComunicacion: Date;
}

interface Solicitud {
  id: string;
  solicitante: {
    id: string;
    nombre: string;
    email: string;
    telefono: string;
    fotoPerfil: string;
    ciudad?: string;
  };
  fecha: Date;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  mensaje: string;
  compatibilidad: number;
  experienciaMascotas: boolean;
  tipoVivienda: string;
  tiempoSolo: number;
  otrasMascotas: boolean;
  documentacionVerificada: boolean;
  entrevistaRealizada: boolean;
  puntuacion: number;
}

@Component({
  selector: 'app-animaladmin',
  imports: [
    CommonModule,
    RequestComponent,
    CustomDatePipe,
    DialogComponent,
    PreloadComponent,
    AddComponent,
    DilogConfirmacionComponent,
    TableComponent,
    NadvarAnimalComponent,
    ProfileComponent,
  ],
  templateUrl: './animaladmin.component.html',
  styleUrl: './animaladmin.component.css',
})
export class AnimaladminComponent implements OnInit {
  // -----------------------------------------
  // ✅ PROPIEDADES PRINCIPALES
  // -----------------------------------------
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

  userLogin: User | null = null;
  userProperty: any;
  formData = PetFormFields.createGroup;

  // -----------------------------------------
  // 📊 DATOS PARA LIKES, MATCHES Y SOLICITUDES
  // -----------------------------------------
  likes: Like[] = [];
  matches: Match[] = [];
  solicitudes: Solicitud[] = [];

  // Datos filtrados
  likesFiltrados: Like[] = [];
  solicitudesFiltradas: Solicitud[] = [];

  // Filtros y búsquedas
  filtroLikes: string = '';
  filtroSolicitud: string = 'todas';
  ordenLikes: string = 'recientes';
  ordenSolicitudes: string = 'recientes';
  busquedaSolicitante: string = '';

  // Paginación
  paginaLikes: number = 1;
  itemsPorPagina: number = 10;

  // -----------------------------------------
  // 📈 ESTADÍSTICAS Y MÉTRICAS
  // -----------------------------------------
  totalLikes: number = 0;
  totalMatches: number = 0;
  solicitudesPendientes: number = 0;
  solicitudesAprobadas: number = 0;
  solicitudesRechazadas: number = 0;
  solicitudesTotales: number = 0;

  // Métricas adicionales
  matchesActivos: number = 0;
  compatibilidadPromedio: number = 0;
  adopcionesExitosas: number = 0;
  solicitudesRechazadasCount: number = 0;

  // -----------------------------------------
  // 🎛️ ESTADOS UI
  // -----------------------------------------
  isLogin = false;
  spinner = false;
  menuOpen = false;
  submitDisabled = true;
  viewRequest = false;
  isSolicited = false;
  mostrarMas = false;
  mostrarRequest = false;
  showDialog = false;
  yaDioLike = false;

  // -----------------------------------------
  // 🗂️ CONFIGURACIÓN PESTAÑAS
  // -----------------------------------------
  tabs: Tab[] = [];
  tabActiva: string = 'info';
  tipeDialog: string = '';
  typeForm: string = 'modify';
  // Añadir estas propiedades al componente TypeScript

  // Para las estadísticas
  estadisticas = [
    {
      value: this.totalLikes,
      label: 'Total Likes',
      trend: '+12% este mes',
      trendColor: 'text-green-600',
      icon: 'favorite',
      bgColor: 'bg-blue-500',
    },
    {
      value: this.totalMatches,
      label: 'Matches Activos',
      trend: '+5% esta semana',
      trendColor: 'text-green-600',
      icon: 'auto_awesome',
      bgColor: 'bg-green-500',
    },
    {
      value: this.solicitudesPendientes,
      label: 'Solicitudes Pendientes',
      trend: this.solicitudesRechazadas + ' rechazadas',
      trendColor: 'text-red-600',
      icon: 'description',
      bgColor: 'bg-orange-500',
    },
    {
      value: 0,
      label: 'Visitas Totales',
      trend: '+23% este mes',
      trendColor: 'text-green-600',
      icon: 'visibility',
      bgColor: 'bg-purple-500',
    },
  ];

  // Para el estado de salud
  saludItems = [
    { label: 'Esterilizado', value: true },
    { label: 'Vacunado', value: true },
    { label: 'Desparasitado', value: true },
    { label: 'Microchip', value: true },
  ];
  tableColumns: TableColumn[] = [
    {
      key: 'userdto',
      label: 'Usuario',
      sortable: true,
      filterable: false,
      imageField: 'userdto.avatarUrl',
      textField: 'userdto.username',
      imageAlt: 'Mascota',
    },
    {
      key: 'createdAt',
      label: 'Fecha',
      sortable: true,
      filterable: false,
    },
  ];

  tableActions: TableAction[] = [
    {
      name: 'contact',
      label: 'Contactar',
      icon: 'mail',
      color: 'orange-500',
    },
  ];

  matchFilters = [
    { label: 'Like', value: 'Enviado' },
    { label: 'Match', value: 'Aceptado' },
  ];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private baseService: BaseServiceService
  ) {}

  // -----------------------------------------
  // 🔄 CICLO DE VIDA
  // -----------------------------------------
  ngOnInit(): void {
    this.loadUserSession();
    this.initializeTabs();

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.mascotaId = id;
        this.loadAnimalData(id);
      }
    });
  }

  private loadUserSession(): void {
    this.userLogin = this.userService?.user
      ? this.userService.user
      : JSON.parse(sessionStorage.getItem('us')!);
  }

  private initializeTabs(): void {
    this.tabs = [
      { id: 'info', name: 'Información', icon: 'info', count: 0 },
      { id: 'likes', name: 'Likes', icon: 'favorite', count: this.totalLikes },
      {
        id: 'matches',
        name: 'Matches',
        icon: 'auto_awesome',
        count: this.totalMatches,
      },
      {
        id: 'solicitudes',
        name: 'Solicitudes',
        icon: 'description',
        count: this.solicitudesPendientes,
      },
    ];
  }

  // -----------------------------------------
  // 🐾 CARGA DE DATOS DEL ANIMAL
  // -----------------------------------------
  private loadAnimalData(id: string): void {
    this.getMascota(id);
    this.getRequests(id);
    this.checkSolicited();
    this.loadLikes(id);
    this.loadMatches(id);
    this.loadSolicitudes(id);
  }

  getMascota(id: string): void {
    const url = `${endpoint}pet/${id}/${this.userLogin?.id}`;
    this.spinner = true;

    this.baseService.getItems(url).subscribe({
      next: (resp: any) => {
        this.mascota = resp;
        this.userProperty = resp.userdto[0];
        this.imgPet = resp.img ? resp.img[0] : resp.images[0];
        this.isLogin = this.userLogin?.id === this.userProperty.id;
        this.saludItems = [
          { label: 'Esterilizado', value: this.mascota?.sterilized || false },
          { label: 'Vacunado', value: this.mascota?.vaccinated || false },
          {
            label: 'Desparasitado',
            value: this.mascota?.hasDesparasite || false,
          },
          { label: 'Microchip', value: this.mascota?.hasMicrochip || false },
        ];
        this.spinner = false;
        this.showDialog = false;
      },
      error: () => (this.spinner = false),
    });
  }

  // -----------------------------------------
  // ❤️ GESTIÓN DE LIKES
  // -----------------------------------------
  private loadLikes(petId: string): void {
    const url = `${endpoint}likes/pet/${petId}`;
    this.baseService.getItems(url).subscribe({
      next: (resp: any) => {
        this.likes = this.mapearLikes(resp || []);
        this.totalLikes = this.likes.length;
        this.likesFiltrados = [...this.likes];
        this.updateTabCount('likes', this.totalLikes);
        this.checkUserLike();
        this.ordenarLikes();
      },
      error: (err) => console.error('Error loading likes:', err),
    });
  }

  private mapearLikes(likesData: any[]): Like[] {
    return likesData.map((like) => ({
      id: like.id,
      usuario: {
        id: like.usuario?.id || like.userId,
        nombre: like.usuario?.nombre || like.usuario?.name || 'Usuario',
        email: like.usuario?.email || 'No disponible',
        telefono: like.usuario?.telefono || like.usuario?.phone,
        fotoPerfil:
          like.usuario?.fotoPerfil ||
          like.usuario?.avatarUrl ||
          '/assets/default-avatar.png',
        ciudad: like.usuario?.ciudad || like.usuario?.city,
        activo: Math.random() > 0.2, // Simulado
        ultimaConexion: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
        ), // Simulado
      },
      fechaLike: new Date(like.fechaLike || like.createdAt),
    }));
  }

  private checkUserLike(): void {
    if (!this.userLogin) return;
    this.yaDioLike = this.likes.some(
      (like) => like.usuario.id === this.userLogin?.id
    );
  }

  darLike(): void {
    if (!this.userLogin) {
      this.router.navigate(['/login']);
      return;
    }

    const likeData = {
      usuarioId: this.userLogin.id,
      mascotaId: this.mascotaId,
      fechaLike: new Date(),
    };

    if (this.yaDioLike) {
      this.quitarLike();
    } else {
      this.baseService.postItem(`${endpoint}likes`, likeData).subscribe({
        next: () => {
          this.yaDioLike = true;
          this.loadLikes(this.mascotaId);
        },
        error: (err) => console.error('Error dando like:', err),
      });
    }
  }

  private quitarLike(): void {
    const userLike = this.likes.find(
      (like) => like.usuario.id === this.userLogin?.id
    );
    if (userLike) {
      this.baseService.delItem(`${endpoint}likes/${userLike.id}`).subscribe({
        next: () => {
          this.yaDioLike = false;
          this.loadLikes(this.mascotaId);
        },
        error: (err) => console.error('Error quitando like:', err),
      });
    }
  }

  // Filtros y ordenación de likes
  filtrarLikes(): void {
    if (!this.filtroLikes) {
      this.likesFiltrados = [...this.likes];
    } else {
      const filtro = this.filtroLikes.toLowerCase();
      this.likesFiltrados = this.likes.filter(
        (like) =>
          like.usuario.nombre.toLowerCase().includes(filtro) ||
          like.usuario.email.toLowerCase().includes(filtro)
      );
    }
    this.ordenarLikes();
  }

  ordenarLikes(): void {
    switch (this.ordenLikes) {
      case 'recientes':
        this.likesFiltrados.sort(
          (a, b) => b.fechaLike.getTime() - a.fechaLike.getTime()
        );
        break;
      case 'antiguos':
        this.likesFiltrados.sort(
          (a, b) => a.fechaLike.getTime() - b.fechaLike.getTime()
        );
        break;
      case 'nombre':
        this.likesFiltrados.sort((a, b) =>
          a.usuario.nombre.localeCompare(b.usuario.nombre)
        );
        break;
    }
  }

  cambiarPaginaLikes(pagina: number): void {
    this.paginaLikes = pagina;
    // Implementar lógica de paginación si es necesario
  }

  // -----------------------------------------
  // 💝 GESTIÓN DE MATCHES
  // -----------------------------------------
  private loadMatches(petId: string): void {
    const url = `${endpoint}match/pet/${petId}`;
    this.baseService.getItems(url).subscribe({
      next: (resp: any) => {
        this.matches = resp.matchs || [];
        const filteredMatchsAcep = resp.matchs.filter(
          (m: any) => m.status === 'Aceptado'
        );
        const filteredMatchsEnv = resp.matchs.filter(
          (m: any) => m.status === 'Enviado'
        );
        // this.calcularMetricasMatches();
        // this.updateTabCount('matches', this.totalMatches);
        this.estadisticas = [
          {
            value: filteredMatchsEnv.length,
            label: 'Total Likes',
            trend: '+12% este mes',
            trendColor: 'text-green-600',
            icon: 'favorite',
            bgColor: 'bg-blue-500',
          },
          {
            value: filteredMatchsAcep.length,
            label: 'Matches Activos',
            trend: '+5% esta semana',
            trendColor: 'text-green-600',
            icon: 'auto_awesome',
            bgColor: 'bg-green-500',
          },
          {
            value: resp.solicitudesPendientes,
            label: 'Solicitudes Pendientes',
            trend: resp.solicitudesRechazadas + ' rechazadas',
            trendColor: 'text-red-600',
            icon: 'description',
            bgColor: 'bg-orange-500',
          },
          {
            value: 0,
            label: 'Visitas Totales',
            trend: '+23% este mes',
            trendColor: 'text-green-600',
            icon: 'visibility',
            bgColor: 'bg-purple-500',
          },
        ];
      },
      error: (err) => console.error('Error loading matches:', err),
    });
  }

  private mapearMatches(matchesData: any[]): Match[] {
    return matchesData.map((match) => ({
      id: match.id,
      usuario: {
        id: match.usuario?.id || match.userId,
        nombre: match.usuario?.nombre || match.usuario?.name || 'Usuario',
        email: match.usuario?.email || 'No disponible',
        telefono: match.usuario?.telefono || match.usuario?.phone,
        fotoPerfil:
          match.usuario?.fotoPerfil ||
          match.usuario?.avatarUrl ||
          '/assets/default-avatar.png',
      },
      fechaMatch: new Date(match.fechaMatch || match.createdAt),
      compatibilidad:
        match.compatibilidad || Math.floor(Math.random() * 40) + 60,
      puntuacion: match.puntuacion || Math.floor(Math.random() * 6) + 5,
      nivelInteres:
        match.nivelInteres ||
        ['Bajo', 'Medio', 'Alto'][Math.floor(Math.random() * 3)],
      ultimaActividad: new Date(
        match.ultimaActividad ||
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
      ),
      experienciaPrevia: match.experienciaPrevia || Math.random() > 0.5,
      tipoVivienda:
        match.tipoVivienda ||
        ['Casa', 'Apartamento', 'Finca'][Math.floor(Math.random() * 3)],
      tiempoEnCasa: match.tiempoEnCasa || Math.floor(Math.random() * 8) + 4,
      mensajesIntercambiados:
        match.mensajesIntercambiados || Math.floor(Math.random() * 20) + 1,
      visitasPerfil: match.visitasPerfil || Math.floor(Math.random() * 15) + 1,
      ultimaComunicacion: new Date(
        match.ultimaComunicacion ||
          Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000
      ),
    }));
  }

  private calcularMetricasMatches(): void {
    this.totalMatches = this.matches.length;
    this.matchesActivos = this.matches.filter(
      (m) => Date.now() - m.ultimaActividad.getTime() < 7 * 24 * 60 * 60 * 1000
    ).length;

    this.compatibilidadPromedio =
      this.matches.length > 0
        ? Math.round(
            this.matches.reduce((sum, m) => sum + m.compatibilidad, 0) /
              this.matches.length
          )
        : 0;

    this.adopcionesExitosas = this.matches.filter(
      (m) => m.compatibilidad > 80
    ).length;
  }

  contactarMatch(usuarioId: string): void {
    console.log('Contactando match:', usuarioId);
    // Implementar lógica de contacto
  }

  eliminarMatch(matchId: string): void {
    this.baseService.delItem(`${endpoint}matches/${matchId}`).subscribe({
      next: () => {
        this.loadMatches(this.mascotaId);
      },
      error: (err) => console.error('Error eliminando match:', err),
    });
  }

  crearMatch(usuarioId: string): void {
    const matchData = {
      usuarioId: usuarioId,
      mascotaId: this.mascotaId,
      fechaMatch: new Date(),
    };

    this.baseService.postItem(`${endpoint}matches`, matchData).subscribe({
      next: () => {
        this.loadMatches(this.mascotaId);
      },
      error: (err) => console.error('Error creando match:', err),
    });
  }

  programarVisita(matchId: string): void {
    console.log('Programando visita para match:', matchId);
    // Implementar lógica de programación de visita
  }

  editarMatch(matchId: string): void {
    console.log('Editando match:', matchId);
    // Implementar lógica de edición
  }

  sugerirMatches(): void {
    console.log('Sugiriendo matches potenciales');
    // Implementar lógica de sugerencia de matches
  }

  generarReporteMatches(): void {
    console.log('Generando reporte de matches');
    // Implementar lógica de generación de reporte
  }

  // -----------------------------------------
  // 📨 GESTIÓN DE SOLICITUDES
  // -----------------------------------------
  private loadSolicitudes(petId: string): void {
    const url = `${endpoint}request/petId/${petId}`;
    this.baseService.getItems(url).subscribe({
      next: (resp: any) => {
        this.solicitudes = this.mapearSolicitudes(resp || []);
        this.calcularEstadisticasSolicitudes();
        this.filtrarSolicitudes();
      },
      error: (err) => console.error('Error loading solicitudes:', err),
    });
  }

  private mapearSolicitudes(requests: any[]): Solicitud[] {
    return requests.map((req) => ({
      id: req.id,
      solicitante: {
        id: req.userdto?.[0]?.id || req.userId,
        nombre:
          `${req.userdto?.[0]?.name || ''} ${
            req.userdto?.[0]?.lastname || ''
          }`.trim() || 'Solicitante',
        email: req.userdto?.[0]?.email || 'No disponible',
        telefono: req.userdto?.[0]?.phone || 'No disponible',
        fotoPerfil: req.userdto?.[0]?.avatarUrl || '/assets/default-avatar.png',
        ciudad: req.userdto?.[0]?.city,
      },
      fecha: new Date(req.createdAt),
      estado: req.status?.toLowerCase() as
        | 'pendiente'
        | 'aprobada'
        | 'rechazada',
      mensaje: req.answers?.[0] || 'Sin mensaje adicional',
      compatibilidad: Math.floor(Math.random() * 40) + 60,
      experienciaMascotas: Math.random() > 0.3,
      tipoVivienda: ['Casa', 'Apartamento', 'Finca'][
        Math.floor(Math.random() * 3)
      ],
      tiempoSolo: Math.floor(Math.random() * 8),
      otrasMascotas: Math.random() > 0.5,
      documentacionVerificada: Math.random() > 0.4,
      entrevistaRealizada: Math.random() > 0.6,
      puntuacion: Math.floor(Math.random() * 3) + 3,
    }));
  }

  private calcularEstadisticasSolicitudes(): void {
    this.solicitudesTotales = this.solicitudes.length;
    this.solicitudesPendientes = this.solicitudes.filter(
      (s) => s.estado === 'pendiente'
    ).length;
    this.solicitudesAprobadas = this.solicitudes.filter(
      (s) => s.estado === 'aprobada'
    ).length;
    this.solicitudesRechazadas = this.solicitudes.filter(
      (s) => s.estado === 'rechazada'
    ).length;
    this.updateTabCount('solicitudes', this.solicitudesPendientes);
  }

  filtrarSolicitudes(): void {
    let filtered = [...this.solicitudes];

    // Filtro por estado
    if (this.filtroSolicitud !== 'todas') {
      filtered = filtered.filter((s) => s.estado === this.filtroSolicitud);
    }

    // Búsqueda por nombre
    if (this.busquedaSolicitante) {
      const busqueda = this.busquedaSolicitante.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.solicitante.nombre.toLowerCase().includes(busqueda) ||
          s.solicitante.email.toLowerCase().includes(busqueda)
      );
    }

    // Ordenación
    this.ordenarSolicitudesLista(filtered);
  }

  ordenarSolicitudes(): void {
    this.filtrarSolicitudes();
  }

  private ordenarSolicitudesLista(solicitudes: Solicitud[]): void {
    switch (this.ordenSolicitudes) {
      case 'recientes':
        this.solicitudesFiltradas = solicitudes.sort(
          (a, b) => b.fecha.getTime() - a.fecha.getTime()
        );
        break;
      case 'antiguas':
        this.solicitudesFiltradas = solicitudes.sort(
          (a, b) => a.fecha.getTime() - b.fecha.getTime()
        );
        break;
      case 'compatibilidad':
        this.solicitudesFiltradas = solicitudes.sort(
          (a, b) => b.compatibilidad - a.compatibilidad
        );
        break;
      default:
        this.solicitudesFiltradas = solicitudes;
    }
  }

  aprobarSolicitud(solicitudId: string): void {
    this.updateSolicitudStatus(solicitudId, 'aprobada');
  }

  rechazarSolicitud(solicitudId: string): void {
    this.updateSolicitudStatus(solicitudId, 'rechazada');
  }

  revertirAprobacion(solicitudId: string): void {
    this.updateSolicitudStatus(solicitudId, 'pendiente');
  }

  private updateSolicitudStatus(solicitudId: string, estado: string): void {
    const url = `${endpoint}request/${solicitudId}`;
    const solicitud = this.solicitudes.find((s) => s.id === solicitudId);

    if (solicitud) {
      const updatedSolicitud = { ...solicitud, status: estado };
      this.baseService.putItem(url, updatedSolicitud).subscribe({
        next: () => {
          this.loadSolicitudes(this.mascotaId);
        },
        error: (err) => console.error('Error actualizando solicitud:', err),
      });
    }
  }

  contactarSolicitante(usuarioId: string): void {
    console.log('Contactando solicitante:', usuarioId);
  }

  limpiarFiltros(): void {
    this.filtroSolicitud = 'todas';
    this.busquedaSolicitante = '';
    this.ordenSolicitudes = 'recientes';
    this.filtrarSolicitudes();
  }

  exportarSolicitudes(): void {
    console.log('Exportando solicitudes');
    // Implementar lógica de exportación
  }

  // -----------------------------------------
  // 👤 GESTIÓN DE PERFILES
  // -----------------------------------------
  verPerfilUsuario(usuarioId: string): void {
    this.router.navigate(['/profile', usuarioId]);
  }

  verPerfilSolicitante(usuarioId: string): void {
    this.router.navigate(['/profile', usuarioId]);
  }

  verPerfilPropietario(): void {
    if (this.userProperty?.id) {
      this.tipeDialog = 'perfil';
      this.showDialog = true;
    }
  }

  contactarUsuario(usuarioId: string): void {
    console.log('Contactando usuario:', usuarioId);
  }

  contactarPropietario(): void {
    console.log('Contactando propietario:', this.userProperty);
  }

  // -----------------------------------------
  // 📌 CONTROLES DE UI
  // -----------------------------------------
  toggleVerMas(): void {
    this.mostrarMas = !this.mostrarMas;
  }

  toggleVerMasRequest(): void {
    this.mostrarRequest = !this.mostrarRequest;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.menuOpen = false;
    }
  }

  // -----------------------------------------
  // 🗂️ GESTIÓN DE PESTAÑAS
  // -----------------------------------------
  getTabClasses(tabId: string): string {
    const baseClasses =
      'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center';
    return tabId === this.tabActiva
      ? `${baseClasses} border-orange-500 text-orange-600`
      : `${baseClasses} border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`;
  }

  private updateTabCount(tabId: string, count: number): void {
    const tab = this.tabs.find((t) => t.id === tabId);
    if (tab) {
      tab.count = count;
    }
  }

  getBadgeSolicitudClasses(estado: string): string {
    const baseClasses =
      'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium';
    switch (estado) {
      case 'pendiente':
        return `${baseClasses} bg-orange-400 text-orange-800`;
      case 'aprobada':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rechazada':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  getStatusBadgeClass(status: string): string {
    const baseClasses =
      'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium';
    switch (status?.toLowerCase()) {
      case 'adoptado':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'En adopción':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'reservado':
        return `${baseClasses} bg-orange-400 text-orange-800`;
      default:
        return `${baseClasses} bg-green-100 text-green-800 border border-green-800`;
    }
  }

  // -----------------------------------------
  // 🎯 ACCIONES GENERALES
  // -----------------------------------------
  volver(): void {
    this.router.navigate(['/admin']);
  }

  exportarDatos(): void {
    console.log('Exportando datos de:', this.mascota.name);
  }

  cambiarEstado(): void {
    console.log('Cambiando estado de:', this.mascota.name);
  }

  exportarLikes(): void {
    console.log('Exportando likes');
  }

  // -----------------------------------------
  // 🖼️ DIALOGS Y MODALES
  // -----------------------------------------
  openAdoptionModal(type: string): void {
    if (!this.userLogin) this.router.navigate(['/login']);
    this.tipeDialog = type;
    this.showDialog = true;
  }

  dialogConfirmar(): void {
    this.tipeDialog = 'delete-animal';
    this.showDialog = true;
  }

  // -----------------------------------------
  // 📤 EMISORES DE FORMULARIO
  // -----------------------------------------
  formEmitterAndReturn(question: any): void {
    if (question) {
      this.submitDisabled = false;
      this.request.petId = this.mascotaId;
      this.request.userId = this.userLogin?.id || '';
      this.request.proUid = this.mascota.uid;
      this.request.questions = this.mascota.questions;
      this.request.answers = question.answers;
    }
  }

  setDisabledButton(event: any): void {
    this.mascota = event;
    this.submitDisabled = event.disabledButton;
  }

  getViewEmitter(event: any): void {
    this.tipeDialog = 'request';
    this.request = event;
    this.showDialog = true;
  }

  // -----------------------------------------
  // 📨 OPERACIONES DE SOLICITUD (EXISTENTES)
  // -----------------------------------------
  checkSolicited(): void {
    if (!this.userLogin) return;

    const url = `${endpoint}request/exits/${this.userLogin.id}/${this.mascotaId}`;
    this.spinner = true;

    this.baseService.getItems(url).subscribe({
      next: (resp: any) => {
        if (resp) {
          this.isSolicited = true;
          this.request = resp;
        }
        this.spinner = false;
      },
      error: () => (this.spinner = false),
    });
  }

  getRequests(id: string): void {
    const urlRequest = `${endpoint}request/petId/${id}`;
    this.baseService.getItems(urlRequest).subscribe({
      next: (resp: any) => {
        this.requests = resp || [];
      },
      error: (err) => console.error('Error al obtener solicitudes:', err),
    });
  }

  handleConfirm(type: string): void {
    if (type === 'request') return this.onSubmitRequest();
    if (type === 'request-add') return this.onSubmitAddRequest();
    if (type === 'modify-animal') {
      this.typeForm = 'update';
      setTimeout(() => ((this.showDialog = false), this.ngOnInit()), 3000);
    }
  }

  handleRechazar(type: string): void {
    if (type === 'request') this.onSubmitRechazoRequest();
  }

  onSubmitRequest(): void {
    this.spinner = true;
    const requestData = this.request;
    const url: string = `${endpoint}request/${this.request.id}`;

    this.baseService.putItem(url, requestData).subscribe({
      next: () => {
        this.spinner = false;
        this.showDialog = false;
        this.isSolcited();
      },
      error: (err) => console.error('Error al enviar solicitud:', err),
    });
  }

  onSubmitAddRequest(): void {
    this.spinner = true;
    const data = this.request;
    data.status = 'Pendiente';
    const url = `${endpoint}request`;

    this.baseService.postItem(url, data).subscribe({
      next: () => this.afterRequestAction(),
      error: () => (this.spinner = false),
    });
  }

  private afterRequestAction(): void {
    this.spinner = false;
    this.showDialog = false;
    this.checkSolicited();
  }

  onSubmitRechazoRequest(): void {
    const url = `${endpoint}request/${this.request.id}`;
    this.spinner = true;
    this.request.status = 'Rechazada';

    this.baseService.putItem(url, this.request).subscribe({
      next: () => this.afterRequestAction(),
      error: () => (this.spinner = false),
    });
  }

  isSolcited(): void {
    const urlId = `${endpoint}request/exits/${this.userLogin?.id}/${this.mascotaId}`;
    this.spinner = true;

    this.baseService.getItems(urlId).subscribe({
      next: (resp: any) => {
        if (resp) {
          this.isSolicited = true;
          this.request = resp;
        }
        this.spinner = false;
      },
      error: (err) => {
        console.error('Error al obtener mascota:', err);
        this.spinner = false;
      },
    });
  }

  // -----------------------------------------
  // 🐶 CRUD MASCOTA
  // -----------------------------------------
  async confirmRequest(event: any): Promise<void> {
    try {
      event.status = 'Aceptada';
      await this.updateRequest(event);

      const pet = event.petdto[0];
      pet.status = 'Adoptado';
      pet.uid = event.userdto[0]?.id;
      await this.updatePet(pet);

      this.getRequests(pet.id);
      this.loadSolicitudes(this.mascotaId);
    } catch (error) {
      console.error('❌ Error en confirmRequest:', error);
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

  cancelRequest(event: Event): void {
    console.log('Cancelar solicitud:', event);
  }

  onClick(event: Event): void {
    console.log('Click en solicitud:', event);
  }

  submitDelete(): void {
    const url = `${endpoint}pet/${this.mascotaId}`;
    this.spinner = true;

    this.baseService.delItem(url).subscribe({
      next: (resp: any) => {
        resp.images.forEach((img: string) => this.deleteImg(img));
        setTimeout(() => {
          this.spinner = false;
          this.showDialog = false;
          this.router.navigate(['/admin']);
        }, 500);
      },
      error: () => (this.spinner = false),
    });
  }

  deleteImg(file: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.baseService
        .postItemImage(`${endpoint}pet/delimage`, { file })
        .subscribe({
          next: (data: any) => resolve(data.url),
          error: (err) => reject(err),
        });
    });
  }

  verSolicitudCompleta(solicitudId: string): void {
    console.log('Viendo solicitud completa:', solicitudId);
  }

  // Propiedades para el debug
  imageStatus: string[] = [];

  onImageLoad(index: number, imgElement: HTMLImageElement): void {
    console.log(`✅ Imagen ${index} cargada:`, imgElement.src);
    console.log(
      '🔍 Dimensiones:',
      imgElement.naturalWidth,
      'x',
      imgElement.naturalHeight
    );
    console.log('🎨 Estilos aplicados:', {
      display: imgElement.style.display,
      background: imgElement.style.background,
      width: imgElement.style.width,
      height: imgElement.style.height,
    });
    this.imageStatus[index] = '✅ Cargada';
  }

  onImageError(
    index: number,
    imagenUrl: string,
    imgElement: HTMLImageElement
  ): void {
    console.error(`❌ Error imagen ${index}:`, imagenUrl);
    console.error('🔍 Elemento:', imgElement);
    this.imageStatus[index] = '❌ Error';
  }

  getImageStatus(index: number): string {
    return this.imageStatus[index] || '⏳ Cargando...';
  }

  accion(event: any): void {
    this.showDialog = true;
    this.tipeDialog = event;
    this.typeForm = 'modify';
  }
  onTableAction(event: { action: string; item: any }): void {
    const { action, item } = event;

    if (action === 'contact') {
      console.log('Contactar con match:', item);
    }
  }

  // ✅ Click en fila
  onRowClick(item: any): void {
    if (item?.pet?.id) {
      this.router.navigate([`details/${item.pet.id}`]);
    }
  }
}
