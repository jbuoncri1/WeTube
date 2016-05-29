var mysql = require('mysql');
var _ = require('underscore');

var connection = mysql.createConnection({
  user: "root",
  password: "supernova",
  database: "weTubeMainDb"
});

connection.connect(function(err){
  if(err){
    console.log("error connection to Main Db");
    return;
  }
  console.log('Connected to Main Db')
});

//<h2> User database functions </h2>

//<h3>addUser</h3>

//Takes a userObj with name, email, karma, facebookKey, id, password
var addUser = function (userObj, callback) {
  connection.query('INSERT INTO users SET ?', userObj, function(err, res){
    if(err){
      console.log("error inserting into users", err)
      callback(err, null)
    } else{
      console.log("last inserted Id: ", res.insertId);
      callback(null, res.insertId)
    }
  })
}

//<h3>findUser</h3>

//Finds a user based on the name and password inserted
//returns an array of obj's (should only be one) usefull for login
var findUser = function(name, password, callback){
  connection.query('SELECT * FROM users where name=? and password=?', [name, password], function(err, rows){
    if(err){
      console.log("Error finding user by name :", err)
      callback(err, null);
    } else{
      callback(null, rows);
    }
  })
}

var findUserByEmail = function(email, callback){
  connection.query('SELECT * FROM users where email=?', [email], function(err, rows){
    if(err){
      console.log("Error in controllers.js finding user by email :", err)
      callback(err, null);
    } else{
      callback(null, rows);
    }
  })
}
//<h3>findUserByPartial</h3>

//Finds a user by providing partial name information. Used in search
var findUsersByPartial = function(string, callback){
  string+= "%"
  connection.query('SELECT * FROM users WHERE name LIKE ?', string, function(err, rows){
    // just do callback(err, user)
    if(err){
      console.log("Error finding user by partial :", err)
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
      console.log("Error finding user by id :", err)
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
      console.log("Error finding user by facebookKey :", err)
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
      console.log("Error counting users :", err)
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
      console.log("Error collecting users :", err)
      callback(err, null)
    } else{
      // Response is an array of objects with the "count(*)" key
      // since we are actually doing the wildcard count that will be our key
      callback(null, users)
    }
  })
}

//<h3>getTopUsers</h3>

// Returns array of top n users, ranked by current score
var getTopUsers = function(limit, callback) {
  connection.query('SELECT * FROM users ORDER BY currentScore DESC LIMIT ?',limit, function(err, res) {
    if (err) {
      console.log('Error finding all users sorted by current score');
      callback(err, null);
    } else {
      callback(null, res);
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
          console.log("Error updating user # " + user_id)
          callback(err, null)
        } else{
          console.log('Updated user ' + user_id);
          callback(null, userObj);
        }
      }
    );
  })
}

//<h3>updateKarma</h3>

//Updates the karma of a specified user this is kept as a
//seperate function because it utilized the difference rather
//than just overwriting the property, this leads to fewer
//db interactions. It CAN accept a negative value for karmaChange
var updateKarma = function(userId, karmaChange, callback){
  connection.query('UPDATE users SET karma = karma +? Where ID = ?',[karmaChange, userId], function (err, result) {
      if (err){
        console.log("Error updating Karma of userId " + userId)
        callback(err, null)
      } else{
        console.log('Changed user ' + userId + '\'s karma by ' + karmaChange);
        callback(null, userId);
      }
    }
  );
}

//<h3>deleteUser</h3>
//Deletes a user specified by a userId
var deleteUser = function(userId, callback){
  connection.query('DELETE FROM users WHERE id = ?',userId, function (err, response) {
    if (err) {
      console.log("error deleting user " + userId, err)
      callback(err, null)
    }else{
      console.log('Deleted user number ' + userId);
      callback(null, response);
    }
  });
}



module.exports = {
  connection: connection,
  //user methods
  addUser: addUser,
  findUser: findUser,
  findUserById: findUserById,
  updateUser: updateUser,
  deleteUser: deleteUser,
  findUserByEmail : findUserByEmail
};
