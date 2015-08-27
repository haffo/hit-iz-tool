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
        .controller('TestCaseViewerCtrl', ['$scope', '$rootScope', '$sce', 'TestCaseViewerService', '$compile', function ($scope, $rootScope, $sce, TestCaseViewerService, $compile) {
            $scope.tabs = [];
            $scope.loading = false;
            var testCaseViewerService = new TestCaseViewerService();
            $rootScope.$on($scope.type + ':testCaseSelected', function (event, testCase) {
                $scope.tabs[0] = true;
                $scope.tabs[1] = false;
                $scope.tabs[2] = false;
                $scope.tabs[3] = false;
                $scope.tabs[4] = false;
                $scope.testCase = testCase;
                $scope.loading = true;
//                if (!$scope.testCase['jurorDocument'] || $scope.testCase['jurorDocument'] === null || !$scope.testCase['testStory'] || $scope.testCase['testStory'] === null || !$scope.testCase['messageContent'] || $scope.testCase['messageContent'] === null || !$scope.testCase['testDataSpecification'] || $scope.testCase['testDataSpecification'] === null) {
                testCaseViewerService.artifacts(testCase.type, testCase.id).then(function (result) {
                    $scope.testCase['testStory'] = result['testStory'];
//                        if ($scope.testCase['testStory'] !== null) {
//                            $scope.testCase['testStory']['json'] = angular.fromJson(result['testStory']['json']);
//                        }
                    $scope.testCase['jurorDocument'] = result['jurorDocument'];
                    $scope.testCase['testDataSpecification'] = result['testDataSpecification'];
                    $scope.testCase['messageContent'] = result['messageContent'];
                    $scope.testCase['testPackage'] = result['testPackage'];
                    $scope.compileArtifact('testStory');
                    $scope.compileArtifact('jurorDocument');
                    $scope.compileArtifact('testDataSpecification');
                    $scope.compileArtifact('messageContent');
                    $scope.loading = false;
                }, function (error) {
                    $scope.testCase['testStory'] = null;
                    $scope.testCase['jurorDocument'] = null;
                    $scope.testCase['testDataSpecification'] = null;
                    $scope.testCase['messageContent'] = null;
                    $scope.testCase['testPackage'] = null;
                    $scope.loading = false;
                });
//                } else {
//                    $scope.loading = false;
//                }
            });

            $scope.compileArtifact = function (artifactType) {
                if ($scope.testCase && $scope.testCase !== null && $scope.testCase[artifactType] !== null) {
                    var element = $('#' + artifactType);
                    element.html($scope.testCase[artifactType].html);
                    $compile(element.contents())($scope);
                }
            };

            var getTestType = function (testCase) {
                return testCase.type.toLowerCase();
            };

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

            $scope.downloadMessage = function () {
                if ($scope.testCase != null) {
                    var form = document.createElement("form");
                    form.action = "api/message/download";
                    form.method = "POST";
                    form.target = "_target";
                    var input = document.createElement("textarea");
                    input.name = "content";
                    input.value = $scope.testCase.testContext.message.content;
                    form.appendChild(input);
                    form.style.display = 'none';
                    document.body.appendChild(form);
                    form.submit();
                }
            };

            $scope.downloadJurorDoc = function (jurorDocId, title) {
                var content = $("#" + jurorDocId).html();
                if (content && content != '') {
                    var form = document.createElement("form");
                    form.action = 'api/testartifact/generateJurorDoc/pdf';
                    form.method = "POST";
                    form.target = "_target";
                    var input = document.createElement("textarea");
                    input.name = "html";
                    input.value = content;
                    form.appendChild(input);

                    var type = document.createElement("input");
                    type.name = "type";
                    type.value = "JurorDocument";
                    form.style.display = 'none';
                    form.appendChild(type);


                    var nam = document.createElement("input");
                    nam.name = "name";
                    nam.value = title;
                    form.style.display = 'none';
                    form.appendChild(nam);

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

    mod.factory('TestCaseViewerService', function ($http, $q, $filter) {
        var TestCaseViewerService = function () {
        };

//        TestCaseViewerService.prototype.artifact = function (testType, id, artifactType) {
//            var delay = $q.defer();
//            $http.get('api/testartifact/'+ id + '/'+ artifactType, {params:{type:testType}}).then(
//                function (object) {
//                    try {
//                        delay.resolve(angular.fromJson(object.data));
//                    } catch (e) {
//                        delay.reject("Invalid character");
//                    }
//                },
//                function (response) {
//                    delay.reject(response.data);
//                }
//            );
////
////            $http.get('../../resources/cf/profile.json').then(
////                function (object) {
////                    delay.resolve(angular.fromJson(object.data));
////                },
////                function (response) {
////                    delay.reject(response.data);
////                }
////            );
//
//            return delay.promise;
//        };


        TestCaseViewerService.prototype.artifacts = function (testType, id) {
            var delay = $q.defer();
            $http.get('api/testartifact/' + id, {params: {type: testType}}).then(
                function (object) {
                    try {
                        delay.resolve(angular.fromJson(object.data));
                    } catch (e) {
                        delay.reject("Invalid character");
                    }
                },
                function (response) {
                    delay.reject(response.data);
                }
            );
//
//            $http.get('../../resources/cf/profile.json').then(
//                function (object) {
//                    delay.resolve(angular.fromJson(object.data));
//                },
//                function (response) {
//                    delay.reject(response.data);
//                }
//            );

            return delay.promise;
        };


        return TestCaseViewerService;

    });
})(angular);