import { TestBed } from '@angular/core/testing';
import { GoogleMapsLoaderService } from './google-maps-loader.service';

fdescribe('GoogleMapsLoaderService', () => {
  let service: GoogleMapsLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GoogleMapsLoaderService],
    });

    service = TestBed.inject(GoogleMapsLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load Google Maps scripts', async () => {
  const appendChildSpy = spyOn(document.head, 'appendChild').and.callFake((el: any) => {
    // Simular onload inmediato para el segundo script
    if (el.onload) {
      el.onload(); // dispara el resolve de la promesa
    }
    return el;
  });

  await service.load();

  expect(appendChildSpy).toHaveBeenCalledTimes(2);

  const script1 = appendChildSpy.calls.argsFor(0)[0] as HTMLScriptElement;
  const script2 = appendChildSpy.calls.argsFor(1)[0] as HTMLScriptElement;

  expect(script1.src).toContain('https://maps.googleapis.com/maps/api/js');
  expect(script2.src).toContain('https://unpkg.com/@googlemaps/extended-component-library');
});

  it('should resolve immediately if already loaded', async () => {
    // Simular que ya se cargó
    (service as any).loaded = true;

    const appendChildSpy = spyOn(document.head, 'appendChild').and.callThrough();

    await service.load();

    expect(appendChildSpy).not.toHaveBeenCalled();
  });
});
