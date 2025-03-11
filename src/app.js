// server.js

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');

// Initialize Express app
const app = express();

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

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

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/modsdb';

// Connect to MongoDB using Mongoose
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s default
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
