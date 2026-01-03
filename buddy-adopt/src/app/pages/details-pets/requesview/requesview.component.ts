import { BaseServiceService } from './../../../core/services/base-service.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit , Input, SimpleChanges, OnChanges, Output, EventEmitter} from '@angular/core';
import { environment } from '../../../../enviroments/environment';

const endpoint: any = environment.baseUrlSpring;
const url: any = `${endpoint}request`;
@Component({
  selector: 'app-requesview',
  imports: [CommonModule],
  templateUrl: './requesview.component.html',
  styleUrl: './requesview.component.css'
})
export class RequesviewComponent implements OnChanges {

  @Input() animal: any ; // Recibe las solicitudes como un array
  @Input() userLogin: any; // Recibe el usuario logueado
  @Output() viewEmitter = new EventEmitter<any>();
  @Output() sendRequestEmitter = new EventEmitter<any>();
  requests:any[] = []; // Array para almacenar las solicitudes
  constructor(private baseService: BaseServiceService) { };


ngOnChanges(changes: SimpleChanges): void {
    if (changes['animal'] && this.animal) {
      this.getRequests();
    }
  }
  getRequests() {

    this.baseService.getItems(`${url}/petId/${this.animal.id}`).subscribe({
      next: (resp: any) => {
        this.requests = resp || [];
        this.sendRequestEmitter.emit(this.requests);
      },
      error: (err) => {
        console.error('Error al cargar las solicitudes:', err);
      }
    });
  }

  sendViewEmitter(request: any) {
    this.viewEmitter.emit(request);
  }
}
