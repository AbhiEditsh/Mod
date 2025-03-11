const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');
const path = require('path');
require('dotenv').config(); // To load environment variables from a .env file

const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Routes
app.use('/', indexRouter);
app.use('/admin', adminRouter);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Mod:Mod25@mod.0vpr8.mongodb.net/?retryWrites=true&w=majority&appName=Mod';

mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000, 
}).then(() => {
    console.log(`Connected to MongoDB: ${MONGODB_URI.includes('localhost') ? 'Local Database' : 'Cloud Database'}`);
}).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); 
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        const newPort = PORT + 1;
        console.log(`Port ${PORT} is busy, trying port ${newPort}...`);
        app.listen(newPort, () => {
            console.log(`Server is running on port ${newPort}`);
        });
    } else {
        console.error('Server error:', err);
    }
});
