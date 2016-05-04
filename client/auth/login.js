angular.module('login', [])
	.controller("AuthController", function ($scope, OAuth, userData, $location) {
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
      .then(function (response) {
        if(response["loggedin"]){
          userData.updateUserData(response.userData)
          $location.path("/stream")
        } else {
          $scope.message = response.message
        }
      })
    }

	});