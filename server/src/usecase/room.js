import roomModel from '../models/room.js'
import userModel from '../models/user.js';
import {ApiError} from '../domain/errors.js';
import {v4 as uuidv4} from 'uuid';
import config from "../config/config.js";
import events from "../domain/events.js";

class RoomUseCase {
    constructor() {
        this.io = null
    }

    withWsConn(io) {
        this.io = io
    }

    async getRooms(ownerId) {
        const rooms = await roomModel.find({ownerId}).populate('blackList').exec();
        return rooms.map(v => {
            const blackListByName = v.blackList.map(v => v.username)
            return {
                roomId: v.linkId, blackList: blackListByName
            }
        })
    }

    async getRoom(linkId) {
        const room = await roomModel.findOne({linkId}).populate('blackList').exec()
        if (!room) {
            throw ApiError.notFound(`Конференция ${linkId} не найдена`)
        }

        const blackListByName = room.blackList.map(v => v.username)
        return {
            roomId: room.linkId, ownerId: room.ownerId, blackList: blackListByName
        }
    }

    async createRoom(ownerId) {
        const allUserRooms = await roomModel.find({ownerId});
        if (allUserRooms.length >= config.room.maxRoomsPerUser) {
            throw ApiError.badRequest(`Превышен лимит числа возможных конференций`);
        }

        const room = await roomModel.create({
            linkId: uuidv4(), ownerId: ownerId
        });

        return {
            roomId: room.linkId, blackList: room.blackList
        };
    }

    async updateRoom(ownerId, ownerName, linkId, blackListByName) {
        const withoutOwner = blackListByName.filter(v => v !== ownerName)
        blackListByName = [...new Set(withoutOwner)] /* remove duplicates */
        const records = await userModel.find({'username': {$in: blackListByName}})

        const blackList = records.map(v => v._id)

        const room = await roomModel.findOneAndUpdate({ownerId, linkId}, {blackList}, {new: true})
        if (!room) {
            throw ApiError.notFound(`Конференция ${linkId} не найдена`);
        }

        return {
            roomId: room.linkId, blackList: blackListByName,
        }
    }

    async deleteRoom(ownerId, linkId) {
        const deletedRoom = await roomModel.findOneAndDelete({ownerId, linkId})
        if (!deletedRoom) {
            throw ApiError.notFound(`Конференция ${linkId} не найдена`);
        }

        if (this.io) {
            const clients = Array.from(this.io.sockets.adapter.rooms.get(linkId) || [])
            clients.forEach(clientId => {
                this.io.to(clientId).emit(events.FORCE_DISCONNECT, {
                    reason: "Данная конференция была удалена ее владельцем",
                })
            })
        }
    }
}

export default new RoomUseCase();
