/**
 * Created by haffo on 9/18/14.
 */

//
//angular.module('tool-services').factory('MessageObjectLoader', ['$http', '$q', function ($http, $q) {
//    return function (testCaseId, message) {
//        var delay = $q.defer();
//        var data = angular.fromJson({"message": er7Message});
//
////        $http.get('../../resources/message.json').then(
////            function(object) {
////                console.log('message instance created');
////                delay.resolve(angular.fromJson(object.data));
////                //alert(object.data);
////            },
////            function(response) {
////                //console.log('Error creating the message object');
////                if(response.status === 404) {
////                    delay.reject('Cannot create message object');
////                }else{
////                    delay.reject('Unable to create the message object');
////                }
////            }
////        );
//
//        $http.post('api/testCases/'+ testCaseId + '/message/model', data).then(
//            function (object) {
//                delay.resolve(angular.fromJson(object.data));
//            },
//            function (response) {
//                delay.reject(response.data);
//            }
//        );
//        return delay.promise;
//    };
//}]);

angular.module('hit-tool-services').factory('TestingSettings',
    ['$rootScope', function ($rootScope) {
        var service = {
            activeTab:0,
            getActiveTab: function(){
                return service.activeTab;
            },
            setActiveTab: function(value){
                service.activeTab = value;
                service.save();
            },
            save: function () {
                sessionStorage.TestingActiveTab = service.activeTab;
            },
            restore: function () {
                service.activeTab = sessionStorage.TestingActiveTab != null && sessionStorage.TestingActiveTab != "" ? parseInt(sessionStorage.TestingActiveTab):0;
            }
        };
//        $rootScope.$on("TestingSettings:save", service.save);
//        $rootScope.$on("TestingSettings:restore", service.restore);
        return service;
    }]
);


angular.module('hit-tool-services').factory('StorageService',
    ['$rootScope','localStorageService', function ($rootScope, localStorageService) {
        var service = {
            activeTab:0,
            remove: function (key) {
                return localStorageService.remove(key);
            },

            removeList: function removeItems(key1, key2, key3) {
                return localStorageService.remove(key1, key2, key3);
            },

            clearAll: function () {
                return localStorageService.clearAll();
            },
            set : function(key, val) {
                return localStorageService.set(key, val);
            },
            get: function(key) {
                return localStorageService.get(key);
            }
        };
        return service;
    }]
);


