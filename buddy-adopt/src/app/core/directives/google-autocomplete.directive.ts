import { Directive, ElementRef, EventEmitter, Output, AfterViewInit } from '@angular/core';
import { GoogleMapsLoaderService } from '../services/google-maps-loader.service';

@Directive({
  selector: '[googleAutocomplete]',
  standalone: true
})
export class GoogleAutocompleteDirective implements AfterViewInit {

  @Output() placeSelected = new EventEmitter<any>();

  constructor(
    private el: ElementRef,
    private loader: GoogleMapsLoaderService
  ) {}

  async ngAfterViewInit() {
    await this.loader.load();

    const auto = document.createElement('gmpx-place-autocomplete');
    auto.innerHTML = this.el.nativeElement.value;
    auto.setAttribute('placeholder', this.el.nativeElement.placeholder);

    auto.addEventListener('gmpx-placechange', (e: any) => {
      this.placeSelected.emit(e.target.value);
    });

    this.el.nativeElement.parentNode.insertBefore(auto, this.el.nativeElement);
    this.el.nativeElement.style.display = 'none'; // Oculta tu input original
  }
}
