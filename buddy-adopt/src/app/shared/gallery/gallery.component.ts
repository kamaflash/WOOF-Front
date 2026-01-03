
import { Component, EventEmitter, HostListener, inject, Input, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from '../../../enviroments/environment';
import { User } from '../../core/models/user';
import { BaseServiceService } from '../../core/services/base-service.service';
import { UserService } from '../../core/services/users/users.service';
import { Utils } from '../../core/utils';
const endpoint: any = environment.baseUrl;

@Component({
  selector: 'app-gallery',
  imports: [CommonModule,RouterModule ],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
})
export class GalleryComponent implements OnInit {
  user: User | null = null;
  private userSubscription!: Subscription;
  spinner: boolean = false;

  @Input() dataSource: any = [];
  @Input() tipe: any = null;
  @Input() administration: boolean = false;
  @Output() newItem = new EventEmitter<any>();
  @Output() onClickEmitter = new EventEmitter<any>();
  @Output() scrollEmitter = new EventEmitter<any>();
  constructor(
    public baseService: BaseServiceService,
    private userService: UserService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.spinner = true;

    // Suscribirse a los cambios de usuario
    this.userSubscription = this.userService.userChange.subscribe((user) => {
      this.user = user;
    });
    // Inicializar con el usuario almacenado en el servicio
    this.user = this.userService.user;
    console.table(this.dataSource)
  }

  getUrl(id:any, tipe?:string) {
    //  if(tipe==='protec') {
    //   this.router.navigate(['/profile/'+id])
    // } else {
    //   this.router.navigate(['/details/'+id])
    // }
    this.onClickEmitter.emit(id);

  }
bgColorIconForAdoptationAt(adoptationAt:any) {
      return Utils.getDaysBetweenDates(new Date(adoptationAt),new Date())
    }
newEmitter() {
  this.newItem.emit();
}
getPetImage(pet: any): string {
  // Orden de prioridad para obtener la imagen:

  // 1. Si existe pet.img y tiene elementos
  if (pet?.img && pet.img.length > 0 && pet.img[0]) {
    return pet.img[0];
  }

  // 2. Si existe pet.petdto con imágenes
  if (pet?.petdto && pet.petdto.length > 0 && pet.petdto[0]?.images && pet.petdto[0].images.length > 0) {
    return pet.petdto[0].images[0];
  }

  // 3. Si existe pet.image
  if (pet?.images && pet.images.length > 0 && pet.images[0]) {
    return pet.images[0];
  }

  // 4. Imagen por defecto
  return 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&h=800&fit=crop&crop=center';
}

onImageError(event: Event) {
  const img = event.target as HTMLImageElement;
  img.src = 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&h=800&fit=crop&crop=center';
}

@HostListener('window:scroll', [])
onWindowScroll(): void {
  const threshold = 150; // px antes del final
  const position =
    window.innerHeight + window.scrollY;
  const height =
    document.documentElement.scrollHeight;

  if (height - position <= threshold ) {
    this.scrollEmitter.emit(true)
  }
}
}
