'use strict';

angular.module('cb')
    .controller('CBTestingCtrl', ['$scope', '$window', '$rootScope', 'CB', 'StorageService', '$timeout', 'TestCaseService', 'TestStepService', '$routeParams', 'userInfoService', function ($scope, $window, $rootScope, CB, StorageService, $timeout, TestCaseService, TestStepService, $routeParams, userInfoService) {

        $scope.testCase = null;
        $scope.token = $routeParams.x;
        $scope.domain = $routeParams.d;

        $scope.initTesting = function () {

            if ($routeParams.scope !== undefined && $routeParams.group !== undefined) {

                StorageService.set(StorageService.CB_SELECTED_TESTPLAN_ID_KEY, $routeParams.group);
                StorageService.set(StorageService.CB_SELECTED_TESTPLAN_SCOPE_KEY, $routeParams.scope);
                $scope.setSubActive("/cb_testcase", $routeParams.scope, $routeParams.group);

            } else {
                var tab = StorageService.get(StorageService.ACTIVE_SUB_TAB_KEY);
                if (tab == null || (tab !== '/cb_execution' && tab !== '/cb_management')) tab = '/cb_testcase';
                $scope.setSubActive(tab);
            }


            $scope.$on('cb:testCaseLoaded', function (event, testCase, tab) {
                $scope.testCase = testCase;
            });
//            $scope.$on("$destroy", function () {
//                var previousId = StorageService.get(StorageService.CB_LOADED_TESTCASE_ID_KEY);
//                if (previousId != null)TestCaseService.clearRecords(previousId);
//                previousId = StorageService.get(StorageService.CB_LOADED_TESTSTEP_ID_KEY);
//                if (previousId != null)TestStepService.clearRecords(previousId);
//            });

        };


        $scope.setSubActive = function (tab, scope, group) {
            $rootScope.setSubActive(tab);
            if (tab === '/cb_execution') {
                $scope.$broadcast('cb:refreshEditor');
            } else if (tab === '/cb_testcase') {
                if (scope !== undefined && group !== undefined) {
                    $scope.$broadcast('event:cb:initTestCase', {scope: scope, group: group});
                } else {
                    $scope.$broadcast('event:cb:initTestCase');
                }
            } else if (tab === '/cb_management') {
                $scope.$broadcast('event:cb:initManagement');
            }
        };


    }]);


