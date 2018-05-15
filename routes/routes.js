module.exports = function (app) {
    var user = require('../controllers/userController.js');

    app.route('/login')
        .post(user.login);

    app.route('/register')
        .post(user.register);

    app.route('/account')
        .get(user.account);

    app.route('/topup')
        .post(user.topup);

    app.route('/withdraw')
        .post(user.withdraw);
};