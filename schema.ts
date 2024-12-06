export const schema = `#graphql

type Vehicle {
    id: ID!,
    name: String!,
    manufactue: String!,
    year: Int!,
    joke: String!,
    parts : [Parts!]!
}

type Parts {
    id: ID!, 
    name: String!,
    price: Int!,
    vehicle: String!
}

type Query {
    vehicles : [Vehicle!]!
    vehicle (id: ID!) : Vehicle
    parts : [Parts!]!
    vehicleByManufacturer(manufactue: String!) : [Vehicle!]!
    partsByVehicle(vehicleId: ID!) : [Parts!]!
    vehicleByYearRange(startYear: Int!, endYear: Int!) : [Vehicle!]!
}

type Mutation {
    addVehicle(name: String!, manufactue: String!, year: Int!) : Vehicle!
    addPart(name: Stirng!, price: Int!, vehicleId: ID!) : Part!
    updateVehicle(id: ID!, name: String!, manufactue: String!, year: Int!) : Vehicle!
    deletePArt(id: ID!) : Part!
}
`