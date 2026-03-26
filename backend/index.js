import express from "express"
import authRoute from "./route/auth.route.js"

const app = express()

const PORT = 3000;


app.use("/api/auth", authRoute);

app.listen(PORT, () => {
    console.log("server is listenning on port 3000")
})