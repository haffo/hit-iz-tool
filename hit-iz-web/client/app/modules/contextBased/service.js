'use strict';


angular.module('contextBased').factory('ContextBased',
    ['$http', '$q', 'Editor', 'EDICursor', 'ValidationResult', 'DataInstanceReport', 'Er7Message', 'ValidationSettings', 'Tree', function ($http, $q, Editor, EDICursor, ValidationResult, DataInstanceReport, Er7Message, ValidationSettings,Tree) {
        var ContextBased = {
            testCase: null,
            selectedTestCase: null,
            editor: new Editor(),
            tree: new Tree(),
            cursor: new EDICursor(),
            validationResult: new ValidationResult(),
            message: new Er7Message(),
            report: new DataInstanceReport(),
            validationSettings: new ValidationSettings(),
            setContent: function (value) {
                ContextBased.message.content = value;
                ContextBased.editor.instance.doc.setValue(value);
                ContextBased.message.notifyChange();
            },
            getContent: function () {
                return  ContextBased.message.content;
            }
        };

        return ContextBased;
    }]);


angular.module('contextBased').factory('CBTestCaseListLoader', ['$q','$http',
    function ($q,$http) {
        return function() {
            var delay = $q.defer();
//            $http.get("api/cb/testcases", {timeout: 60000}).then(
//                function (object) {
//                    delay.resolve(angular.fromJson(object.data));
//                },
//                function (response) {
//                    delay.reject(response.data);
//                }
//            );

                $http.get('../../resources/cb/testPlans.json').then(
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


