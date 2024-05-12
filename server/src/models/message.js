import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    linkId: {
        type: mongoose.Schema.Types.UUID,
        required: true,
        ref: 'Room',
    },
    message: {type: String, required: true},
    createdAt: {type: Date, required: true},
});

export default mongoose.model('Message', messageSchema);