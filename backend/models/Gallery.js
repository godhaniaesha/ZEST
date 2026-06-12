const mongoose = require("mongoose")

const GallerySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true,
            enum: ['food', 'drinks', 'desserts', 'ambiance']
        },
        tag: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        featured: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps: true
    }

)

module.exports = mongoose.model('Gallery', GallerySchema)
