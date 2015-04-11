var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3');
var dataDb = new sqlite3.Database('B:\\Programming\\NodeJS\\rest\\data\\newmail.db');
var sessionDb = new sqlite3.Database('B:\\Programming\\NodeJS\\rest\\data\\session.db');
var string = require('string');

/* Common Methods */
function verifySession(sessionId, callback){
    sessionDb.get('SELECT valid_until AS expire FROM Sessions WHERE session_id=?', [sessionId], function(err, row){
        if(err){
            console.error(err);
            callback(false);
        }
        else{
            var cTime = new Date();
            var eTime = new Date(row.expire);

            callback(cTime < eTime);
        }
    });
}
function returnError(res, message){
    res.send(JSON.stringify({'success':0, 'message':message}));
}
function returnSuccess(res, data){
    res.send(JSON.stringify({'success':1,'data':data}));
}

/* HTTP GET Actions */
router.get('/inactive', function (req, res){
    verifySession(req.headers.sessionid, function(valid){
       if(valid){
           dataDb.all('SELECT user_id, user_name, first_name, last_name, administrator FROM Users WHERE active=0', function(err, rows){
              if(err){
                  returnError(res, 'database error');
              }
               else{
                  returnSuccess(res, rows);
              }
           });
       }
        else{
           returnError(res, 'invalid session');
       }
    });
});
router.get('/active', function(req, res){
   verifySession(req.headers.sessionid, function(valid){
      if(valid){
          dataDb.all('SELECT user_id, user_name, first_name, last_name, administrator FROM Users WHERE active=1', function(err, rows){
             if(err){
                 returnError(res, 'database error');
             }
              else{
                 returnSuccess(res, rows);
             }
          });
      }
       else{
          returnError(res, 'invalid session');
      }
   });
});

/* HTTP PUT Actions */
router.put('/changepwd/:userid', function(req, res){
   verifySession(1234321, function(valid){
      if(valid){
          console.log(JSON.stringify(req.headers));
          console.log(JSON.stringify(req.params));
          console.log(JSON.stringify(req.body));
          console.log(JSON.stringify(req.query));
          var params = [req.headers.newpassword, req.headers.oldpassword, req.params.userid];
          console.log(JSON.stringify(params));
          dataDb.run('UPDATE Users SET password=? WHERE password=? AND user_id=?', params, function(err){
              if (err){
                  returnError(res, 'database error');
              }
              else{
                  returnSuccess(res, {'affectedrows':this.changes, 'lastid':this.lastID});
              }
          })
      }
       else{
          returnError(res, 'invalid session');
      }
   });
});

module.exports = router;
