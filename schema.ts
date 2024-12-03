export const schema = `#graphql

type Vehicle {
    id: ID!,
    name: String!,
    manufactue: String!,
    year: Int!,
    parts : [Parts!]!
}


`