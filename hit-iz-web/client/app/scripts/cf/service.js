'use strict';


angular.module('cf').factory('CF',
    ['$rootScope', '$http', '$q', 'Message', 'Tree', function ($rootScope, $http, $q, Message, Tree) {
        var CF = {
            editor: null,
            cursor: null,
            tree: new Tree(),
            testCase: null,
            selectedTestCase: null,
            message: new Message(),
            searchTableId: 0
        };

        return CF;
    }]);


angular.module('cf').factory('CFTestCaseListLoader', ['$q', '$http', 'StorageService','$timeout',
    function ($q, $http, StorageService,$timeout) {
        return function () {
            var delay = $q.defer();
//                $http.get("api/cf/testcases", {timeout: 180000}).then(
//                    function (object) {
//                         delay.resolve(angular.fromJson(object.data));
//                    },
//                    function (response) {
//                        delay.reject(response.data);
//                    }
//                );
                $http.get('../../resources/cf/testCases.json').then(
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



