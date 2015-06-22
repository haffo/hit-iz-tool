'use strict';


angular.module('contextFree')
    .controller('ContextFreeTestingCtrl', ['$scope', '$http', 'ContextFree', '$window', '$modal', '$filter', '$rootScope', 'ngTreetableParams', 'CFTestCaseListLoader', function ($scope, $http, ContextFree, $window, $modal,$filter,$rootScope,ngTreetableParams,CFTestCaseListLoader) {

        $scope.contextFree = ContextFree;
        $scope.loading = false;
        $scope.error = null;
        $scope.testCases = [];
        $scope.testCase = ContextFree.testCase;
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
                $scope.$broadcast("contextFree:refreshEditor");
            }
        };

        $scope.getTestCaseDisplayName = function (testCase) {
            return testCase.parentName + " - " + testCase.label;
        };

        $scope.loadTestCase = function (tc) {
                ContextFree.testCase = tc;
                $scope.testCase = ContextFree.testCase;
                $rootScope.$broadcast('cf:testCaseLoaded');
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
                $scope.testCases =  $filter('orderBy')(testCases, 'position');
                if( $scope.testCases.length > 0){
                    $scope.loadTestCase($scope.testCases[0]);
                }
                $scope.loading = false;
                $scope.error = null;
                $scope.params.refresh();
            }, function (error) {
                $scope.error = "Sorry,cannot load the profiles";
                $scope.loading = false;
            });
        };

        $scope.openProfileInfo = function () {
            var modalInstance = $modal.open({
                templateUrl: 'CFProfileInfoCtrl.html',
                windowClass: 'app-modal-window',
                controller: 'CFProfileInfoCtrl'
            });
        };

    }]);

angular.module('contextFree').controller('CFProfileInfoCtrl', function ($scope, $modalInstance) {
    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    };
});



