const adminRoutes = require('./admin');
const authRoutes = require('./auth');
const shopRoutes = require('./shop');

const routes = [
    {
        path: '/admin',
        route: adminRoutes
    },
    {
        path: '/',
        route: authRoutes
    },
    {
        path: '/',
        route: shopRoutes
    }
];

module.exports = routes;