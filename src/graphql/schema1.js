import {makeExecutableSchema} from 'graphql-tools';

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
        bookedBy: String
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
        hoursConnection(bookedBy: String, booked: Boolean): [RoomHourConnection]
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
        hours: [Hour],
        getRooms(start: Float, end: Float, booked: Boolean, bookedBy: String): [RoomPayload]
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
    {id: 0, name: 'Java', created: 1529316799125},
    {id: 1, name: 'JavaScript', created: 1529316799425},
    {id: 2, name: '#Net', created: 1529316799625},
    {id: 3, name: 'Angular', created: 1529316712125}
];

const floors = [
    {id: 1001, name: 'Infinity 11', created: 15299125},
    {id: 1002, name: 'Infinity10', created: 15299425},
    {id: 1003, name: 'SPS 3', created: 15299625},
    {id: 1004, name: 'SPS 2', created: 15293125}
];

const hours = [
    {id: 0, start: 9, end: 9.5, created: 15299125},
    {id: 1, start: 9.5, end: 10, created: 15299425},
    {id: 2, start: 10, end: 10.5, created: 15299625},
    {id: 3, start: 10.5, end: 11, created: 15293125},
    {id: 4, start: 11, end: 11.5, created: 15293125},
    {id: 5, start: 11.5, end: 12, created: 15293125},
    {id: 6, start: 12, end: 12.5, created: 15299125},
    {id: 7, start: 12.5, end: 13, created: 15299425},
    {id: 8, start: 13, end: 13.5, created: 15299125},
    {id: 9, start: 13.5, end: 14, created: 15299425},
    {id: 10, start: 14, end: 14.5, created: 15299125},
    {id: 11, start: 14.5, end: 15, created: 15299425},
    {id: 12, start: 15, end: 15.5, created: 15299125},
    {id: 13, start: 15.5, end: 16, created: 15299425},
    {id: 14, start: 16, end: 16.5, created: 15299125},
    {id: 15, start: 16.5, end: 17, created: 15299425},
    {id: 16, start: 17, end: 17.5, created: 15299125},
    {id: 17, start: 17.5, end: 18, created: 15299425},
];

const dummyRoomHourConnections = [
    {
        cursor: 1,
        hour: 1,
        room: 1,
        bookedBy: 'Pesho',
        createdAt: 12341234
    },
    {
        cursor: 1,
        hour: 4,
        room: 1,
        bookedBy: 'Gosho',
        createdAt: 12341234
    },
    {
        cursor: 1,
        hour: 2,
        room: 0,
        bookedBy: 'Misho',
        createdAt: 12341234
    },
    {
        cursor: 1,
        hour: 12,
        room: 0,
        bookedBy: 'Misho',
        createdAt: 12341234
    }
]

const getElementById = (id, arr) => arr.find(el => el.id === id);

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
        hours: () => hours,

        getRooms: (obj, args, context) => {
            const filteredHours = hours.filter(hour => {
                let result = true;
                if (args.start && args.end) result = hour.start >= args.start && hour.end <= args.end;
                if (args.start && !args.end) result = hour.start >= args.start;
                if (!args.start && args.end) result = hour.end <= args.end;

                return result;
            });
            const connections = dummyRoomHourConnections.filter(connection => {
                return getElementById(connection.hour, filteredHours);
            });
            return rooms.filter(room => {
                if(args.booked === undefined) return true;
                const result = connections.find(conn => args.bookedBy ? conn.room === room.id && conn.bookedBy === args.bookedBy : conn.room === room.id);
                return args.booked ? result : !result;
            }).map(room => ({
                ...room,
                hoursConnection: filteredHours.map(hour => {
                    const conn = connections.find(conn => conn.hour === hour.id && conn.room === room.id);
                    return {
                        hour,
                        bookedBy: conn ? conn.bookedBy : null
                    };
                })
            }))
        },
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

    RoomPayload: { 
        hoursConnection: (obj, args, context, info) => {
            if (args.bookedBy) {
                return [obj.hoursConnection.filter(conn => conn.bookedBy === args.bookedBy)];
            } else if (args.booked !== undefined) {
                return [obj.hoursConnection.filter(conn => args.booked ? conn.bookedBy : !conn.bookedBy)]
            }

            return [obj.hoursConnection];
        }
    },
    
    RoomHourConnection : {
        edges: (obj, args, context) => {
            return obj;
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