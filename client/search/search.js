angular.module("search", [])

.controller("SearchController", function ($scope, $stateParams, search){
  search.searchYoutube($stateParams.searchQuery)
  console.log($stateParams, "params")
})