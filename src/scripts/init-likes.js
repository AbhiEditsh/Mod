const mongoose = require('mongoose');
const Mod = require('../models/Mod');

async function initializeLikes() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/modsdb');
        console.log('Connected to MongoDB');

        // Find all mods that don't have likedBy array
        const mods = await Mod.find({ likedBy: { $exists: false } });
        console.log(`Found ${mods.length} mods without likedBy array`);

        // Initialize likedBy array and ensure likes is 0 for these mods
        for (const mod of mods) {
            mod.likedBy = [];
            mod.likes = 0;
            await mod.save();
            console.log(`Initialized likes for mod: ${mod.title}`);
        }

        console.log('Successfully initialized likes for all mods');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing likes:', error);
        process.exit(1);
    }
}

initializeLikes();
