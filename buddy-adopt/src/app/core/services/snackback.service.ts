import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SnackbackService {

   private snackbarState = new BehaviorSubject<{ message: string; type: string; show: boolean }>({
    message: '',
    type: 'info',
    show: false,
  });

  snackbarState$ = this.snackbarState.asObservable();

  show(message: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000) {
    this.snackbarState.next({ message, type, show: true });

    setTimeout(() => {
      this.snackbarState.next({ message: '', type, show: false });
    }, duration);
  }
}
