import { ApiError } from '../../domain/errors.js';
import { validationResult } from 'express-validator';
import usecase from "../../usecase/auth.js"

export const signUp = async (req, res, next) => {
    try {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            return next(
                ApiError.badRequest('Введенные данные невалидны', err.array())
            );
        }

        const { username, password } = req.body;
        const accessToken = await usecase.signUp(username, password);

        return res.json({ accessToken });
    } catch (err) {
        next(err);
    }
};

export const signIn = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const accessToken = await usecase.signIn(username, password);

        return res.json({ accessToken });
    } catch (err) {
        next(err);
    }
};