const express = require('express');
const router = express.Router();
const Mod = require('../models/Mod');
const Tutorial = require('../models/Tutorial');

// Home page
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 12; // mods per page
    const skip = (page - 1) * limit;

    const totalMods = await Mod.countDocuments();
    const totalPages = Math.ceil(totalMods / limit);

    try {
        const mods = await Mod.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.render('home', {
            mods,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Category page
router.get('/category/:category', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    try {
        const category = req.params.category;
        const totalMods = await Mod.countDocuments({ category });
        const totalPages = Math.ceil(totalMods / limit);

        const mods = await Mod.find({ category })
            .sort({ dateAdded: -1 })
            .skip(skip)
            .limit(limit);

        res.render('category', {
            mods,
            category,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Mod details page
router.get('/mod/:id', async (req, res) => {
    try {
        const mod = await Mod.findById(req.params.id);

        // If mod not found, redirect to home page
        if (!mod) {
            return res.redirect('/');
        }

        // Find related mods (same category, excluding current mod)
        const relatedMods = await Mod.find({
            category: mod.category,
            _id: { $ne: mod._id }
        })
            .limit(4)
            .sort({ downloads: -1 });

        res.render('mod-details', { mod, relatedMods });
    } catch (err) {
        console.error('Error:', err);
        res.redirect('/');
    }
});

// Tutorials page
router.get('/tutorials', async (req, res) => {
    try {
        const tutorials = await Tutorial.find()
            .sort({ dateAdded: -1 });
        res.render('tutorials', { tutorials });
    } catch (err) {
        console.error('Error:', err);
        res.redirect('/');
    }
});

// Search route
router.get('/search', async (req, res) => {
    try {
        const searchQuery = req.query.q;
        const category = req.query.category;

        let searchCondition = {
            $or: [
                { title: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } }
            ]
        };

        // Add category filter if provided
        if (category) {
            searchCondition.category = category;
        }

        const mods = await Mod.find({
            ...searchCondition
        }).sort({ downloads: -1 });

        res.render('search-results', {
            mods,
            searchQuery,
            category: category || 'All Categories'
        });
    } catch (err) {
        console.error('Error:', err);
        res.redirect('/');
    }
});

module.exports = router; 