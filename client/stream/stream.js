angular.module('stream', [])
	.controller('StreamController', function ($scope, $http, getVideo, userData, $stateParams) {
		$scope.videoId = "";
		$scope.startTime = 120;
		//set messages to the factory array of messages since that is where
		//they are kept updated
		$scope.streamMessage = ""
		$scope.messages = getVideo.streamMessages;
		$scope.rooms = [];
		$scope.userData = userData.getUserData();
		$scope.toolbars = true;

		if($stateParams.host){
			getVideo.setupPlayer($stateParams.currentVideo, true)
		} else {
			getVideo.submitRoom('', '', false, $stateParams.roomId)
		}
		console.log("params", $stateParams)

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
				// getVideo.submitMessage($scope.user, $scope.message)
				// ({user: $scope.user, message:$scope.message})
				$scope.streamMessage = ""
			}					
		}
	})