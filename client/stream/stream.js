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
		$scope.streamQueue = []
		
		if($stateParams.currentVideo){
			getVideo.setupPlayer($stateParams.currentVideo)
		}

		$scope.clearUrl = function(){
			$scope.url = ''
		};

		$scope.getRooms = function(){
			// $scope.rooms = ['U0315DUM6Cg']
			console.log("getting rooms")
			$http({
				method : "GET",
				url : "/streams/rooms"
			}).then(function(rooms) {
				$scope.rooms = rooms.data
     	}, function(error) {
       console.log("Error finding rooms",error);
			});
		};

		$scope.addVideo = function(videoId){
		}

		
		$scope.logout = function() {
			return $http({
				method: "GET",
				url:'/api/logout'
			});
		}

		$scope.joinStream = function(videoId){
			//pass in false since they are a viewer
			getVideo.setupPlayer(videoId, false)
		}

		$scope.submitMessage = function(){
			if(event.charCode === 13){
				console.log($scope.streamMessage)
				getVideo.submitMessage($scope.streamMessage)
				// ({user: $scope.user, message:$scope.message})
				$scope.streamMessage = ""
			}					
		}

		$scope.submitSearch = function(){
			if(event.charCode === 13){
				searchFactory.searchYoutube($scope.searchQuery).then(function (response){
					$scope.searchResults = response
				})
				// ({user: $scope.user, message:$scope.message})
				$scope.streamMessage = ""
			}					
		}

		$scope.addToQueue = function(video){
			$scope.streamQueue.push(video)
		}
	})