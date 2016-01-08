'use strict';
angular.module('connectivity').factory('Connectivity',
    ['$rootScope', '$http', '$q', 'ConnectivityPart', 'Logger', 'Endpoint', 'SOAPConnectivityTransport', 'StorageService', function ($rootScope, $http, $q, ConnectivityPart, Logger, Endpoint, SOAPConnectivityTransport, StorageService) {

        var initTransport = function () {
            var transport = new SOAPConnectivityTransport();
            if (StorageService.get(StorageService.USER_CONFIG_KEY) != null) {
                transport.config = angular.fromJson(StorageService.get(StorageService.USER_CONFIG_KEY));
            }
            return transport;
        };

        var Connectivity = {
            testCase: null,
            selectedTestCase: null,
            logger: new Logger(),
            request: new ConnectivityPart(),
            response: new ConnectivityPart(),
            transport: initTransport()
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
            $http.get('api/connectivity/testcases', {timeout: 60000}).then(
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

//angular.module('connectivity').factory('ConnectivityInitiator',
//    ['$q', '$http', function ($q, $http) {
//
//        var ConnectivityInitiator = function () {
//        };
//
//        ConnectivityInitiator.prototype.send = function (user, testCaseId, content) {
//            var delay = $q.defer();
//            var data = angular.fromJson({"testCaseId": testCaseId, "content": content, "endpoint": user.receiverEndpoint, "u": user.receiverUsername, "p": user.receiverPassword, "facilityId": user.receiverFacilityId});
////            $http.post('api/connectivity/send', data, {timeout: 60000}).then(
////                function (response) {
////                    delay.resolve(angular.fromJson(response.data));
////                },
////                function (response) {
////                    delay.reject(response);
////                }
////            );
//
//            $http.get('../../resources/connectivity/send.json').then(
//                function (response) {
//                    delay.resolve(angular.fromJson(response.data));
//                },
//                function (response) {
//                    delay.reject('Sorry,we did not get a response');
//                }
//            );
//            return delay.promise;
//        };
//
//
//        return ConnectivityInitiator;
//    }]);


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
    ['$rootScope', '$http', '$q', 'SOAPEditor', 'SOAPCursor', 'ValidationResult', 'ConnectivityReport', 'Message', 'ValidationSettings', function ($rootScope, $http, $q, SOAPEditor, SOAPCursor, ValidationResult, ConnectivityReport, Message, ValidationSettings) {

        var ConnectivityPart = function () {
            this.editor = new SOAPEditor();
            this.cursor = new SOAPCursor();
            this.validationResult = new ValidationResult();
            this.message = new Message();
            this.report = new ConnectivityReport();
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

angular.module('connectivity').factory('ConnectivityReport', function ($http, Report) {
    var ConnectivityReport = function () {
        Report.call(this, arguments);
    };

    ConnectivityReport.prototype = Object.create(Report.prototype);
    ConnectivityReport.prototype.constructor = ConnectivityReport;

    ConnectivityReport.prototype.generateByFormat = function (xmlReport, format) {
        return this.generate("api/connectivity/report/generate/" + format, xmlReport);
    };

    ConnectivityReport.prototype.downloadByFormat = function (xmlReport, format) {
        return this.generate("api/connectivity/report/download/" + format, xmlReport);
    };
    return ConnectivityReport;
});


//
//angular.module('commonServices').factory('SOAPConnectivityUser', function (Endpoint, SOAPConnectivityTransaction, $q, $http) {
//    var SOAPConnectivityUser = function () {
//        this.id = null;
//        this.senderUsername = null; // tool auto generate or collect this at registration
//        this.senderPassword = null; // tool auto generate or collect this at registration
//        this.senderFacilityID = null;
//        this.receiverUsername = null; // user enter this into the tool as a receiver
//        this.receiverPassword = null; // user enter this into the tool as a receiver
//        this.receiverFacilityId = null; // user enter this into the tool as a receiver
//        this.receiverEndpoint = null; // user enter this into the tool as a receiver
//        this.endpoint = new Endpoint();
//        this.transaction = new SOAPConnectivityTransaction();
//    };
//
//    SOAPConnectivityUser.prototype.init = function () {
//        var delay = $q.defer();
//        var self = this;
////        var data = angular.fromJson({"username": self.username, "tokenId": self.tokenId, "id": self.id});
//        var data = angular.fromJson({"id": self.id});
////        $http.post('api/connectivity/transport/initUser', data).then(
////            function (response) {
////                var user = angular.fromJson(response.data);
////                self.id = user.id;
////                self.senderUsername = user.username;
////                self.senderPassword = user.password;
////                self.senderFacilityID = user.facilityID;
////                self.endpoint = new Endpoint(user.endpoint);
////                self.transaction.init(self.senderUsername, self.senderPassword, self.senderFacilityID);
////                delay.resolve(true);
////            },
////            function (response) {
////                delay.reject(response);
////            }
////        );
//
////
//        $http.get('../../resources/connectivity/user.json').then(
//            function (response) {
//                var user = angular.fromJson(response.data);
//                self.id = user.id;
//                self.senderUsername = user.username;
//                self.senderPassword = user.password;
//                self.senderFacilityID = user.facilityID;
//                self.endpoint = new Endpoint(user.endpoint);
//                self.transaction.init(self.senderUsername, self.senderPassword, self.senderFacilityID);
//                delay.resolve(true);
//            },
//            function (response) {
//                delay.reject(response);
//            }
//        );
//
//        return delay.promise;
//    };
//
//
//    return SOAPConnectivityUser;
//});
//

angular.module('commonServices').factory('SOAPConnectivityTransport', function ($q, $http, Transport, User) {
    var SOAPConnectivityTransport = function () {
        Transport.apply(this, arguments);
        this.domain = "iz";
        this.protocol = "soap";
    };

    SOAPConnectivityTransport.prototype = Object.create(Transport.prototype);
    SOAPConnectivityTransport.prototype.constructor = SOAPConnectivityTransport;


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
    SOAPConnectivityTransport.prototype.send = function (testCaseId) {
        var delay = $q.defer();
        var self = this;
        this.deleteTransaction(testCaseId).then(function (result) {
            var data = angular.fromJson({"testStepId": testCaseId, "userId": User.info.id, "config": self.config.taInitiator});
            $http.post('api/connectivity/transport/send', data, {timeout: 60000}).then(
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
    };

//    SOAPConnectivityTransport.prototype.messages = function () {
//        var delay = $q.defer();
//        var self = this;
//        var data = angular.fromJson({"username": self.username, "password": self.password, "facilityID": self.facilityID});
////        $http.post('api/connectivity/transport', data).then(
////            function (response) {
////                var transaction = angular.fromJson(response.data);
////                self.incoming = transaction.incoming;
////                self.outgoing = transaction.outgoing;
////                delay.resolve(transaction);
////            },
////            function (response) {
////                delay.reject(null);
////            }
////        );
//
//        $http.get('../../resources/connectivity/transaction.json').then(
//            function (response) {
//                var transaction = angular.fromJson(response.data);
//                self.incoming = transaction.incoming;
//                self.outgoing = transaction.outgoing;
//                delay.resolve(transaction);
//            },
//            function (response) {
//                delay.reject(null);
//            }
//        );
//
//        return delay.promise;
//    };
//
//    SOAPConnectivityTransaction.prototype.init = function (username, password, facilityID) {
//        this.clearMessages();
//        this.username = username;
//        this.password = password;
//        this.facilityID = facilityID;
//    };
//
//
//    SOAPConnectivityTransaction.prototype.clearMessages = function () {
//        this.incoming = null;
//        this.outgoing = null;
//    };
//
//    SOAPConnectivityTransaction.prototype.closeConnection = function () {
//        var self = this;
//        var delay = $q.defer();
//        var data = angular.fromJson({"username": self.username, "password": self.password, "facilityID": self.facilityID});
////        $http.post('api/connectivity/transport/close', data).then(
////            function (response) {
////                self.running = true;
////                self.clearMessages();
////                delay.resolve(true);
////            },
////            function (response) {
////                self.running = false;
////                delay.reject(null);
////            }
////        );
////
//        $http.get('../../resources/connectivity/clearFacilityId.json').then(
//            function (response) {
//
//                self.clearMessages();
//                delay.resolve(true);
//            },
//            function (response) {
//                delay.reject(null);
//            }
//        );
//        return delay.promise;
//    };
//
//    SOAPConnectivityTransaction.prototype.openConnection = function (responseMessageId) {
//        var self = this;
//        var delay = $q.defer();
//        var data = angular.fromJson({"username": self.username, "password": self.password, "facilityID": self.facilityID, "responseMessageId": responseMessageId});
////        $http.post('api/connectivity/transport/open', data).then(
////            function (response) {
////                self.running = true;
////                self.clearMessages();
////                delay.resolve(true);
////            },
////            function (response) {
////                self.running = false;
////                delay.reject(null);
////            }
////        );
//
//        $http.get('../../resources/connectivity/initFacilityId.json').then(
//            function (response) {
//                self.running = true;
//                delay.resolve(true);
//            },
//            function (response) {
//                self.running = false;
//                delay.reject(null);
//            }
//        );
//
//
//        return delay.promise;
//    };
    return SOAPConnectivityTransport;
});




