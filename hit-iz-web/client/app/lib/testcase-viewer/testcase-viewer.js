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
        .controller('TestCaseViewerCtrl', ['$scope', '$rootScope', '$sce', 'TestCaseViewerService', '$compile', '$timeout',function ($scope, $rootScope, $sce, TestCaseViewerService, $compile,$timeout) {
            $scope.tabs = [];
            $scope.loading = false;
            $scope.editor = null;

            var testCaseViewerService = new TestCaseViewerService();
            $rootScope.$on($scope.type + ':testCaseSelected', function (event, testCase) {
                $scope.tabs[0] = true;
                $scope.tabs[1] = false;
                $scope.tabs[2] = false;
                $scope.tabs[3] = false;
                $scope.tabs[4] = false;
                $scope.testCase = testCase;
                $scope.loading = true;
                testCaseViewerService.artifacts(testCase.type, testCase.id).then(function (result) {
                    $scope.testCase['testStory'] = result['testStory'];
                    $scope.testCase['jurorDocument'] = result['jurorDocument'];
                    $scope.testCase['testDataSpecification'] = result['testDataSpecification'];
                    $scope.testCase['messageContent'] = result['messageContent'];

                    $scope.uncompileArtifact('testStory');
                    $scope.uncompileArtifact('jurorDocument');
                    $scope.uncompileArtifact('testDataSpecification');
                    $scope.uncompileArtifact('messageContent');
                    $scope.uncompileArtifact('testDescription');

                    if(testCase.type === 'TestPlan' || testCase.type === 'TestCaseGroup'){
                        $scope.compileArtifact('testDescription');
                    }else{
                        $scope.compileArtifact('testStory');
                    }
                    $scope.loading = false;
                }, function (error) {
                    $scope.testCase['testStory'] = null;
                    $scope.testCase['testPackage'] = null;
                    $scope.testCase['jurorDocument'] = null;
                    $scope.testCase['testDataSpecification'] = null;
                    $scope.testCase['messageContent'] = null;
                    $scope.loading = false;
                });
            });

            $scope.compileArtifact = function (artifactType) {
                if ($scope.testCase && $scope.testCase !== null){
                    if(artifactType === 'testDescription') {
                        var element = $('#testDescription');
                        if (element.html() == '') {
                            var cont = $scope.testCase['description'] != null && $scope.testCase['description'] != '' ? $scope.testCase['description']: 'No description available';
                            element.html(cont);
                            $compile(element.contents())($scope);
                        }
                    }else  if ($scope.testCase[artifactType] && $scope.testCase[artifactType] !== null) {
                        var element = $('#' + artifactType);
                        if (element.html() == '') {
                            element.html($scope.testCase[artifactType].html);
                            $compile(element.contents())($scope);
                        }
                    }
                }
            };

            $scope.uncompileArtifact = function (artifactType) {
                var element = $('#' + artifactType);
                if(element && element != null) {
                    element.html('');
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

            var getSizeByContent = function (content) {
                 var tabs = content.split("\n");
                if(tabs.length === 0)
                tabs = content.split("\t");
                if(tabs.length === 0)
                tabs = content.split("\r");
                var length = tabs.length > 30 ? 30:tabs.length+3;
                return parseInt((420 * length)/30);
            };


            $scope.buildTextEditor = function(){
               $timeout(function() {
                   if($scope.editor && $scope.editor != null){
                       $scope.editor.setValue($scope.testCase.testContext.message.content);
                   }else {
                        $scope.editor = CodeMirror(document.getElementById("exampleMsg"), {
                           value: $scope.testCase.testContext.message.content,
                           lineNumbers: true,
                           fixedGutter: true,
                           theme: "elegant",
                           mode: 'edi',
                           readOnly: true,
                           showCursorWhenSelecting: false,
                           gutters: ["CodeMirror-linenumbers", "cm-edi-segment-name"]
                       });
                    }
                   $scope.editor.setSize("100%", getSizeByContent($scope.editor.getValue()));
//                 $scope.editor.setValue($scope.testCase.testContext.message.content);
//             $scope.editor.setSize("100%", 350);
               },100);
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