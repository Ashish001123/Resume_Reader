import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../model/user.model.js";

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET || "supersecretkey123", {
        expiresIn: "15d",
    });
};

export const signupRoute = async (req, res) => {
    try {
        const { fullname, username, email, password } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullname,
            username,
            email,
            password: hashedPassword,
        });

        if (newUser) {
            await newUser.save();
            const token = generateToken(newUser._id);
            res.status(201).json({
                _id: newUser._id,
                fullname: newUser.fullname,
                username: newUser.username,
                token: token
            });
        }
    } catch (error) {
        console.error("Error in signup: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const loginRoute = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

        if (!user || !isPasswordCorrect) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            _id: user._id,
            fullname: user.fullname,
            username: user.username,
            token: token
        });

    } catch (error) {
        console.error("Error in login: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};