import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-requestadd',
  imports: [CommonModule, FormsModule],
  templateUrl: './requestadd.component.html',
  styleUrls: ['./requestadd.component.css']
})
export class RequestaddComponent implements OnChanges {
  @Input() req: any;
  @Input() userLogin: any;
  @Output() disableButton = new EventEmitter<any>();
  @Output() approve = new EventEmitter<void>();
  @Output() reject = new EventEmitter<void>();
  @Output() scheduleInterviewEmitter = new EventEmitter<void>();

  private readonly statesOrder = [
    'Enviado',
    'Evaluación',
    'En revisión',
    'Aceptada',
    'Rechazada',
    'Pendiente entrega',
    'Finalizado',
    'Finalizada'
  ];

  constructor(private router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log('Cambios en la solicitud:', changes);

    if (this.req?.proUid === this.userLogin?.id && this.req?.status === 'Pendiente') {
      this.disableButton.emit(false);
    } else {
      this.disableButton.emit(true);
    }
  }

  // =================== MÉTODOS DE TIEMPO ===================
  getDaysPassed(): number {
    if (!this.req?.createdAt) return 0;

    const createdDate = new Date(this.req.createdAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  // =================== MÉTODOS DEL TIMELINE ===================
  getStepClass(state: string): string {
    const currentState = this.req?.status;
    if (!currentState) return 'bg-gray-100 border-gray-300 text-gray-400';

    const currentIndex = this.statesOrder.indexOf(currentState);
    const stateIndex = this.statesOrder.indexOf(state);

    if (stateIndex === -1) {
      return 'bg-gray-100 border-gray-300 text-gray-400';
    }

    // Estado completado
    if (stateIndex < currentIndex ||
        (state === 'Aceptada' && (currentState === 'Pendiente entrega' || currentState === 'Finalizado' || currentState === 'Finalizada')) ||
        (state === 'Evaluación' && currentState !== 'Enviado') ||
        (state === 'En revisión' && currentIndex > 2)) {

      if (state === 'Rechazada' && currentState === 'Rechazada') {
        return 'bg-red-100 border-red-500 text-red-600';
      }

      if (currentState === 'Rechazada' && state === 'Aceptada') {
        return 'bg-gray-100 border-gray-300 text-gray-400';
      }

      return 'bg-emerald-100 border-emerald-500 text-emerald-600';
    }

    // Estado actual
    if (state === currentState ||
        (state === 'Aceptada' && currentState === 'Aceptada') ||
        (state === 'Rechazada' && currentState === 'Rechazada')) {

      if (state === 'Rechazada' || currentState === 'Rechazada') {
        return 'bg-red-100 border-red-500 text-red-600';
      }

      return 'bg-orange-100 border-orange-500 text-orange-600';
    }

    // Estado pendiente
    return 'bg-gray-100 border-gray-300 text-gray-400';
  }

  getStepTextClass(state: string): string {
    const currentState = this.req?.status;
    if (!currentState) return 'text-gray-500';

    const currentIndex = this.statesOrder.indexOf(currentState);
    const stateIndex = this.statesOrder.indexOf(state);

    if (stateIndex === -1) return 'text-gray-500';

    // Estado completado
    if (stateIndex < currentIndex ||
        (state === 'Aceptada' && (currentState === 'Pendiente entrega' || currentState === 'Finalizado' || currentState === 'Finalizada')) ||
        (state === 'Evaluación' && currentState !== 'Enviado') ||
        (state === 'En revisión' && currentIndex > 2)) {

      if (currentState === 'Rechazada' && state === 'Aceptada') {
        return 'text-gray-500';
      }

      return 'text-emerald-600 font-semibold';
    }

    // Estado actual
    if (state === currentState ||
        (state === 'Aceptada' && currentState === 'Aceptada') ||
        (state === 'Rechazada' && currentState === 'Rechazada')) {

      if (state === 'Rechazada' || currentState === 'Rechazada') {
        return 'text-red-600 font-semibold';
      }

      return 'text-orange-600 font-semibold';
    }

    return 'text-gray-500';
  }

  getStepIconClass(state: string): string {
    const stepClass = this.getStepClass(state);

    if (stepClass.includes('text-emerald-600')) {
      return 'text-emerald-600';
    }

    if (stepClass.includes('text-orange-600')) {
      return 'text-orange-600';
    }

    if (stepClass.includes('text-red-600')) {
      return 'text-red-600';
    }

    return 'text-gray-400';
  }

  getProgressBarClass(): string {
    const status = this.req?.status;
    if (!status) return 'bg-gradient-to-r from-blue-500 to-gray-300';

    if (status === 'Rechazada') {
      return 'bg-gradient-to-r from-blue-500 via-purple-500 to-red-500';
    }

    if (status === 'Finalizado' || status === 'Finalizada') {
      return 'bg-gradient-to-r from-blue-500 to-emerald-500';
    }

    return 'bg-gradient-to-r from-blue-500 to-orange-500';
  }

  getProgressWidth(): number {
    const currentState = this.req?.status;
    if (!currentState) return 0;

    const widthMap: { [key: string]: number } = {
      'Enviado': 5,
      'Evaluación': 23,
      'En revisión': 40,
      'Aceptada': 60,
      'Rechazada': 60,
      'Pendiente entrega': 78,
      'Finalizado': 100,
    };

    return widthMap[currentState] || 0;
  }

  getStatusBadgeClass(): string {
    const status = this.req?.status;
    if (!status) return 'bg-gray-100 text-gray-800';

    return  'bg-gray-100 text-gray-800';
  }

  // =================== MÉTODOS DE FECHAS ===================
  getEvaluationDate(): Date | null {
    if (!this.req?.updateAt || this.req.status === 'Enviado') {
      return null;
    }
    return new Date(this.req.updateAt);
  }

  getReviewDate(): Date | null {
    const status = this.req?.status;
    if (!this.req?.updateAt || !status) return null;

    if (status === 'En revisión' ||
        status === 'Aceptada' ||
        status === 'Rechazada' ||
        status === 'Pendiente entrega' ||
        status === 'Finalizado' ||
        status === 'Finalizada') {
      return new Date(this.req.updateAt);
    }
    return null;
  }

  getApprovalDate(): Date | null {
    const status = this.req?.status;
    if (!this.req?.updateAt || !status) return null;

    if (status === 'Aceptada' ||
        status === 'Rechazada' ||
        status === 'Pendiente entrega' ||
        status === 'Finalizado' ||
        status === 'Finalizada') {
      return new Date(this.req.updateAt);
    }
    return null;
  }

  getPendingDeliveryDate(): Date | null {
    const status = this.req?.status;
    if (!this.req?.updateAt || !status) return null;

    if (status === 'Pendiente entrega' ||
        status === 'Finalizado' ||
        status === 'Finalizada') {
      return new Date(this.req.updateAt);
    }
    return null;
  }

  // =================== MÉTODOS DE MASCOTA ===================
  getPetStatusClass(): string {
    const status = this.req?.petdto?.[0]?.status;
    if (!status) return 'bg-gray-100 text-gray-800';

    return 'bg-gray-100 text-gray-800';
  }

  // =================== MÉTODOS DEL FORMULARIO ===================
  getTotalAnswersLength(): number {
    if (!this.req?.answers) return 0;

    return this.req.answers.reduce((total: number, answer: string) => {
      return total + (answer?.length || 0);
    }, 0);
  }

  countWords(text: string): number {
    if (!text) return 0;

    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  // =================== MÉTODOS DE ACCIÓN ===================
  contactUser(): void {
    if (this.req?.userdto?.[0]?.email) {
      window.location.href = `mailto:${this.req.userdto[0].email}`;
    }
  }

  viewPetProfile(): void {
    if (this.req?.petdto?.[0]?.id) {
      this.router.navigate(['/mascota', this.req.petdto[0].id]);
    }
  }

  canApprove(): boolean {
    const status = this.req?.status;
    const isOwner = this.req?.proUid === this.userLogin?.id;

    return isOwner && (status === 'Enviado' || status === 'En revisión' || status === 'Evaluación');
  }

  canReject(): boolean {
    const status = this.req?.status;
    const isOwner = this.req?.proUid === this.userLogin?.id;

    return isOwner && (status === 'Enviado' || status === 'En revisión' || status === 'Evaluación');
  }

  canScheduleInterview(): boolean {
    const status = this.req?.status;
    const isOwner = this.req?.proUid === this.userLogin?.id;

    return isOwner && (status === 'Enviado' || status === 'Evaluación');
  }


}
