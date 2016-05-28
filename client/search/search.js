angular.module("search", [])

.controller("SearchController", function ($scope, $stateParams, search, $state, getVideo){
  $scope.searchResults;
  console.log($stateParams, "search params")
  
  search.searchYoutube($stateParams.searchQuery).then(function (searchResults){
    console.log(searchResults)
    $scope.searchResults = searchResults
  })

  $scope.buildRoom = function(videoId, videoTitle){
    getVideo.submitRoom(videoId, videoTitle, true)
  }
})