import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

interface PrivacyOption {
  id: string;
  label: string;
  icon: string;
  description: string;
  category: 'básica' | 'avanzada' | 'pro';
  recommended: boolean;
  enabled: boolean;
}

interface NotificationSetting {
  id: string;
  label: string;
  icon: string;
  description: string;
  type: 'email' | 'push';
  enabled: boolean;
}

interface NotificationFrequency {
  value: string;
  label: string;
  icon: string;
  description: string;
  recommendedFor: string;
  priority: 'baja' | 'media' | 'alta';
}

interface AdoptionPreference {
  id: string;
  label: string;
  icon: string;
  description: string;
  category: 'básica' | 'avanzada';
  aiRecommended: boolean;
  enabled: boolean;
}

interface PetPreference {
  id: string;
  label: string;
  emoji: string;
  selected: boolean;
  count: number;
}

interface AdvancedFilter {
  id: string;
  label: string;
  icon: string;
  description: string;
  value: number;
  range: { min: number; max: number };
  unit: string;
}

interface Section {
  id: string;
  label: string;
  icon: string;
  count: number;
  description?: string;
  category?: string;
}

@Component({
  selector: 'app-configuration',
  imports: [CommonModule, FormsModule],
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.css'
})
export class ConfigurationComponent implements OnInit, AfterViewInit, OnDestroy {
  // Estado de la aplicación
  hasUnsavedChanges = false;
  unsavedChangesCount = 0;
  activeSection = 'privacy';
  lastSaved: Date | null = null;
  isLoading = false;
  searchQuery = '';
  filteredSections: Section[] = [];

  // Configuración del usuario - Expandida para más opciones
  settings = {
    privacy: {
      profileVisibility: true,
      locationSharing: false,
      activityStatus: true,
      searchIndexing: true,
      dataAnalytics: false,
      showEmail: false,
      showPhone: false,
      showLocation: true,
      profilePublic: true,
      allowMessages: true,
      allowFriendRequests: true,
      showOnlineStatus: true
    },
    notifications: {
      frequency: 'smart',
      quietHours: { enabled: false, start: '22:00', end: '08:00' },
      email: {
        matchUpdates: true,
        adoptionAlerts: true,
        communityMessages: true,
        weeklyDigest: true,
        promotional: false,
        securityAlerts: true,
        systemUpdates: false,
        adoptionRequests: true,
        newMessages: true,
        statusUpdates: true,
        newsletter: false
      },
      push: {
        newMatches: true,
        messages: true,
        reminders: true,
        securityAlerts: true,
        systemUpdates: true,
        nearbyPets: true,
        realTime: true,
        alerts: true
      }
    },
    adoption: {
      preferences: {
        distance: 50, // km
        ageRange: [0, 15] as [number, number],
        specificBreeds: false,
        specialNeeds: false,
        verifiedOnly: false,
        dogs: true,
        cats: true,
        others: false,
        seniors: false,
        autoFilters: true,
        nearbyNotifications: true
      },
      advancedFilters: {
        energyLevel: 3, // 1-5
        sizePreference: 3, // 1-5
        trainingLevel: 2, // 1-5
        goodWithKids: true,
        goodWithPets: true,
        apartmentFriendly: false
      }
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 60, // minutos
      loginAlerts: true,
      dataExport: true,
      suspiciousActivityAlerts: true,
      passwordChangeReminder: 90 // días
    },
    accessibility: {
      textSize: 'medium' as 'small' | 'medium' | 'large',
      highContrast: false,
      reduceMotion: false,
      darkMode: false,
      screenReader: false,
      fontSize: 'medium',
      animationSpeed: 'normal' as 'slow' | 'normal' | 'fast'
    }
  };

