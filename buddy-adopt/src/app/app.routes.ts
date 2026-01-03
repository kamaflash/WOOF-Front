import { Routes } from '@angular/router';
import { PagesComponent } from './pages/pages.component';
import { IndexComponent } from './pages/index/index.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { DetailsPetsComponent } from './pages/details-pets/details-pets.component';
import { UseradminComponent } from './pages/useradmin/useradmin.component';
import { AddComponent } from './pages/useradmin/add/add.component';
import { MatchComponent } from './pages/match/match.component';
import { AnimaladminComponent } from './pages/animaladmin/animaladmin.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { RegisterConfirmComponent } from './pages/auth/register-confirm/register-confirm.component';
import { AdoptionInfoComponent } from './pages/adoption-info/adoption-info.component';
import { SheltterComponent } from './pages/sheltter/sheltter.component';
import { NoUserComponent } from './pages/auth/no-user/no-user.component';

export const routes: Routes = [
  {
    path: 'index',
    component: PagesComponent,
    children: [
      { path: '', component: IndexComponent, data: { title: 'Dashboard' } },
    ],
  },
  {
    path: 'match',
    component: PagesComponent,
    children: [
      { path: '', component: MatchComponent, data: { title: 'Dashboard' } },
    ],
  },
  {
    path: 'details/:id',
    component: PagesComponent,
    children: [
      { path: '', component: DetailsPetsComponent, data: { title: 'Dashboard' } },
    ],
  },
  {
    path: 'admin-animals/:id',
    component: PagesComponent,
    children: [
      { path: '', component: AnimaladminComponent, data: { title: 'Dashboard' } },
    ],
  },
  {
    path: 'admin',
    component: PagesComponent,
    children: [
      { path: '', component: UseradminComponent, data: { title: 'Dashboard' } },
    ],
  },
  {
    path: 'sheltter',
    component: PagesComponent,
    children: [
      { path: '', component: SheltterComponent, data: { title: 'Dashboard' } },
    ],
  },

  {
    path: 'notUser',
    component: PagesComponent,
    children: [
      { path: '', component: NoUserComponent, data: { title: 'Dashboard' } },
    ],
  },
  {
    path: 'forms/:id',
    component: PagesComponent,
    children: [
      { path: '', component: AddComponent, data: { title: 'Dashboard' } },
    ],
  },
  {
    path: 'adopt',
    component: PagesComponent,
    children: [
      { path: '', component: AdoptionInfoComponent, data: { title: 'Dashboard' } },
    ],
  },
  {
    path: 'login',
    component: LoginComponent,

  },

  {
    path: 'register',
    component: RegisterComponent,

  },
  {
    path: 'confirm-registration',
    component: RegisterConfirmComponent,

  },
  { path: '', redirectTo: '/index', pathMatch: 'full' },
];
