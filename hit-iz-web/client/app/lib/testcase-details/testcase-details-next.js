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


    mod.directive('tds', [
        function () {
            return {
                restrict: 'A',
                scope: {
                    realm: '@'
                },
                templateUrl: 'tds.html',
                controller: 'TdsCtrl'
            };
        }
    ]);

    mod.directive('testStory', [
        function () {
            return {
                restrict: 'A',
                scope: {
                    realm: '@'
                },
                templateUrl: 'testStory.html',
                controller: 'TestStoryCtrl'
            };
        }
    ]);


    mod.directive('messageContent', [
        function () {
            return {
                restrict: 'A',
                scope: {
                    realm: '@'
                },
                templateUrl: 'messageContent.html',
                controller: 'MessageContentCtrl'
            };
        }
    ]);

    mod.directive('jurorDocument', [
        function () {
            return {
                restrict: 'A',
                scope: {
                    realm: '@'
                },
                templateUrl: 'jurorDocument.html',
                controller: 'JurorDocumentCtrl'
            };
        }
    ]);

    mod.directive('exampleMessage', [
        function () {
            return {
                restrict: 'A',
                scope: {
                    realm: '@',
                    format:'='
                 },
                templateUrl: 'exampleMessage.html',
                controller: 'ExampleMessageCtrl'
            };
        }
    ]);


    mod
        .controller('ExampleMessageCtrl', ['$scope', '$rootScope', '$sce', 'TestCaseDetailsService', '$compile', '$timeout', '$modal', function ($scope, $rootScope, $sce, TestCaseDetailsService, $compile, $timeout, $modal) {
            $scope.loading = false;
            $scope.editor = null;
            $scope.exampleMessage = null;
            $scope.error = null;
            $scope.$on($scope.realm + "-example-message", function (event, exampleMessage, title) {
                $scope.exampleMessage = exampleMessage;
                $scope.loading = true;
                $scope.error = null;
            });

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


            $scope.download = function () {
                if ($scope.exampleMessage != null) {
                    var form = document.createElement("form");
                    form.action = "api/message/download";
                    form.method = "POST";
                    form.target = "_target";
                    var input = document.createElement("textarea");
                    input.name = "content";
                    input.value = $scope.exampleMessage;
                    form.appendChild(input);
                    form.style.display = 'none';
                    document.body.appendChild(form);
                    form.submit();
                }
            };

            $scope.buildTextEditor = function () {
                $timeout(function () {
                    if ($scope.editor && $scope.editor != null) {
                        $scope.editor.setValue($scope.exampleMessage);
                        $timeout(function () {
                            $("#exampleMsg").scrollLeft();
                        }, 1000);
                    } else {
                        $scope.editor = CodeMirror(document.getElementById($scope.realm + "-exampleMsg"), {
                            value: $scope.exampleMessage,
                            lineNumbers: true,
                            fixedGutter: true,
                            theme: "elegant",
                            mode: $scope.format,
                            readOnly: true,
                            showCursorWhenSelecting: true
                        });
                    }
//                    $scope.editor.setSize("100%", getSizeByContent($scope.editor.getValue()));
                    $scope.editor.setSize("100%", "590");

                }, 100);
            };
        }]);

    mod
        .controller('JurorDocumentCtrl', ['$scope', '$rootScope', '$sce', 'TestCaseDetailsService', '$compile', '$timeout', '$modal', function ($scope, $rootScope, $sce, TestCaseDetailsService, $compile, $timeout, $modal) {
            $scope.loading = false;
            $scope.jurorDocument = null;
            $scope.error = null;
            $scope.$on($scope.realm + "-juror-document", function (event, jurorDocument, format,title) {
                $scope.jurorDocument = jurorDocument;
                $scope.loading = true;
                $scope.error = null;
                $scope.title = title;
            });

            $scope.download = function (jurorDocId, title) {
                var content = $("#" + $scope.realm + "jurorDocument").html();
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
                    nam.value = $scope.title;
                    form.style.display = 'none';
                    form.appendChild(nam);

                    document.body.appendChild(form);
                    form.submit();
                }
            };
        }]);

    mod
        .controller('TdsCtrl', ['$scope', '$rootScope', '$sce', 'TestCaseDetailsService', '$compile', '$timeout', '$modal', function ($scope, $rootScope, $sce, TestCaseDetailsService, $compile, $timeout, $modal) {
            $scope.loading = false;
            $scope.tds = null;
            $scope.error = null;
            $scope.$on($scope.realm + "-tds", function (event, tds, format,title) {
                $scope.tds = tds;
                $scope.loading = false;
                $scope.error = null;
            });
            $scope.download = function (path) {
                     TestCaseDetailsService.download(tds.pdfPath);
             };
        }]);

    mod
        .controller('MessageContentCtrl', ['$scope', '$rootScope', '$sce', 'TestCaseDetailsService', '$compile', '$timeout', '$modal', function ($scope, $rootScope, $sce, TestCaseDetailsService, $compile, $timeout, $modal) {
            $scope.loading = false;
            $scope.messageContent = null;
            $scope.error = null;
            $scope.$on($scope.event + "-message-content", function (event, messageContent, format,title) {
                $scope.messageContent = messageContent;
                $scope.loading = false;
                $scope.error = null;
            });
            $scope.download = function () {
                 TestCaseDetailsService.download($scope.messageContent.pdfPath);
            };
        }]);


    mod
        .controller('TestStoryCtrl', ['$scope', '$rootScope', '$sce', 'TestCaseDetailsService', '$compile', '$timeout', '$modal', function ($scope, $rootScope, $sce, TestCaseDetailsService, $compile, $timeout, $modal) {
            $scope.loading = false;
            $scope.messageContent = null;
            $scope.error = null;
            $scope.$on($scope.realm + "-test-story", function (event, testStory, format,title) {
                $scope.testStory = testStory;
                $scope.loading = false;
                $scope.error = null;
            });
            $scope.download = function () {
                TestCaseDetailsService.download($scope.testStory.pdfPath);
            };
        }]);



    mod
        .controller('TestCaseDetailsCtrl', ['$scope', '$rootScope', '$sce', 'TestCaseDetailsService', '$compile', '$timeout', '$modal', function ($scope, $rootScope, $sce, TestCaseDetailsService, $compile, $timeout, $modal) {
            $scope.tabs = [];
            $scope.loading = false;
            $scope.editor = null;
            $scope.error = null;
            $scope.realm = 'selected-testcase';
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
                    $rootScope.$emit($scope.realm + '-example-message', $scope.testCase.testContext.message.content, $scope.testCase.testContext.format,$scope.testCase.name);
                    $rootScope.$emit($scope.realm + '-test-story', $scope.testCase['testStory'], $scope.testCase.testContext.format,$scope.testCase.name);
                    $rootScope.$emit($scope.realm + '-juror-document', $scope.testCase['jurorDocument'], $scope.testCase.testContext.format,$scope.testCase.name);
                    $rootScope.$emit($scope.realm + '-message-content', $scope.testCase['messageContent'], $scope.testCase.testContext.format,$scope.testCase.name);
//                    $rootScope.$emit(realm + '-test-description', $scope.testCase['testDescription'], $scope.testCase.testContext.format,$scope.testCase.name);
                    $rootScope.$emit($scope.realm + '-tds', $scope.testCase['testDataSpecification'], $scope.testCase.testContext.format,$scope.testCase.name);
                    TestCaseDetailsService.removeHtml($scope.realm + '-testStory');
                    TestCaseDetailsService.removeHtml($scope.realm + '-jurorDocument');
                    TestCaseDetailsService.removeHtml($scope.realm + '-testDataSpecification');
                    TestCaseDetailsService.removeHtml($scope.realm + '-messageContent');
                    TestCaseDetailsService.removeHtml($scope.realm + '-testDescription');
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
                var element = TestCaseDetailsService.loadHtml(artifactType, $scope.testCase, $scope);
                if(element) {
                    $compile(element.contents())($scope);
                }

            };

            var getTestType = function (testCase) {
                return testCase.type.toLowerCase();
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
                        $scope.editor = CodeMirror(document.getElementById($scope.realm+ "-exampleMsg"), {
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
            $http.get('api/' + type.toLowerCase() + 's/' + id + '/details').then(
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


        TestCaseDetailsService.loadHtml = function (artifactType, testCase) {
            if (testCase && testCase !== null) {
                var cont = null;
                var element = null;
                if (artifactType === 'testStory') {
                    element = $('#' + artifactType);
                    if (testCase[artifactType] != null) {
                        cont = testCase[artifactType].html;
                    } else if (testCase['description'] != null && testCase['description'] != '') {
                        cont = testCase['description'];
                    } else {
                        cont = 'No Content Available';
                    }
                } else if (testCase[artifactType] && testCase[artifactType] !== null) {
                    element = $('#' + artifactType);
                    cont = testCase[artifactType].html;
                }
                if (cont && element && cont != null && element != null) {
                    element.html(cont);
                }
                return element;
            }
            return null;
        };

        TestCaseDetailsService.removeHtml = function (artifactType) {
            var element = $('#' + artifactType);
            if (element && element != null) {
                element.html('');
            }
        };

        TestCaseDetailsService.download = function (path) {
            if (path != null) {
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


})
(angular);