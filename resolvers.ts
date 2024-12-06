import { ObjectId, type Collection } from "mongodb";
import { VehicleModel, PartsModel, Vehicle, Parts } from "./types.ts";

const fetchJoke = async(
  
): Promise<string> =>
{
  const response = await fetch("https://official-joke-api.appspot.com/random_joke");
  const data = await response.json();
  return `${data.setup} ${data.punchline}`;
}

export const resolvers = {
  Query: {
    vehicles: async (
      _: unknown,
      __: unknown,
      context: { vehiclesCollection: Collection<VehicleModel>, partsCollection: Collection<PartsModel> }
    ): Promise<Vehicle[]> => {
      const vehicles = await context.vehiclesCollection.find().toArray();
      return Promise.all(
        vehicles.map(async (vehicle) => ({
          ...vehicle,
          id: vehicle._id!.toString(),
          joke: await fetchJoke(),
          parts: (await context.partsCollection.find({ vehicleId: vehicle._id! }).toArray()).map(part => ({
            ...part,
            id: part._id!.toString(),
          })),
        })),
      );
    },
    vehicle: async (
      _: unknown,
      { id }: { id: string },
      context: { vehiclesCollection: Collection<VehicleModel>, partsCollection: Collection<PartsModel> }
    ): Promise<Vehicle | null> => {
      const vehicles = await context.vehiclesCollection.findOne({_id: new ObjectId(id)});
      if(vehicles)
      {
        const vehiculo = {
          ...vehicles,
          id: vehicles._id!.toString(),
          joke: await fetchJoke(),
          parts: (await context.partsCollection.find({ vehicleId: vehicles._id! }).toArray()).map(part => ({
            ...part,
            id: part._id!.toString()
          }))
        }
        return vehiculo;
      }
      else
      {
        return null;
      }
    },
    parts: async (
      _: unknown,
      __: unknown,
      context: { vehiclesCollection: Collection<VehicleModel>, partsCollection: Collection<PartsModel> }
    ): Promise<Parts[]> => {
      const parts = await context.partsCollection.find().toArray();
      return Promise.all(
        parts.map(part => ({
            ...part,
            id: part._id!.toString(),
            vehicleId: part.vehicleId!.toString()
          }))
        );  
    },
    vehiclesByManufacturer: async (
      _: unknown,
      { manufacturer }: { manufacturer: string },
      context: { vehiclesCollection: Collection<VehicleModel>, partsCollection: Collection<PartsModel> }
    ): Promise<Vehicle[]> => {
      const vehicles = await context.vehiclesCollection.find({ manufacturer }).toArray();
      return Promise.all(
        vehicles.map(async (vehicle) => ({
          ...vehicle,
          id: vehicle._id!.toString(),
          joke: await fetchJoke(),
          parts: (await context.partsCollection.find({ vehicleId: vehicle._id! }).toArray()).map(part => ({
            ...part,
            id: part._id!.toString(),
          })),
        })),
      );
    },
    partsByVehicle: async (
      _: unknown,
      { vehicleId }: { vehicleId: string },
      context: { partsCollection: Collection<PartsModel> }
    ): Promise<Parts[]> => {
      const parts = await context.partsCollection.find({ vehicleId: new ObjectId(vehicleId) }).toArray();
      return parts.map(part => ({
        ...part,
        id: part._id!.toString(),
        vehicleId: part.vehicleId!.toString()
      }));
    },
    vehiclesByYearRange: async (
      _: unknown,
      { startYear, endYear }: { startYear: number, endYear: number },
      context: { vehiclesCollection: Collection<VehicleModel>, partsCollection: Collection<PartsModel> }
    ): Promise<Vehicle[]> => {
      let vehicles = await context.vehiclesCollection.find({  }).toArray();

      vehicles = vehicles.filter(vehicle => vehicle.year >= startYear && vehicle.year <= endYear);

      return Promise.all(
        vehicles.map(async (vehicle) => ({
          ...vehicle,
          id: vehicle._id!.toString(),
          joke: await fetchJoke(),
          parts: (await context.partsCollection.find({ vehicleId: vehicle._id! }).toArray()).map(part => ({
            ...part,
            id: part._id!.toString()
          }))
        }))
      );
    },
  },
  Mutation: {  
      addVehicle: async (
        _: unknown,
        { name, manufacturer, year }: { name: string, manufacturer: string, year: number },
        context: { vehiclesCollection: Collection<VehicleModel> }
      ): Promise<Vehicle> => {
        const nuevoVehiculo: VehicleModel = {
          name,
          manufactue,
          year,
          parts: []
        };
        const { insertedId } = await context.vehiclesCollection.insertOne(nuevoVehiculo);
        return {
          ...nuevoVehiculo,
          id: insertedId.toString(),
          joke: await fetchJoke(),
          parts: [],
        };
      },
      addPart: async (
        _: unknown,
        { name, price, vehicleId }: { name: string, price: number, vehicleId: string },
        context: { vehiclesCollection: Collection<VehicleModel>, partsCollection: Collection<PartModel> }
      ): Promise<Parts> => {
        const nuevaParte: PartsModel = {
          name,
          price,
          vehicleId: new ObjectId(vehicleId),
        };
        const { insertedId } = await context.partsCollection.insertOne(nuevaParte);
        const vehicle = await context.vehiclesCollection.findOne({ _id: new ObjectId(vehicleId) });

        if (vehicle) 
        {
          await context.vehiclesCollection.updateOne(
            { _id: new ObjectId(vehicleId) },
            { $push: { parts: insertedId } }
          );
        }

        return {
          ...nuevaParte,
          id: insertedId.toString(),
          vehicleId: nuevaParte.vehicleId.toString(),
        };
      },
      updateVehicle: async (
        _: unknown,
        args : { id: string, name?: string, manufacturer?: string, year?: number },
        context: { vehiclesCollection: Collection<VehicleModel> }
      ): Promise<Vehicle | null> => {
        const argumentos:Partial<VehicleModel> = {};
        if(args.name)
        {
          argumentos.name = args.name;
        }
        if(args.manufacturer)
        {
          argumentos.manufacturer = args.manufacturer;
        }
        if(args.year)
        {
          argumentos.year = args.year;
        }
        const updatedVehicle = await context.vehiclesCollection.findOneAndUpdate(
          { _id: new ObjectId(args.id) },
          { $set: { ...argumentos } },
          { returnDocument: "after" }
        );
        if(updatedVehicle)
        {
          return {
            ...updatedVehicle,
            id: updatedVehicle._id!.toString(),
            joke: await fetchJoke(),
            parts: updatedVehicle.parts.map(partId => ({
              ...partId,
              id: partId.toString(),
              vehicleId: args.id,
            })),
          };
        }
        else
        {
          return null;
        }
      },
      deletePart: async (
        _: unknown,
        { id }: { id: string },
        context: { partsCollection: Collection<PartsModel>, vehiclesCollection: Collection<VehicleModel> }
      ): Promise<{ id: string, name: string } | null> => {
        const part = await context.partsCollection.findOne({ _id: new ObjectId(id) });
        if (!part) {
          return null;
        }

        await context.partsCollection.deleteOne({ _id: new ObjectId(id) });

        await context.vehiclesCollection.updateOne(
          { _id: part.vehicleId },
          { $pull: { parts: new ObjectId(id) } }
        );

        return {
          id: part._id!.toString(),
          name: part.name,
        };
      }
  },
};


