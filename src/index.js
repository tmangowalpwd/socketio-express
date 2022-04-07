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

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Socket API")
})

io.on("connection", (socket) => {
  console.log("user connected")
})

server.listen(PORT, () => {
  console.log("Listening in port", PORT)
})