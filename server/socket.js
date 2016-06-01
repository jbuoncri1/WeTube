module.exports = function(app, PORT, express, routes){
  var io = require('socket.io').listen(app.listen(PORT));


  //socket stuff (to be abstracted)
  io.on('connection', function (socket) {
    routes(app, express, socket, io)
    var connectedClients = [];
    connectedClients.push(socket);
    socket.emit('playerDetails', {'videoId': 'TRrL5j3MIvo',
               'startSeconds': 5,
               'endSeconds': 60,
               'suggestedQuality': 'large'});

    socket.on('createRoom', function(data) {
      //maybe usefull for public rooms
      //joining room
      socket.join(data.room);
    })

    socket.on('currentVideo', function(data){
      console.log(data, "currentVideo")
      io.to(data.roomId).emit('currentVideo', data)
    })

    socket.on('joinRoom', function(data) {
      socket.join(data.room);
      io.to(data.room).emit('newViewer', data);
    });

    socket.on('disconnect', function(data){
      console.log('user disconnected', data);
    });

    socket.on('getStatus', function(data){
      console.log("getStatus", data)
      io.to(data.targetId).emit('getStatus', data.originId)
    })
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
}