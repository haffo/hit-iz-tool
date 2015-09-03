'use strict';

angular.module('isolated')
    .controller('IsolatedSystemTestingCtrl', ['$scope', '$window', '$rootScope', 'IsolatedSystem', function ($scope, $window, $rootScope, IsolatedSystem) {

        $scope.getTestType = function () {
            return IsolatedSystem.testCase.type;
        };

        $scope.init = function () {
            $scope.error = null;
            $scope.loading = false;
            $rootScope.setSubActive('/isolated_testcase');

            $rootScope.$on('isolated:testCaseLoaded', function (event, testCase) {
                if (testCase != null && testCase.id != null) {
                    $rootScope.setSubActive('/isolated_execution');
                }
            });
        };

        $scope.disabled = function () {
            return IsolatedSystem.testCase == null || IsolatedSystem.testCase.id === null;
        };

    }]);


angular.module('isolated')
    .controller('IsolatedSystemTestCaseCtrl', ['$scope', '$filter', '$window', '$rootScope', 'IsolatedSystem', 'ngTreetableParams', '$timeout', 'IsolatedSystemTestCaseListLoader', function ($scope, $filter, $window, $rootScope, IsolatedSystem, ngTreetableParams, $timeout, IsolatedSystemTestCaseListLoader) {
        $scope.selectedTestCase = IsolatedSystem.selectedTestCase;
        $scope.testCase = IsolatedSystem.testCase;
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
                obj["children"] = $filter('orderBy')(obj["children"], 'position');
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
                obj["children"] = $filter('orderBy')(obj["children"], 'position');
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
                obj["children"] = $filter('orderBy')(obj["children"], 'position');
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
                    if(node.type  === 'TestCase'){
                        return 'IsolatedTestCase.html';
                    }else if(node.type === 'TestStep'){
                        return node.connectionType === 'TA_MANUAL' || node.connectionType === 'SUT_MANUAL' ? 'IsolatedManualTestStep.html': node.connectionType === 'TA_INITIATOR' || node.connectionType === 'SUT_INITIATOR' ? 'IsolatedInitiatorTestStep.html' : node.connectionType === 'TA_RESPONDER' || node.connectionType === 'SUT_RESPONDER' ? 'IsolatedResponderTestStep.html':'IsolatedResponderTestStep.html';
                    }else if(node.type === 'TestPlan' || node.type === 'TestCaseGroup'){
                        return 'IsolatedTestPlanOrTestCaseGroup.html';
                    }
                 }
            });

            var tcLoader = new IsolatedSystemTestCaseListLoader();
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
                if ($scope.editor) {
                    $scope.editor.refresh();
                }
            }, 1000);
        };

        $scope.selectTestCase = function (node) {
            $scope.selectedTestCase = node;
            $timeout(function() {
                $rootScope.$broadcast('isolated:testCaseSelected', $scope.selectedTestCase);
            });
        };

        $scope.loadTestCase = function () {
            $scope.testCase = angular.copy($scope.selectedTestCase);
            $timeout(function() {
                $rootScope.$broadcast('isolated:testCaseLoaded', $scope.testCase);
            });
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

    }]);


