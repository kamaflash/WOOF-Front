import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-slide',
  imports: [CommonModule],
  templateUrl: './slide.component.html',
  styleUrl: './slide.component.css'
})
export class SlideComponent {
  @Input() viewMode: string = 'table';

  @Output() viewEmitter = new EventEmitter<any>();


toggleView(mode: 'table' | 'card') {
    this.viewMode = mode;
   this.viewEmitter.emit(mode)
  }
}
