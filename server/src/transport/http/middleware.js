import {ApiError, httpStatus} from '../../domain/errors.js';
import usecase from "../../usecase/auth.js";

const handleError = (err, req, res, next) => {
    console.log(err);
    if (err instanceof ApiError) {
        return res.status(err.code).json({
            error: {
                message: err.message, details: err.details,
            },
        });
    }

    return res
        .status(httpStatus.InternalServerError)
        .json({message: 'Internal server error'});
};

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return next(ApiError.unauthorized());
        }

        const accessToken = authHeader.split(' ')[1];
        if (!accessToken) {
            return next(ApiError.unauthorized());
        }

        req.data = await usecase.verify(accessToken);
        next();
    } catch (err) {
        return next(err);
    }
}

export default {
    handleError, authenticate
}
