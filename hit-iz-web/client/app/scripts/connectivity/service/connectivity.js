'use strict';
angular.module('connectivity').factory('Connectivity',
    ['$rootScope', '$http', '$q', 'HL7', 'ConnectivityPart',  'Logger', 'Endpoint', 'TransactionUser', 'StorageService', function ($rootScope, $http, $q, HL7, ConnectivityPart,Logger, Endpoint, TransactionUser,StorageService) {

        var user = new TransactionUser();
        user.receiverUsername = StorageService.get(StorageService.SOAP_COMM_RECEIVER_USERNAME_KEY);
        user.receiverPassword = StorageService.get(StorageService.SOAP_COMM_RECEIVER_PWD_KEY);
        user.receiverFacilityId = StorageService.get(StorageService.SOAP_COMM_RECEIVER_FACILITYID_KEY);
        user.receiverEndpoint = StorageService.get(StorageService.SOAP_COMM_RECEIVER_ENDPOINT_KEY);

        var Connectivity = {
            testCase: null,
            selectedTestCase: null,
            logger: new Logger(),
            request: new ConnectivityPart(),
            response: new ConnectivityPart(),
            user: user
        };
        return Connectivity;
    }]);


angular.module('connectivity').factory('ConnectivityTestCaseListLoader', ['$q', '$http',
    function ($q, $http) {
        return function () {
            var delay = $q.defer();
            $http.get('../../resources/connectivity/testCases.json').then(
                function (object) {
                    delay.resolve(angular.fromJson(object.data));
                },
                function (response) {
                    if (response.status === 404) {
                        delay.reject('Cannot loading testCases');
                    } else {
                        delay.reject('Unable to create the compliance types');
                    }
                }
            );
//
//                $http.get('api/connectivity/testcases', {timeout: 60000}).then(
//                    function (response) {
//                        delay.resolve(angular.fromJson(response.data));
//                    },
//                    function (response) {
//                        delay.reject("Sorry, failed to fetch the test cases. Please refresh your page.");
//                    }
//                );

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
//                $http.post('api/connectivity/send', data, {timeout: 60000}).then(
//                    function (response) {
//                        delay.resolve(angular.fromJson(response.data));
//                    },
//                    function (response) {
//                        delay.reject(response);
//                    }
//                );

            $http.get('../../resources/connectivity/send.json').then(
                function (response) {
                    delay.resolve(angular.fromJson(response.data));
                },
                function (response) {
                    delay.reject('Sorry,we did not get a response');
                }
            );
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
                $http.get('../../resources/soap/result.json').then(
                    function (object) {
                        //console.log('message instance created');
                        delay.resolve(angular.fromJson(object.data));
                        //alert(object.data);
                    },
                    function (response) {
                        //console.log('Error creating the message object');
                        if (response.status === 404) {
                            delay.reject('Sorry, Validation Failed.');
                        } else {
                            delay.reject('Sorry, Validation Failed.');
                        }
                    }
                );

//            $http.post('api/connectivity/validate', data, {timeout: 60000}).then(
//                function (object) {
//                    delay.resolve(angular.fromJson(object.data));
//                },
//                function (response) {
//                    delay.reject(response.data);
//                }
//            );
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


angular.module('connectivity').factory('ConnectivityClock', function ($interval, Clock) {
    return new Clock(1000);
});

