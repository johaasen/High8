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
  $scope.userAgent = "Press Button!"; 
  $scope.checkAgent = function(){
    $scope.userAgent =  navigator.userAgent;  
  }
  
});