angular.module('contextFree')
    .controller('ContextFreeProfileViewerCtrl', ['$scope', 'ngTreetableParams', 'ContextFree', '$rootScope', function ($scope, ngTreetableParams, ContextFree,$rootScope) {

        $scope.contextFree = ContextFree;
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
            $scope.contextFree.searchTableId = tableId;
         };

        $scope.init = function () {
            $rootScope.$on('cf:testCaseLoaded', function (event) {
                if ($scope.contextFree.testCase.testContext != null && $scope.contextFree.testCase.testContext.profile.json != null && $scope.contextFree.testCase.testContext.profile.json != "") {
                    $scope.loading = true;
                    $scope.nodeData = [];
                    $scope.loading = false;
                    $scope.profile = $scope.contextFree.testCase.testContext.profile;
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
//                ,
//                options: {
//                    initialState: 'expanded'
//                 }
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


angular.module('contextFree')
    .controller('ContextFreeValidatorCtrl', ['$scope', '$http', 'ContextFree', '$window', 'HL7EditorUtils', 'HL7CursorUtils', '$timeout', 'HL7TreeUtils', '$modal', 'NewValidationResult', 'HL7Utils', 'DQAValidationResult','$rootScope','Er7MessageValidator', 'Er7MessageParser', 'DQAMessageValidator', 'ValidationResultHighlighter', function ($scope, $http, ContextFree, $window, HL7EditorUtils, HL7CursorUtils, $timeout, HL7TreeUtils, $modal,NewValidationResult,HL7Utils,DQAValidationResult,$rootScope,Er7MessageValidator,Er7MessageParser,DQAMessageValidator,ValidationResultHighlighter) {

        $scope.contextFree = ContextFree;
        $scope.testCase = ContextFree.testCase;
        $scope.message = ContextFree.message;
        $scope.selectedMessage = {};
        $scope.validationResult = null;
        $scope.loading = true;
        $scope.error = null;
        $scope.vError = null;
        $scope.vLoading = true;
        $scope.mError = null;
        $scope.mLoading = true;

        $scope.counter = 0;
        $scope.type = "contextFree";
        $scope.loadRate = 4000;
        $scope.tokenPromise = null;
        $scope.editorInit = false;
        $scope.nodelay = false;

        $scope.resized = false;
        $scope.selectedItem = null;
        $scope.validationTabs = new Array();
        $scope.activeTab = 0;



        $scope.validationConfig = {
            dqa : {
                checked: false
            }
        };

        $scope.histMarks={};

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

        $scope.validResultHighlither = new ValidationResultHighlighter($scope.failuresConfig,$scope.contextFree.message, $scope.contextFree.report, $scope.contextFree.tree, $scope.contextFree.editor);

        $scope.messageObject = [];
        $scope.tError = null;
        $scope.tLoading = false;


        $scope.hasContent = function () {
            return  $scope.contextFree.message.content != '' && $scope.contextFree.message.content != null;
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
                            $scope.contextFree.message.name = fileName;
                            $scope.contextFree.editor.instance.doc.setValue(tmp.content);
                            $scope.mError = null;
                            $scope.execute();
                        })
                        .error(function (jqXHR, textStatus, errorThrown) {
                            $scope.contextFree.message.name = fileName;
                            $scope.mError = 'Sorry, Cannot upload file: ' + fileName + ", Error: " + errorThrown;
                        })
                        .complete(function (result, textStatus, jqXHR) {

                        });
                });

            }
        });

        $scope.loadMessage = function () {
            if ($scope.contextFree.testCase.testContext.message != null) {
                $scope.nodelay = true;
                $scope.selectedMessage = $scope.contextFree.testCase.testContext.message;
                if ($scope.selectedMessage != null) {
                    $scope.editor.doc.setValue($scope.selectedMessage.messageContent);
                } else {
                    $scope.editor.doc.setValue('');
                    $scope.contextFree.message.id = null;
                    $scope.contextFree.message.name = '';
                }
                $scope.execute();
            }
        };

        $scope.setLoadRate = function (value) {
            $scope.loadRate = value;
        };

        $scope.initCodemirror = function () {
            $scope.editor = CodeMirror.fromTextArea(document.getElementById("cfTextArea"), {
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
                    ContextFree.message.name = null;
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
                    $scope.contextFree.cursor.init(coordinate.line, coordinate.startIndex, coordinate.endIndex, coordinate.index, true);
                    HL7TreeUtils.selectNodeByIndex($scope.contextFree.tree.root, ContextFree.cursor, ContextFree.message.content);
                });
            });

            $scope.contextFree.editor.instance = $scope.editor;

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
            $scope.dqaError = null;
            $scope.contextFree.dqaValidationResult = null;
            if ($scope.contextFree.testCase != null && $scope.contextFree.message.content !== "") {
                try {
                        var id = $scope.contextFree.testCase.testContext.id;
                        var content = $scope.contextFree.message.content;
                        var label = $scope.contextFree.testCase.label;
                        var validated = new Er7MessageValidator().validate(id, content, label);
                        validated.then(function (mvResult) {
                            $scope.vLoading = false;
                            $scope.setValidationResult(mvResult);
                        }, function (error) {
                            $scope.vLoading = false;
                            $scope.vError = error;
                            $scope.setValidationResult(null);
                        });
                        if ($scope.validationConfig.dqa.checked) {
                            $scope.dqaLoading = true;
                            var dqaValidated = new DQAMessageValidator($scope.contextFree.message.content, "1223");
                            dqaValidated.then(function (mvResult) {
                                $scope.dqaLoading = false;
                                $scope.contextFree.dqaValidationResult = new DQAValidationResult(mvResult);
                                $scope.dqaValidationResult = $scope.contextFree.dqaValidationResult;
                            }, function (error) {
                                $scope.dqaLoading = false;
                                $scope.dqaError = error;
                                $scope.contextFree.dqaValidationResult = null;
                            });
                        }
                 }catch(e){
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


        $scope.setValidationResult = function (mvResult) {
            if (mvResult !== null) {
                $scope.contextFree.validationResult = new NewValidationResult();
                $scope.contextFree.validationResult.init(mvResult);
                $scope.validationResult =  $scope.contextFree.validationResult;
                $scope.contextFree.report["result"] = $scope.validationResult;
                if (!angular.equals(mvResult, {})) {
                    $scope.contextFree.report["metaData"] = {
                        reportHeader: {
                            title: "Message Validation Report",
                            date: new Date().getTime()
                        },
                        validationTypeHeader: {
                            title: "Validation Type",
                            type: "Context-free"
                        },
                        toolHeader: {
                            title: "Testing Tool",
                            name: "NIST-CDC Immunization Test Suite - HL7 V2.5.1 Validation Tool",
                            versionRelease: "1.0"
                        },
                        profileHeader: {
                            name: "",
                            organization: "NIST",
                            type: "",
                            profileVersion: "",
                            profileDate: "",
                            standard: "HL7 Version 2.5.1 Implementation Guide For Immunization Messaging Rel .1.5 (10/01/2014) Immunization Clarification Addendum (Date)"
                        },
                        messageHeader: {
                            encoding: "ER7"
                        },
                        summaryHeader: {
                            errorCount: $scope.contextFree.report.result.errors.categories[0].data.length,
                            warningCount: $scope.contextFree.report.result.warnings.categories[0].data.length,
                            informationalCount: $scope.contextFree.report.result.informationals.categories[0].data.length,
                            alertCount: $scope.contextFree.report.result.alerts.categories[0].data.length,
                            affirmativeCount: $scope.contextFree.report.result.affirmatives.categories[0].data.length
                        }
                    };
                } else {
                    $scope.contextFree.report.result = null;
                    $scope.contextFree.report.metaData = null;
                }
            }else{
                $scope.contextFree.validationResult = null;
                $scope.validationResult = null;
                $scope.contextFree.report["result"] = null;
            }
        };


        $scope.select = function (element) {
            if (element != undefined && element.path != null && element.line != -1) {
                var node = HL7TreeUtils.selectNodeByPath($scope.contextFree.tree.root, element.line, element.path);
                var data = node != null ? node.data : null;
                $scope.contextFree.cursor.init(data != null ? data.lineNumber : element.line, data != null ? data.startIndex - 1 : element.column - 1, data != null ? data.endIndex - 1 : element.column - 1, data != null ? data.startIndex - 1 : element.column - 1, false);
                HL7EditorUtils.select($scope.editor, $scope.contextFree.cursor);
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
//
            modalInstance.result.then(function (selectedItem) {
                $scope.selectedElement = selectedItem;
            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        };


        $scope.showDQADetails = function (element) {
            var modalInstance = $modal.open({
                templateUrl: 'DQAValidationResultDetailsCtrl.html',
                controller: 'DQAValidationResultDetailsCtrl',
                resolve: {
                    selectedElement: function () {
                        return element;
                    }
                }
            });
//
            modalInstance.result.then(function (selectedItem) {
                $scope.selectedElement = selectedItem;
            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
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
            $scope.contextFree.message.download();
        };

        $scope.parseMessage = function () {
            $scope.tLoading = true;
            if ($scope.contextFree.testCase.testContext.profile!= null && $scope.contextFree.message.content != '') {
                    var parsed = new Er7MessageParser().parse($scope.contextFree.testCase.testContext.id, $scope.contextFree.message.content, $scope.contextFree.testCase.label);
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
            var index = HL7TreeUtils.getEndIndex(node, $scope.contextFree.message.content);
            $scope.contextFree.cursor.init(node.data.lineNumber, node.data.startIndex - 1, index - 1, node.data.startIndex - 1, false);
            HL7EditorUtils.select($scope.editor, $scope.contextFree.cursor);
        };

        $scope.execute = function () {
            $scope.error = null;
            $scope.tError = null;
            $scope.mError = null;
            $scope.vError = null;
            $scope.contextFree.message.content = $scope.editor.doc.getValue();
            $scope.validateMessage();
            $scope.parseMessage();
//            $scope.showValidationFailures("errors");
        };


        $scope.showFailures = function (type, event) {
            $scope.validResultHighlither.showFailures(type, event);
        };

        $scope.hideAllFailures = function () {
            $scope.validResultHighlither.hideAllFailures();
        };


        $scope.isVFailureChecked = function (type) {
            return $scope.failuresConfig[type].checked;
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

            $scope.$on('contextFree:refreshEditor', function (event) {
                $scope.refreshEditor();
                event.preventDefault();
            });



            $rootScope.$on('cf:testCaseLoaded', function (event) {
                $scope.refreshEditor();
                if ($scope.contextFree.testCase != null && $scope.contextFree.testCase.id != null) {
                    $scope.clearMessage();
                }
            });

        };

    }])
;


angular.module('contextFree')
    .controller('ContextFreeReportCtrl', ['$scope', '$sce', '$http', 'ContextFree', function ($scope, $sce, $http, ContextFree) {
        $scope.contextFree = ContextFree;
        $scope.error = null;
        $scope.loading = false;
        $scope.init = function () {
        };
        $scope.downloadAs = function (format) {
            $scope.contextFree.report.downloadByFormat($scope.contextFree.report, format);
        };
    }]);

angular.module('contextFree')
    .controller('ContextFreeVocabularyCtrl', ['$scope', '$window', '$filter', 'ContextFree', '$modal', '$rootScope','VocabularyService', function ($scope, $window, $filter, ContextFree,$modal,$rootScope,VocabularyService) {

        $scope.selectedTableDef = null;
        $scope.tmpTableElements = [];
        $scope.testCase = ContextFree.testCase;
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
        $scope.contextFree = ContextFree;



        $scope.init = function (eventType) {

            $rootScope.$on('cf:testCaseLoaded', function (event) {
                $scope.loading = true;
                $scope.valueSetDefinitionGroups = [];
                $scope.valueSetDefinitionGroupsPosition = {};

                var vocabularyLibrary = angular.fromJson(ContextFree.testCase.testContext.vocabularyLibrary.json);
                angular.forEach(vocabularyLibrary.valueSetDefinitions.valueSetDefinitions, function (valueSetDefinition) {
                    var found = $scope.findValueSetDefinitions(valueSetDefinition.displayClassifier);
                    if(found === null) {
                        $scope.valueSetDefinitionGroups.push({"name": valueSetDefinition.displayClassifier, "children": []});
                    }else{
                        found.children.push(valueSetDefinition);
                    }
                });

//                angular.forEach(tableLibrary.children, function (child) {
//                    child.tableSet.tableDefinitions = $filter('orderBy')(child.tableSet.tableDefinitions, 'bindingIdentifier');
//                });


//                $scope.valueSetDefinitionGroups = $filter('orderBy')(valueSetDefinitionGroups, 'position');

                $scope.loading = false;

            });

            $scope.$watch(function () {
                return $scope.contextFree.searchTableId;
            }, function (bindingIdentifier) {
                if (bindingIdentifier != 0) {
                    var tables = new VocabularyService().searchTablesById(bindingIdentifier, $scope.valueSetDefinitionGroups);
                    var t = tables.length > 0 ? tables[0]:null;
                    if(t != null){
                        $scope.openTableDlg(t);
                    }
                }
            });


        };



        $scope.findValueSetDefinitions = function (classifier) {
            angular.forEach( $scope.valueSetDefinitionGroups.children, function (child) {
               if(child.name === classifier){
                   return child;
               }
            });
            return null;
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
            $scope.tmpSearchResults =[];
            if($scope.searchString != null) {
                $scope.searchResults = new VocabularyService().searchTableValues($scope.searchString, $scope.selectionCriteria, $scope.valueSetDefinitionGroups);
                $scope.vocabResError = null;
                $scope.selectedTableDef = null;
                $scope.tmpTableElements = null;
                if ($scope.searchResults.length == 0) {
                    $scope.vocabResError = "No results found for entered search criteria.";
                }
                else if( $scope.searchResults.length  === 1 && ($scope.selectionCriteria === 'TableId' || $scope.selectionCriteria === 'ValueSetName'||$scope.selectionCriteria === 'ValueSetCode')){
                    $scope.selectTableDef2($scope.searchResults[0]);
                }
                $scope.tmpSearchResults = [].concat($scope.searchResults);
            }
        };

        $scope.selectTableDef = function (valueSetDefinition, tableLibrary) {
            $scope.searchResults = [];
            $scope.selectionCriteria ="TableId";
            $scope.searchString = null;
            $scope.selectedTableDef = valueSetDefinition;
            $scope.selectedTableLibrary = tableLibrary;
            $scope.selectedTableDef.valueSetElements = $filter('orderBy')($scope.selectedTableDef.valueSetElements, 'code');
            $scope.tmpTableElements = [].concat($scope.selectedTableDef.valueSetElements);
        };

        $scope.clearSearchResults = function(){
            $scope.searchResults = null;
            $scope.selectedTableDef = null;
            $scope.vocabResError = null;
            $scope.tmpTableElements = null;
            $scope.tmpSearchResults = null;
        };

        $scope.selectTableDef2 = function (tableDefinition) {
            $scope.selectedTableDef = tableDefinition;
            $scope.selectedTableDef.valueSetElements = $filter('orderBy')($scope.selectedTableDef.valueSetElements, 'code');
            $scope.tmpTableElements = [].concat($scope.selectedTableDef.valueSetElements);
        };


        $scope.isNoValidation = function () {
            return $scope.selectedTableDef != null && $scope.selectedTableLibrary && $scope.selectedTableLibrary.noValidation && $scope.selectedTableLibrary.noValidation.ids && $scope.selectedTableLibrary.noValidation.ids.indexOf($scope.selectedTableDef.bindingIdentifier) > 0;
        };


    }]);

angular.module('contextFree')
    .controller('ContextFreeVocabularyTabCtrl', ['$scope', 'ContextFree', '$timeout', function ($scope, ContextFree, $timeout) {
        $scope.tableList = [];
        $scope.tmpList = [].concat($scope.tableList);
        $scope.error = null;
        $scope.tableLibrary = null;

        $scope.init = function (valueSetDefinitionGoup) {
            if (tableLibrary) {
                $scope.tableLibrary = tableLibrary;
                $scope.tableList = tableLibrary.valueSetDefinitions;
                $scope.tmpList = [].concat($scope.tableList);
            }
        };
    }]);