angular.module('cb')
    .controller('CBExecutionCtrl', ['$scope', '$window', '$rootScope', 'CB', '$modal', 'TestExecutionClock', 'Endpoint', 'TestExecutionService', '$timeout', 'StorageService', 'User', 'ReportService', 'TestCaseDetailsService', '$compile', 'Transport', '$filter', 'SOAPEscaper', function ($scope, $window, $rootScope, CB, $modal, TestExecutionClock, Endpoint, TestExecutionService, $timeout, StorageService, User, ReportService, TestCaseDetailsService, $compile, Transport, $filter, SOAPEscaper) {
        $scope.targ = "cb-executed-test-step";
        $scope.loading = false;
        $scope.error = null;
        $scope.tabs = new Array();
        $scope.testCase = null;
        $scope.testStep = null;
        $scope.logger = CB.logger;
        $scope.connecting = false;
        $scope.transport = Transport;
        $scope.endpoint = null;
        $scope.hidePwd = true;
        $scope.sent = null;
        $scope.received = null;
        $scope.configCollapsed = true;
        $scope.counterMax = $scope.transport.getTimeout();
        $scope.counter = 0;
        $scope.listenerReady = false;
        $scope.testStepListCollapsed = false;
        $scope.warning = null;
        $scope.sutInititiatorForm = '';
        $scope.taInititiatorForm = '';
        $scope.user = User;
        $scope.domain = null;
        $scope.protocol = StorageService.get(StorageService.TRANSPORT_PROTOCOL) != null && StorageService.get(StorageService.TRANSPORT_PROTOCOL) != undefined ? StorageService.get(StorageService.TRANSPORT_PROTOCOL) : null;
        $scope.exampleMessageEditor = null;
        $scope.testExecutionService = TestExecutionService;
        $scope.loadingExecution = false;

        $scope.initExecution = function () {
            $scope.$on('cb:testCaseLoaded', function (event, testCase, tab) {
                $scope.executeTestCase(testCase, tab);
            });
        };

        var errors = [
            "Incorrect message Received. Please check the log for more details",
            "No Outbound message found",
            "Invalid message Received. Please see console for more details.",
            "Invalid message Sent. Please see console for more details."
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


        $scope.setTestStepExecutionTab = function (value) {
            $scope.tabs[0] = false;
            $scope.tabs[1] = false;
            $scope.tabs[2] = false;
            $scope.tabs[3] = false;
            $scope.tabs[4] = false;
            $scope.tabs[5] = false;
            $scope.tabs[6] = false;
            $scope.tabs[7] = false;
            $scope.tabs[8] = false;
            $scope.tabs[9] = false;
            $scope.activeTab = value;
            $scope.tabs[$scope.activeTab] = true;

            if ($scope.activeTab === 5) {
                $scope.buildExampleMessageEditor();
            } else if ($scope.activeTab === 6) {
                $scope.loadArtifactHtml('jurorDocument');
            } else if ($scope.activeTab === 7) {
                $scope.loadArtifactHtml('messageContent');
            } else if ($scope.activeTab === 8) {
                $scope.loadArtifactHtml('testDataSpecification');
            } else if ($scope.activeTab === 9) {
                $scope.loadArtifactHtml('testStory');
            }
        };


        $scope.getTestType = function () {
            return CB.testCase.type;
        };

        $scope.disabled = function () {
            return CB.testCase == null || CB.testCase.id === null;
        };


        $scope.getTestType = function () {
            return $scope.testCase != null ? $scope.testCase.type : '';
        };

        $scope.loadTestStepDetails = function (testStep) {
            var tsId = $scope.targ + '-testStory';
            var jDocId = $scope.targ + '-jurorDocument';
            var mcId = $scope.targ + '-messageContent';
            var tdsId = $scope.targ + '-testDataSpecification';
            TestCaseDetailsService.removeHtml(tdsId);
            TestCaseDetailsService.removeHtml(mcId);
            TestCaseDetailsService.removeHtml(jDocId);
            TestCaseDetailsService.removeHtml(tsId);

            $scope.$broadcast(tsId, testStep['testStory'], testStep.name + "-TestStory");
            $scope.$broadcast(jDocId, testStep['jurorDocument'], testStep.name + "-JurorDocument");
            $scope.$broadcast(mcId, testStep['messageContent'], testStep.name + "-MessageContent");
            $scope.$broadcast(tdsId, testStep['testDataSpecification'], testStep.name + "-TestDataSpecification");
            if ($scope.isManualStep(testStep)) {
                $scope.setTestStepExecutionTab(1); // show report tab content
            }
        };

        $scope.loadTestStepExecutionPanel = function (testStep) {

            $scope.exampleMessageEditor = null;
            $scope.detailsError = null;
            var testContext = testStep['testContext'];
            if (testContext && testContext != null) {
                $scope.setTestStepExecutionTab(0);
                $scope.$broadcast('cb:testStepLoaded', testStep);
                $scope.$broadcast('cb:profileLoaded', testContext.profile);
                $scope.$broadcast('cb:valueSetLibraryLoaded', testContext.vocabularyLibrary);
                TestCaseDetailsService.removeHtml($scope.targ + '-exampleMessage');
                var exampleMessage = testContext.message && testContext.message.content && testContext.message.content != null ? testContext.message.content : null;
                if (exampleMessage != null) {
                    $scope.$broadcast($scope.targ + '-exampleMessage', exampleMessage, testContext.format, testStep.name);
                }
            } else { // manual testing ?
                $scope.setTestStepExecutionTab(1);
                var result = TestExecutionService.getTestStepValidationReport(testStep);
                $rootScope.$emit('cbManual:updateTestStepValidationReport', result != undefined && result != null ? result.reportId : null, testStep);
            }

            var exampleMsgId = $scope.targ + '-exampleMessage';
            TestCaseDetailsService.details("TestStep", testStep.id).then(function (result) {
                testStep['testStory'] = result['testStory'];
                testStep['jurorDocument'] = result['jurorDocument'];
                testStep['testDataSpecification'] = result['testDataSpecification'];
                testStep['messageContent'] = result['messageContent'];
                $scope.loadTestStepDetails(testStep);
                $scope.detailsError = null;
            }, function (error) {
                testStep['testStory'] = null;
                testStep['testPackage'] = null;
                testStep['jurorDocument'] = null;
                testStep['testDataSpecification'] = null;
                testStep['messageContent'] = null;
                $scope.loadTestStepDetails(testStep);
                $scope.detailsError = "Sorry, could not load the test step details. Please try again";
            });
        };

        $scope.buildExampleMessageEditor = function () {
            var eId = $scope.targ + '-exampleMessage';
            if ($scope.exampleMessageEditor === null || !$scope.exampleMessageEditor) {
                $timeout(function () {
                    $scope.exampleMessageEditor = TestCaseDetailsService.buildExampleMessageEditor(eId, $scope.testStep.testContext.message.content, $scope.exampleMessageEditor, $scope.testStep.testContext && $scope.testStep.testContext != null ? $scope.testStep.testContext.format : null);
                }, 100);
            }
            $timeout(function () {
                if ($("#" + eId)) {
                    $("#" + eId).scrollLeft();
                }
            }, 1000);
        };

        $scope.loadArtifactHtml = function (key) {
            if ($scope.testStep != null) {
                var element = TestCaseDetailsService.loadArtifactHtml($scope.targ + "-" + key, $scope.testStep[key]);
                if (element && element != null) {
                    $compile(element.contents())($scope);
                }
            }
        };

        $scope.resetTestCase = function () {
            if ($scope.testCase != null) {
                $scope.loadingExecution = true;
                $scope.error = null;
                TestExecutionService.clear($scope.testCase.id).then(function (res) {
                    $scope.loadingExecution = false;
                    $scope.error = null;
                    if (CB.editor != null && CB.editor.instance != null) {
                        CB.editor.instance.setOption("readOnly", false);
                    }
                    StorageService.remove(StorageService.CB_LOADED_TESTSTEP_TYPE_KEY);
                    StorageService.remove(StorageService.CB_LOADED_TESTSTEP_ID_KEY);
                    $scope.executeTestCase($scope.testCase);
                }, function (error) {
                    $scope.loadingExecution = false;
                    $scope.error = null;
                });
            }
        };


        $scope.selectProtocol = function (testStep) {
            if (testStep != null) {
                $scope.protocol = testStep.protocol;
                StorageService.set(StorageService.TRANSPORT_PROTOCOL, $scope.protocol);
            }
        };

        $scope.selectTestStep = function (testStep) {
            CB.testStep = testStep;
            $scope.testStep = testStep;
            if (testStep != null) {
                StorageService.set(StorageService.CB_LOADED_TESTSTEP_TYPE_KEY, $scope.testStep.type);
                StorageService.set(StorageService.CB_LOADED_TESTSTEP_ID_KEY, $scope.testStep.id);
                if (!$scope.isManualStep(testStep)) {
                    if ($scope.testExecutionService.getTestStepExecutionMessage(testStep) === undefined && testStep['testingType'] === 'TA_INITIATOR') {
                        if (!$scope.transport.disabled && $scope.domain != null && $scope.protocol != null) {
                            var populateMessage = $scope.transport.populateMessage(testStep.id, testStep.testContext.message.content, $scope.domain, $scope.protocol);
                            populateMessage.then(function (response) {
                                $scope.testExecutionService.setTestStepExecutionMessage(testStep, response.outgoingMessage);
                                $scope.loadTestStepExecutionPanel(testStep);
                            }, function (error) {
                                $scope.testExecutionService.setTestStepExecutionMessage(testStep, testStep.testContext.message.content);
                                $scope.loadTestStepExecutionPanel(testStep);
                            });
                        } else {
                            var con = $scope.testExecutionService.getTestStepExecutionMessage(testStep);
                            con = con != null && con != undefined ? con : testStep.testContext.message.content;
                            $scope.testExecutionService.setTestStepExecutionMessage(testStep, con);
                            $scope.loadTestStepExecutionPanel(testStep);
                        }
                    } else if ($scope.testExecutionService.getTestStepExecutionMessage(testStep) === undefined && testStep['testingType'] === 'TA_RESPONDER' && $scope.transport.disabled) {
                        $scope.testExecutionService.setTestStepExecutionMessage(testStep, testStep.testContext.message.content);
                        $scope.loadTestStepExecutionPanel(testStep);
                    } else {
                        $scope.loadTestStepExecutionPanel(testStep);
                    }
                } else {
                    $scope.loadTestStepExecutionPanel(testStep);
                }
            }
        };

        $scope.viewTestStepResult = function (testStep) {
            CB.testStep = testStep;
            $scope.testStep = testStep;
            if (testStep != null) {
                StorageService.set(StorageService.CB_LOADED_TESTSTEP_TYPE_KEY, $scope.testStep.type);
                StorageService.set(StorageService.CB_LOADED_TESTSTEP_ID_KEY, $scope.testStep.id);
                $scope.loadTestStepExecutionPanel(testStep);
            }
        };


        $scope.clearTestStep = function () {
            CB.testStep = null;
            $scope.testStep = null;
            $scope.$broadcast('cb:removeTestStep');
        };


        $scope.getTestStepExecutionStatus = function (testStep) {
            return $scope.testExecutionService.getTestStepExecutionStatus(testStep);
        };

        $scope.getTestStepValidationResult = function (testStep) {
            return $scope.testExecutionService.getTestStepValidationResult(testStep);
        };

        $scope.getTestStepValidationReport = function (testStep) {
            return $scope.testExecutionService.getTestStepValidationReport(testStep);
        };

        $scope.getManualValidationStatusTitle = function (testStep) {
            return $scope.testExecutionService.getManualValidationStatusTitle(testStep);
        };

        $scope.isManualStep = function (testStep) {
            return testStep != null && (testStep['testingType'] === 'TA_MANUAL' || testStep['testingType'] === 'SUT_MANUAL');
        };

        $scope.isSutInitiator = function (testStep) {
            return testStep['testingType'] == 'SUT_INITIATOR';
        };

        $scope.isTaInitiator = function (testStep) {
            return testStep['testingType'] == 'TA_INITIATOR';
        };

        $scope.isTestStepCompleted = function (testStep) {
            return $scope.testExecutionService.getTestStepExecutionStatus(testStep) === 'COMPLETE';
        };

        $scope.completeStep = function (row) {
            $scope.testExecutionService.setTestStepExecutionStatus(row, 'COMPLETE');
        };

        $scope.completeManualStep = function (row) {
            $scope.completeStep(row);
        };

        $scope.progressStep = function (row) {
            $scope.testExecutionService.setTestStepExecutionStatus(row, 'IN_PROGRESS');
        };


        $scope.goNext = function (row) {
            if (row != null && row) {
                if (!$scope.isLastStep(row)) {
                    $scope.executeTestStep($scope.findNextStep(row.position));
                } else {
                    $scope.completeTestCase();
                }
            }
        };

        $scope.goBack = function (row) {
            if (row != null && row) {
                if (!$scope.isFirstStep(row)) {
                    $scope.executeTestStep($scope.findPreviousStep(row.position));
                }
            }
        };

        $scope.executeTestStep = function (testStep) {
            if (testStep != null && testStep != undefined) {
                $scope.testExecutionService.testStepCommentsChanged[testStep.id] = false;
                TestExecutionService.setTestStepValidationReport(testStep, null);
                CB.testStep = testStep;
                $scope.warning = null;
                if ($scope.isManualStep(testStep) || testStep.testingType === 'TA_RESPONDER') {
                    $scope.completeStep(testStep);
                }
                testStep.protocol = null;
                $scope.protocol = null;
                if (testStep.protocols != null && testStep.protocols && testStep.protocols.length > 0) {
                    var protocol = StorageService.get(StorageService.TRANSPORT_PROTOCOL) != null && StorageService.get(StorageService.TRANSPORT_PROTOCOL) != undefined ? StorageService.get(StorageService.TRANSPORT_PROTOCOL) : null;
                    protocol = protocol != null && testStep.protocols.indexOf(protocol) > 0 ? protocol : null;
                    protocol = protocol != null ? protocol : $scope.getDefaultProtocol(testStep);
                    testStep['protocol'] = protocol;
                    $scope.selectProtocol(testStep);
                }
                var log = $scope.transport.logs[testStep.id];
                $scope.logger.content = log && log != null ? log : '';
                $scope.selectTestStep(testStep);

                // }, function (error) {
                //   $scope.error = "Failed to load the test step, please try again.";
                // });
            }
        };

        $scope.getDefaultProtocol = function (testStep) {
            if (testStep.protocols != null && testStep.protocols && testStep.protocols.length > 0) {
                testStep.protocols = $filter('orderBy')(testStep.protocols, 'position');
                for (var i = 0; i < testStep.protocols.length; i++) {
                    if (testStep.protocols[i]['defaut'] != undefined && testStep.protocols[i]['defaut'] === true) {
                        return testStep.protocols[i].value;
                    }
                }
                return testStep.protocols[0].value;
            }
            return null;
        };


        $scope.completeTestCase = function () {
            StorageService.remove(StorageService.CB_LOADED_TESTSTEP_ID_KEY);
            $scope.testExecutionService.setTestCaseExecutionStatus($scope.testCase, 'COMPLETE');
            if (CB.editor.instance != null) {
                CB.editor.instance.setOption("readOnly", true);
            }
            TestExecutionService.setTestCaseValidationResultFromTestSteps($scope.testCase);
            $scope.clearTestStep();
            $scope.selectTestStep(null);
        };

        $scope.isTestCaseCompleted = function () {
            return $scope.testExecutionService.getTestCaseExecutionStatus($scope.testCase) === 'COMPLETE';
        };

        $scope.shouldNextStep = function (row) {
            return $scope.testStep != null && $scope.testStep === row && !$scope.isTestCaseCompleted() && !$scope.isLastStep(row) && $scope.isTestStepCompleted(row);
        };

        $scope.isLastStep = function (row) {
            return row && row != null && $scope.testCase != null && $scope.testCase.children.length === row.position;
        };

        $scope.isFirstStep = function (row) {
            return row && row != null && $scope.testCase != null && row.position === 1;
        };


        $scope.isTestCaseSuccessful = function () {
            var status = $scope.testExecutionService.getTestCaseValidationResult($scope.testCase);
            return status === 'PASSED';
        };

        $scope.isTestStepValidated = function (testStep) {
            return $scope.testExecutionService.getTestStepValidationResult(testStep) != undefined;
        };

        $scope.isTestStepSuccessful = function (testStep) {
            var status = $scope.testExecutionService.getTestStepValidationResult(testStep);
            return status == 'PASSED' || 'PASSED_NOTABLE_EXCEPTION' ? true : false;
        };

        $scope.findNextStep = function (position) {
            var nextStep = null;
            for (var i = 0; i < $scope.testCase.children.length; i++) {
                if ($scope.testCase.children[i].position === position + 1) {
                    return $scope.testCase.children[i];
                }
            }
            return null;
        };

        $scope.findPreviousStep = function (position) {
            var nextStep = null;
            for (var i = 0; i < $scope.testCase.children.length; i++) {
                if ($scope.testCase.children[i].position === position - 1) {
                    return $scope.testCase.children[i];
                }
            }
            return null;
        };


        $scope.clearExecution = function () {
            if (CB.editor != null && CB.editor.instance != null) {
                CB.editor.instance.setOption("readOnly", false);
            }
            $scope.loadingExecution = true;
            $scope.error = null;
            TestExecutionService.clear($scope.testCase).then(function (res) {
                $scope.loadingExecution = false;
                $scope.error = null;
            }, function (error) {
                $scope.loadingExecution = false;
                $scope.error = null;
            });
        };

        $scope.setNextStepMessage = function (message) {
            var nextStep = $scope.findNextStep($scope.testStep.position);
            if (nextStep != null && !$scope.isManualStep(nextStep)) {
                $scope.completeStep(nextStep);
                $scope.testExecutionService.setTestStepExecutionMessage(nextStep, message);
            }
        };

        $scope.log = function (log) {
            $scope.logger.log(log);
        };

        $scope.isValidConfig = function () {
            //return $scope.transport.config != null && $scope.transport.config != '';
        };

        $scope.outboundMessage = function () {
            return $scope.testStep != null ? $scope.testStep.testContext.message.content : null;
        };

        $scope.hasUserContent = function () {
            return CB.editor && CB.editor != null && CB.editor.instance.doc.getValue() != null && CB.editor.instance.doc.getValue() != "";
        };


        $scope.hasRequestContent = function () {
            return $scope.outboundMessage() != null && $scope.outboundMessage() != '';
        };

        $scope.saveTransportLog = function () {
            $timeout(function () {
                $scope.transport.saveTransportLog($scope.testStep.id, $scope.logger.content, $scope.domain, $scope.protocol);
            });
        };

        $scope.send = function () {
            $scope.connecting = true;
            $scope.openConsole($scope.testStep);
            $scope.logger.clear();
            $scope.progressStep($scope.testStep);
            $scope.error = null;
            if ($scope.hasUserContent()) {
                $scope.received = '';
                $scope.logger.log("Sending outbound Message. Please wait...");
                $scope.transport.send($scope.testStep.id, CB.editor.instance.doc.getValue(), $scope.domain, $scope.protocol).then(function (response) {
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
                                var nextStep = $scope.findNextStep($scope.testStep.position);
                                if (nextStep != null && nextStep.testingType === 'SUT_RESPONDER') {
                                    $scope.setNextStepMessage(rspMessage);
                                }
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
                    $scope.connecting = false;
                    $scope.transport.logs[$scope.testStep.id] = $scope.logger.content;
                    $scope.logger.log("Transaction completed");
                    $scope.saveTransportLog();
                }, function (error) {
                    $scope.connecting = false;
                    $scope.error = error.data;
                    $scope.logger.log("Error: " + error.data);
                    $scope.received = '';
                    $scope.completeStep($scope.testStep);
                    $scope.transport.logs[$scope.testStep.id] = $scope.logger.content;
                    $scope.logger.log("Transaction stopped");
                    $scope.saveTransportLog();
                });
            } else {
                $scope.error = "No message to send";
                $scope.connecting = false;
                $scope.transport.logs[$scope.testStep.id] = $scope.logger.content;
                $scope.logger.log("Transaction completed");
                $scope.saveTransportLog();

            }
        };


        $scope.viewConsole = function (testStep) {
            if ($scope.consoleDlg && $scope.consoleDlg !== null && $scope.consoleDlg.opened) {
                $scope.consoleDlg.dismiss('cancel');
            }
            $scope.consoleDlg = $modal.open({
                templateUrl: 'PastTestStepConsole.html',
                controller: 'PastTestStepConsoleCtrl',
                windowClass: 'console-modal',
                size: 'sm',
                animation: true,
                keyboard: true,
                backdrop: true,
                resolve: {
                    log: function () {
                        return $scope.transport.logs[testStep.id];
                    },
                    title: function () {
                        return testStep.name;
                    }
                }
            });
        };


        $scope.openConsole = function (testStep) {
            if ($scope.consoleDlg && $scope.consoleDlg !== null && $scope.consoleDlg.opened) {
                $scope.consoleDlg.dismiss('cancel');
            }
            $scope.consoleDlg = $modal.open({
                templateUrl: 'CurrentTestStepConsole.html',
                controller: 'CurrentTestStepConsoleCtrl',
                windowClass: 'console-modal',
                size: 'lg',
                animation: true,
                keyboard: true,
                backdrop: true,
                resolve: {
                    logger: function () {
                        return $scope.logger;
                    },
                    title: function () {
                        return testStep.name;
                    }
                }
            });
        };


        $scope.stopListener = function () {
            $scope.connecting = false;
            $scope.counter = $scope.counterMax;
            TestExecutionClock.stop();
            $scope.logger.log("Stopping listener. Please wait....");
            $scope.transport.stopListener($scope.testStep.id, $scope.domain, $scope.protocol).then(function (response) {
                $scope.logger.log("Listener stopped.");
                $scope.transport.logs[$scope.testStep.id] = $scope.logger.content;
                $scope.saveTransportLog();
            }, function (error) {
                $scope.saveTransportLog();
            });
        };

        $scope.updateTestStepValidationReport = function (testStep) {
            StorageService.set("testStepValidationResults", angular.toJson(TestExecutionService.testStepValidationResults));
            StorageService.set("testStepComments", angular.toJson(TestExecutionService.testStepComments));
            if ($scope.testStep === null || testStep.id !== $scope.testStep.id) {
                TestExecutionService.updateTestStepValidationReport(testStep);
            } else {
                var reportType = testStep.testContext && testStep.testContext != null ? 'cbValidation' : 'cbManual';
                var result = TestExecutionService.getTestStepValidationReport(testStep);
                $rootScope.$emit(reportType + ':updateTestStepValidationReport', result && result != null ? result : null, testStep);
            }
        };

        $scope.abortListening = function () {
            $scope.testExecutionService.deleteTestStepExecutionStatus($scope.testStep);
            $scope.stopListener();
        };

        $scope.completeListening = function () {
            $scope.completeStep($scope.testStep);
            $scope.stopListener();
        };


        $scope.setTimeout = function (value) {
            $scope.transport.setTimeout(value);
            $scope.counterMax = value;
        };

        $scope.startListener = function () {
            $scope.openConsole($scope.testStep);
            var nextStep = $scope.findNextStep($scope.testStep.position);
            if (nextStep != null) {
                var rspMessageId = nextStep.testContext.message.id;
                $scope.configCollapsed = false;
                $scope.logger.clear();
                $scope.counter = 0;
                $scope.connecting = true;
                $scope.error = null;
                $scope.warning = null;
                $scope.progressStep($scope.testStep);
                $scope.logger.log("Starting listener. Please wait...");
                $scope.transport.startListener($scope.testStep.id, rspMessageId, $scope.domain, $scope.protocol).then(function (started) {
                        if (started) {
                            $scope.logger.log("Listener started.");
                            var execute = function () {
                                var remaining = parseInt($scope.counterMax) - parseInt($scope.counter);
                                if (remaining % 20 === 0) {
                                    $scope.logger.log("Waiting for Inbound Message....Remaining time:" + (remaining) + "s");
                                }
                                ++$scope.counter;
                                var sutInitiator = null;
                                try {
                                    sutInitiator = $scope.transport.configs[$scope.protocol].data.sutInitiator;
                                } catch (e) {
                                    sutInitiator = null;
                                }
                                $scope.transport.searchTransaction($scope.testStep.id, sutInitiator, rspMessageId, $scope.domain, $scope.protocol).then(function (transaction) {
                                    if (transaction != null) {
                                        var incoming = transaction.incoming;
                                        var outbound = transaction.outgoing;
                                        $scope.logger.log("Inbound message received <-------------------------------------- ");
                                        if (incoming != null && incoming != '') {
                                            try {
                                                var receivedMessage = parseRequest(incoming);
                                                $scope.log(receivedMessage);
                                                $scope.testExecutionService.setTestStepExecutionMessage($scope.testStep, receivedMessage);
                                                $scope.$broadcast('cb:loadEditorContent', receivedMessage);
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
                                                var nextStep = $scope.findNextStep($scope.testStep.position);
                                                if (nextStep != null && nextStep.testingType === 'TA_RESPONDER') {
                                                    $scope.setNextStepMessage(sentMessage);
                                                }
                                            } catch (error) {
                                                $scope.error = errors[3];
                                                $scope.logger.log("Incorrect outgoing message type");
                                            }
                                        } else {
                                            $scope.logger.log("Outbound message sent is empty");
                                        }
                                        $scope.completeListening();
                                    } else if ($scope.counter >= $scope.counterMax) {
                                        $scope.warning = "We did not receive any incoming message after 2 min. <p>Possible cause (1): You are using wrong credentials. Please check the credentials in your outbound message against those created for your system.</p>  <p>Possible cause (2):The endpoint address may be incorrect.   Verify that you are using the correct endpoint address that is displayed by the tool.</p>";
                                        $scope.abortListening();
                                    }
                                }, function (error) {
                                    $scope.error = error;
                                    $scope.log("Error: " + error);
                                    $scope.received = '';
                                    $scope.sent = '';
                                    $scope.abortListening();
                                });
                            };

                            TestExecutionClock.start(execute);

                        } else {
                            $scope.logger.log("Failed to start listener");
                            $scope.logger.log("Transaction stopped");
                            $scope.connecting = false;
                            $scope.error = "Failed to start the listener. Please contact the administrator.";
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
                form.action = 'api/artifact/generateJurorDoc/pdf';
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
                form.action = "api/artifact/download";
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

        $scope.executeTestCase = function (testCase, tab) {
            if (testCase != null) {
                $scope.loading = true;
                TestExecutionService.init();
                CB.testStep = null;
                $scope.testStep = null;
                $scope.setTestStepExecutionTab(0);
                tab = tab && tab != null ? tab : '/cb_execution';
                $rootScope.setSubActive(tab);
                if (tab === '/cb_execution') {
                    $scope.$broadcast('cb:refreshEditor');
                }
                $scope.logger.clear();
                $scope.error = null;
                $scope.warning = null;
                $scope.connecting = false;
                $scope.domain = testCase.domain;
                CB.testCase = testCase;
                $scope.transport.logs = {};
                $scope.transport.transactions = [];
                $scope.testCase = testCase;
                TestExecutionClock.stop();
                if (CB.editor != null && CB.editor.instance != null) {
                    CB.editor.instance.setOption("readOnly", false);
                }
                if (testCase.type === 'TestCase') {
                    var testStepId = StorageService.get(StorageService.CB_LOADED_TESTSTEP_ID_KEY);
                    var testStep = $scope.findTestStepById(testStepId);
                    testStep = testStep != null ? testStep : $scope.testCase.children[0];
                    $scope.executeTestStep(testStep);
                } else if (testCase.type === 'TestStep') {
                    $scope.executeTestStep(testCase);
                }
                $scope.loading = false;
            }
        };

        $scope.findTestStepById = function (testStepId) {
            if (testStepId != null && testStepId != undefined) {
                for (var i = 0; i < $scope.testCase.children.length; i++) {
                    if ($scope.testCase.children[i].id === testStepId) {
                        return $scope.testCase.children[i];
                    }
                }
            }
            return null;
        };

        $scope.exportAs = function (format) {
            if ($scope.testCase != null) {
                var result = TestExecutionService.getTestCaseValidationResult($scope.testCase);
                result = result != undefined ? result : null;
                var comments = TestExecutionService.getTestCaseComments($scope.testCase);
                comments = comments != undefined ? comments : null;
                ReportService.downloadTestCaseReports($scope.testCase.id, format, result, comments, $scope.testCase.nav['testPlan'], $scope.testCase.nav['testGroup']);
            }
        };


        $scope.downloadReportAs = function (format, testStep) {
            var reportId = $scope.getTestStepValidationReport(testStep);
            if (reportId != null && reportId != undefined) {
                return ReportService.downloadTestStepValidationReport(reportId, format);
            }
        };


        $scope.toggleTransport = function (disabled) {
            $scope.transport.disabled = disabled;
            StorageService.set(StorageService.TRANSPORT_DISABLED, disabled);
            if (CB.editor.instance != null) {
                CB.editor.instance.setOption("readOnly", !disabled);
            }
        };

        $scope.editTestStepComment = function (testStep) {
            if (!$scope.testExecutionService.testStepComments[testStep.id]) {
                $scope.testExecutionService.testStepComments[testStep.id] = '';
            }
            $scope.testExecutionService.testStepCommentsChanged[testStep.id] = true;
            $scope.testExecutionService.testStepCommentsChanges[testStep.id] = $scope.testExecutionService.testStepComments[testStep.id];
        };

        $scope.deleteTestStepComment = function (testStep) {
            $scope.testExecutionService.testStepComments[testStep.id] = null;
            $scope.testExecutionService.testStepCommentsChanges[testStep.id] = null;
            $scope.testExecutionService.testStepCommentsChanged[testStep.id] = false;
            $scope.saveTestStepComment(testStep);
        };
        ;

        $scope.resetTestStepComment = function (testStep) {
            $scope.testExecutionService.testStepCommentsChanged[testStep.id] = false;
            $scope.testExecutionService.testStepCommentsChanges[testStep.id] = null;
        };


        $scope.saveTestStepComment = function (testStep) {
            $scope.testExecutionService.testStepCommentsChanged[testStep.id] = false;
            $scope.testExecutionService.testStepComments[testStep.id] = $scope.testExecutionService.testStepCommentsChanges[testStep.id];
            $scope.updateTestStepValidationReport(testStep);
            $scope.testExecutionService.testStepCommentsChanges[testStep.id] = null;
        };


        $scope.editTestCaseComment = function (testCase) {
            if (!$scope.testExecutionService.testCaseComments[testCase.id]) {
                $scope.testExecutionService.testCaseComments[testCase.id] = '';
            }
            $scope.testExecutionService.testCaseCommentsChanged[testCase.id] = true;
            $scope.testExecutionService.testCaseCommentsChanges[testCase.id] = $scope.testExecutionService.testCaseComments[testCase.id];
        };

        $scope.deleteTestCaseComment = function (testCase) {
            $scope.testExecutionService.testCaseComments[testCase.id] = null;
            $scope.testExecutionService.testCaseCommentsChanges[testCase.id] = null;
            $scope.testExecutionService.testCaseCommentsChanged[testCase.id] = false;
            $scope.saveTestCaseComment(testCase);
        };

        $scope.resetTestCaseComment = function (testCase) {
            $scope.testExecutionService.testCaseCommentsChanged[testCase.id] = false;
            $scope.testExecutionService.testCaseCommentsChanges[testCase.id] = null;
        };

        $scope.saveTestCaseComment = function (testCase) {
            $scope.testExecutionService.testCaseCommentsChanged[testCase.id] = false;
            $scope.testExecutionService.testCaseComments[testCase.id] = $scope.testExecutionService.testCaseCommentsChanges[testCase.id];
            $scope.testExecutionService.testCaseCommentsChanges[testCase.id] = null;
        };


    }]);


angular.module('cb')
    .controller('CBTestCaseCtrl', ['$scope', '$window', '$filter', '$rootScope', 'CB', '$timeout', 'CBTestPlanListLoader', '$sce', 'StorageService', 'TestCaseService', 'TestStepService', 'TestExecutionService', 'CBTestPlanLoader', 'User', 'userInfoService', function ($scope, $window, $filter, $rootScope, CB, $timeout, CBTestPlanListLoader, $sce, StorageService, TestCaseService, TestStepService, TestExecutionService, CBTestPlanLoader, User, userInfoService) {
        $scope.selectedTestCase = CB.selectedTestCase;
        $scope.testCase = CB.testCase;
        $scope.selectedTP = {id: null};
        $scope.preSelectedTP = {id: null};
        $scope.selectedScope = {key: null};
        $scope.testPlanScopes = [];
        $scope.allTestPlanScopes = [{key: 'USER', name: 'Private'}, {
            key: 'GLOBAL',
            name: 'Public'
        }];

        $scope.testCases = [];
        $scope.testPlans = [];
        $scope.tree = {};
        $scope.loading = true;
        $scope.loadingTP = false;
        $scope.loadingTC = false;
        $scope.loadingTPs = false;

        $scope.error = null;
        $scope.collapsed = false;

        var testCaseService = new TestCaseService();

        $scope.initTestCase = function () {
            $scope.error = null;
            $scope.loading = true;
            $scope.testCases = null;
            if (userInfoService.isAuthenticated()) {
                $scope.testPlanScopes = $scope.allTestPlanScopes;
                var tmp = StorageService.get(StorageService.CB_SELECTED_TESTPLAN_SCOPE_KEY);
                $scope.selectedScope.key = tmp && tmp != null ? tmp : $scope.allTestPlanScopes[1].key;
            } else {
                $scope.testPlanScopes = [$scope.allTestPlanScopes[1]];
                $scope.selectedScope.key = $scope.allTestPlanScopes[1].key;
            }
            $scope.selectScope();
        };


        $scope.$on('event:cb:initTestCase', function (event, args) {
            $scope.preSelectedTP.id = null;
            if (args !== undefined && args.scope !== undefined && args.group !== undefined) {
                $scope.preSelectedTP.id = StorageService.get(StorageService.CB_SELECTED_TESTPLAN_ID_KEY);
            }
            $scope.initTestCase();
        });


        $rootScope.$on('event:logoutConfirmed', function () {
            $scope.initTestCase();
        });

        $rootScope.$on('event:loginConfirmed', function () {
            $scope.initTestCase();
        });


        var findTPByPersistenceId = function (persistentId, testPlans) {
            for (var i = 0; i < testPlans.length; i++) {
                if (testPlans[i].persistentId === persistentId) {
                    return testPlans[i];
                }
            }
            return null;
        };


        $scope.selectTP = function () {
            $scope.loadingTP = true;
            $scope.errorTP = null;
            $scope.selectedTestCase = null;
            if ($scope.selectedTP.id && $scope.selectedTP.id !== null && $scope.selectedTP.id !== "") {
                var tcLoader = new CBTestPlanLoader($scope.selectedTP.id);
                tcLoader.then(function (testPlan) {
                    $scope.testCases = [testPlan];
                    testCaseService.buildTree(testPlan);
                    $scope.refreshTree();
                    StorageService.set(StorageService.CB_SELECTED_TESTPLAN_ID_KEY, $scope.selectedTP.id);
                    $scope.loadingTP = false;
                }, function (error) {
                    $scope.loadingTP = false;
                    $scope.errorTP = "Sorry, Cannot load the test cases. Please try again";
                });
            } else {
                $scope.testCases = null;
                StorageService.set(StorageService.CB_SELECTED_TESTPLAN_ID_KEY, "");
                $scope.loadingTP = false;
            }
        };

        $scope.selectScope = function () {
            $scope.errorTP = null;
            $scope.selectedTestCase = null;
            $scope.testPlans = null;
            $scope.testCases = null;
            $scope.errorTP = null;
            $scope.loadingTP = false;
            StorageService.set(StorageService.CB_SELECTED_TESTPLAN_SCOPE_KEY, $scope.selectedScope.key);
            if ($scope.selectedScope.key && $scope.selectedScope.key !== null && $scope.selectedScope.key !== "") {
                if ($rootScope.domain != null && $rootScope.domain.domain != null) {
                    $scope.loadingTP = true;
                    var tcLoader = new CBTestPlanListLoader($scope.selectedScope.key, $rootScope.domain.domain);
                    tcLoader.then(function (testPlans) {
                        $scope.error = null;
                        $scope.testPlans = $filter('orderBy')(testPlans, 'position');
                        var targetId = null;
                        if ($scope.testPlans.length > 0) {
                            if ($scope.testPlans.length === 1) {
                                targetId = $scope.testPlans[0].id;
                            } else if ($scope.preSelectedTP.id !== null) {
                                targetId = $scope.preSelectedTP.id;
                            } else if (StorageService.get(StorageService.CB_SELECTED_TESTPLAN_ID_KEY) !== null) {
                                var previousTpId = StorageService.get(StorageService.CB_SELECTED_TESTPLAN_ID_KEY);
                                targetId = previousTpId == undefined || previousTpId == null ? "" : previousTpId;
                            } else if (userInfoService.isAuthenticated()) {
                                var lastTestPlanPersistenceId = userInfoService.getLastTestPlanPersistenceId();
                                var tp = findTPByPersistenceId(lastTestPlanPersistenceId, $scope.testPlans);
                                if (tp != null) {
                                    targetId = tp.id;
                                }
                            }
                            if (targetId == null) {
                                var previousTpId = StorageService.get(StorageService.CB_SELECTED_TESTPLAN_ID_KEY);
                                targetId = previousTpId == undefined || previousTpId == null ? "" : previousTpId;
                            }
                            $scope.selectedTP.id = targetId.toString();
                            $scope.selectTP();
                        } else {
                            $scope.loadingTP = false;
                        }
                        $scope.loading = false;
                    }, function (error) {
                        $scope.loadingTP = false;
                        $scope.loading = false;
                        $scope.error = "Sorry, Cannot load the test plans. Please try again";
                    });
                }
            } else {
                StorageService.set(StorageService.CB_SELECTED_TESTPLAN_ID_KEY, "");
            }
        };

        $scope.refreshTree = function () {
            $timeout(function () {
                if ($scope.testCases != null) {
                    if (typeof $scope.tree.build_all == 'function') {

                        $scope.tree.build_all($scope.testCases);
                        var b = $scope.tree.get_first_branch();
                        if (b != null && b) {
                            $scope.tree.expand_branch(b);
                        }


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
                                $scope.loadTestCase(testCase, tab, false);
                            }
                        }
                    } else {
                        $scope.error = "Something went wrong. Please refresh your page again.";
                    }
                }
                $scope.loading = false;
            }, 1000);
        };


        $scope.isSelectable = function (node) {
            return true;
        };

        $scope.selectTestCase = function (node) {
            $scope.loadingTC = true;
            $scope.selectedTestCase = node;
            StorageService.set(StorageService.CB_SELECTED_TESTCASE_ID_KEY, node.id);
            StorageService.set(StorageService.CB_SELECTED_TESTCASE_TYPE_KEY, node.type);
            $timeout(function () {
                $scope.$broadcast('cb:testCaseSelected', $scope.selectedTestCase);
                $scope.loadingTC = false;
            });
        };

        $scope.selectNode = function (id, type) {
            $timeout(function () {
                testCaseService.selectNodeByIdAndType($scope.tree, id, type);
            }, 0);
        };

        $scope.loadTestCase = function (testCase, tab, clear) {

            if (clear === undefined || clear === true) {
                StorageService.remove(StorageService.CB_EDITOR_CONTENT_KEY);
                var id = StorageService.get(StorageService.CB_LOADED_TESTCASE_ID_KEY);
                var type = StorageService.get(StorageService.CB_LOADED_TESTCASE_TYPE_KEY);
                if (id != null && id != undefined) {
                    if (type === 'TestCase') { // a test case was loaded
                        TestExecutionService.clearTestCase(id);
                    } else if (type === 'TestStep') { // a test step was loaded
                        TestExecutionService.clearTestStep(id);
                    }
                    StorageService.remove(StorageService.CB_LOADED_TESTCASE_ID_KEY);
                    StorageService.remove(StorageService.CB_LOADED_TESTCASE_TYPE_KEY);
                }

                id = StorageService.get(StorageService.CB_LOADED_TESTSTEP_ID_KEY);
                type = StorageService.get(StorageService.CB_LOADED_TESTSTEP_TYPE_KEY);

                if (id != null && id != undefined) { // a test step was executed independent of weither it was part of a test case or test step execution
                    TestExecutionService.clearTestStep(id);
                    StorageService.remove(StorageService.CB_LOADED_TESTCASE_ID_KEY);
                    StorageService.remove(StorageService.CB_LOADED_TESTCASE_TYPE_KEY);
                }
            }

            StorageService.set(StorageService.CB_LOADED_TESTCASE_ID_KEY, testCase.id);
            StorageService.set(StorageService.CB_LOADED_TESTCASE_TYPE_KEY, testCase.type);

            $timeout(function () {
                $rootScope.$broadcast('cb:testCaseLoaded', testCase, tab);
            });
            if (CB.editor != null && CB.editor.instance != null) {
                CB.editor.instance.setOption("readOnly", false);
            }
        };


        $scope.expandAll = function () {
            if ($scope.tree != null)
                $scope.tree.expand_all();
        };

        $scope.collapseAll = function () {
            if ($scope.tree != null)
                $scope.tree.collapse_all();
        };

        $rootScope.$on('event:logoutConfirmed', function () {
            $scope.initTestCase();
        });

        $rootScope.$on('event:loginConfirmed', function () {
            $scope.initTestCase();
        });


    }]);


angular.module('cb')
    .controller('CBValidatorCtrl', ['$scope', '$http', 'CB', '$window', '$timeout', '$modal', 'NewValidationResult', '$rootScope', 'ServiceDelegator', 'StorageService', 'TestExecutionService', 'MessageUtil', 'FileUpload', function ($scope, $http, CB, $window, $timeout, $modal, NewValidationResult, $rootScope, ServiceDelegator, StorageService, TestExecutionService, MessageUtil, FileUpload) {

        $scope.cb = CB;
        $scope.testStep = null;
        $scope.message = CB.message;
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
        $scope.tError = null;
        $scope.tLoading = false;
        $scope.dqaCodes = StorageService.get(StorageService.DQA_OPTIONS_KEY) != null ? angular.fromJson(StorageService.get(StorageService.DQA_OPTIONS_KEY)) : [];
        $scope.domain = null;
        $scope.protocol = null;
        $scope.hasNonPrintable = false;

        $scope.showDQAOptions = function () {
            var modalInstance = $modal.open({
                templateUrl: 'DQAConfig.html',
                controller: 'DQAConfigCtrl',
                windowClass: 'dq-modal',
                animation: true,
                keyboard: false,
                backdrop: false
            });
            modalInstance.result.then(function (selectedCodes) {
                $scope.dqaCodes = selectedCodes;
            }, function () {
            });
        };


        $scope.isTestCase = function () {
            return CB.testCase != null && CB.testCase.type === 'TestCase';
        };

        $scope.refreshEditor = function () {
            $timeout(function () {
                if ($scope.editor)
                    $scope.editor.refresh();
            }, 1000);
        };

        $scope.loadExampleMessage = function () {
            if ($scope.testStep != null) {
                var testContext = $scope.testStep.testContext;
                if (testContext) {
                    var message = testContext.message && testContext.message != null ? testContext.message.content : '';
                    if ($scope.isTestCase()) {
                        TestExecutionService.setTestStepExecutionMessage($scope.testStep, message);
                    }
                    $scope.nodelay = true;
                    $scope.cb.editor.instance.doc.setValue(message);
                    $scope.execute();
                }
            }
        };


        $scope.uploadMessage = function (file, errFiles) {
            $scope.f = file;
            FileUpload.uploadMessage(file, errFiles).then(function (response) {
                $timeout(function () {
                    file.result = response.data;
                    var result = response.data;
                    var fileName = file.name;
                    $scope.nodelay = true;
                    var tmp = angular.fromJson(result);
                    $scope.cb.message.name = fileName;
                    $scope.cb.editor.instance.doc.setValue(tmp.content);
                    $scope.mError = null;
                    $scope.execute();
                    Notification.success({
                        message: "File " + fileName + " successfully uploaded!",
                        templateUrl: "NotificationSuccessTemplate.html",
                        scope: $rootScope,
                        delay: 30000
                    });
                });
            }, function (response) {
                $scope.mError = response.data;
            });
        };


        $scope.setLoadRate = function (value) {
            $scope.loadRate = value;
        };

        $scope.initCodemirror = function () {
            $scope.editor = CodeMirror.fromTextArea(document.getElementById("cb-textarea"), {
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
                    var coordinate = ServiceDelegator.getCursorService($scope.testStep.testContext.format).getCoordinate($scope.editor, $scope.cb.tree);
                    if (coordinate && coordinate != null) {
                        coordinate.start.index = coordinate.start.index + 1;
                        coordinate.end.index = coordinate.end.index + 1;
                        $scope.cb.cursor.init(coordinate, true);
                        ServiceDelegator.getTreeService($scope.testStep.testContext.format).selectNodeByIndex($scope.cb.tree.root, CB.cursor, CB.message.content);
                    }
                });
            });
        };

        $scope.validateMessage = function () {
            try {
                if ($scope.testStep != null) {
                    if ($scope.cb.message.content !== '' && $scope.testStep.testContext != null) {
                        $scope.vLoading = true;
                        $scope.vError = null;
                        TestExecutionService.deleteTestStepValidationReport($scope.testStep);
                        var validator = ServiceDelegator.getMessageValidator($scope.testStep.testContext.format).validate($scope.testStep.testContext.id, $scope.cb.message.content, $scope.testStep.nav, "Based", [], "1223");
                        validator.then(function (mvResult) {
                            $scope.vLoading = false;
                            $scope.setTestStepValidationReport(mvResult);
                        }, function (error) {
                            $scope.vLoading = false;
                            $scope.vError = error;
                            $scope.setTestStepValidationReport(null);
                        });
                    } else {
                        var reportId = TestExecutionService.getTestStepValidationReport($scope.testStep);
                        $scope.setTestStepValidationReport({"reportId": reportId});
                        $scope.vLoading = false;
                        $scope.vError = null;
                    }
                }
            } catch (error) {
                $scope.vLoading = false;
                $scope.vError = null;
                $scope.setTestStepValidationReport(null);
            }
        };

        $scope.setTestStepValidationReport = function (mvResult) {
            if ($scope.testStep != null) {
                if (mvResult != null && mvResult != undefined && mvResult.reportId != null) {
                    $scope.completeStep($scope.testStep);
                    TestExecutionService.setTestStepValidationReport($scope.testStep, mvResult.reportId);
                }
                $rootScope.$emit('cb:validationResultLoaded', mvResult, $scope.testStep);
            }
        };


        $scope.setTestStepMessageTree = function (messageObject) {
            $scope.buildMessageTree(messageObject);
            var tree = messageObject && messageObject != null && messageObject.elements ? messageObject : undefined;
            TestExecutionService.setTestStepMessageTree($scope.testStep, tree);
        };

        $scope.buildMessageTree = function (messageObject) {
            if ($scope.testStep != null) {
                var elements = messageObject && messageObject != null && messageObject.elements ? messageObject.elements : [];
                if (typeof $scope.cb.tree.root.build_all == 'function') {
                    $scope.cb.tree.root.build_all(elements);
                }
                var delimeters = messageObject && messageObject != null && messageObject.delimeters ? messageObject.delimeters : [];
                ServiceDelegator.updateEditorMode($scope.editor, delimeters, $scope.testStep.testContext.format);
                ServiceDelegator.getEditorService($scope.testStep.testContext.format).setEditor($scope.editor);
                ServiceDelegator.getTreeService($scope.testStep.testContext.format).setEditor($scope.editor);
            }
        };

        $scope.clearMessage = function () {
            $scope.nodelay = true;
            $scope.mError = null;
            if ($scope.testStep != null) {
                TestExecutionService.deleteTestStepValidationReport($scope.testStep);
                TestExecutionService.deleteTestStepMessageTree($scope.testStep);
            }
            if ($scope.editor) {
                $scope.editor.doc.setValue('');
                $scope.execute();
            }
        };

        $scope.saveMessage = function () {
            $scope.cb.message.download();
        };

        $scope.parseMessage = function () {
            try {
                if ($scope.testStep != null) {
                    if ($scope.cb.message.content != '' && $scope.testStep.testContext != null) {
                        $scope.tLoading = true;
                        TestExecutionService.deleteTestStepMessageTree($scope.testStep);
                        var parsed = ServiceDelegator.getMessageParser($scope.testStep.testContext.format).parse($scope.testStep.testContext.id, $scope.cb.message.content);
                        parsed.then(function (value) {
                            $scope.tLoading = false;
                            $scope.setTestStepMessageTree(value);
                        }, function (error) {
                            $scope.tLoading = false;
                            $scope.tError = error;
                            $scope.setTestStepMessageTree([]);
                        });
                    } else {
                        $scope.setTestStepMessageTree([]);
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
            ServiceDelegator.getTreeService($scope.testStep.testContext.format).getEndIndex(node, $scope.cb.message.content);
            $scope.cb.cursor.init(node.data, false);
            ServiceDelegator.getEditorService($scope.testStep.testContext.format).select($scope.editor, $scope.cb.cursor);
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
            $scope.cb.message.content = $scope.editor.doc.getValue();
            //console.log("message is=" + $scope.editor.doc.getValue());
            $scope.setHasNonPrintableCharacters();
            StorageService.set(StorageService.CB_EDITOR_CONTENT_KEY, $scope.cb.message.content);
            $scope.refreshEditor();
            if (!$scope.isTestCase() || !$scope.isTestCaseCompleted()) {
                TestExecutionService.setTestStepExecutionMessage($scope.testStep, $scope.cb.message.content);
                $scope.validateMessage();
                $scope.parseMessage();
            } else {
                var reportId = TestExecutionService.getTestStepValidationReport($scope.testStep);
                $scope.setTestStepValidationReport({"reportId": reportId});
                $scope.setTestStepMessageTree(TestExecutionService.getTestStepMessageTree($scope.testStep));
            }
        };

        $scope.executeWithMessage = function (content) {
            if ($scope.editor) {
                $scope.editor.doc.setValue(content);
                $scope.execute();
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
            $scope.setTestStepValidationReport(null);
        };

        $scope.removeDuplicates = function () {
            $scope.vLoading = true;
            $scope.$broadcast('cb:removeDuplicates');
        };

        $scope.clear();
        $scope.initCodemirror();
        $scope.$on('cb:refreshEditor', function (event) {
            $scope.refreshEditor();
        });
        $scope.$on('cb:clearEditor', function (event) {
            $scope.clearMessage();
        });

        $rootScope.$on('cb:reportLoaded', function (event, report) {
            if ($scope.testStep != null) {
                TestExecutionService.setTestStepValidationReport($scope.testStep, report);
            }
        });

        $scope.$on('cb:testStepLoaded', function (event, testStep) {
            $scope.clear();
            $scope.testStep = testStep;
            if ($scope.testStep.testContext != null) {
                $scope.cb.editor = ServiceDelegator.getEditor($scope.testStep.testContext.format);
                $scope.cb.editor.instance = $scope.editor;
                $scope.cb.cursor = ServiceDelegator.getCursor($scope.testStep.testContext.format);
                var content = null;
                if (!$scope.isTestCase()) {
                    $scope.nodelay = false;
                    content = StorageService.get(StorageService.CB_EDITOR_CONTENT_KEY) == null ? '' : StorageService.get(StorageService.CB_EDITOR_CONTENT_KEY);
                } else {
                    $scope.nodelay = true;
                    content = TestExecutionService.getTestStepExecutionMessage($scope.testStep);
                    if (content == undefined)
                        content = '';
                }
                $scope.executeWithMessage(content);
            }
        });

        $scope.$on('cb:removeTestStep', function (event, testStep) {
            $scope.testStep = null;
        });

        $scope.$on('cb:loadEditorContent', function (event, message) {
            $scope.nodelay = true;
            var content = message == null ? '' : message;
            $scope.editor.doc.setValue(content);
            $scope.cb.message.id = null;
            $scope.cb.message.name = '';
            $scope.execute();
        });

        $rootScope.$on('cb:duplicatesRemoved', function (event, report) {
            $scope.vLoading = false;
        });

        $scope.initValidation = function () {

        };

        $scope.expandAll = function () {
            if ($scope.cb.tree.root != null)
                $scope.cb.tree.root.expand_all();
        };

        $scope.collapseAll = function () {
            if ($scope.cb.tree.root != null)
                $scope.cb.tree.root.collapse_all();
        };


        $scope.setHasNonPrintableCharacters = function () {
            $scope.hasNonPrintable = MessageUtil.hasNonPrintable($scope.cb.message.content);
        };

        $scope.showMessageWithHexadecimal = function () {
            var modalInstance = $modal.open({
                templateUrl: 'MessageWithHexadecimal.html',
                controller: 'MessageWithHexadecimalDlgCtrl',
                windowClass: 'valueset-modal',
                animation: false,
                keyboard: true,
                backdrop: true,
                resolve: {
                    original: function () {
                        return $scope.cb.message.content;
                    }
                }
            });
        };


    }]);


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

angular.module('cb')
    .controller('PastTestStepConsoleCtrl', function ($scope, $modalInstance, title, log) {
        $scope.title = title;
        $scope.log = log;

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
        $scope.close = function () {
            $modalInstance.close();
        };
    });

angular.module('cb')
    .controller('CurrentTestStepConsoleCtrl', function ($scope, $modalInstance, title, logger) {
        $scope.title = title;
        $scope.logger = logger;

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
        $scope.close = function () {
            $modalInstance.close();
        };


    });

angular.module('cb')
    .controller('CBManualValidationCtrl', ['$scope', 'CB', '$http', 'TestExecutionService', '$timeout', 'ManualReportService', '$rootScope', function ($scope, CB, $http, TestExecutionService, $timeout, ManualReportService, $rootScope) {
        $scope.cb = CB;
        $scope.saving = false;
        $scope.error = null;
        $scope.testStep = null;
        $scope.report = null;
        $scope.testExecutionService = TestExecutionService;
        $scope.saved = false;
        $scope.error = null;
        $scope.$on('cb:manualTestStepLoaded', function (event, testStep) {
            $scope.saved = false;
            $scope.saving = false;
            $scope.error = null;
            $scope.testStep = testStep;
            $scope.report = TestExecutionService.getTestStepValidationReport(testStep) === undefined || TestExecutionService.getTestStepValidationReport(testStep) === null ? {
                    "result": {
                        "value": "",
                        "comments": ""
                    }, "html": null
                } : TestExecutionService.getTestStepValidationReport(testStep);
        });

        // $scope.save = function () {
        //   $scope.saving = true;
        //   $scope.saved = false;
        //   $scope.error = null;
        //   ManualReportService.save($scope.report.result, $scope.testStep).then(function (report) {
        //     $scope.report["id"] = report.id;
        //     $scope.report["xml"] = report.xml;
        //     TestExecutionService.setTestStepExecutionStatus($scope.testStep, 'COMPLETE');
        //     var rep = angular.copy($scope.report);
        //     TestExecutionService.setTestStepValidationReport($scope.testStep, rep);
        //     $timeout(function () {
        //       $rootScope.$emit('cb:manualReportLoaded', rep, $scope.testStep.id);
        //     });
        //     $scope.saving = false;
        //     $scope.saved = true;
        //   }, function (error) {
        //     $scope.error = error;
        //     $scope.saving = false;
        //     $scope.saved = false;
        //   });
        // };


    }]);

angular.module('cb')
    .controller('CBManualReportCtrl', ['$scope', '$sce', '$http', 'CB', function ($scope, $sce, $http, CB) {
        $scope.cb = CB;
    }]);


angular.module('cb')
    .controller('CBTestManagementCtrl', function ($scope, $window, $filter, $rootScope, CB, $timeout, $sce, StorageService, TestCaseService, TestStepService, CBTestPlanManager, User, userInfoService, $modal, Notification, $modalStack, $location, $routeParams) {
        $scope.selectedTestCase = CB.selectedTestCase;
        $scope.testCase = CB.testCase;
        $scope.selectedTP = {id: null};
        $scope.selectedScope = {key: null};
        $scope.testPlanScopes = null;
        $scope.testCases = [];
        $scope.testPlans = [];
        $scope.tree = {};
        $scope.loading = true;
        $scope.loadingTP = false;
        $scope.loadingTC = false;
        $scope.loadingTPs = false;
        $scope.allTestPlanScopes = [{key: 'USER', name: 'Private'}, {key: 'GLOBAL', name: 'Public'}];
        $scope.token = $routeParams.x;
        $scope.domain = $routeParams.d;


        $scope.error = null;
        $scope.collapsed = false;

        var testCaseService = new TestCaseService();


        $scope.$on('event:cb:initManagement', function () {
            $scope.initTestCase();
        });


        $scope.initTestCase = function () {
            if ($rootScope.isCbManagementSupported() && userInfoService.isAuthenticated() && $rootScope.hasWriteAccess()) {
                $scope.error = null;
                $scope.loading = true;
                $scope.testPlans = null;
                if (userInfoService.isAdmin() || userInfoService.isSupervisor()) {
                    $scope.testPlanScopes = $scope.allTestPlanScopes;
                    var tmp = StorageService.get(StorageService.CB_SELECTED_TESTPLAN_SCOPE_KEY);
                    $scope.selectedScope.key = tmp && tmp != null ? tmp : $scope.testPlanScopes[1].key;
                } else {
                    $scope.testPlanScopes = [$scope.allTestPlanScopes[0]];
                    $scope.selectedScope.key = $scope.testPlanScopes[0].key; // GLOBAL
                }
                $scope.selectScope();
            }
        };

        var findTPByPersistenceId = function (persistentId, testPlans) {
            for (var i = 0; i < testPlans.length; i++) {
                if (testPlans[i].persistentId === persistentId) {
                    return testPlans[i];
                }
            }
            return null;
        };


        $scope.get_icon_type = function (node) {
            if (node.type === 'TestObject' || node.type === 'TestStep') {
                var connType = node['testingType'];
                return connType === 'TA_MANUAL' || connType === 'SUT_MANUAL' ? 'fa fa-wrench' : connType === 'SUT_RESPONDER' || connType === 'SUT_INITIATOR' ? 'fa fa-arrow-right' : connType === 'TA_RESPONDER' || connType === 'TA_INITIATOR' ? 'fa fa-arrow-left' : 'fa fa-check-square-o';
            } else {
                return '';
            }
        };


        $scope.selectTP = function () {
            $scope.loadingTP = true;
            $scope.errorTP = null;
            $scope.selectedTestCase = null;
            console.log("$scope.selectedTP.id=" + $scope.selectedTP.id);
            if ($scope.selectedTP.id && $scope.selectedTP.id !== null && $scope.selectedTP.id !== "") {
                CBTestPlanManager.getTestPlan($scope.selectedTP.id).then(function (testPlan) {
                    $scope.testCases = [testPlan];
                    testCaseService.buildTree(testPlan);
                    StorageService.set(StorageService.CB_MANAGE_SELECTED_TESTPLAN_ID_KEY, $scope.selectedTP.id);
                    $scope.loadingTP = false;
                }, function (error) {
                    $scope.loadingTP = false;
                    $scope.errorTP = "Sorry, Cannot load the test cases. Please try again";
                });
            } else {
                $scope.testCases = null;
                StorageService.set(StorageService.CB_MANAGE_SELECTED_TESTPLAN_ID_KEY, "");
                $scope.loadingTP = false;
            }
        };


        $scope.selectScope = function () {
            $scope.errorTP = null;
            $scope.selectedTestCase = null;
            $scope.testPlans = null;
            $scope.testCases = null;
            $scope.errorTP = null;
            $scope.loadingTP = false;
            StorageService.set(StorageService.CB_MANAGE_SELECTED_TESTPLAN_SCOPE_KEY, $scope.selectedScope.key);
            if ($scope.selectedScope.key && $scope.selectedScope.key !== null && $scope.selectedScope.key !== "" && $rootScope.domain != null) {
                if ($rootScope.domain && $rootScope.domain.domain != null) {
                    $scope.loadingTP = true;
                    CBTestPlanManager.getTestPlans($scope.selectedScope.key, $rootScope.domain.domain).then(function (testPlans) {
                        $scope.error = null;
                        $scope.testPlans = $filter('orderBy')(testPlans, 'position');
                        var targetId = null;
                        if ($scope.testPlans.length > 0) {
                            if ($scope.testPlans.length === 1) {
                                targetId = $scope.testPlans[0].id;
                            }
                            if (targetId == null) {
                                var previousTpId = StorageService.get(StorageService.CB_MANAGE_SELECTED_TESTPLAN_ID_KEY);
                                targetId = previousTpId == undefined || previousTpId == null ? "" : previousTpId;
                            }
                            $scope.selectedTP.id = targetId.toString();
                            $scope.selectTP();
                        } else {
                            $scope.loadingTP = false;
                        }
                        $scope.loading = false;
                    }, function (error) {
                        $scope.loadingTP = false;
                        $scope.loading = false;
                        $scope.error = "Sorry, Cannot load the test plans. Please try again";
                    });
                }
            } else {
                StorageService.set(StorageService.CB_MANAGE_SELECTED_TESTPLAN_ID_KEY, "");
            }
        };

        $scope.refreshTree = function () {
            $timeout(function () {
                if ($scope.testCases != null) {
                    if (typeof $scope.tree.build_all == 'function') {
                        $scope.tree.build_all($scope.testCases);
                        var b = $scope.tree.get_first_branch();
                        if (b != null && b) {
                            $scope.tree.expand_branch(b);
                        }
                        var testCase = null;
                        var id = StorageService.get(StorageService.CB_MANAGE_SELECTED_TESTCASE_ID_KEY);
                        var type = StorageService.get(StorageService.CB_MANAGE_SELECTED_TESTCASE_TYPE_KEY);
                        if (id != null && type != null) {
                            for (var i = 0; i < $scope.testCases.length; i++) {
                                var found = testCaseService.findOneByIdAndType(id, type, $scope.testCases[i]);
                                if (found != null) {
                                    testCase = found;
                                    break;
                                }
                            }
                            if (testCase != null) {
                                $scope.selectNode(id, type);
                            }
                        }

                        testCase = null;
                        id = StorageService.get(StorageService.CB_MANAGE_LOADED_TESTCASE_ID_KEY);
                        type = StorageService.get(StorageService.CB_MANAGE_LOADED_TESTCASE_TYPE_KEY);
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
                                $scope.loadTestCase(testCase, tab, false);
                            }
                        }
                    } else {
                        $scope.error = "Something went wrong. Please refresh your page again.";
                    }
                }
                $scope.loading = false;
            }, 1000);
        };

        $scope.isSelectable = function (node) {
            return true;
        };

        $scope.selectTestNode = function (node) {
            $scope.loadingTC = true;
            $scope.error = null;
            $scope.selectedTestCase = node;
            StorageService.set(StorageService.CB_MANAGE_SELECTED_TESTCASE_ID_KEY, node.id);
            StorageService.set(StorageService.CB_MANAGE_SELECTED_TESTCASE_TYPE_KEY, node.type);
            $timeout(function () {
                $scope.$broadcast('cb-manage:testCaseSelected', $scope.selectedTestCase);
                $scope.loadingTC = false;
            });
        };

        $scope.selectNode = function (id, type) {
            $timeout(function () {
                testCaseService.selectNodeByIdAndType($scope.tree, id, type);
            }, 0);
        };


        $scope.deleteTreeNode = function (node, potentialParent) {
            if (potentialParent.children && potentialParent.children.length > 0) {
                for (var i = 0; i < potentialParent.children.length; i++) {
                    var child = potentialParent.children[i];
                    if (child == node) {
                        potentialParent.children.splice(i, 1);
                        return true;
                    } else {
                        var done = $scope.deleteTreeNode(node, child);
                        if (done) {
                            return true;
                        }
                    }
                }
            }
            return false;
        };


        $scope.afterDelete = function (node) {
            for (var i = 0; i < $scope.testCases.length; i++) {
                if ($scope.deleteTreeNode(node, $scope.testCases[i]) == true) {
                    if (node === $scope.selectedTestCase) {
                        $scope.selectedTestCase = null;
                    }
                    break;
                }
            }
        };

        $scope.deleteTestStep = function (testStep) {
            $scope.error = null;
            var modalInstance = $modal.open({
                templateUrl: 'views/cb/manage/confirm-delete-teststep.html',
                controller: 'ConfirmDialogCtrl',
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });
            modalInstance.result.then(
                function (result) {
                    if (result) {
                        CBTestPlanManager.deleteTestStep(testStep).then(function (result) {
                            if (result.status === "SUCCESS") {
                                $scope.afterDelete(testStep);
                                Notification.success({
                                    message: "Test Step deleted successfully !",
                                    templateUrl: "NotificationSuccessTemplate.html",
                                    scope: $rootScope,
                                    delay: 5000
                                });
                            } else {
                                $scope.error = result.message;
                            }
                        }, function (error) {
                            $scope.error = "Sorry, Cannot delete the test step. Please try again. \n DEBUG:" + error;
                        });
                    }
                }, function (result) {

                });

        };


        $scope.deleteTestCase = function (testCase) {
            $scope.error = null;
            var modalInstance = $modal.open({
                templateUrl: 'views/cb/manage/confirm-delete-testcase.html',
                controller: 'ConfirmDialogCtrl',
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });
            modalInstance.result.then(
                function (result) {
                    if (result) {
                        CBTestPlanManager.deleteTestCase(testCase).then(function (result) {
                            if (result.status === "SUCCESS") {
                                $scope.afterDelete(testCase);
                                Notification.success({
                                    message: "Test Case deleted successfully !",
                                    templateUrl: "NotificationSuccessTemplate.html",
                                    scope: $rootScope,
                                    delay: 5000
                                });
                            } else {
                                $scope.error = result.message;
                            }
                        }, function (error) {
                            $scope.error = "Sorry, Cannot delete the test case. Please try again. \n DEBUG:" + error;
                        });
                    }
                }, function (result) {

                });

        };

        $scope.deleteTestCaseGroup = function (testCaseGroup) {
            $scope.error = null;
            var modalInstance = $modal.open({
                templateUrl: 'views/cb/manage/confirm-delete-testgroup.html',
                controller: 'ConfirmDialogCtrl',
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });
            modalInstance.result.then(
                function (result) {
                    if (result) {
                        CBTestPlanManager.deleteTestCaseGroup(testCaseGroup).then(function (result) {
                            if (result.status === "SUCCESS") {
                                $scope.afterDelete(testCaseGroup);
                                Notification.success({
                                    message: "Test Case Group deleted successfully !",
                                    templateUrl: "NotificationSuccessTemplate.html",
                                    scope: $rootScope,
                                    delay: 5000
                                });
                            } else {
                                $scope.error = result.message;
                            }
                        }, function (error) {
                            $scope.error = "Sorry, Cannot delete the test case group. Please try again. \n DEBUG:" + error;
                        });
                    }
                }, function (result) {

                });

        };

        $scope.deleteTestPlan = function (testPlan) {
            $scope.error = null;
            var modalInstance = $modal.open({
                templateUrl: 'views/cb/manage/confirm-delete-testplan.html',
                controller: 'ConfirmDialogCtrl',
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });
            modalInstance.result.then(
                function (result) {
                    if (result) {
                        CBTestPlanManager.deleteTestPlan(testPlan).then(function (result) {
                            if (result.status === "SUCCESS") {

                                if ($scope.testPlans != null) {
                                    var ind = -1;
                                    for (var i = 0; i < $scope.testPlans.length; i++) {
                                        if ($scope.testPlans[i].id == $scope.testCases[0].id) {
                                            ind = i;
                                            break;
                                        }
                                    }
                                    if (ind > -1) {
                                        $scope.testPlans.splice(ind, 1);
                                    }
                                    $scope.testCases = [];
                                    $scope.selectedTestCase = null;
                                }

                                Notification.success({
                                    message: "Test Plan deleted successfully !",
                                    templateUrl: "NotificationSuccessTemplate.html",
                                    scope: $rootScope,
                                    delay: 5000
                                });
                            } else {
                                $scope.error = result.message;
                            }
                        }, function (error) {
                            $scope.error = "Sorry, Cannot delete the test plan. Please try again. \n DEBUG:" + error;
                        });
                    }
                }, function (result) {

                });

        };


        $scope.editNodeName = function (node) {
            node.editName = node.name;
            node.edit = true
        };

        $scope.resetNodeName = function (node) {
            node.editName = null;
            node.edit = false;
        };


        $scope.deleteTestNode = function (node) {
            if (node.editName != node.name) {
                if (node.type === 'TestPlan') {
                    $scope.deleteTestPlan(node);
                } else if (node.type === 'TestCaseGroup') {
                    $scope.deleteTestCaseGroup(node);
                } else if (node.type === 'TestCase') {
                    $scope.deleteTestCase(node);
                } else if (node.type === 'TestStep') {
                    $scope.deleteTestStep(node);
                }
            }
        };


        $scope.saveNodeName = function (node) {
            if (node.editName != node.name) {
                if (node.type === 'TestPlan') {
                    CBTestPlanManager.updateTestPlanName(node).then(function () {
                        node.name = node.editName;
                        node.label = node.name;
                        node.edit = false;
                        node.editName = null;
                    }, function (error) {
                        $scope.error = "Could not saved the name, please try again"
                    });
                } else if (node.type === 'TestCaseGroup') {
                    CBTestPlanManager.updateTestCaseGroupName(node).then(function () {
                        node.name = node.editName;
                        node.label = node.name;
                        node.edit = false;
                        node.editName = null;
                    }, function (error) {
                        $scope.error = "Could not saved the name, please try again"
                    });
                } else if (node.type === 'TestCase') {
                    CBTestPlanManager.updateTestCaseName(node).then(function () {
                        node.name = node.editName;
                        node.label = node.name;
                        node.edit = false;
                        node.editName = null;
                    }, function (error) {
                        $scope.error = "Could not saved the name, please try again"
                    });
                } else if (node.type === 'TestStep') {
                    CBTestPlanManager.updateTestStepName(node).then(function () {
                        node.name = node.editName;
                        node.label = node.position + "." + node.name;
                        node.editName = null;
                        node.edit = false;
                    }, function (error) {
                        $scope.error = "Could not saved the name, please try again"
                    });
                }
            }
        };


        // $scope.afterSave =function(token) {
        //     $timeout(function () {
        //         if(token != null && token) {
        //             var group = StorageService.get(StorageService.CB_MANAGE_SELECTED_TESTPLAN_ID_KEY);
        //             $location.url("/cb?nav=execution&scope=" + $scope.selectedScope.key + "&testPlan="+ $scope.selectedTestCase.id);
        //         }
        //     });
        // };


        $scope.publishTestPlan = function () {
            var modalInstance = $modal.open({
                templateUrl: 'views/cb/manage/confirm-publish-testplan.html',
                controller: 'ConfirmDialogCtrl',
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });
            modalInstance.result.then(
                function (result) {
                    if (result) {
                        $scope.loading = true;
                        CBTestPlanManager.publishTestPlan($scope.selectedTestCase.id).then(function (result) {
                            if (result.status === "SUCCESS") {
                                $scope.selectedScope.key = 'GLOBAL';
                                Notification.success({
                                    message: "Test Plan successfully published !",
                                    templateUrl: "NotificationSuccessTemplate.html",
                                    scope: $rootScope,
                                    delay: 5000
                                });
                                $scope.selectScope();
                                $scope.selectedTP.id = $scope.selectedTestCase.id;
                                $scope.selectTP();
                                // $scope.afterSave($scope.token);
                            } else {
                                Notification.error({
                                    message: result.message,
                                    templateUrl: "NotificationErrorTemplate.html",
                                    scope: $rootScope,
                                    delay: 10000
                                });
                            }
                            $scope.loading = false;
                        }, function (error) {
                            $scope.loading = false;
                            Notification.error({
                                message: error.data,
                                templateUrl: "NotificationErrorTemplate.html",
                                scope: $rootScope,
                                delay: 10000
                            });
                        });
                    }
                });
        };


        $scope.unpublishTestPlan = function () {
            var modalInstance = $modal.open({
                templateUrl: 'views/cb/manage/confirm-unpublish-testplan.html',
                controller: 'ConfirmDialogCtrl',
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });
            modalInstance.result.then(
                function (result) {
                    if (result) {
                        $scope.loading = true;
                        CBTestPlanManager.unpublishTestPlan($scope.selectedTestCase.id).then(function (result) {
                            if (result.status === "SUCCESS") {
                                $scope.selectedScope.key = 'USER';
                                Notification.success({
                                    message: "Test Plan successfully unpublished !",
                                    templateUrl: "NotificationSuccessTemplate.html",
                                    scope: $rootScope,
                                    delay: 5000
                                });
                                $scope.selectScope();
                                $scope.selectedTP.id = $scope.selectedTestCase.id;
                                $scope.selectTP();
                                // $scope.afterSave($scope.token);
                            } else {
                                Notification.error({
                                    message: result.message,
                                    templateUrl: "NotificationErrorTemplate.html",
                                    scope: $rootScope,
                                    delay: 10000
                                });
                            }
                            $scope.loading = false;
                        }, function (error) {
                            $scope.loading = false;
                            Notification.error({
                                message: error.data,
                                templateUrl: "NotificationErrorTemplate.html",
                                scope: $rootScope,
                                delay: 10000
                            });
                        });
                    }
                });
        };



        $scope.openUploadTestPlanModal = function () {
            $modalStack.dismissAll('close');
            var modalInstance = $modal.open({
                templateUrl: 'views/cb/manage/upload.html',
                controller: 'CBUploadCtrl',
                controllerAs: 'ctrl',
                windowClass: 'upload-modal',
                backdrop: 'static',
                keyboard: false
            });

            modalInstance.result.then(
                function (result) {
                    if (result.id != null) {
                        $scope.selectedScope.key = 'USER';
                        $scope.selectScope();
                        $scope.selectedTP.id = result.id;
                        $scope.selectTP();
                    }
                }
            );
        };


        $scope.expandAll = function () {
            if ($scope.tree != null)
                $scope.tree.expand_all();
        };

        $scope.collapseAll = function () {
            if ($scope.tree != null)
                $scope.tree.collapse_all();
        };

        $rootScope.$on('event:logoutConfirmed', function () {
            $scope.initTestCase();
        });

        $rootScope.$on('event:loginConfirmed', function () {
            $scope.initTestCase();
        });


    });


angular.module('cb')
    .controller('CBUploadCtrl', ['$scope', '$http', '$window', '$modal', '$filter', '$rootScope', '$timeout', 'StorageService', 'TestCaseService', 'TestStepService', 'FileUploader', 'Notification', '$modalInstance', 'userInfoService', 'CBTestPlanManager', function ($scope, $http, $window, $modal, $filter, $rootScope, $timeout, StorageService, TestCaseService, TestStepService, FileUploader, Notification, $modalInstance, userInfoService, CBTestPlanManager) {

        FileUploader.FileSelect.prototype.isEmptyAfterSelection = function () {
            return true;
        };
        $scope.step = 0;


        var zipUploader = $scope.zipUploader = new FileUploader({
            url: 'api/cb/management/uploadZip',
            autoUpload: true
        });

        zipUploader.onBeforeUploadItem = function (fileItem) {
            $scope.error = null;
            $scope.loading = true;
            fileItem.formData.push({domain: $rootScope.domain.domain});
        };

        zipUploader.onCompleteItem = function (fileItem, response, status, headers) {

            $scope.error = null;
            if (response.status == "FAILURE") {
                $scope.step = 1;
                $scope.error = response.message;
                $scope.loading = false;
            } else {
                if (response.status === "SUCCESS") {
                    if (response.token !== undefined) {
                        CBTestPlanManager.saveZip(response.token, $scope.domain.domain).then(function (response) {
                            $scope.loading = false;
                            if (response.status == "FAILURE") {
                                $scope.step = 1;
                                $scope.error = "Could not saved the zip, please try again";

                            } else {

                                if (response.action === "ADD") {
                                    Notification.success({
                                        message: "Test Plan Added Successfully !",
                                        templateUrl: "NotificationSuccessTemplate.html",
                                        scope: $rootScope,
                                        delay: 5000
                                    });
                                    $modalInstance.close({id: response.id});
                                } else if (response.action === "UPDATE") {
                                    Notification.success({
                                        message: "Test Plan Updated Successfully !",
                                        templateUrl: "NotificationSuccessTemplate.html",
                                        scope: $rootScope,
                                        delay: 5000
                                    });
                                    $modalInstance.close({id: response.id});
                                }


                            }
                        }, function (error) {
                            $scope.step = 1;
                            $scope.error = "Could not saved the zip, please try again";
                        });
                    } else {
                        $scope.step = 1;
                        $scope.error = "Could not saved the zip, no token was received, please try again";
                    }


                }


            }
        };

        $scope.gotStep = function (step) {
            $scope.step = step;
        };


        $scope.dismissModal = function () {
            $modalInstance.dismiss();
        };

        $scope.generateUUID = function () {
            var d = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
            return uuid;
        };

    }]);

angular.module('cb').controller('UploadCBTokenCheckCtrl', ['$scope', '$http', 'CF', '$window', '$modal', '$filter', '$rootScope', '$timeout', 'StorageService', 'TestCaseService', 'TestStepService', 'userInfoService', 'Notification', 'modalService', '$routeParams', '$location','CBTestPlanManager', function ($scope, $http, CF, $window, $modal, $filter, $rootScope, $timeout, StorageService, TestCaseService, TestStepService, userInfoService, Notification, modalService, $routeParams, $location,CBTestPlanManager) {
    $scope.profileCheckToggleStatus = false;
    $scope.token = decodeURIComponent($routeParams.x);
    $scope.auth = decodeURIComponent($routeParams.y);
    $scope.domain = decodeURIComponent($routeParams.d);
    if ($scope.token !== undefined && $scope.auth !== "undefined" && $scope.domain !== undefined) {
        //check if logged in
        if (!userInfoService.isAuthenticated()) {
            $scope.$emit('event:loginRequestWithAuth', $scope.auth, '/addcbprofiles?x=' + $scope.token + '&d=' + $scope.domain);
        } else {
            $location.url('/addcbprofiles?x=' + $scope.token + '&d=' + $scope.domain);
        }
    }
    else if ($scope.token !== undefined && $scope.auth === "undefined" && $scope.domain !== undefined){ // no auth
        var modalInstance = $modal.open({
            templateUrl: 'views/cb/manage/savingTestPlanModal.html',
            windowClass: 'upload-modal',
            backdrop: 'static',
            keyboard: false
        });


        CBTestPlanManager.saveZip($scope.token,$scope.domain).then(function (response) {
            modalInstance.close();
            if (response.status == "FAILURE") {
                Notification.error({
                    message: "An error occured while adding the Test Plan. Please try again or contact the administator for help",
                    templateUrl: "NotificationErrorTemplate.html",
                    scope: $rootScope,
                    delay: 10000
                });
                $scope.error = "Could not saved the zip, please try again";
                modalInstance.close();
            } else {
                Notification.success({
                    message: "Test Plan added successfully!",
                    templateUrl: "NotificationSuccessTemplate.html",
                    scope: $rootScope,
                    delay: 5000
                });
                modalInstance.close();
                $location.url('/cb?scope=USER&group='+response.id);
                //set private
                //                		$scope.selectedScope.key = $scope.testPlanScopes[1].key;
            }
        }, function (error) {
            $scope.error = "Could not saved the zip, please try again";
            modalInstance.close();
        });
    }




//            $location.url('/addcbprofiles?x=' + $scope.token + '&d=' + $scope.domain);







//	  if ($scope.token !== undefined && $scope.auth !== undefined) {
//
//
//	    //check if logged in
//	    if (!userInfoService.isAuthenticated()) {
//	      $scope.$emit('event:loginRequestWithAuth', $scope.auth, '/addcbprofiles?x=' + $scope.token + '&d=' + $scope.domain);
//	    } else {
//	      $location.url('/addcbprofiles?x=' + $scope.token + '&d=' + $scope.domain);
//	    }
//	  }
}]);