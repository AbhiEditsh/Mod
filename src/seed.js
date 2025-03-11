const mongoose = require('mongoose');
const Mod = require('./models/Mod');
const Tutorial = require('./models/Tutorial');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/modsdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected for seeding...'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Sample data
const sampleMods = [
    {
        title: "DAF XG+ Premium Edition",
        game: "ETS2",
        category: "Trucks",
        description: "The new DAF XG+ with premium features, custom paint jobs, and enhanced interior options....",
        version: "1.2.0",
        downloads: 1800,
        images: ["/uploads/daf-xg-1.jpg", "/uploads/daf-xg-2.jpg", "/uploads/daf-xg-3.jpg"],
        downloadUrl: "https://example.com/download/1",
        author: "ModCreator",
        fileSize: 9437184,  // 9 MB
        likes: 245
    },
    {
        title: "Scandinavian Routes Pro",
        game: "ETS2",
        category: "Maps",
        description: "Explore the beauty of Scandinavia with new routes, cities, and landmarks. Enhanced winter weather ef...",
        version: "2.0.0",
        downloads: 1900,
        images: ["/uploads/daf-xg-1.jpg", "/uploads/daf-xg-2.jpg"],
        downloadUrl: "https://example.com/download/2",
        author: "MapMaker"
    },
    {
        game: 'Snowrunner',
        title: 'Extreme Terrain Map',
        description: 'Challenging map with extreme terrain and obstacles',
        category: 'Addons',
        version: '2.1',
        downloadUrl: 'https://example.com/extreme-map',
        images: ["/uploads/daf-xg-1.jpg", "/uploads/daf-xg-2.jpg"],
        author: 'MapCreator'
    },
    {
        game: 'GTA5',
        title: 'Super Car Pack',
        description: 'Collection of high-performance supercars',
        category: 'Scripts',
        version: '3.0',
        downloadUrl: 'https://example.com/super-cars',
        images: ["/uploads/daf-xg-1.jpg", "/uploads/daf-xg-2.jpg"],
        author: 'CarModder'
    },
    {
        game: 'GMod',
        title: 'Custom NPCs Pack',
        description: 'Collection of custom NPCs for Garry\'s Mod',
        category: 'Addons',
        version: '1.0',
        downloadUrl: 'https://example.com/gmod-npcs',
        images: ["/uploads/daf-xg-1.jpg", "/uploads/daf-xg-2.jpg"],
        author: 'GModder'
    },
    {
        game: 'Melon',
        title: 'Gameplay Enhancement',
        description: 'Enhanced gameplay mechanics for Melon Playground',
        category: 'Gameplay',
        version: '2.0',
        downloadUrl: 'https://example.com/melon-gameplay',
        images: ["/uploads/daf-xg-1.jpg", "/uploads/daf-xg-2.jpg"],
        author: 'MelonModder'
    }
    // Add more sample mods here...
];

const sampleTutorials = [
    {
        title: "How to Install Mods in ETS2",
        description: "A complete guide for beginners on installing mods in Euro Truck Simulator 2.",
        content: "Detailed steps for mod installation...",
        thumbnail: "/uploads/tutorial1.jpg",
        author: "ModGuide",
        views: 1200
    },
    {
        title: "Creating Custom Paint Jobs",
        description: "Learn how to create and apply custom paint jobs to your trucks.",
        content: "Step by step guide for paint customization...",
        thumbnail: "/uploads/tutorial2.jpg",
        author: "PaintPro",
        views: 850
    }
];

// Function to seed database
async function seedDatabase() {
    try {
        // Clear existing mods
        await Mod.deleteMany({});
        await Tutorial.deleteMany({});

        // Create 20 copies of sample mods with different titles
        const modsToInsert = [];
        for (let i = 0; i < 20; i++) {
            sampleMods.forEach(mod => {
                modsToInsert.push({
                    ...mod,
                    title: `${mod.title} - Version ${i + 1}`,
                    createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
                });
            });
        }

        // Insert mods one by one to identify problematic records
        for (const mod of modsToInsert) {
            try {
                await new Mod(mod).save();
            } catch (error) {
                console.error('Error inserting mod:', mod.title);
                console.error('Game:', mod.game, 'Category:', mod.category);
                throw error;
            }
        }

        await Tutorial.insertMany(sampleTutorials);

        console.log('Database seeded successfully');
        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding database:', error);
        if (error.errors) {
            Object.keys(error.errors).forEach(key => {
                console.error(`${key}:`, error.errors[key].message);
            });
        }
        mongoose.connection.close();
    }
}

seedDatabase(); 