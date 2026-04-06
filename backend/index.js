import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import authRoute from "./route/auth.route.js"
import chatRoute from "./route/chat.route.js"
import { connectDB } from "./db/connectDB.js"

dotenv.config()

const app = express()

const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json()) 

app.use("/api/auth", authRoute)
app.use("/api/chats", chatRoute)

app.listen(PORT, () => {
    connectDB()
    console.log(`Server is listening on port ${PORT}`)
})