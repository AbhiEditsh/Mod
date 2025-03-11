const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');
const path = require('path');

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Session configuration - using environment variable for security
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

// MongoDB connection - use environment variable for cloud deployment
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/modsdb';

// Connect to MongoDB with improved options for cloud deployments
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s default
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
}).catch(err => {
    console.error('Could not connect to MongoDB...', err);
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log(`Connected to MongoDB: ${MONGODB_URI.includes('localhost') ? 'Local Database' : 'Cloud Database'}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        // Try the next port if 3000 is in use
        const newPort = PORT + 1;
        console.log(`Port ${PORT} is busy, trying port ${newPort}...`);
        app.listen(newPort, () => {
            console.log(`Server is running on port ${newPort}`);
        });
    } else {
        console.error('Server error:', err);
    }
}); 