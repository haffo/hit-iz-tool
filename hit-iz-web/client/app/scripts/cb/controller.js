'use strict';

angular.module('cb')
    .controller('CBTestingCtrl', ['$scope', '$window', '$rootScope', 'CB', function ($scope, $window, $rootScope, CB) {
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
            return CB.testCase.type;
        };

        $scope.init = function () {
            $scope.error = null;
            $scope.loading = false;
            $scope.setActiveTab(0);

            $rootScope.$on('cb:testCaseLoaded', function (event) {
                if (CB.testCase != null && CB.testCase.id != null) {
                    $scope.setActiveTab(1);
                }
            });
        };

        $scope.disabled  = function () {
            return CB.testCase == null || CB.testCase.id  === null;
        };

    }]);


angular.module('cb')
    .controller('CBTestCaseCtrl', ['$scope', '$window', '$rootScope', 'CB', 'ngTreetableParams', '$timeout', 'CBTestCaseListLoader', function ($scope, $window, $rootScope, CB, ngTreetableParams,$timeout,CBTestCaseListLoader) {
        $scope.selectedTestCase = CB.selectedTestCase;
        $scope.testCase = CB.testCase;
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
            CB.testCase = $scope.selectedTestCase;
            $scope.testCase = CB.testCase;
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

angular.module('cb')
    .controller('CBProfileViewerCtrl', ['$scope', '$rootScope', 'ngTreetableParams', 'CB', 'ProfileService', function ($scope, $rootScope, ngTreetableParams, CB,ProfileService) {


        $scope.cb = CB;
        $scope.elements = [];
        $scope.nodeData = [];
        $scope.loading = false;
        $scope.error = null;
        $scope.profile = null;
        $scope.relevance = true;
        $scope.trim = true;
        $scope.profileService = new ProfileService();


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


        $scope.showValueSetDefinition = function (tableId) {
            $rootScope.$broadcast('cb:showValueSetDefinition', tableId);
        };


        $scope.init = function () {
            $rootScope.$on('cb:testCaseLoaded', function (event) {
                if ($scope.cb.testCase.testContext != null && $scope.cb.testCase.testContext.profile.json != null && $scope.cb.testCase.testContext.profile.json != "") {
                    $scope.loading = true;
                    $scope.nodeData = [];
                    $scope.loading = false;
                    $scope.profile = $scope.cb.testCase.testContext.profile;
                    $scope.elements = angular.fromJson($scope.profile.json).elements;

                    var datatypes = null;
                    var segments = [];

                    angular.forEach($scope.elements, function (element) {
                        if (element.name === 'Datatypes' && datatypes === null) {
                            datatypes = element;
                        }
                        if (element.type === 'SEGMENT') {
                            segments.push(element);
                        }
                    });
                    $scope.profileService.setDatatypesTypesAndIcons(datatypes);
                    var valueSetIds = $scope.profileService.getValueSetIds(segments, datatypes.children);
                    $rootScope.$broadcast('cb:valueSetIdsCollected', valueSetIds);
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


    }]);


angular.module('cb')
    .controller('CBValidatorCtrl', ['$scope', '$http', 'CB', '$window', 'HL7EditorUtils', 'HL7CursorUtils', '$timeout', 'HL7TreeUtils', '$modal', 'NewValidationResult', '$rootScope', 'Er7MessageValidator', 'Er7MessageParser','ValidationResultHighlighter', function ($scope, $http, CB, $window, HL7EditorUtils, HL7CursorUtils, $timeout, HL7TreeUtils, $modal, NewValidationResult, $rootScope,Er7MessageValidator,Er7MessageParser,ValidationResultHighlighter) {

        $scope.cb = CB;
        $scope.testCase = CB.testCase;
        $scope.message = CB.message;
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

        $scope.validResultHighlither = new ValidationResultHighlighter($scope.failuresConfig,$scope.cb.message, $scope.cb.report, $scope.cb.tree, $scope.cb.editor);

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
            var messageContent = message ? message.messageContent: null;
            if (testContext.message != null && messageContent!= null && messageContent!= "") {
                $scope.nodelay = true;
                $scope.selectedMessage = $scope.cb.testCase.testContext.message;
                if ($scope.selectedMessage != null) {
                    $scope.editor.doc.setValue($scope.selectedMessage.messageContent);
                } else {
                    $scope.editor.doc.setValue('');
                    $scope.cb.message.id = null;
                    $scope.cb.message.name = '';
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
            $scope.validationTabs[0] = true;
            $scope.failuresConfig.errors.checked = false;
            $scope.failuresConfig.warnings.checked = false;
            $scope.failuresConfig.alerts.checked = false;
            $scope.failuresConfig.informationals.checked = false;
            $scope.failuresConfig.affirmatives.checked = false;
            $scope.hideAllFailures();
            $scope.vLoading = true;
            $scope.vError = null;
            if ($scope.cb.testCase != null && $scope.cb.message.content !== "") {
                try {
                    var validator =  new Er7MessageValidator().validate($scope.cb.testCase.testContext.id, $scope.cb.message.content);
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
                $scope.cb.validationResult = new NewValidationResult();
                $scope.cb.validationResult.init(mvResult);
                $scope.validationResult = $scope.cb.validationResult;
                $scope.cb.report["result"] = $scope.validationResult;
                if (!angular.equals(mvResult, {})) {
                    $scope.cb.report["metaData"] = {
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
                            errorCount: $scope.cb.report.result.errors.categories[0].data.length,
                            warningCount: $scope.cb.report.result.warnings.categories[0].data.length,
                            informationalCount: $scope.cb.report.result.informationals.categories[0].data.length,
                            alertCount: $scope.cb.report.result.alerts.categories[0].data.length,
                            affirmativeCount: $scope.cb.report.result.affirmatives.categories[0].data.length
                        }
                    };

                 } else {
                    $scope.cb.report.result = null;
                    $scope.cb.report.metaData = null;
                }
            } else {
                $scope.cb.validationResult = null;
                $scope.validationResult = null;
                $scope.cb.report["result"] = null;
            }
        };


        $scope.select = function (element) {
            if (element != undefined && element.path != null && element.line != -1) {
                var node = HL7TreeUtils.selectNodeByPath($scope.cb.tree.root, element.line, element.path);
                var data = node != null ? node.data : null;
                $scope.cb.cursor.init(data != null ? data.lineNumber : element.line, data != null ? data.startIndex - 1 : element.column - 1, data != null ? data.endIndex - 1 : element.column - 1, data != null ? data.startIndex - 1 : element.column - 1, false)
                HL7EditorUtils.select($scope.editor, $scope.cb.cursor);
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
            $scope.cb.message.download();
        };

        $scope.parseMessage = function () {
            $scope.tLoading = true;
            if ($scope.cb.testCase != null && $scope.cb.message.content != '') {
                var parsed =  new Er7MessageParser().parse($scope.cb.testCase.testContext.id, $scope.cb.message.content);
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
            var index = HL7TreeUtils.getEndIndex(node, $scope.cb.message.content);
            $scope.cb.cursor.init(node.data.lineNumber, node.data.startIndex - 1, index - 1, node.data.startIndex - 1, false);
            HL7EditorUtils.select($scope.editor, $scope.cb.cursor);
        };

        $scope.execute = function () {
            $scope.error = null;
            $scope.tError = null;
            $scope.mError = null;
            $scope.vError = null;
            $scope.cb.message.content = $scope.editor.doc.getValue();
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
                $scope.testCase = $scope.cb.testCase;
                if ($scope.testCase != null) {
                    $scope.clearMessage();
                }
            });
        };

    }])
;



angular.module('cb')
    .controller('CBReportCtrl', ['$scope', '$sce', '$http', 'CB', function ($scope, $sce, $http, CB) {
        $scope.cb = CB;
        $scope.error = null;
        $scope.loading = false;
        $scope.init = function () {
        };
        $scope.downloadAs = function (format) {
            $scope.cb.report.downloadByFormat($scope.cb.report, format);
        };
    }]);

angular.module('cb')
    .controller('CBVocabularyCtrl', ['$scope', '$window', '$filter', 'CB', '$modal', '$rootScope', 'VocabularyService', function ($scope, $window, $filter, CB, $modal, $rootScope,VocabularyService) {
        $scope.cb = CB;
        $scope.selectedValueSetDefinition = null;
        $scope.tmpTableElements = [];
        $scope.testCase = CB.testCase;
        $scope.sourceData = [];
        $scope.selectedItem = [];
        $scope.error = null;
        $scope.vocabResError = null;
        $scope.loading = false;
        $scope.searchError = null;
        $scope.error = null;
        $scope.searchString = null;
        $scope.selectionCriteria = 'TableId';
        $scope.valueSetDefinitionGroups = [];

        var vocabularyService = new VocabularyService();

        $scope.init = function (eventType) {
            $rootScope.$on('cb:testCaseLoaded', function (event) {
                $scope.testCase = CB.testCase;
            });
            $rootScope.$on('cb:valueSetIdsCollected', function (event, valueSetIds) {
                $scope.loading = true;
                var all = angular.fromJson(CB.testCase.testContext.vocabularyLibrary.json).valueSetDefinitions.valueSetDefinitions;
                $scope.valueSetDefinitionGroups = vocabularyService.getValueSetDefinitionGroups(all, valueSetIds);
                $scope.loading = false;
            });
            $rootScope.$on('cb:showValueSetDefinition', function (event, tableId) {
                vocabularyService.showValueSetDefinition(tableId);
            });

        };

        $scope.searchTableValues = function () {
            $scope.selectedValueSetDefinition = null;
            $scope.selectedTableLibrary = null;
            $scope.searchResults = [];
            $scope.tmpSearchResults = [];
            if ($scope.searchString != null) {
                $scope.searchResults = vocabularyService.searchTableValues($scope.searchString, $scope.selectionCriteria, $scope.tableLibraries);
                $scope.vocabResError = null;
                $scope.selectedValueSetDefinition = null;
                $scope.tmpTableElements = null;
                if ($scope.searchResults.length == 0) {
                    $scope.vocabResError = "No results found for entered search criteria.";
                }
                else if ($scope.searchResults.length === 1 && ($scope.selectionCriteria === 'TableId' || $scope.selectionCriteria === 'ValueSetName' || $scope.selectionCriteria === 'ValueSetCode')) {
                    $scope.selectValueSetDefinition2($scope.searchResults[0]);
                }

                $scope.tmpSearchResults = [].concat($scope.searchResults);
            }
        };

        $scope.selectValueSetDefinition = function (tableDefinition, tableLibrary) {
            $scope.searchResults = [];
            $scope.selectionCriteria = "TableId";
            $scope.searchString = null;
            $scope.selectedValueSetDefinition = tableDefinition;
            $scope.selectedTableLibrary = tableLibrary;
            $scope.selectedValueSetDefinition.valueSetElements = $filter('orderBy')($scope.selectedValueSetDefinition.valueSetElements, 'code');
            $scope.tmpTableElements = [].concat($scope.selectedValueSetDefinition.valueSetElements);
        };

        $scope.clearSearchResults = function () {
            $scope.searchResults = null;
            $scope.selectedValueSetDefinition = null;
            $scope.vocabResError = null;
            $scope.tmpTableElements = null;
            $scope.tmpSearchResults = null;
        };

        $scope.selectValueSetDefinition2 = function (tableDefinition) {
            $scope.selectedValueSetDefinition = tableDefinition;
            $scope.selectedValueSetDefinition.tableElements = $filter('orderBy')($scope.selectedValueSetDefinition.tableElements, 'code');
            $scope.tmpTableElements = [].concat($scope.selectedValueSetDefinition.tableElements);
        };


        $scope.isNoValidation = function () {
            return $scope.selectedValueSetDefinition != null && $scope.selectedTableLibrary && $scope.selectedTableLibrary.noValidation && $scope.selectedTableLibrary.noValidation.ids && $scope.selectedTableLibrary.noValidation.ids.indexOf($scope.selectedValueSetDefinition.bindingIdentifier) > 0;
        };


    }]);

angular.module('cb')
    .controller('CBVocabularyTabCtrl', ['$scope', 'CB', '$timeout', function ($scope, CB, $timeout) {
        $scope.tableList = [];
        $scope.tmpList = [].concat($scope.tableList);
        $scope.error = null;
        $scope.tableLibrary = null;

        $scope.init = function (tableLibrary) {
            if (tableLibrary) {
                $scope.tableLibrary = tableLibrary;
                $scope.tableList = tableLibrary.children;
                $scope.tmpList = [].concat($scope.tableList);
            }
        };
    }]);