  // Secciones para navegación premium
  sections: Section[] = [
    {
      id: 'privacy',
      label: 'Privacidad',
      icon: 'visibility',
      count: 12,
      description: 'Control de visibilidad y datos personales',
      category: 'esencial'
    },
    {
      id: 'notifications',
      label: 'Notificaciones',
      icon: 'notifications',
      count: 16,
      description: 'Alertas y preferencias de comunicación',
      category: 'comunicación'
    },
    {
      id: 'adoption',
      label: 'Match Intelligence',
      icon: 'favorite',
      count: 20,
      description: 'Preferencias avanzadas de adopción',
      category: 'ai'
    },
    {
      id: 'security',
      label: 'Seguridad',
      icon: 'lock',
      count: 8,
      description: 'Protección de cuenta y datos',
      category: 'seguridad'
    },
    {
      id: 'accessibility',
      label: 'Accesibilidad',
      icon: 'accessibility',
      count: 8,
      description: 'Personalización de la experiencia',
      category: 'ux'
    }
  ];

  // Opciones para selectores premium
  notificationFrequencies: NotificationFrequency[] = [
    {
      value: 'realtime',
      label: 'Tiempo real',
      icon: 'flash_on',
      description: 'Notificaciones instantáneas para todo',
      recommendedFor: 'Usuarios activos',
      priority: 'alta'
    },
    {
      value: 'smart',
      label: 'Inteligente',
      icon: 'auto_awesome',
      description: 'Basado en tu actividad y prioridades',
      recommendedFor: 'La mayoría de usuarios',
      priority: 'media'
    },
    {
      value: 'daily',
      label: 'Resumen diario',
      icon: 'schedule',
      description: 'Un solo resumen al final del día',
      recommendedFor: 'Usuarios ocasionales',
      priority: 'baja'
    }
  ];

  // Datos premium para bindings
  privacyOptions: PrivacyOption[] = [
    {
      id: 'profilePublic',
      label: 'Perfil público',
      icon: 'public',
      description: 'Permite que otros usuarios vean tu perfil y mascotas',
      category: 'básica',
      recommended: true,
      enabled: true
    },
    {
      id: 'showEmail',
      label: 'Mostrar email',
      icon: 'mail',
      description: 'Tu email será visible para otros usuarios registrados',
      category: 'avanzada',
      recommended: false,
      enabled: false
    },
    {
      id: 'showPhone',
      label: 'Mostrar teléfono',
      icon: 'phone',
      description: 'Solo visible para adopciones en proceso',
      category: 'avanzada',
      recommended: false,
      enabled: false
    },
    {
      id: 'locationSharing',
      label: 'Compartir ubicación',
      icon: 'location_on',
      description: 'Muestra solo ciudad, no dirección exacta',
      category: 'básica',
      recommended: true,
      enabled: true
    },
    {
      id: 'activityStatus',
      label: 'Estado de actividad',
      icon: 'online_prediction',
      description: 'Muestra cuando estás activo en la plataforma',
      category: 'básica',
      recommended: true,
      enabled: true
    },
    {
      id: 'allowMessages',
      label: 'Permitir mensajes',
      icon: 'chat',
      description: 'Permite que otros usuarios te envíen mensajes',
      category: 'básica',
      recommended: true,
      enabled: true
    },
    {
      id: 'allowFriendRequests',
      label: 'Solicitudes de amistad',
      icon: 'person_add',
      description: 'Permite recibir solicitudes de conexión',
      category: 'avanzada',
      recommended: false,
      enabled: true
    },
    {
      id: 'searchIndexing',
      label: 'Índice en búsquedas',
      icon: 'search',
      description: 'Aparecer en resultados de búsqueda de la plataforma',
      category: 'básica',
      recommended: true,
      enabled: true
    }
  ];

