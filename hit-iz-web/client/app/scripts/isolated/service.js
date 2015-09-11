'use strict';


angular.module('isolated').factory('IsolatedSystem',
    ['$http', '$q', 'Editor', 'EDICursor', 'Er7Message', 'ValidationSettings', 'Tree', 'TransactionUser', '$rootScope', 'Logger','StorageService',function ($http, $q, Editor, EDICursor, Er7Message, ValidationSettings,Tree,TransactionUser,$rootScope,Logger,StorageService) {
        var user = new TransactionUser();
        user.receiverUsername = StorageService.get(StorageService.SOAP_COMM_RECEIVER_USERNAME_KEY);
        user.receiverPassword = StorageService.get(StorageService.SOAP_COMM_RECEIVER_PWD_KEY);
        user.receiverFacilityId = StorageService.get(StorageService.SOAP_COMM_RECEIVER_FACILITYID_KEY);
        user.receiverEndpoint = StorageService.get(StorageService.SOAP_COMM_RECEIVER_ENDPOINT_KEY);
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
            user: user,
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


angular.module('isolated').factory('IsolatedExecutionService',
    ['$q', '$http', function ($q, $http) {

        var IsolatedExecutionService = function () {
        };

        IsolatedExecutionService.setExecutionStatus = function (step, value) {
            step.executionStatus = value;
        };

        IsolatedExecutionService.getExecutionStatus = function (step) {
            return step != null ? step.executionStatus: undefined;
        };

        IsolatedExecutionService.getValidationStatus = function (step) {
            return  step != null && step.validationReport && step.validationReport.result && step.validationReport.result.errors && step.validationReport.result.errors.categories[0] && step.validationReport.result.errors.categories[0].data ?  step.validationReport.result.errors.categories[0].data.length: -1;
        };

        IsolatedExecutionService.getValidationResult = function (step) {
            return step != null && step.validationReport ? step.validationReport.result: undefined;
        };

        IsolatedExecutionService.setExecutionMessage = function (step, value) {
            step.executionMessage = value;
        };

        IsolatedExecutionService.getExecutionMessage = function (step) {
            return step != null ? step.executionMessage: undefined;
        };


        IsolatedExecutionService.setMessageTree = function (step, value) {
            step.messageTree = value;
        };

        IsolatedExecutionService.getMessageTree = function (step) {
            return step != null ? step.messageTree: undefined;
        };

        IsolatedExecutionService.getValidationReport = function (step) {
            return step != null ? step.validationReport: undefined;
        };

        IsolatedExecutionService.setValidationReport = function (step, value) {
            step.validationReport = value;
        };


        IsolatedExecutionService.deleteExecutionStatus = function (step) {
            delete step.executionStatus;
        };

        IsolatedExecutionService.deleteValidationReport = function (step) {
            if(step && step.validationReport) {
                delete step.validationReport ;
            }
        };

        IsolatedExecutionService.deleteExecutionMessage = function (step) {
            if(step && step.executionMessage) {
                delete step.executionMessage;
            }
        };

        IsolatedExecutionService.deleteMessageTree = function (step) {
            if(step && step.messageTree) {
                delete step.messageTree;
            }
        };



        return IsolatedExecutionService;
    }]);



angular.module('isolated').factory('IsolatedSystemClock', function ($interval, Clock) {
    return new Clock(1000);
});
