import { BaseServiceService } from './../services/base-service.service';
import { Utils } from './../utils';
import { HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserService } from '../services/users/users.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private userService: UserService, private router: Router, private baseService:BaseServiceService ){}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot){
    return this.userService.validateToken()
    .pipe(
      tap( estaAuthentic => {
        if (!estaAuthentic){
          sessionStorage.clear()
          this.userService.user = null
          this.router.navigateByUrl('/')
        } else {
            // Utils.reloadUser(this.baseService, this.userService)
        }
      })
    );
  }

}
