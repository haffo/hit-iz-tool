'use strict';
angular.module('connectivity').factory('Connectivity',
    ['$rootScope', '$http', '$q', 'ConnectivityPart', 'Logger', 'Endpoint', 'SOAPConnectivityTransport', 'StorageService', function ($rootScope, $http, $q, ConnectivityPart, Logger, Endpoint, SOAPConnectivityTransport, StorageService) {
//
//        var initTransport = function () {
//            var transport = new SOAPConnectivityTransport();
//            if (StorageService.get(StorageService.USER_CONFIG_KEY) != null) {
//                transport.config = angular.fromJson(StorageService.get(StorageService.USER_CONFIG_KEY));
//            }
//            return transport;
//        };

        var Connectivity = {
            testCase: null,
            selectedTestCase: null,
            logger: new Logger(),
            request: new ConnectivityPart(),
            response: new ConnectivityPart()
        };
        return Connectivity;
    }]);


angular.module('connectivity').factory('ConnectivityTestCaseListLoader', ['$q', '$http',
    function ($q, $http) {
        return function () {
            var delay = $q.defer();
//            $http.get('../../resources/connectivity/testCases.json').then(
//                function (object) {
//                    delay.resolve(angular.fromJson(object.data));
//                },
//                function (response) {
//                    if (response.status === 404) {
//                        delay.reject('Cannot loading testCases');
//                    } else {
//                        delay.reject('Unable to create the compliance types');
//                    }
//                }
//            );
//
            $http.get('api/connectivity/testcases').then(
                function (response) {
                    delay.resolve(angular.fromJson(response.data));
                },
                function (response) {
                    delay.reject("Sorry, failed to fetch the test cases. Please refresh your page.");
                }
            );

            return delay.promise;
        };
    }
]);


angular.module('connectivity').factory('ConnectivityValidator',
    ['$q', '$http', 'SOAPEditorUtils', function ($q, $http, SOAPEditorUtils) {

        var ConnectivityValidator = function () {
        };

        ConnectivityValidator.prototype.validate = function (content, testCaseId, type, reqMessage) {
            var delay = $q.defer();
            if (!SOAPEditorUtils.isXML(content)) {
                delay.reject("Message provided is not an xml message");
            } else {

//            var data = angular.fromJson({"content": this.message.content, "testCaseId": testCaseId,"userId": userId});

                var data = angular.fromJson({"content": content, "testCaseId": testCaseId, "type": type, "requestMessage": reqMessage});

//
//                $http.get('../../resources/soap/result.json').then(
//                    function (object) {
//                        //console.log('message instance created');
//                        delay.resolve(angular.fromJson(object.data));
//                        //alert(object.data);
//                    },
//                    function (response) {
//                        //console.log('Error creating the message object');
//                        if (response.status === 404) {
//                            delay.reject('Sorry, Validation Failed.');
//                        } else {
//                            delay.reject('Sorry, Validation Failed.');
//                        }
//                    }
//                );

                $http.post('api/connectivity/validate', data, {timeout: 60000}).then(
                    function (object) {
                        delay.resolve(angular.fromJson(object.data));
                    },
                    function (response) {
                        delay.reject(response.data);
                    }
                );
            }
            return delay.promise;
        };


        return ConnectivityValidator;
    }]);

angular.module('connectivity').factory('ConnectivityPart',
    ['$rootScope', '$http', '$q', 'SOAPEditor', 'SOAPCursor', 'ValidationResult', 'IZReportClass', 'Message', 'ValidationSettings', function ($rootScope, $http, $q, SOAPEditor, SOAPCursor, ValidationResult, IZReportClass, Message, ValidationSettings) {

        var ConnectivityPart = function () {
            this.editor = new SOAPEditor();
            this.cursor = new SOAPCursor();
            this.validationResult = new ValidationResult();
            this.message = new Message();
            this.report = new IZReportClass();
            this.validationSettings = new ValidationSettings();
        };

        ConnectivityPart.prototype.setContent = function (value) {
//            this.message.content = value;
//            this.message.notifyChange();
            this.editor.instance.doc.setValue(value);
        };

        ConnectivityPart.prototype.formatContent = function () {
            this.editor.format();
        };

        ConnectivityPart.prototype.getContent = function () {
            return  this.message.content;
        };

        return ConnectivityPart;
    }]);


