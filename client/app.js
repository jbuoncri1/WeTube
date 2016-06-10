var app = angular.module('app', ['ngRoute', 'login', 'stream', 'services', 'ngMaterial', 'ui.router', 'homepage', 'search', 'dtrw.bcrypt', 'ngCookies']);

app.run(function ($rootScope, $state, auth, getVideo, userData) {
  
  $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {

    if(fromState.name === "home.stream") {
      socket.emit("leaveRoom",
      {
        roomId: fromParams.roomId,
        originId: userData.getUserData().id
      })
    }

    if(toState.name !== "home.stream") {
      userData.updateStatus({online:true})
    }

    if(toState.authenticate){
      if(auth.isAuthenticated()){
      } else {
        if(!auth.checkLoggedIn(toState.name)){
          $state.transitionTo("login")
          event.preventDefault();
        }
      }
    }
  })
})

app.controller('appController', function($scope){
	$scope.hello = "hello"
})

