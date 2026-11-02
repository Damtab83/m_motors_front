import type { CarModel } from './car-model';

export interface ImageCarModel {
  imageCarId?: number;
  name: string;
  size: number;
  car?: CarModel;
}
