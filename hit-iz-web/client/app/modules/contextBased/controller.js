'use strict';

angular.module('contextBased')
    .controller('ContextBasedTestingCtrl', ['$scope', '$window', '$rootScope', 'ContextBased', function ($scope, $window, $rootScope, ContextBased) {
        $scope.loading = true;
        $scope.error = null;
        $scope.tabs = new Array();


        $scope.setActiveTab = function (value) {
            $scope.tabs[0] = false;
            $scope.tabs[1] = false;
            $scope.tabs[2] = false;
            $scope.tabs[3] = false;
            $scope.tabs[4] = false;
            $scope.activeTab = value;
            $scope.tabs[$scope.activeTab] = true;
        };

        $scope.getTestType = function () {
            return ContextBased.testCase.type;
        };

        $scope.init = function () {
            $scope.error = null;
            $scope.loading = false;
            $scope.setActiveTab(0);

            $rootScope.$on('cb:testCaseLoaded', function (event) {
                if (ContextBased.testCase != null && ContextBased.testCase.id != null) {
                    $scope.setActiveTab(1);
                }
            });
        };

        $scope.disabled  = function () {
            return ContextBased.testCase == null || ContextBased.testCase.id  === null;
        };

    }]);


angular.module('contextBased')
    .controller('ContextBasedTestCaseCtrl', ['$scope', '$window', '$rootScope', 'ContextBased', 'ngTreetableParams', '$timeout', 'CBTestCaseListLoader', function ($scope, $window, $rootScope, ContextBased, ngTreetableParams,$timeout,CBTestCaseListLoader) {
        $scope.selectedTestCase = ContextBased.selectedTestCase;
        $scope.testCase = ContextBased.testCase;
        $scope.testCases = [];
        $scope.loading = true;
        $scope.error = null;

        $scope.createTreeStruct = function (obj) {
            if (obj.testCases) {
                if (!obj["children"]) {
                    obj["children"] = obj.testCases;

                } else {
                    angular.forEach(obj.testCases, function (testCase) {
                        obj["children"].push(testCase);
                        $scope.createTreeStruct(testCase);
                    });
                }
                delete obj.testCases;
            }

            if (obj.testCaseGroups) {
                if (!obj["children"]) {
                    obj["children"] = obj.testCaseGroups;

                } else {
                    angular.forEach(obj.testCaseGroups, function (testCaseGroup) {
                        obj["children"].push(testCaseGroup);
                        $scope.createTreeStruct(testCaseGroup);
                    });
                }

                delete obj.testCaseGroups;
            }

            if (obj.testSteps) {
                if (!obj["children"]) {
                    obj["children"] = obj.testSteps;

                } else {
                    angular.forEach(obj.testSteps, function (testStep) {
                        obj["children"].push(testStep);
                        $scope.createTreeStruct(testStep);
                    });
                }
                delete obj.testSteps;
            }

            if (obj.children) {
                angular.forEach(obj.children, function (child) {
                    $scope.createTreeStruct(child);
                });
            }
        };

        $scope.init = function () {
            $scope.error = null;
            $scope.loading = true;


            $scope.params = new ngTreetableParams({
                getNodes: function (parent) {
                    return parent && parent != null ? parent.children : $scope.testCases;
                },
                getTemplate: function (node) {
                    return 'CBTestCase.html';
                }
            });

            var tcLoader = new CBTestCaseListLoader();
            tcLoader.then(function (testCases) {
                $scope.error = null;
                angular.forEach(testCases, function (testPlan) {
                    $scope.createTreeStruct(testPlan);
                });
                $scope.testCases = testCases;
                $scope.params.refresh();
                $scope.loading = false;
            }, function (error) {
                $scope.loading = false;
                 $scope.error = "Sorry,cannot load the test cases. Please refresh your page and try again.";
            });
         };

        $scope.refreshEditor = function () {
            $timeout(function () {
                if($scope.editor) {
                    $scope.editor.refresh();
                }
            }, 1000);
         };

        $scope.selectTestCase = function (node) {
            $scope.selectedTestCase = node;
            $rootScope.$broadcast('cb:testCaseSelected');
        };

        $scope.loadTestCase = function () {
            ContextBased.testCase = $scope.selectedTestCase;
            $scope.testCase = ContextBased.testCase;
            $rootScope.$broadcast('cb:testCaseLoaded');
        };

        $scope.downloadTestStory = function(){
            if ($scope.selectedTestCase != null) {
                 var form = document.createElement("form");
                form.action = "api/teststory/download";
                form.method = "POST";
                form.target = "_target";

                var path = document.createElement("input");
                path.name = "path";
                path.value = $scope.selectedTestCase.testStory.pdfPath;
                form.appendChild(path);

                var title = document.createElement("input");
                title.name = "title";
                title.value = $scope.selectedTestCase.name;
                form.appendChild(title);

                form.style.display = 'none';
                document.body.appendChild(form);
                form.submit();
            }
        };

    }]);

