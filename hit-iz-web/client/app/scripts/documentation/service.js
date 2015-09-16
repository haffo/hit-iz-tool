
angular.module('documentation').factory('TestCaseDocumentationLoader',
    ['$q', '$http', function ($q, $http) {

        var TestCaseDocumentationLoader = function () {
        };


        TestCaseDocumentationLoader.prototype.getOneByStage = function (stage) {
            var delay = $q.defer();
//
//                $http.get('../../resources/documentation/testcases.json').then(
//            function (object) {
//                delay.resolve(angular.fromJson(object.data));
//            },
//            function (response) {
//                delay.reject(response.data);
//            }
//                );

            $http.get('api/documentation/testcases', {params: {"stage": stage}, timeout: 60000}).then(
                function (object) {
                    delay.resolve(angular.fromJson(object.data));
                },
                function (response) {
                    delay.reject(response.data);
                }
            );
            return delay.promise;
        };



        return TestCaseDocumentationLoader;
    }]);



