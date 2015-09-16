'use strict';

angular.module('cb')
    .controller('CBTestingCtrl', ['$scope', '$window', '$rootScope', 'CB', 'StorageService', function ($scope, $window, $rootScope, CB, StorageService) {

        $scope.init = function () {
            var tab = StorageService.get(StorageService.ACTIVE_SUB_TAB_KEY);
            if (tab == null || tab != '/cb_execution') tab = '/cb_testcase';
            $rootScope.setSubActive(tab);
        };

        $scope.getTestType = function () {
            return CB.testCase.type;
        };

        $scope.disabled = function () {
            return CB.testCase == null || CB.testCase.id === null;
        };

    }]);


angular.module('cb')
    .controller('CBExecutionCtrl', ['$scope', '$window', '$rootScope', '$timeout', 'StorageService', function ($scope, $window, $rootScope, $timeout, StorageService) {
        $scope.loading = true;
        $scope.error = null;
        $scope.tabs = new Array();
        $scope.testCase = null;
        $scope.setActiveTab = function (value) {
            $scope.tabs[0] = false;
            $scope.tabs[1] = false;
            $scope.tabs[2] = false;
            $scope.tabs[3] = false;
            $scope.activeTab = value;
            $scope.tabs[$scope.activeTab] = true;
        };

        $scope.getTestType = function () {
            return $scope.testCase != null ? $scope.testCase.type : '';
        };

        $scope.init = function () {
            $scope.error = null;
            $scope.loading = false;
            $scope.setActiveTab(0);
            $rootScope.$on('cb:testCaseLoaded', function (event, testCase, tab) {
                $rootScope.setSubActive(tab && tab != null ? tab : '/cb_execution');
                $scope.testCase = testCase;
                $timeout(function () {
                    $rootScope.$broadcast('cb:profileLoaded', $scope.testCase.testContext.profile);
                });
                $timeout(function () {
                    $rootScope.$broadcast('cb:valueSetLibraryLoaded', $scope.testCase.testContext.vocabularyLibrary);
                });
            });
        };

    }]);


angular.module('cb')
    .controller('CBTestCaseCtrl', ['$scope', '$window', '$filter', '$rootScope', 'CB', '$timeout', 'CBTestCaseListLoader', '$sce', 'StorageService', 'TestCaseService', function ($scope, $window, $filter, $rootScope, CB, $timeout, CBTestCaseListLoader, $sce, StorageService, TestCaseService) {
        $scope.selectedTestCase = CB.selectedTestCase;
        $scope.testCase = CB.testCase;
        $scope.testCases = [];
        $scope.tree = {};
        $scope.loading = true;
        $scope.error = null;
        var testCaseService = new TestCaseService();
        $scope.init = function () {
            $scope.error = null;
            $scope.loading = true;


            var tcLoader = new CBTestCaseListLoader();
            tcLoader.then(function (testCases) {
                $scope.error = null;
                angular.forEach(testCases, function (testPlan) {
                    testCaseService.buildTree(testPlan);
                });
                $scope.testCases = testCases;
                $scope.tree.build_all($scope.testCases);

                var testCase = null;
                var id = StorageService.get(StorageService.CB_SELECTED_TESTCASE_ID_KEY);
                var type = StorageService.get(StorageService.CB_SELECTED_TESTCASE_TYPE_KEY);
                if (id != null && type != null) {
                    for (var i = 0; i < $scope.testCases.length; i++) {
                        var found = testCaseService.findOneByIdAndType(id, type, $scope.testCases[i]);
                        if (found != null) {
                            testCase = found;
                            break;
                        }
                    }
                    if (testCase != null) {
                        $scope.selectTestCase(testCase);
                        $scope.selectNode(id, type);
                    }
                }

                testCase = null;
                id = StorageService.get(StorageService.CB_LOADED_TESTCASE_ID_KEY);
                type = StorageService.get(StorageService.CB_LOADED_TESTCASE_TYPE_KEY);
                if (id != null && type != null) {
                    for (var i = 0; i < $scope.testCases.length; i++) {
                        var found = testCaseService.findOneByIdAndType(id, type, $scope.testCases[i]);
                        if (found != null) {
                            testCase = found;
                            break;
                        }
                    }
                    if (testCase != null) {
                        var tab = StorageService.get(StorageService.ACTIVE_SUB_TAB_KEY);
                        $scope.loadTestCase(testCase, tab);
                    }
                }
                $scope.loading = false;
            }, function (error) {
                $scope.loading = false;
                $scope.error = "Sorry,cannot load the test cases. Please refresh your page and try again.";
            });
        };

        $scope.refreshEditor = function () {
            $timeout(function () {
                if ($scope.editor) {
                    $scope.editor.refresh();
                }
            }, 1000);
        };


        $scope.isSelectable = function (node) {
            return node.type !== "TestCaseGroup";
        };

        $scope.selectTestCase = function (node) {
                 if ($scope.selectedTestCase == null || $scope.selectedTestCase.id != node.id) {
                    $scope.selectedTestCase = node;
                    StorageService.set(StorageService.CB_SELECTED_TESTCASE_ID_KEY, node.id);
                    StorageService.set(StorageService.CB_SELECTED_TESTCASE_TYPE_KEY, node.type);
                    $timeout(function () {
                        $rootScope.$broadcast('cb:testCaseSelected', $scope.selectedTestCase);
                    });
                }
         };

        $scope.selectNode = function (id,type) {
            $timeout(function () {
                testCaseService.selectNodeByIdAndType($scope.tree, id, type);
            },0);
        };


        $scope.selectTestPlan = function (node) {
            if ($scope.selectedTestCase == null || $scope.selectedTestCase.id != node.id) {
                $scope.selectedTestCase = node;
            }
        };


        $scope.loadTestCase = function (testCase, tab) {
            $timeout(function () {
                if (testCase.type === 'TestStep') {
                    CB.testCase = testCase;
                    $scope.testCase = CB.testCase;
                    var id = StorageService.get(StorageService.CB_LOADED_TESTCASE_ID_KEY);
                    var type = StorageService.get(StorageService.CB_LOADED_TESTCASE_TYPE_KEY);
                    if (id != $scope.testCase.id || type != $scope.testCase.type) {
                        StorageService.set(StorageService.CB_LOADED_TESTCASE_ID_KEY, $scope.testCase.id);
                        StorageService.set(StorageService.CB_LOADED_TESTCASE_TYPE_KEY, $scope.testCase.type);
                        StorageService.remove(StorageService.CB_EDITOR_CONTENT_KEY);
                    }
                    $timeout(function () {
                        $rootScope.$broadcast('cb:testCaseLoaded', $scope.testCase, tab);
                    });
                }
            });
        };

        $scope.expand = function (event) {

        };


    }]);


