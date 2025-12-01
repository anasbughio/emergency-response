import mongoose from "mongoose";    

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'responder', 'citizen'], default: 'citizen' },
    createdAt: {
        type: Date,
        default: Date.now
    }
});



const User= mongoose.model('User', UserSchema);
export {User};
