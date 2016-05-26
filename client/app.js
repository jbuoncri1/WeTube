var app = angular.module('app', ['ngRoute', 'login', 'stream', 'services', 'ngMaterial', 'ui.router']);

app.run(function ($rootScope, $state, auth) {
  $rootScope.$on("$stateChangeStart", function (event, toState) {
    if(toState.authenticate){
      if(auth.isAuthenticated()){
        auth.updateLocation(toState.name)
      } else {
        if(!auth.checkLoggedIn(toState.name)){
          console.log("redirecting")
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