angular.module('cb')
    .controller('CBValidatorCtrl', ['$scope', '$http', 'CB', '$window', 'HL7EditorUtils', 'HL7CursorUtils', '$timeout', 'HL7TreeUtils', '$modal', 'NewValidationResult', '$rootScope', 'Er7MessageValidator', 'Er7MessageParser', 'StorageService', function ($scope, $http, CB, $window, HL7EditorUtils, HL7CursorUtils, $timeout, HL7TreeUtils, $modal, NewValidationResult, $rootScope, Er7MessageValidator, Er7MessageParser, StorageService) {

        $scope.cb = CB;
        $scope.testCase = CB.testCase;
        $scope.message = CB.message;
        $scope.selectedMessage = {};
        $scope.loading = true;
        $scope.error = null;
        $scope.vError = null;
        $scope.vLoading = true;
        $scope.mError = null;
        $scope.mLoading = true;

        $scope.counter = 0;
        $scope.type = "cb";
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
            checked: false
        };

        $scope.hasContent = function () {
            return  $scope.cb.message.content != '' && $scope.cb.message.content != null;
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
                            $scope.cb.message.name = fileName;
                            $scope.cb.editor.instance.doc.setValue(tmp.content);
                            $scope.mError = null;
                            $scope.execute();
                        })
                        .error(function (jqXHR, textStatus, errorThrown) {
                            $scope.cb.message.name = fileName;
                            $scope.mError = 'Sorry, Cannot upload file: ' + fileName + ", Error: " + errorThrown;
                        })
                        .complete(function (result, textStatus, jqXHR) {

                        });
                });

            }
        });

        $scope.loadMessage = function () {
            var testCase = $scope.cb.testCase;
            var testContext = testCase.testContext;
            var message = $scope.cb.testCase.testContext.message;
            var content = message && message != null ? message.content : null;
            if (content != null && content != "") {
                $scope.editor.doc.setValue(content);
                $scope.cb.message.id = null;
                $scope.cb.message.name = '';
                $scope.nodelay = true;
//                $scope.selectedMessage = $scope.cb.testCase.testContext.message;
//                if ($scope.selectedMessage != null && $scope.selectedMessage.content != null) {
//                    $scope.editor.doc.setValue($scope.selectedMessage.content);
//                } else {
//                    $scope.editor.doc.setValue('');
//                    $scope.cb.message.id = null;
//                    $scope.cb.message.name = '';
//                }
                $scope.execute();
            }
        };

        $scope.setLoadRate = function (value) {
            $scope.loadRate = value;
        };

        $scope.initCodemirror = function () {
            $scope.editor = CodeMirror.fromTextArea(document.getElementById("cb-textarea"), {
                lineNumbers: true,
                fixedGutter: true,
                theme: "elegant",
                mode: 'edi',
                readOnly: false,
                showCursorWhenSelecting: true
            });
            $scope.editor.setSize("100%", 345);

            $scope.editor.on("keyup", function () {
                $timeout(function () {
                    var msg = $scope.editor.doc.getValue();
                    $scope.error = null;
                    if ($scope.tokenPromise) {
                        $timeout.cancel($scope.tokenPromise);
                        $scope.tokenPromise = undefined;
                    }
                    CB.message.name = null;
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
                    $scope.cb.cursor.init(coordinate.line, coordinate.startIndex, coordinate.endIndex, coordinate.index, true);
                    HL7TreeUtils.selectNodeByIndex($scope.cb.tree.root, CB.cursor, CB.message.content);
                });
            });

            $scope.cb.editor.instance = $scope.editor;

            $scope.refreshEditor();

        };

        /**
         * Validate the content of the editor
         */
        $scope.validateMessage = function () {
            $scope.vLoading = true;
            $scope.vError = null;
            if ($scope.cb.testCase != null && $scope.cb.message.content !== "") {
                try {
                    var validator = new Er7MessageValidator().validate($scope.cb.testCase.testContext.id, $scope.cb.message.content, '', $scope.dqaOptions.checked, "1223", "Based");
                    validator.then(function (mvResult) {
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
            $timeout(function () {
                $rootScope.$broadcast('cb:validationResultLoaded', mvResult);
            });
        };

        $scope.select = function (element) {
            if (element != undefined && element.path != null && element.line != -1) {
                var node = HL7TreeUtils.selectNodeByPath($scope.cb.tree.root, element.line, element.path);
                var data = node != null ? node.data : null;
                $scope.cb.cursor.init(data != null ? data.lineNumber : element.line, data != null ? data.startIndex - 1 : element.column - 1, data != null ? data.endIndex - 1 : element.column - 1, data != null ? data.startIndex - 1 : element.column - 1, false)
                HL7EditorUtils.select($scope.editor, $scope.cb.cursor);
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
            $scope.cb.message.download();
        };

        $scope.parseMessage = function () {
            $scope.tLoading = true;
            if ($scope.cb.testCase != null && $scope.cb.message.content != '') {
                var parsed = new Er7MessageParser().parse($scope.cb.testCase.testContext.id, $scope.cb.message.content);
                parsed.then(function (value) {
                    $scope.tLoading = false;
                    $scope.cb.tree.root.build_all(value);
                }, function (error) {
                    $scope.tLoading = false;
                    $scope.tError = error;
                });
            } else {
                $scope.cb.tree.root.build_all([]);
                $scope.tError = null;
                $scope.tLoading = false;
            }
        };

        $scope.onNodeSelect = function (node) {
            var index = HL7TreeUtils.getEndIndex(node, $scope.cb.message.content);
            $scope.cb.cursor.init(node.data.lineNumber, node.data.startIndex - 1, index - 1, node.data.startIndex - 1, false);
            HL7EditorUtils.select($scope.editor, $scope.cb.cursor);
        };

        $scope.execute = function () {
            if ($scope.cb.testCase != null) {
                $scope.error = null;
                $scope.tError = null;
                $scope.mError = null;
                $scope.vError = null;
                $scope.cb.message.content = $scope.editor.doc.getValue();
                StorageService.set(StorageService.CB_EDITOR_CONTENT_KEY, $scope.cb.message.content);
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
            $scope.refreshEditor();
//            $scope.loadValidationResult({});

            $scope.$on('cb:refreshEditor', function (event) {
                $scope.refreshEditor();
//                event.preventDefault();
            });

            $rootScope.$on('cb:testCaseLoaded', function (event, testCase) {
                $scope.refreshEditor();
                $scope.testCase = testCase;
                if ($scope.testCase != null) {
                    var content = StorageService.get(StorageService.CB_EDITOR_CONTENT_KEY) == null ? '' : StorageService.get(StorageService.CB_EDITOR_CONTENT_KEY);
                    $scope.nodelay = true;
                    $scope.mError = null;
                    if ($scope.editor) {
                        $scope.editor.doc.setValue(content);
                        $scope.execute();
                    }
                }
            });

//            $scope.$watch(
//                function() {
//                    return $scope.dqaOptions.checked;
//                },
//                function(checked) {
//                    $scope.execute();
//                }
//            );

        };

    }])
;

angular.module('cb')
    .controller('CBProfileViewerCtrl', ['$scope', 'CB', function ($scope, CB) {
        $scope.cb = CB;
    }]);

angular.module('cb')
    .controller('CBReportCtrl', ['$scope', '$sce', '$http', 'CB', function ($scope, $sce, $http, CB) {
        $scope.cb = CB;
    }]);

angular.module('cb')
    .controller('CBVocabularyCtrl', ['$scope', 'CB', function ($scope, CB) {
        $scope.cb = CB;
    }]);

