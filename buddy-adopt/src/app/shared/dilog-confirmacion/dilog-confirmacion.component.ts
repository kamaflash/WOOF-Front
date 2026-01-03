import { Component } from '@angular/core';
import { Input } from '@angular/core';
@Component({
  selector: 'app-dilog-confirmacion',
  imports: [],
  templateUrl: './dilog-confirmacion.component.html',
  styleUrl: './dilog-confirmacion.component.css'
})
export class DilogConfirmacionComponent {
@Input() title: string = '';
@Input() message: string = '';
}
