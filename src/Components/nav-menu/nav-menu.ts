import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {MatSlideToggle} from '@angular/material/slide-toggle';

@Component({
  selector: 'app-nav-menu',
  standalone: true,
  imports: [MatSlideToggle, MatIconModule],
  templateUrl: './nav-menu.html',
  styleUrl: './nav-menu.css',
})
export class NavMenu {}
