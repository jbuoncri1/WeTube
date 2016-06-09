angular.module('services', [])

	.factory("helperFunctions", function(){
		//extend will overWriteOldProperties
		var extend = function(oldObj, newObj){
			for(var key in newObj){
				oldObj[key] = newObj[key]
			}
		}

		return {
			extend: extend
		}
	})

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

	.factory('userData', function ($http, $window, $rootScope, $cookies, helperFunctions) {
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
		var friendRequests = []
		var friends = {}

		var currentStatus = {
			// status:"",
			// watching: "",
			// videoId: "",
			// inRoom: "",
		}

		$window.socket = io.connect('http://localhost:8001');


		socket.on('newMessage', function (data) {
			tryNewMessageBox(data.userData, data.message)
		})

		socket.on('getStatus', function (data){
			$rootScope.$apply(friends[data.originId].currentStatus = data.currentStatus)
			sendStatus(data.originId)
		})

		socket.on('sendingStatus', function (data){
			$rootScope.$apply(friends[data.originId].currentStatus = data.currentStatus)
		})

		socket.on('viewerDisconnect', function (data){
			$rootScope.$apply(friends[data].currentStatus = {})
		})

		socket.on("friendAdded", function (data){
			$rootScope.$apply(friends[data.id] = data)
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

		var sendStatus = function(targetId){
			socket.emit("sendingStatus", {
				currentStatus: currentStatus,
				targetId: targetId,
				originId: userData.id
			})
		}

		var getStatus = function(targetId){
			socket.emit("getStatus", {targetId: targetId, originId: userData.id, currentStatus: currentStatus})
		}

		var getMyCurrentStatus = function(){
			return currentStatus
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
			updateStatus({online: true})

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
				message: {text:message}
			})
			conversations[targetId].messages.push({text:message, isUser:true})
		}

		var updateUserData = function(newUserData){
			helperFunctions.extend(userData, newUserData)
			$cookies.putObject("userData", newUserData)
		}

		var updateStatus = function(newStatusObj){
			helperFunctions.extend(currentStatus, newStatusObj)
			for(var friendId in friends){
				if(friends[friendId].currentStatus.online){
					sendStatus(friend.id)
				}
			}
			$cookies.putObject("currentStatus", currentStatus)
			console.log("status", currentStatus, userData)
		}

		var localFriendRequests = function(){
			return friendRequests
		}

		var localFriends = function(){
			return friends
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
				if(response.status === 200){
					for(var i = 0; i < friendRequests.length; i ++){
						if(friendRequests[i].id === id){
							friendRequests.splice(i,1)
						}
					}
				}
				return response.data
			})
		}

		var sendFriendRequest = function(id){
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
				friendRequests = response.data
			})	
		}

		var getFriends = function(){
			return $http({
				method: 'GET',
				url: "friends/" + userData.id
			}).then(function (response){
				for(var i = 0; i < response.data.length; i++){
					friend = response.data[i]
					friend.currentStatus = {};
					friends[friend.id] = friend
				}
				getFriendsStatus()
			})	
		}

		var getFriendsStatus = function(){
			for (var friend in friends){
				getStatus(friend)
			}
		}

		if($cookies.getObject("userData")){
			var userData = $cookies.getObject("userData")
			buildOwnRoom()
		}
		if($cookies.getObject("currentStatus")){
			var currentStatus = $cookies.getObject("currentStatus")
		}
		
		return {
			createUser: createUser,
			loginUser: loginUser,
			updateUserData: updateUserData,
			getUserData: getUserData,
			addFriend: addFriend,
			sendFriendRequest: sendFriendRequest,
			getFriendRequests: getFriendRequests,
			getFriends: getFriends,
			peerToPeerMessage: peerToPeerMessage,
			getMessageBoxes: getMessageBoxes,
			messageBoxes: messageBoxes,
			tryNewMessageBox: tryNewMessageBox,
			closeMessageBox: closeMessageBox,
			friendRequests: friendRequests,
			localFriendRequests: localFriendRequests,
			localFriends: localFriends,
			updateStatus: updateStatus,
			getMyCurrentStatus: getMyCurrentStatus
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

		var videoQueue = [];
		var roomId;
		var host; 
		var currentVideo = '';
		var streamMessages = [];
		var hasYT = false;
		var youtubePlayer;
		var roomSubscribers = [];


		var clearRoomData = function(){
			videoQueue = [];
			roomId = "";
			host = false; 
			currentVideo = '';
			streamMessages = [];
			//can be refactored into an object
			roomSubscribers = [{ userId:userData.getUserData().id, displayName: userData.getUserData().displayName}];
		}

		var addRoomSubscriber = function (newSubscriber){
			var userPresent = false
			for(var i = 0; i < roomSubscribers.length; i++){
				if(roomSubscribers[i].id === newSubscriber.id){
					userPresent = true
				}
			}
			if(!userPresent){
				roomSubscribers.push({userId:newSubscriber.id, displayName:newSubscriber.displayName})
			}
		}
		addRoomSubscriber(userData.getUserData())

		var getRoomSubscribers = function(){
			return roomSubscribers
		}

		var getStreamMessages = function(){
			return streamMessages
		}

		var getVideoQueue = function(){
			return videoQueue
		}

		var onYoutubeStateChange = function() {
			console.log('state change!',youtubePlayer.getPlayerState())

			if(!host){
				socket.emit('clientPlayerStateChange', {
					stateChange: youtubePlayer.getPlayerState(),
					room: roomId
				})
			} else {
				socket.emit('hostPlayerState',
				{
					currentTime: youtubePlayer.getCurrentTime(),
					currentState: youtubePlayer.getPlayerState(),
					room : roomId
				});
			}
		};

		//at the end of setupPlayer onYouTubeIframeAPIReady is automatically called
		var setupPlayer = function(source) {
			videoId = source
			var tag = document.createElement('script');
			tag.src = "https://www.youtube.com/iframe_api";
			var firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
			if(hasYT){
				onYouTubeIframeAPIReady()
			}
		};
		//updated by setupPlayer b/c setupPlayer cannot directly pass into
		//onYouTubeIframeAPIReady

		$window.onYouTubeIframeAPIReady=function() {
			console.log('youtube iFrame ready!');

			hasYT = true;
			youtubePlayer = new YT.Player('player', {
				height: '400',
				width: '600',
				videoId: videoId,
				events: {
					'onStateChange': onYoutubeStateChange,
				}
			});
			console.log(youtubePlayer)
			console.log(roomId, "id")
			if(!host){
				socket.emit('getPlayerState', roomId)
			}
		}
		var currentStatus = {
			// status:"",
			// watching: "",
			// inRoom: "",
		}
			//sets up the socket stream and events
		var submitRoom = function(videoId, videoTitle, isHost, source){

			roomId = source
			currentVideo = videoId
			host = isHost

			var displayName = userData.getUserData().displayName 
			if(host){
				bcrypt.hash(displayName, 8, function(err, hash) {
					roomId = hash
					console.log(roomId, hash)
					userData.updateStatus({inRoom:roomId, watching:videoTitle, videoId:videoId})

					socket.emit('createRoom',{room : roomId, roomTitle : videoTitle});
					$state.go("home.stream", {roomId: roomId, currentVideo:videoId, host:true})

					socket.on('newViewer', function(data){
						console.log("newViewer", data)
						$rootScope.$apply(addRoomSubscriber(data))

						socket.emit("currentRoomSubscribers", {roomSubscribers:roomSubscribers, room:roomId, videoQueue: videoQueue})
					})

					socket.on('getPlayerState', function(){
						console.log("sending state", roomId)
						socket.emit('hostPlayerState',
						{
							currentTime: youtubePlayer.getCurrentTime(),
							currentState: youtubePlayer.getPlayerState(),
							room : roomId
						});
					})

				});
			}

			//makes the viewers synch to the host whenever the host emits a time event
			//recieves this event from the server when the server hears the hostPlayerState
			//even
			if(!host){
				socket.emit ('joinRoom', {room: roomId, userData: userData.getUserData()});

				userData.updateStatus({inRoom:roomId, watching:videoTitle, watching:videoId})

				$state.go("home.stream", {roomId: roomId, currentVideo:videoId, host:host})

				socket.on("currentRoomSubscribers", function(data){
					if(roomSubscribers.length === 1){
						console.log(data, "newStuff")
						$rootScope.$apply(videoQueue = data.videoQueue)
						$rootScope.$apply(roomSubscribers = data.roomSubscribers)
						console.log(roomSubscribers)
					}
				})

				socket.on('newViewer', function(data){
					console.log(data)
					$rootScope.$apply(addRoomSubscriber(data))
				})

				socket.on("currentVideo", function(data){
					console.log("got data", data)
					setupPlayer(data.currentVideo, false)
				})

				socket.on("hostPlayerSync", function(data){
					console.log(data, "hostPlayerSync -- viewer")

					if (data.currentState === 2) {
						youtubePlayer.pauseVideo();
					}else	if (data.currentState === 1) {
						youtubePlayer.playVideo();
					}
					2
					var currentTime = youtubePlayer.getCurrentTime() 
					if(Math.abs(currentTime - data.currentTime) > 1 || data.currentState === 2){
						youtubePlayer.seekTo(data.currentTime)
					}
				})
			}


	
			socket.on('leavingRoom', function(data){
				console.log("leaving", data)
				for(var i = 0; i < roomSubscribers.length; i++){
					if(roomSubscribers[i].userId === data){
						$rootScope.$apply(roomSubscribers.splice(i,1))
					}
				}
			})

			socket.on('viewerDisconnect', function(data){
				for(var i = 0; i < roomSubscribers.length; i++){
					if(roomSubscribers[i].userId === data){
						$rootScope.$apply(roomSubscribers.splice(i,1))
					}
				}
				console.log("viewer dissconnected", data)
			})

			socket.on('serverStateChange', function(data) {
				console.log('server changed my state', data);
				if (data === 2) {
					youtubePlayer.pauseVideo();
				}
				if (data === 1) {
					youtubePlayer.playVideo();
				}
			});

			socket.on("newStreamMessage", function (data){
				$rootScope.$apply(streamMessages.push(data))
			})

			socket.on("newVideo", function (data){
				console.log('new Vid')
				$rootScope.$apply(videoQueue.push(data))
			})


		};

		var addVideoToQueue = function(video){
			socket.emit('newVideo', {room:roomId, video:video})
		}

		//submits the message through socket IO whenever one is made
		var submitMessage = function(message){


			var messageObject = {
				"userId" : userData.getUserData().id,
				"message" : message,
				"room" : roomId
			}
			//grabs the username from Google account
			socket.emit('newStreamMessage', messageObject);
			messageObject['isUser'] = true
			streamMessages.push(messageObject)
		}


		return {
			setupPlayer: setupPlayer,
			submitMessage : submitMessage,
			streamMessages : streamMessages,
			getStreamMessages: getStreamMessages,
			addVideoToQueue: addVideoToQueue,
			getVideoQueue: getVideoQueue,
			submitRoom: submitRoom,
			getRoomSubscribers: getRoomSubscribers,
			clearRoomData: clearRoomData
		};
	})
