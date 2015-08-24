'use strict';


angular.module('cf')
    .controller('CFTestingCtrl', ['$scope', '$http', 'CF', '$window', '$modal', '$filter', '$rootScope', 'ngTreetableParams', 'CFTestCaseListLoader', function ($scope, $http, CF, $window, $modal, $filter, $rootScope, ngTreetableParams, CFTestCaseListLoader) {

        $scope.cf = CF;
        $scope.loading = false;
        $scope.error = null;
        $scope.testCases = [];
        $scope.testCase = CF.testCase;
        $scope.tabs = new Array();
        $scope.error = null;

        $scope.setActiveTab = function (value) {
            $scope.tabs[0] = false;
            $scope.tabs[1] = false;
            $scope.tabs[2] = false;
            $scope.tabs[3] = false;
            $scope.activeTab = value;
            $scope.tabs[$scope.activeTab] = true;
            if ($scope.activeTab == 0) {
                $scope.$broadcast("cf:refreshEditor");
            }
        };

        $scope.getTestCaseDisplayName = function (testCase) {
            return testCase.parentName + " - " + testCase.label;
        };

        $scope.loadTestCase = function (tc) {
            CF.testCase = tc;
            $scope.testCase = CF.testCase;
            $rootScope.$broadcast('cf:testCaseLoaded',$scope.testCase);
            $rootScope.$broadcast('cf:profileLoaded', $scope.testCase.testContext.profile);
            $rootScope.$broadcast('cf:valueSetLibraryLoaded', $scope.testCase.testContext.vocabularyLibrary);
        };

        $scope.init = function () {
            $scope.error = null;
            $scope.loading = true;
            $scope.testCases = [];

            $scope.params = new ngTreetableParams({
                getNodes: function (parent) {
                    return parent && parent != null ? parent.children : $scope.testCases;
                },
                getTemplate: function (node) {
                    return 'CFTestCase.html';
                }
            });

            var tcLoader = new CFTestCaseListLoader();
            tcLoader.then(function (testCases) {
                angular.forEach(testCases, function (testPlan) {
                    $scope.sortByPosition(testPlan);
                });
                $scope.testCases = $filter('orderBy')(testCases, 'position');
                $scope.loading = false;
                $scope.error = null;
                $scope.params.refresh();
            }, function (error) {
                $scope.error = "Sorry,cannot load the profiles";
                $scope.loading = false;
            });
        };

        $scope.expandChildren = function (node) {
            $scope.params.expandChildren(node);
        };

        $scope.sortByPosition = function (obj) {
            if (obj.children) {
                obj.children = $filter('orderBy')(obj.children, 'position');
                angular.forEach(obj.children, function (child) {
                    $scope.sortByPosition(child);
                });
            }
        };


        $scope.openProfileInfo = function () {
            var modalInstance = $modal.open({
                templateUrl: 'CFProfileInfoCtrl.html',
                windowClass: 'app-modal-window',
                controller: 'CFProfileInfoCtrl'
            });
        };

    }]);

angular.module('cf').controller('CFProfileInfoCtrl', function ($scope, $modalInstance) {
    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    };
});

