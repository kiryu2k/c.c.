import {ApiError} from '../../domain/errors.js';
import usecase from '../../usecase/auth.js';

const authenticate = async (socket, next) => {
    try {
        const {token} = socket.handshake.auth;
        if (!token) {
            next(ApiError.unauthorized());
            return
        }

        const {id, name} = await usecase.verify(token);
        socket.data.userId = id;
        socket.data.username = name;
        next();
    } catch (err) {
        next(err);
    }
};

export default {
    authenticate
}