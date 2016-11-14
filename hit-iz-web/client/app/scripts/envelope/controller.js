'use strict';

angular.module('envelope')
    .controller('EnvelopeTestingCtrl', ['$scope', '$window', '$rootScope', 'Envelope', 'StorageService', function ($scope, $window, $rootScope, Envelope, StorageService) {
        $scope.loading = false;
        $scope.error = null;
        $scope.tabs = new Array();
        $scope.testCaseLoaded = null;
        $scope.setActiveTab = function (value) {
            $scope.tabs[0] = false;
            $scope.tabs[1] = false;
            $scope.tabs[2] = false;
            $scope.activeTab = value;
            $scope.tabs[$scope.activeTab] = true;
        };

        $scope.initTesting = function () {
            var tab = StorageService.get(StorageService.ACTIVE_SUB_TAB_KEY);
            if (tab == null || tab != '/envelope_execution') tab = '/envelope_testcase';
            $rootScope.setSubActive(tab);
        };

        $rootScope.$on('env:testCaseLoaded', function (event, testCase, tab) {
            $scope.testCaseLoaded = Envelope.testCase;
            if (Envelope.testCase != null && Envelope.testCase.id != null) {
                $rootScope.setSubActive(tab && tab != null ? tab : '/envelope_execution');
            }
        });

        $scope.hasContent = function () {
            return Envelope.getContent() != '' && Envelope.getContent() != null;
        };

        $scope.disabled = function () {
            return Envelope.testCase == null || Envelope.testCase.id === null;
        };

    }]);


angular.module('envelope')
    .controller('EnvelopeExecutionCtrl', ['$scope', '$window', '$rootScope', 'Envelope', function ($scope, $window, $rootScope, Envelope) {
        $scope.loading = true;
        $scope.error = null;
        $scope.tabs = new Array();
        $scope.testCase = Envelope.testCase;
        $scope.setActiveTab = function (value) {
            $scope.tabs[0] = false;
            $scope.tabs[1] = false;
            $scope.activeTab = value;
            $scope.tabs[$scope.activeTab] = true;
        };
        $scope.getTestType = function () {
            return $scope.testCase != null ? $scope.testCase.type : '';
        };
        $scope.initExecution = function () {
            $scope.error = null;
            $scope.loading = false;
            $rootScope.$on('env:testCaseLoaded', function (event, testCase) {
                $scope.setActiveTab(0);
                $scope.testCase = Envelope.testCase;
            });
        };
    }]);