angular.module('cf')
    .controller('CFValidatorCtrl', ['$scope', '$http', 'CF', '$window', 'HL7EditorUtils', 'HL7CursorUtils', '$timeout', 'HL7TreeUtils', '$modal', 'NewValidationResult', 'HL7Utils', 'DQAValidationResult', '$rootScope', 'Er7MessageValidator', 'Er7MessageParser', 'ValidationResultHighlighter', function ($scope, $http, CF, $window, HL7EditorUtils, HL7CursorUtils, $timeout, HL7TreeUtils, $modal, NewValidationResult, HL7Utils, DQAValidationResult, $rootScope, Er7MessageValidator, Er7MessageParser, ValidationResultHighlighter) {

        $scope.cf = CF;
        $scope.testCase = CF.testCase;
        $scope.message = CF.message;
        $scope.selectedMessage = {};
        $scope.loading = true;
        $scope.error = null;
        $scope.vError = null;
        $scope.vLoading = true;
        $scope.mError = null;
        $scope.mLoading = true;

        $scope.counter = 0;
        $scope.type = "cf";
        $scope.loadRate = 4000;
        $scope.tokenPromise = null;
        $scope.editorInit = false;
        $scope.nodelay = false;

        $scope.resized = false;
        $scope.selectedItem = null;
        $scope.activeTab = 0;

        $scope.messageObject = [];
        $scope.tError = null;
        $scope.tLoading = false;
        $scope.dqaOptions = {
                checked:false
         };



        $scope.hasContent = function () {
            return  $scope.cf.message.content != '' && $scope.cf.message.content != null;
        };


        $scope.refreshEditor = function () {
            $timeout(function () {
                $scope.editor.refresh();
            }, 1000);
        };


        $scope.options = {
//            acceptFileTypes: /(\.|\/)(txt|text|hl7|json)$/i,
            paramName: 'file',
            formAcceptCharset: 'utf-8',
            autoUpload: true,
            type: 'POST'
        };

        $scope.$on('fileuploadadd', function (e, data) {
            if (data.autoUpload || (data.autoUpload !== false &&
                $(this).fileupload('option', 'autoUpload'))) {
                data.process().done(function () {
                    var fileName = data.files[0].name;
                    data.url = 'api/hl7/message/upload';
                    var jqXHR = data.submit()
                        .success(function (result, textStatus, jqXHR) {
                            $scope.nodelay = true;
                            var tmp = angular.fromJson(result);
                            $scope.cf.message.name = fileName;
                            $scope.cf.editor.instance.doc.setValue(tmp.content);
                            $scope.mError = null;
                            $scope.execute();
                        })
                        .error(function (jqXHR, textStatus, errorThrown) {
                            $scope.cf.message.name = fileName;
                            $scope.mError = 'Sorry, Cannot upload file: ' + fileName + ", Error: " + errorThrown;
                        })
                        .complete(function (result, textStatus, jqXHR) {

                        });
                });

            }
        });

        $scope.loadMessage = function () {
            if ($scope.cf.testCase.testContext.message && $scope.cf.testCase.testContext.message != null) {
                $scope.nodelay = true;
                $scope.selectedMessage = $scope.cf.testCase.testContext.message;
                if ($scope.selectedMessage != null && $scope.selectedMessage.content != null) {
                    $scope.editor.doc.setValue($scope.selectedMessage.content);
                } else {
                    $scope.editor.doc.setValue('');
                    $scope.cf.message.id = null;
                    $scope.cf.message.name = '';
                }
                $scope.execute();
            }
        };

        $scope.setLoadRate = function (value) {
            $scope.loadRate = value;
        };

//        function makeMarker() {
//            var marker = document.createElement("div");
//            marker.style.color = "#822";
//            marker.innerHTML = "●";
//            return marker;
//        }



        $scope.initCodemirror = function () {


            $scope.editor = CodeMirror.fromTextArea(document.getElementById("cfTextArea"), {
                lineNumbers: true,
                fixedGutter: true,
                theme: "elegant",
                mode: 'edi',
                readOnly: false,
                showCursorWhenSelecting: true,
                gutters: ["CodeMirror-linenumbers", "cm-edi-segment-name"]
            });

            $scope.editor.setSize(null, 350);

            $scope.editor.on("keyup", function () {
                $timeout(function () {
                    var msg = $scope.editor.doc.getValue();
                    $scope.error = null;
                    if ($scope.tokenPromise) {
                        $timeout.cancel($scope.tokenPromise);
                        $scope.tokenPromise = undefined;
                    }
                    CF.message.name = null;
                    if (msg.trim() !== '') {
                        $scope.tokenPromise = $timeout(function () {

                            $scope.execute();
                        }, $scope.loadRate);
                    } else {
                        $scope.execute();
                    }
                });
            });

            $scope.editor.on("dblclick", function (editor) {
                $timeout(function () {
                    var coordinate = HL7CursorUtils.getCoordinate($scope.editor);
                    $scope.cf.cursor.init(coordinate.line, coordinate.startIndex, coordinate.endIndex, coordinate.index, true);
                    HL7TreeUtils.selectNodeByIndex($scope.cf.tree.root, CF.cursor, CF.message.content);
                });
            });

            $scope.cf.editor.instance = $scope.editor;

            $scope.refreshEditor();

        };

        /**
         * Validate the content of the editor
         */
        $scope.validateMessage = function () {
            $scope.vLoading = true;
            $scope.vError = null;
            $scope.dqaError = null;
            $scope.cf.dqaValidationResult = null;
            if ($scope.cf.testCase != null && $scope.cf.message.content !== "") {
                try {
                    var id = $scope.cf.testCase.testContext.id;
                    var content = $scope.cf.message.content;
                    var label = $scope.cf.testCase.label;
                    var validated = new Er7MessageValidator().validate(id, content, label, $scope.dqaOptions.checked,"1223");
                    validated.then(function (mvResult) {
                        $scope.vLoading = false;
                        $scope.loadValidationResult(mvResult);
                    }, function (error) {
                        $scope.vLoading = false;
                        $scope.vError = error;
                        $scope.loadValidationResult(null);
                    });
                } catch (e) {
                    $scope.vLoading = false;
                    $scope.vError = e;
                    $scope.loadValidationResult(null);
                }
            } else {
                $scope.loadValidationResult(null);
                $scope.vLoading = false;
                $scope.vError = null;
            }
        };

        $scope.loadValidationResult = function (mvResult) {
//            var report = null;
//            var validationResult = null;
//            if (mvResult !== null) {
//                report = {};
//                validationResult = new NewValidationResult();
//                validationResult.init(mvResult);
//                report["result"] = validationResult;
//            }
//            $rootScope.$broadcast('cf:reportLoaded', report);
            $rootScope.$broadcast('cf:validationResultLoaded', mvResult);
        };

        $scope.select = function (element) {
            if (element != undefined && element.path != null && element.line != -1) {
                var node = HL7TreeUtils.selectNodeByPath($scope.cf.tree.root, element.line, element.path);
                var data = node != null ? node.data : null;
                $scope.cf.cursor.init(data != null ? data.lineNumber : element.line, data != null ? data.startIndex - 1 : element.column - 1, data != null ? data.endIndex - 1 : element.column - 1, data != null ? data.startIndex - 1 : element.column - 1, false);
                HL7EditorUtils.select($scope.editor, $scope.cf.cursor);
            }
        };

        $scope.clearMessage = function () {
            $scope.nodelay = true;
            $scope.mError = null;
            if ($scope.editor) {
                $scope.editor.doc.setValue('');
                $scope.execute();
            }
        };

        $scope.saveMessage = function () {
            $scope.cf.message.download();
        };

        $scope.parseMessage = function () {
            $scope.tLoading = true;
            if ($scope.cf.testCase.testContext.profile != null && $scope.cf.message.content != '') {
                var parsed = new Er7MessageParser().parse($scope.cf.testCase.testContext.id, $scope.cf.message.content, $scope.cf.testCase.label);
                parsed.then(function (value) {
                    $scope.tLoading = false;
                    $scope.messageObject = value;
                }, function (error) {
                    $scope.tLoading = false;
                    $scope.tError = error;
                });
            } else {
                $scope.messageObject = [];
                $scope.tError = null;
                $scope.tLoading = false;
            }
        };

        $scope.onNodeSelect = function (node) {
            var index = HL7TreeUtils.getEndIndex(node, $scope.cf.message.content);
            $scope.cf.cursor.init(node.data.lineNumber, node.data.startIndex - 1, index - 1, node.data.startIndex - 1, false);
            HL7EditorUtils.select($scope.editor, $scope.cf.cursor);
        };

        $scope.execute = function () {
            if ($scope.cf.testCase != null) {
                $scope.error = null;
                $scope.tError = null;
                $scope.mError = null;
                $scope.vError = null;
                $scope.cf.message.content = $scope.editor.doc.getValue();
                $scope.validateMessage();
                $scope.parseMessage();
            }
         };

        $scope.init = function () {
            $scope.vLoading = false;
            $scope.tLoading = false;
            $scope.mLoading = false;
            $scope.error = null;
            $scope.tError = null;
            $scope.mError = null;
            $scope.vError = null;

            $scope.initCodemirror();

//            $scope.loadValidationResult(null);

            $scope.$on('cf:refreshEditor', function (event) {
                $scope.refreshEditor();
//                event.preventDefault();
            });


            $rootScope.$on('cf:testCaseLoaded', function (event, testCase) {
                $scope.testCase = testCase;
                $scope.refreshEditor();
                if ($scope.testCase  != null) {
                    $scope.clearMessage();
                }
            });

            $scope.$watch(
                function() {
                     return $scope.dqaOptions.checked;
                },
                function(checked) {
                    $scope.execute();
                }
            );



        };

    }])
;


angular.module('cf')
    .controller('CFReportCtrl', ['$scope', '$sce', '$http', 'CF', function ($scope, $sce, $http, CF) {
        $scope.cf = CF;
    }]);

angular.module('cf')
    .controller('CFVocabularyCtrl', ['$scope', 'CF', function ($scope, CF) {
        $scope.cf = CF;
    }]);

angular.module('cf')
    .controller('CFProfileViewerCtrl', ['$scope', 'CF', '$rootScope', function ($scope, CF, $rootScope) {
        $scope.cf = CF;
    }]);