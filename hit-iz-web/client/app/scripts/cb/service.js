'use strict';


angular.module('cb').factory('CB',
    ['$http', '$q', 'Editor', 'EDICursor', 'Er7Message', 'ValidationSettings', 'Tree', function ($http, $q, Editor, EDICursor, Er7Message, ValidationSettings,Tree) {
        var CB = {
            testCase: null,
            selectedTestCase: null,
            editor: new Editor(),
            tree: new Tree(),
            cursor: new EDICursor(),
            message: new Er7Message(),
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

//                $http.get('../../resources/cb/testPlans.json').then(
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


