import { Vehicle, VehicleModel } from "./types.ts";
import { PartsModel, Parts } from "./types.ts";
import { ObjectId } from "mongodb";

const ObjectIdToString = (ids: ObjectId[]): string [] => ids.map(id => id.toString());

export const fromModelToVehicle = (vehicleModel : VehicleModel): Vehicle => {
    return{
        id: vehicleModel._id!.toString(),
        name: vehicleModel.name,
        manufactue: vehicleModel.manufacture,
        year: vehicleModel.year,
        joke: "Default joke value",
        parts: vehicleModel.parts.map(u=> ({
            id: u.toString(),
            name: "", 
            price: 0, 
            vehicleId: []
        })),
    };
};

export const fromModelToParts = (partsModel : PartsModel) : Parts => {
    return{
        id: partsModel._id!.toString(),
        name: partsModel.name, 
        price: partsModel.price,
        vehicleId: partsModel.vehicleId.map(u => ({
            id: u.toString(),
            name: "",
            manufactue: "",
            year: 0,
            joke: "",
            parts: []
        })),
    };
};