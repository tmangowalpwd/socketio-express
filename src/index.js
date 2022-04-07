const express = require("express")
const app = express()
const cors = require("cors")
const dotenv = require("dotenv")

dotenv.config()

const PORT = process.env.PORT

const http = require("http")
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server, { cors: { origin: "*" } })
global.io = io

module.exports = { io }

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Socket API")
})

let messages = [
  {
    message: "Ini message 1"
  },
  {
    message: "message 2"
  },
  {
    message: "Kalau ini ketiga"
  },
]

io.on("connection", (socket) => {
  console.log("user connected")

  // Send messages on user connection
  socket.emit("INIT_MESSAGES", messages)

  socket.on("SEND_MESSAGE", (data) => {
    messages.push(data)

    io.emit("INIT_MESSAGES", messages)
  })
})

const { sequelize } = require("./lib/sequelize");
sequelize.sync({ alter: true })

app.use("/users", require("./routes/user"));
app.use("/chat", require("./routes/chat"));

server.listen(PORT, () => {
  console.log("Listening in port", PORT)
})