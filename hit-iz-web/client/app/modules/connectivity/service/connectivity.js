'use strict';
angular.module('connectivity').factory('Connectivity',
    ['$rootScope', '$http', '$q', 'HL7', 'ConnectivityPart',  'Logger', 'Endpoint', 'ConnectivityUser', function ($rootScope, $http, $q, HL7, ConnectivityPart,Logger, Endpoint, ConnectivityUser) {
        var Connectivity = {
            testCase: null,
            selectedTestCase: null,
            logger: new Logger(),
            request: new ConnectivityPart(),
            response: new ConnectivityPart(),
            serverEndpoint: new Endpoint($rootScope.appInfo.url + '/ws/iisService'),
            user: new ConnectivityUser()
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

angular.module('connectivity').factory('ConnectivityInitiator',
    ['$q', '$http', function ($q, $http) {

        var ConnectivityInitiator = function () {
        };

        ConnectivityInitiator.prototype.send = function (user, testCaseId, content) {
            var delay = $q.defer();
            var data = angular.fromJson({"testCaseId": testCaseId, "content": content, "endpoint": user.receiverEndpoint, "u": user.receiverUsername, "p": user.receiverPassword, "facilityId": user.receiverFacilityId});
                $http.post('api/connectivity/send', data, {timeout: 60000}).then(
                    function (response) {
                        delay.resolve(angular.fromJson(response.data));
                    },
                    function (response) {
                        delay.reject(response);
                    }
                );

//            $http.get('../../resources/connectivity/send.json').then(
//                function (response) {
//                    delay.resolve(angular.fromJson(response.data));
//                },
//                function (response) {
//                    delay.reject('Sorry,we did not get a response');
//                }
//            );
            return delay.promise;
        };


        return ConnectivityInitiator;
    }]);


angular.module('connectivity').factory('ConnectivityValidator',
    ['$q', '$http', 'XmlEditorUtils', function ($q, $http,XmlEditorUtils) {

        var ConnectivityValidator = function () {
        };

        ConnectivityValidator.prototype.validate = function (content, testCaseId, userId, type, reqMessage) {
            var delay = $q.defer();
            if(!XmlEditorUtils.isXML(content)){
                delay.reject("Message provided is not an xml message");
            }else {

//            var data = angular.fromJson({"content": this.message.content, "testCaseId": testCaseId,"userId": userId});

                var data = angular.fromJson({"content": content, "testCaseId": testCaseId, "userId": userId, "type": type, "requestMessage": reqMessage});

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
    ['$rootScope', '$http', '$q', 'HL7', 'Editor', 'XmlCursor', 'ValidationResult', 'ConnectivityReport', 'Message', 'ValidationSettings', function ($rootScope, $http, $q, HL7, Editor, XmlCursor, ValidationResult, ConnectivityReport, Message, ValidationSettings) {

        var ConnectivityPart = function () {
            this.editor = new Editor();
            this.cursor = new XmlCursor();
            this.validationResult = new ValidationResult();
            this.message = new Message();
            this.report = new ConnectivityReport();
            this.validationSettings = new ValidationSettings();
        };

        ConnectivityPart.prototype.setContent = function (value) {
            this.message.content = value;
            this.editor.instance.doc.setValue(value);
            this.message.notifyChange();
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


angular.module('connectivity').factory('ConnectivityUser', function (Endpoint, ConnectivityTransaction, $q, $http) {
    var ConnectivityUser = function () {
        this.id = null;
        this.senderUsername = null; // tool auto generate or collect this at registration
        this.senderPassword = null; // tool auto generate or collect this at registration
        this.senderFacilityID = null;
        this.receiverUsername = null; // user enter this into the tool as a receiver
        this.receiverPassword = null; // user enter this into the tool as a receiver
        this.receiverFacilityId = null; // user enter this into the tool as a receiver
        this.receiverEndpoint = null; // user enter this into the tool as a receiver
        this.endpoint = new Endpoint();
        this.transaction = new ConnectivityTransaction();
    };

    ConnectivityUser.prototype.init = function () {
        var delay = $q.defer();
        var self = this;
//        var data = angular.fromJson({"username": self.username, "tokenId": self.tokenId, "id": self.id});
        var data = angular.fromJson({"id": self.id});
        $http.post('api/user/init', data).then(
            function (response) {
                var user = angular.fromJson(response.data);
                self.id = user.id;
                self.senderUsername = user.username;
                self.senderPassword = user.password;
                self.senderFacilityID = user.facilityID;
                self.receiverUsername = null;
                self.receiverPassword = null;
                self.transaction.init(self.senderUsername, self.senderPassword, self.senderFacilityID);
                delay.resolve(true);
            },
            function (response) {
                delay.reject(response);
            }
        );


//        $http.get('../../resources/connectivity/user.json').then(
//            function (response) {
//                var user = angular.fromJson(response.data);
//                self.id = user.id;
//                self.senderUsername = user.username;
//                self.senderPassword = user.password;
//                self.senderFacilityID = user.facilityID;
//                self.receiverUsername = null;
//                self.receiverPassword = null;
//                self.transaction.init(self.senderUsername, self.senderPassword, self.senderFacilityID);
//                delay.resolve(true);
//            },
//            function (response) {
//                delay.reject(response);
//            }
//        );

        return delay.promise;
    };


    return ConnectivityUser;
});


angular.module('connectivity').factory('ConnectivityTransaction', function ($q, $http) {
    var ConnectivityTransaction = function () {
        this.username = null;
        this.password = null;
        this.facilityID = null;
        this.incoming = null;
        this.outgoing = null;
    };

    ConnectivityTransaction.prototype.messages = function () {
        var delay = $q.defer();
        var self = this;
        var data = angular.fromJson({"username": self.username, "password": self.password, "facilityID": self.facilityID});
        $http.post('api/connectivity/transaction', data).then(
            function (response) {
                var transaction = angular.fromJson(response.data);
                self.incoming = transaction.incoming;
                self.outgoing = transaction.outgoing;
                delay.resolve(transaction);
            },
            function (response) {
                delay.reject(null);
            }
        );

//        $http.get('../../resources/connectivity/transactionOpen.json').then(
//            function (response) {
//                delay.resolve(true);
//            },
//            function (response) {
//                delay.reject(null);
//            }
//        );

        return delay.promise;
    };

    ConnectivityTransaction.prototype.init = function (username, password, facilityID) {
        this.clearMessages();
        this.username = username;
        this.password = password;
        this.facilityID = facilityID;
    };


    ConnectivityTransaction.prototype.clearMessages = function () {
        this.incoming = null;
        this.outgoing = null;
    };

    ConnectivityTransaction.prototype.closeConnection = function () {
        var self = this;
        var delay = $q.defer();
        var data = angular.fromJson({"username": self.username, "password": self.password, "facilityID": self.facilityID});
        $http.post('api/connectivity/transaction/close', data).then(
            function (response) {
                self.clearMessages();
                delay.resolve(true);
            },
            function (response) {
                delay.reject(null);
            }
        );

//                $http.get('../../resources/connectivity/clearFacilityId.json').then(
//                    function (response) {
//                        self.clearMessages();
//                        delay.resolve(true);
//                    },
//                    function (response) {
//                        delay.reject(null);
//                    }
//                );
        return delay.promise;
    };

    ConnectivityTransaction.prototype.openConnection = function () {

        var self = this;
        var delay = $q.defer();
        var data = angular.fromJson({"username": self.username, "password": self.password, "facilityID": self.facilityID});
        $http.post('api/connectivity/transaction/open', data).then(
            function (response) {
                self.clearMessages();
                delay.resolve(true);
            },
            function (response) {
                delay.reject(null);
            }
        );


//                $http.get('../../resources/connectivity/initFacilityId.json').then(
//                    function (response) {
//                        delay.resolve(true);
//                    },
//                    function (response) {
//                        delay.reject(null);
//                    }
//                );


        return delay.promise;
    };
    return ConnectivityTransaction;
});


angular.module('connectivity').factory('ConnectivityClock', function ($interval, Clock) {
    return new Clock(1000);
});
