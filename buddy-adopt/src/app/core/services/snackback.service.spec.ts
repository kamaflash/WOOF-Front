import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SnackbackService } from './snackback.service';

fdescribe('SnackbackService', () => {
  let service: SnackbackService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SnackbackService],
    });
    service = TestBed.inject(SnackbackService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit snackbar state on show', fakeAsync(() => {
    let state: any;
    service.snackbarState$.subscribe(s => (state = s));

    service.show('Test message', 'success', 3000);

    // Inmediatamente después de llamar a show
    expect(state).toEqual({ message: 'Test message', type: 'success', show: true });

    // Avanzar el tiempo 3000ms
    tick(3000);

    // Después de timeout, el snackbar se oculta
    expect(state).toEqual({ message: '', type: 'success', show: false });
  }));

  it('should default type to info', fakeAsync(() => {
    let state: any;
    service.snackbarState$.subscribe(s => (state = s));

    service.show('Default type test');

    expect(state).toEqual({ message: 'Default type test', type: 'info', show: true });

    tick(3000);

    expect(state).toEqual({ message: '', type: 'info', show: false });
  }));

  it('should handle custom duration', fakeAsync(() => {
    let state: any;
    service.snackbarState$.subscribe(s => (state = s));

    service.show('Custom duration', 'error', 5000);

    expect(state.show).toBeTrue();
    tick(4999);
    expect(state.show).toBeTrue(); // aún visible
    tick(1);
    expect(state.show).toBeFalse(); // se oculta
  }));
});
