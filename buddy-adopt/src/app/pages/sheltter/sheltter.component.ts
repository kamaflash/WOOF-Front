import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

import { environment } from '../../../enviroments/environment';
import { BaseServiceService } from '../../core/services/base-service.service';
import { UserService } from '../../core/services/users/users.service';
import { User } from '../../core/models/user';

import { PreloadComponent } from '../../shared/preload/preload.component';
import {
  TableComponent,
  TableColumn,
  TableAction,
} from '../../shared/table/table.component';

const endpoint = environment.baseUrlSpring;
const url = `${endpoint}users`;

@Component({
  selector: 'app-sheltter',
  standalone: true,
  imports: [CommonModule, PreloadComponent, TableComponent],
  templateUrl: './sheltter.component.html',
  styleUrl: './sheltter.component.css',
})
export class SheltterComponent implements OnInit, OnDestroy {
  @Input() administration = false;

  // ─────────────── Estado ───────────────
  userLogin: User | null = null;
  spinner = true;
  spinnerMini = false;

  // ─────────────── Datos ───────────────
  dataSource: any[] = [];

  page = 0;
  totalPage = 1;
  hasNext = true;

  private destroy$ = new Subject<void>();

  // ─────────────── Configuración de tabla ───────────────
  tableColumns: TableColumn[] = [
    {
      key: 'pet',
      label: 'Mascota',
      sortable: true,
      imageField: 'avatarUrl',
      textField: 'username',
      imageAlt: 'avatarUrl',
    },
    {
      key: 'email',
      label: 'Email',
      icon: 'mail',
      width: '200px',
      render: (item: any) => item.email ||  'Sin email'
    },

    {
      key: 'address',
      label: 'Dirección',
      icon: 'location_on',
      width: '200px',
      render: (item: any) => item.address ||  'Sin email'
    },
  ];

  tableActions: TableAction[] = [
    {
      name: 'view',
      label: 'Ver',
      icon: 'visibility',
      color: 'blue-500'
    },
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
    private baseService: BaseServiceService,
    private userService: UserService,
    private router: Router
  ) {}

  // ─────────────── Lifecycle ───────────────
  ngOnInit(): void {
    this.userLogin = this.userService.user;

    if (!this.userLogin) {
      this.spinner = false;
      return;
    }

    this.getDataMorePets();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─────────────── Data ───────────────
  getDataMorePets(): void {
    if (this.spinnerMini || !this.hasNext || this.page >= this.totalPage) {
      return;
    }

    const urlId = `${url}/shelter/${this.userLogin?.id}?page=${this.page}`;
    this.spinnerMini = true;

    this.baseService.getItems(urlId).subscribe({
      next: (resp: any) => {
        const shelters = resp?.shelter ?? [];
        this.dataSource.push(...shelters);

        this.page++;
        this.totalPage = resp.totalPages ?? this.totalPage;
        this.hasNext = resp.hasNext ?? false;
      },
      error: (err) => {
        console.error('Error al obtener shelters:', err);
      },
      complete: () => {
        this.spinner = false;
        this.spinnerMini = false;
      },
    });
  }

  // ─────────────── Table Events ───────────────
  onTableAction(event: { action: string; item: any }): void {
    if (event.action === 'contact') {
      console.log('Contactar:', event.item);
    }
  }

  onRowClick(item: any): void {
    if (item?.id) {
      this.router.navigate([`profile/${item.id}`]);
    }
  }
}
