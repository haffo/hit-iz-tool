'use strict';


angular.module('upload').factory('uploadService',  ['$rootScope', '$http', '$q', 'Message', 'Tree', function ($rootScope, $http, $q, Message, Tree) {

    var factory = {};


    	
   }]);



angular.module('upload').factory('ProfileGroupListLoader', ['$q', '$http',
    function ($q, $http) {
        return function (scope) {
            var delay = $q.defer();
            $http.get("api/gvt/profileGroups", {timeout: 180000, params: {"scope": scope}}).then(
                function (object) {
                    delay.resolve(angular.fromJson(object.data));
                },
                function (response) {
                    delay.reject(response.data);
                }
            );
            return delay.promise;
        };
    }
]);


