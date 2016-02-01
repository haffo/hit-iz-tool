angular.module('envelope').factory('Envelope',
    ['SOAPEditor', 'SOAPCursor', 'ValidationResult', 'IZReportClass', 'Message', 'ValidationSettings', function ( SOAPEditor, SOAPCursor, ValidationResult, IZReportClass, Message, ValidationSettings) {
        var Envelope = {
            testCase: null,
            selectedTestCase: null,
            editor: new SOAPEditor(),
            cursor: new SOAPCursor(),
            validationResult: new ValidationResult(),
            message: new Message(),
            report: new IZReportClass(),
            validationSettings: new ValidationSettings(),
            getContent: function () {
                return  Envelope.message.content;
            }
        };

        return Envelope;
    }]);


angular.module('envelope').factory('EnvelopeTestCaseListLoader', ['$q','$http',
    function ($q,$http) {
        return function() {
            var delay = $q.defer();
                $http.get("api/envelope/testcases/", {timeout: 60000}).then(
                    function (object) {
                        delay.resolve(angular.fromJson(object.data));
                    },
                    function (response) {
                        delay.reject(response.data);
                    }
                );

//            $http.get('../../resources/envelope/testCases.json').then(
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


angular.module('envelope').factory('EnvelopeValidator', function ($http, $q,SOAPEditorUtils) {
    var EnvelopeValidator = function () {
    };

    EnvelopeValidator.prototype.validate = function (message, testCaseId) {
        var delay = $q.defer();
        if(!SOAPEditorUtils.isXML(message)){
            delay.reject("Message provided is not an xml message");
        }else {
            var data = angular.fromJson({"content": message});

//            $http.get('../../resources/soap/result.json').then(
//                function (object) {
//                    //console.log('message instance created');
//                    delay.resolve(angular.fromJson(object.data));
//                    //alert(object.data);
//                },
//                function (response) {
//                    //console.log('Error creating the message object');
//                    if (response.status === 404) {
//                        delay.reject('Cannot validate this message');
//                    } else {
//                        delay.reject('Cannot validate this message');
//                    }
//                }
//            );
//
                $http.post('api/envelope/testcases/' + testCaseId + '/validate', data, {timeout: 60000}).then(
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

    return EnvelopeValidator;
});




