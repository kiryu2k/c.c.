const serverConfig = {
    port: '8080',
    origin: [
        'http://localhost:8080',
    ],
}

const jwtConfig = {
    key: "some-secret-key",
    ttl: "30m"
}

const mongodbConfig = {
    host: "mongo",
    username: "kira",
    password: "qwerty",
    port: "27017"
}

const roomConfig = {
    maxRoomsPerUser: 5,
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