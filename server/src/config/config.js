const serverConfig = {
    port: '8080',
    origin: [
        'http://localhost:5173',
    ],
}

const jwtConfig = {
    key: "some-secret-key",
    ttl: "30m"
}

const mongodbConfig = {
    host: "localhost",
    username: "kira",
    password: "qwerty",
    port: "27017"
}

const roomConfig = {
    maxRoomsPerUser: 5,
    maxUsersInRoom: 3
}

const messageConfig = {
    maxReturnedMessages: 20
}

const config = {
    server: serverConfig,
    jwt: jwtConfig,
    mongodb: mongodbConfig,
    room: roomConfig,
    message: messageConfig
}

export default config