import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-preload',
  imports: [CommonModule],
  templateUrl: './preload.component.html',
  styleUrl: './preload.component.css'
})
export class PreloadComponent {
@Input() spinner: boolean = false;
}
