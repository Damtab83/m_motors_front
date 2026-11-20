import type { CarModel } from './car-model';

export interface ImageCarModel {
  imageCarId?: number;
  name: string;
  size: number;
  contentType?: string;
  imageData?: string;
  car?: CarModel;
}
