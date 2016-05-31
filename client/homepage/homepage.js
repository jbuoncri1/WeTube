angular.module("homepage", [])

.controller("HomepageController", function ($scope, $state, searchFactory, userData, $mdSidenav){

  $scope.messageBoxes = userData.messageBoxes
  $scope.showSideNav = true;
  $scope.friends;
  $scope.friendRequests;
    
  var initialize = function(){
    $scope.userData = userData.getUserData()

    userData.getFriendRequests()
    .then(function (friendRequests){
      $scope.friendRequests = friendRequests
    })

    userData.getFriends()
    .then(function (friends){
      $scope.friends = friends
      for(var i = 0; i < friends.length; i++){
        console.log("Get Friend Status")
      }
    })
  }

  $scope.displayOptions = function(){
    if($scope.searchQuery.length){
      $scope.searchOptions = [{name:"people", article:"in"}, {name:"email",article:"by"}, {name:"youtube",article:"on"}, {name:"youtube url", article:"by"}]
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

  $scope.fullSearch = function(searchType){
    $scope.searchOptions = []
    $state.go('home.search', {searchQuery: $scope.searchQuery, searchType: searchType})
  }

  $scope.addFriend = function (targetId){
    userData.addFriend(targetId)
  }

  $scope.toggleSideNav = function(){
    $mdSidenav('left').toggle()
  }

  $scope.sendMessage = function (targetId, message){
    if(event.keyCode === 13){
      console.log(targetId, message)
      userData.peerToPeerMessage(targetId, message)
      
    }
  }

  $scope.newMessageBox = function(targetData){
    userData.tryNewMessageBox(targetData)
  } 

  $scope.closeMessageBox = function(){
  }

  initialize()

})