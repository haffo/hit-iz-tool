'use strict';

angular.module('isolated')
    .controller('IsolatedSystemTestingCtrl', ['$scope', '$window', '$rootScope', 'IsolatedSystem', 'StorageService','TestCaseService','TestStepService', function ($scope, $window, $rootScope, IsolatedSystem, StorageService,TestCaseService,TestStepService) {
        $scope.testCase = null;
        $scope.getTestType = function () {
            return IsolatedSystem.testCase.type;
        };

        $scope.initTesting = function () {
            $scope.error = null;
            $scope.loading = false;
            var tab = StorageService.get(StorageService.ACTIVE_SUB_TAB_KEY);
            if (tab == null || tab != '/isolated_execution') tab = '/isolated_testcase';
            $rootScope.setSubActive(tab);

            $scope.$on('isolated:testCaseLoaded', function (event, testCase, tab) {
                $scope.testCase = testCase;
            });

            $scope.$on("$destroy", function () {
                var testCaseId = StorageService.get(StorageService.ISOLATED_LOADED_TESTCASE_ID_KEY);
                if (testCaseId != null) TestCaseService.clearRecords(testCaseId);

                var testStepId = StorageService.get(StorageService.ISOLATED_LOADED_TESTSTEP_ID_KEY);
                if (testStepId != null) TestStepService.clearRecords(testStepId);
            });


        };

        $scope.disabled = function () {
            return IsolatedSystem.testCase == null || IsolatedSystem.testCase.id === null;
        };

    }]);


