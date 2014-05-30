var app = angular.module('Mampf-Angular', [
  "ngRoute",
  "ngTouch",
  "mobile-angular-ui"
]);

app.config(function($routeProvider, $locationProvider) {
  $routeProvider.when('/',          {templateUrl: "home.html"});
  $routeProvider.when('/details',    {templateUrl: "details.html"}); 
});

app.controller('MainController', function($rootScope, $scope){

  // General
  $rootScope.$on("$routeChangeStart", function(){
    $rootScope.loading = true;
  });

  $rootScope.$on("$routeChangeSuccess", function(){
    $rootScope.loading = false;
  });

  // Details Screen
  // Test User Agent
  $scope.userAgent = "Press Button!"; 
  $scope.checkAgent = function(){
    $scope.userAgent =  navigator.userAgent;  
  };

  // Mampf Backend Connection
  $scope.testMampfString = "Press Button!";
  $scope.mampfCon = new MampfAPI(BACKEND_URL);
  
  $scope.testBackendCon = function(){
    //Test backend connection with demo values from mampfBackendConnection.js
    $scope.mampfCon.config = new MampfRequest(demoIdentity, demoInvitees, demoCurrentPosition, demoTimeSlots);
    $scope.mampfCon.findMatches();
    $scope.testMampfString = "Check Console!";
  }; 
  
});