const { nanoid } = require("nanoid");
const { Room, UserRoom, User, ChatMessages } = require("../lib/sequelize");

const router = require("express").Router();

router.post("/rooms", async (req, res) => {
  try {
    const { userIds = [] } = req.body

    if (userIds.length <= 1) {
      throw new Error("Each room must have more than one participants")
    }

    const createRoom = await Room.create({
      room_name: nanoid(),
    })

    await UserRoom.bulkCreate(
      userIds.map((val) => {
        return {
          user_id: val,
          room_id: createRoom.id
        }
      })
    )

    res.status(201).json({
      message: "Room created"
    })

    const findRooms = await Room.findAll({
      include: User
    })

    global.io.emit("NEW_ROOM_CREATED", findRooms)
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      message: "Server error"
    })
  }
})

router.get("/rooms", async (req, res) => {
  try {
    const findRoomsWithUser = await Room.findAll({
      include: User
    })

    return res.status(200).json({
      message: "Find rooms with user",
      result: findRoomsWithUser
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      message: "Server error"
    })
  }
})

router.post("/message/room/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params
    const { user_id, message } = req.body

    const findUserInRoom = await UserRoom.findOne({
      where: {
        user_id,
        room_id: roomId
      }
    })

    if (!findUserInRoom) {
      return res.status(400).json({
        message: "User is not a participant of the room"
      })
    }

    const newMessage = {
      message,
      user_id,
      room_id: roomId
    }

    const createMessage = await ChatMessages.create(newMessage)

    const findMessage = await ChatMessages.findByPk(createMessage.id, { include: User })

    global.io.to(roomId.toString()).emit("NEW_MESSAGE", findMessage.dataValues)

    return res.status(201).json({
      message: "Sent message"
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      message: "Server error"
    })
  }
})

router.get("/room/:roomId/messages", async (req, res) => {
  try {
    const { roomId } = req.params;

    const findMessages = await ChatMessages.findAll({
      where: {
        room_id: roomId
      },
      include: User,
      order: [["createdAt", "ASC"]]
    })

    return res.status(200).json({
      message: "Find chat messages",
      result: findMessages
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      message: "Server error"
    })
  }
})

router.get("/join/:userId/room/:roomId", async (req, res) => {
  try {
    const { userId, roomId } = req.params;
    // console.log(userId)

    const findUserInRoom = await UserRoom.findOne({
      where: {
        user_id: userId,
        room_id: roomId
      }
    })

    if (!findUserInRoom) {
      return res.status(400).json({
        message: "User is not a participant of the room"
      })
    }

    global.io.on("connection", (socket) => {
      console.log("User", userId, "joined room", roomId)
      socket.join(roomId.toString())
    })

    return res.status(200).json({
      message: "Joined room"
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      message: "Server error"
    })
  }
})

module.exports = router;