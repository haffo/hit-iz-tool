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
                    type: '@',
                    format: '='
                },
                templateUrl: 'ReportViewer.html',
                replace: false,
                controller: 'ReportViewerCtrl'
            };
        }
    ]);

    mod
        .controller('ReportViewerCtrl', ['$scope', '$rootScope', '$compile', 'ServiceDelegator', function ($scope, $rootScope, $compile, ServiceDelegator) {
            var reportService = null;
            $scope.report = null;
            $scope.title = null;

            $rootScope.$on($scope.type + ':reportLoaded', function (event, report, title) {
                reportService = ServiceDelegator.getReportService($scope.format);
                $scope.report = report;
                $scope.title = title;
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
                return reportService.downloadAs($scope.report.json, format, $scope.title);
            };
        }]);


})(angular);