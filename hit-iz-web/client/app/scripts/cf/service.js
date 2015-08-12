'use strict';


angular.module('cf').factory('CF',
    ['$rootScope', '$http', '$q', 'HL7', 'Editor', 'EDICursor', 'Er7Message', 'Tree', function ($rootScope, $http, $q, HL7, Editor, EDICursor, Er7Message, Tree) {
        var CF = {
            editor: new Editor(),
            cursor: new EDICursor(),
            tree: new Tree(),
            dqaValidationResult: null,
            testCase: null,
            selectedTestCase: null,
            message: new Er7Message(),
            searchTableId: 0        };

        return CF;
    }]);


angular.module('cf').factory('CFTestCaseListLoader', ['$q', '$http',
    function ($q, $http) {
        return function () {
            var delay = $q.defer();
            $http.get("api/cf/testcases").then(
                function (object) {
                    delay.resolve(angular.fromJson(object.data));
                },
                function (response) {
                    delay.reject(response.data);
                }
            );

//            $http.get('../../resources/cf/testCases.json').then(
//                function (object) {
//                    delay.resolve(angular.fromJson(object.data));
//                },
//                function (response) {
//                    delay.reject(response.data);
//                }
//            );

            return delay.promise;
        };
    }
]);



