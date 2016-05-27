angular.module("homepage", [])

.controller("HomepageController", function ($scope){
  $scope.friends = [{name: "Bob", lastLocation: "homepage"},{name: "Bob", lastLocation: "homepage"},{name: "Bob", lastLocation: "homepage"},{name: "Bob", lastLocation: "homepage"},{name: "Bob", lastLocation: "homepage"},{name: "Bob", lastLocation: "homepage"},{name: "Bob", lastLocation: "homepage"},{name: "Bob", lastLocation: "homepage"},{name: "Bob", lastLocation: "homepage"},{name: "Bob", lastLocation: "homepage"},{name: "Bob", lastLocation: "homepage"},{name: "Bob", lastLocation: "homepage"},{name: "Bob", lastLocation: "homepage"}]
  $scope.searchOptions;
  $scope.changeSelected = function(){
    $scope.searchOptions = ["in people", "by email", "on youtube", "by youtube url"]

  }

  $scope.displayOptions = function(){
    if($scope.searchQuery.length){
      $scope.searchOptions = [{name:"in people"}, {name:"by email"}, {name:"on youtube"}, {name:"by youtube url"}]
    } else {
      $scope.searchOptions = []
    }
  }

  $scope.select = function(index){
    if($scope.searchOptions[$scope.selected]) {
      $scope.searchOptions[$scope.selected].selected = false;
    }
    $scope.selected = index
    $scope.searchOptions[index].selected = true;
  }

  $scope.changeSelected = function(){
    if($scope.searchOptions){
      if(event.keyCode === 38) {
        var newSelect = $scope.selected - 1 || 0
        if(newSelect < 0){
          newSelect = 0
        }
        $scope.select(newSelect)
      } else if (event.keyCode === 40) {
        var newSelect = $scope.selected + 1 || 0
        if(newSelect >= $scope.searchOptions.length){
          newSelect = $scope.searchOptions.length - 1
        }
        $scope.select(newSelect)
      }
    }
  }
})