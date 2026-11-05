import type { OrderCarModel } from './orderCar-model';

export enum UserRole {
  ADMIN = 'Admin',
  CUSTOM = 'Custom',
}

export interface UserModel {
  id?: number;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: UserRole | string;
  ordersCars?: OrderCarModel[];
}
