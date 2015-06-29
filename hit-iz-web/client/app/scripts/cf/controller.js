'use strict';


angular.module('cf')
    .controller('CFTestingCtrl', ['$scope', '$http', 'CF', '$window', '$modal', '$filter', '$rootScope', 'ngTreetableParams', 'CFTestCaseListLoader', function ($scope, $http, CF, $window, $modal,$filter,$rootScope,ngTreetableParams,CFTestCaseListLoader) {

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

angular.module('cf').controller('CFProfileInfoCtrl', function ($scope, $modalInstance) {
    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    };
});



angular.module('cf')
    .controller('CFProfileViewerCtrl', ['$scope', 'ngTreetableParams', 'CF', '$rootScope','ProfileService', function ($scope, ngTreetableParams, CF,$rootScope,ProfileService) {

        $scope.cf = CF;
        $scope.elements = [];
        $scope.nodeData = [];
        $scope.loading = false;
        $scope.error = null;
        $scope.profile = null;
        $scope.relevance = true;
        $scope.trim = true;
        $scope.valueSetIds = [];
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
            $rootScope.$broadcast('cf:showValueSetDefinition', tableId);
        };

        $scope.init = function () {
            $rootScope.$on('cf:testCaseLoaded', function (event) {
                if ($scope.cf.testCase.testContext != null && $scope.cf.testCase.testContext.profile.json != null && $scope.cf.testCase.testContext.profile.json != "") {
                    $scope.loading = true;
                    $scope.nodeData = [];
                    $scope.loading = false;
                    $scope.profile = $scope.cf.testCase.testContext.profile;
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
                    $rootScope.$broadcast('cf:valueSetIdsCollected', valueSetIds);
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


    }]);


angular.module('cf')
    .controller('CFValidatorCtrl', ['$scope', '$http', 'CF', '$window', 'HL7EditorUtils', 'HL7CursorUtils', '$timeout', 'HL7TreeUtils', '$modal', 'NewValidationResult', 'HL7Utils', 'DQAValidationResult','$rootScope','Er7MessageValidator', 'Er7MessageParser', 'DQAMessageValidator', 'ValidationResultHighlighter', function ($scope, $http, CF, $window, HL7EditorUtils, HL7CursorUtils, $timeout, HL7TreeUtils, $modal,NewValidationResult,HL7Utils,DQAValidationResult,$rootScope,Er7MessageValidator,Er7MessageParser,DQAMessageValidator,ValidationResultHighlighter) {

        $scope.cf = CF;
        $scope.testCase = CF.testCase;
        $scope.message = CF.message;
        $scope.selectedMessage = {};
        $scope.validationResult = null;
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

        $scope.validResultHighlither = new ValidationResultHighlighter($scope.failuresConfig,$scope.cf.message, $scope.cf.report, $scope.cf.tree, $scope.cf.editor);

        $scope.messageObject = [];
        $scope.tError = null;
        $scope.tLoading = false;


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
            if ($scope.cf.testCase.testContext.message != null) {
                $scope.nodelay = true;
                $scope.selectedMessage = $scope.cf.testCase.testContext.message;
                if ($scope.selectedMessage != null) {
                    $scope.editor.doc.setValue($scope.selectedMessage.messageContent);
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
            $scope.cf.dqaValidationResult = null;
            if ($scope.cf.testCase != null && $scope.cf.message.content !== "") {
                try {
                        var id = $scope.cf.testCase.testContext.id;
                        var content = $scope.cf.message.content;
                        var label = $scope.cf.testCase.label;
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
                            var dqaValidated = new DQAMessageValidator($scope.cf.message.content, "1223");
                            dqaValidated.then(function (mvResult) {
                                $scope.dqaLoading = false;
                                $scope.cf.dqaValidationResult = new DQAValidationResult(mvResult);
                                $scope.dqaValidationResult = $scope.cf.dqaValidationResult;
                            }, function (error) {
                                $scope.dqaLoading = false;
                                $scope.dqaError = error;
                                $scope.cf.dqaValidationResult = null;
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
                $scope.cf.validationResult = new NewValidationResult();
                $scope.cf.validationResult.init(mvResult);
                $scope.validationResult =  $scope.cf.validationResult;
                $scope.cf.report["result"] = $scope.validationResult;
                if (!angular.equals(mvResult, {})) {
                    $scope.cf.report["metaData"] = {
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
                            errorCount: $scope.cf.report.result.errors.categories[0].data.length,
                            warningCount: $scope.cf.report.result.warnings.categories[0].data.length,
                            informationalCount: $scope.cf.report.result.informationals.categories[0].data.length,
                            alertCount: $scope.cf.report.result.alerts.categories[0].data.length,
                            affirmativeCount: $scope.cf.report.result.affirmatives.categories[0].data.length
                        }
                    };
                } else {
                    $scope.cf.report.result = null;
                    $scope.cf.report.metaData = null;
                }
            }else{
                $scope.cf.validationResult = null;
                $scope.validationResult = null;
                $scope.cf.report["result"] = null;
            }
        };


        $scope.select = function (element) {
            if (element != undefined && element.path != null && element.line != -1) {
                var node = HL7TreeUtils.selectNodeByPath($scope.cf.tree.root, element.line, element.path);
                var data = node != null ? node.data : null;
                $scope.cf.cursor.init(data != null ? data.lineNumber : element.line, data != null ? data.startIndex - 1 : element.column - 1, data != null ? data.endIndex - 1 : element.column - 1, data != null ? data.startIndex - 1 : element.column - 1, false);
                HL7EditorUtils.select($scope.editor, $scope.cf.cursor);
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
            $scope.cf.message.download();
        };

        $scope.parseMessage = function () {
            $scope.tLoading = true;
            if ($scope.cf.testCase.testContext.profile!= null && $scope.cf.message.content != '') {
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
            $scope.error = null;
            $scope.tError = null;
            $scope.mError = null;
            $scope.vError = null;
            $scope.cf.message.content = $scope.editor.doc.getValue();
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

            $scope.$on('cf:refreshEditor', function (event) {
                $scope.refreshEditor();
                event.preventDefault();
            });



            $rootScope.$on('cf:testCaseLoaded', function (event) {
                $scope.refreshEditor();
                if ($scope.cf.testCase != null && $scope.cf.testCase.id != null) {
                    $scope.clearMessage();
                }
            });

        };

    }])
;


angular.module('cf')
    .controller('CFReportCtrl', ['$scope', '$sce', '$http', 'CF', function ($scope, $sce, $http, CF) {
        $scope.cf = CF;
        $scope.error = null;
        $scope.loading = false;
        $scope.init = function () {
        };
        $scope.downloadAs = function (format) {
            $scope.cf.report.downloadByFormat($scope.cf.report, format);
        };
    }]);

angular.module('cf')
    .controller('CFVocabularyCtrl', ['$scope', '$window', '$filter', 'CF', '$modal', '$rootScope','VocabularyService', function ($scope, $window, $filter, CF,$modal,$rootScope,VocabularyService) {

        $scope.selectedValueSetDefinition = null;
        $scope.tmpTableElements = [];
        $scope.testCase = CF.testCase;
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
        $scope.cf = CF;
        var vocabularyService = new VocabularyService();

        $scope.init = function (eventType) {

            $rootScope.$on('cf:testCaseLoaded', function (event) {
                $scope.testCase = CF.testCase;
            });

            $rootScope.$on('cf:valueSetIdsCollected', function (event, valueSetIds) {
                $scope.loading = true;
                var all = angular.fromJson(CF.testCase.testContext.vocabularyLibrary.json).valueSetDefinitions.valueSetDefinitions;
                $scope.valueSetDefinitionGroups = vocabularyService.getValueSetDefinitionGroups(all, valueSetIds);
                $scope.loading = false;
            });

            $rootScope.$on('cf:showValueSetDefinition', function (event, tableId) {
                vocabularyService.showValueSetDefinition(tableId);
            });
        };

        $scope.searchTableValues = function () {
            $scope.selectedValueSetDefinition = null;
            $scope.selectedTableLibrary = null;
            $scope.searchResults = [];
            $scope.tmpSearchResults = [];
            if ($scope.searchString != null) {
                $scope.searchResults = vocabularyService.searchTableValues($scope.searchString, $scope.selectionCriteria, $scope.valueSetDefinitionGroups);
                $scope.vocabResError = null;
                $scope.selectedValueSetDefinition = null;
                $scope.tmpValueSetElements = null;
                if ($scope.searchResults.length == 0) {
                    $scope.vocabResError = "No results found for entered search criteria.";
                }
                else if ($scope.searchResults.length === 1 && ($scope.selectionCriteria === 'TableId' || $scope.selectionCriteria === 'ValueSetName' || $scope.selectionCriteria === 'ValueSetCode')) {
                    $scope.selectValueSetDefinition2($scope.searchResults[0]);
                }
                $scope.tmpSearchResults = [].concat($scope.searchResults);
            }
        };

        $scope.selectValueSetDefinition = function (valueSetDefinition, tableLibrary) {
            $scope.searchResults = [];
            $scope.selectionCriteria = "TableId";
            $scope.searchString = null;
            $scope.selectedValueSetDefinition = valueSetDefinition;
            $scope.selectedTableLibrary = tableLibrary;
            $scope.selectedValueSetDefinition.valueSetElements = $filter('orderBy')($scope.selectedValueSetDefinition.valueSetElements, 'code');
            $scope.tmpValueSetElements = [].concat($scope.selectedValueSetDefinition.valueSetElements);
        };

        $scope.clearSearchResults = function () {
            $scope.searchResults = null;
            $scope.selectedValueSetDefinition = null;
            $scope.vocabResError = null;
            $scope.tmpValueSetElements = null;
            $scope.tmpSearchResults = null;
        };

        $scope.selectValueSetDefinition2 = function (tableDefinition) {
            $scope.selectedValueSetDefinition = tableDefinition;
            $scope.selectedValueSetDefinition.valueSetElements = $filter('orderBy')($scope.selectedValueSetDefinition.valueSetElements, 'code');
            $scope.tmpValueSetElements = [].concat($scope.selectedValueSetDefinition.valueSetElements);
        };


        $scope.isNoValidation = function () {
            return $scope.selectedValueSetDefinition != null && $scope.selectedTableLibrary && $scope.selectedTableLibrary.noValidation && $scope.selectedTableLibrary.noValidation.ids && $scope.selectedTableLibrary.noValidation.ids.indexOf($scope.selectedValueSetDefinition.bindingIdentifier) > 0;
        };


    }]);

angular.module('cf')
    .controller('CFVocabularyTabCtrl', ['$scope', 'CF', '$timeout', function ($scope, CF, $timeout) {
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





