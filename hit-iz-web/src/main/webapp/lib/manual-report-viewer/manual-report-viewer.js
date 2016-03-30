/**
 * Created by haffo on 5/4/15.
 */

(function (angular) {
    'use strict';
    var mod = angular.module('hit-manual-report-viewer', []);
    mod.directive('manualReportViewer', [
        function () {
            return {
                restrict: 'A',
                scope: {
                    type: '@'
                },
                templateUrl: 'ManualReportViewer.html',
                replace: false,
                controller: 'ManualReportViewerCtrl'
            };
        }
    ]);

    mod
        .controller('ManualReportViewerCtrl', ['$scope', '$rootScope', '$compile', 'ManualReportService', function ($scope, $rootScope, $compile, ManualReportService) {
            $scope.report = null;
            $scope.testStepId = null;
            $scope.error = null;
            $scope.loading = false;
            $rootScope.$on($scope.type + ':manualReportLoaded', function (event, report, testStepId) {
                $scope.testStepId = testStepId;
                $scope.report = report;
                $scope.error = null;
                if (report != null && report.xml != null && report.xml != undefined) {
                    ManualReportService.toHTML(report.xml, testStepId).then(function (response) {
                        $scope.report["html"] = response.html;
                        $scope.compile();
                        $scope.loading = false;
                    }, function (error) {
                        $scope.report = null;
                        $scope.loading = false;
                        $scope.error = error;
                    });
                } else {
                    $scope.report = null;
                    $scope.loading = false;
                }
            });

            $scope.compile = function () {
                var element = $('#' + $scope.type + '-manual-report');
                if ($scope.report != null) {
                    element.html($scope.report.html);
                } else {
                    element.html('');
                }
                $compile(element.contents())($scope);
            };

            $scope.downloadAs = function (format) {
                return ManualReportService.downloadTestStepReport($scope.testStepId, format);
            };
        }]);


    mod.factory('ManualReportService', function ($http, $q, $filter,TestExecutionService) {

        var ManualReportService = {
//             findResultTitle: function (value) {
//                for (var i = 0; i < TestExecutionService.resultOptions.length; i++) {
//                    if (TestExecutionService.resultOptions[i].value === value) {
//                        return TestExecutionService.resultOptions[i].title;
//                    }
//                }
//                return "Not defined";
//            },

            downloadTestStepReport: function (testStepId, format) {
                var form = document.createElement("form");
                form.action = "api/manual/report/teststep/" + testStepId + "/download";
                form.method = "POST";
                form.target = "_target";
                var input = document.createElement("input");
                input.name = "format";
                input.value = format;
                form.appendChild(input);
                form.style.display = 'none';
                document.body.appendChild(form);
                form.submit();

            },


            save: function (jsonReport, testStep) {
                var delay = $q.defer();
                var data = angular.fromJson({value: TestExecutionService.testStepValidationResults[testStep.id], comments: TestExecutionService.testStepValidationResults[testStep.id], testStepId: testStep.id, nav: testStep.nav});
//                $http.post("api/manual/report/save", data).then(
//                    function (object) {
//                        delay.resolve(angular.fromJson(object.data));
//                    },
//                    function (response) {
//                        delay.reject(response.data);
//                    }
//                );
//
                $http.get("../../resources/cb/manualSaveReport.json").then(
                    function (object) {
                        delay.resolve(angular.fromJson(object.data));
                    },
                    function (response) {
                        delay.reject(response.data);
                    }
                );

                return delay.promise;
            },

            toHTML: function (xmlReport, testStepId) {
                var delay = $q.defer();
                var data = $.param({xmlReport: xmlReport, testStepId: testStepId});
                var config = {
                    headers : {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                    }
                };
                $http.post("api/manual/report/html", data,config).then(
                    function (object) {
                        delay.resolve(angular.fromJson(object.data));
                    },
                    function (response) {
                        delay.reject(response.data);
                    }
                );
//                $http.get("../../resources/cb/manualHTML.json").then(
//                    function (object) {
//                        delay.resolve(angular.fromJson(object.data));
//                    },
//                    function (response) {
//                        delay.reject(response.data);
//                    }
//                );

                return delay.promise;
            }

        };

        return ManualReportService;
    });


})(angular);