import express from 'express';
import {createServer} from 'node:http';
import {Server} from 'socket.io';
import {authRouter, roomRouter} from './transport/http/router.js';
import httpMiddleware from './transport/http/middleware.js';
import cors from 'cors';
import config from "./config/config.js";
import ConnectionHandler from "./transport/ws/handler.js";
import wsMiddleware from "./transport/ws/middleware.js";
import mongoose from 'mongoose';
import roomUsecase from "./usecase/room.js"

const app = new express();
app.use(express.json());

const corsOptions = {
    origin: config.server.origin,
    credentials: true,
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.use('/api/auth', authRouter);
app.use('/api/room', httpMiddleware.authenticate, roomRouter);
app.use(httpMiddleware.handleError);

const server = createServer(app);
const io = new Server(server, {
    path: '/api/signal',
    cors: {
        origin: config.server.origin,
    },
});

io.use(wsMiddleware.authenticate);

roomUsecase.withWsConn(io)

const connHandler = new ConnectionHandler(io)
connHandler.ServeWs()

export default async function startApp(port, dbConnString) {
    try {
        await mongoose.connect(dbConnString);
        server.listen(port, () => {
            console.log(`server running at port: ${port}`);
        });
    } catch (err) {
        console.error(`got err: ${err}`);
    }
}
