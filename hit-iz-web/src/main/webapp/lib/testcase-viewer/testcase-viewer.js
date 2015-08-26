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
        .controller('TestCaseViewerCtrl', ['$scope', '$rootScope', '$sce', 'TestCaseViewerService', function ($scope, $rootScope, $sce,TestCaseViewerService) {

            $scope.tabs = [];
            $scope.loadings = [];
            $scope.loading = false;
             var testCaseViewerService = new TestCaseViewerService();

            $scope.isLoading = function(){
                return $scope.loadings[0] || $scope.loadings[1] || $scope.loadings[2] || $scope.loadings[3];
            };


//            $scope.messageContent = null;


            $rootScope.$on($scope.type + ':testCaseSelected', function (event, testCase) {
                $scope.tabs[0] = true;
                $scope.tabs[1] = false;
                $scope.tabs[2] = false;
                $scope.tabs[3] = false;
                $scope.tabs[4] = false;
                $scope.testCase = testCase;

                $scope.loadings[0] = false;
                $scope.loadings[1] = false;
                $scope.loadings[2] = false;
                $scope.loadings[3] = false;


                if(!$scope.testCase['jurorDocument'] || $scope.testCase['jurorDocument'] === null) {
                    $scope.loadings[0] = true;
                    testCaseViewerService.artifact(testCase.type, testCase.id, 'jurordocument').then(function (result) {
                        $scope.testCase['jurorDocument'] = result;
                        $scope.loadings[0] = false;
                    }, function (error) {
                        $scope.testCase['jurorDocument'] = null;
                        $scope.loadings[0] = false;
                    });
                }

                if(!$scope.testCase['messageContent'] ||$scope.testCase['messageContent'] === null) {
                    $scope.loadings[1] = true;
                    testCaseViewerService.artifact(testCase.type, testCase.id, 'messagecontent').then(function (result) {
                        $scope.testCase['messageContent'] = result;
                        $scope.loadings[1] = false;
                    }, function (error) {
                        $scope.testCase['messageContent'] = null;
                        $scope.loadings[1] = false;
                    });
                }

                if(!$scope.testCase['testStory'] ||$scope.testCase['testStory'] === null) {
                    $scope.loadings[2] = true;
                    testCaseViewerService.artifact(testCase.type, testCase.id, 'teststory').then(function (result) {
                        $scope.testCase['testStory'] = result;
                        $scope.testCase['testStory']['json'] = angular.fromJson(result['json']);
                        $scope.loadings[2] = false;
                    }, function (error) {
                        $scope.testCase['testStory'] = null;
                        $scope.loadings[2] = false;
                    });
                }

                if(!$scope.testCase['testDataSpecification'] ||$scope.testCase['testDataSpecification'] === null) {
                    $scope.loadings[3] = true;
                    testCaseViewerService.artifact(testCase.type, testCase.id, 'tds').then(function (result) {
                        $scope.testCase['testDataSpecification'] = result;
                        $scope.loadings[3] = false;
                    }, function (error) {
                        $scope.testCase['testDataSpecification'] = null;
                        $scope.loadings[3] = false;
                    });
                }

            });


            var getTestType = function(testCase){
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

            $scope.downloadJurorDoc = function (jurorDocId, title) {
                var content = $("#"+jurorDocId).html();
                if(content && content != ''){
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

        TestCaseViewerService.prototype.artifact = function (testType, id, artifactType) {
            var delay = $q.defer();
            $http.get('api/testartifact/'+ id + '/'+ artifactType, {params:{type:testType}}).then(
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