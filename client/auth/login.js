angular.module('login', [])
	.controller("AuthController", function ($scope, OAuth, userData, $state) {
		$scope.loginData = {};

    $scope.createAccount = function(){
      console.log($scope.loginData)
      userData.createUser($scope.loginData)
      .then(function(response){
        if(response["created"]){
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
          $state.go("home.stream")
        } else {
          $scope.message = response.message
        }
      })
    }

	});