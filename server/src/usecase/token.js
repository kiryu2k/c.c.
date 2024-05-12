import jwt from 'jsonwebtoken';
import config from "../config/config.js";

class TokenUseCase {
    generate(payload) {
        return jwt.sign(payload, config.jwt.key, {
            expiresIn: config.jwt.ttl,
        });
    }

    verify(accessToken) {
        try {
            const userData = jwt.verify(accessToken, config.jwt.key);
            return userData;
        } catch (err) {
            console.warn(err);
            return null;
        }
    }
}

export default new TokenUseCase();
