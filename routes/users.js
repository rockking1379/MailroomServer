var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('B:\\Programming\\NodeJS\\rest\\data\\newmail.db');
var string = require('string');

/* GET users listing. */
router.get('/', function (req, res) {
    db.all('SELECT user_id, user_name, first_name, last_name, administrator FROM Users WHERE active=1', function (err, rows) {
        if (err) {
            res.send('database error');
            console.error(err);
        }
        else {
            res.send(JSON.stringify(rows));
        }
    });
});

router.get('/:id', function (req, res) {
    var params = [Number(req.params.id)];
    db.all('SELECT user_id, user_name, first_name, last_name, administrator FROM Users WHERE user_id=?', params, function (err, row) {
        if (err) {
            res.send('database error');
            console.error(err);
        }
        else {
            if(row == undefined){
                var response = {};
                res.send(JSON.stringify(response));
            }
            else {
                res.send(JSON.stringify(row));
            }
        }
    });
});

router.delete('/:id', function (req, res) {
    db.run('UPDATE Users SET active=0 WHERE user_id=?', req.params.id, function (err, lastID) {
        if (err) {
            res.send('database error');
            console.error(err);
        }
        else {
            var response = {'success': 1, 'change_count': this.changes};
            res.send(JSON.stringify(response));
        }
    });
});

router.post('/:method', function (req, res) {
    if (req.params.method == 'addnew') {
        var params = [req.body.username, req.body.firstname, req.body.lastname, req.body.password, req.body.admin];

        db.run('INSERT INTO Users(user_name, first_name, last_name, password, administrator, active) VALUES(?,?,?,?,?,1)', params, function (err, lastID) {
            if (err) {
                res.send('database error');
                console.error(err);
            }
            else {
                var response = {'success': 1, 'lastid': this.lastID};
                res.send(JSON.stringify(response));
            }
        });
    }

    if (req.params.method == 'login') {
        params = [req.body.username, req.body.password];

        db.get('SELECT user_id, first_name, last_name, administrator FROM Users WHERE user_name=? AND password=? AND active=1', params, function (err, row) {
            if (err) {
                res.send('database error');
                console.error(err);
            }
            else {
                res.send(JSON.stringify(row));
            }

        });
    }
});

module.exports = router;
