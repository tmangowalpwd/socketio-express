const { Sequelize, DataTypes } = require("sequelize")

const sequelize = new Sequelize({
  database: "only_messages",
  username: "root",
  password: "password",
  dialect: "mysql",
  port: 3306
})

const User = sequelize.define(
  "User",
  {
    username: {
      type: DataTypes.STRING
    }
  }
)

const Room = sequelize.define(
  "Room",
  {
    room_name: {
      type: DataTypes.STRING
    }
  }
)

const UserRoom = sequelize.define(
  "UserRoom",
  {
    id: {
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false
    }
  }
)

const ChatMessages = sequelize.define(
  "ChatMessages",
  {
    message: {
      type: DataTypes.STRING
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }
)

// Associations
User.belongsToMany(Room, { foreignKey: "user_id", through: UserRoom })
Room.belongsToMany(User, { foreignKey: "room_id", through: UserRoom })

User.hasMany(ChatMessages, { foreignKey: "user_id" })
ChatMessages.belongsTo(User, { foreignKey: "user_id" })

ChatMessages.belongsTo(Room, { foreignKey: "room_id" })
Room.hasMany(ChatMessages, { foreignKey: "room_id" })

module.exports = {
  sequelize,
  User,
  UserRoom,
  ChatMessages,
  Room
}
