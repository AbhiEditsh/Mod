const adminAuth = (req, res, next) => {
    // Check if user is authenticated as admin
    const isAdmin = req.session && req.session.isAdmin;

    if (!isAdmin) {
        return res.redirect('/admin/login');
    }

    next();
};

module.exports = adminAuth; 