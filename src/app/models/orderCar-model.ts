import { CarModel } from "./car-model";
import { OldCarModel } from "./old-car-model";
import { TestDrivingModel } from "./test-driving-model";
import type { UserModel } from "./user-model";

export enum OfferType {
  Buy = "Buy",
  RENT = "RENT",
}

export interface OrderCarModel {
  id?: number;
  car?: CarModel;
  tradeOldCar: OldCarModel;
  subscriptionInsurance: boolean | null;
  offerType: OfferType;
  user: UserModel;
  testDriving?: TestDrivingModel | null;
}
