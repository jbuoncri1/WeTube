var passport = require('passport');
var bcrypt = require('bcrypt');
var controllers = require('./db/controllers')
var YouTube = require('youtube-node');

var youTube = new YouTube();
var serverLog = require('./serverLog')

youTube.setKey('AIzaSyARHBM4uwgROfl_b5yKrHTI8LdaIoO94Y0');
youTube.addParam('type', 'video')

module.exports = function(app, express){
  app.get('/api/loggedin', function (req, res) {
    var auth = req.isAuthenticated();
    if (auth) {
      res.send(req.user);
    }
    else
      res.send('0');
  })

  app.get('/api/logout', function (req, res) {
    req.logout();
    res.redirect('/#/stream');
  })

  app.post('/createUser', function (req, res) {
    controllers.findUserByEmail(req.body.email, function (err, response){
      if(err){
        serverLog.log("Error in router finding user by email")
      } else {
        if(response.length){
          res.send({created:false, message: "I'm sorry that User Name is already taken"})
        } else {
          req.body.profile_photo = req.body.profile_photo || "/styles/no-pic.png"

          bcrypt.hash(req.body.password, 13, function(err, hash) {
            if(err){
              serverLog.log("Error hashing password", err)
            } else {
              req.body.password = hash
              controllers.addUser(req.body, function (err, response){
                if(err){
                  serverLog.log("Error in router creating new user", req.body)
                } else {
                  res.send({created:true})
                }
              })
            }
          })
        }
      }
    })
  })

  // const myPlaintextPassword = 's0/\/\P4$$w0rD';
  // const someOtherPlaintextPassword = 'not_bacon';
  // // bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
  // bcrypt.hash(myPlaintextPassword, 10, function(err, hash) {
  //   bcrypt.compare(myPlaintextPassword, hash, function(err, res){
  //     serverLog.log(res)
  //   })
  // });
  app.post('/login', function (req, res) {
    controllers.findUserByEmail(req.body.email, function (err, response) {
      if(err){
        serverLog.log("Error in login router finding user by email", err)
      } else {
        if(response.length){
          var userData = response[0]
          //will be a bcrypt check
          serverLog.log(req.body.password, "pass")
          serverLog.log(userData.password, "passed")
          bcrypt.compare(req.body.password, userData.password, function(err, bcryptResponse){
            delete userData["password"]
            if(err){
              serverLog.log("Error in login comparing passwords", err)
            } else {
              if(bcryptResponse){
                //create the session
                req.login(userData, function(err){
                  if(err){
                    serverLog.log("Error logging in at login", err)
                  } else {
                    req.session.passport.user = userData.id
                    req.session.lastLocation = ["Homepage", new Date]
                    res.send({loggedin : true, userData: userData})
                  }
                })
              } else {
                res.send({loggedin : false, message: "incorrect password"})
              }
            }
          })
        } else {
          res.send({loggedin : false, message: "email not found"})
        }
      }
    })  
  })

  app.post("/addFriend", function (req, res){
    controllers.addFriendship(req.body.userData.id, req.body.id, function (err, response){
      if(err) {
        if(err.message = serverLog.errorMessages.reqNotFound){
          res.send(400)
        } else {
          res.send(500)
        }

        serverLog.log("Error adding friendship at router", err)
      } else {
        res.send(201,{message:"Friend Added"})
      }
    })
  })

  app.post("/friendRequest", function (req, res){
    controllers.addFriendRequest(req.body.userData.id, req.body.id, function (err, response){
      if(err) {
        serverLog.log("Error adding friendrequest at router", err)
      } else {
        res.status(201).send({message: "Friend request sent"})
      }
    })    
  })

  app.get("/friendRequests/:id", function (req, res){
    var id = req.params.id
    controllers.getFriendRequests(id, function (err, response){
      if(err){
        serverLog.log("Error in router getting friend Requests", err)
      } else {
        res.send(response)
      }
    })
  })

  app.get("/searchYoutube/:searchQuery", function (req, res){
    var searchQuery = req.params.searchQuery
    youTube.search(searchQuery, 25, function(error, result) {
      if (error) {
        serverLog.log(error);
      }
      else {
        res.send(200, result);
      }
    });
  })

  app.get("/searchByEmail/:searchQuery", function (req, res){
    var searchQuery = req.params.searchQuery
    controllers.findUserByEmail(searchQuery, function (err, response){
      if(err){
        serverLog.log("error in routes finding user by email", err)
        res.send(500)
      } else {
        res.send(response)
      }
    })
  })

  app.get("/searchByDisplayName/:searchQuery", function (req, res){
    var searchQuery = req.params.searchQuery
    controllers.findUserByDisplayName(searchQuery, function (err, response){
      if(err){
        serverLog.log("error in routes finding user by display name", err)
        res.send(500)
      } else {
        res.send(response)
      }
    })
  })

  app.get('/auth/google', passport.authenticate('google', {scope: [
          'https://www.googleapis.com/auth/plus.login',
          'https://www.googleapis.com/auth/plus.profile.emails.read']
  }));

  app.get('/streams/rooms', function(req, res){
    res.send([])
  })

  app.get('/auth/google/callback',
          passport.authenticate( 'google', {
            successRedirect: '/#/stream',
            failureRedirect: '/#/login'
  }));
}