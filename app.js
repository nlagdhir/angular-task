var app = angular.module("myApp", ["ngRoute"]);

app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "list.htm",
        controller : "commonCtrl",
        
    })
    .when("/weather/:woeid", {
        templateUrl : "details.htm",
        controller : "commonCtrl"
    })
    .when("/search/:keyword", {
        templateUrl : "list.htm",
        controller : "commonCtrl",
    });
});


app.controller('commonCtrl', function($scope, $rootScope, $http, $location, $timeout) {
	$scope.baseUrl = 'weather.php'; 
	$rootScope.location = $location;
    $scope.cityListObj = []; 
	$scope.cityDetailsObj = {}; 
   	$scope.msg = ''; 
    $scope.getList = function(ids, isInternal){
    	$scope.cityListObj = []; 
    	if($location.path().indexOf('search/') !== -1 && isInternal == undefined){
    	 	$scope.searchWeather();
    	 	return false;
    	}
    	 
    	
    	$scope.cityIdsList = [2344116,638242,44418,565346,560743,9807];//2295402
    	if(ids){
    		$scope.cityIdsList = ids;
    	}
     
        for(var i = 0; i < $scope.cityIdsList.length; i++) {
	    	var id = $scope.cityIdsList[i];
	        $http.get($scope.baseUrl+"?command=location&woeid="+id).then(function(data){
	             
	            var dataArr = data.data.consolidated_weather[0];
	            $scope.cityListObj.push({   
	            		name:data.data.title,
	            		minW:dataArr.min_temp,
	            		maxW:dataArr.max_temp,
	            		whether:dataArr.the_temp,
	            		id:id,
	            		stateIcon :dataArr.weather_state_abbr
	            });
	       
	            if($scope.cityIdsList.length == i){
	            	$scope.isLoaded = true;
	            }
	            
	        },function(error) {
		      	$scope.msg = 'Something went wrong.';
		    });
	    } 
    }

    $scope.getDetailsPage = function(id){
    	$location.search('search', null)
    	$location.path('/weather/'+id);
    	 
    }

    $scope.getDetailByWoeid = function(id){
    	$scope.tmpUrl = $location.absUrl().split('/');
    	$scope.woeid = $scope.tmpUrl[$scope.tmpUrl.length - 1];
    	if($scope.woeid != undefined && !isNaN($scope.woeid)){
    		$scope.isLoaded = false;
			$http.get($scope.baseUrl+"?command=location&woeid="+$scope.woeid)
	    	.then(function(data){
	            $scope.cityDetailsObj = data;
	            $scope.isLoaded = true;
		    },
		    function(error) {
		      	$scope.msg = 'Not found..';
		    });
    	}else{
    		$scope.msg = 'Woeid is not valid please try again with another woeid.';
    	}
    }

    $scope.searchPage = function(){
    	$location.path('/search/'+$scope.searchValue);
    }
     

    $scope.searchWeather = function(){
    	
    	$scope.tmpUrl = $location.absUrl().split('/');
    	$scope.keyword = $scope.tmpUrl[$scope.tmpUrl.length - 1];
    	$scope.searchValue = $scope.keyword;
    	//$location.search('search', $rootScope.search);
    	$scope.ids = [];
    	$scope.msg = '';
    	 
    	if($scope.keyword != undefined){
    		$scope.isLoaded = false;
			$http.get($scope.baseUrl+"?command=search&keyword="+$scope.keyword)
	    	.then(function(data){
				angular.forEach(data.data, function(value, key){
				   	$scope.ids.push(value.woeid);
				});
				if($scope.ids.length > 0){
					$scope.isLoaded = true;
					$scope.getList($scope.ids, true);
				}else{
					$scope.isLoaded = false;
    			    $scope.msg = 'No results were found. Try changing the keyword!';
				}
				
	        },
		    function(error) {
		      	$scope.msg = 'Not found..';
		    });
    	}else{
    		$scope.msg = 'Woeid is not valid please try again with another woeid.';
    	}
    }

     

    $scope.dateFormate = function(date){
 
    	return moment(date).format('DD-MMMM-YY');;
    }

});


app.component('weather', {
  templateUrl: 'cityListItem.htm',
  controller: 'commonCtrl',
  bindings: {
    city: '=',
    onUpdate: '&',
  }
});