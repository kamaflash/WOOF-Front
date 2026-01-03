import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { environment } from '../../../../enviroments/environment';
import { User } from '../../../core/models/user';
import { UserService } from '../../../core/services/users/users.service';
import { BaseServiceService } from '../../../core/services/base-service.service';

import { PreloadComponent } from '../../../shared/preload/preload.component';
import { TableComponent, TableColumn, TableAction } from '../../../shared/table/table.component';

const endpoint: string = environment.baseUrlSpring;
const url: string = `${endpoint}match`;

@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [CommonModule, PreloadComponent, TableComponent],
  templateUrl: './match-list.component.html',
  styleUrl: './match-list.component.css'
})
export class MatchListComponent implements OnInit {

  userLogin!: User;
  matches: any[] = [];
  spinner = false;

  // ✅ Configuración de tabla
  tableColumns: TableColumn[] = [
    {
      key: 'pet',
      label: 'Mascota',
      sortable: true,
      filterable: false,
      imageField: 'pet.images',
      textField: 'pet.name',
      imageAlt: 'Mascota'
    },
    {
      key: 'createdAt',
      label: 'Fecha',
      sortable: true,
      filterable: false
    }
  ];

  tableActions: TableAction[] = [
    {
      name: 'contact',
      label: 'Contactar',
      icon: 'mail',
      color: 'orange-500'
    }
  ];

  matchFilters = [
    { label: 'Like', value: 'Enviado' },
    { label: 'Match', value: 'Aceptado' }
  ];

  constructor(
    private userService: UserService,
    private baseService: BaseServiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userLogin = this.userService.user
      ?? JSON.parse(sessionStorage.getItem('us')!);

    this.getMatch();
  }

  // ✅ Obtener matches
  getMatch(): void {
    this.spinner = true;
    const urlMatch = `${url}/user/${this.userLogin.id}`;

    this.baseService.getItems(urlMatch).subscribe({
      next: (data: any) => {
        this.matches = data.matchs ?? [];
      },
      error: err => {
        console.error('Error cargando matches', err);
        this.spinner = false;
      },
      complete: () => this.spinner = false
    });
  }

  // ✅ Acción desde la tabla
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

  // ✅ FAB
  goToSwipe(): void {
    this.router.navigate(['/swipe']);
  }
}
