import messageModel from '../models/message.js';
import config from "../config/config.js";

class MessageUseCase {
    async addMessage(authorId, linkId, message, createdAt) {
        await messageModel.create({authorId, linkId, message, createdAt})
    }

    async getLastMessages(linkId) {
        const messages = await messageModel.find({linkId}).sort({createdAt: 'desc'})
            .limit(config.message.maxReturnedMessages).populate('authorId').exec();
        if (!messages) {
            return []
        }

        messages.sort((lhs, rhs) => {
            if (lhs.createdAt > rhs.createdAt) {
                return 1
            }
            return -1
        })

        return messages.map(v => ({
            author: v.authorId.username,
            message: v.message,
            time: v.createdAt,
        }))
    }
}

export default new MessageUseCase();
