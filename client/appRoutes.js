app.config(function($routeProvider,$stateProvider, $urlRouterProvider, $sceDelegateProvider){

	var checkLoggedin = function($q, $http, $location, $rootScope) {
       var deferred = $q.defer();

       $http.get('/api/loggedin').success(function(user) {
         if (user !== '0') {
           $rootScope.user = user;
           deferred.resolve();
         } else {
           deferred.reject();
           $location.url('/login');
         }
       });

       return deferred.promise;
     };

  $urlRouterProvider.otherwise("/")

	$stateProvider
    .state("home", {
      url: "/home",
      templateUrl:"",
      controller:"",
    })
		.state("stream", {
      url: "/stream",
			templateUrl: "stream/stream.html",
			controller: "StreamController",
      authenticate: true
		})
		.state("login", {
      url: "/",
			templateUrl: "auth/login.html",
			controller: "AuthController"
		})


	$sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our assets domain.  Notice the difference between * and **.
    'https://www.youtube.com/**'
  ]);
})