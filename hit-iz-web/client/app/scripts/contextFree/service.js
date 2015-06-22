'use strict';


angular.module('contextFree').factory('ContextFree',
    ['$rootScope', '$http', '$q', 'HL7', 'Editor', 'EDICursor', 'NewValidationResult','Er7Message', 'DataInstanceReport', 'Tree', function ($rootScope, $http, $q, HL7, Editor, EDICursor, NewValidationResult, Er7Message, DataInstanceReport, Tree) {
        var ContextFree = {
            editor: new Editor(),
            cursor: new EDICursor(),
            tree: new Tree(),
            validationResult: null,
            dqaValidationResult: null,
            testCase: null,
            selectedTestCase: null,
            message: new Er7Message(),
            searchTableId: 0,
            report: new DataInstanceReport()
        };

        return ContextFree;
    }]);


angular.module('contextBased').factory('CFTestCaseListLoader', ['$q','$http',
    function ($q,$http) {
        return function() {
            var delay = $q.defer();
            $http.get("api/cf/testcases", {timeout: 60000}).then(
                function (object) {
                    delay.resolve(angular.fromJson(object.data));
                },
                function (response) {
                    delay.reject(response.data);
                }
            );
//
//               $http.get('../../resources/cf/testCases.json').then(
//                   function (object) {
//                       delay.resolve(angular.fromJson(object.data));
//                   },
//                   function (response) {
//                       delay.reject(response.data);
//                   }
//               );

            return delay.promise;
        };
    }
]);



//angular.module('contextFree').factory('ContextFreeReport', function ($http, NewValidationReport) {
//    var ContextFreeReport = function () {
//        NewValidationReport.call(this, arguments);
//    };
//
//    ContextFreeReport.prototype = Object.create(NewValidationReport.prototype);
//    ContextFreeReport.prototype.constructor = ContextFreeReport;
//
//    ContextFreeReport.prototype.generateByFormat = function (json, format) {
//        return this.generate("api/datainstance/report/generate/" + format, json);
//    };
//
//    ContextFreeReport.prototype.downloadByFormat = function (json, format) {
//        return this.generate("api/datainstance/report/download/" + format, json);
//    };
//    return ContextFreeReport;
//});