angular.module('commonServices').factory('SOAPConnectivityTransport', function ($q, $http, Transport, User, StorageService, $rootScope) {
    var SOAPConnectivityTransport = function () {
        this.protocol = "soap";
    };

    var SOAPConnectivityTransport = {
        running: false,
        configs: Transport.configs,
        transactions: Transport.transactions,
        logs: Transport.logs,
        disabled: false,
        protocol: "soap",
        domain: $rootScope.domain.domain,

//
//    SOAPConnectivityTransport.prototype = createObject.(Transport.prototype);
//    SOAPConnectivityTransport.prototype.constructor = SOAPConnectivityTransport;
//

//    SOAPConnectivityTransport.prototype.send = function (testCaseId, content) {
//        var delay = $q.defer();
//        var data = angular.fromJson({"testCaseId": testCaseId, "content": content, "endpoint": user.receiverEndpoint, "u": user.receiverUsername, "p": user.receiverPassword, "facilityId": user.receiverFacilityId});
//            $http.post('api/connectivity/send', data, {timeout: 60000}).then(
//                function (response) {
//                    delay.resolve(angular.fromJson(response.data));
//                },
//                function (response) {
//                    delay.reject(response);
//                }
//            );
//
////        $http.get('../../resources/connectivity/send.json').then(
////            function (response) {
////                delay.resolve(angular.fromJson(response.data));
////            },
////            function (response) {
////                delay.reject('Sorry,we did not get a response');
////            }
////        );
//        return delay.promise;
//    };

//
        send: function (testCaseId) {
            var delay = $q.defer();
            var self = this;
            self.transactions = {};
            Transport.deleteTransaction(testCaseId).then(function (result) {
                var data = angular.fromJson({"testStepId": testCaseId, "userId": User.info.id, "config": Transport.configs[SOAPConnectivityTransport.protocol].data.taInitiator});
                $http.post('api/connectivity/send', data, {timeout: 60000}).then(
                    function (response) {
                        if (response.data != null && response.data != "") {
                            self.transactions[testCaseId] = angular.fromJson(response.data);
                        } else {
                            self.transactions[testCaseId] = null;
                        }
                        delay.resolve(self.transactions[testCaseId]);
                    },
                    function (response) {
                        self.transactions[testCaseId] = null;
                        delay.reject(self.transactions[testCaseId]);
                    }
                );
//        $http.get('../../resources/cb/send.json').then(
//            function (response) {
//                self.transactions[testStepId] = angular.fromJson(response.data);
//                delay.resolve(self.transactions[testStepId]);
//            },
//            function (response) {
//                delay.reject(response);
//            }
//        );
            });

            return delay.promise;
        },

        searchTransaction: function (testStepId, config, responseMessageId) {
            return Transport.searchTransaction(testStepId, config, responseMessageId, $rootScope.domain.domain, SOAPConnectivityTransport.protocol);
        },

        stopListener: function (testStepId) {
            return Transport.stopListener(testStepId, $rootScope.domain.domain, SOAPConnectivityTransport.protocol);
        },

        startListener: function (testStepId, responseMessageId) {
            return Transport.startListener(testStepId, responseMessageId, $rootScope.domain.domain, SOAPConnectivityTransport.protocol);
        },
        init: function () {
            this.running = false;
            this.configs = Transport.configs;
            this.transactions = Transport.transactions;
            this.logs = Transport.logs;
            this.disabled = false;
            this.domain = $rootScope.domain.domain;
            this.protocol = "soap";
        }
    };


    return SOAPConnectivityTransport;
});