  emailNotifications: NotificationSetting[] = [
    {
      id: 'matchUpdates',
      label: 'Actualizaciones de Match',
      icon: 'favorite',
      description: 'Nuevas coincidencias y compatibilidades',
      type: 'email',
      enabled: true
    },
    {
      id: 'adoptionAlerts',
      label: 'Alertas de adopción',
      icon: 'pets',
      description: 'Nuevos animales disponibles cerca de ti',
      type: 'email',
      enabled: true
    },
    {
      id: 'communityMessages',
      label: 'Mensajes de comunidad',
      icon: 'forum',
      description: 'Actualizaciones de grupos y foros que sigues',
      type: 'email',
      enabled: true
    },
    {
      id: 'weeklyDigest',
      label: 'Resumen semanal',
      icon: 'summarize',
      description: 'Compilación de tu actividad semanal',
      type: 'email',
      enabled: true
    },
    {
      id: 'securityAlerts',
      label: 'Alertas de seguridad',
      icon: 'security',
      description: 'Actividad sospechosa en tu cuenta',
      type: 'email',
      enabled: true
    }
  ];

  pushNotifications: NotificationSetting[] = [
    {
      id: 'newMatches',
      label: 'Nuevos matches',
      icon: 'favorite',
      description: 'Coincidencias en tiempo real',
      type: 'push',
      enabled: true
    },
    {
      id: 'messages',
      label: 'Mensajes',
      icon: 'chat',
      description: 'Mensajes nuevos de otros usuarios',
      type: 'push',
      enabled: true
    },
    {
      id: 'reminders',
      label: 'Recordatorios',
      icon: 'notifications_active',
      description: 'Recordatorios de citas y actividades',
      type: 'push',
      enabled: true
    },
    {
      id: 'nearbyPets',
      label: 'Mascotas cercanas',
      icon: 'location_on',
      description: 'Animales disponibles cerca de tu ubicación',
      type: 'push',
      enabled: true
    },
    {
      id: 'securityAlerts',
      label: 'Alertas de seguridad',
      icon: 'warning',
      description: 'Notificaciones críticas de seguridad',
      type: 'push',
      enabled: true
    }
  ];

  adoptionPreferences: AdoptionPreference[] = [
    {
      id: 'autoFilters',
      label: 'Filtros automáticos',
      icon: 'filter_alt',
      description: 'Aplicar filtros automáticos según tus preferencias',
      category: 'básica',
      aiRecommended: true,
      enabled: true
    },
    {
      id: 'nearbyNotifications',
      label: 'Notificaciones cercanas',
      icon: 'location_on',
      description: 'Alertas de animales disponibles en tu zona',
      category: 'básica',
      aiRecommended: true,
      enabled: true
    },
    {
      id: 'verifiedOnly',
      label: 'Solo verificados',
      icon: 'verified',
      description: 'Mostrar solo protectoras y usuarios verificados',
      category: 'avanzada',
      aiRecommended: false,
      enabled: false
    },
    {
      id: 'specificBreeds',
      label: 'Razas específicas',
      icon: 'tag',
      description: 'Priorizar razas específicas en tus resultados',
      category: 'avanzada',
      aiRecommended: false,
      enabled: false
    },
    {
      id: 'specialNeeds',
      label: 'Necesidades especiales',
      icon: 'accessibility_new',
      description: 'Incluir animales con necesidades especiales',
      category: 'avanzada',
      aiRecommended: false,
      enabled: false
    }
  ];

  petPreferences: PetPreference[] = [
    { id: 'dogs', label: 'Perros', emoji: '🐕', selected: true, count: 245 },
    { id: 'cats', label: 'Gatos', emoji: '🐱', selected: true, count: 189 },
    { id: 'others', label: 'Otros', emoji: '🐰', selected: false, count: 67 },
    { id: 'seniors', label: 'Senior', emoji: '👴', selected: false, count: 92 },
    { id: 'birds', label: 'Aves', emoji: '🦜', selected: false, count: 34 },
    { id: 'reptiles', label: 'Reptiles', emoji: '🦎', selected: false, count: 23 },
    { id: 'small', label: 'Pequeños', emoji: '🐹', selected: true, count: 156 },
    { id: 'large', label: 'Grandes', emoji: '🐺', selected: false, count: 89 }
  ];

