import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-snackback',
  imports: [CommonModule],
  templateUrl: './snackback.component.html',
  styleUrl: './snackback.component.css',
})
export class SnackbackComponent {
  @Input() message = '';
  @Input() show = false;
  @Input() type: 'success' | 'error' | 'info' = 'info';
}
