'use strict';


angular.module('cb').factory('CB',
    ['Message', 'ValidationSettings', 'Tree', 'StorageService', 'Transport','Logger', 'User', function (Message, ValidationSettings,Tree,StorageService,Transport,Logger, User) {

        var initTransport = function(){
            var transport = new Transport();
            if(StorageService.get(StorageService.USER_CONFIG_KEY) != null) {
                transport.config = angular.fromJson(StorageService.get(StorageService.USER_CONFIG_KEY));
            }
            return transport;
        };
        var CB = {
            testCase: null,
            selectedTestCase: null,
            editor:null,
            tree: new Tree(),
            transport:  initTransport(),
            cursor: null,
            message: new Message(),
            logger: new Logger(),
            validationSettings: new ValidationSettings(),
            setContent: function (value) {
                CB.message.content = value;
                CB.editor.instance.doc.setValue(value);
                CB.message.notifyChange();
            },
            getContent: function () {
                return  CB.message.content;
            }
        };

        return CB;
    }]);


angular.module('cb').factory('CBTestCaseListLoader', ['$q','$http',
    function ($q,$http) {
        return function() {
            var delay = $q.defer();
            $http.get("api/cb/testcases").then(
                function (object) {
                    delay.resolve(angular.fromJson(object.data));
                },
                function (response) {
                    delay.reject(response.data);
                }
            );

//
//            $http.get("../../resources/erx/cb-testCases.json").then(
//                function (object) {
//                    delay.resolve(angular.fromJson(object.data));
//                },
//                function (response) {
//                    delay.reject(response.data);
//                }
//            );

//
//            $http.get("../../resources/cb/testPlans.json").then(
//                function (object) {
//                    delay.resolve(angular.fromJson(object.data));
//                },
//                function (response) {
//                    delay.reject(response.data);
//                }
//            );


//            $http.get("../../resources/cb/isolatedTestPlans.json").then(
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








