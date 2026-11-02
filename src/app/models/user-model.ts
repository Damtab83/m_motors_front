export enum UserRole {
  CUSTOM = 'CUSTOM',
}

export interface UserModel {
  id?: number;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: UserRole.CUSTOM;
  ordersCars?: string
}
