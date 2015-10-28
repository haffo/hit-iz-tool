'use strict';


angular.module('cb').factory('CB',
    ['$http', '$q',  'Message', 'ValidationSettings', 'Tree', function ($http, $q, Message, ValidationSettings,Tree) {
        var CB = {
            testCase: null,
            selectedTestCase: null,
            editor: null,
            tree: new Tree(),
            cursor: null,
            message: new Message(),
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


angular.module('cb').factory('CBTestCaseListLoader', ['$q','$http','StorageService','$timeout',
    function ($q,$http,StorageService,$timeout) {
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
//                $http.get('../../resources/cb/testCases.json').then(
//                    function (object) {
//                         delay.resolve(angular.fromJson(object.data));
//                    },
//                    function (response) {
//                        delay.reject(response.data);
//                    }
//                );

            return delay.promise;
        };
    }
]);


