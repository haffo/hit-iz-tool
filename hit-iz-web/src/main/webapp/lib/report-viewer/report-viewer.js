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
        .controller('ReportViewerCtrl', ['$scope', '$rootScope', '$compile', 'ReportService', 'TestExecutionService', 'Notification', function ($scope, $rootScope, $compile, ReportService, TestExecutionService,Notification) {
            $scope.report = null;
            $scope.testStepId = null;
            $scope.error = null;
            $scope.loading = false;
            $scope.testStepValidationReportId = null;
            var destroyEvent3;
            var destroyEvent2;
            var destroyEvent1;
            destroyEvent1 =  $rootScope.$on($scope.type + ':createMessageValidationReport', function (event, report, testStep) {
                $scope.loading = true;
                if (report != null && testStep != null) {
                    $scope.testStepId = testStep.id;
                    ReportService.createMessageValidationReport(report.xml, testStep.id).then(function (response) {
                        $scope.report = report;
                        $scope.report["id"] = response.id;
                        $scope.compile();
                        $scope.loading = false;
                    }, function (error) {
                        $scope.report = null;
                        $scope.compile();
                        $scope.loading = false;
                        //Notification.error({message: error.data, templateUrl: "NotificationErrorTemplate.html", scope: $rootScope, delay: 30000});
                    });
                } else {
                    $scope.report = null;
                    $scope.compile();
                    $scope.loading = false;
                }
            });

            destroyEvent2 = $rootScope.$on($scope.type + ':initValidationReport', function (event, report, testStep) {
                $scope.loading = true;
                $scope.testStepId = testStep.id;
                if (report != null && report != undefined) {
                     if( report.html == null){
                        var comments =  report.comments != undefined ? report.comments : null;
                        var xml = report.xml != undefined ? report.xml : null;
                        var result = report.result != undefined ? report.result : null;
                        ReportService.updateTestStepValidationReport(xml, testStep.id, result, comments).then(function (response) {
                            $scope.report = response;
                            TestExecutionService.setTestStepValidationReportObject(testStep, $scope.report);
                            $scope.loading = false;
                             $scope.compile();
                         }, function (error) {
                            $scope.report = null;
                             $scope.compile();
                            $scope.loading = false;
                            //Notification.error({message: error.data, templateUrl: "NotificationErrorTemplate.html", scope: $rootScope, delay: 30000});
                        });
                    }else{
                        $scope.report = report;
                        TestExecutionService.setTestStepValidationReportObject(testStep, $scope.report);
                        $scope.compile();
                        $scope.loading = false;
                    }
                } else {
                    $scope.report = null;
                    $scope.compile();
                    TestExecutionService.setTestStepValidationReportObject(testStep, null);
                    $scope.loading = false;
                    $scope.error = null;
                }
            });


            destroyEvent3 = $rootScope.$on($scope.type + ':updateTestStepValidationReport', function (event, report, testStep) {
                //$scope.loading = true;
                if(testStep != null) {
                    $scope.testStepId = testStep.id;
                    var result = TestExecutionService.getTestStepValidationResult(testStep);
                    result = result != undefined ? result : null;
                    var comments = TestExecutionService.getTestStepComments(testStep);
                    comments = comments != undefined ? comments : null;
                    var xmlMessageOrManualValidation = report != null ? report.xml : null;
                    ReportService.updateTestStepValidationReport(xmlMessageOrManualValidation, testStep.id, result, comments).then(function (response) {
                        $scope.report = response;
                        TestExecutionService.setTestStepValidationReportObject(testStep, $scope.report);
                        var back = TestExecutionService.getTestStepValidationReportObject(testStep);
                        $scope.compile();
//                    $scope.loading = false;
                    }, function (error) {
                        $scope.report = null;
//                    $scope.loading = false;
                        $scope.compile();
                        //Notification.error({message: error.data, templateUrl: "NotificationErrorTemplate.html", scope: $rootScope, delay: 30000});
                    });
                }
            });

            $rootScope.$on('$destroy', function() {
                destroyEvent1(); // remove listener.
                destroyEvent2();
                destroyEvent3();
            });

//
//            $rootScope.$on($scope.type + ':updateTestStepValidationReport', function (event, report, testStep) {
//                $scope.loading = true;
//                $scope.testStepId = testStep.id;
//                if (report != null) {
//                    $scope.report = report;
//                    $scope.compile();
//                    $scope.loading = false;
//                } else {
//                    $scope.report = null;
//                    $scope.compile();
//                    $scope.loading = false;
//                }
//            });

//            $rootScope.$on($scope.type + ':updateTestStepValidationReport', function (event, report, testStep) {
//                $scope.loading = true;
//                $scope.testStepId = testStep.id;
//                if (report != null) {
//                    $scope.report = report;
//                    $scope.compile();
//                    $scope.loading = false;
//                } else {
//                    $scope.report = null;
//                    $scope.compile();
//                    $scope.loading = false;
//                }
//            });




            $scope.compile = function () {
                var element = $('#' + $scope.type + '-report');
                if ($scope.report != null && $scope.report != undefined && $scope.report.html != null  && $scope.report.html != undefined) {
                    element.html($scope.report.html);
                } else {
                    element.html('');
                }
                $compile(element.contents())($scope);
            };

            $scope.downloadAs = function (format) {
                if ($scope.type === 'cb') {
                    return ReportService.downloadTestStepValidationReport($scope.report.id, format);
                } else {
                    return ReportService.downloadMessageValidationReport($scope.report.id, format);
                }
            };
        }]);


    mod.factory('ReportService', function ($rootScope, $http, $q, $filter,Notification) {
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
            var data = angular.fromJson({"xmlMessageValidationReport": xmlMessageValidationReport, "testStepId": testStepId});
            $http.post("api/testStepValidationReport/create", data).then(
                function (object) {
                    var res = object.data != null && object.data != "" ? angular.fromJson(object.data): null;
                    delay.resolve(res);
                },
                function (response) {
//                    Notification.error({message: "Failed to generate the report. Please try again", templateUrl: "NotificationErrorTemplate.html", scope: $rootScope, delay: 30000});
                    delay.reject(response.data);
                }
            );
            return delay.promise;
        };



        ReportService.initTestStepValidationReport = function (testStepId) {
            var delay = $q.defer();
            var data = $.param({testStepId: testStepId});
            var config = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                }
            };
            $http.post("api/testStepValidationReport/init", data, config).then(
                function (object) {
                    var res = object.data != null && object.data != "" ? angular.fromJson(object.data): null;
                    delay.resolve(res);
                },
                function (response) {
//                    Notification.error({message: "Sorry, failed to generate the report. Please try again", templateUrl: "NotificationErrorTemplate.html", scope: $rootScope, delay: 30000});
                    delay.reject(response.data);
                }
            );

