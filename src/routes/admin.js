const express = require('express');
const router = express.Router();
const Mod = require('../models/Mod');
const Tutorial = require('../models/Tutorial');
const adminAuth = require('../middleware/adminAuth');
const multer = require('multer');
const path = require('path');
const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

// Admin credentials (should be in environment variables in production)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function (req, file, cb) {
        cb(null, 'mod-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

// Check file type
function checkFileType(file, cb) {
    // Allowed extensions
    const filetypes = /jpeg|jpg|png|webp/;
    // Check extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

// Admin login page
router.get('/login', (req, res) => {
    res.render('admin/login');
});

// Admin login handler
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        req.session.lastActivity = Date.now();
        res.redirect('/admin/dashboard');
    } else {
        res.render('admin/login', { error: 'Invalid credentials' });
    }
});

// Admin logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

// Protected admin routes middleware
router.use((req, res, next) => {
    // Check if user is logged in
    if (!req.session.isAdmin) {
        return res.redirect('/admin/login');
    }

    // Check session timeout
    const currentTime = Date.now();
    const lastActivity = req.session.lastActivity || 0;

    if (currentTime - lastActivity > SESSION_TIMEOUT) {
        req.session.destroy();
        return res.redirect('/admin/login?timeout=true');
    }

    // Update last activity time
    req.session.lastActivity = currentTime;
    next();
});

// Admin dashboard
router.get('/dashboard', async (req, res) => {
    try {
        const totalMods = await Mod.countDocuments();
        const totalTutorials = await Tutorial.countDocuments();
        const mods = await Mod.find().sort({ createdAt: -1 }).limit(5);

        res.render('admin/dashboard', {
            totalMods,
            totalTutorials,
            mods
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Mod management routes
router.get('/mods', async (req, res) => {
    try {
        const mods = await Mod.find()
            .sort({ createdAt: -1 });

        res.render('admin/mods', {
            mods
        });
    } catch (error) {
        console.error('Error fetching mods:', error);
        res.status(500).send('Server Error');
    }
});

// Add new mod
router.get('/mods/add', (req, res) => {
    res.render('admin/add-mod');
});



router.post('/mods/add', upload.array('images[]', 5), async (req, res) => {
    try {
        // Validate that at least one image is uploaded
        if (!req.files || req.files.length === 0) {
            throw new Error('At least one image is required');
        }

        const images = req.files.map(file => ({
            path: `/uploads/${file.filename}`,
            size: file.size 
        }));

        const totalFileSize = req.files.reduce((sum, file) => sum + file.size, 0);

        const newMod = new Mod({
            ...req.body,
            images: images.map(img => img.path),
            fileSize: totalFileSize 
        });

        await newMod.save();
        res.redirect('/admin/mods');
    } catch (error) {
        console.error('Error adding mod:', error);
        res.render('admin/add-mod', {
            error: error.message || 'Error adding mod',
            formData: req.body 
        });
    }
});


// Edit mod
router.get('/mods/edit/:id', async (req, res) => {
    try {
        const mod = await Mod.findById(req.params.id);
        res.render('admin/edit-mod', { mod });
    } catch (error) {
        res.redirect('/admin/mods');
    }
});

router.post('/mods/edit/:id', upload.array('images[]', 5), async (req, res) => {
    try {
        const mod = await Mod.findById(req.params.id);

        // Update basic information
        mod.game = req.body.game;
        mod.title = req.body.title;
        mod.category = req.body.category;
        mod.description = req.body.description;
        mod.version = req.body.version;
        mod.downloadUrl = req.body.downloadUrl;

        // Update images if new ones are uploaded
        if (req.files && req.files.length > 0) {
            mod.images = req.files.map(file => `/uploads/${file.filename}`);
        }

        await mod.save();
        res.redirect('/admin/mods');
    } catch (error) {
        console.error('Error updating mod:', error);
        res.status(500).send('Error updating mod');
    }
});

// Delete mod
router.post('/mods/delete/:id', async (req, res) => {
    try {
        await Mod.findByIdAndDelete(req.params.id);
        res.redirect('/admin/mods');
    } catch (error) {
        res.status(500).send('Error deleting mod');
    }
});

// Tutorial management routes
router.get('/tutorials', async (req, res) => {
    try {
        const tutorials = await Tutorial.find().sort({ createdAt: -1 });
        res.render('admin/tutorials', { tutorials });
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

// Add new tutorial
router.get('/tutorials/add', (req, res) => {
    res.render('admin/add-tutorial');
});

router.post('/tutorials/add', upload.single('thumbnail'), async (req, res) => {
    try {
        const newTutorial = new Tutorial({
            title: req.body.title,
            description: req.body.description,
            content: req.body.content,
            thumbnail: req.file ? `/uploads/${req.file.filename}` : '',
            author: req.body.author
        });
        await newTutorial.save();
        res.redirect('/admin/tutorials');
    } catch (error) {
        res.render('admin/add-tutorial', {
            error: error.message || 'Error adding tutorial',
            formData: req.body // Preserve form data on error
        });
    }
});

// Edit tutorial
router.get('/tutorials/edit/:id', async (req, res) => {
    try {
        const tutorial = await Tutorial.findById(req.params.id);
        res.render('admin/edit-tutorial', { tutorial });
    } catch (error) {
        res.redirect('/admin/tutorials');
    }
});

router.post('/tutorials/edit/:id', upload.single('thumbnail'), async (req, res) => {
    try {
        const tutorial = await Tutorial.findById(req.params.id);
        tutorial.title = req.body.title;
        tutorial.content = req.body.content;
        tutorial.author = req.body.author;

        if (req.file) {
            tutorial.thumbnail = `/uploads/${req.file.filename}`;
        }

        await tutorial.save();
        res.redirect('/admin/tutorials');
    } catch (error) {
        res.status(500).send('Error updating tutorial');
    }
});

// Delete tutorial
router.post('/tutorials/delete/:id', async (req, res) => {
    try {
        await Tutorial.findByIdAndDelete(req.params.id);
        res.redirect('/admin/tutorials');
    } catch (error) {
        res.status(500).send('Error deleting tutorial');
    }
});

module.exports = router; 