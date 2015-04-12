/**
 * Created by James on 4/11/2015.
 *
 * Used for sticking to DRY principles
 */

var sqlite3 = require('sqlite3');
var sessionDb = new sqlite3.Database('B:\\Programming\\NodeJS\\rest\\data\\session.db');

function verifySession(sessionId, callback){
    sessionDb.get('SELECT valid_until AS expire FROM Sessions WHERE session_id=?', [sessionId], function(err, row){
        if(err){
            console.error(err);
            callback(false);
        }
        else{
            var cTime = new Date();
            var eTime = new Date(row.expire);

            if(cTime < eTime){
                cTime.setHours(cTime.getHours() + 1);
                sessionDb.run('UPDATE Sessions SET valid_until=? WHERE session_id=?', [cTime.getTime(), sessionId], function(err){
                    if(err){
                        console.error(err);
                        callback(false);
                    }
                    else {
                        if (this.changes > 0) {
                            callback(true);
                        }
                        else {
                            callback(false);
                        }
                    }
                })
            }
            else{
                sessionDb.run('DELETE FROM Sessions WHERE session_id=?', [sessionId], function(err){
                    if(err){
                        console.error(err);
                    }
                    callback(false);
                });

            }
        }
    });
}
function createSession(params, callback){
    sessionDb.run('INSERT INTO Sessions(session_id, valid_until, user_id) VALUES(?,?,?)', params, function(err){
        if(err){
            callback(false);
        }
        else{
            callback(true);
        }
    })
}
function randomString(length, chars, callback) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    callback(result);
}
function returnError(res, message){
    res.send(JSON.stringify({'success':0, 'message':message}));
}
function returnSuccess(res, data){
    res.send(JSON.stringify({'success':1,'data':data}));
}

module.exports.randomString = randomString;
module.exports.verifySession = verifySession;
module.exports.returnError = returnError;
module.exports.returnSuccess = returnSuccess;
module.exports.createSession = createSession;