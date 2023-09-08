import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    googleId: {
        type: String,
    },
    profile: {
        type: String,
    },
    city: {
        type: String,
    }
});

export default mongoose.model('user', userSchema);