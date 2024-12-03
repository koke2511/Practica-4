import { ObjectId } from "mongodb";
import { OptionalId } from "mongodb";

//MongoDb
export type VehicleModel = OptionalId <{
    name: string
    manufacture: string,
    year: number,
    parts: ObjectId[],
}>;

export type PartsModel = OptionalId<{
    name: string,
    price: number,
    vehicleId: ObjectId[]
}>;

//Mis propios tipos
export type Vehicle = {
    id: string,
    name: string,
    manufactue: string,
    year: number,
    parts: Parts[]
};

export type Parts = {
    id: string,
    name: string,
    price: number,
    vehicleId: Vehicle[]
}

