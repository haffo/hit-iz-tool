'use strict';


angular.module('isolated').factory('IsolatedSystem',
    ['$http', '$q', 'Editor', 'EDICursor', 'Er7Message', 'ValidationSettings', 'Tree', 'TransactionUser', '$rootScope', 'Logger',function ($http, $q, Editor, EDICursor, Er7Message, ValidationSettings,Tree,TransactionUser,$rootScope,Logger) {
        var IsolatedSystem = {
            testCase: null,
            testStep: null,
            selectedTestCase: null,
            editor: new Editor(),
            tree: new Tree(),
            cursor: new EDICursor(),
            message: new Er7Message(),
            validationSettings: new ValidationSettings(),
            logger: new Logger(),
            user: new TransactionUser(),
            setContent: function (value) {
                IsolatedSystem.message.content = value;
                IsolatedSystem.editor.instance.doc.setValue(value);
                IsolatedSystem.message.notifyChange();
            },
            getContent: function () {
                return  IsolatedSystem.message.content;
            }
        };

        return IsolatedSystem;
    }]);


angular.module('isolated').factory('IsolatedSystemTestCaseListLoader', ['$q','$http',
    function ($q,$http) {
        return function() {
            var delay = $q.defer();
            $http.get("api/isolated/testcases").then(
                function (object) {
                    delay.resolve(angular.fromJson(object.data));
                },
                function (response) {
                    delay.reject(response.data);
                }
            );

//                $http.get('../../resources/isolated/testPlans.json').then(
//                    function (object) {
//                        delay.resolve(angular.fromJson(object.data));
//                    },
//                    function (response) {
//                        delay.reject(response.data);
//                    }
//                );

            return delay.promise;
        };
    }
]);


angular.module('isolated').factory('IsolatedSystemInitiator',
    ['$q', '$http', function ($q, $http) {

        var IsolatedSystemInitiator = function () {
        };

        IsolatedSystemInitiator.prototype.send = function (user, testCaseId, content) {
            var delay = $q.defer();
            var data = angular.fromJson({"testCaseId": testCaseId, "content": content, "endpoint": user.receiverEndpoint, "u": user.receiverUsername, "p": user.receiverPassword, "facilityId": user.receiverFacilityId});
            $http.post('api/isolated/soap/send', data, {timeout: 60000}).then(
                function (response) {
                    delay.resolve(angular.fromJson(response.data));
                },
                function (response) {
                    delay.reject(response);
                }
            );

//            $http.get('../../resources/isolated/send.json').then(
//                function (response) {
//                    delay.resolve(angular.fromJson(response.data));
//                },
//                function (response) {
//                    delay.reject('Sorry,we did not get a response');
//                }
//            );
            return delay.promise;
        };


        return IsolatedSystemInitiator;
    }]);


angular.module('isolated').factory('IsolatedSystemClock', function ($interval, Clock) {
    return new Clock(1000);
});
