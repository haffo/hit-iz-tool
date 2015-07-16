/**
 * Created by haffo on 5/4/15.
 */

(function (angular) {
    'use strict';
    var mod = angular.module('hit-testcase-viewer', []);

    mod.directive('testcaseViewer', [
        function () {
            return {
                restrict: 'A',
                scope: {
                    type: '@'
                },
                templateUrl: 'lib/testcase-viewer/testcase-viewer.html',
                controller: 'TestCaseViewerCtrl'
            };
        }
    ]);

    mod
        .controller('TestCaseViewerCtrl', ['$scope', '$rootScope', '$sce', function ($scope, $rootScope, $sce) {

            $scope.testStory = null;
            $scope.messageContent = null;


            $rootScope.$on($scope.type + ':testCaseSelected', function (event, testCase) {
                $scope.testCase = testCase;
                $scope.testStory = null;
                $scope.messageContent = null;

                if ($scope.testCase.testStory && $scope.testCase.testStory != null &&$scope.testCase.testStory.json) {
                    $scope.testStory = angular.fromJson($scope.testCase.testStory.json);
                }
                if ($scope.testCase.messageContent && $scope.testCase.messageContent.json) {
                    $scope.messageContent = angular.fromJson($scope.testCase.messageContent.json);
                    angular.forEach($scope.messageContent.MessageContent.Segment, function (segment) {
                        segment.children = [];
                        if (segment.Field && segment.Field.length > 0) {
                            angular.forEach(segment.Field, function (field) {
                                segment.children.push(getItem(field, "field"));
                                if (field.Component && field.Component.length > 0) {
                                    angular.forEach(field.Component, function (component) {
                                        segment.children.push(getItem(component, "component"));
                                        if (component.SubComponent && component.SubComponent.length > 0) {
                                            angular.forEach(component.SubComponent, function (subComponent) {
                                                segment.children.push(getItem(subComponent, "subComponent"));
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
                if ($scope.testCase.testDataSpecification && $scope.testCase.testDataSpecification.json) {
                    //$scope.testDataSpecification = angular.fromJson($scope.testCase.testDataSpecification.json);
                }
                if ($scope.testCase.jurorDocument && $scope.testCase.jurorDocument.json) {
                    //$scope.jurorDocument = angular.fromJson($scope.testCase.jurorDocument.json);
                }
            });

            $scope.downloadTestArtifact = function (path) {
                if ($scope.testCase != null) {
                    var form = document.createElement("form");
                    form.action = "api/testartifact/download";
                    form.method = "POST";
                    form.target = "_target";
                    var input = document.createElement("input");
                    input.name = "path";
                    input.value = path;
                    form.appendChild(input);
                    form.style.display = 'none';
                    document.body.appendChild(form);
                    form.submit();
                }
            };


            var getItem = function (obj, type) {
                return {
                    "dataElement": obj.DataElement,
                    "categorization": obj.Categrization,
                    "data": obj.Data,
                    "location": obj.Location,
                    "type": type
                }
            };


            $scope.toHTML = function (content) {
                return $sce.trustAsHtml(content);
            };
        }]);


})(angular);