angular.module('isolated')
    .controller('IsolatedSystemTestCaseCtrl', ['$scope', '$filter', '$window', '$rootScope', 'IsolatedSystem', '$timeout', 'IsolatedSystemTestCaseListLoader', 'StorageService', 'TestCaseService','TestStepService', function ($scope, $filter, $window, $rootScope, IsolatedSystem, $timeout, IsolatedSystemTestCaseListLoader, StorageService, TestCaseService,TestStepService) {
        $scope.selectedTestCase = IsolatedSystem.selectedTestCase;
        $scope.testCase = IsolatedSystem.testCase;
        $scope.testCases = [];
        $scope.tree = {};
        $scope.loading = true;
        $scope.error = null;
        var testCaseService = new TestCaseService();


        $scope.initTestCase = function () {
            $scope.error = null;
            $scope.loading = true;

            var tcLoader = new IsolatedSystemTestCaseListLoader();
            tcLoader.then(function (testCases) {
                if (typeof $scope.tree.build_all == 'function') {
                    $scope.error = null;
                    angular.forEach(testCases, function (testPlan) {
                        testCaseService.buildTree(testPlan);
                    });
                    $scope.testCases = testCases;

                    $scope.tree.build_all($scope.testCases);
                    var testCase = null;
                    var id = StorageService.get(StorageService.ISOLATED_SELECTED_TESTCASE_ID_KEY);
                    var type = StorageService.get(StorageService.ISOLATED_SELECTED_TESTCASE_TYPE_KEY);
                    if (id != null && type != null) {
                        for (var i = 0; i < $scope.testCases.length; i++) {
                            var found = testCaseService.findOneByIdAndType(id, type, $scope.testCases[i]);
                            if (found != null) {
                                testCase = found;
                                break;
                            }
                        }
                        if (testCase != null) {
//                        $scope.selectTestCase(testCase);
                            $scope.selectNode(id, type);
                        }
                    }

                    testCase = null;
                    id = StorageService.get(StorageService.ISOLATED_LOADED_TESTCASE_ID_KEY);
                    type = StorageService.get(StorageService.ISOLATED_LOADED_TESTCASE_TYPE_KEY);
                    if (id != null && type != null) {
                        var id = StorageService.get(StorageService.ISOLATED_SELECTED_TESTCASE_ID_KEY);
                        var type = StorageService.get(StorageService.ISOLATED_SELECTED_TESTCASE_TYPE_KEY);
                        for (var i = 0; i < $scope.testCases.length; i++) {
                            var found = testCaseService.findOneByIdAndType(id, type, $scope.testCases[i]);
                            if (found != null) {
                                testCase = found;
                                break;
                            }
                        }
                        if (testCase != null) {
                            var tab = StorageService.get(StorageService.ACTIVE_SUB_TAB_KEY);
                            $scope.loadTestCase(testCase, tab, false);
                        }
                    }
                } else {
                    $scope.error = "Ooops, Something went wrong. Please refresh your page. We are sorry for the inconvenience.";
                }

                $scope.loading = false;
            }, function (error) {
                $scope.loading = false;
                $scope.error = "Sorry,cannot load the test cases. Please refresh your page and try again.";
            });
        };

        $scope.selectNode = function (id, type) {
            testCaseService.selectNodeByIdAndType($scope.tree, id, type);
        };

        $scope.selectTestCase = function (node) {
            $scope.selectedTestCase = node;
            StorageService.set(StorageService.ISOLATED_SELECTED_TESTCASE_ID_KEY, node.id);
            StorageService.set(StorageService.ISOLATED_SELECTED_TESTCASE_TYPE_KEY, node.type);
            $scope.$broadcast('isolated:testCaseSelected', $scope.selectedTestCase);
        };

        $scope.selectTestPlan = function (node) {
            if ($scope.selectedTestCase == null || $scope.selectedTestCase.id != node.id) {
                $scope.selectedTestCase = node;
            }
        };

        $scope.loadTestCase = function (testCase, tab, clear) {
            if (testCase.type === 'TestCase') {
                $scope.testCase = angular.copy(testCase);

                var previousId = StorageService.get(StorageService.ISOLATED_LOADED_TESTCASE_ID_KEY);
                if(previousId != null)TestCaseService.clearRecords(previousId);
                previousId = StorageService.get(StorageService.ISOLATED_LOADED_TESTSTEP_ID_KEY);
                if(previousId != null)TestStepService.clearRecords(previousId);

                StorageService.set(StorageService.ISOLATED_LOADED_TESTCASE_ID_KEY, $scope.testCase.id);
                StorageService.set(StorageService.ISOLATED_LOADED_TESTCASE_TYPE_KEY, $scope.testCase.type);
                if (clear === undefined || clear === true) {
                    StorageService.remove(StorageService.ISOLATED_EDITOR_CONTENT_KEY);
                    StorageService.remove(StorageService.ISOLATED_LOADED_TESTSTEP_TYPE_KEY);
                    StorageService.remove(StorageService.ISOLATED_LOADED_TESTSTEP_ID_KEY);
                }
                $timeout(function () {
                    $rootScope.$broadcast('isolated:testCaseLoaded', $scope.testCase, tab);
                });
            }
        };


        $scope.downloadTestStory = function () {
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

        $scope.isSelectable = function (node) {
            return true;
        };

    }]);


angular.module('isolated')
    .controller('IsolatedSystemExecutionCtrl', ['$scope', '$window', '$rootScope', 'IsolatedSystem', '$modal', 'TestExecutionClock', 'SOAPEscaper', 'Endpoint', 'TestExecutionService', '$timeout', 'StorageService', 'User', 'TestCaseService', 'TestStepService', 'ServiceDelegator','ReportService',function ($scope, $window, $rootScope, IsolatedSystem, $modal, TestExecutionClock, SOAPEscaper, Endpoint, TestExecutionService, $timeout, StorageService, User, TestCaseService, TestStepService,ServiceDelegator,ReportService) {
        $scope.loading = true;
        $scope.error = null;
        $scope.tabs = new Array();
        $scope.testCase = null;
        $scope.testStep = null;
        $scope.logger = IsolatedSystem.logger;
        $scope.connecting = false;
        $scope.error = null;
        $scope.user = IsolatedSystem.user;
        $scope.endpoint = null;
        $scope.hidePwd = true;
        $scope.sent = null;
        $scope.received = null;
        $scope.configCollapsed = true;
        $scope.counterMax = 30;
        $scope.counter = 0;
        $scope.listenerReady = false;
        $scope.testStepListCollapsed = false;
        $scope.warning = null;
        $scope.user = User;
        $scope.transport = IsolatedSystem.transport;
        $scope.format = null;

        $scope.initExecution = function () {
            $scope.error = null;
            $scope.loading = false;
            $scope.setActiveTab(0);
            $scope.$on('isolated:testCaseLoaded', function (event, testCase, tab) {
                $scope.executeTestCase(testCase, tab);
            });
        };

        var errors = [
            "Incorrect SOAP Envelope Received. Please check the log for more details",
            "No Outbound message found",
            "No Outbound message found",
            "Invalid SOAP Envelope Received. Please see console for more details.",
            "Invalid SOAP Envelope Sent. Please see console for more details."
        ];

        var parseRequest = function (incoming) {
            var x2js = new X2JS();
            var receivedJson = x2js.xml_str2json(incoming);
            var receivedMessage = SOAPEscaper.decodeXml(receivedJson.Envelope.Body.submitSingleMessage.hl7Message.toString());
            return receivedMessage;
        };

        var parseResponse = function (outbound) {
            var x2js = new X2JS();
            var sentMessageJson = x2js.xml_str2json(outbound);
            var sentMessage = SOAPEscaper.decodeXml(sentMessageJson.Envelope.Body.submitSingleMessageResponse.return.toString());
            return sentMessage;
        };


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
            return $scope.testCase != null ? $scope.testCase.type : '';
        };

        $scope.resetTestCase = function () {
            StorageService.remove(StorageService.ISOLATED_LOADED_TESTSTEP_TYPE_KEY);
            StorageService.remove(StorageService.ISOLATED_LOADED_TESTSTEP_ID_KEY);
            $scope.executeTestCase($scope.testCase);
        };


        $scope.selectTestStep = function (testStep) {
            $timeout(function () {
                IsolatedSystem.testStep = testStep;
                $scope.testStep = testStep;
                StorageService.set(StorageService.ISOLATED_LOADED_TESTSTEP_TYPE_KEY, $scope.testStep.type);
                StorageService.set(StorageService.ISOLATED_LOADED_TESTSTEP_ID_KEY, $scope.testStep.id);
                if (testStep != null && !$scope.isManualStep(testStep)) {
                    if (testStep.executionMessage === undefined && testStep['testingType'] === 'TA_INITIATOR') {
                        $scope.format = testStep.testContext.format;
                        TestExecutionService.setExecutionMessage(testStep, testStep.testContext.message.content);
                    }
                    $scope.loadValidationPanel(testStep);
                }
                if ($scope.isTestCaseCompleted()) {
                    $scope.viewConsole(testStep.id);
                }
            });
        };


        $scope.clearTestStep = function () {
            IsolatedSystem.testStep = null;
            $scope.testStep = null;
            $scope.$broadcast('isolated:removeTestStep');
        };


        $scope.getExecutionStatus = function (testStep) {
            return TestExecutionService.getExecutionStatus(testStep);
        };

        $scope.getValidationStatus = function (testStep) {
            return TestExecutionService.getValidationStatus(testStep);
        };


        $scope.isManualStep = function (testStep) {
            return testStep['testingType'] === 'TA_MANUAL' || testStep['testingType'] === 'SUT_MANUAL';
        };

        $scope.isSutInitiator = function (testStep) {
            return testStep['testingType'] == 'SUT_INITIATOR';
        };


        $scope.isTaInitiator = function (testStep) {
            return testStep['testingType'] == 'TA_INITIATOR';
        };

        $scope.isStepCompleted = function (testStep) {
            return $scope.getExecutionStatus(testStep) == 'COMPLETE';
        };

        $scope.completeStep = function (row) {
            TestExecutionService.setExecutionStatus(row, 'COMPLETE');
        };

        $scope.completeManualStep = function (row) {
            $scope.completeStep(row);
        };

        $scope.progressStep = function (row) {
            TestExecutionService.setExecutionStatus(row, 'IN_PROGRESS');
        };

        $scope.goNext = function (row) {
            if ($scope.isManualStep(row)) {
                $scope.completeStep(row);
            }
            if (!$scope.isLastStep(row)) {
                $scope.executeTestStep($scope.findNextStep(row.position));
            } else {
                $scope.completeTestCase();
            }
        };

        $scope.goBack = function (step) {
            if ($scope.isManualStep(step)) {
                $scope.completeStep(step);
            }
            if (!$scope.isFirstStep(step)) {
                $scope.executeTestStep($scope.findPreviousStep(step.position));
            }
        };

        $scope.executeTestStep = function (testStep) {
            if (testStep != null) {
                $scope.warning = null;
                var log = $scope.transport.logs[testStep.id];
                $scope.logger.content = log && log != null ? log : '';
                if ($scope.testCase.transport === true && !$scope.isManualStep(testStep)) {
                    if ($scope.isSutInitiator(testStep) || $scope.isTaInitiator(testStep)) {
                        if ($scope.isSutInitiator(testStep)) {
                            $scope.transport.loadSutInitiatorConfig(testStep.protocol);
                        } else {
                            $scope.transport.loadTaInitiatorConfig(testStep.protocol);
                        }
                        $scope.transport.loadConfigForm(testStep.protocol, testStep['testingType']).then(function (form) {
                            if (testStep['testingType'] === 'TA_INITIATOR') {
                                $scope.taInititiatorForm = form;
                            } else if (testStep['testingType'] === 'SUT_INITIATOR') {
                                $scope.sutInititiatorForm = form;
                            }
                        });
                    }
                }
                $scope.selectTestStep(testStep);
            }
        };

        $scope.openConfig = function () {
            if ($scope.testStep['testingType'] === 'SUT_INITIATOR') {
                var modalInstance = $modal.open({
                    templateUrl: 'SutInitiatorConfigForm.html',
                    windClass: 'initiator-config-modal',
                    backdrop: 'static',
                    'keyboard': false,
                    controller: 'InitiatorConfigCtrl',
                    resolve: {
                        htmlForm: function () {
                            return $scope.sutInititiatorForm;
                        },
                        config: function () {
                            return IsolatedSystem.transport.config.sutInitiator;
                        },
                        domain: function () {
                            return IsolatedSystem.transport.domain;
                        },
                        protocol: function () {
                            return IsolatedSystem.transport.protocol;
                        }
                    }
                });
            } else if ($scope.testStep['testingType'] === 'TA_INITIATOR') {
                var modalInstance = $modal.open({
                    templateUrl: 'TaInitiatorConfigForm.html',
                    size: 'initiator-config-modal',
                    backdrop: 'static',
                    'keyboard': false,
                    controller: 'InitiatorConfigCtrl',
                    resolve: {
                        htmlForm: function () {
                            return $scope.taInititiatorForm;
                        },
                        config: function () {
                            var config = StorageService.get(StorageService.USER_CONFIG_KEY);
                            if (config != null && config != "") {
                                config = angular.fromJson(config);
                            } else {
                                config = IsolatedSystem.transport.config;
                            }
                            return  config.taInitiator;
                        },
                        domain: function () {
                            return IsolatedSystem.transport.domain;
                        },
                        protocol: function () {
                            return IsolatedSystem.transport.protocol;
                        }
                    }
                });
                modalInstance.result.then(function (taInitiator) {
                    IsolatedSystem.transport.config.taInitiator = taInitiator;
                    StorageService.set(StorageService.USER_CONFIG_KEY, angular.toJson(IsolatedSystem.transport.config));
                }, function () {
                });
            }
        };

        $scope.isTestCaseCompleted = function () {
            return $scope.testCase && $scope.testCase.executionStatus === 'COMPLETE';
        };

        $scope.isTestCase = function () {
            return IsolatedSystem.testCase != null && IsolatedSystem.testCase.type === 'TestCase';
        };


        $scope.completeTestCase = function () {
            $scope.testCase.executionStatus = 'COMPLETE';
            if (IsolatedSystem.editor.instance != null) {
                IsolatedSystem.editor.instance.setOption("readOnly", true);
            }
            $scope.clearTestStep();
        };

        $scope.isTestStepCompleted = function (row) {
            return row != null && ((!$scope.isManualStep(row) && $scope.getExecutionStatus(row) == 'COMPLETE') || ($scope.isManualStep(row)));
        };

        $scope.shouldNextStep = function (row) {
            return $scope.testStep != null && $scope.testStep === row && !$scope.isTestCaseCompleted() && !$scope.isLastStep(row) && $scope.isTestStepCompleted(row);
        };

        $scope.isLastStep = function (row) {
            return row != null && $scope.testCase != null && $scope.testCase.children.length === row.position;
        };

        $scope.isFirstStep = function (row) {
            return row != null && $scope.testCase != null && row.position === 1;
        };

        $scope.isTestCaseSuccessful = function () {
            if ($scope.testCase != null) {
                for (var i = 0; i < $scope.testCase.children.length; i++) {
                    if ($scope.getValidationStatus($scope.testCase.children[i]) > 0) {
                        return false;
                    }
                }
            }
            return true;
        };


        $scope.testStepSucceed = function (testStep) {
            return $scope.getValidationStatus(testStep) <= 0;
        };


        $scope.findNextStep = function (position) {
            var nextStep = null;
            for (var i = 0; i < $scope.testCase.children.length; i++) {
                if ($scope.testCase.children[i].position === position + 1) {
                    return  $scope.testCase.children[i];
                }
            }
            return null;
        };

        $scope.findPreviousStep = function (position) {
            var nextStep = null;
            for (var i = 0; i < $scope.testCase.children.length; i++) {
                if ($scope.testCase.children[i].position === position - 1) {
                    return  $scope.testCase.children[i];
                }
            }
            return null;
        };


        $scope.clearExecution = function () {
            if ($scope.testCase != null) {
                for (var i = 0; i < $scope.testCase.children.length; i++) {
                    var testStep = $scope.testCase.children[i];
                    TestExecutionService.deleteExecutionStatus(testStep);
                    TestExecutionService.deleteValidationReport(testStep);
                    TestExecutionService.deleteExecutionMessage(testStep);
                    TestExecutionService.deleteMessageTree(testStep);
                }
                if ($scope.testCase.executionStatus) {
                    delete $scope.testCase.executionStatus;
                }
            }
        };


        $scope.executeTestCase = function (testCase, tab) {
            if (testCase != null) {
                $scope.loading = true;
                IsolatedSystem.testStep = null;
                $scope.testStep = null;
                $scope.format = null;
                $scope.setActiveTab(0);
                tab = tab && tab != null ? tab : '/isolated_execution';
                $rootScope.setSubActive(tab);
                if (tab === '/isolated_execution') {
                    $scope.$broadcast('isolated:refreshEditor');
                }
                $scope.logger.clear();
                $scope.error = null;
                $scope.warning = null;
                $scope.connecting = false;
                IsolatedSystem.testCase = testCase;
                IsolatedSystem.transport.setDomain(testCase.domain);
                IsolatedSystem.transport.logs = {};
                IsolatedSystem.transport.transactions = [];
                $scope.testCase = testCase;
                TestExecutionClock.stop();
                $scope.testCase = testCase;
                $scope.clearExecution();
                if (testCase.type === 'TestCase') {
                     $scope.executeTestStep($scope.testCase.children[0]);
                } else if (testCase.type === 'TestStep') {
                    $scope.setActiveTab(0);
                    IsolatedSystem.testStep = testCase;
                    $scope.testStep = testCase;
                    StorageService.set(StorageService.ISOLATED_LOADED_TESTSTEP_ID_KEY, $scope.testStep.id);
                    if (testCase.testingType === "DATAINSTANCE" || testCase.testingType === "TA_RESPONDER" || testCase.testingType === "TA_INITIATOR" || testCase.testingType === "SUT_RESPONDER" || testCase.testingType === "SUT_INITIATOR") {
                        $scope.loadValidationPanel($scope.testStep);
                    }
                }
                $scope.loading = false;
            }
        };

        $scope.loadValidationPanel = function (testStep) {
            var testContext = testStep['testContext'];
            if (testContext && testContext != null) {
                $scope.setActiveTab(0);
                $timeout(function () {
                    $scope.$broadcast('isolated:testStepLoaded', testStep);
                    $scope.$broadcast('isolated:profileLoaded', testContext.profile);
                    $scope.$broadcast('isolated:valueSetLibraryLoaded', testContext.vocabularyLibrary);
                });
            }
        };

        $scope.setNextStepMessage = function (message) {
            var nextStep = $scope.findNextStep($scope.testStep.position);
            if (nextStep != null && !$scope.isManualStep(nextStep)) {
                $scope.completeStep(nextStep);
                TestExecutionService.setExecutionMessage(nextStep, message);
            }
        };

        $scope.log = function (log) {
            $scope.logger.log(log);
        };

        $scope.isValidConfig = function () {
            return $scope.transport.config != null && $scope.transport.config != '';
        };


        $scope.outboundMessage = function () {
            return $scope.testStep != null ? $scope.testStep.testContext.message.content : null;
        };

        $scope.isValidConfig = function () {
            return $scope.user != null && $scope.user.receiverEndpoint != null && $scope.user.receiverEndpoint != '';
        };


        $scope.hasUserContent = function () {
            return IsolatedSystem.editor && IsolatedSystem.editor != null && IsolatedSystem.editor.instance.doc.getValue() != null && IsolatedSystem.editor.instance.doc.getValue() != "";
        };

        $scope.hasRequestContent = function () {
            return  $scope.outboundMessage() != null && $scope.outboundMessage() != '';
        };

        $scope.send = function () {
            $scope.logger.clear();
            $scope.connecting = true;
            $scope.progressStep($scope.testStep);
            $scope.error = null;
            if ($scope.hasUserContent()) {
                $scope.logger.clear();
                $scope.received = '';
                $scope.logger.log("Sending outbound Message. Please wait...");
                $scope.transport.send($scope.testStep.id, IsolatedSystem.editor.instance.doc.getValue()).then(function (response) {
                    var received = response.incoming;
                    var sent = response.outgoing;
                    $scope.logger.log("Outbound Message  -------------------------------------->");
                    if (sent != null && sent != '') {
                        $scope.logger.log(sent);
                        $scope.logger.log("Inbound Message  <--------------------------------------");
                        if (received != null && received != "") {
                            try {
                                $scope.completeStep($scope.testStep);
                                var rspMessage = parseResponse(received);
                                $scope.logger.log(received);
                                $scope.setNextStepMessage(rspMessage);
                            } catch (error) {
                                $scope.error = errors[0];
                                $scope.logger.log("An error occured: " + $scope.error);
                            }
                        } else {
                            $scope.logger.log("No Inbound message received");
                        }
                    } else {
                        $scope.logger.log("No outbound message sent");
                    }
                    $scope.logger.log("Transaction completed");
                    $scope.connecting = false;
                    $scope.transport.logs[$scope.testStep.id] = $scope.logger.content;
                }, function (error) {
                    $scope.connecting = false;
                    $scope.error = error.data;
                    $scope.logger.log("Error: " + error.data);
                    $scope.received = '';
                    $scope.completeStep($scope.testStep);
                    $scope.transport.logs[$scope.testStep.id] = $scope.logger.content;
                    $scope.logger.log("Transaction stopped");
                });
            } else {
                $scope.error = "No message to send";
                $scope.connecting = false;
                $scope.transport.logs[$scope.testStep.id] = $scope.logger.content;
                $scope.logger.log("Transaction completed");

            }
        };


        $scope.viewConsole = function (testStepId) {
            $scope.logger.content = $scope.transport.logs[testStepId];
        };

        $scope.stopListener = function () {
            $scope.connecting = false;
            $scope.counter = $scope.counterMax;
            TestExecutionClock.stop();
            $scope.logger.log("Stopping listener. Please wait....");
            var sutInitiator = IsolatedSystem.transport.config.sutInitiator;
            $scope.transport.stopListener($scope.testStep.id, sutInitiator).then(function (response) {
                $scope.logger.log("Listener stopped.");
                $scope.transport.logs[$scope.testStep.id] = $scope.logger.content;
            }, function (error) {
            });
        };

        $scope.startListener = function () {
            var nextStep = $scope.findNextStep($scope.testStep.position);
            if (nextStep != null) {
                var rspMessageId = nextStep.testContext.message.id;
                $scope.configCollapsed = false;
                $scope.logger.clear();
                $scope.counter = 0;
                $scope.connecting = true;
                $scope.error = null;
                $scope.warning = null;
                $scope.logger.log("Starting listener. Please wait...");
                var sutInitiator = IsolatedSystem.transport.config.sutInitiator;
                $scope.transport.startListener($scope.testStep.id, rspMessageId, sutInitiator).then(function (started) {
                        if (started) {
                            $scope.logger.log("Listener started.");
                            var execute = function () {
                                ++$scope.counter;
                                $scope.logger.log("Waiting for Inbound Message....Elapsed time(second):" + $scope.counter + "s");
                                $scope.transport.searchTransaction($scope.testStep.id, sutInitiator, rspMessageId).then(function (transaction) {
                                    if (transaction != null) {
                                        var incoming = transaction.incoming;
                                        var outbound = transaction.outgoing;
                                        $scope.logger.log("Inbound message received <-------------------------------------- ");
                                        if (incoming != null && incoming != '') {
                                            try {
                                                var receivedMessage = parseRequest(incoming);
                                                $scope.log(receivedMessage);
                                                TestExecutionService.setExecutionMessage($scope.testStep, receivedMessage);
                                                $scope.$broadcast('isolated:loadEditorContent', receivedMessage);
                                            } catch (error) {
                                                $scope.error = errors[2];
                                                $scope.logger.log("Incorrect Inbound message type");
                                            }
                                        } else {
                                            $scope.logger.log("Incoming message received is empty");
                                        }
                                        $scope.logger.log("Outbound message sent --------------------------------------> ");
                                        if (outbound != null && outbound != '') {
                                            try {
                                                var sentMessage = parseResponse(outbound);
                                                $scope.log(sentMessage);
                                                $scope.setNextStepMessage(sentMessage);
                                            } catch (error) {
                                                $scope.error = errors[3];
                                                $scope.logger.log("Incorrect outgoing message type");
                                            }
                                        } else {
                                            $scope.logger.log("Outbound message sent is empty");
                                        }
                                        $scope.stopListener();
                                    } else if ($scope.counter >= $scope.counterMax) {
                                        $scope.warning = "We did not receive any incoming message after 30s. <p>Possible cause (1): You are using wrong credentials. Please check the credentials in your outbound message against those created for your system.</p>  <p>Possible cause (2):The endpoint address may be incorrect.   Verify that you are using the correct endpoint address that is displayed by the tool.</p>";
                                        $scope.stopListener();
                                    }
                                }, function (error) {
                                    $scope.error = error;
                                    $scope.log("Error: " + error);
                                    $scope.received = '';
                                    $scope.sent = '';
                                    $scope.stopListener();
                                });
                            };
                            TestExecutionClock.start(execute);
                        } else {
                            $scope.logger.log("Failed to start listener");
                            $scope.logger.log("Transaction stopped");
                            $scope.connecting = false;
                            $scope.error = "Failed to start the listener. Please contact the administrator for any question";
                            TestExecutionClock.stop();
                        }
                    }, function (error) {

                        $scope.connecting = false;
                        $scope.counter = $scope.counterMax;
                        $scope.error = "Failed to start the listener. Error: " + error;
                        $scope.logger.log($scope.error);
                        $scope.logger.log("Transaction stopped");
                        TestExecutionClock.stop();
                    }
                );
            }
        };


        $scope.downloadJurorDoc = function (jurorDocId, title) {
            var content = $("#" + jurorDocId).html();
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
                nam.name = "type";
                nam.value = title;
                form.style.display = 'none';
                form.appendChild(nam);

                document.body.appendChild(form);
                form.submit();
            }

        };


        $scope.downloadTestArtifact = function (path) {
            if ($scope.testCase != null) {
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

        $scope.downloadTestCaseReports = function () {
            if ($scope.testCase != null && $scope.format  != null) {
                 ReportService.downloadTestCaseReports($scope.testCase.id);
            }
        };

    }]);

angular.module('isolated')
    .controller('IsolatedSystemValidatorCtrl', ['$scope', '$http', 'IsolatedSystem', '$window', '$timeout', '$modal', 'NewValidationResult', '$rootScope', 'ServiceDelegator', 'TestExecutionService', 'StorageService', function ($scope, $http, IsolatedSystem, $window, $timeout, $modal, NewValidationResult, $rootScope, ServiceDelegator, TestExecutionService, StorageService) {
        $scope.isolated = IsolatedSystem;
        $scope.testStep = IsolatedSystem.testStep;
        $scope.message = IsolatedSystem.message;
        $scope.selectedMessage = {};
        $scope.loading = true;
        $scope.error = null;
        $scope.vError = null;
        $scope.vLoading = true;
        $scope.mError = null;
        $scope.mLoading = true;
        $scope.counter = 0;
        $scope.type = "isolated";
        $scope.loadRate = 4000;
        $scope.tokenPromise = null;
        $scope.editorInit = false;
        $scope.nodelay = false;
        $scope.resized = false;
        $scope.selectedItem = null;
        $scope.activeTab = 0;
        $scope.tError = null;
        $scope.tLoading = false;
        $scope.validationResults = {};

        $scope.hasContent = function () {
            return  $scope.isolated.message.content != '' && $scope.isolated.message.content != null;
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
                    data.url = 'api/message/upload';
                    var jqXHR = data.submit()
                        .success(function (result, textStatus, jqXHR) {
                            $scope.nodelay = true;
                            var tmp = angular.fromJson(result);
                            $scope.isolated.message.name = fileName;
                            $scope.isolated.editor.instance.doc.setValue(tmp.content);
                            $scope.mError = null;
                            $scope.execute();
                        })
                        .error(function (jqXHR, textStatus, errorThrown) {
                            $scope.isolated.message.name = fileName;
                            $scope.mError = 'Sorry, Cannot upload file: ' + fileName + ", Error: " + errorThrown;
                        })
                        .complete(function (result, textStatus, jqXHR) {

                        });
                });

            }
        });

        $scope.loadMessage = function () {
            if ($scope.testStep != null) {
                var testContext = $scope.testStep.testContext;
                if (testContext) {
                    var message = TestExecutionService.getExecutionMessage($scope.testStep);
                    message = message && message != null ? message : '';
                    $scope.nodelay = true;
                    $scope.isolated.editor.instance.doc.setValue(message);
                    $scope.execute();
                }
            }
        };

        $scope.loadExampleMessage = function () {
            if ($scope.testStep != null) {
                TestExecutionService.deleteValidationReport($scope.testStep);
                TestExecutionService.deleteMessageTree($scope.testStep);
                var testContext = $scope.testStep.testContext;
                if (testContext) {
                    var message = testContext.message && testContext.message != null ? testContext.message.content : '';
                    TestExecutionService.setExecutionMessage($scope.testStep, message);
                    $scope.nodelay = true;
                    $scope.selectedMessage = {'content': message};
                    $scope.isolated.editor.instance.doc.setValue(message);
                    $scope.execute();
                }
            }
        };

        $scope.setLoadRate = function (value) {
            $scope.loadRate = value;
        };

        $scope.initCodemirror = function () {
            $scope.editor = CodeMirror.fromTextArea(document.getElementById("isolated-textarea"), {
                lineNumbers: true,
                fixedGutter: true,
                theme: "elegant",
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
                    var coordinate = ServiceDelegator.getCursorService($scope.testStep.testContext.format).getCoordinate($scope.editor, $scope.isolated.tree);
                    coordinate.lineNumber = coordinate.line;
                    coordinate.startIndex = coordinate.startIndex + 1;
                    coordinate.endIndex = coordinate.endIndex + 1;
                    $scope.isolated.cursor.init(coordinate, true);
                    ServiceDelegator.getTreeService($scope.testStep.testContext.format).selectNodeByIndex($scope.isolated.tree.root, IsolatedSystem.cursor, IsolatedSystem.message.content);
                });
            });
        };

        $scope.validateMessage = function () {
            try {
                if ($scope.testStep != null) {
                    if ($scope.isolated.message.content !== '' && $scope.testStep.testContext != null) {
                        $scope.vLoading = true;
                        $scope.vError = null;
                        var validator = ServiceDelegator.getMessageValidator($scope.testStep.testContext.format).validate($scope.testStep.testContext.id, $scope.isolated.message.content, $scope.testStep.nav, "Based", [], "1223");
                        validator.then(function (mvResult) {
                            $scope.vLoading = false;
                            $scope.setValidationReport(mvResult);
                        }, function (error) {
                            $scope.vLoading = false;
                            $scope.vError = error;
                            $scope.setValidationReport(null);
                        });
                    } else {
                        $scope.setValidationReport(null);
                        $scope.vLoading = false;
                        $scope.vError = null;
                    }
                }
            } catch (error) {
                $scope.setValidationReport(null);
                $scope.vLoading = false;
                $scope.vError = null;
            }
        };

        $scope.setValidationReport = function (mvResult) {
            if ($scope.testStep != null) {
                if (mvResult != null) {
                    TestExecutionService.setExecutionStatus($scope.testStep, 'COMPLETE');
                }
                $scope.$broadcast('isolated:validationResultLoaded', mvResult, $scope.testStep.id);
            }
        };