angular.module('contextBased')
    .controller('ContextBasedProfileViewerCtrl', ['$scope', '$rootScope', 'ngTreetableParams', 'ContextBased', function ($scope, $rootScope, ngTreetableParams, ContextBased) {

        $scope.contextBased = ContextBased;
        $scope.elements = [];
        $scope.nodeData = [];
        $scope.loading = false;
        $scope.error = null;
        $scope.profile = null;
        $scope.relevance = true;
        $scope.trim = true;


        $scope.getConstraintsAsString = function (constraints) {
            var str = '';
            for (var index in constraints) {
                str = str + "<p style=\"text-align: left\">" + constraints[index].id + " - " + constraints[index].description + "</p>";
            }
            return str;
        };

        $scope.showRefSegment = function (id) {
            if ($scope.elements.length > 0 && id)
                for (var i = 1; i < $scope.elements.length; i++) {
                    var element = $scope.elements[i];
                    if (element.id == id) {
                        $scope.getNodeContent(element);
                    }
                }
        };

        $scope.show = function (node) {
            return !$scope.relevance || ($scope.relevance && node.relevent);
        };


        $scope.viewTable = function (tableId) {
            $scope.contextBased.searchTableId = tableId;
        };


        $scope.init = function () {
            $rootScope.$on('cb:testCaseLoaded', function (event) {
                if ($scope.contextBased.testCase.testContext != null && $scope.contextBased.testCase.testContext.profile.json != null && $scope.contextBased.testCase.testContext.profile.json != "") {
                    $scope.loading = true;
                    $scope.nodeData = [];
                    $scope.loading = false;
                    $scope.profile = $scope.contextBased.testCase.testContext.profile;
                    $scope.elements = angular.fromJson($scope.profile.json).elements;
                    var datatypesRoot = null;
                    var keepGoing = true;
                    angular.forEach($scope.elements, function (element) {
                        if (keepGoing) {
                            if (element.name === 'Datatypes') {
                                datatypesRoot = element;
                                keepGoing = false;
                            }
                        }
                    });
                    if (datatypesRoot != null) {
                        $scope.processDatatypes(datatypesRoot);
                    }
                    $scope.nodeData = $scope.elements[0];
                    $scope.params.refresh();
                    $scope.loading = false;
                } else {
                    $scope.loading = false;
                    $scope.nodeData = [];
                    $scope.elements = [];
                    $scope.params.refresh();
                }
            });
            $scope.params = new ngTreetableParams({
                getNodes: function (parent) {
                    return parent ? parent.children : $scope.nodeData.children;
                },
                getTemplate: function (node) {
                    return 'TreeNode.html';
                }
            });
        };

        $scope.getNodeContent = function (selectedNode) {
            $scope.nodeData = selectedNode;
            $scope.params.refresh();
            //$scope.params.expandAll();
        };

        $scope.processDatatypes = function (datatypes) {
            angular.forEach(datatypes.children, function (datatype) {
                if (datatype.children.length > 0) {
                    angular.forEach(datatype.children, function (component) {
                        component.type = "COMPONENT";
                        component.icon = "component.png";
                        if (component.children.length > 0) {
                            angular.forEach(component.children, function (subcomponent) {
                                $scope.processSubComponent(subcomponent);
                            });
                        }
                    });
                }
            });
        };

        $scope.processSubComponent = function (subComponent) {
            subComponent.type = "SUBCOMPONENT";
            subComponent.icon = "subcomponent.png";
            if (subComponent.children.length > 0) {
                angular.forEach(subComponent.children, function (child) {
                    $scope.processSubComponent(child);
                });
            }
        };


    }]);


