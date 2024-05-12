import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
    linkId: { type: mongoose.Schema.Types.UUID, unique: true, required: true },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    blackList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

export default mongoose.model('Room', roomSchema);