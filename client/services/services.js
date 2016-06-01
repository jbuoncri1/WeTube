angular.module('services', [])
	.factory('OAuth', function ($http) {
		var googleLogin = function (data) {
			return $http({
				method: 'GET',
				url: '/auth/google/callback'
			});
		}

		return {
			googleLogin: googleLogin
		};
	})

	.factory('auth', function ($http){

		var checkLoggedIn = function (token, nextLocation) {
			return false
		}

		var isAuthenticated = function(){
			return true
		}

		var updateLocation = function(){

		}
		return {
			checkLoggedIn: checkLoggedIn,
			isAuthenticated: isAuthenticated,
			updateLocation: updateLocation
		}

	})

	.factory('userData', function ($http, $window, $rootScope, $cookies) {
		/*conversations obj note - messages will be lost upon refresh
		{ id: 
			{
				userData :	userData,
				messages : []
	
			}
		}
		*/ 
		var conversations = {}
		var messageBoxes = []
		// displayName:"kyle", id:1, profile_photo: "/styles/no-pic.png"
		var userData = {}

		$window.socket = io.connect('http://localhost:8001');


		socket.on('newMessage', function (data) {
			tryNewMessageBox(data.userData, data.message)
		})

		socket.on("friendAdded", function (data){
			console.log(data, "newFriend")
		})

		var createUser = function(userData){
			return $http({
				method: "POST",
				url: "/createUser",
				data: userData
			}).then(function(response){
				return response.data
			})

		}

		var loginUser = function(loginUserData){
			return $http({
				method: "POST",
				url: "/login",
				data: loginUserData
			}).then(function (response){
				if(response.data.loggedin){
					updateUserData(response.data.userData)
					buildOwnRoom()
				}
				return response.data
			})
		}

		var buildOwnRoom = function (){
			socket.emit('createRoom',{room : userData.id, roomTitle : userData.id});
		}

		var tryNewMessageBox = function (targetData, message){
			var conversation = conversations[targetData.id]
			//if no current message box make one
			if(!findMessageBox(targetData.id)){
				//is conversation is not message box
				if(!conversation){
					//initialize a new conversation
					conversation = conversations[targetData.id] = {
						userData : targetData,
						messages : []
					}
				}
				messageBoxes.unshift(conversation)
			}
			if(message){
				$rootScope.$apply(
					conversation.messages.push(message)
				)
			}
		}

		var closeMessageBox = function(index){
			messageBoxes.splice(index,1)
		}

		var addNewMessageBox = function(targetId){
			messageBoxes.unshift(conversations[targetId])
		}

		var findMessageBox = function(targetId){
			for(var i = 0; i < messageBoxes.length; i++){
				if(messageBoxes[i].userData.id === targetId){
					return true
				} 
			}
			return false
		}

		var peerToPeerMessage = function (targetId, message){
			socket.emit('newMessage', {
				room: targetId, 
				userData: userData, 
				message: message
			})
		}

		var updateUserData = function(newUserData){
			$cookies.putObject("userData", newUserData)
			console.log($cookies.getObject("userData"), "nom")
			userData = newUserData
		}

		var getUserData = function(){
			return userData
		}

		var getMessageBoxes = function (){
			return messageBoxes
		}

		var addFriend = function(id){
			console.log("service", id)
			return $http({
				method: "POST",
				url: "/addFriend",
				data: {
					userData : userData,
					id : id
				}
			}).then(function (response){
				return response.data
			})
		}

		var friendRequest = function(id){
			console.log("service", id)
			return $http({
				method: "POST",
				url: "/friendRequest",
				data: {
					userData : userData,
					id : id
				}
			}).then(function (response){
				return response.data
			})
		}

		var getFriendRequests = function(){
			return $http({
				method: 'GET',
				url: "friendRequests/" + userData.id
			}).then(function (response){
				return response.data
			})	
		}
		var getFriends = function(){
			return $http({
				method: 'GET',
				url: "friends/" + userData.id
			}).then(function (response){
				return response.data
			})	
		}

		if($cookies.getObject("userData")){
			var userData = $cookies.getObject("userData")
			buildOwnRoom()
		}
		
		return {
			createUser: createUser,
			loginUser: loginUser,
			updateUserData: updateUserData,
			getUserData: getUserData,
			addFriend: addFriend,
			friendRequest: friendRequest,
			getFriendRequests: getFriendRequests,
			getFriends: getFriends,
			peerToPeerMessage: peerToPeerMessage,
			getMessageBoxes: getMessageBoxes,
			messageBoxes: messageBoxes,
			tryNewMessageBox: tryNewMessageBox,
			closeMessageBox: closeMessageBox
		}
	})

	.factory('searchFactory', function($http){
		var searchYoutube = function(searchQuery){
			return $http({
				method: "GET",
				url :"searchYoutube/" + searchQuery
			}).then(function(response){
				return response.data.items
			})
		}

		var searchByEmail = function(searchQuery){
			return $http({
				method: "GET",
				url :"searchByEmail/" + searchQuery
			}).then(function(response){
				return response.data
			})			
		}

		var searchByDisplayName = function(searchQuery){
			return $http({
				method: "GET",
				url :"searchByDisplayName/" + searchQuery
			}).then(function(response){
				return response.data
			})			
		}

		return{
			searchYoutube: searchYoutube,
			searchByEmail: searchByEmail,
			searchByDisplayName: searchByDisplayName
		}
	})

	.factory('getVideo', function ($window, $interval, $rootScope, bcrypt, userData, $state) {

		var roomId;

		var onYoutubeStateChange = function() {
			console.log('state change!')

			socket.emit('clientPlayerStateChange', {
				stateChange: $window.youtubePlayer.getPlayerState(),
				room: roomId
			});

			if(host){
				socket.emit('hostPlayerState',
				{
					currentTime: $window.youtubePlayer.getCurrentTime(),
					currentState: $window.youtubePlayer.getPlayerState(),
					room : roomId
				});
			}
		};

		var host = false; 
		var currentVideo = '';
		var messages = [];

		//at the end of setupPlayer onYouTubeIframeAPIReady is automatically called
		var setupPlayer = function(source, isHost) {
			videoId = source
			host = isHost;
			// add source to the io stream

			var tag = document.createElement('script');
			tag.src = "https://www.youtube.com/iframe_api";
			var firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

		};
		//updated by setupPlayer b/c setupPlayer cannot directly pass into
		//onYouTubeIframeAPIReady

		$window.onYouTubeIframeAPIReady=function() {
			console.log('youtube iFrame ready!');
			$window.youtubePlayer = new YT.Player('player', {
				height: '400',
				width: '600',
				videoId: videoId,
				events: {
					'onStateChange': onYoutubeStateChange,
				}
			});
		}

			//sets up the socket stream and events
		var submitRoom = function(videoId, videoTitle, host, roomId){


			currentVideo = videoId

			var displayName = userData.getUserData().displayName 

			if(host){
				bcrypt.hash(displayName, 8, function(err, hash) {
					roomId = hash
					socket.emit('createRoom',{room : roomId, roomTitle : videoTitle});
					$state.go("home.stream", {roomId: roomId, currentVideo:videoId, host:true})

					setupPlayer(videoId, true)

					socket.on('newViewer', function(data){
						console.log("newViewer")
						socket.emit('currentVideo',{
							currentVideo: currentVideo,
							roomId : roomId
						});

						if($window.youtubePlayer.getCurrentTime() > 0)
						socket.emit('hostPlayerState',
						{
							currentTime: $window.youtubePlayer.getCurrentTime(),
							currentState: $window.youtubePlayer.getPlayerState(),
							room : roomId
						});
					})
				});
			}

			//makes the viewers synch to the host whenever the host emits a time event
			//recieves this event from the server when the server hears the hostPlayerState
			//even
			if(!host){
				socket.emit ('joinRoom', {room: roomId});

				socket.on("currentVideo", function(data){
					console.log("got data", data)
					setupPlayer(data.currentVideo, false)
				})

				socket.on("hostPlayerSync", function(data){
					console.log(data, "hostPlayerSync -- viewer")
					$window.youtubePlayer.seekTo(data.currentTime)
				})
			}

			socket.on('serverStateChange', function(data) {
				console.log('server changed my state', data);
				if (data === 2) {
					$window.youtubePlayer.pauseVideo();
				}
				if (data === 1) {
					$window.youtubePlayer.playVideo();
				}
			});

		};

		//submits the message through socket IO whenever one is made
		$window.submitMessage = function(user, message){
			console.log("Message submitted")
			//grabs the username from Google account
			var username = $rootScope.user.username
			var userImage = $rootScope.user.photo
			//since our socket only currently sends to people who did
			//not brodcast we need to add the message to our messages array
			socket.emit('newMessage', {
				"user" : username,
				"message" : message,
				"userImage" : userImage,
				"room": roomId
			});
		}


		return {
			setupPlayer: setupPlayer,
			submitMessage : submitMessage,
			messages : messages,
			submitRoom: submitRoom
		};
	})
