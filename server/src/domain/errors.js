export const httpStatus = {
    BadRequest: 400,
    Unauthorized: 401,
    Forbidden: 403,
    NotFound: 404,
    Conflict: 409,
    InternalServerError: 500,
};

export class ApiError extends Error {
    constructor(code, message, details = []) {
        super(message);
        this.code = code;
        this.details = details;
    }

    static badRequest(message, details = []) {
        return new ApiError(httpStatus.BadRequest, message, details);
    }

    static unauthorized() {
        return new ApiError(httpStatus.Unauthorized, 'Пользователь не авторизован');
    }

    static forbidden(message) {
        return new ApiError(httpStatus.Forbidden, message);
    }

    static conflict(message) {
        return new ApiError(httpStatus.Conflict, message);
    }

    static notFound(message) {
        return new ApiError(httpStatus.NotFound, message);
    }
}