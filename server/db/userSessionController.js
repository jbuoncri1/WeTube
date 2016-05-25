var mysql = require('mysql')

var connection = mysql.createConnection({
  user: "root",
  password: "supernova",
  database: "weTubeSessions"
});

connection.connect(function(err){
  if(err){
    console.log("error connection to coupleFriendsSessions");
    return;
  }
  console.log('Connected to coupleFriendsSessions')
});

//accepts and stores a session obj which contains primaryEmail and lastLocation. ts is added in the db.
var addSession = function (sessionObj, callback) {
  connection.query('INSERT INTO userSessions SET ?', sessionObj, function(err, res){
    if(err){
      console.log("error inserting into userSessions", err)
      callback(err, null)
    } else{
      console.log("last inserted Id: ", res.insertId);
      callback(null, res.insertId)
    }
  })
}
// ({"id" : 3,  "lastLocation": "homepage"}, console.log)


var destroySesionBySessionId = function(sessionId, callback) {
  connection.query('DELETE from userSessions where id = ?', sessionId, function (err, response){
    if(err) {
      console.log("Error destroying session ", err)
      callback(err, null)
    } else {
      callback(null, response)
    }
  })
}

var findSessionByUserId = function(userId, callback) {
  connection.query('SELECT * FROM userSessions WHERE userId = ?', userId, function (err, response) {
    if(err) {
      console.log("Error finding user Session by id")
      callback(err, null)
    } else {
      callback(null, response)
    }
  })
}

var updateSessionByUserId = function(newLocation, userId, callback){
  // var updateSet = 
  connection.query('UPDATE userSessions SET lastLocation = ? Where ID = ?', [newLocation, userId], function(err, response){
    if(err){
      console.log("Error updating user Session")
      callback(err, null)
    } else {
      callback(null, response)
    }
  })
}
// (1, "room:roomId", console.log)

module.exports = {
  addSession: addSession,
  destroySesionBySessionId: destroySesionBySessionId,
  findSessionByUserId: findSessionByUserId
}