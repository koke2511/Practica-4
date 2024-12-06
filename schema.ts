export const schema = `#graphql

type Vehicle {
    id: ID!,
    name: String!,
    manufactue: String!,
    year: Int!,
    joke: String!,
    parts : [Parts!]!
}

type Query {
    vehicles : [Vehicle!]!
    vehicle (id: ID!) : Vehicle
    parts : [Parts!]!
    vehicleByManufacturer(manufactue: String!) : [Vehicle!]!
    partsByVehicle(vehicleId: ID!) : [Parts!]!
    vehicleByYearRange(startYear: Int!, endYear: Int!) : [Vehicle!]!
}


`