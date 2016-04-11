'use strict';

angular.module('cb')
    .controller('CBTestingCtrl', ['$scope', '$window', '$rootScope', 'CB', 'StorageService', '$timeout', 'TestCaseService', 'TestStepService', function ($scope, $window, $rootScope, CB, StorageService, $timeout, TestCaseService, TestStepService) {

        $scope.testCase = null;

        $scope.initTesting = function () {
            var tab = StorageService.get(StorageService.ACTIVE_SUB_TAB_KEY);
            if (tab == null || tab != '/cb_execution') tab = '/cb_testcase';
            $rootScope.setSubActive(tab);
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

        $scope.setSubActive = function (tab) {
            $rootScope.setSubActive(tab);
            if (tab === '/cb_execution') {
                $scope.$broadcast('cb:refreshEditor');
            }
        };

    }]);


angular.module('cb')
    .controller('CBExecutionCtrl', ['$scope', '$window', '$rootScope', 'CB', '$modal', 'TestExecutionClock', 'Endpoint', 'TestExecutionService', '$timeout', 'StorageService', 'User', 'ReportService', 'SOAPEscaper', 'TestCaseDetailsService', '$compile', 'Transport', '$filter', function ($scope, $window, $rootScope, CB, $modal, TestExecutionClock, Endpoint, TestExecutionService, $timeout, StorageService, User, ReportService, SOAPEscaper, TestCaseDetailsService, $compile, Transport, $filter) {
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
        $scope.counterMax = 120; // 2min
        $scope.counter = 0;
        $scope.listenerReady = false;
        $scope.testStepListCollapsed = false;
        $scope.warning = null;
        $scope.sutInititiatorForm = '';
        $scope.taInititiatorForm = '';
        $scope.user = User;
        $scope.domain = null;
        $scope.protocol = StorageService.get(StorageService.TRANSPORT_PROTOCOL) != null && StorageService.get(StorageService.TRANSPORT_PROTOCOL) != undefined ?StorageService.get(StorageService.TRANSPORT_PROTOCOL):null;
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
            $scope.setTestStepExecutionTab(0);
            var testContext = testStep['testContext'];
            if (testContext && testContext != null) {

//                if(testStep.testingType === 'TA_RESPONDER'){
//                    if(TestExecutionService.getTestStepExecutionMessage(testStep) != undefined){
//
//                    }
//
//                }
//
                // $timeout(function () {
//                    if(testStep.testingType === 'TA_RESPONDER'){
//                        $rootScope.$emit('cb:initValidationReport', TestExecutionService.getTestStepValidationReportObject(testStep), testStep);
//                    }
                $scope.$broadcast('cb:testStepLoaded', testStep);
                $scope.$broadcast('cb:profileLoaded', testContext.profile);
                $scope.$broadcast('cb:valueSetLibraryLoaded', testContext.vocabularyLibrary);
                TestCaseDetailsService.removeHtml($scope.targ + '-exampleMessage');
                var exampleMessage = testContext.message && testContext.message.content && testContext.message.content != null ? testContext.message.content : null;
                if (exampleMessage != null) {
                    $scope.$broadcast($scope.targ + '-exampleMessage', exampleMessage, testContext.format, testStep.name);
                }
                //});
            } else { // manual testing ?
                // $timeout(function () {
                var report = TestExecutionService.getTestStepValidationReportObject(testStep);
                report = report != undefined ? report : null;
                $rootScope.$emit('cb:initValidationReport', report, testStep);
                // });
            }

            var exampleMsgId = $scope.targ + '-exampleMessage';
            //if (testStep['testStory'] === undefined || testStep['testStory'] === null) {
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
//            }else{
//                $scope.loadTestStepDetails(testStep);
//            }
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
                            $scope.testExecutionService.setTestStepExecutionMessage(con);
                            $scope.loadTestStepExecutionPanel(testStep);
                        }
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
            if (!$scope.isLastStep(row)) {
                $scope.executeTestStep($scope.findNextStep(row.position));
            } else {
                $scope.completeTestCase();
            }
        };

        $scope.goBack = function (row) {
            if (!$scope.isFirstStep(row)) {
                $scope.executeTestStep($scope.findPreviousStep(row.position));
            }
        };

        $scope.executeTestStep = function (testStep) {
//            $timeout(function () {
            TestExecutionService.initTestStep(testStep).then(function (report) {
//                $timeout(function () {
//                    $rootScope.$emit($scope.type + ':initValidationReport', report, testStep);
//                });
                TestExecutionService.setTestStepValidationReportObject(testStep, report);
                CB.testStep = testStep;
                $scope.warning = null;
                if ($scope.isManualStep(testStep) || testStep.testingType === 'TA_RESPONDER') {
                    $scope.testExecutionService.setTestStepExecutionStatus(testStep, 'COMPLETE');
                }
                testStep.protocol = null;
                $scope.protocol = null;
                if (testStep.protocols != null && testStep.protocols && testStep.protocols.length > 0) {
                    var protocol = StorageService.get(StorageService.TRANSPORT_PROTOCOL) != null && StorageService.get(StorageService.TRANSPORT_PROTOCOL) != undefined ?StorageService.get(StorageService.TRANSPORT_PROTOCOL):null;
                    protocol = protocol != null && testStep.protocols.indexOf(protocol) > 0 ? protocol : null;
                    protocol = protocol != null ? protocol : $scope.getDefaultProtocol(testStep);
                    testStep['protocol'] = protocol;
                    $scope.selectProtocol(testStep);
                }
                var log = $scope.transport.logs[testStep.id];
                $scope.logger.content = log && log != null ? log : '';
                $scope.selectTestStep(testStep);
            }, function (error) {
                $scope.error = "Failed to load the test step, please try again.";
            });
//            });

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
            return row != null && $scope.testCase != null && $scope.testCase.children.length === row.position;
        };

        $scope.isFirstStep = function (row) {
            return row != null && $scope.testCase != null && row.position === 1;
        };


        $scope.isTestCaseSuccessful = function () {
            var status = $scope.testExecutionService.getTestCaseValidationResult($scope.testCase);
            return status == 'PASSED' ? true : false;
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


//        $scope.initExecution = function () {
//            if (CB.editor != null && CB.editor.instance != null) {
//                CB.editor.instance.setOption("readOnly", false);
//            }
//            $scope.loadingExecution = true;
//            $scope.error = null;
//            TestExecutionService.clear($scope.testCase).then(function (res) {
//                $scope.loadingExecution = false;
//                $scope.error = null;
//            }, function (error) {
//                $scope.loadingExecution = false;
//                $scope.error = null;
//            });
//        };


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
            return  $scope.outboundMessage() != null && $scope.outboundMessage() != '';
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
                    $scope.connecting = false;
                    $scope.transport.logs[$scope.testStep.id] = $scope.logger.content;
                    $scope.logger.log("Transaction completed");
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
//
//            $scope.logger.content = $scope.transport.logs[testStepId];
        };


        $scope.openConsole = function (testStep) {
            if ($scope.consoleDlg && $scope.consoleDlg !== null && $scope.consoleDlg.opened) {
                $scope.consoleDlg.dismiss('cancel');
            }
            $scope.consoleDlg = $modal.open({
                templateUrl: 'CurrentTestStepConsole.html',
                controller: 'CurrentTestStepConsoleCtrl',
                windowClass: 'console-modal',
                size: 'sm',
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
//
//            $scope.logger.content = $scope.transport.logs[testStepId];
        };


        $scope.stopListener = function () {
            $scope.connecting = false;
            $scope.counter = $scope.counterMax;
            TestExecutionClock.stop();
            $scope.logger.log("Stopping listener. Please wait....");
            $scope.transport.stopListener($scope.testStep.id, $scope.domain, $scope.protocol).then(function (response) {
                $scope.logger.log("Listener stopped.");
                $scope.transport.logs[$scope.testStep.id] = $scope.logger.content;
            }, function (error) {
            });
        };

        $scope.updateTestStepValidationReport = function (testStep) {
            StorageService.set("testStepValidationResults", angular.toJson(TestExecutionService.testStepValidationResults));
            StorageService.set("testStepComments", angular.toJson(TestExecutionService.testStepComments));
            if ($scope.testStep  === null || testStep.id !== $scope.testStep.id) {
                TestExecutionService.updateTestStepValidationReport(testStep);
            } else {
                $rootScope.$emit('cb:updateTestStepValidationReport', null, testStep);
            }
            //TestExecutionService.updateTestStepValidationReport(testStep).then(function(report){
//            if (testStep.id === $scope.testStep.id) { // open only current test step report display
//                $rootScope.$emit('cb:updateTestStepValidationReport', null, testStep);
//            }
            //});
        };

        $scope.abortListening = function () {
            $scope.testExecutionService.deleteTestStepExecutionStatus($scope.testStep);
            $scope.stopListener();
        };

        $scope.completeListening = function () {
            $scope.testExecutionService.setTestStepExecutionStatus($scope.testStep, "COMPLETE");
            $scope.stopListener();
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
                                ++$scope.counter;
                                $scope.logger.log("Waiting for Inbound Message....Elapsed time(second):" + $scope.counter + "s");
                                var sutInitiator = null;
                                try {
                                    sutInitiator = $scope.transport.configs[$scope.domain][$scope.protocol].data.sutInitiator;
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
                                                $scope.setNextStepMessage(sentMessage);
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
                        return  $scope.testCase.children[i];
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
                ReportService.downloadTestCaseReports($scope.testCase.id, format, result, comments);
            }
        };

        $scope.toggleTransport = function (disabled) {
            $scope.transport.disabled = disabled;
            StorageService.set(StorageService.TRANSPORT_DISABLED, disabled);
            if (CB.editor.instance != null) {
                CB.editor.instance.setOption("readOnly", !disabled);
            }
        };

    }]);


angular.module('cb')
    .controller('CBTestCaseCtrl', ['$scope', '$window', '$filter', '$rootScope', 'CB', '$timeout', 'CBTestCaseListLoader', '$sce', 'StorageService', 'TestCaseService', 'TestStepService', 'TestExecutionService', function ($scope, $window, $filter, $rootScope, CB, $timeout, CBTestCaseListLoader, $sce, StorageService, TestCaseService, TestStepService, TestExecutionService) {
        $scope.selectedTestCase = CB.selectedTestCase;
        $scope.testCase = CB.testCase;
        $scope.testCases = [];
        $scope.tree = {};
        $scope.loading = true;
        $scope.loadingTC = false;
        $scope.error = null;
        $scope.collapsed = false;

        var testCaseService = new TestCaseService();

        $scope.initTestCase = function () {
            $scope.error = null;
            $scope.loading = true;
            var tcLoader = new CBTestCaseListLoader();
            tcLoader.then(function (testCases) {
                $scope.error = null;
                angular.forEach(testCases, function (testPlan) {
                    testCaseService.buildTree(testPlan);
                });
                $scope.testCases = testCases;
                $scope.refreshTree();
            }, function (error) {
                $scope.loading = false;
                $scope.error = "Sorry, Cannot load the test cases. Please try again";
            });

        };


        $scope.refreshTree = function () {
            $timeout(function () {
                if ($scope.testCases != null) {
                    if (typeof $scope.tree.build_all == 'function') {
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
                        $scope.error = "Ooops, Something went wrong. Please refresh your page again.";
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
            var id = StorageService.get(StorageService.CB_LOADED_TESTCASE_ID_KEY);
            var type = StorageService.get(StorageService.CB_LOADED_TESTCASE_TYPE_KEY);
            StorageService.set(StorageService.CB_LOADED_TESTCASE_ID_KEY, testCase.id);
            StorageService.set(StorageService.CB_LOADED_TESTCASE_TYPE_KEY, testCase.type);
            if (clear === undefined || clear === true) {
                StorageService.remove(StorageService.CB_EDITOR_CONTENT_KEY);
                var previousId = StorageService.get(StorageService.CB_LOADED_TESTCASE_ID_KEY);
                TestExecutionService.clear(previousId);
                StorageService.remove(StorageService.CB_LOADED_TESTSTEP_ID_KEY);
            }
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


    }]);


angular.module('cb')
    .controller('CBValidatorCtrl', ['$scope', '$http', 'CB', '$window', '$timeout', '$modal', 'NewValidationResult', '$rootScope', 'ServiceDelegator', 'StorageService', 'TestExecutionService', function ($scope, $http, CB, $window, $timeout, $modal, NewValidationResult, $rootScope, ServiceDelegator, StorageService, TestExecutionService) {

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
                        coordinate.lineNumber = coordinate.line;
                        coordinate.startIndex = coordinate.startIndex + 1;
                        coordinate.endIndex = coordinate.endIndex + 1;
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
                        $scope.setTestStepValidationReport(TestExecutionService.getTestStepValidationReport($scope.testStep));
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
                if (mvResult != null) {
                    TestExecutionService.setTestStepExecutionStatus($scope.testStep, 'COMPLETE');
                    TestExecutionService.setTestStepValidationReport($scope.testStep, mvResult);
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
            StorageService.set(StorageService.CB_EDITOR_CONTENT_KEY, $scope.cb.message.content);
            $scope.refreshEditor();
            if (!$scope.isTestCase() || !$scope.isTestCaseCompleted()) {
                TestExecutionService.setTestStepExecutionMessage($scope.testStep, $scope.cb.message.content);
//                TestExecutionService.deleteTestStepValidationReport($scope.testStep);
//                TestExecutionService.deleteTestStepMessageTree($scope.testStep);
                $scope.validateMessage();
                $scope.parseMessage();
            } else {
                $scope.setTestStepValidationReport(TestExecutionService.getTestStepValidationReport($scope.testStep));
                $scope.setTestStepMessageTree(TestExecutionService.getTestStepMessageTree($scope.testStep));
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
                    content = content && content != null ? content : '';
                }
                if ($scope.editor) {
                    $scope.editor.doc.setValue(content);
                    $scope.execute();
                }
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
            $scope.report = TestExecutionService.getTestStepValidationReport(testStep) === undefined || TestExecutionService.getTestStepValidationReport(testStep) === null ? {"result": { "value": "", "comments": ""}, "html": null} : TestExecutionService.getTestStepValidationReport(testStep);
        });

        $scope.save = function () {
            $scope.saving = true;
            $scope.saved = false;
            $scope.error = null;
            ManualReportService.save($scope.report.result, $scope.testStep).then(function (report) {
                $scope.report["id"] = report.id;
                $scope.report["xml"] = report.xml;
                TestExecutionService.setTestStepExecutionStatus($scope.testStep, 'COMPLETE');
                var rep = angular.copy($scope.report);
                TestExecutionService.setTestStepValidationReport($scope.testStep, rep);
                $timeout(function () {
                    $rootScope.$emit('cb:manualReportLoaded', rep, $scope.testStep.id);
                });
                $scope.saving = false;
                $scope.saved = true;
            }, function (error) {
                $scope.error = error;
                $scope.saving = false;
                $scope.saved = false;
            });
        };


    }]);

angular.module('cb')
    .controller('CBManualReportCtrl', ['$scope', '$sce', '$http', 'CB', function ($scope, $sce, $http, CB) {
        $scope.cb = CB;
    }]);