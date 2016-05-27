angular.module("search", [])

.controller("SearchController", function ($scope, $stateParams, search){
  $scope.searchResults;
  console.log($stateParams, "search params")
  
  search.searchYoutube($stateParams.searchQuery).then(function (searchResults){
    console.log(searchResults)
    $scope.searchResults = searchResults
  })
})