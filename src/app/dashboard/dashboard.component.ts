import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SidemenuComponent } from "../shared/sidemenu/sidemenu.component";
import { RouterModule } from '@angular/router';
import { NavbarComponent } from "../shared/navbar/navbar.component";

@Component({
  standalone: true,
  imports: [RouterModule, SidemenuComponent, NavbarComponent],
  templateUrl: './dashboard.component.html',
  styles: ``
})
export default class DashboardComponent {

}
