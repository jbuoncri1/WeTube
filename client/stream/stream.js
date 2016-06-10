angular.module('stream', [])
	.controller('StreamController', function ($scope, $http, getVideo, userData, $stateParams, searchFactory) {
		$scope.videoId = "";
		$scope.startTime = 120;
		//set messages to the factory array of messages since that is where
		//they are kept updated
		$scope.streamMessage = ""
		$scope.streamMessages = getVideo.getStreamMessages()
		$scope.messages = getVideo.streamMessages;
		$scope.userData = userData.getUserData();
		$scope.toolbars = true;
		$scope.roomSubscribers = getVideo.getRoomSubscribers()
		$scope.friends = userData.localFriends();
		$scope.streamSidenav = 'chat'
		$scope.searchResults = []
		$scope.streamQueue = getVideo.getVideoQueue()

		if($stateParams.currentVideo){
			getVideo.setupPlayer($stateParams.currentVideo)
		}

		$scope.submitMessage = function($event){
			if($event.which === 13){
				getVideo.submitMessage($scope.streamMessage)
				// ({user: $scope.user, message:$scope.message})
				$scope.streamMessage = ""
			}					
		}

		$scope.submitSearch = function($event){
			if($event.which === 13){
				searchFactory.searchYoutube($scope.searchQuery).then(function (response){
					$scope.searchResults = response
				})
				// ({user: $scope.user, message:$scope.message})
				$scope.searchQuery = ""
			}					
		}

		$scope.addToQueue = function(video){
			getVideo.addVideoToQueue(video)
		}
	})