angular.module('envelope')
    .controller('EnvelopeTestCaseCtrl', ['$scope', '$window', '$rootScope', 'Envelope', 'EnvelopeTestCaseListLoader', '$timeout', 'StorageService', 'TestCaseService', function ($scope, $window, $rootScope, Envelope, EnvelopeTestCaseListLoader, $timeout, StorageService, TestCaseService) {

        $scope.selectedTestCase = Envelope.selectedTestCase;
        $scope.testCase = Envelope.testCase;
        $scope.testCases = [];
        $scope.loading = true;
        $scope.error = null;
        $scope.tree = {};
        var testCaseService = new TestCaseService();

        /**
         *
         */
        $scope.initTestCase = function () {
            $scope.error = null;
            $scope.testCases = [];
            $scope.loading = true;
            var tcLoader = new EnvelopeTestCaseListLoader();
            tcLoader.then(function (testCases) {
                $scope.error = null;
                $scope.testCases = testCases;
                $scope.tree.build_all($scope.testCases);
                var testCase = null;
                var id = StorageService.get(StorageService.SOAP_ENV_SELECTED_TESTCASE_ID_KEY);
                var type = StorageService.get(StorageService.SOAP_ENV_SELECTED_TESTCASE_TYPE_KEY);
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
                id = StorageService.get(StorageService.SOAP_ENV_LOADED_TESTCASE_ID_KEY);
                type = StorageService.get(StorageService.SOAP_ENV_LOADED_TESTCASE_TYPE_KEY);
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
                $scope.expandAll();
                $scope.loading = false;
            }, function (error) {
                $scope.loading = false;
                $scope.error = "Sorry,Cannot fetch the test cases. Please refresh the page.";
            });
        };

        $scope.refreshEditor = function () {
            $timeout(function () {
                $scope.$broadcast("envelope:editor:init");
            });
        };

        $scope.selectTestCase = function (node) {
            $timeout(function () {
                $scope.selectedTestCase = node;
                StorageService.set(StorageService.SOAP_ENV_SELECTED_TESTCASE_ID_KEY, node.id);
                StorageService.set(StorageService.SOAP_ENV_SELECTED_TESTCASE_TYPE_KEY, node.type);
                $timeout(function () {
                    $rootScope.$broadcast('env:testCaseSelected');
                });
            });
        };

        $scope.selectNode = function (id, type) {
            $timeout(function () {
                testCaseService.selectNodeByIdAndType($scope.tree, id, type);
            });
        };


        $scope.loadTestCase = function (testCase, tab) {
            if (Envelope.editor.instance != null) {
                Envelope.editor.instance.setOption("readOnly", false);
            }
            if (testCase.type === 'TestCase') {
                Envelope.testCase = testCase;
                $scope.testCase = Envelope.testCase;
                var id = StorageService.get(StorageService.SOAP_ENV_LOADED_TESTCASE_ID_KEY);
                var type = StorageService.get(StorageService.SOAP_ENV_LOADED_TESTCASE_TYPE_KEY);
                if (id != $scope.testCase.id || type != $scope.testCase.type) {
                    StorageService.set(StorageService.SOAP_ENV_LOADED_TESTCASE_ID_KEY, $scope.testCase.id);
                    StorageService.set(StorageService.SOAP_ENV_LOADED_TESTCASE_TYPE_KEY, $scope.testCase.type);
                    StorageService.remove(StorageService.SOAP_ENV_EDITOR_CONTENT_KEY);
                }
                $timeout(function () {
                    $rootScope.$broadcast('env:testCaseLoaded', $scope.testCase, tab);
                });
            }
        };

        $scope.isSelectable = function (node) {
            return true;
        };

        $scope.expandAll = function () {
            if($scope.tree != null)
                $scope.tree.expand_all();
        };

        $scope.collapseAll = function () {
            if($scope.tree != null)
                $scope.tree.collapse_all();
        };



    }]);

