const { default: mongoose } = require("mongoose")

const chatSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    history: [
        {
            role: {
                type: String,
                enum: ["user", "model"],
                required: true
            },
            parts: [
                {
                    text: {
                        type: String,
                        required: true
                    }
                }
            ],
            img: {
                type: String,
                required: false
            }
        }
    ]
}, {
    timestamps: true
})

module.exports = mongoose.model("Chat", chatSchema);

// currently follow model of Gemini 2.0
// https://ai.google.dev/gemini-api/docs/text-generation
