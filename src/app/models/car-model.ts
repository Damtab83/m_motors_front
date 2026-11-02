export interface CarModel {
  carId?:number;
  brand: string;
  model: string;
  motorisation: string;
  kilometer: number;
  price: number;
  testDriving: boolean | null;
  imageCar?: string;
  ordersCars?: string;
}