//        $scope.setMessageTree = function (messageObject) {
//            if ($scope.testStep != null) {
//                $scope.buildMessageTree(messageObject);
//                var tree = messageObject && messageObject != null && messageObject.elements ? messageObject : undefined;
//                TestExecutionService.setMessageTree($scope.testStep, tree);
//            }
//        };

        $scope.setMessageTree = function (messageObject) {
            $scope.buildMessageTree(messageObject);
            var tree = messageObject && messageObject != null && messageObject.elements ? messageObject : undefined;
            TestExecutionService.setMessageTree($scope.testStep, tree);
        };


        $scope.buildMessageTree = function (messageObject) {
            if ($scope.testStep != null) {
                var elements = messageObject && messageObject != null && messageObject.elements ? messageObject.elements : [];
                if (typeof $scope.isolated.tree.root.build_all == 'function') {
                    $scope.isolated.tree.root.build_all(elements);
                }
                var delimeters = messageObject && messageObject != null && messageObject.delimeters ? messageObject.delimeters : [];
                ServiceDelegator.updateEditorMode($scope.editor, delimeters, $scope.testStep.testContext.format);
                ServiceDelegator.getEditorService($scope.testStep.testContext.format).setEditor($scope.editor);
                ServiceDelegator.getTreeService($scope.testStep.testContext.format).setEditor($scope.editor);
            }
        };

