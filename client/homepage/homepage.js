angular.module("homepage", [])

.controller("HomepageController", function ($scope){
  $scope.friends = [{name: "Bob", lastLocation: "homepage"},{name: "Bob", lastLocation: "homepage"},{name: "Bob", lastLocation: "homepage"},{name: "Bob", lastLocation: "homepage"},{name: "Bob", lastLocation: "homepage"},{name: "Bob", lastLocation: "homepage"},{name: "Bob", lastLocation: "homepage"},{name: "Bob", lastLocation: "homepage"},{name: "Bob", lastLocation: "homepage"},{name: "Bob", lastLocation: "homepage"},{name: "Bob", lastLocation: "homepage"},{name: "Bob", lastLocation: "homepage"},{name: "Bob", lastLocation: "homepage"}]
  $scope.searchOptions;
  $scope.changeSelected = function(){
    $scope.searchOptions = ["in people", "by email", "on youtube", "by youtube url"]

  }
})