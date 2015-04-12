var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3');
var dataDb = new sqlite3.Database('B:\\Programming\\NodeJS\\rest\\data\\newmail.db');
var string = require('string');
var common = require("./common.js");

/* HTTP GET Actions */
router.get('/inactive', function (req, res){
    common.verifySession(req.headers.sessionid, function(valid, userid) {
        datadb.get('SELECT administrator FROM Users WHERE user_id=?', [userid], function (err, row) {
            if(err){
                console.error(err);
                common.returnError(res, 'database error');
            }
            else {
                if (valid) {
                    dataDb.all('SELECT user_id, user_name, first_name, last_name, administrator FROM Users WHERE active=0', function (err, rows) {
                        if (err) {
                            console.error(err);
                            common.returnError(res, 'database error');
                        }
                        else {
                            common.returnSuccess(res, rows);
                        }
                    });
                }
                else {
                    common.returnError(res, 'invalid session');
                }
            }
        });
    });
});
router.get('/active', function(req, res){
   common.verifySession(req.headers.sessionid, function(valid){
      if(valid){
          dataDb.all('SELECT user_id, user_name, first_name, last_name, administrator FROM Users WHERE active=1', function(err, rows){
             if(err){
                 console.error(err);
                 common.returnError(res, 'database error');
             }
             else{
                 common.returnSuccess(res, rows);
             }
          });
      }
       else{
          common.returnError(res, 'invalid session');
      }
   });
});

/* HTTP PUT Actions */
router.put('/changepwd/:userid', function(req, res){
   common.verifySession(1234321, function(valid){
      if(valid){
          console.log(JSON.stringify(req.headers));
          console.log(JSON.stringify(req.params));
          console.log(JSON.stringify(req.body));
          console.log(JSON.stringify(req.query));
          var params = [req.headers.newpassword, req.headers.oldpassword, req.params.userid];
          console.log(JSON.stringify(params));
          dataDb.run('UPDATE Users SET password=? WHERE password=? AND user_id=?', params, function(err){
              if (err){
                  common.returnError(res, 'database error');
              }
              else{
                  common.returnSuccess(res, {'affectedrows':this.changes, 'lastid':this.lastID});
              }
          })
      }
       else{
          common.returnError(res, 'invalid session');
      }
   });
});
router.put('/setadmin/:userid', function(req, res){
    common.verifySession(req.headers.sessionid, function(valid){
        if(valid){
            dataDb.run('UPDATE Users SET administrator=? WHERE user_id=?', [req.headers.administrator, req.params.userid], function(err){
               if(err){
                   console.error(err);
                   common.returnError(res, 'database error');
               }
               else{
                   common.returnSuccess(res, {'affectedrows':this.changes, 'lastid':this.lastID});
               }
            });
        }
        else{
            common.returnError(res, 'invalid session');
        }
    });
});
router.put('/activate/:userid', function(req, res){
   common.verifySession(req.headers.sessionid, function(valid){
       if(valid){
           dataDb.run('UPDATE Users SET active=1, password=? WHERE user_id=?', [req.headers.password, req.params.userid], function(err){
              if(err){
                  console.error(err);
                  common.returnError(res, 'database error');
              }
              else{
                  common.returnSuccess(res, {'affectedrows':this.changes, 'lastid':this.lastID});
              }
           });
       }
       else{
           common.returnError(res, 'invalid session');
       }
   }) ;
});

/* HTTP POST Actions */
router.post('/login', function(req, res){
   //no session, return a session
    dataDb.get('SELECT user_id, user_name, first_name, last_name, administrator FROM Users WHERE user_name=? AND password=? AND active=1', [req.headers.username, req.headers.password], function(err, row){
       if(err){
           console.error(err);
           common.returnError(res, 'database error');
       }
       else if(row == undefined){
           common.returnError(res, 'invalid login');
       }
       else{
           var userData = row;

           common.randomString(16, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', function(string){
               var cTime = new Date();
               cTime.setHours(cTime.getHours() + 1);
               var params = [string, cTime.getTime(), row.user_id];

               common.createSession(params, function(success){
                   if(!success){
                       common.returnError(res, 'session error');
                   }
                   else{
                       var retObj = {'sessionid':string, 'user':userData};
                       common.returnSuccess(res, retObj);
                   }
               })
           });
       }
    });
});
router.post('/addnew', function(req, res){
   common.verifySession(req.headers.sessionid, function(valid){
       if(valid){
           var params = [req.headers.username, req.headers.firstname, req.headers.lastname, req.headers.password, req.headers.administrator];
           dataDb.run('INSERT INTO Users(user_name, first_name, last_name, password, administrator, active) VALUES(?,?,?,?,?,1)', params, function(err){
               if(err){
                   console.error(err);
                   common.returnError(res, 'database error');
               }
               else{
                   common.returnSuccess(res, {'affectedrows':this.changes, 'lastid':this.lastID});
               }
           });
       }
       else{
           common.returnError(res, 'invalid session');
       }
   });
});

/* HTTP DELETE Actions */
router.delete('/delete/:userid', function(req, res){
   common.verifySession(req.headers.sessionid, function(valid){
       if(valid){
           dataDb.run('UPDATE Users SET active=0 WHERE user_id=?', [req.params.userid], function(err){
               if(err){
                   console.error(err);
                   common.returnError(res, 'database error');
               }
               else{
                   common.returnSuccess(res, {'affectedrows':this.changes, 'lastid':this.lastID});
               }
           })
       }
       else{
           common.returnError(res, 'invalid session');
       }
   })
});

module.exports = router;