//        $scope.buildMessageTree = function (messageObject) {
//            if ($scope.testStep != null) {
//                var elements = messageObject && messageObject != null && messageObject.elements ? messageObject.elements : [];
//                if (typeof $scope.isolated.tree.root.build_all == 'function') {
//                    $scope.isolated.tree.root.build_all(elements);
//                }
//                var delimeters = messageObject && messageObject != null && messageObject.delimeters ? messageObject.delimeters : [];
//                ServiceDelegator.updateEditorMode($scope.editor, delimeters, $scope.testStep.testContext.format);
//                $scope.editorService.setEditor($scope.editor);
//                $scope.treeService.setEditor($scope.editor);
//            }
//        };

        $scope.clearMessage = function () {
            $scope.nodelay = true;
            $scope.mError = null;
            if ($scope.testStep != null) {
                TestExecutionService.deleteValidationReport($scope.testStep);
                TestExecutionService.deleteMessageTree($scope.testStep);
            }
            if ($scope.editor) {
                $scope.editor.doc.setValue('');
                $scope.execute();
            }
        };


        $scope.saveMessage = function () {
            $scope.isolated.message.download();
        };

        $scope.parseMessage = function () {
            try {
                if ($scope.testStep != null) {
                    if ($scope.isolated.message.content != '' && $scope.testStep.testContext != null) {
                        $scope.tLoading = true;
                        var parsed = ServiceDelegator.getMessageParser($scope.testStep.testContext.format).parse($scope.testStep.testContext.id, $scope.isolated.message.content);
                        parsed.then(function (value) {
                            $scope.tLoading = false;
                            $scope.setMessageTree(value);
                        }, function (error) {
                            $scope.tLoading = false;
                            $scope.tError = error;
                            $scope.setMessageTree([]);
                        });
                    } else {
                        $scope.setMessageTree([]);
                        $scope.tError = null;
                        $scope.tLoading = false;
                    }
                }
            } catch (error) {
                $scope.tLoading = false;
                $scope.tError = error;
            }
        };

        $scope.onNodeSelect = function (node) {
            ServiceDelegator.getTreeService($scope.testStep.testContext.format).getEndIndex(node, $scope.isolated.message.content);
            $scope.isolated.cursor.init(node.data, false);
            ServiceDelegator.getEditorService($scope.testStep.testContext.format).select($scope.editor, $scope.isolated.cursor);

        };

        $scope.execute = function () {
            if ($scope.tokenPromise) {
                $timeout.cancel($scope.tokenPromise);
                $scope.tokenPromise = undefined;
            }
            $scope.error = null;
            $scope.tError = null;
            $scope.mError = null;
            $scope.vError = null;
            $scope.isolated.message.content = $scope.editor.doc.getValue();
            StorageService.set(StorageService.ISOLATED_EDITOR_CONTENT_KEY, $scope.isolated.message.content);
            $scope.refreshEditor();
            if (!$scope.isTestCaseCompleted()) {
                TestExecutionService.setExecutionMessage($scope.testStep, $scope.isolated.message.content);
                TestExecutionService.deleteValidationReport($scope.testStep);
                TestExecutionService.deleteMessageTree($scope.testStep);
                $scope.validateMessage();
                $scope.parseMessage();
            } else {
                $scope.setValidationReport(TestExecutionService.getValidationReport($scope.testStep));
                $scope.setMessageTree(TestExecutionService.getMessageTree($scope.testStep));
            }
        };

        $scope.clear = function () {
            $scope.vLoading = false;
            $scope.tLoading = false;
            $scope.mLoading = false;
            $scope.error = null;
            $scope.tError = null;
            $scope.mError = null;
            $scope.vError = null;
            $scope.setValidationReport(null);
        };

        $scope.removeDuplicates = function () {
            $scope.vLoading = true;
            $scope.$broadcast('isolated:removeDuplicates');
        };


        $scope.initValidation = function () {
            $scope.vLoading = false;
            $scope.tLoading = false;
            $scope.mLoading = false;
            $scope.error = null;
            $scope.tError = null;
            $scope.mError = null;
            $scope.vError = null;
            $scope.initCodemirror();
            $scope.setValidationReport(null);

            $scope.$on('isolated:refreshEditor', function (event) {
                $scope.refreshEditor();
            });

            $scope.$on('isolated:clearEditor', function (event) {
                $scope.clearMessage();
            });

            $rootScope.$on('isolated:reportLoaded', function (event, report) {
                if ($scope.testStep != null) {
                    TestExecutionService.setValidationReport($scope.testStep, report);
                }
            });

            $scope.$on('isolated:testStepLoaded', function (event, testStep) {
                $scope.clear();
                $scope.testStep = testStep;
                if ($scope.testStep.testContext != null) {
                    $scope.isolated.editor = ServiceDelegator.getEditor($scope.testStep.testContext.format);
                    $scope.isolated.editor.instance = $scope.editor;
                    $scope.isolated.cursor = ServiceDelegator.getCursor($scope.testStep.testContext.format);
                    var content = null;
                    if (!$scope.isTestCase()) {
                        $scope.nodelay = false;
                        content = StorageService.get(StorageService.ISOLATED_EDITOR_CONTENT_KEY) == null ? '' : StorageService.get(StorageService.ISOLATED_EDITOR_CONTENT_KEY);
                    } else {
                        $scope.nodelay = true;
                        content = TestExecutionService.getExecutionMessage($scope.testStep);
                        content = content && content != null ? content : '';
                    }
                    if ($scope.editor) {
                        $scope.editor.doc.setValue(content);
                        $scope.execute();
                    }
                }
            });


            $scope.$on('isolated:removeTestStep', function (event, testStep) {
                $scope.testStep = null;
            });

            $scope.$on('isolated:loadEditorContent', function (event, message) {
                $scope.nodelay = true;
                var content = message == null ? '' : message;
                $scope.editor.doc.setValue(content);
                $scope.isolated.message.id = null;
                $scope.isolated.message.name = '';
                $scope.execute();
            });

            $rootScope.$on('isolated:duplicatesRemoved', function (event, report) {
                $scope.vLoading = false;
            });


        };

    }]);


angular.module('isolated')
    .controller('IsolatedSystemReportCtrl', ['$scope', '$sce', '$http', 'IsolatedSystem', function ($scope, $sce, $http, IsolatedSystem) {
        $scope.isolated = IsolatedSystem;
    }]);

angular.module('isolated')
    .controller('IsolatedSystemVocabularyCtrl', ['$scope', 'IsolatedSystem', function ($scope, IsolatedSystem) {
        $scope.isolated = IsolatedSystem;
    }]);


angular.module('isolated')
    .controller('IsolatedSystemProfileViewerCtrl', ['$scope', 'IsolatedSystem', function ($scope, IsolatedSystem) {
        $scope.isolated = IsolatedSystem;
    }]);