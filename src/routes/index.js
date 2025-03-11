const express = require('express');
const router = express.Router();
const Mod = require('../models/Mod');

// Middleware to validate and format file size
const validateFileSize = (req, res, next) => {
    const fileSize = req.body.fileSize;
    
    // Ensure fileSize is present and is a valid number
    if (fileSize === undefined || fileSize === null || isNaN(fileSize) || !isFinite(fileSize) || fileSize < 0) {
        return res.status(400).json({ error: 'Invalid file size' });
    }
    
    // Convert string to number if needed
    req.body.fileSize = Number(fileSize);
    next();
};

// Search route
router.get('/search', async (req, res) => {
    try {
        const searchQuery = req.query.q;
        const page = parseInt(req.query.page) || 1;
        const limit = 9;
        const skip = (page - 1) * limit;

        // Create a case-insensitive search query
        const searchRegex = new RegExp(searchQuery, 'i');

        const totalMods = await Mod.countDocuments({
            game: 'ETS2',
            $or: [
                { title: searchRegex },
                { description: searchRegex },
                { category: searchRegex }
            ]
        });

        const mods = await Mod.find({
            game: 'ETS2',
            $or: [
                { title: searchRegex },
                { description: searchRegex },
                { category: searchRegex }
            ]
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        console.log('Search results:', mods);

        res.render('index', {
            mods,
            currentPage: page,
            totalPages: Math.ceil(totalMods / limit),
            hasNextPage: page < Math.ceil(totalMods / limit),
            hasPrevPage: page > 1,
            totalMods,
            category: `Search Results for "${searchQuery}"`,
            searchQuery
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).send('Server Error');
    }
});

// Home page with all ETS2 mods
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 9; // Show 9 mods per page
        const skip = (page - 1) * limit;

        const totalMods = await Mod.countDocuments({ game: 'ETS2' });
        console.log('Total ETS2 mods in database:', totalMods);

        const mods = await Mod.find()
            .where('game').equals('ETS2')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        console.log('ETS2 Mods being sent to view:', mods);

        res.render('index', {
            mods,
            currentPage: page,
            totalPages: Math.ceil(totalMods / limit),
            hasNextPage: page < Math.ceil(totalMods / limit),
            hasPrevPage: page > 1,
            totalMods,
            category: 'All Mods'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server Error');
    }
});

// Category pages (trucks, trailers, maps, skins)
router.get('/:category', async (req, res) => {
    try {
        const category = req.params.category.charAt(0).toUpperCase() + req.params.category.slice(1);
        const page = parseInt(req.query.page) || 1;
        const limit = 9;
        const skip = (page - 1) * limit;

        const totalMods = await Mod.countDocuments({
            game: 'ETS2',
            category: category
        });

        const mods = await Mod.find()
            .where('game').equals('ETS2')
            .where('category').equals(category)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.render('index', {
            mods,
            currentPage: page,
            totalPages: Math.ceil(totalMods / limit),
            hasNextPage: page < Math.ceil(totalMods / limit),
            hasPrevPage: page > 1,
            totalMods,
            category: category
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server Error');
    }
});

// Update mod file size
router.patch('/api/mods/:id/size', validateFileSize, async (req, res) => {
    try {
        const mod = await Mod.findById(req.params.id);
        if (!mod) {
            return res.status(404).json({ error: 'Mod not found' });
        }

        mod.fileSize = req.body.fileSize;
        await mod.save();

        res.json({
            fileSize: mod.fileSize,
            formattedSize: mod.getFormattedSize()
        });
    } catch (error) {
        console.error('Error updating mod file size:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Individual mod page
router.get('/mod/:id', async (req, res) => {
    try {
        const mod = await Mod.findById(req.params.id);
        if (!mod) {
            return res.status(404).render('404', { message: 'Mod not found' });
        }

        // Fetch related mods (same category, excluding current mod)
        const relatedMods = await Mod.find({
            _id: { $ne: mod._id },  // Exclude current mod
            game: 'ETS2',           // Only ETS2 mods
            category: mod.category  // Same category
        })
            .sort({ downloads: -1 }) // Sort by most downloaded
            .limit(6);              // Show 6 related mods

        console.log('Related mods:', relatedMods);

        // Get user IP address
        const userIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        
        // Check if user has already liked this mod
        const isLiked = mod.likedBy.includes(userIP);

        res.render('mod-details', {
            mod,
            relatedMods,
            title: `${mod.title} - ETS2 Mods`,
            isLiked
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server Error');
    }
});

// Like a mod
router.post('/api/mods/:id/like', async (req, res) => {
    try {
        const mod = await Mod.findById(req.params.id);
        if (!mod) {
            return res.status(404).json({ error: 'Mod not found' });
        }

        // Get user IP address
        const userIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        
        // Check if user has already liked this mod
        const userLikeIndex = mod.likedBy.indexOf(userIP);
        
        if (userLikeIndex === -1) {
            // User hasn't liked yet, add like
            mod.likes += 1;
            mod.likedBy.push(userIP);
        } else {
            // User already liked, remove like
            mod.likes = Math.max(0, mod.likes - 1); // Ensure likes don't go below 0
            mod.likedBy.splice(userLikeIndex, 1);
        }
        
        // Save the changes
        await mod.save();
        
        // Get the updated state after saving
        const isNowLiked = mod.likedBy.includes(userIP);
        
        res.json({
            likes: mod.likes,
            isLiked: isNowLiked // true if the user's IP is in the likedBy array
        });
    } catch (error) {
        console.error('Error toggling mod like:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router; 