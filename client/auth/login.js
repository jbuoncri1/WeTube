angular.module('login', [])
	.controller("AuthController", function ($scope, OAuth, userData) {
		$scope.loginData = {};

    $scope.createAccount = function(){
      console.log($scope.loginData)
      userData.createUser($scope.loginData)
      .then(function(response){
        if(response["created"]){
          console.log("logging in")
          $scope.loginUser()
        } else {
          $scope.message = response.message
        }
      })
    }

    $scope.loginUser = function () {
      userData.loginUser($scope.loginData)
      .then(function (userInfo) {
        if(userInfo["loggedin"]){
          console.log("redirect")
        } else {
          console.log(userInfo["message"])
        }
      })
    }

	});