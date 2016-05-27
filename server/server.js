var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var passport = require('passport');
var session = require('express-session')
var bcrypt = require('bcrypt');
var controllers = require('./db/controllers')
var bodyParser = require('body-parser');
var weTubeSession = require('./db/userSessionController')


var app = express();
app.use(bodyParser.json());
app.use(session({secret: "abstractedChalupas", cookie: {}, resave: false, saveUninitialized: false }));


// "1082022701969-rdl6108k798kf2apth302dcuornld9pg.apps.googleusercontent.com"

/* GOOGLE AUTHENTICATION */

var GOOGLE_CLIENT_ID = "1082022701969-rdl6108k798kf2apth302dcuornld9pg";
var GOOGLE_CLIENT_SECRET = "rf5SxZAdcpha9sNXcN-QD3uq";
var rooms = {};

// identify which property defines user. this is the users google id or sql id which are integers
passport.serializeUser(function(user, done) {
  done(null, user.id);
});


//find using one proprety in the schema
passport.deserializeUser(function(user, done) {
  // var userRecord = mongoose query for user based on obj
  // if error, then call done(err);
  //obj should be the user record plucked from database
  controllers.findUserByUserName(user, function(err, response){
    if (err) {
      return err;
    } else {
      done(null, response);
    }    
  })
});

passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: "http://127.0.0.1:8001/auth/google/callback",
  passReqtoCallback: true
},
function (request, accessToken, refreshToken, profile, done) {
  process.nextTick(function() {

    // check for users in database here, if the database doesnt have that user, add them as a usermodel in mongo
    record = {'username': profile.email, 'displayName':profile.name.givenName, 'email': profile.email, 'profile_photo': profile.photos[0].value}
    // return done(null, record);
    controllers.findUserByUserName(record.username, function(err, response){
      if(err){
        console.log("Error finding user in GoogleStrategy", err)
      } else {
        if(response.length){
          record.id = response[0].id
          return done(null, record)
        } else {
          controllers.addUser(record, function (err, response){
            if(err){
              console.log("Error adding user in google Oauth", err)
            } else {
              record.id = response
              return done(null, record)
            }
          })
        }
      }
    })
  });
}));

app.use(cors());

app.use( passport.initialize());
app.use( passport.session());






var PORT = 8001;

var io = require('socket.io').listen(app.listen(PORT));





app.use(express.static(__dirname+"/../client"));


var uniqueId = 0
//socket stuff (to be abstracted)
io.on('connection', function (socket) {
  var connectedClients = [];
  connectedClients.push(socket);
  socket.emit('playerDetails', {'videoId': 'TRrL5j3MIvo',
             'startSeconds': 5,
             'endSeconds': 60,
             'suggestedQuality': 'large'});

  socket.on('createRoom', function(data) {
    uniqueId++;

    rooms[uniqueId] = {room : data.room, roomTitle : data.roomTitle};
    console.log("creating room", rooms);
    //joining room
    socket.join(data.room);
  })

  socket.on('joinRoom', function(data) {
    socket.join(data.room);
    io.to(data.room).emit('newViewer', data);
  });

  socket.on('disconnect', function(data){
    console.log('user disconnected', data);
  });

  //on hearing this event the server return sync data to all viewers
  socket.on('hostPlayerState', function (data) {
    console.log(data.room, "hostPlayerSync");
    io.to(data.room).emit('hostPlayerSync', data);
    //socket.broadcast.emit('hostPlayerSync', data)
  });

  socket.on('newMessage', function (data) {
    console.log(data);
    io.to(data.room).emit('newMessage', data);
    // socket.broadcast.emit('newMessage', data)
  });

  socket.on('clientPlayerStateChange', function(data) {
    console.log('client changed state!, server broadcast', data.stateChange);
    io.to(data.room).emit('serverStateChange', data.stateChange);
    // socket.broadcast.emit('serverStateChange', data.stateChange);
  });
});



require('./routes')(app,express)

module.exports = app;