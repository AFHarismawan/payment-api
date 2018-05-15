var mongoose = require('mongoose'),
    User = mongoose.model('user'),
    jwt = require('jsonwebtoken'),
    util = require('../helpers/utils');


/**
 * @api {post} /login login
 * @apiName login
 * @apiGroup Authorization
 *
 * @apiParam (JSON Parameter) {String} email email address.
 * @apiParam (JSON Parameter) {String} password password.
 *
 * @apiSuccess (JSON Response) {String} status response status.
 * @apiSuccess (JSON Response) {String} message response message.
 * @apiSuccess (JSON Response) {String} data authorization token (jwt).
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": true,
 *       "message": "Request success",
 *       "data": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YWZhOWU5YTdjMzg2ZmNiOTJjY2FmYzkiLCJuYW1lIjoiQWNobWFkIEZhdXppIEhhcmlzbWF3YW4iLCJwaG9uZSI6IjA4MTIzMjc4NDcyNyIsImVtYWlsIjoiYWNobWFkZmF1emloYXJpc21hd2FuQGdtYWlsLmNvbSIsIl9fdiI6MCwiaWF0IjoxNTI2Mzc2MDE2fQ.ROdBx5H6p7iOaQu5I5mVlBOinb08D7t2wEkYyjl5hFE"
 *     }
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 401 Unauthorized    
 *     {
 *       "status": false,
 *       "message": "Email does not exist",
 *       "data": []
 *     }
 */
exports.login = (req, res) => {
    var global = req.app.locals

    var user = new User(req.body);
    User.findOne({ email: user.email }).select('-transactions').exec((err, cursor) => {
        if (err) {
            res.status(400).json(error(global, err));
        } else {
            if (cursor != null) {
                if (util.sha1(user.password) == cursor.password) {
                    var temp = cursor.toJSON();
                    delete temp.password;

                    var data = jwt.sign(temp, global.secret)
                    res.json(util.schema(global, data));
                } else {
                    res.status(401).json(util.error(global, global.error.wrongPassword))
                }
            } else {
                res.status(401).json(util.error(global, global.error.emailNotExist))
            }
        }
    });
};

/**
 * @api {post} /register register
 * @apiName register
 * @apiGroup Authorization
 *
 * @apiParam (JSON Parameter) {String} name users name.
 * @apiParam (JSON Parameter) {String} phone phone number.
 * @apiParam (JSON Parameter) {String} email email address.
 * @apiParam (JSON Parameter) {String} password password.
 *
 * @apiSuccess (JSON Response) {String} status response status.
 * @apiSuccess (JSON Response) {String} message response message.
 * @apiSuccess (JSON Response) {String} data authorization token (jwt).
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": true,
 *       "message": "Request success",
 *       "data": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YWZhOWU5YTdjMzg2ZmNiOTJjY2FmYzkiLCJuYW1lIjoiQWNobWFkIEZhdXppIEhhcmlzbWF3YW4iLCJwaG9uZSI6IjA4MTIzMjc4NDcyNyIsImVtYWlsIjoiYWNobWFkZmF1emloYXJpc21hd2FuQGdtYWlsLmNvbSIsIl9fdiI6MCwiaWF0IjoxNTI2Mzc2MDE2fQ.ROdBx5H6p7iOaQu5I5mVlBOinb08D7t2wEkYyjl5hFE"
 *     }
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": false,
 *       "message": "E11000 duplicate key error collection: payment.users index: email_1 dup key: { : \"achmadfauziharismawan@gmail.com\" }",
 *       "data": []
 *     }
 */
exports.register = (req, res) => {
    var global = req.app.locals

    req.body.password = util.sha1(req.body.password);
    var user = new User(req.body);
    user.save((err, cursor) => {
        if (err) {
            res.status(400).json(util.error(global, err.message));
        } else {
            var temp = cursor.toJSON();
            delete temp.password;
            delete temp.transactions;

            var data = jwt.sign(temp, global.secret)
            res.json(util.schema(global, data));
        }
    });
}