angular.module('contextBased')
    .controller('ContextBasedValidatorCtrl', ['$scope', '$http', 'ContextBased', '$window', 'HL7EditorUtils', 'HL7CursorUtils', '$timeout', 'HL7TreeUtils', '$modal', 'NewValidationResult', '$rootScope', 'Er7MessageValidator', 'Er7MessageParser','ValidationResultHighlighter', function ($scope, $http, ContextBased, $window, HL7EditorUtils, HL7CursorUtils, $timeout, HL7TreeUtils, $modal, NewValidationResult, $rootScope,Er7MessageValidator,Er7MessageParser,ValidationResultHighlighter) {

        $scope.contextBased = ContextBased;
        $scope.testCase = ContextBased.testCase;
        $scope.message = ContextBased.message;
        $scope.selectedMessage = {};
        $scope.validationResult = null;
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
        $scope.validationTabs = new Array();
        $scope.activeTab = 0;

        $scope.messageObject = [];
        $scope.tError = null;
        $scope.tLoading = false;

        $scope.validationConfig = {
            dqa : {
                checked:false
            }

        };

        $scope.failuresConfig = {
            errors : {
                className : "failure failure-errors",
                checked:false
            },
            alerts : {
                className : "failure failure-alerts",
                checked:false
            },
            warnings : {
                className : "failure failure-warnings",
                checked:false
            },
            informationals : {
                className : "failure failure-infos",
                checked:false
            },
            affirmatives : {
                className : "failure failure-affirmatives",
                checked:false
            }
        };

        $scope.validResultHighlither = new ValidationResultHighlighter($scope.failuresConfig,$scope.contextBased.message, $scope.contextBased.report, $scope.contextBased.tree, $scope.contextBased.editor);

        $scope.hasContent = function () {
            return  $scope.contextBased.message.content != '' && $scope.contextBased.message.content != null;
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
                            $scope.contextBased.message.name = fileName;
                            $scope.contextBased.editor.instance.doc.setValue(tmp.content);
                            $scope.mError = null;
                            $scope.execute();
                        })
                        .error(function (jqXHR, textStatus, errorThrown) {
                            $scope.contextBased.message.name = fileName;
                            $scope.mError = 'Sorry, Cannot upload file: ' + fileName + ", Error: " + errorThrown;
                        })
                        .complete(function (result, textStatus, jqXHR) {

                        });
                });

            }
        });

        $scope.loadMessage = function () {
            var testCase = $scope.contextBased.testCase;
            var testContext = testCase.testContext;
            var message = $scope.contextBased.testCase.testContext.message;
            var messageContent = message ? message.messageContent: null;
            if (testContext.message != null && messageContent!= null && messageContent!= "") {
                $scope.nodelay = true;
                $scope.selectedMessage = $scope.contextBased.testCase.testContext.message;
                if ($scope.selectedMessage != null) {
                    $scope.editor.doc.setValue($scope.selectedMessage.messageContent);
                } else {
                    $scope.editor.doc.setValue('');
                    $scope.contextBased.message.id = null;
                    $scope.contextBased.message.name = '';
                }
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
            $scope.editor.setSize(null, 300);

            $scope.editor.on("keyup", function () {
                $timeout(function () {
                    var msg = $scope.editor.doc.getValue();
                    $scope.error = null;
                    if ($scope.tokenPromise) {
                        $timeout.cancel($scope.tokenPromise);
                        $scope.tokenPromise = undefined;
                    }
                    ContextBased.message.name = null;
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
                    $scope.contextBased.cursor.init(coordinate.line, coordinate.startIndex, coordinate.endIndex, coordinate.index, true);
                    HL7TreeUtils.selectNodeByIndex($scope.contextBased.tree.root, ContextBased.cursor, ContextBased.message.content);
                });
            });

            $scope.contextBased.editor.instance = $scope.editor;

            $scope.refreshEditor();

        };

        /**
         * Validate the content of the editor
         */
        $scope.validateMessage = function () {
            $scope.validationTabs[0] = true;
            $scope.failuresConfig.errors.checked = false;
            $scope.failuresConfig.warnings.checked = false;
            $scope.failuresConfig.alerts.checked = false;
            $scope.failuresConfig.informationals.checked = false;
            $scope.failuresConfig.affirmatives.checked = false;
            $scope.hideAllFailures();
            $scope.vLoading = true;
            $scope.vError = null;
            if ($scope.contextBased.testCase != null && $scope.contextBased.message.content !== "") {
                try {
                    var validator =  new Er7MessageValidator().validate($scope.contextBased.testCase.testContext.id, $scope.contextBased.message.content, $scope.contextBased.testCase.label);
                    validator.then(function (mvResult) {
                        $scope.vLoading = false;
                        $scope.setValidationResult(mvResult);
                    }, function (error) {
                        $scope.vLoading = false;
                        $scope.vError = error;
                        $scope.setValidationResult(null);
                    });
                } catch (e) {
                    $scope.vLoading = false;
                    $scope.vError = e;
                    $scope.setValidationResult(null);
                }
            } else {
                $scope.setValidationResult(null);
                $scope.vLoading = false;
                $scope.vError = null;
            }
        };

        $scope.hideAllFailures = function () {
            $scope.validResultHighlither.hideAllFailures();
        };

        $scope.showFailures = function (type, event) {
            $scope.validResultHighlither.showFailures(type, event);
        };

        $scope.isVFailureChecked = function (type) {
            return $scope.failuresConfig[type].checked;
        };

        $scope.setValidationResult = function (mvResult) {
            if (mvResult !== null) {
                $scope.contextBased.validationResult = new NewValidationResult();
                $scope.contextBased.validationResult.init(mvResult);
                $scope.validationResult = $scope.contextBased.validationResult;
                $scope.contextBased.report["result"] = $scope.validationResult;
                if (!angular.equals(mvResult, {})) {
                    $scope.contextBased.report["metaData"] = {
                        reportHeader: {
                            title: "Message Validation Report",
                            date: new Date().getTime()
                        },
                        validationTypeHeader: {
                            title: "Validation Type",
                            type: "Context-based"
                        },
                        toolHeader: {
                            title: "Testing Tool",
                            name: "NIST-CDC Immunization Test Suite - HL7 V2.5.1 Validation Tool",
                            versionRelease: "1.0"
                        },
                        profileHeader: {
                            name: "Profile Name",
                            organization: "NIST",
                            type: "See Profile MetaData Slide",
                            profileVersion: "",
                            profileDate: "",
                            standard: "HL7 Version 2.5.1 Implementation Guide For Immunization Messaging Rel .1.5 (10/01/2014) Immunization Clarification Addendum (Date)"
                        },
                        messageHeader: {
                            encoding: "ER7"
                        },
                        summaryHeader: {
                            errorCount: $scope.contextBased.report.result.errors.categories[0].data.length,
                            warningCount: $scope.contextBased.report.result.warnings.categories[0].data.length,
                            informationalCount: $scope.contextBased.report.result.informationals.categories[0].data.length,
                            alertCount: $scope.contextBased.report.result.alerts.categories[0].data.length,
                            affirmativeCount: $scope.contextBased.report.result.affirmatives.categories[0].data.length
                        }
                    };

                 } else {
                    $scope.contextBased.report.result = null;
                    $scope.contextBased.report.metaData = null;
                }
            } else {
                $scope.contextBased.validationResult = null;
                $scope.validationResult = null;
                $scope.contextBased.report["result"] = null;
            }
        };


        $scope.select = function (element) {
            if (element != undefined && element.path != null && element.line != -1) {
                var node = HL7TreeUtils.selectNodeByPath($scope.contextBased.tree.root, element.line, element.path);
                var data = node != null ? node.data : null;
                $scope.contextBased.cursor.init(data != null ? data.lineNumber : element.line, data != null ? data.startIndex - 1 : element.column - 1, data != null ? data.endIndex - 1 : element.column - 1, data != null ? data.startIndex - 1 : element.column - 1, false)
                HL7EditorUtils.select($scope.editor, $scope.contextBased.cursor);
            }
        };

        $scope.showDetails = function (element) {
            var modalInstance = $modal.open({
                templateUrl: 'ValidationResultDetailsCtrl.html',
                controller: 'ValidationResultDetailsCtrl',
                resolve: {
                    selectedElement: function () {
                        return element;
                    }
                }
            });
            modalInstance.result.then(function (selectedItem) {
                $scope.selectedElement = selectedItem;
            }, function () {
             });
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
            $scope.contextBased.message.download();
        };

        $scope.parseMessage = function () {
            $scope.tLoading = true;
            if ($scope.contextBased.testCase != null && $scope.contextBased.message.content != '') {
                var parsed =  new Er7MessageParser().parse($scope.contextBased.testCase.testContext.id, $scope.contextBased.message.content, $scope.contextBased.testCase.label);
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
            var index = HL7TreeUtils.getEndIndex(node, $scope.contextBased.message.content);
            $scope.contextBased.cursor.init(node.data.lineNumber, node.data.startIndex - 1, index - 1, node.data.startIndex - 1, false);
            HL7EditorUtils.select($scope.editor, $scope.contextBased.cursor);
        };

        $scope.execute = function () {
            $scope.error = null;
            $scope.tError = null;
            $scope.mError = null;
            $scope.vError = null;
            $scope.contextBased.message.content = $scope.editor.doc.getValue();
            $scope.validateMessage();
            $scope.parseMessage();
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
            $scope.setValidationResult({});

            $scope.$on('cb:refreshEditor', function (event) {
                $scope.refreshEditor();
                event.preventDefault();
            });

            $rootScope.$on('cb:testCaseLoaded', function (event) {
                $scope.refreshEditor();
                $scope.testCase = $scope.contextBased.testCase;
                if ($scope.testCase != null) {
                    $scope.clearMessage();
                }
            });
        };

    }])
