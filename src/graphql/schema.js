import {makeExecutableSchema} from 'graphql-tools';

const typeDefs = `
    interface Node {
        id: ID!
    }
  
    # =============================================================

    type Floor implements Node {
        id: ID!
        name: String
        rooms(booked: Boolean, before: String, after: String): [Room!]!
    }

    #==============================================================

    type Room implements Node {
        id: ID!
        name: String
        appointmentSlots(booked: Boolean, before: String, after: String): [AppointmentSlot]
    }

    type AppointmentSlot implements Node {
        id: ID!
        room: Room
        hour: Hour
        bookedBy: String
    }
  
    type Hour implements Node {
        id: ID!
        name: String!
    }
  
    # =============================================================

    # the schema allows the following query:
    type Query {
        floors: [Floor]
        rooms(from: Int, to: Int): [Room]
        getRoom(id: ID!): Room
    }

    # this schema allows the following mutation:
    type Mutation {
        bookRoom(roomId: ID!): Room
        unbookRoom(roomId: ID!): Room
    }
`;

let id = 0;

// example data
const rooms = [
    {id: 0, name: 'Java'},
    {id: 1, name: 'JavaScript'},
    {id: 2, name: '#Net'},
    {id: 3, name: 'Mocha'}
];

const floors = [
    {id: 1001, name: 'Infinity 11'},
    {id: 1002, name: 'Infinity10'},
    {id: 1003, name: 'SPS 3'},
    {id: 1004, name: 'SPS 2'}
];

const slots = [{id: ++id}, {id: ++id}, {id: ++id}, {id: ++id}];

const hours = [{
    id: ++id,
    name: '10:00'
}, {
    id: ++id,
    name: '10:30'
}, {
    id: ++id,
    name: '11:00'
}];

const resolvers = {
    Query: {
        rooms: () => {
            console.log('get rooms');
            return rooms;
        },
        floors: (obj, args, context, info) => {
            return floors;
        },
        getRoom:(obj, args, context, info) => {
            return rooms.find(room => room.id.toString() === args.id);
        }
    },

    Floor: {
        rooms: (obj, arg, context, info) => {
            return rooms;
        }
    },

    Room: {
        appointmentSlots: (obj, arg, context, info) => {
            return slots;
        }
    },

    AppointmentSlot: {
        room: (obj, arg, context, info) => {
            return rooms[0];
        },
        hour: (obj, arg, context, info) => {
            return hours[0];
        },
        bookedBy: (obj, arg, context, info) => {
            return null;
        }
    },

    Mutation: {
        bookRoom: (roomId) => {
            return rooms[0]
        },
        unbookRoom: (roomId) => {
            return rooms[1]
        }
    }
};


export const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

export default schema;














































//
//
// type Author {
//     id: Int
//     name: String
//     posts: [Post]
// }
// type Post {
//     id: Int
//     title: String
//     text: String
//     author: Author
// }
// type Query {
//     getAuthor(id: Int): Author
//     getPostsByTitle(titleContains: String): [Post]
// }
// schema {
//     query: Query
// }
//
//
//
// getAuthor(_, args){
//     return sql.raw('SELECT * FROM authors WHERE id = %s', args.id);
// }
// posts(author){
//     return request(`https://api.blog.io/by_author/${author.id}`);
// }