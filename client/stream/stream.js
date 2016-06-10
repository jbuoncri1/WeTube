angular.module('stream', [])
	.controller('StreamController', function ($scope, $http, getVideo, $stateParams, searchFactory) {
		//set messages to the factory array of messages since that is where they are kept updated
		$scope.streamMessage = ""
		$scope.streamMessages = getVideo.getStreamMessages()
		$scope.toolbars = true;
		$scope.roomSubscribers = getVideo.getRoomSubscribers()
		$scope.streamSidenav = 'chat'
		$scope.searchResults = []
		$scope.streamQueue = getVideo.getVideoQueue()

		if($stateParams.currentVideo){
			getVideo.setupPlayer($stateParams.currentVideo)
		}

		$scope.submitMessage = function($event){
			if($event.which === 13){
				getVideo.submitMessage($scope.streamMessage)
				$scope.streamMessage = ""
			}					
		}

		$scope.submitSearch = function($event){
			if($event.which === 13){
				searchFactory.searchYoutube($scope.searchQuery).then(function (response){
					$scope.searchResults = response
				})
				$scope.searchQuery = ""
			}					
		}

		$scope.addToQueue = function(video){
			getVideo.addVideoToQueue(video)
		}

		$scope.removeFromQueue = function(index){
			getVideo.removeVideoFromQueue(index)
		}

		$scope.playVideoFromQueue = function(videoObj, index) {
			var videoData = {videoId:videoObj.id.videoId, videoTitle: videoObj.snippet.title }
			getVideo.playVideoFromQueue(videoData, index)
		}
	})