//            $http.get("../../resources/cb/initTestStep.json").then(
//                function (object) {
//                    delay.resolve(angular.fromJson(object.data));
//                },
//                function (response) {
//                    delay.reject(response.data);
//                }
//            );

            return delay.promise;
        };



        ReportService.updateTestStepValidationReport = function (xmlMessageValidationReport, testStepId, result, comments) {
            var delay = $q.defer();
            var data = angular.fromJson({"xmlMessageValidationReport": xmlMessageValidationReport, "testStepId": testStepId, "result": result, "comments": comments});
            $http.post("api/testStepValidationReport/update", data).then(
                function (object) {
                    var res = object.data != null && object.data != "" ? angular.fromJson(object.data): null;
                    delay.resolve(res);
                },
                function (response) {
//                    Notification.error({message: "Sorry, failed to generate the report. Please try again", templateUrl: "NotificationErrorTemplate.html", scope: $rootScope, delay: 30000});
                    delay.reject(response.data);
                }
            );
//
////            var data = $.param(;
//            var data = angular.fromJson({xml: xmlMessageValidationReport, testStep: {id: testStepId}, result: result, comments: comments});
////             var config = {
////                headers: {
////                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
////                }
////            };
//
//            console.log(angular.toJson(data));
//            $http.post("api/testStepValidationReport/update", data).then(
//                function (object) {
//                    delay.resolve(angular.fromJson(object.data));
//                },
//                function (response) {
//                    delay.reject(response.data);
//                }
//            );

//            $http.get("../../resources/cb/updateTestStepReport.json").then(
//                function (object) {
//                    var report = angular.fromJson(object.data);
//                    report['result'] = result;
//                    report['comments'] = comments;
//                    report['html'] =  "TestStep="+ testStepId + "<br/> Result=" + report['result'] + "<br /> Comments="+ report['comments'];
//                    delay.resolve(report);
//                },
//                function (response) {
//                    delay.reject(response.data);
//                }
//            );

            return delay.promise;
        };


//        ReportService.updateTestStepValidationReport = function (testStep, result, comments) {
//            var delay = $q.defer();
//            var data = {xml: xmlMessageValidationReport, testStep: testStep:{id:testStep.id}, result: result, comments: comments};
//            $http.post("api/testStepValidationReport/update", data, config).then(
//                function (object) {
//                    delay.resolve(angular.fromJson(object.data));
//                },
//                function (response) {
//                    delay.reject(response.data);
//                }
//            );
//            return delay.promise;
//        };

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