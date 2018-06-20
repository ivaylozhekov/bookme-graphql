import {makeExecutableSchema} from 'graphql-tools';
const books = [
    {
        title: "Harry Potter and the Sorcerer's stone",
        author: 'J.K. Rowling',
    }, 
    {
        title: 'Jurassic Park',
        author: 'Michael Crichton',
    },
];

const typeDefs = `
    interface Node {
        id: ID!
        createdAt: Int
    }
    
    interface Edge {
        createdAt: Int
    }
    
    interface Connection {
        pageInfo: PageInfo!
        edges: [Edge]
    }
    
    type PageInfo {
        hasNextPage: Boolean!
        hasPreviousPage: Boolean!
        startCursor: String
        endCursor: String
    }
    
    # =============================================================
    type Floor implements Node {
        id: ID!
        createdAt: Int
        name: String
        roomsConnection(first: Int, after: String, last: Int, before: String): FloorRoomsConnection
    }
    
    type FloorRoomsConnection implements Connection {
        pageInfo: PageInfo!
        edges: [FloorRoomsEdge]
    }
    
    type FloorRoomsEdge implements Edge {
        cursor: String!
        node: RoomPayload!
        createdAt: Int
    }
    
    #==============================================================
    
    #type Hour implements Node {
    #    id: ID!
    #    createdAt: Int
    #    name: String
    #   roomsConnection: [RoomHourConnection]
    #}

    type Hour {
        id: ID!
        start: Float
        end: Float
        created: Int
    }
    
    type RoomHourEdge implements Edge {
        cursor: String!
        hour: Hour!
        room: RoomPayload
        isFree: Boolean!
        createdAt: Int
    }
    
    type RoomHourConnection implements Connection {
        pageInfo: PageInfo!
        edges: [RoomHourEdge]
    }
    
    # =============================================================
   
    type RoomPayload implements Node {
        id: ID!
        createdAt: Int
        name: String
        hoursConnection: [RoomHourConnection]
    }
    
    type RoomInput {
        name: String!
        floorId: String! 
    }
    # =============================================================
    # the schema allows the following query:
    type Query {
        floors: [Floor]
        rooms(from: Int, to: Int): [RoomPayload],
        books: [Book]
        book(author: String): Book,
        hours: [Hour],
        freeRooms(start: Float, end: Float): [RoomPayload]
    }

    type Book { 
        title: String
        author: String 
    }  
  

    # this schema allows the following mutation:
    type Mutation {
        generateRoom: RoomPayload
    }
`;

let id = 0;
let hid = 0;

const dummyPageInfo = {
    hasNextPage: true,
    hasPreviousPage: true,
    startCursor: '',
    endCursor: ''
};

// example data
const rooms = [
    {id: ++id, name: 'Java', created: 1529316799125},
    {id: ++id, name: 'JavaScript', created: 1529316799425},
    {id: ++id, name: '#Net', created: 1529316799625},
    {id: ++id, name: 'Mocha', created: 1529316712125}
];

const floors = [
    {id: 1001, name: 'Infinity 11', created: 15299125},
    {id: 1002, name: 'Infinity10', created: 15299425},
    {id: 1003, name: 'SPS 3', created: 15299625},
    {id: 1004, name: 'SPS 2', created: 15293125}
];

const hours = [
    {id: ++hid, start: 9, end: 9.5, created: 15299125},
    {id: ++hid, start: 9.5, end: 10, created: 15299425},
    {id: ++hid, start: 10, end: 10.5, created: 15299625},
    {id: ++hid, start: 10.5, end: 11, created: 15293125},
    {id: ++hid, start: 11, end: 11.5, created: 15293125},
    {id: ++hid, start: 11.5, end: 12, created: 15293125},
    {id: ++hid, start: 12, end: 12.5, created: 15299125},
    {id: ++hid, start: 12.5, end: 13, created: 15299425},
    {id: ++hid, start: 13, end: 13.5, created: 15299125},
    {id: ++hid, start: 13.5, end: 14, created: 15299425},
    {id: ++hid, start: 14, end: 14.5, created: 15299125},
    {id: ++hid, start: 14.5, end: 15, created: 15299425},
    {id: ++hid, start: 15, end: 15.5, created: 15299125},
    {id: ++hid, start: 15.5, end: 16, created: 15299425},
    {id: ++hid, start: 16, end: 16.5, created: 15299125},
    {id: ++hid, start: 16.5, end: 17, created: 15299425},
    {id: ++hid, start: 17, end: 17.5, created: 15299125},
    {id: ++hid, start: 17.5, end: 18, created: 15299425},
];

const dummyRoomHourConnections = [
    {
        cursor: 1,
        hour: 1,
        room: 2,
        isFree: false,
        createdAt: 12341234
    },
    {
        cursor: 1,
        hour: 4,
        room: 2,
        isFree: false,
        createdAt: 12341234
    },
    {
        cursor: 1,
        hour: 2,
        room: 1,
        isFree: false,
        createdAt: 12341234
    }
]

const resolvers = {
    Query: {
        rooms: () => {
            console.log('get rooms');
            return rooms;
        },
        floors: (obj, args, context, info) => {
            console.log('0. get floors');
            return floors;
        },
        books: () => books,
        // book: () => ({})
        book: (obj, args, context) =>  books.find(book => book.author === args.author),
        hours: () => hours,
        freeRooms: (obj, args, context) => {
            return rooms.filter(room => {
                return dummyRoomHourConnections.filter(connection => {
                    return connection.room === room.id
                }).map(connection => true)
            })
        }
    },

    Floor: {
        id: () => 1001,
        name: () => 'Infinity 11',
        createdAt: () => 1529316799125,
        roomsConnection: (obj, args, context, info) => {
            return [{}, {}]
        }
    },

    FloorRoomsConnection: {
        pageInfo: (obj) => {
            return dummyPageInfo;
        },
        edges: (obj) => {
            return [{}, {}, {}];
        }
    },

    FloorRoomsEdge: {
        cursor: () => '1251261',
        node: () => rooms[0],
        createdAt: () => 31
    },

    RoomPayload: (obj) => {
        return {
            id: obj.id,
            createdAt: obj.created,
            name: obj.name,
            hours: obj.hours
        }
    },

    Mutation: {
        generateRoom: (_, {}) => {
            //generate room
            const newRoom = {
                id: ++id,
                name: Math.random(),
                created: parseInt(Date.now() / 10000)
            };

            rooms.push(newRoom);
            return newRoom;
        },
    }
};


export const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

export default schema;