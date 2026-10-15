import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { CARS } from '../car/car-data';

@Component({
  selector: 'app-car-list',
  imports: [MatButtonModule, MatCardModule, RouterLink],
  templateUrl: './car-list.html',
  styleUrl: './car-list.css',
})
export class CarList {
  protected readonly cars = CARS;
}
