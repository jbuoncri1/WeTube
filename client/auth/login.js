angular.module('login', [])
	.controller("AuthController", function ($scope, OAuth, userData) {
		$scope.loginData = {};

    $scope.createAccount = function(){
      console.log($scope.loginData)
      userData.createUser($scope.loginData)
    }

    $scope.loginUser = function () {
      userData.loginUser($scope.loginData)
      .then(function (userInfo) {
        console.log(userInfo)
      })
    }

	});