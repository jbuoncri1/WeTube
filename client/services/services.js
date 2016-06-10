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

		return {
			checkLoggedIn: checkLoggedIn,
			isAuthenticated: isAuthenticated
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

		socket.on("friendRequest", function (data){
			friendRequests.push(data)
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

		// for setting the the original person online
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
			// need to keep reference to the same object to keep it in the digest cycle
			for(var key in currentStatus){
				if(!(key in newStatusObj)){
					delete currentStatus[key]
				}
			}
			helperFunctions.extend(currentStatus, newStatusObj)

			for(var friendId in friends){
				if(friends[friendId].currentStatus.online){
					sendStatus(friendId)
				}
			}
			$cookies.putObject("currentStatus", currentStatus)
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

		var cancelFriendRequest = function(targetId){
			return $http({
				method: "PUT",
				url: "/friendRequest",
				data: {
					userData: userData,
					targetId: targetId
				}
			}).then(function (response){
				if(response.status === 204){
					for(var i = 0; i < friendRequests.length; i++){
						if(friendRequests[i].id === targetId){
							friendRequests.splice(i,1)
						}
					}
				}
			})
		}

		var getFriendRequests = function(){
			return $http({
				method: 'GET',
				url: "friendRequests/" + userData.id
			}).then(function (response){
				console.log(response.data)
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
			cancelFriendRequest: cancelFriendRequest,
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
		//can be refactored into an object
		var roomSubscribers = [];
		var roomListeners = [];


		var clearRoomData = function(){
			videoQueue = [];
			roomId = "";
			host = false; 
			currentVideo = '';
			streamMessages = [];
			roomSubscribers = [{ userId:userData.getUserData().id, displayName: userData.getUserData().displayName}];
		}

		var clearRoomListeners = function(){
			for(var i = 0; i < roomListeners.length; i++){
				socket.off(roomListeners[i])
			}
		}

		var addRoomSubscriber = function (newSubscriber){
			if(newSubscriber.id){
				testId = newSubscriber.id
			} else {
				testId = newSubscriber.userId
			}
			var userPresent = false
			for(var i = 0; i < roomSubscribers.length; i++){
				if(roomSubscribers[i].userId === testId){
					userPresent = true
				}
			}
			if(!userPresent){
				roomSubscribers.push({userId:testId, displayName:newSubscriber.displayName})
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
			hasYT = true;
			youtubePlayer = new YT.Player('player', {
				height: '400',
				width: '600',
				videoId: videoId,
				events: {
					'onStateChange': onYoutubeStateChange,
				}
			});
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
			clearRoomListeners()
			clearRoomData()

			roomId = source
			currentVideo = videoId
			host = isHost

			var displayName = userData.getUserData().displayName 
			if(host){
				bcrypt.hash(displayName, 8, function(err, hash) {
					roomId = hash
					userData.updateStatus({inRoom:roomId, watching:videoTitle, videoId:currentVideo, online:true})

					socket.emit('createRoom',{room : roomId, roomTitle : videoTitle});
					$state.go("home.stream", {roomId: roomId, currentVideo:videoId, host:true})

					roomListeners.push('newViewer')
					socket.on('newViewer', function(data){
						$rootScope.$apply(addRoomSubscriber(data))

						socket.emit("currentRoomSubscribers", {roomSubscribers:roomSubscribers, room:roomId, videoQueue: videoQueue})
					})

					roomListeners.push('getPlayerState')
					socket.on('getPlayerState', function(){
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
				$state.go("home.stream", {roomId: roomId, currentVideo:videoId, host:host})

				socket.emit('joinRoom', {room: roomId, userData: userData.getUserData()});

				userData.updateStatus({inRoom:roomId, watching:videoTitle, videoId:videoId, online:true})

				roomListeners.push('currentRoomSubscribers')
				socket.on("currentRoomSubscribers", function(data){
					if(roomSubscribers.length === 1){
						data.videoQueue.forEach(function(video){
							$rootScope.$apply(videoQueue.push(video))
						})
						data.roomSubscribers.forEach(function(subscriber){
							$rootScope.$apply(addRoomSubscriber(subscriber))
						})
					}
				})

				roomListeners.push('newViewer')
				socket.on('newViewer', function(data){
					$rootScope.$apply(addRoomSubscriber(data))
				})

				roomListeners.push('currentVideo')
				socket.on("currentVideo", function(data){
					setupPlayer(data.currentVideo, false)
				})

				roomListeners.push('hostPlayerSync')
				socket.on("hostPlayerSync", function(data){

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


			//listeners for everybody
			roomListeners.push('leavingRoom')
			socket.on('leavingRoom', function(data){
				for(var i = 0; i < roomSubscribers.length; i++){
					if(roomSubscribers[i].userId === data){
						$rootScope.$apply(roomSubscribers.splice(i,1))
					}
				}
			})

			roomListeners.push('viewerDisconnect')
			socket.on('viewerDisconnect', function(data){
				for(var i = 0; i < roomSubscribers.length; i++){
					if(roomSubscribers[i].userId === data){
						$rootScope.$apply(roomSubscribers.splice(i,1))
					}
				}
			})

			roomListeners.push('serverStateChange')
			socket.on('serverStateChange', function(data) {
				if (data === 2) {
					youtubePlayer.pauseVideo();
				}
				if (data === 1) {
					youtubePlayer.playVideo();
				}
			});

			roomListeners.push('newStreamMessage')
			socket.on("newStreamMessage", function (data){
				$rootScope.$apply(streamMessages.push(data))
			})

			roomListeners.push('newVideo')
			socket.on("newVideo", function (data){
				$rootScope.$apply(videoQueue.push(data))
			})
			
			roomListeners.push('removeVideo')
			socket.on("removeVideo", function (data){
				$rootScope.$apply(videoQueue.splice(data,1))
			})

			roomListeners.push('playVideoFromQueue')
			socket.on("playVideoFromQueue", function (data){
				$rootScope.$apply(videoQueue.splice(data.index,1))
				youtubePlayer.loadVideoById(data.videoData.videoId)
				userData.updateStatus({inRoom:roomId, watching:data.videoData.videoTitle, videoId:data.videoData.videoId, online:true})
			})		


		};

		var addVideoToQueue = function(video){
			socket.emit('newVideo', {room:roomId, video:video})
		}

		var removeVideoFromQueue = function(index){
			socket.emit('removeVideo', {room:roomId, index:index})
		}

		var playVideoFromQueue = function(videoData, index){
			socket.emit('playVideoFromQueue', {room:roomId, videoData:videoData, index:index})
		}

		//submits the message through socket IO whenever one is made
		var submitMessage = function(message){


			var messageObject = {
				"userId" : userData.getUserData().id,
				"displayName" : userData.getUserData().displayName,
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
			clearRoomData: clearRoomData,
			removeVideoFromQueue: removeVideoFromQueue,
			playVideoFromQueue: playVideoFromQueue
		};
	})