;



angular.module('contextBased')
    .controller('ContextBasedReportCtrl', ['$scope', '$sce', '$http', 'ContextBased', function ($scope, $sce, $http, ContextBased) {
        $scope.contextBased = ContextBased;
        $scope.error = null;
        $scope.loading = false;
        $scope.init = function () {
        };
        $scope.downloadAs = function (format) {
            $scope.contextBased.report.downloadByFormat($scope.contextBased.report, format);
        };
    }]);

angular.module('contextBased')
    .controller('ContextBasedVocabularyCtrl', ['$scope', '$window', '$filter', 'ContextBased', '$modal', '$rootScope', 'VocabularyService', function ($scope, $window, $filter, ContextBased, $modal, $rootScope,VocabularyService) {
        $scope.contextBased = ContextBased;
        $scope.selectedTableDef = null;
        $scope.tmpTableElements = [];
        $scope.testCase = ContextBased.testCase;
        $scope.sourceData = [];
        $scope.selectedItem = [];
        $scope.error = null;
        $scope.vocabResError = null;
        $scope.loading = false;
        $scope.searchError = null;
        $scope.error = null;
        $scope.searchString = null;
        $scope.selectionCriteria = 'TableId';
        $scope.tableLibraries = [];

        $scope.init = function (eventType) {
            $rootScope.$on('cb:testCaseLoaded', function (event) {
                $scope.loading = true;
                var tableLibraries = angular.fromJson(ContextBased.testCase.testContext.valueSetLibrary.json);
                angular.forEach(tableLibraries, function (tableLibrary) {
                    angular.forEach(tableLibrary.children, function (child) {
                        child.tableSet.tableDefinitions = $filter('orderBy')(child.tableSet.tableDefinitions, 'tdId');
                    });
                });
                $scope.tableLibraries = $filter('orderBy')(tableLibraries, 'position');
                $scope.loading = false;
            });

            $scope.$watch(function () {
                return $scope.contextBased.searchTableId;
            }, function (tableId) {
                if (tableId != 0) {
                    var tables = new VocabularyService().searchTablesById(tableId, $scope.tableLibraries);
                    var t = tables.length > 0 ? tables[0] : null;
                    if (t != null) {
                        $scope.openTableDlg(t);
                    }
                }
            });
        };

        $scope.openTableDlg = function (table) {
            var modalInstance = $modal.open({
                templateUrl: 'TableFoundCtrl.html',
                controller: 'TableFoundCtrl',
                windowClass: 'app-modal-window',
                resolve: {
                    table: function () {
                        return table;
                    }
                }
            });
        };


        $scope.searchTableValues = function () {
            $scope.selectedTableDef = null;
            $scope.selectedTableLibrary = null;
            $scope.searchResults = [];
            $scope.tmpSearchResults = [];
            if ($scope.searchString != null) {
                $scope.searchResults = new VocabularyService().searchTableValues($scope.searchString, $scope.selectionCriteria, $scope.tableLibraries);
                $scope.vocabResError = null;
                $scope.selectedTableDef = null;
                $scope.tmpTableElements = null;

                if ($scope.searchResults.length == 0) {
                    $scope.vocabResError = "No results found for entered search criteria.";
                }
                else if ($scope.searchResults.length === 1 && ($scope.selectionCriteria === 'TableId' || $scope.selectionCriteria === 'ValueSetName' || $scope.selectionCriteria === 'ValueSetCode')) {
                    $scope.selectTableDef2($scope.searchResults[0]);
                }

                $scope.tmpSearchResults = [].concat($scope.searchResults);
            }
        };

        $scope.selectTableDef = function (tableDefinition, tableLibrary) {
            $scope.searchResults = [];
            $scope.selectionCriteria = "TableId";
            $scope.searchString = null;
            $scope.selectedTableDef = tableDefinition;
            $scope.selectedTableLibrary = tableLibrary;
            $scope.selectedTableDef.tableElements = $filter('orderBy')($scope.selectedTableDef.tableElements, 'code');
            $scope.tmpTableElements = [].concat($scope.selectedTableDef.tableElements);
        };

        $scope.clearSearchResults = function () {
            $scope.searchResults = null;
            $scope.selectedTableDef = null;
            $scope.vocabResError = null;
            $scope.tmpTableElements = null;
            $scope.tmpSearchResults = null;
        };

        $scope.selectTableDef2 = function (tableDefinition) {
            $scope.selectedTableDef = tableDefinition;
            $scope.selectedTableDef.tableElements = $filter('orderBy')($scope.selectedTableDef.tableElements, 'code');
            $scope.tmpTableElements = [].concat($scope.selectedTableDef.tableElements);
        };


        $scope.isNoValidation = function () {
            return $scope.selectedTableDef != null && $scope.selectedTableLibrary && $scope.selectedTableLibrary.noValidation && $scope.selectedTableLibrary.noValidation.ids && $scope.selectedTableLibrary.noValidation.ids.indexOf($scope.selectedTableDef.tdId) > 0;
        };


    }]);

angular.module('contextBased')
    .controller('ContextBasedVocabularyTabCtrl', ['$scope', 'ContextBased', '$timeout', function ($scope, ContextBased, $timeout) {
        $scope.tableList = [];
        $scope.tmpList = [].concat($scope.tableList);
        $scope.error = null;
        $scope.tableLibrary = null;

        $scope.init = function (tableLibrary) {
            if (tableLibrary) {
                $scope.tableLibrary = tableLibrary;
                $scope.tableList = tableLibrary.tableSet.tableDefinitions;
                $scope.tmpList = [].concat($scope.tableList);
            }
        };
    }]);

