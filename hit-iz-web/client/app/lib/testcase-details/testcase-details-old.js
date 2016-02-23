/**
 * Created by haffo on 5/4/15.
 */

(function (angular) {
    'use strict';
    var mod = angular.module('hit-testcase-details', []);

    mod.directive('testcaseDetails', [
        function () {
            return {
                restrict: 'A',
                scope: {
                    type: '@'
                },
                templateUrl: 'TestCaseDetails.html',
                controller: 'TestCaseDetailsCtrl'
            };
        }
    ]);


    mod
        .controller('TestCaseDetailsCtrl', ['$scope', '$rootScope', '$sce', 'TestCaseDetailsService', '$compile', '$timeout', '$modal', function ($scope, $rootScope, $sce, TestCaseDetailsService, $compile, $timeout, $modal) {
            $scope.tabs = [];
            $scope.loading = false;
            $scope.editor = null;
            $scope.error = null;
            $scope.$on($scope.type + ':testCaseSelected', function (event, testCase) {
                $scope.tabs[0] = true;
                $scope.tabs[1] = false;
                $scope.tabs[2] = false;
                $scope.tabs[3] = false;
                $scope.tabs[4] = false;
                $scope.testCase = testCase;
                $scope.loading = true;
                $scope.error = null;
                TestCaseDetailsService.details(testCase.type, testCase.id).then(function (result) {
                    $scope.testCase['testStory'] = result['testStory'];
                    $scope.testCase['jurorDocument'] = result['jurorDocument'];
                    $scope.testCase['testDataSpecification'] = result['testDataSpecification'];
                    $scope.testCase['messageContent'] = result['messageContent'];

                    $scope.removeHtml('testStory');
                    $scope.removeHtml('jurorDocument');
                    $scope.removeHtml('testDataSpecification');
                    $scope.removeHtml('messageContent');
                    $scope.removeHtml('testDescription');
                    $scope.loadHtml('testStory');

                    $scope.loading = false;
                    $scope.error = null;
                }, function (error) {
                    $scope.testCase['testStory'] = null;
                    $scope.testCase['testPackage'] = null;
                    $scope.testCase['jurorDocument'] = null;
                    $scope.testCase['testDataSpecification'] = null;
                    $scope.testCase['messageContent'] = null;
                    $scope.loading = false;
                    $scope.error = "Sorry, could not load the details. Please try again";
                });
            });

            $scope.loadHtml = function (artifactType) {
                if ($scope.testCase && $scope.testCase !== null) {
                    var cont = null;
                    var element = null;

                    if(artifactType === 'testStory'){
                        element = $('#' + artifactType);
                        if($scope.testCase[artifactType] != null){
                            cont = $scope.testCase[artifactType].html;
                        }else if($scope.testCase['description'] != null && $scope.testCase['description'] != ''){
                            cont =  $scope.testCase['description'];
                        }else{
                            cont = 'No Content Available';
                        }
                    }else if ($scope.testCase[artifactType] && $scope.testCase[artifactType] !== null) {
                        element = $('#' + artifactType);
                        cont = $scope.testCase[artifactType].html;
                    }
                    if (cont && element && cont != null && element != null) {
                        element.html(cont);
                        $compile(element.contents())($scope);
                    }
                }
            };

            $scope.removeHtml = function (artifactType) {
                var element = $('#' + artifactType);
                if (element && element != null) {
                    element.html('');
                }
            };

            var getTestType = function (testCase) {
                return testCase.type.toLowerCase();
            };

            $scope.isMcHelpPresent = function () {
                return $rootScope.appInfo != null && $rootScope.appInfo.messageContentInfo != null;
            };

            $scope.openMcInfo = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'MessageContentInfoCtrl.html',
                    windowClass: 'message-content-info-modal',
                    controller: 'MessageContentInfoCtrl',
                    keyboard: true,
                    backdrop: true,
                    resolve: {
                        mcHelpInfo: function () {
                            return $rootScope.appInfo.messageContentInfo;
                        }
                    }
                });
            };

            $scope.downloadTestArtifact = function (path) {
                if ($scope.testCase != null) {
                    var form = document.createElement("form");
                    form.action = "api/artifact/download";
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
                    form.action = 'api/artifact/generateJurorDoc/pdf';
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
                if (tabs.length === 0)
                    tabs = content.split("\t");
                if (tabs.length === 0)
                    tabs = content.split("\r");
                var length = tabs.length > 30 ? 30 : tabs.length + 3;
                return parseInt((420 * length) / 30);
            };


            $scope.buildTextEditor = function () {
                $timeout(function () {
                    if ($scope.editor && $scope.editor != null) {
                        $scope.editor.setValue($scope.testCase.testContext.message.content);
                        $timeout(function () {
                            $("#exampleMsg").scrollLeft();
                        }, 1000);
                    } else {
                        $scope.editor = CodeMirror(document.getElementById("exampleMsg"), {
                            value: $scope.testCase.testContext.message.content,
                            lineNumbers: true,
                            fixedGutter: true,
                            theme: "elegant",
                            mode: $scope.testCase.testContext.format,
                            readOnly: true,
                            showCursorWhenSelecting: true
                        });
                    }
//                    $scope.editor.setSize("100%", getSizeByContent($scope.editor.getValue()));
                    $scope.editor.setSize("100%", "590");

                }, 100);
            };
        }]);

    mod.factory('TestCaseDetailsService', function ($http, $q, $filter) {
        var TestCaseDetailsService = function () {
        };

        TestCaseDetailsService.details = function (type, id) {
            var delay = $q.defer();
            $http.get('api/'+ type.toLowerCase() + 's/'+ id + '/details').then(
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


        return TestCaseDetailsService;

    });

    mod.controller('MessageContentInfoCtrl',
        function ($scope, $modalInstance, mcHelpInfo) {
            $scope.mcHelpInfo = mcHelpInfo;
            $scope.close = function () {
                $modalInstance.dismiss('cancel');
            }
        }
    );


})(angular);