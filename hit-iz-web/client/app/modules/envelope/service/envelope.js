'use strict';


angular.module('envelope').factory('Envelope',
    ['$http', '$q', 'XmlEditor', 'XmlCursor', 'ValidationResult', 'EnvelopeReport', 'Message', 'ValidationSettings', function ($http, $q, XmlEditor, XmlCursor, ValidationResult, EnvelopeReport, Message, ValidationSettings) {
        var Envelope = {
            testCase: null,
            selectedTestCase: null,
            editor: new XmlEditor(),
            cursor: new XmlCursor(),
            validationResult: new ValidationResult(),
            message: new Message(),
            report: new EnvelopeReport(),
            validationSettings: new ValidationSettings(),
            setContent: function (value) {
                Envelope.message.content = value;
                Envelope.editor.instance.doc.setValue(value);
                Envelope.message.notifyChange();
            },
            getContent: function () {
                return  Envelope.message.content;
            }
        };

        return Envelope;
    }]);


angular.module('envelope').factory('EnvelopeReport', function ($http, Report) {
    var EnvelopeReport = function () {
        Report.call(this, arguments);
    };

    EnvelopeReport.prototype = Object.create(Report.prototype);
    EnvelopeReport.prototype.constructor = EnvelopeReport;

    EnvelopeReport.prototype.generateByFormat = function (xmlReport, format) {
        return this.generate("api/envelope/report/generate/" + format, xmlReport);
    };

    EnvelopeReport.prototype.downloadByFormat = function (xmlReport, format) {
        return this.generate("api/envelope/report/download/" + format, xmlReport);
    };
    return EnvelopeReport;
});


angular.module('envelope').factory('EnvelopeTestCaseListLoader', ['$q','$http',
    function ($q,$http) {
        return function() {
            var delay = $q.defer();
//                $http.get("api/envelope/testCases/", {timeout: 60000}).then(
//                    function (object) {
//                        delay.resolve(angular.fromJson(object.data));
//                    },
//                    function (response) {
//                        delay.reject(response.data);
//                    }
//                );

            $http.get('../../resources/envelope/testCases.json').then(
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


angular.module('envelope').factory('EnvelopeValidator', function ($http, $q,XmlEditorUtils) {
    var EnvelopeValidator = function () {
    };

    EnvelopeValidator.prototype.validate = function (message, testCaseId) {
        var delay = $q.defer();
        if(!XmlEditorUtils.isXML(content)){
            delay.reject("Message provided is not an xml message");
        }else {
            var data = angular.fromJson({"content": message});

            $http.get('../../resources/soap/result.json').then(
                function (object) {
                    //console.log('message instance created');
                    delay.resolve(angular.fromJson(object.data));
                    //alert(object.data);
                },
                function (response) {
                    //console.log('Error creating the message object');
                    if (response.status === 404) {
                        delay.reject('Cannot validate this message');
                    } else {
                        delay.reject('Cannot validate this message');
                    }
                }
            );
//
//                $http.post('api/envelope/testCases/' + this.testCase.id + '/validate', data, {timeout: 60000}).then(
//                    function (object) {
//                        delay.resolve(angular.fromJson(object.data));
//                    },
//                    function (response) {
//                        delay.reject(response.data);
//                    }
//                );
        }
        return delay.promise;
    };

    return EnvelopeValidator;
});





//
//angular.module('envelope').factory('EnvelopeTestCase', function ($http, TestCase, EnvelopeTestContext) {
//
//    var EnvelopeTestCase = function () {
//        TestCase.apply(this, arguments);
//        this.testContext = new EnvelopeTestContext();
//    };
//
//
//    EnvelopeTestCase.prototype = Object.create(TestCase.prototype);
//    EnvelopeTestCase.prototype.constructor = EnvelopeTestCase;
//
//
//    EnvelopeTestCase.prototype.init = function (newTestCase) {
//        TestCase.prototype.init.call(this, newTestCase);
//        this.testContext.init(newTestCase.testContext);
//    };
//
//
//
////    var EnvelopeTestCase = function () {
////        TestCase.apply(this, arguments);
////        this.testContext = new EnvelopeTestContext();
////    };
////
////    EnvelopeTestCase.prototype = Object.create(TestCase.prototype);
////    EnvelopeTestCase.prototype.constructor = EnvelopeTestCase;
////
////
////    EnvelopeTestCase.prototype.init = function (newTestCase) {
////        if (newTestCase) {
////            this.id = newTestCase.id;
////            this.sutType = newTestCase.sutType;
////            this.label = newTestCase.label;
////            this.testStory = newTestCase.testStory;
////            this.testContext.init(newTestCase.testContext);
////        }
////    };
//
//    EnvelopeTestCase.prototype.initTestContext = function () {
//        var self = this;
//        $http.get('api/envelope/testCases/' + self.id + "/testContext", {timeout: 60000}).then(
//            function (response) {
//                self.testContext.init(angular.fromJson(response.data));
//            }
//        );
//
////        $http.get('../../resources/envelope/testContext.json').then(
////            function (response) {
////                self.testContext.init(angular.fromJson(response.data));
////            },
////            function (response) {
////                delay.reject(response.data);
////            }
////        );
//
//    };
//
//
//    EnvelopeTestCase.prototype.notifyChange = function () {
//        this.updateIndicator = new Date().getTime();
//    };
//
//    return EnvelopeTestCase;
//});
//
//angular.module('envelope').factory('EnvelopeTestContext', function ($http, TestContext) {
//
//    var EnvelopeTestContext = function () {
//         this.exampleMessages = [];
//    };
//
//    EnvelopeTestContext.prototype = Object.create(TestContext.prototype);
//    EnvelopeTestContext.prototype.constructor = EnvelopeTestContext;
//
//
//    EnvelopeTestContext.prototype.init = function (newTestContext) {
//        if (newTestContext) {
//            this.id = newTestContext.id;
//            this.exampleMessages = newTestContext.exampleMessages;
//        }
//    };
//
//    return EnvelopeTestContext;
//});


//angular.module('envelope').factory('EnvelopeSelectedTestCase',
//    ['EnvelopeTestCase', function (EnvelopeTestCase) {
//        return new EnvelopeTestCase();
//    }]
//);
//
//angular.module('envelope').factory('EnvelopeLoadedTestCase',
//    ['EnvelopeTestCase', function (EnvelopeTestCase) {
//        return new EnvelopeTestCase();
//    }]
//);




