import { Component } from '@angular/core';
import { NadvarComponent } from "../layouts/nadvar/nadvar.component";
import { FooterComponent } from "../layouts/footer/footer.component";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-pages',
  imports: [NadvarComponent, RouterOutlet, FooterComponent],
  templateUrl: './pages.component.html',
  styleUrl: './pages.component.css'
})
export class PagesComponent {

}
