import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css'],
  imports: [CommonModule],

})
export class DialogComponent implements OnChanges{

  @Input() title = 'Confirmar acción';
  @Input() submitDisabled = true;
  @Input() buttonRechazo = false;
  @Input() buttonClosed = true;
  // 🔹 Nuevos inputs para tamaño
  @Input() width: string = '90vw';
  @Input() height: string = 'auto';
  @Input() maxHeight: string = '90vh';
  @Input() button: boolean = true;
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
  @Output() rechazarEmitter = new EventEmitter<void>();
  spinner:boolean=false;
  spinnerRechazo:boolean=false;

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['submitDisabled']?.currentValue)
    this.submitDisabled = changes['submitDisabled']?.currentValue;
  if(changes['buttonClosed']?.currentValue)
    this.buttonClosed = changes['buttonClosed']?.currentValue;
  }

  closeDialog() {
    this.close.emit();
  }

  rechazarDialog() {
    this.spinnerRechazo=true;
    this.rechazarEmitter.emit();
  }
  confirmDialog() {
    this.spinner=true;
    this.confirm.emit();
  }
}
