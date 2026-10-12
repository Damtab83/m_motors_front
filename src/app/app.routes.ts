import { Routes } from '@angular/router';
import { Home } from '../Pages/home/home';
import { Car } from '../Pages/car/car';
import { NotFound } from '../Pages/not-found/not-found';

export const routes: Routes = [
  {path: '', component: Home},
  {path: 'home', component: Home},
  {path: 'car', component: Car},
  {path: '**', component: NotFound},
];
