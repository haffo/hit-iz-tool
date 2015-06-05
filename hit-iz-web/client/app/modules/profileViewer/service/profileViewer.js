'use strict';

angular.module('profile-viewer').factory('Profile', ['Resource',
    function ($resource) {
        return $resource('api/cf/profiles/:id', {id:'@id'});
    }
]);


//angular.module('iz-tool-services').factory('TestPlan', ['Resource',
//    function ($resource) {
//        return $resource('api/testPlans/:id', {id:'@id'});
//    }
//]);
//
//angular.module('iz-tool-services').factory('TestCase', ['Resource',
//    function ($resource) {
//        return $resource('api/testCases/:id', {id:'@id'});
//    }
//]);



angular.module('profile-viewer').factory('ProfileLoader',['$http', '$q', function($http, $q){
    return function(profileId) {
        var delay = $q.defer();
//        Profile.get({id:profileId},
//            function(profile) {
//                //console.log('Fetched profile ' + profileId);
//                delay.resolve(profile);
//            },
//            function(response) {
//                //console.log('Error fetching the profile ' + profileId);
//                if(response.status === 404) {
//                    delay.reject('Cannot find the profile');
//                }else{
//                    delay.reject('Unable to load the profile');
//                }
//            }
//        );


        $http.get('api/cf/profiles/'+profileId, {timeout: 60000}).then(
            function(object) {
                //console.log('profile model created');
                delay.resolve(angular.fromJson(object.data));
            },
            function(response) {
                //console.log('Error creating the profile model');
                if(response.status === 404) {
                    delay.reject('Cannot create profile tree');
                }else{
                    delay.reject('Unable to create the profile tree');
                }
            }
        );


//         $http.get('../../resources/profileModel.json').then(
//            function(object) {
//                //console.log('message instance created');
//                delay.resolve(angular.fromJson(object.data));
//                //alert(object.data);
//            },
//            function(response) {
//                //console.log('Error creating the message object');
//                if(response.status === 404) {
//                    delay.reject('Cannot create profile model');
//                }else{
//                    delay.reject('Unable to create the profile model');
//                }
//            }
//        );


        return delay.promise;
    };
}]);


angular.module('profile-viewer').factory('ProfileListLoader',['$http', '$q', function($http, $q){
    return function() {
        var delay = $q.defer();
//
//        delay.resolve(angular.fromJson([{"id":-6809056368556385580,"name":"TestCase--764158990","description":null,"testPlan":{"id":2741658173298587115,"name":"TestPlan-HW","description":null,"version":null},"version":null},{"id":-1120428274566795705,"name":"TestCase--305945197","description":null,"testPlan":{"id":-8425874599493272210,"name":"TestPlan-HW","description":null,"version":null},"version":null},{"id":2166707072108434465,"name":"TestCase--727770102","description":null,"testPlan":{"id":-8312851799753668264,"name":"TestPlan-HW","description":null,"version":null},"version":null},{"id":-6132644670632299670,"name":"TestCase--660697277","description":null,"testPlan":{"id":-3763368485650298646,"name":"TestPlan-HW","description":null,"version":null},"version":null}]
//        ));
//
////
//        Profile.query(
//            function(testCases) {
////                console.log('Fetched profiles. Total= ' + testCases.length);
//                delay.resolve(testCases);
//            },
//            function(response) {
////                console.log('Error fetching the profiles');
//                delay.reject("Sorry, Cannot load the profiles from the server");
//            }
//        );
//

        $http.get('api/cf/profiles', {timeout: 60000}).then(
            function(object) {
                //console.log('profile model created');
                delay.resolve(angular.fromJson(object.data));
            },
            function(response) {
                //console.log('Error creating the profile model');
                if(response.status === 404) {
                    delay.reject('Cannot create profile tree');
                }else{
                    delay.reject('Unable to create the profile tree');
                }
            }
        );

        return delay.promise;
    };
}]);



//angular.module('iz-tool-services').factory('ProfileListLoader',['Profile', '$q', function(Profile, $q){
//    return function() {
//        var delay = $q.defer();
//
//        delay.resolve(angular.fromJson([{"id":1,"name":"ELR1 1","description":"", "category":{"id":1,"name":"ELR","version":0}}, {"id":2,"name":"ELR 2","description":"", "category":{"id":1,"name":"ELR","version":0}}, {"id":3,"name":"IZ 1","description":"", "category":{"id":2,"name":"IZ","version":0}},{"id":4,"name":"IZ 2","description":"", "category":{"id":2,"name":"IZ","version":0}}]));
//
//
////        Profile.query(
////            function(profiles) {
////                console.log('Fetched profiles. Total= ' + profiles.length);
////                delay.resolve(profiles);
////            },
////            function(response) {
////                console.log('Error fetching the profiles');
////                delay.reject('Cannot load the profiles');
////            }
////        );
//        return delay.promise;
//    };
//}]);


angular.module('profile-viewer').factory('ProfileModelLoader',['$http', '$q', function($http, $q){
    return function(profileId) {
        var delay = $q.defer();
//        var data = angular.fromJson({"profileId":profileId});

//        $http.get('../../resources/profileModel.json').then(
//            function(object) {
//                //console.log('message instance created');
//                delay.resolve(angular.fromJson(object.data));
//                //alert(object.data);
//            },
//            function(response) {
//                //console.log('Error creating the message object');
//                if(response.status === 404) {
//                    delay.reject('Cannot create profile model');
//                }else{
//                    delay.reject('Unable to create the profile model');
//                }
//            }
//        );


         $http.get('api/cf/profiles/'+ profileId+ '/parse', {cache: true, isArray:true,timeout: 60000}).then(
            function(object) {
                //console.log('profile model created');
                delay.resolve(angular.fromJson(object.data));
            },
            function(response) {
                //console.log('Error creating the profile model');
                if(response.status === 404) {
                    delay.reject('Cannot create profile tree');
                }else{
                    delay.reject('Unable to create the profile tree');
                }
            }
        );
        return delay.promise;
    };
}]);




