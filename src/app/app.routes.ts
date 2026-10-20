import { Routes } from '@angular/router';
import { Home } from '../Pages/home/home';
import { CarList } from '../Pages/car-list/car-list';
import { Car } from '../Pages/car/car';
import { NotFound } from '../Pages/not-found/not-found';
import { Login } from '../Pages/Auth/login/login';
import { Register } from '../Pages/Auth/register/register';
import { Contact } from '../Pages/contact/contact';
import { NoticeLegal } from '../Pages/notice-legal/notice-legal';
import { SalesConditions } from '../Pages/sales-conditions/sales-conditions';
import { CustomerPanel } from '../Pages/Dashboard/customer-panel/customer-panel';

export const routes: Routes = [
  {path: '', component: Home},
  {path: 'home', component: Home},
  {path: 'shop-car', component: CarList},
  {path: 'car/:id', component: Car},
  {path: 'login', component: Login},
  {path: 'register', component: Register},
  {path: 'contact', component: Contact},
  {path:'notice-legal', component:NoticeLegal },
  {path: 'sales-conditions', component:SalesConditions },
  {path: 'customer-panel', component: CustomerPanel},
  {path: '**', component: NotFound},
];
