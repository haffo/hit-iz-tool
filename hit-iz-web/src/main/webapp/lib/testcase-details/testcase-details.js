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


    mod.directive('testDataSpecification', [
        function () {
            return {
                restrict: 'A',
                scope: {
                    target: '@'
                },
                templateUrl: 'TestDataSpecification.html',
                controller: 'TestDataSpecificationCtrl'
            };
        }
    ]);

    mod.directive('testStory', [
        function () {
            return {
                restrict: 'A',
                scope: {
                    target: '@'
                },
                templateUrl: 'TestStory.html',
                controller: 'TestStoryCtrl'
            };
        }
    ]);


    mod.directive('messageContent', [
        function () {
            return {
                restrict: 'A',
                scope: {
                    target: '@'
                },
                templateUrl: 'MessageContent.html',
                controller: 'MessageContentCtrl'
            };
        }
    ]);

    mod.directive('testDescription', [
        function () {
            return {
                restrict: 'A',
                scope: {
                    target: '@'
                },
                templateUrl: 'TestDescription.html',
                controller: 'TestDescriptionCtrl'
            };
        }
    ]);


    mod.directive('jurorDocument', [
        function () {
            return {
                restrict: 'A',
                scope: {
                    target: '@'
                },
                templateUrl: 'JurorDocument.html',
                controller: 'JurorDocumentCtrl'
            };
        }
    ]);

    mod.directive('exampleMessage', [
        function () {
            return {
                restrict: 'A',
                scope: {
                    target: '@'
                },
                templateUrl: 'ExampleMessage.html',
                controller: 'ExampleMessageCtrl'
            };
        }
    ]);

    mod.directive('supplementDocuments', [
        function () {
            return {
                restrict: 'A',
                scope: {
                    target: '@'
                },
                templateUrl: 'SupplementDocuments.html',
                controller: 'SupplementDocumentsCtrl'
            };
        }
    ]);

    mod
        .controller('ExampleMessageCtrl', ['$scope', '$rootScope', '$sce', 'TestCaseDetailsService', '$compile', '$timeout', '$modal', function ($scope, $rootScope, $sce, TestCaseDetailsService, $compile, $timeout, $modal) {
            $scope.editor = null;
            $scope.exampleMessage = null;
            $scope.eId = $scope.target + "-exampleMessage";
            $scope.$on($scope.eId, function (event, exampleMessage, format, title) {
                $scope.exampleMessage = exampleMessage;
                $scope.title = title;
            });



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
                    input = document.createElement("input");
                    input.name = "title";
                    input.value = $scope.title;
                    form.appendChild(input);
                    form.style.display = 'none';
                    document.body.appendChild(form);
                    form.submit();
                }
            };
        }]);

    mod
        .controller('JurorDocumentCtrl', ['$scope', '$rootScope', '$sce', 'TestCaseDetailsService', '$compile', '$timeout', '$modal', function ($scope, $rootScope, $sce, TestCaseDetailsService, $compile, $timeout, $modal) {
            $scope.jurorDocument = null;
            $scope.error = null;
            $scope.eId = $scope.target + "-jurorDocument";
            $scope.$on($scope.eId, function (event, jurorDocument, title) {
                $scope.jurorDocument = jurorDocument;
                if($scope.jurorDocument !=null && $scope.jurorDocument.html !=null){
                    $scope.jurorDocument.html =  TestCaseDetailsService.disableInputs($scope.jurorDocument.html);
                }
                $scope.error = null;
                $scope.title = title;
            });

//            $scope.download = function (jurorDocId, title) {
//                var content = $($scope.eId).html();
//                if (content && content != '') {
//                    var form = document.createElement("form");
//                    form.action = 'api/artifact/generateJurorDoc/pdf';
//                    form.method = "POST";
//                    form.target = "_target";
//
//                    var input = document.createElement("textarea");
//                    input.name = "html";
//                    input.value = content;
//                    form.appendChild(input);
//
//                    var type = document.createElement("input");
//                    type.name = "type";
//                    type.value = "JurorDocument";
//                    form.style.display = 'none';
//                    form.appendChild(type);
//
//                    var nam = document.createElement("input");
//                    nam.name = "name";
//                    nam.value = $scope.title;
//                    form.style.display = 'none';
//                    form.appendChild(nam);
//
//                    document.body.appendChild(form);
//                    form.submit();
//                }
//            };

            $scope.download = function () {
                if ($scope.jurorDocument != null)
                    TestCaseDetailsService.downloadByPath($scope.jurorDocument.pdfPath, $scope.title);
            };

        }]);

    mod
        .controller('TestDataSpecificationCtrl', ['$scope', '$rootScope', '$sce', 'TestCaseDetailsService', '$compile', '$timeout', '$modal', function ($scope, $rootScope, $sce, TestCaseDetailsService, $compile, $timeout, $modal) {
            $scope.loading = false;
            $scope.testDataSpecification = null;
            $scope.error = null;
            $scope.title = null;
            $scope.eId = $scope.target + "-testDataSpecification";
            $scope.$on($scope.eId, function (event, testDataSpecification, title) {
                $scope.testDataSpecification = testDataSpecification;
                if($scope.testDataSpecification !=null && $scope.testDataSpecification.html !=null){
                    $scope.testDataSpecification.html =  TestCaseDetailsService.disableInputs($scope.testDataSpecification.html);
                }
                $scope.loading = false;
                $scope.error = null;
                $scope.title = title;
            });
            $scope.download = function (path) {
                if ($scope.testDataSpecification != null)
                    TestCaseDetailsService.downloadByPath($scope.testDataSpecification.pdfPath, $scope.title);
            };
        }]);

    mod
        .controller('MessageContentCtrl', ['$scope', '$rootScope', '$sce', 'TestCaseDetailsService', '$compile', '$timeout', '$modal', function ($scope, $rootScope, $sce, TestCaseDetailsService, $compile, $timeout, $modal) {
            $scope.messageContent = null;
            $scope.eId = $scope.target + "-messageContent";
            $scope.$on($scope.eId, function (event, messageContent, title) {
                $scope.messageContent = messageContent;
                if($scope.messageContent !=null && $scope.messageContent.html !=null){
                    $scope.messageContent.html =  TestCaseDetailsService.disableInputs($scope.messageContent.html);
                }
                $scope.title = title;
            });

            $scope.openMcInfo = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'MessageContentInfo.html',
                    windowClass: 'message-content-info-modal',
                    controller: 'MessageContentInfoCtrl',
                    keyboard: true,
                    backdrop: true
                });
            };

            $scope.isMcHelpPresent = function () {
                return $rootScope.appInfo != null && $rootScope.appInfo.messageContentInfo != null;
            };

            $scope.download = function () {
                if ($scope.messageContent != null)
                    TestCaseDetailsService.downloadByPath($scope.messageContent.pdfPath, $scope.title);
            };
        }]);


    mod
        .controller('TestStoryCtrl', ['$scope', '$rootScope', '$sce', 'TestCaseDetailsService', '$compile', '$timeout', '$modal', function ($scope, $rootScope, $sce, TestCaseDetailsService, $compile, $timeout, $modal) {
            $scope.messageContent = null;
            $scope.eId = $scope.target + "-testStory";
            $scope.$on($scope.eId, function (event, testStory, title) {
                $scope.testStory = testStory;
                if($scope.testStory !=null && $scope.testStory.html !=null){
                    $scope.testStory.html =  TestCaseDetailsService.disableInputs($scope.testStory.html);
                }
                $scope.title = title;
            });
            $scope.download = function () {
                if ($scope.testStory != null)
                    TestCaseDetailsService.downloadByPath($scope.testStory.pdfPath, $scope.title);
            };
        }]);



    mod
        .controller('SupplementDocumentsCtrl', ['$scope', '$rootScope', '$sce', 'TestCaseDetailsService', '$compile', '$timeout', '$modal', function ($scope, $rootScope, $sce, TestCaseDetailsService, $compile, $timeout, $modal) {
            $scope.supplements = null;
            $scope.eId = $scope.target + "-supplements";
            $scope.$on($scope.eId, function (event, supplements, title) {
                console.log("new supplements catched");
                $scope.supplements = supplements;
            });

            $scope.isLink = function (path) {
                return path && path != null && path.startsWith("http");
            };

            $scope.downloadDocument = function (path) {
                if (path != null) {
                    var form = document.createElement("form");
                    form.action = "api/documentation/downloadDocument";
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
        }]);


    mod
        .controller('TestDescriptionCtrl', ['$scope', '$rootScope', '$sce', 'TestCaseDetailsService', '$compile', '$timeout', '$modal', function ($scope, $rootScope, $sce, TestCaseDetailsService, $compile, $timeout, $modal) {
            $scope.description = null;
            $scope.eId = $scope.target + "-testDescription";
            $scope.$on($scope.eId, function (event, description, title) {
                $scope.description = description;
                if($scope.description !=null){
                    $scope.description =  TestCaseDetailsService.disableInputs($scope.description);
                }
                $scope.title = title;
            });
        }]);


    mod
        .controller('TestCaseDetailsCtrl', ['$scope', '$rootScope', '$sce', 'TestCaseDetailsService', '$compile', '$timeout', '$modal', function ($scope, $rootScope, $sce, TestCaseDetailsService, $compile, $timeout, $modal) {
            $scope.tabs = [];
            $scope.loading = false;
            $scope.editor = null;
            $scope.error = null;
            $scope.target = 'selected-testcase';
            $scope.$on($scope.type + ':testCaseSelected', function (event, testCase) {
                $scope.tabs[0] = true;
                $scope.tabs[1] = false;
                $scope.tabs[2] = false;
                $scope.tabs[3] = false;
                $scope.tabs[4] = false;
                $scope.tabs[5] = false;
                $scope.testCase = testCase;
                $scope.loading = true;
                $scope.error = null;
                $scope.editor = null;

                var testContext = testCase['testContext'];
                if (testContext && testContext != null) {
                    var exampleMsgId = $scope.target + '-exampleMessage';
                    TestCaseDetailsService.removeHtml(exampleMsgId);
                    var exampleMessage = testContext.message && testContext.message.content && testContext.message.content != null ? testContext.message.content : null;
                    if (exampleMessage != null) {
                        $scope.$broadcast(exampleMsgId, exampleMessage, testContext.format, testCase.name);
                    }
                }
                TestCaseDetailsService.details(testCase.type, testCase.id).then(function (result) {
                    $scope.testCase['testStory'] = result['testStory'];
                    $scope.testCase['jurorDocument'] = result['jurorDocument'];
                    $scope.testCase['testDataSpecification'] = result['testDataSpecification'];
                    $scope.testCase['messageContent'] = result['messageContent'];
                    $scope.testCase['supplements'] = result['supplements'];

                    var tsId = $scope.target + '-testStory';
                    var jDocId = $scope.target + '-jurorDocument';
                    var mcId = $scope.target + '-messageContent';
                    var tdsId = $scope.target + '-testDataSpecification';
                    var descId = $scope.target + '-testDescription';
                    var supplementsId = $scope.target + '-supplements';

                    TestCaseDetailsService.removeHtml(tdsId);
                    TestCaseDetailsService.removeHtml(mcId);
                    TestCaseDetailsService.removeHtml(jDocId);
                    TestCaseDetailsService.removeHtml(tsId);
                    TestCaseDetailsService.removeHtml(descId);

                    $scope.$broadcast(tsId, $scope.testCase['testStory'], $scope.testCase.name + "-TestStory");
                    $scope.$broadcast(jDocId, $scope.testCase['jurorDocument'], $scope.testCase.name + "-JurorDocument");
                    $scope.$broadcast(mcId, $scope.testCase['messageContent'], $scope.testCase.name + "-MessageContent");
                    $scope.$broadcast(tdsId, $scope.testCase['testDataSpecification'], $scope.testCase.name + "-TestDataSpecification");
                    $scope.$broadcast(descId, $scope.testCase['description'], $scope.testCase.name + "-TestDescription");
                    $scope.$broadcast(supplementsId, $scope.testCase['supplements'], $scope.testCase.name + "-Supplements");

                    $scope.loadTestInfo();
                    $scope.loading = false;
                    $scope.error = null;
                }, function (error) {
                    $scope.testCase['testStory'] = null;
                    $scope.testCase['testPackage'] = null;
                    $scope.testCase['jurorDocument'] = null;
                    $scope.testCase['testDataSpecification'] = null;
                    $scope.testCase['messageContent'] = null;
                    $scope.testCase['supplements'] = null;
                    $scope.loading = false;
                    $scope.error = "Sorry, could not load the details. Please try again";
                });
            });

            $scope.loadTestInfo = function () {
                if ($scope.testCase != null) {
                    if ($scope.testCase['testStory'] && $scope.testCase['testStory'] != null) {
                        $scope.loadTestStory();
                    } else {
                        $scope.loadTestDescription();
                    }
                }
            };

            $scope.loadTestStory = function () {
                $scope.loadHtmlContent($scope.target + "-" + "testStory", $scope.testCase["testStory"]);
            };

            $scope.loadTestDescription = function () {
                var element = TestCaseDetailsService.loadHtmlContent($scope.target + "-" + "testDescription", $scope.testCase['description']);
                if (element && element != null) {
                    $compile(element.contents())($scope);
                }
            };

            $scope.loadArtifactHtml = function (key) {
                $scope.loadHtmlContent($scope.target + "-" + key, $scope.testCase[key]);
            };

            $scope.loadHtmlContent = function (id, content) {
                var element = TestCaseDetailsService.loadArtifactHtml(id, content);
                if (element && element != null) {
                    $compile(element.contents())($scope);
                }
            };

            $scope.loadTestDocuments = function (key) {
                $scope.loadHtmlContent($scope.target + "-" + key, $scope.testCase[key]);
            };




//            var getTestType = function (testCase) {
//                return testCase.type.toLowerCase();
//            };
//
//            var getItem = function (obj, type) {
//                return {
//                    "dataElement": obj.DataElement,
//                    "categorization": obj.Categrization,
//                    "data": obj.Data,
//                    "location": obj.Location,
//                    "type": type
//                }
//            };

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

            $scope.buildExampleMessageEditor = function () {
                var eId = $scope.target + '-exampleMessage';
                if ($scope.editor === null || !$scope.editor) {
                    $timeout(function () {
                        $scope.editor = TestCaseDetailsService.buildExampleMessageEditor(eId, $scope.testCase.testContext.message.content, $scope.editor, $scope.testCase.testContext && $scope.testCase.testContext != null ? $scope.testCase.testContext.format : null);
                    }, 100);
                }
                $timeout(function () {
                    if ($("#" + eId)) {
                        $("#" + eId).scrollLeft();
                    }
                }, 1000);
            };
        }]);

    mod.factory('TestCaseDetailsService', function ($http, $q, $filter, $timeout) {
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
//            $http.get('../../resources/cb/testCaseDetails.json').then(
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

            return delay.promise;
        };


        TestCaseDetailsService.loadArtifactHtml = function (eId, artifact) {
            if (artifact && artifact !== null) {
                var cont = null;
                var element = $('#' + eId);
                if (eId.endsWith('-testStory')) {
                    cont = artifact.html && artifact.html != null ? artifact.html : 'No Content Available';
                } else {
                    cont = artifact.html && artifact.html != null ? artifact.html : null;
                }
                if (cont && element && cont != null && element != null) {
                    element.html(cont);
                }
                return element;
            }
            return null;
        };

        TestCaseDetailsService.disableInputs = function (content) {
            return content.replace(new RegExp("<input ", 'g'), "<input disabled='true' ").replace(new RegExp("<textarea ", 'g'), "<textarea disabled='true' ");
        };


        TestCaseDetailsService.loadHtmlContent = function (eId, content) {
            if (content && content !== null) {
                var element = $('#' + eId);
                if (element && element != null) {
                    element.html(content);
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

        TestCaseDetailsService.buildExampleMessageEditor = function (eId, content, edit, format) {
//            var editor = edit;
//            if (editor && editor != null) {
//                var textArea = editor.toTextArea();
//                if(textArea){
//                    textArea.parent().rem
//                }
//
//                editor.setValue(content);
//            } else {
//
//            }
            var
                editor = CodeMirror(document.getElementById(eId), {
                    value: content,
                    lineNumbers: true,
                    fixedGutter: true,
                    theme: "elegant",
                    readOnly: true,
                    mode: format,
                    showCursorWhenSelecting: true
                });

//                    $scope.editor.setSize("100%", getSizeByContent($scope.editor.getValue()));
            editor.setSize("100%", "590");
            return editor;
        };


        TestCaseDetailsService.downloadByPath = function (path, title) {
            if (path != null && title != null) {
                var form = document.createElement("form");
                form.action = "api/artifact/download";
                form.method = "POST";
                form.target = "_target";
                var input = document.createElement("input");
                input.name = "path";
                input.value = path;
                form.appendChild(input);

                input = document.createElement("input");
                input.name = "title";
                input.value = title;
                form.appendChild(input);


                form.style.display = 'none';
                document.body.appendChild(form);
                form.submit();
            }
        };


        return TestCaseDetailsService;

    });

    mod.controller('MessageContentInfoCtrl',
        function ($scope, $modalInstance, $rootScope) {
            $scope.mcHelpInfo = $rootScope.appInfo.messageContentInfo;
            $scope.close = function () {
                $modalInstance.dismiss('cancel');
            }
        }
    );


})
(angular);