import userModel from '../models/user.js';
import token from './token.js';
import bcrypt from 'bcrypt';
import {ApiError} from '../domain/errors.js';

const saltRounds = 10;

class AuthUseCase {
    async signUp(username, password) {
        const candidate = await userModel.findOne({username});
        if (candidate) {
            throw ApiError.badRequest(
                `Пользователь с именем '${username}' уже существует`
            );
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const user = await userModel.create({
            username: username,
            password: hashedPassword,
        });

        const accessToken = token.generate({id: user._id, name: user.username});

        return accessToken;
    }

    async signIn(username, password) {
        const user = await userModel.findOne({username});
        if (!user) {
            throw ApiError.notFound(`Пользователь с именем '${username}' не найден`);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw ApiError.badRequest(`Неверный пароль`);
        }

        const accessToken = token.generate({id: user._id, name: user.username});

        return accessToken;
    }

    async verify(accessToken) {
        const userData = token.verify(accessToken);
        if (!userData) {
            throw ApiError.unauthorized();
        }

        const user = await userModel.findById(userData.id);
        if (!user) {
            throw ApiError.unauthorized();
        }

        return userData;
    }
}

export default new AuthUseCase();
