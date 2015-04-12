/**
 * Created by James on 4/6/2015.
 *
 * Used for Accessing Package objects
 */
var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('B:\\Programming\\NodeJS\\rest\\data\\newmail.db');
var string = require('string');

/* GET users listing. */
router.get('/', function (req, res) {
    //get all undelivered
});

router.get('/:method', function(req, res){
    if(req.params.method == 'all'){
        //all the packages!
        db.all('SELECT * FROM Package', function(err, rows){
            if(err){
                res.send('database error');
                console.error(err);
            }
            else{
                res.send(JSON.stringify(rows));
            }
        });
    }
});

router.get('/:method/:id', function (req, res) {
    if(req.params.method == 'byid'){
        //by package id
        db.all('SELECT * FROM Package WHERE package_id=?', req.params.id, function(err, rows){
            if(err){
                res.send('database error');
                console.error(err);
            }
            else{
                res.send(JSON.stringify(rows));
            }
        });
    }
    if(req.params.method == 'bystop'){
        //by stop id
        db.all('SELECT * FROM Package WHERE stop_id=? AND at_stop=0 AND picked_up=0', req.params.id, function(err, rows){
           if(err){
               res.send('database error');
               console.error(err);
           }
           else{
               res.send(JSON.stringify(rows));
           }
        });
    }
});

router.delete('/:id', function (req, res) {

});

router.post('/:method', function (req, res) {
});

module.exports = router;
