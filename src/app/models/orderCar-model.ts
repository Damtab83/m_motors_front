import { CarModel } from "./car-model";
import { OldCarModel } from "./old-car-model";
import { TestDrivingModel } from "./test-driving-model";
import type { UserModel } from "./user-model";

export enum OfferType {
  BUY = "BUY",
  RENT = "RENT",
}

export interface OrderCarModel {
  id?: number;
  car?: Pick<CarModel, 'carId'> & Partial<CarModel>;
  tradeOldCar: (Pick<OldCarModel, 'oldCarId'> & Partial<OldCarModel>) | null;
  subscriptionInsurance: boolean | null;
  offerType: OfferType;
  user?: Pick<UserModel, 'id'> & Partial<UserModel>;
  testDriving?: TestDrivingModel | null;
}