/**
 * @api {get} /account account
 * @apiName account
 * @apiGroup User
 *
 * @apiSuccess (JSON Response) {String} status response status.
 * @apiSuccess (JSON Response) {String} message response message.
 * @apiSuccess (JSON Response) {Object} data user data object.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": true,
 *       "message": "Request success",
 *       "data": {
 *         "_id": "5afa9e9a7c386fcb92ccafc9",
 *         "name": "Achmad Fauzi Harismawan",
 *         "phone": "081232784727",
 *         "email": "achmadfauziharismawan@gmail.com",
 *         "__v": 0,
 *         "balance": 149999
 *       }
 *     }
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "status": false,
 *       "message": "Invalid signature",
 *       "data": []
 *     }
 */
exports.account = (req, res) => {
    var global = req.app.locals

    var data = util.decodeToken(global, req, res);
    User.findById(data._id).select('-password').exec((err, cursor) => {
        if (err) {
            res.status(400).json(util.error(global, err.message));
        } else {
            if (cursor != null) {
                var temp = cursor.toJSON();

                var sum = 0;
                for (var i = 0; i < temp.transactions.length; i++) {
                    sum += temp.transactions[i].value;
                }
                delete temp.transactions;
                temp.balance = sum;

                res.json(util.schema(global, temp));
            } else {
                res.status(401).json(util.error(global, global.error.invalidToken));
            }
        }
    });
};


/**
 * @api {post} /topup topup
 * @apiName topup
 * @apiGroup Transaction
 *
 * @apiParam (JSON Parameter) {Number} value topup value.
 * 
 * @apiSuccess (JSON Response) {String} status response status.
 * @apiSuccess (JSON Response) {String} message response message.
 * @apiSuccess (JSON Response) {Number} data user balance after topup.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": true,
 *       "message": "Request success",
 *       "data": 100000
 *     }
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "status": false,
 *       "message": "Invalid signature",
 *       "data": []
 *     }
 */
exports.topup = (req, res) => {
    var global = req.app.locals

    var data = util.decodeToken(global, req, res);
    User.findById(data._id, (err, cursor) => {
        if (err) {
            res.status(400).json(util.error(global, err.message));
        } else {
            if (cursor != null) {
                var temp = cursor.toJSON();
                temp.transactions.push({ value: req.body.value, date: new Date() });

                User.update(temp, (err, cursor) => {
                    if (err) {
                        res.status(400).json(util.error(global, err.message));
                    } else {
                        var sum = 0;
                        for (var i = 0; i < temp.transactions.length; i++) {
                            sum += temp.transactions[i].value;
                        }

                        res.json(util.schema(global, sum));
                    }
                });
            } else {
                res.status(401).json(util.error(global, global.error.invalidToken));
            }
        }
    });
}

/**
 * @api {post} /withdraw withdraw
 * @apiName withdraw
 * @apiGroup Transaction
 *
 * @apiParam (JSON Parameter) {Number} value withdraw value.
 * 
 * @apiSuccess (JSON Response) {String} status response status.
 * @apiSuccess (JSON Response) {String} message response message.
 * @apiSuccess (JSON Response) {Number} data user balance after withdraw.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": true,
 *       "message": "Request success",
 *       "data": 100000
 *     }
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "status": false,
 *       "message": "Invalid signature",
 *       "data": []
 *     }
 */
exports.withdraw = (req, res) => {
    var global = req.app.locals

    var data = util.decodeToken(global, req, res);
    User.findById(data._id, (err, cursor) => {
        if (err) {
            res.status(400).json(util.error(global, err.message));
        } else {
            if (cursor != null) {
                var temp = cursor.toJSON();
                temp.transactions.push({ value: -req.body.value, date: new Date() });

                var sum = 0;
                for (var i = 0; i < temp.transactions.length; i++) {
                    sum += temp.transactions[i].value;
                }

                if (sum >= 0) {
                    User.update(temp, (err, cursor) => {
                        if (err) {
                            res.status(400).json(util.error(global, err.message));
                        } else {
                            res.json(util.schema(global, sum));
                        }
                    });
                } else {
                    res.status(400).json(util.error(global, global.error.insufficientBalance));
                }
            } else {
                res.status(401).json(util.error(global, global.error.invalidToken));
            }
        }
    });
}