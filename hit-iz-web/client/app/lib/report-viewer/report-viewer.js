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
        .controller('ReportViewerCtrl', ['$scope', '$rootScope', '$compile', 'ReportService', function ($scope, $rootScope, $compile, ReportService) {
            $scope.report = null;
            $scope.testStepId = null;
            $scope.error = null;
            $scope.loading = false;
            $rootScope.$on($scope.type + ':reportLoaded', function (event, report,testStepId) {
                $scope.loading = true;
                $scope.testStepId = testStepId;
                if(report != null) {
                    ReportService.save(report.xml, testStepId).then(function (response) {
                        $scope.report = report;
                        $scope.report["id"] = response.id;
                        $scope.compile();
                        $scope.loading = false;
                    }, function (error) {
                        $scope.report = null;
                        $scope.loading = false;
                        $scope.error = error;
                    });
                }else{
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
                return ReportService.downloadTestStepReport( $scope.testStepId, format);
            };
        }]);


    mod.factory('ReportService', function ($http, $q, $filter) {
        var ReportService = function () {
        };

        ReportService.downloadTestStepReport = function (testStepId, format) {
            var form = document.createElement("form");
            form.action = "api/report/teststep/" + testStepId + "/download";
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

        ReportService.downloadTestCaseReports = function (testCaseId) {
             var form = document.createElement("form");
            form.action = "api/testcases/" + testCaseId + "/reports/download";
            form.method = "POST";
            form.target = "_target";
            form.style.display = 'none';
            document.body.appendChild(form);
            form.submit();
        };

        ReportService.save = function (xmlReport, testStepId) {
            var delay = $q.defer();
            var data = $.param({xmlReport: xmlReport, testStepId: testStepId});
            var config = {
                headers : {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                }
            };
            $http.post("api/report/save", data,config).then(
                function (object) {
                    delay.resolve(angular.fromJson(object.data));
                },
                function (response) {
                    delay.reject(response.data);
                }
            );
            return delay.promise;
        };


        /**
         * TODO: remove
         * @param url
         * @param json
         * @returns {*}
         */
        ReportService.generate = function (content) {
            var delay = $q.defer();
            $http({
                url: "api/report/generate",
                data: $.param({'content': json}),
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                method: 'POST',
                timeout: 60000
            }).success(function (data) {
                delay.resolve(angular.fromJson(data));
            }).error(function (err) {
                delay.reject(err);
            });

            return delay.promise;
        };

        return ReportService;
    });


})(angular);