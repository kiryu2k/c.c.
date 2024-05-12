import {Router} from 'express';
import {signIn, signUp} from './auth.js';
import {body} from 'express-validator';
import {createRoom, deleteRoom, getRooms, updateRoom} from "./room.js";

export const authRouter = new Router();

authRouter.post(
    '/signup',
    [
        body('username', 'Username cannot be empty').notEmpty().isString(),
        body('password')
            .isLength({min: 5, max: 20})
            .withMessage('Password must be at least 5 to 20 chars long')
            .matches(/^[A-Za-z\d]+$/)
            .withMessage('Password must consist of letters and numbers')
            .isString(),
    ],
    signUp
);

authRouter.post('/signin', signIn);

export const roomRouter = new Router();

roomRouter.get("/", getRooms)

roomRouter.post("/", createRoom)

roomRouter.put(
    "/",
    [
        body('roomId', 'Room cannot be empty').notEmpty().isString(),
        body('blackList').isArray(),
    ],
    updateRoom
)

roomRouter.delete("/:roomId", deleteRoom)