  advancedFilters: AdvancedFilter[] = [
    {
      id: 'energyLevel',
      label: 'Nivel de energía',
      icon: 'bolt',
      description: 'Del tranquilo al hiperactivo',
      value: 3,
      range: { min: 1, max: 5 },
      unit: ''
    },
    {
      id: 'sizePreference',
      label: 'Tamaño preferido',
      icon: 'straighten',
      description: 'De pequeño a gigante',
      value: 3,
      range: { min: 1, max: 5 },
      unit: ''
    },
    {
      id: 'trainingLevel',
      label: 'Nivel de entrenamiento',
      icon: 'school',
      description: 'Del básico al avanzado',
      value: 2,
      range: { min: 1, max: 5 },
      unit: ''
    }
  ];

  textSizes = [
    { value: 'small', label: 'Pequeño' },
    { value: 'medium', label: 'Mediano' },
    { value: 'large', label: 'Grande' }
  ];

  // Observables para manejo de eventos
  private destroy$ = new Subject<void>();
  private settingsChange$ = new Subject<void>();

  @ViewChild('settingsContainer') settingsContainer!: ElementRef;

  constructor(private router: Router) {
    // Debounce para cambios en settings
    this.settingsChange$
      .pipe(
        debounceTime(500),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.calculateUnsavedChanges();
      });
  }

  ngOnInit(): void {
    this.loadUserSettings();
    this.initializeBindings();
    this.filteredSections = [...this.sections];
    this.setupIntersectionObserver();
  }

  ngAfterViewInit(): void {
    // Inicializar scroll spy después de que la vista esté lista
    setTimeout(() => {
      this.setupScrollSpy();
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga la configuración del usuario desde localStorage o API
   */
  loadUserSettings(): void {
    this.isLoading = true;

    try {
      const savedSettings = localStorage.getItem('pestme-user-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        this.settings = { ...this.settings, ...parsed.settings };
        this.lastSaved = new Date(parsed.lastSaved);
        this.updateAllBindings();
      }

      // También cargar desde API si es necesario
      this.loadFromApi();
    } catch (error) {
      console.error('Error cargando configuración:', error);
      this.showToast('Error cargando configuración', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Carga configuración desde API
   */
  private loadFromApi(): void {
    // Implementación para cargar desde API real
    // Por ahora, solo simulamos
    setTimeout(() => {
      console.log('Configuración cargada desde API');
    }, 1000);
  }

  /**
   * Inicializa todos los bindings entre UI y modelo
   */
  initializeBindings(): void {
    // Sincronizar privacyOptions con settings.privacy
    this.privacyOptions.forEach(option => {
      option.enabled = this.settings.privacy[option.id as keyof typeof this.settings.privacy] as boolean;
    });

    // Sincronizar emailNotifications
    this.emailNotifications.forEach(notif => {
      notif.enabled = this.settings.notifications.email[notif.id as keyof typeof this.settings.notifications.email] as boolean;
    });

    // Sincronizar pushNotifications
    this.pushNotifications.forEach(notif => {
      notif.enabled = this.settings.notifications.push[notif.id as keyof typeof this.settings.notifications.push] as boolean;
    });

    // Sincronizar adoptionPreferences
    this.adoptionPreferences.forEach(pref => {
      pref.enabled = this.settings.adoption.preferences[pref.id as keyof typeof this.settings.adoption.preferences] as boolean;
    });

    // Sincronizar petPreferences
    this.petPreferences.forEach(pet => {
      pet.selected = this.settings.adoption.preferences[pet.id as keyof typeof this.settings.adoption.preferences] as boolean;
    });
  }

  /**
   * Actualiza todos los bindings después de cargar settings
   */
  updateAllBindings(): void {
    this.initializeBindings();
    this.calculateUnsavedChanges();
  }

  /**
   * Configura Intersection Observer para scroll spy
   */
  setupIntersectionObserver(): void {
    if (!this.settingsContainer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.activeSection = entry.target.id;
          }
        });
      },
      {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0.1
      }
    );

    // Observar todas las secciones
    this.sections.forEach(section => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });
  }

  /**
   * Configura scroll spy tradicional (fallback)
   */
  setupScrollSpy(): void {
    window.addEventListener('scroll', () => {
      this.detectActiveSection();
    });
  }

  /**
   * Detecta la sección activa basada en scroll position
   */
  detectActiveSection(): void {
    const scrollPosition = window.scrollY + 100;
    let currentSection = 'privacy';

    this.sections.forEach(section => {
      const element = document.getElementById(section.id);
      if (element) {
        const offsetTop = element.offsetTop;
        const offsetHeight = element.offsetHeight;

        if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
          currentSection = section.id;
        }
      }
    });

    if (this.activeSection !== currentSection) {
      this.activeSection = currentSection;
    }
  }

  /**
   * Maneja cambios en cualquier configuración
   */
  onSettingChange(): void {
    this.settingsChange$.next();
  }

  /**
   * Calcula y actualiza el contador de cambios sin guardar
   */
  calculateUnsavedChanges(): void {
    // En una implementación real, compararías con los valores originales
    this.hasUnsavedChanges = true;
    this.unsavedChangesCount = Math.floor(Math.random() * 10) + 1; // Simulado
  }

  /**
   * Guarda la configuración premium
   */
  async saveSettings(): Promise<void> {
    if (!this.hasUnsavedChanges) return;

    this.isLoading = true;

    try {
      // Actualizar modelo desde bindings
      this.updateSettingsFromBindings();

      const saveData = {
        settings: this.settings,
        lastSaved: new Date().toISOString(),
        version: '2025.1.0'
      };

      // Guardar en localStorage
      localStorage.setItem('pestme-user-settings', JSON.stringify(saveData));

      // Simular guardado en API
      await this.saveToApi(saveData);

      this.hasUnsavedChanges = false;
      this.unsavedChangesCount = 0;
      this.lastSaved = new Date();

      this.showToast('Configuración guardada correctamente', 'success');
    } catch (error) {
      console.error('Error guardando configuración:', error);
      this.showToast('Error guardando configuración', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Actualiza el modelo de settings desde los bindings de la UI
   */
  private updateSettingsFromBindings(): void {
    // Actualizar privacy settings
    this.privacyOptions.forEach(option => {
      (this.settings.privacy as any)[option.id] = option.enabled;
    });

    // Actualizar email notifications
    this.emailNotifications.forEach(notif => {
      (this.settings.notifications.email as any)[notif.id] = notif.enabled;
    });

    // Actualizar push notifications
    this.pushNotifications.forEach(notif => {
      (this.settings.notifications.push as any)[notif.id] = notif.enabled;
    });

    // Actualizar adoption preferences
    this.adoptionPreferences.forEach(pref => {
      (this.settings.adoption.preferences as any)[pref.id] = pref.enabled;
    });

    // Actualizar pet preferences
    this.petPreferences.forEach(pet => {
      (this.settings.adoption.preferences as any)[pet.id] = pet.selected;
    });
  }

  /**
   * Guarda configuración en API
   */
  private async saveToApi(data: any): Promise<void> {
    // Simulación de API call
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Configuración guardada en API:', data);
        resolve();
      }, 1500);
    });
  }

  /**
   * Restaura los valores por defecto premium
   */
  resetToDefaults(): void {
    if (confirm('¿Restaurar todos los ajustes a sus valores premium por defecto? Esta acción no se puede deshacer.')) {
      const defaultSettings = {
        privacy: {
          profileVisibility: true,
          locationSharing: false,
          activityStatus: true,
          searchIndexing: true,
          dataAnalytics: false,
          showEmail: false,
          showPhone: false,
          showLocation: true,
          profilePublic: true,
          allowMessages: true,
          allowFriendRequests: true,
          showOnlineStatus: true
        },
        notifications: {
          frequency: 'smart',
          quietHours: { enabled: false, start: '22:00', end: '08:00' },
          email: {
            matchUpdates: true,
            adoptionAlerts: true,
            communityMessages: true,
            weeklyDigest: true,
            promotional: false,
            securityAlerts: true,
            systemUpdates: false
          },
          push: {
            newMatches: true,
            messages: true,
            reminders: true,
            securityAlerts: true,
            systemUpdates: true,
            nearbyPets: true
          }
        },
        adoption: {
          preferences: {
            distance: 50,
            ageRange: [0, 15] as [number, number],
            specificBreeds: false,
            specialNeeds: false,
            verifiedOnly: false,
            dogs: true,
            cats: true,
            others: false,
            seniors: false,
            autoFilters: true,
            nearbyNotifications: true
          },
          advancedFilters: {
            energyLevel: 3,
            sizePreference: 3,
            trainingLevel: 2,
            goodWithKids: true,
            goodWithPets: true,
            apartmentFriendly: false
          }
        },
        security: {
          twoFactorAuth: false,
          sessionTimeout: 60,
          loginAlerts: true,
          dataExport: true,
          suspiciousActivityAlerts: true,
          passwordChangeReminder: 90
        },
        accessibility: {
          textSize: 'medium',
          highContrast: false,
          reduceMotion: false,
          darkMode: false,
          screenReader: false,
          fontSize: 'medium',
          animationSpeed: 'normal'
        }
      };

      this.updateAllBindings();
      this.hasUnsavedChanges = true;

      this.showToast('Configuración premium restaurada', 'info');
    }
  }

  /**
   * Filtra secciones según búsqueda
   */
  filterSections(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value.toLowerCase();

    if (!this.searchQuery) {
      this.filteredSections = [...this.sections];
      return;
    }

    this.filteredSections = this.sections.filter(section =>
      section.label.toLowerCase().includes(this.searchQuery) ||
      section.description?.toLowerCase().includes(this.searchQuery) ||
      section.category?.toLowerCase().includes(this.searchQuery)
    );
  }

  /**
   * Calcula el porcentaje de configuración completada
   */
  getCompletionPercentage(): number {
    const totalOptions = 48; // Total de opciones configurables premium
    let enabledOptions = 0;

    // Contar opciones habilitadas
    enabledOptions += Object.values(this.settings.privacy).filter(v => v === true).length;
    enabledOptions += Object.values(this.settings.notifications.email).filter(v => v === true).length;
    enabledOptions += Object.values(this.settings.notifications.push).filter(v => v === true).length;
    enabledOptions += Object.values(this.settings.adoption.preferences).filter(v => v === true).length;
    enabledOptions += this.settings.security.twoFactorAuth ? 1 : 0;
    enabledOptions += this.settings.security.loginAlerts ? 1 : 0;

    return Math.round((enabledOptions / totalOptions) * 100);
  }

  /**
   * Activa todas las notificaciones premium
   */
  enableAllNotifications(): void {
    // Email notifications
    this.emailNotifications.forEach(notif => {
      notif.enabled = true;
      (this.settings.notifications.email as any)[notif.id] = true;
    });

    // Push notifications
    this.pushNotifications.forEach(notif => {
      notif.enabled = true;
      (this.settings.notifications.push as any)[notif.id] = true;
    });

    this.hasUnsavedChanges = true;
    this.showToast('Todas las notificaciones premium activadas', 'success');
  }

  /**
   * Establece máxima privacidad premium
   */
  setMaximumPrivacy(): void {
    this.privacyOptions.forEach(option => {
      if (option.id.includes('show') || option.id.includes('allow')) {
        option.enabled = false;
      }
    });

    this.settings.privacy.profilePublic = false;
    this.settings.privacy.showEmail = false;
    this.settings.privacy.showPhone = false;
    this.settings.privacy.allowMessages = false;
    this.settings.privacy.allowFriendRequests = false;

    this.hasUnsavedChanges = true;
    this.showToast('Máxima privacidad premium aplicada', 'success');
  }

  /**
   * Configuración óptima de adopción
   */
  setOptimalAdoptionSettings(): void {
    this.adoptionPreferences.forEach(pref => {
      if (pref.aiRecommended) {
        pref.enabled = true;
        (this.settings.adoption.preferences as any)[pref.id] = true;
      }
    });

    // Configurar mascotas más populares
    this.petPreferences.forEach(pet => {
      if (pet.id === 'dogs' || pet.id === 'cats') {
        pet.selected = true;
        (this.settings.adoption.preferences as any)[pet.id] = true;
      }
    });

    this.hasUnsavedChanges = true;
    this.showToast('Configuración óptima de adopción aplicada', 'success');
  }

  /**
   * Obtiene el valor de un filtro avanzado
   */
  getFilterValue(filter: AdvancedFilter): string {
    const labels = ['Mínimo', 'Bajo', 'Medio', 'Alto', 'Máximo'];
    return labels[filter.value - 1] || 'Medio';
  }

  /**
   * Obtiene icono de sección activa
   */
  getActiveTabIcon(): string {
    const section = this.sections.find(s => s.id === this.activeSection);
    return section?.icon || 'settings';
  }

  /**
   * Obtiene nombre de sección activa
   */
  getActiveTabName(): string {
    const section = this.sections.find(s => s.id === this.activeSection);
    return section?.label || 'Configuración';
  }

  /**
   * Obtiene conteo de sección activa
   */
  getActiveTabCount(): number {
    const section = this.sections.find(s => s.id === this.activeSection);
    return section?.count || 0;
  }

  /**
   * Navega a una sección específica
   */
  scrollToSection(sectionId: string): void {
    this.activeSection = sectionId;
    const element = document.getElementById(sectionId);

    if (element) {
      const headerOffset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  /**
   * Scroll al inicio de la página
   */
  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  /**
   * Muestra un toast de notificación premium
   */
  showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    // En producción, usarías un servicio de notificaciones con animaciones premium
    const colors = {
      success: 'bg-gradient-to-r from-green-500 to-emerald-500',
      error: 'bg-gradient-to-r from-red-500 to-pink-500',
      info: 'bg-gradient-to-r from-blue-500 to-cyan-500'
    };

    console.log(`[${type.toUpperCase()}] ${message}`);

    // Simulación de toast con estilo premium
    const toast = document.createElement('div');
    toast.className = `fixed top-24 right-8 z-50 px-6 py-4 rounded-2xl text-white font-semibold shadow-2xl ${colors[type]} animate-slideIn`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('animate-slideOut');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

  /**
   * Descarga los datos del usuario en formato premium
   */
  downloadData(): void {
    const data = {
      userData: this.settings,
      timestamp: new Date().toISOString(),
      format: 'pestme-export-v2025',
      version: 'premium',
      metadata: {
        sections: this.sections.length,
        preferences: this.getCompletionPercentage(),
        lastBackup: this.lastSaved
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pestme-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    this.showToast('Backup premium descargado correctamente', 'success');
  }

  /**
   * Shortcuts de teclado premium
   */
  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcuts(event: KeyboardEvent): void {
    // Ctrl/Cmd + S para guardar
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      this.saveSettings();
    }

    // Ctrl/Cmd + D para defaults
    if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
      event.preventDefault();
      this.resetToDefaults();
    }

    // Ctrl/Cmd + F para buscar
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
      event.preventDefault();
      const searchInput = document.querySelector('input[placeholder*="Buscar"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }

    // Números 1-5 para navegar secciones
    if (event.key >= '1' && event.key <= '5') {
      const index = parseInt(event.key) - 1;
      if (this.sections[index]) {
        event.preventDefault();
        this.scrollToSection(this.sections[index].id);
      }
    }
  }

  /**
   * Prevenir navegación si hay cambios sin guardar
   */
  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.hasUnsavedChanges) {
      event.preventDefault();
      event.returnValue = '⚠️ Tienes cambios premium sin guardar. ¿Seguro que quieres salir?';
    }
  }
}