angular.module('envelope')
    .controller('EnvelopeValidatorCtrl', ['$scope', '$http', '$window', 'SOAPFormatter', 'Envelope', 'SOAPEditorUtils', '$rootScope', 'SOAPParser', 'SOAPTreeUtils', 'EnvelopeValidator', '$timeout', 'StorageService','FileUpload','Notification', function ($scope, $http, $window, SOAPFormatter, Envelope, SOAPEditorUtils, $rootScope, SOAPParser, SOAPTreeUtils, EnvelopeValidator, $timeout, StorageService,FileUpload,Notification) {
        $scope.testCase = Envelope.testCase;
        $scope.selectedTestCase = Envelope.selectedTestCase;
        $scope.vLoading = true;
        $scope.vError = null;
        $scope.selectedMessage = {id: -1, content: ''};

        $scope.eLoading = false;
        $scope.validating = false;
        $scope.editorInit = false;
        $scope.eError = null;

        $scope.vLoading = false;
        $scope.vError = null;
        $scope.resized = false;
        $scope.validationSettings = Envelope.validationSettings;
        $scope.validationResult = Envelope.validationResult;
        $scope.errors = $scope.validationResult.errors;
        $scope.errorsCollection = [].concat($scope.errors.data);
        $scope.affirmatives = $scope.validationResult.affirmatives;
        $scope.affirmativesCollection = [].concat($scope.affirmatives.data);
        $scope.alerts = $scope.validationResult.alerts;
        $scope.alertsCollection = [].concat($scope.alerts.data);
        $scope.ignores = $scope.validationResult.ignores;
        $scope.ignoresCollection = [].concat($scope.ignores.data);
        $scope.warnings = $scope.validationResult.warnings;
        $scope.warningsCollection = [].concat($scope.warnings.data);


//        $scope.envelopeObject = [];
        $scope.tError = null;
        $scope.envelopeTree = {};
        $scope.tLoading = false;


        $scope.refreshEditor = function () {
            if ($scope.editor != undefined) {
                $timeout(function () {
                    $scope.editor.refresh();
                }, 1000);
            }
        };

        $scope.loadExampleMessage = function () {
            var content = Envelope.testCase.testContext.exampleMessage.content;
            var formatter = new SOAPFormatter(content);
            formatter.then(function (formatted) {
                $scope.message(formatted);
            }, function (error) {
                $scope.error = error;
                $scope.message(content);
            });
        };


        $scope.message = function (message) {
            Envelope.message.content = message;
            Envelope.editor.instance.doc.setValue(message);
            StorageService.set(StorageService.SOAP_ENV_EDITOR_CONTENT_KEY, message);
            $scope.refreshEditor();
            $scope.validateMessage();
            $scope.parse();
        };


        $scope.validate = function () {
            $scope.vError = null;
            var backup = Envelope.editor.instance.doc.getValue();
            if (backup != '') {
                $scope.vLoading = true;
                var formatter = new SOAPFormatter(backup);
                formatter.then(function (formatted) {
                    $scope.vLoading = false;
                    $scope.message(formatted);
                }, function (error) {
                    $scope.vLoading = false;
                    $scope.vError = error;
                    $scope.setValidationResult({});
                    if (typeof $scope.envelopeTree.build_all == 'function') {
                        $scope.envelopeTree.build_all([]);
                    }
                });
            } else {
                $scope.message('');
            }
        };

        $scope.initValidation = function () {

            $scope.editor = CodeMirror.fromTextArea(document.getElementById("envelopeTextArea"), {
                lineNumbers: true,
                fixedGutter: true,
                mode: 'xml',
                readOnly: false,
                showCursorWhenSelecting: true
            });

            $scope.editor.on("dblclick", function (editor) {
                $scope.$apply(function () {
                    Envelope.cursor.setLine(editor.doc.getCursor(true).line + 1);
                });
//                event.preventDefault();
            });

            $scope.editor.setSize("100%", 300);
            Envelope.editor.init($scope.editor);

            $scope.tLoading = false;

            $scope.$watch(function () {
                return Envelope.cursor.updateIndicator;
            }, function () {
                SOAPEditorUtils.select(Envelope.cursor, $scope.editor);
            }, true);

            $scope.$watch(function () {
                return Envelope.cursor.toString();
            }, function () {
                SOAPTreeUtils.selectNode($scope.envelopeTree, Envelope.cursor);
            }, true);

//            $scope.$watch(function () {
//                return $scope.envelopeObject;
//            }, function () {
//                SOAPTreeUtils.expandTree($scope.envelopeTree);
//            }, true);

            $rootScope.$on('env:testCaseLoaded', function (event) {
                $scope.testCase = Envelope.testCase;
                var content = StorageService.get(StorageService.SOAP_ENV_EDITOR_CONTENT_KEY) == null ? '' : StorageService.get(StorageService.SOAP_ENV_EDITOR_CONTENT_KEY);
                $scope.message(content);
            });

            $scope.setValidationResult({});
            $scope.refreshEditor();
        };


        $scope.uploadMessage = function(file, errFiles) {
            $scope.f = file;
            FileUpload.uploadMessage(file,errFiles).then(function(response){
                $timeout(function () {
                    file.result = response.data;
                    var result = response.data;
                    var fileName = file.name;
                    var tmp = angular.fromJson(result);
                    $scope.message(result.content);
                    $scope.uploadError = null;
                    $scope.fileName = fileName;
                    Notification.success({message: "File " + fileName + " successfully uploaded!", templateUrl: "NotificationSuccessTemplate.html", scope: $rootScope, delay: 30000});
                });
            }, function(response){
                $scope.uploadError = response.data;
            });
        };


        $scope.getMessageName = function () {
            return Envelope.message.name;
        };


        $scope.clearMessage = function () {
            $scope.error = null;
            $scope.message('');
        };

        $scope.saveMessage = function () {
            Envelope.message.download();
        };

        $scope.resize = function () {
        };


        $scope.validateMessage = function () {
            $scope.vLoading = true;
            $scope.vError = null;
            if (Envelope.testCase.id != null && Envelope.editor.instance != null && Envelope.editor.instance.doc.getValue() != '') {
                var validated = new EnvelopeValidator().validate(Envelope.message.content, Envelope.testCase.id);
                validated.then(function (result) {
                    $scope.vLoading = false;
                    $scope.setValidationResult(result);
                }, function (error) {
                    $scope.vLoading = false;
                    $scope.vError = error;
                    $scope.setValidationResult({});
                });
            } else {
                $scope.setValidationResult({});
                $scope.vLoading = false;
                $scope.vError = null;
            }
        };

        $scope.setValidationResult = function (result) {
            Envelope.validationResult.init(result);
            $scope.validationResult = Envelope.validationResult;
            $scope.errors = $scope.validationResult.errors;
            $scope.affirmatives = $scope.validationResult.affirmatives;
            $scope.alerts = $scope.validationResult.alerts;
            $scope.ignores = $scope.validationResult.ignores;
            $scope.warnings = $scope.validationResult.warnings;
            $timeout(function () {
                $rootScope.$emit('env:validationResultLoaded');
            });
        };

        $scope.select = function (element) {
            if (element.line != -1) {
                Envelope.cursor.setLine(element.line);
            }
        };

        $scope.parse = function () {
            $scope.tLoading = true;
            $scope.tError = null;
            if (Envelope.testCase.id !== null && Envelope.getContent() != '') {
                var loader = new SOAPParser(Envelope.getContent());
                loader.then(function (value) {
                    $scope.tLoading = false;
                    $scope.envelopeTree.build_all(value);
                    SOAPTreeUtils.expandTree($scope.envelopeTree);
                }, function (tError) {
                    $scope.tLoading = false;
                    $scope.tError = tError;
                    $scope.envelopeTree.build_all([]);
                });
            } else {
                $scope.tLoading = false;
                $scope.envelopeTree.build_all([]);
            }
        };


        $scope.onEnvelopeNodeSelect = function (node) {
            SOAPTreeUtils.setCoordinate(node, Envelope.cursor);
        };

        $scope.expandAll = function () {
            if($scope.envelopeTree != null)
                $scope.envelopeTree.expand_all();
        };

        $scope.collapseAll = function () {
            if($scope.envelopeTree != null)
                $scope.envelopeTree.collapse_all();
        };



    }]);

'use strict';


angular.module('envelope')
    .controller('EnvelopeReportCtrl', ['$scope', '$sce', '$http', 'Envelope', '$rootScope', function ($scope, $sce, $http, Envelope, $rootScope) {
        $scope.error = null;
        $scope.loading = false;
        $scope.testCase = Envelope.testCase;
        $scope.report = Envelope.report;
        $rootScope.$on('env:validationResultLoaded', function () {
            var xmlReport = Envelope.validationResult.xml;
            if (xmlReport != null && xmlReport != '') {
                $scope.loading = true;
                var promise = Envelope.report.generate(xmlReport);
                promise.then(function (json) {
                    $scope.loading = false;
                    $scope.error = null;
                }, function (error) {
                    $scope.error = "Failed to generate the report";
                    $scope.loading = false;
                });
            } else {
                $scope.loading = false;
                $scope.error = null;
            }
        });

        $rootScope.$on('env:testCaseLoaded', function (event) {
            $scope.testCase = Envelope.testCase;
        });

        $scope.downloadAs = function (format) {
            $scope.report.download(format, Envelope.testCase.label, Envelope.validationResult.xml);
        };

    }]);