import usecase from "../../usecase/room.js"

export const getRooms = async (req, res, next) => {
    try {
        const {id} = req.data
        const rooms = await usecase.getRooms(id)

        return res.json({rooms});
    } catch (err) {
        next(err);
    }
};

export const createRoom = async (req, res, next) => {
    try {
        const {id} = req.data
        const room = await usecase.createRoom(id)

        return res.json({room});
    } catch (err) {
        next(err);
    }
};

export const updateRoom = async (req, res, next) => {
    try {
        const {id, name} = req.data
        const {roomId, blackList} = req.body;

        const updatedRoom = await usecase.updateRoom(id, name, roomId, blackList)

        return res.json({room: updatedRoom});
    } catch (err) {
        next(err);
    }
}

export const deleteRoom = async (req, res, next) => {
    try {
        const {id} = req.data
        const roomId = req.params.roomId
        await usecase.deleteRoom(id, roomId)

        return res.status(204).send()
    } catch (err) {
        next(err);
    }
};