angular.module('isolated')
    .controller('IsolatedSystemExecutionCtrl', ['$scope', '$window', '$rootScope', 'IsolatedSystem', '$modal', 'IsolatedSystemInitiator', 'IsolatedSystemClock', 'XmlEscaper', 'Endpoint', 'IsolatedExecutionService', '$timeout', function ($scope, $window, $rootScope, IsolatedSystem, $modal, IsolatedSystemInitiator, IsolatedSystemClock, XmlEscaper, Endpoint, IsolatedExecutionService,$timeout) {
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

        var inboundLogs = [
            "Configuring connection. Please wait...",
            "Connection configured.",
            "Waiting for incoming message....Elapsed time(second):",
            "<-------------------------------------- Inbound Message ",
            "Inbound SOAP Envelope is Invalid",
            "Outbound SOAP Envelope is Invalid",
            "Transaction completed",
                "We did not receive any incoming message after 30s. <p>Possible cause (1): You are using wrong credentials. Please check the credentials in your outbound SOAP Envelope against those created for your system.</p>  <p>Possible cause (2):The SOAP endpoint address may be incorrect.   Verify that you are using the correct SOAP endpoint address that is displayed by the tool.</p>" +
                "<p>Possible cause (3):The HTTP header field Content-Type  may not be set correctly for use with SOAP 1.2.   SOAP 1.2 requires application/soap+xml, and SOAP 1.2 requires text/xml.  The NIST Tool follows SOAP 1.2, which is required by section 2 of the 'CDC Transport Layer Protocol Recommendation V1.1' (http://www.cdc.gov/vaccines/programs/iis/technical-guidance/SOAP/downloads/transport-specification.pdf)</p>",
            "We did not receive any incoming message after 30s",
            "We were unable to send the response after 30s",
            "Failed to configure incoming connection. ",
            "Transaction aborted",
            "Outbound Message  -------------------------------------->",
            "Transaction stopped",
            "Stopping transaction. Please wait...."
        ];

        var outboundLogs = [
            "Outbound Message ========================>",
            "Outbound message sent successfully.",
            "Inbound message received <========================",
            "Transaction completed",
            "Incorrect SOAP Envelope received",
            "Transaction aborted",
            "Transaction stopped"
        ];


        var errors = [
            "Incorrect SOAP Envelope Received. Please check the log for more details",
            "No Outbound message found",
            "Invalid SOAP Envelope Received. Please see console for more details.",
            "Invalid SOAP Envelope Sent. Please see console for more details."
        ];

        var parseRequest = function (incoming) {
            var x2js = new X2JS();
            var receivedJson = x2js.xml_str2json(incoming);
            var receivedMessage = XmlEscaper.decodeXml(receivedJson.Envelope.Body.submitSingleMessage.hl7Message.toString());
            return receivedMessage;
        };

        var parseResponse = function (outbound) {
            var x2js = new X2JS();
            var sentMessageJson = x2js.xml_str2json(outbound);
            var sentMessage = XmlEscaper.decodeXml(sentMessageJson.Envelope.Body.submitSingleMessageResponse.return.toString());
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
            $timeout(function() {
                $rootScope.$broadcast('isolated:testCaseLoaded', $scope.testCase);
            });
        };

        $scope.selectTestStep = function (testStep) {
            IsolatedSystem.testStep = testStep;
            $scope.testStep = testStep;
            if (testStep != null) {
                if (testStep.executionMessage === undefined && testStep['connectionType'] === 'TA_INITIATOR') {
                    IsolatedExecutionService.setExecutionMessage(testStep, testStep.testContext.message.content);
                }
                if (!$scope.isManualStep(testStep) && testStep.testContext && testStep.testContext != null) {
                    $timeout(function() {
                        $rootScope.$broadcast('isolated:testStepLoaded', testStep);
                    });
                    $timeout(function() {
                        $rootScope.$broadcast('isolated:profileLoaded', testStep.testContext.profile);
                    });
                    $timeout(function() {
                        $rootScope.$broadcast('isolated:valueSetLibraryLoaded', testStep.testContext.vocabularyLibrary);
                    });
                }
            }
        };

        $scope.clearTestStep = function () {
            IsolatedSystem.testStep = null;
            $scope.testStep = null;
            $timeout(function() {
                $rootScope.$broadcast('isolated:removeTestStep');
            });
        };


        $scope.getExecutionStatus = function (testStep) {
            return IsolatedExecutionService.getExecutionStatus(testStep);
        };

        $scope.getValidationStatus = function (testStep) {
            return IsolatedExecutionService.getValidationStatus(testStep);
        };


        $scope.isManualStep = function (testStep) {
            return testStep['connectionType'] === 'TA_MANUAL' || testStep['connectionType'] === 'SUT_MANUAL';
        };

        $scope.isSutInitiator = function (testStep) {
            return testStep['connectionType'] == 'SUT_INITIATOR';
        };

        $scope.isStepCompleted = function (testStep) {
            return $scope.getExecutionStatus(testStep) == 'COMPLETE';
        };

        $scope.completeStep = function (row) {
            IsolatedExecutionService.setExecutionStatus(row, 'COMPLETE');
        };

        $scope.completeManualStep = function (row) {
            $scope.completeStep(row);
        };

        $scope.progressStep = function (row) {
            IsolatedExecutionService.setExecutionStatus(row, 'IN_PROGRESS');
        };


        $scope.executeNextTestStep = function (row) {
            $scope.testStepListCollapsed = false;
            if ($scope.isManualStep(row)) {
                $scope.completeStep(row);
            }
            if (!$scope.isLastStep(row)) {
                $scope.executeTestStep($scope.findNextStep(row.position));
            } else {
                $scope.testCase.executionStatus = 'COMPLETE';
                $scope.clearTestStep();
            }
        };

        $scope.executeTestStep = function (testStep) {
            $scope.warning = null;
            $scope.logger.clear();
            if (testStep != null) {
                if (!$scope.isManualStep(testStep)) {
                    IsolatedExecutionService.deleteValidationReport(testStep);
                    if ($scope.isSutInitiator(testStep)) {
                        IsolatedExecutionService.setExecutionMessage(testStep, null);
                    }
                    $timeout(function() {
                        $rootScope.$broadcast('isolated:clearEditor');
                    });
                }
                $scope.selectTestStep(testStep);
            }
        };

        $scope.isTestCaseCompleted = function () {
            return $scope.testCase && $scope.testCase.executionStatus === 'COMPLETE';
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

        $scope.clearExecution = function () {
            if ($scope.testCase != null) {
                for (var i = 0; i < $scope.testCase.children.length; i++) {
                    var testStep = $scope.testCase.children[i];
                    IsolatedExecutionService.deleteExecutionStatus(testStep);
                    IsolatedExecutionService.deleteValidationReport(testStep);
                    IsolatedExecutionService.deleteExecutionMessage(testStep);
                    IsolatedExecutionService.deleteMessageTree(testStep);
                }
                delete $scope.testCase.executionStatus;
            }
        };

        $scope.init = function () {
            $scope.error = null;
            $scope.loading = false;
            $scope.setActiveTab(0);
            $scope.user.init().then(function (response) {
                $scope.endpoint = $scope.user.endpoint;
            }, function (error) {
                $scope.error = error;
            });

            $rootScope.$on('isolated:testCaseLoaded', function (event, testCase) {
                if (testCase != null) {
                    $scope.clearExecution();
                    IsolatedSystem.testCase = testCase;
                    $scope.testCase = testCase;
                    $scope.testStep = null;
                    $scope.logger.clear();
                    $scope.loading = true;
                    $scope.error = null;
                    $scope.connecting = false;
                    if ($scope.user.transaction.running) {
                        IsolatedSystemClock.stop();
                        $scope.user.transaction.closeConnection().then(function (response) {
                        }, function (error) {
                        });
                    }
                    var testStep = $scope.testCase.children[0];
                    $scope.executeTestStep(testStep);
                }
            });
        };


        $scope.setNextStepMessage = function (message) {
            $scope.completeStep($scope.testStep);
            var nextStep = $scope.findNextStep($scope.testStep.position);
            if (nextStep != null && !$scope.isManualStep(nextStep)) {
                IsolatedExecutionService.setExecutionMessage(nextStep, message);
                $scope.completeStep(nextStep);
            }
        };


        $scope.log = function (log) {
            $scope.logger.log(log);
        };

        $scope.isValidConfig = function () {
            return $scope.user.receiverEndpoint != null && $scope.user.receiverEndpoint != '';
        };

        $scope.outboundMessage = function () {
            return $scope.testStep != null ? $scope.testStep.testContext.message.content : null;
        };

        $scope.isValidConfig = function () {
            return $scope.user != null && $scope.user.receiverEndpoint != null && $scope.user.receiverEndpoint != '';
        };
        $scope.hasRequestContent = function () {
            return  $scope.outboundMessage() != null && $scope.outboundMessage() != '';
        };

        $scope.send = function () {
            $scope.configCollapsed = false;
            $scope.connecting = true;
            $scope.progressStep($scope.testStep);
            $scope.error = null;
            if ($scope.user.receiverEndpoint != '' && $scope.hasRequestContent()) {
                $scope.logger.init();
                $scope.received = '';
                $scope.logger.log(outboundLogs[0]);
                var sender = new IsolatedSystemInitiator().send($scope.user, $scope.testStep.id,$scope.outboundMessage());
                sender.then(function (response) {
                    var received = response.incoming;
                    var sent = response.outgoing;
                    $scope.logger.log(outboundLogs[1]);
                    $scope.logger.log(sent);
                    $scope.logger.log(outboundLogs[2]);
                    $scope.logger.log(received);
                    try {
                        var rspMessage = parseResponse(received);
                        $scope.logger.log(outboundLogs[3]);
                        $scope.setNextStepMessage(rspMessage);
                    } catch (error) {
                        $scope.error = errors[0];
                        $scope.logger.log(outboundLogs[4]);
                        $scope.logger.log(outboundLogs[3]);
                    }
                    $scope.connecting = false;
                }, function (error) {
                    $scope.connecting = false;
                    $scope.error = error.data;
                    $scope.logger.log("Error: " + error.data);
                    $scope.received = '';
                    $scope.completeStep($scope.testStep);
                    $scope.logger.log(outboundLogs[5]);
                });
            } else {
                $scope.error = errors[1];
                $scope.connecting = false;
            }
        };


        $scope.stopListening = function () {
            //$scope.configCollapsed = $scope.counter != $scope.counterMax;
            $scope.connecting = false;
            $scope.counter = $scope.counterMax;
            IsolatedSystemClock.stop();
            $scope.log(inboundLogs[14]);
            $scope.user.transaction.closeConnection().then(function (response) {
                $scope.log(inboundLogs[13]);
            }, function (error) {
            });
        };

        $scope.startListening = function () {
            var nextStep = $scope.findNextStep($scope.testStep.position);
            var rspMessageId = nextStep.testContext.message.id;
            $scope.configCollapsed = false;
            $scope.logger.clear();
            $scope.counter = 0;
            $scope.connecting = true;
            $scope.error = null;
            $scope.warning = null;
            var received = '';
            var sent = '';
            $scope.log(inboundLogs[0]);
            $scope.user.transaction.openConnection(rspMessageId).then(function (response) {
                    $scope.log(inboundLogs[1]);
                    var execute = function () {
                        ++$scope.counter;
                        $scope.log(inboundLogs[2] + $scope.counter + "s");
                        $scope.user.transaction.messages().then(function (response) {
                            var incoming = $scope.user.transaction.incoming;
                            var outbound = $scope.user.transaction.outgoing;
                            if ($scope.counter < $scope.counterMax) {
                                if (incoming != null && incoming != '' && received == '') {
                                    $scope.log(inboundLogs[3]);
                                    $scope.log(incoming);
                                    received = incoming;
                                    try {
                                        var receivedMessage = parseRequest(incoming);
                                        IsolatedExecutionService.setExecutionMessage($scope.testStep, receivedMessage);
                                        $scope.completeStep($scope.testStep);
                                        $timeout(function() {
                                            $rootScope.$broadcast('isolated:setEditorContent', receivedMessage);
                                        });
                                    } catch (error) {
                                        $scope.error = errors[2];
                                        $scope.logger.log(inboundLogs[4]);
                                    }
                                }
                                if (outbound != null && outbound != '' && sent == '') {
                                    $scope.log(inboundLogs[12]);
                                    $scope.log(outbound);
                                    sent = outbound;
                                    try {
                                        var sentMessage = parseResponse(outbound);
                                        $scope.setNextStepMessage(sentMessage);
                                    } catch (error) {
                                        $scope.error = errors[3];
                                        $scope.logger.log(inboundLogs[5]);
                                        $scope.logger.log(inboundLogs[6]);
                                    }
                                }
                                if (incoming != '' && outbound != '' && incoming != null && outbound != null) {
                                    $scope.stopListening();
                                }
                            } else {
                                if (incoming == null || incoming == '') {
                                    $scope.warning = inboundLogs[7];
                                    $scope.log(inboundLogs[8]);
                                } else if (outbound == null || outbound == '') {
                                    $scope.log(inboundLogs[9]);
                                }
                                $scope.stopListening();
                            }
                        }, function (error) {
                            $scope.error = error;
                            $scope.log("Error: " + error);
                            $scope.received = '';
                            $scope.sent = '';
                            $scope.stopListening();
                        });
                    };
                    IsolatedSystemClock.start(execute);
                }, function (error) {
                    $scope.log(inboundLogs[10] + "Error: " + error);
                    $scope.log(inboundLogs[11]);
                    $scope.connecting = false;
                    $scope.error = error;
                }
            );
        };

        $scope.configureReceiver = function () {
            var modalInstance = $modal.open({
                templateUrl: 'TransactionConfigureReceiver.html',
                controller: 'IsolatedSystemConfigureReceiverCtrl',
                resolve: {
                    testCase: function () {
                        return IsolatedSystem.testStep;
                    },
                    user: function () {
                        return IsolatedSystem.user;
                    }
                }
            });
            modalInstance.result.then(function (user) {
                IsolatedSystem.user.senderUsername = user.senderUsername;
                IsolatedSystem.user.senderPassword = user.senderPassword;
                IsolatedSystem.user.senderFacilityID = user.senderFacilityID;
                IsolatedSystem.user.receiverUsername = user.receiverUsername;
                IsolatedSystem.user.receiverPassword = user.receiverPassword;
                IsolatedSystem.user.receiverFacilityId = user.receiverFacilityId;
                IsolatedSystem.user.receiverEndpoint = user.receiverEndpoint;
                IsolatedSystem.response.setContent('');
            }, function () {
                IsolatedSystem.response.setContent('');
            });
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


    }]);

angular.module('isolated')
    .controller('IsolatedSystemValidatorCtrl', ['$scope', '$http', 'IsolatedSystem', '$window', 'HL7EditorUtils', 'HL7CursorUtils', '$timeout', 'HL7TreeUtils', '$modal', 'NewValidationResult', '$rootScope', 'Er7MessageValidator', 'Er7MessageParser', 'IsolatedExecutionService', function ($scope, $http, IsolatedSystem, $window, HL7EditorUtils, HL7CursorUtils, $timeout, HL7TreeUtils, $modal, NewValidationResult, $rootScope, Er7MessageValidator, Er7MessageParser, IsolatedExecutionService) {
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
        $scope.messageObject = [];
        $scope.tError = null;
        $scope.tLoading = false;

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
                    data.url = 'api/hl7/message/upload';
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
                    var message = IsolatedExecutionService.getExecutionMessage($scope.testStep);
                    message = message && message != null ? message : '';
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
                mode: 'edi',
                readOnly: true,
                showCursorWhenSelecting: true
            });
            $scope.editor.setSize("100%", 350);
            $scope.editor.on("dblclick", function (editor) {
                $timeout(function () {
                    var coordinate = HL7CursorUtils.getCoordinate($scope.editor);
                    $scope.isolated.cursor.init(coordinate.line, coordinate.startIndex, coordinate.endIndex, coordinate.index, true);
                    HL7TreeUtils.selectNodeByIndex($scope.isolated.tree.root, IsolatedSystem.cursor, IsolatedSystem.message.content);
                });
            });
            $scope.isolated.editor.instance = $scope.editor;
            $scope.refreshEditor();
        };

        $scope.validateMessage = function () {
            if ($scope.testStep != null) {
                $timeout(function () {
                    $scope.vLoading = true;
                    $scope.vError = null;
                    if (IsolatedExecutionService.getValidationResult($scope.testStep) != undefined) { // validation result exit ?
                        $scope.loadValidationResult(IsolatedExecutionService.getValidationResult($scope.testStep).json);
                        $scope.vLoading = false;
                    } else {
                        if ($scope.isolated.message.content !== '') {
                            try {
                                var validator = new Er7MessageValidator().validate($scope.testStep.testContext.id, $scope.isolated.message.content, '', false, "1223","Based");
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
                    }
                }, 100);
            }
        };

        $scope.loadValidationResult = function (mvResult) {
            if ($scope.testStep != null) {
                $timeout(function() {
                    $rootScope.$broadcast('isolated:validationResultLoaded', mvResult);
                });
            }
        };


        $scope.loadMessageObject = function (messageObject) {
            if ($scope.testStep != null) {
                $scope.messageObject = messageObject;
                var tree = messageObject && messageObject != null && messageObject.length > 0 ? messageObject : undefined;
                IsolatedExecutionService.setMessageTree($scope.testStep, tree);
            }
        };

        $scope.select = function (element) {
            if (element != undefined && element.path != null && element.line != -1) {
                var node = HL7TreeUtils.selectNodeByPath($scope.isolated.tree.root, element.line, element.path);
                var data = node != null ? node.data : null;
                $scope.isolated.cursor.init(data != null ? data.lineNumber : element.line, data != null ? data.startIndex - 1 : element.column - 1, data != null ? data.endIndex - 1 : element.column - 1, data != null ? data.startIndex - 1 : element.column - 1, false);
                HL7EditorUtils.select($scope.editor, $scope.isolated.cursor);
            }
        };

        $scope.clearMessage = function () {
            $scope.nodelay = true;
            $scope.mError = null;
            if ($scope.editor) {
                $scope.editor.doc.setValue('');
                //$scope.execute();
            }
        };

        $scope.saveMessage = function () {
            $scope.isolated.message.download();
        };


        $scope.parseMessage = function () {
            if ($scope.testStep != null) {
                $timeout(function () {
                    $scope.tLoading = true;
                    if (IsolatedExecutionService.getMessageTree($scope.testStep) != undefined) { // model exist result exit ?
                        $scope.messageObject = IsolatedExecutionService.getMessageTree($scope.testStep);
                        $scope.tLoading = false;
                    } else {
                        if ($scope.isolated.message.content != '') {
                            var parsed = new Er7MessageParser().parse($scope.testStep.testContext.id, $scope.isolated.message.content);
                            parsed.then(function (value) {
                                $scope.tLoading = false;
                                $scope.loadMessageObject(value);
                            }, function (error) {
                                $scope.tLoading = false;
                                $scope.tError = error;
                                $scope.loadMessageObject([]);
                            });
                        } else {
                            $scope.loadMessageObject([]);
                            $scope.tError = null;
                            $scope.tLoading = false;
                        }
                    }
                }, 100);
            }
        };

        $scope.onNodeSelect = function (node) {
            var index = HL7TreeUtils.getEndIndex(node, $scope.isolated.message.content);
            $scope.isolated.cursor.init(node.data.lineNumber, node.data.startIndex - 1, index - 1, node.data.startIndex - 1, false);
            HL7EditorUtils.select($scope.editor, $scope.isolated.cursor);
        };

        $scope.execute = function () {
            $scope.error = null;
            $scope.tError = null;
            $scope.mError = null;
            $scope.vError = null;
            $scope.isolated.message.content = $scope.isolated.editor.instance.doc.getValue();
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

            $scope.loadValidationResult(null);

            $scope.$on('isolated:refreshEditor', function (event) {
                $scope.refreshEditor();
                event.preventDefault();
            });

            $scope.$on('isolated:clearEditor', function (event) {
                $scope.clearMessage();
                event.preventDefault();
            });

            $rootScope.$on('isolated:reportLoaded', function (event, report) {
                if ($scope.testStep != null) {
                    IsolatedExecutionService.setValidationReport($scope.testStep, report);
                    //IsolatedExecutionService.setValidationResult($scope.testStep, report != null ? report.result: undefined);
                }
            });

            $rootScope.$on('isolated:testStepLoaded', function (event, testStep) {
                $scope.refreshEditor();
                $scope.testStep = testStep;
                $scope.loadMessage();
            });


            $rootScope.$on('isolated:removeTestStep', function (event, testStep) {
                $scope.testStep = null;
            });

            $rootScope.$on('isolated:setEditorContent', function (event, message) {
                $scope.refreshEditor();
                $scope.nodelay = true;
                var content = message == null ? '' : message;
                $scope.editor.doc.setValue(content);
                $scope.isolated.message.id = null;
                $scope.isolated.message.name = '';
                $scope.execute();
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