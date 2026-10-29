import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CarModel } from '../../app/models/car-model';
import { UserModel } from '../../app/models/user-model';

@Component({
  selector: 'app-custom-details',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './custom-details.html',
  styleUrl: './custom-details.css',
})
export class CustomDetails {
  @Input() user: UserModel | null = null;
  @Input() car: CarModel | null = null;

  @Output() close = new EventEmitter<void>();
}
