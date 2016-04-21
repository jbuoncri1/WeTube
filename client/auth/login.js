angular.module('login', [])
	.controller("AuthController", function ($scope, OAuth, userData) {
		$scope.login = {};

    $scope.createAccount = function(){
      console.log($scope.login)
      userData.createUser($scope.login)
    }

    

	});