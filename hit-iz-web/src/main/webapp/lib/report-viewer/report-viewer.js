/**
 * Created by haffo on 5/4/15.
 */

(function (angular) {
    'use strict';
    var mod = angular.module('hit-report-viewer', []);
    mod.directive('reportViewer', [
        function () {
            return {
                restrict: 'A',
                scope: {
                    type: '@'
                },
                templateUrl: 'ReportViewer.html',
                replace: false,
                controller: 'ReportViewerCtrl'
            };
        }
    ]);

    mod
        .controller('ReportViewerCtrl', ['$scope', '$rootScope', '$compile', 'ReportService', 'TestExecutionService', function ($scope, $rootScope, $compile, ReportService, TestExecutionService) {
            $scope.report = null;
            $scope.testStepId = null;
            $scope.error = null;
            $scope.loading = false;
            $scope.testStepValidationReportId = null;

            $rootScope.$on($scope.type + ':createMessageValidationReport', function (event, report, testStep) {
                $scope.loading = true;
                $scope.testStepId = testStep.id;
                if (report != null) {
                    ReportService.createMessageValidationReport(report.xml, testStep.id).then(function (response) {
                        $scope.report = report;
                        $scope.report["id"] = response.id;
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


            $rootScope.$on($scope.type + ':createTestStepValidationReport', function (event, report, testStep) {
                $scope.loading = true;
                $scope.testStepId = testStep.id;
                if (report != null) {
                    ReportService.createTestStepValidationReport(report.xml, testStep.id, TestExecutionService.getTestStepValidationResult(testStep), TestExecutionService.getTestStepComments(testStep)).then(function (response) {
                        $scope.report = response;
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


            $rootScope.$on($scope.type + ':updateTestStepValidationReport', function (event, report, testStep) {
                $scope.loading = true;
                $scope.testStepId = testStep.id;
                if (report != null) {
                    $scope.report = report;
                    $scope.compile();
                    $scope.loading = false;
                } else {
                    $scope.report = null;
                    $scope.loading = false;
                }
            });


            $scope.compile = function () {
                var element = $('#' + $scope.type + '-report');
                if ($scope.report != null) {
                    element.html($scope.report.html);
                } else {
                    element.html('');
                }
                $compile(element.contents())($scope);
            };

            $scope.downloadAs = function (format) {
                if($scope.type === 'cb') {
                    return ReportService.downloadTestStepValidationReport($scope.report.id, format);
                }else{
                    return ReportService.downloadMessageValidationReport($scope.report.id, format);
                }
            };
        }]);


    mod.factory('ReportService', function ($http, $q, $filter) {
        var ReportService = function () {
        };

        ReportService.downloadTestStepValidationReport = function (testStepValidationReportId, format) {
            var form = document.createElement("form");
            form.action = "api/testStepValidationReport/" + testStepValidationReportId + "/download";
            form.method = "POST";
            form.target = "_target";
            var input = document.createElement("input");
            input.name = "format";
            input.value = format;
            form.appendChild(input);
            form.style.display = 'none';
            document.body.appendChild(form);
            form.submit();
        };

        ReportService.downloadMessageValidationReport = function (testStepValidationReportId, format) {
            var form = document.createElement("form");
            form.action = "api/messageValidationReport/" + testStepValidationReportId + "/download";
            form.method = "POST";
            form.target = "_target";
            var input = document.createElement("input");
            input.name = "format";
            input.value = format;
            form.appendChild(input);
            form.style.display = 'none';
            document.body.appendChild(form);
            form.submit();
        };


        ReportService.downloadTestCaseReports = function (testCaseId, format, result, comments) {
            var form = document.createElement("form");
            form.action = "api/testCaseValidationReport/download";
            form.method = "POST";
            form.target = "_target";

            var input = document.createElement("input");
            input.name = "format";
            input.value = format;
            form.appendChild(input);

            input = document.createElement("input");
            input.name = "testCaseId";
            input.value = testCaseId;
            form.appendChild(input);

            input = document.createElement("input");
            input.name = "result";
            input.value = result;
            form.appendChild(input);

            input = document.createElement("input");
            input.name = "comments";
            input.value = comments;
            form.appendChild(input);


            form.style.display = 'none';
            document.body.appendChild(form);
            form.submit();
        };


        ReportService.createMessageValidationReport = function (xmlMessageValidationReport, testStepId) {
            var delay = $q.defer();
            var data = $.param({xmlMessageValidationReport: xmlMessageValidationReport, testStepId: testStepId});
            var config = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                }
            };
            $http.post("api/messageValidationReport/create", data,config).then(
                function (object) {
                    delay.resolve(angular.fromJson(object.data));
                },
                function (response) {
                    delay.reject(response.data);
                }
            );
            return delay.promise;
        };


        ReportService.createTestStepValidationReport = function (xmlMessageValidationReport, testStepId, result, comments) {
            var delay = $q.defer();
            var data = $.param({xmlMessageValidationReport: xmlMessageValidationReport, testStepId: testStepId, result: result, comments: comments});
            var config = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                }
            };
            $http.post("api/testStepValidationReport/create", data,config).then(
                function (object) {
                    delay.resolve(angular.fromJson(object.data));
                },
                function (response) {
                    delay.reject(response.data);
                }
            );
            return delay.promise;
        };


        ReportService.updateTestStepValidationReport = function (testStep, result, comments) {
            var delay = $q.defer();
                        var config = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                }
            };

            var data = $.param({
                result: result,
                comments: comments,
                testStepId:testStep.id
            });
            $http.post("api/testStepValidationReport/update", data,config).then(
                function (object) {
                    delay.resolve(angular.fromJson(object.data));
                },
                function (response) {
                    delay.reject(response.data);
                }
            );
            return delay.promise;
        };

//        ReportService.generateHtml= function (testStepValidationReportId) {
//            var delay = $q.defer();
////            $http.post("api/testStepValidationReport/"+ testStepValidationReportId + "/generateHtml").then(
////                function (object) {
////                    delay.resolve(angular.fromJson(object.data));
////                },
////                function (response) {
////                    delay.reject(response.data);
////                }
////            );
//                $http.get("../../resources/cb/manualHTML.json").then(
//                    function (object) {
//                        delay.resolve(angular.fromJson(object.data));
//                    },
//                    function (response) {
//                        delay.reject(response.data);
//                    }
//                );
//
//            return delay.promise;
//        }


//        /**
//         * TODO: remove
//         * @param json
//         * @returns {*}
//         */
//        ReportService.generate = function (content) {
//            var delay = $q.defer();
//            $http({
//                url: "api/testStepValidationReport/generate",
//                data: $.param({'content': json}),
//                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
//                method: 'POST',
//                timeout: 60000
//            }).success(function (data) {
//                delay.resolve(angular.fromJson(data));
//            }).error(function (err) {
//                delay.reject(err);
//            });
//
//            return delay.promise;
//        };

        return ReportService;
    });


})(angular);