var mysql = require('mysql');
var _ = require('underscore');
var serverLog = require('../serverLog')

var connection = mysql.createConnection({
  user: "root",
  password: "supernova",
  database: "weTubeMainDb"
});

connection.connect(function(err){
  if(err){
    serverLog.log("error connection to Main Db");
    return;
  }
  serverLog.log('Connected to Main Db')
});

//<h2> User database functions </h2>

//<h3>addUser</h3>

//Takes a userObj with name, email, karma, facebookKey, id, password
var addUser = function (userObj, callback) {
  connection.query('INSERT INTO users SET ?', userObj, function(err, res){
    if(err){
      serverLog.log("error inserting into users", err)
      callback(err, null)
    } else{
      serverLog.log("last inserted Id: ", res.insertId);
      callback(null, res.insertId)
    }
  })
}

//<h3>findUser</h3>

//Finds a user based on the name and password inserted
//returns an array of obj's (should only be one) usefull for serverLog.login
var findUser = function(name, password, callback){
  connection.query('SELECT * FROM users where name=? and password=?', [name, password], function(err, rows){
    if(err){
      serverLog.log("Error finding user by name :", err)
      callback(err, null);
    } else{
      callback(null, rows);
    }
  })
}

var findUserByEmail = function(email, callback){
  connection.query('SELECT * FROM users where email LIKE ?', email, function(err, rows){
    email += "%"
    if(err){
      serverLog.log("Error in controllers.js finding user by email :", err)
      callback(err, null);
    } else{
      callback(null, rows);
    }
  })
}
//<h3>findUserByPartial</h3>

//Finds a user by providing partial name information. Used in search
var findUserByDisplayName = function(string, callback){
  string+= "%"
  connection.query('SELECT * FROM users WHERE displayName LIKE ?', string, function(err, rows){
    // just do callback(err, user)
    if(err){
      serverLog.log("Error finding user by partial :", err)
      callback(err, null);
    } else{
      callback(null, rows);
    }
  })
}

//<h3>findUserById</h3>

//Finds the user by id, useful for buy/sell events
//returns an array of obj's (should only be one)
var findUserById = function(userId, callback){
  connection.query('SELECT * FROM users WHERE id=?', [userId], function(err, rows){
    if(err){
      serverLog.log("Error finding user by id :", err)
      callback(err,null);
    } else {
      callback(null,rows);
    }
  })
}

//<h3>findUserByFbKey</h3>

//Finds the user by facebookKey, useful for buy/sell events
//returns an array of obj's (should only be one)
var findUserByFbKey = function(fbKey, callback){
  connection.query('SELECT * FROM users WHERE facebookKey=?', [fbKey], function(err, rows){
    if(err){
      serverLog.log("Error finding user by facebookKey :", err)
      callback(err,null);
    } else {
      callback(null,rows);
    }
  })
}

//<h3>countUsers</h3>

//Returns a count of the number of users in the Db
var countUsers = function(callback){
  connection.query('select count(*) from users', function(err, count){
    if(err){
      serverLog.log("Error counting users :", err)
      callback(err, null)
    } else{
      // Response is an array of objects with the "count(*)" key
      // since we are actually doing the wildcard count that will be our key
      callback(null, count[0]['count(*)'])
    }
  })
}

//<h3>getAllUsers</h3>

//Returns an array of all users, can be used for populating
var getAllUsers = function(callback){
  connection.query('select * from users', function(err, users){
    if(err){
      serverLog.log("Error collecting users :", err)
      callback(err, null)
    } else{
      // Response is an array of objects with the "count(*)" key
      // since we are actually doing the wildcard count that will be our key
      callback(null, users)
    }
  })
}

//<h3>updateUser</h3>

//Even though this leverages two controller methods since it is
//essentially just an update it is here.
//newUserObj must have user_id and the new properties
var updateUser = function(newUserObj, callback){
  var user_id = newUserObj.id
  findUserById(user_id, function(err, userObj){
    userObj = userObj[0]
    _.extend(userObj, newUserObj)
    connection.query('UPDATE users SET ? Where ID = ?',[userObj, user_id], function (err, result) {
        if (err){
          serverLog.log("Error updating user # " + user_id)
          callback(err, null)
        } else{
          serverLog.log('Updated user ' + user_id);
          callback(null, userObj);
        }
      }
    );
  })
}


//<h3>deleteUser</h3>
//Deletes a user specified by a userId
var deleteUser = function(userId, callback){
  connection.query('DELETE FROM users WHERE id = ?',userId, function (err, response) {
    if (err) {
      serverLog.log("error deleting user " + userId, err)
      callback(err, null)
    }else{
      serverLog.log('Deleted user number ' + userId);
      callback(null, response);
    }
  });
}

var addFriendship = function(userId1, userId2, callback) {
  var newFriendship = {"userId1" : userId1, "userId2" : userId2}
  //need to reverse the order of userId1 and 2 becuase the request was originally asked in the other direction. Maybe nomenclature change would be good here to avoid confusion. change userId1 and 2 on table -- issue opened
  connection.query('DELETE FROM friendRequests WHERE userId1=? AND userId2 = ?', [userId2, userId1,userId2, userId1], function (err, response){
    if(err){
      serverLog.log("failed to find and delete friendRequest in controllers" ,err)
      callback(err, null)
    } else {
      if(response.affectedRows){
        connection.query('INSERT INTO friendships SET ?', newFriendship, function (err, response) {
          if(err){
            serverLog.log("Error inserting new friendship at controllers", err)
            callback(err, null)
          } else {
            callback(null, response)
          }
        })
      } else {
        callback({"message": serverLog.errorMessages.reqNotFound}, null)
      }
    }
  })
};

var addFriendRequest = function(userId1, userId2, callback) {
  var newFriendship = {"userId1" : userId1, "userId2" : userId2}
  connection.query('INSERT INTO friendRequests SET ?', newFriendship, function (err, response) {
    if(err){
      serverLog.log("Error inserting new frienship at controllers", err)
    } else {
      serverLog.log("inserted friend request #:", response)
      callback(null, response)
    }
  })
}

var getFriendRequests = function (userId, callback){
  connection.query('SELECT userId1 FROM friendRequests WHERE userId2 =?',userId, function (err, response){
    if(err){
      serverLog.log("Error in controller getting friendRequests", err)
      callback(err, null)
    } else {
      var requestIds = response.map(function(el){
        return el.userId1
      })
      if(response.length){
        connection.query('SELECT id, displayName, email, profile_photo FROM users WHERE id IN (?)', [requestIds], function (err, response){
          if(err){
            serverLog.log("Error in controller getting request profiles", err)
            callback(err, null)
          } else {
            callback(null, response)
          }
        })
      } else {
        callback(null, requestIds)
      }
    }
  })
}

var getFriends = function (userId, callback){
  connection.query('SELECT * FROM users WHERE id IN (SELECT userId1 FROM friendships WHERE userId2=?) OR id IN (SELECT userId2 FROM friendships WHERE userId1=?);', [userId,userId], function (err, response){
    if(err){
      serverLog.log("Error getting friends in controller", err)
      callback(err, null)
    } else {
      callback(null, response)
    }
  })
}

module.exports = {
  connection: connection,
  //user methods
  addUser: addUser,
  findUser: findUser,
  findUserById: findUserById,
  updateUser: updateUser,
  deleteUser: deleteUser,
  findUserByEmail: findUserByEmail,
  findUserByDisplayName: findUserByDisplayName,
  addFriendship: addFriendship,
  addFriendRequest: addFriendRequest,
  getFriendRequests: getFriendRequests,
  getFriends: getFriends
};
