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
                templateUrl: 'lib/report-viewer/report-viewer.html',
                replace: false,
                controller: 'ReportViewerCtrl'
            };
        }
    ]);

    mod
        .controller('ReportViewerCtrl', ['$scope', '$rootScope', 'ngTreetableParams', 'ReportService', '$compile', function ($scope, $rootScope, ngTreetableParams, ReportService, $compile) {
            var reportService = new ReportService();
            $scope.report = null;

            $rootScope.$on($scope.type + ':reportLoaded', function (event, report) {
                $scope.report = report;
                $scope.compile();
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
                return reportService.downloadAs($scope.report.json, format);
            };
        }]);


    mod.factory('ReportService', function ($http, $q, $filter) {

        var ReportService = function () {
            this.content = {
                metaData: {},
                result: {}
            }
        };

        ReportService.prototype.download = function (url, json) {
            var form = document.createElement("form");
            form.action = url;
            form.method = "POST";
            form.target = "_target";
            var input = document.createElement("textarea");
            input.name = "json";
            input.value = json;
            form.appendChild(input);
            form.style.display = 'none';
            document.body.appendChild(form);
            form.submit();
        };


        ReportService.prototype.generate = function (url, json) {
            var delay = $q.defer();
            $http({
                url: url,
                data: $.param({'json': json}),
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

        ReportService.prototype.generateByFormat = function (json, format) {
            return this.generate("api/report/generateAs/" + format, json);
        };

        ReportService.prototype.downloadAs = function (json, format) {
            return this.download("api/report/downloadAs/" + format, json);
        };

        return ReportService;
    });

})(angular);