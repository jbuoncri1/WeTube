angular.module("search", [])

.controller("SearchController", function ($scope, $stateParams, searchFactory, $state, getVideo){
  $scope.searchResults;
  $scope.searchType;

  var initialize = function(){
    if($stateParams.searchType){
      $scope.searchType = $stateParams.searchType
      search[$stateParams.searchType]($stateParams.searchQuery)
    }
  }
  

  var search = {
    "people" : function(searchQuery){
      searchFactory.searchByDisplayName(searchQuery)
      .then(function(searchResults){
        console.log(searchResults)
        $scope.searchResults = searchResults
        
      })
    },
    "youtube" : function(searchQuery){
      
      searchFactory.searchYoutube(searchQuery).then(function (searchResults){
        console.log(searchResults)
        $scope.searchResults = searchResults
      })
    },
    "email" : function(searchQuery){
      searchFactory.searchByEmail(searchQuery)
      .then(function (searchResults){
        console.log(searchResults)
        $scope.searchResults = searchResults
      })
    }
  }

  $scope.buildRoom = function(videoId, videoTitle){
    getVideo.submitRoom(videoId, videoTitle, true)
  }

  initialize()
})