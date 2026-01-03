import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DialogComponent } from "../../../shared/dialog/dialog.component";
import { CommonModule } from '@angular/common';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-no-user',
  imports: [DialogComponent, CommonModule, RouterLink],
  templateUrl: './no-user.component.html',
  styleUrl: './no-user.component.css'
})
export class NoUserComponent  implements OnChanges{

  @Input() showDialog: boolean = false;
  ngOnChanges(changes: SimpleChanges): void {
    if(changes['showDialog'] && !changes['showDialog']?.firstChange )
    this.showDialog = true;
  }
}
