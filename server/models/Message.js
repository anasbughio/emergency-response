import  mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    // Reference to the User who sent the message
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Assuming your User model is named 'User'
    },
    // Reference to the Incident this message is about
    incident: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Incident' // Assuming your Incident model is named 'Incident'
    },
    // The actual content of the message
    content: {
        type: String,
        required: true,
        trim: true
    },
    // Timestamp for when the message was created
   
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

const Message = mongoose.model('Message', messageSchema);

export {Message};