const mongoose = require('mongoose');

const ModSchema = new mongoose.Schema({
    game: {
        type: String,
        required: true,
        enum: ['ETS2', 'Snowrunner', 'GTA5', 'GMod', 'Melon']
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        validate: {
            validator: function (category) {
                const gameCategories = {
                    ETS2: ['Trucks', 'Trailers', 'Maps', 'Skins'],
                    Snowrunner: ['Trucks', 'Maps', 'Addons', 'Fixes'],
                    GTA5: ['Vehicles', 'Weapons', 'Scripts', 'Maps', 'Skins'],
                    GMod: ['Addons', 'Maps', 'Weapons', 'NPCs', 'Tools'],
                    Melon: ['Characters', 'Maps', 'Weapons', 'UI', 'Gameplay']
                };
                return gameCategories[this.game].includes(category);
            },
            message: 'Invalid category for selected game'
        }
    },
    version: {
        type: String,
        required: true
    },
    downloadUrl: {
        type: String,
        required: true
    },
    images: [{
        type: String,
        required: true
    }],
    author: {
        type: String,
        required: true
    },
    dateAdded: {
        type: Date,
        default: Date.now
    },
    downloads: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    fileSize: {
        type: Number,
        required: true,
        min: 0,
        validate: {
            validator: function(size) {
                return !isNaN(size) && isFinite(size);
            },
            message: 'File size must be a valid number'
        }
    },
    likes: {
        type: Number,
        default: 0
    },
    likedBy: [{
        type: String,  // Store IP addresses of users who liked
        required: true
    }]
});

// Update the updatedAt timestamp before saving
ModSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Method to format file size
ModSchema.methods.getFormattedSize = function () {
    if (!this.fileSize && this.fileSize !== 0) {
        return 'Size unknown';
    }
    
    if (isNaN(this.fileSize) || !isFinite(this.fileSize)) {
        return 'Invalid size';
    }
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = Math.abs(this.fileSize); // Ensure positive value
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    
    // Format with appropriate precision
    const formattedSize = size < 10 ? size.toFixed(1) : Math.round(size);
    return `${formattedSize} ${units[unitIndex]}`;
};

module.exports = mongoose.model('Mod', ModSchema); 