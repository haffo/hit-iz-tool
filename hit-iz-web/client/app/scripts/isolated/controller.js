'use strict';

angular.module('isolated')
    .controller('IsolatedSystemTestingCtrl', ['$scope', '$window', '$rootScope', 'IsolatedSystem', function ($scope, $window, $rootScope, IsolatedSystem) {
        $scope.loading = true;
        $scope.error = null;
        $scope.tabs = new Array();

        $scope.setTestActiveTab = function (value) {
            $scope.tabs[0] = false;
            $scope.tabs[1] = false;
            $scope.activeTab = value;
            $scope.tabs[$scope.activeTab] = true;
        };


        $scope.getTestType = function () {
            return IsolatedSystem.testCase.type;
        };

        $scope.init = function () {
            $scope.error = null;
            $scope.loading = false;
            $scope.setTestActiveTab(0);

            $rootScope.$on('isolated:testCaseLoaded', function (event, testCase) {
                if (testCase != null && testCase.id != null) {
                    $scope.setTestActiveTab(1);
                }
            });
        };

        $scope.disabled = function () {
            return IsolatedSystem.testCase == null || IsolatedSystem.testCase.id === null;
        };

    }]);


angular.module('isolated')
    .controller('IsolatedSystemTestCaseCtrl', ['$scope', '$window', '$rootScope', 'IsolatedSystem', 'ngTreetableParams', '$timeout', 'IsolatedSystemTestCaseListLoader', function ($scope, $window, $rootScope, IsolatedSystem, ngTreetableParams, $timeout, IsolatedSystemTestCaseListLoader) {
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
                    return 'IsolatedSystemTestCase.html';
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
            $rootScope.$broadcast('isolated:testCaseSelected');
        };

        $scope.loadTestCase = function () {
            $scope.testCase = angular.copy($scope.selectedTestCase);
            $rootScope.$broadcast('isolated:testCaseLoaded', $scope.testCase);
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
    .controller('IsolatedSystemExecutionCtrl', ['$scope', '$window', '$rootScope', 'IsolatedSystem', '$modal', 'IsolatedSystemInitiator', 'IsolatedSystemClock', function ($scope, $window, $rootScope, IsolatedSystem, $modal, IsolatedSystemInitiator, IsolatedSystemClock) {
        $scope.loading = true;
        $scope.error = null;
        $scope.tabs = new Array();
        $scope.testCase = null;
        $scope.testStep = null;
        $scope.logger = IsolatedSystem.logger;
        $scope.connecting = false;
        $scope.error = null;
        $scope.endpoint = IsolatedSystem.serverEndpoint;
        $scope.user = IsolatedSystem.user;
        $scope.hidePwd = true;
        $scope.sent = null;
        $scope.received = null;
        $scope.configCollapsed = true;
        $scope.counterMax = 30;
        $scope.counter = 0;
        $scope.listenerReady = false;


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
            $rootScope.$broadcast('isolated:testCaseLoaded', $scope.testCase);
        };


        $scope.selectTestStep = function (testStep) {
            IsolatedSystem.testStep = testStep;
            $scope.testStep = testStep;
            if(testStep.testContext && testStep.testContext != null) {
                $rootScope.$broadcast('isolated:testStepLoaded', testStep);
                $rootScope.$broadcast('isolated:profileLoaded', testStep.testContext.profile);
                $rootScope.$broadcast('isolated:valueSetLibraryLoaded', testStep.testContext.vocabularyLibrary);
            }
        };

        $scope.getTransactionStatus = function (testStep) {
            return testStep ? testStep.transactionStatus : undefined;
        };

        $scope.getValidationStatus = function (testStep) {
            return  !testStep || !testStep.report || !testStep.report.result ? -1 : testStep.report.result.errors.categories[0].data.length;
        };


        $scope.executeNextTestStep = function (row) {
            var nextStep = $scope.findNextStep(row.position);
            $scope.executeTestStep(nextStep);
        };


        $scope.executeTestStep = function (testStep) {
            if (testStep != null) {
                //delete testStep['transactionStatus'];
                delete testStep['validationReport'];
                if (testStep.connectionType === 'SUT_INITIATOR') {
                    testStep.testContext.message.content = null;
                }
                $scope.selectTestStep(testStep);
                if (testStep.position === $scope.testCase.children.length) {
                    $scope.testCase.executionStatus = 'COMPLETE';
                }
            }
        };

        $scope.isTestCaseCompleted = function () {
            return $scope.testCase != null && $scope.testCase.executionStatus === 'COMPLETE';
        };

        $scope.isLastStep = function (row) {
            return row != null && $scope.testCase != null && $scope.testCase.children.length === row.position;
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


        $scope.init = function () {
            $scope.error = null;
            $scope.loading = false;
            $scope.setActiveTab(0);

            $rootScope.$on('isolated:testCaseLoaded', function (event, testCase) {
                if (testCase != null) {
                    delete testCase.executionStatus;
                    for (var i = 0; i < testCase.children.length; i++) {
                        delete testCase.children[i].transactionStatus;
                        delete testCase.children[i].report;
                    }
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

            $rootScope.$on('isolated:nextStep', function (event, message) {
                var nextStep = $scope.findNextStep($scope.testStep.position);
                if (nextStep != null) {
                    //$scope.executeTestStep(nextStep);
                    if (nextStep.testContext && nextStep.testContext.message) {
                        nextStep.testContext.message.content = message;
                        nextStep.transactionStatus = "COMPLETE";
                    }
                }
            });

            $scope.user.init().then(function (response) {
            }, function (error) {
                $scope.error = error;
            });
        };

        $scope.log = function (log) {
            $scope.logger.log(log);
        };

//        $scope.initOutgoingEnvironment = function () {
//            $scope.logger.clear();
//            IsolatedSystem.response.setContent('');
//            IsolatedSystem.request.setContent(IsolatedSystem.testStep.testContext.message);
//        };
//
//        $scope.initInboundEnvironment = function () {
//            IsolatedSystem.request.setContent('');
//            IsolatedSystem.response.setContent('');
//            $scope.logger.clear();
//            $scope.error = null;
//        };

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
            $scope.testStep['transactionStatus'] = 'IN_PROGRESS';
            $scope.error = null;
            if ($scope.user.receiverEndpoint != '' && $scope.hasRequestContent()) {
                $scope.logger.init();
                $scope.received = '';
                $scope.logger.log("Outbound Message ========================>");
                var sender = new IsolatedSystemInitiator().send($scope.user, $scope.testStep.id, $scope.outboundMessage());
                sender.then(function (response) {
                    var received = response.incoming;
                    var sent = response.outgoing;
                    $scope.logger.log("Outbound message sent successfully.");
                    $scope.logger.log(sent);
                    $scope.logger.log("Inbound message received <========================");
                    $scope.logger.log(received);
                    var rspMessage = null;
                    try {
                        var x2js = new X2JS();
                        var receivedJson = x2js.xml_str2json(received);
                        rspMessage = receivedJson.Envelope.Body.submitSingleMessageResponse.return;
                        $scope.testStep['transactionStatus'] = 'COMPLETE';
                        $scope.logger.log("Transaction completed");
                    } catch (error) {
                        $scope.logger.log("SOAP Envelope is Invalid");
                        $scope.logger.log("Transaction completed");
                        $scope.testStep['transactionStatus'] = 'COMPLETE';
                    }

                    $rootScope.$broadcast('isolated:nextStep', rspMessage);
                    $scope.connecting = false;
                }, function (error) {
                    $scope.connecting = false;
                    $scope.error = error.data;
                    $scope.logger.log("Error: " + error.data);
                    $scope.received = '';
                    $scope.testStep['transactionStatus'] = 'COMPLETE';
                    $scope.logger.log("Transaction aborted");
                });
            } else {
                $scope.error = "No Outbound message found";
                $scope.connecting = false;
            }
        };


        $scope.stopListening = function () {
            $scope.configCollapsed = $scope.counter != $scope.counterMax;
            $scope.connecting = false;
            $scope.counter = $scope.counterMax;
            IsolatedSystemClock.stop();
            $scope.log("Stopping transaction. Please wait....");
            $scope.user.transaction.closeConnection().then(function (response) {
                $scope.log("Transaction stopped.");
            }, function (error) {
            });
        };

        $scope.startListening = function () {
            $scope.configCollapsed = false;
            $scope.logger.clear();
            $scope.counter = 0;
            $scope.connecting = true;
            $scope.error = null;
            var received = '';
            var sent = '';
            $scope.log("Configuring connection. Please wait...");
            $scope.user.transaction.openConnection().then(function (response) {
                    $scope.log("Connection configured.");
                    var execute = function () {
                        ++$scope.counter;
                        $scope.log("Waiting for incoming message....Elapsed time(second):" + $scope.counter + "s");
                        $scope.user.transaction.messages().then(function (response) {
                            var incoming = $scope.user.transaction.incoming;
                            var outbound = $scope.user.transaction.outgoing;
                            if ($scope.counter < $scope.counterMax) {
                                if (incoming != null && incoming != '' && received == '') {
                                    $scope.log("<-------------------------------------- Inbound Message ");
                                    $scope.log(incoming);
                                    received = incoming;
                                    try {
                                        var x2js = new X2JS();
                                        var receivedJson = x2js.xml_str2json(incoming);
                                        var receivedMessage = receivedJson.Envelope.Body.submitSingleMessage.hl7Message;
                                        $scope.testStep.testContext.message.content = receivedMessage;
                                        $scope.testStep['transactionStatus'] = 'COMPLETE';
                                    } catch (error) {
                                        $scope.logger.log("Inbound SOAP Envelope is Invalid");
                                        $scope.testStep['transactionStatus'] = 'COMPLETE';
                                    }
                                }
                                if (outbound != null && outbound != '' && sent == '') {
                                    $scope.log("Outbound Message  -------------------------------------->");
                                    $scope.log(outbound);
                                    sent = outbound;
                                    var sentMessage = null;
                                    try {
                                        var x2js = new X2JS();
                                        var sentMessageJson = x2js.xml_str2json(outbound);
                                        sentMessage = sentMessageJson.Envelope.Body.submitSingleMessageResponse.return;
                                    } catch (error) {
                                        $scope.logger.log("Outbound SOAP Envelope is Invalid");
                                        $scope.logger.log("Transaction completed");
                                        $scope.testStep['transactionStatus'] = 'COMPLETE';
                                    }
                                    $rootScope.$broadcast('isolated:nextStep', sentMessage);
                                }
                                if (incoming != '' && outbound != '' && incoming != null && outbound != null) {
                                    $scope.stopListening();
                                }
                            } else {
                                if (incoming == null || incoming == '') {
                                    $scope.log("We did not receive any incoming message after 30s or you are using wrong " +
                                        "credentials.");
                                } else if (outbound == null || outbound == '') {
                                    $scope.log("We were unable to send the response after 30s");
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
                    $scope.log("Failed to configure incoming connection: Error: " + error);
                    $scope.log("Transaction aborted");
                    $scope.connecting = false;
                    $scope.error = error;
                }
            );
        };


//        $scope.openReceiverConfig = function () {
//            $scope.logger.init();
//            var modalInstance = $modal.open({
//                templateUrl: 'TransactionReceiverCtrl.html',
//                controller: 'IsolatedSystemReceiverCtrl',
//                windowClass: 'app-modal-window',
//                resolve: {
//                    testCase: function () {
//                        return IsolatedSystem.testCase;
//                    },
//                    logger: function () {
//                        return  IsolatedSystem.logger;
//                    },
//                    message: function () {
//                        return IsolatedSystem.request.getContent();
//                    },
//                    user: function () {
//                        return IsolatedSystem.user;
//                    },
//                    endpoint: function () {
//                        return IsolatedSystem.serverEndpoint;
//                    }
//                }
//            });
//            modalInstance.result.then(function (result) {
//                if (result.received != null) {
//                    $modal.request.setContent(result.received);
//                }
//                if (result.sent != null) {
//                    $modal.response.setContent(result.sent);
//                }
//
//            }, function () {
//                $modal.response.setContent('');
//                $modal.request.setContent('');
//            });
//        };


//        $scope.send = function () {
//            $scope.logger.init();
//            var modalInstance = $modal.open({
//                templateUrl: 'TransactionSender.html',
//                controller: 'IsolatedSystemSenderCtrl',
//                size:'lg',
//                backdrop:'static',
//                resolve: {
//                    testCase: function () {
//                        return IsolatedSystem.testStep;
//                    },
//                    logger: function () {
//                        return  IsolatedSystem.logger;
//                    },
//                    message: function () {
//                        return IsolatedSystem.editor.getContent();
//                    },
//                    user: function () {
//                        return IsolatedSystem.user;
//                    }
//                }
//            });
//            modalInstance.result.then(function (result) {
//                if(result.sent != null){
//                    IsolatedSystem.request.setContent(result.sent);
//                }
//                if(result.received != null){
//                    IsolatedSystem.response.setContent(result.received);
//                }
//
//            }, function () {
//                IsolatedSystem.response.setContent('');
//            });
//        };

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

//        $scope.viewReceiver = function () {
//            var modalInstance = $modal.open({
//                templateUrl: 'TransactionViewReceiverConfiguration.html',
//                controller: 'IsolatedSystemViewReceiverConfigurationCtrl',
//                windowClass: 'app-modal-window',
//                resolve: {
//                    testCase: function () {
//                        return IsolatedSystem.testStep;
//                    },
//                    user: function () {
//                        return IsolatedSystem.user;
//                    }
//                }
//            });
//            modalInstance.result.then(function (result) {
//                IsolatedSystem.response.setContent('');
//            }, function () {
//                IsolatedSystem.response.setContent('');
//            });
//        };
    }]);


//angular.module('isolated')
//    .controller('IsolatedSystemSenderCtrl', function ($scope, $sce, $http,IsolatedSystem,$rootScope,IsolatedSystemInitiator) {
//
//    });


angular.module('isolated')
    .controller('IsolatedSystemViewReceiverConfigurationCtrl', function ($scope, $sce, $http, IsolatedSystem, $rootScope, $modalInstance, testCase, IsolatedSystemInitiator, message, user, logger) {
        $scope.testCase = testCase;
        $scope.user = user;
        $scope.close = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.hasRequestContent = function () {
            return  $scope.message != null && $scope.message != '';
        };

    });

angular.module('isolated')
    .controller('IsolatedSystemReceiverCtrl', function ($scope, $sce, $http, IsolatedSystem, $rootScope, $modalInstance, testCase, user, logger, IsolatedSystemClock, endpoint, message) {
        $scope.testCase = testCase;
        $scope.user = user;
        $scope.logger = logger;
        $scope.endpoint = endpoint;
        $scope.message = message;
        $scope.sent = null;
        $scope.received = null;
        $scope.connecting = false;
        $scope.error = null;
        $scope.counterMax = 30;
        $scope.counter = 0;
        $scope.listenerReady = false;

        $scope.log = function (log) {
            $scope.logger.log(log);
        };

        $scope.close = function () {
            $modalInstance.close({"sent": $scope.sent, "received": $scope.received});
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.hasRequestContent = function () {
            return  $scope.message != null && $scope.message != '';
        };

        $scope.stop = function () {
            $scope.connecting = false;
            $scope.counter = $scope.counterMax;
            IsolatedSystemClock.stop();
            $scope.log("Stopping transaction. Please wait....");
            $scope.user.transaction.closeConnection().then(function (response) {
                $scope.log("Transaction stopped.");
            }, function (error) {
            });
        };


        $scope.start = function () {
            $scope.logger.clear();
            $scope.counter = 0;
            $scope.connecting = true;
            $scope.received = '';
            $scope.sent = '';
            $scope.error = null;

            $scope.log("Configuring connection. Please wait...");
            IsolatedSystem.user.transaction.openConnection().then(function (response) {
                    $scope.log("Connection configured.");
                    var execute = function () {
                        ++$scope.counter;
                        $scope.log("Waiting for incoming message....Elapsed time(second):" + $scope.counter + "s");
                        $scope.user.transaction.messages().then(function (response) {
                            var incoming = $scope.user.transaction.incoming;
                            var outbound = $scope.user.transaction.outgoing;
                            if ($scope.counter < $scope.counterMax) {
                                if (incoming != null && incoming != '' && $scope.received == '') {
                                    $scope.log("<-------------------------------------- Inbound Message ");
                                    $scope.log(incoming);
                                    $scope.received = incoming;
                                }
                                if (outbound != null && outbound != '' && $scope.sent == '') {
                                    $scope.log("Outbound Message  -------------------------------------->");
                                    $scope.log(outbound);
                                    $scope.sent = outbound;
                                }
                                if ($scope.received != '' && $scope.sent != '') {
                                    $scope.stop();
                                }
                            } else {
                                if (incoming == null || incoming == '') {
                                    $scope.log("We did not receive any incoming message after 30s or you are using wrong " +
                                        "credentials.");
                                } else if (outbound == null || outbound == '') {
                                    $scope.log("We were unable to send the response after 30s");
                                }
                                $scope.stop();
                            }
                        }, function (error) {
                            $scope.error = error;
                            $scope.log("Error: " + error);
                            $scope.received = '';
                            $scope.sent = '';
                            $scope.stop();
                        });
                    };
                    IsolatedSystemClock.start(execute);
                }, function (error) {
                    $scope.log("Failed to configure incoming connection: Error: " + error);
                    $scope.log("Transaction aborted");
                    $scope.connecting = false;
                    $scope.error = error;
                }
            );
        };

    });

//angular.module('isolated')
//    .controller('IsolatedSystemSenderCtrl', function ($scope, $sce, $http,IsolatedSystem,$rootScope, $modalInstance, testCase,IsolatedSystemInitiator, message, user, logger) {
//        $scope.testCase = testCase;
//        $scope.message = message;
//        $scope.user = user;
//        $scope.logger = logger;
//        $scope.sent = null;
//        $scope.received = null;
//        $scope.connecting = false;
//        $scope.error = null;
//
//        $scope.isValidConfig = function(){
//            return $scope.user.receiverEndpoint != null && $scope.user.receiverEndpoint != '';
//        };
//
//        $scope.close = function () {
//            $modalInstance.close({"sent": $scope.sent, "received":$scope.received});
//        };
//
//        $scope.cancel = function () {
//            $modalInstance.dismiss('cancel');
//        };
//
//        $scope.hasRequestContent = function () {
//            return  $scope.message != null &&  $scope.message != '';
//        };
//
//        $scope.send = function () {
//            $scope.error = null;
//            if ($scope.user.receiverEndpoint != '' && $scope.hasRequestContent()) {
//                $scope.connecting = true;
//                $scope.logger.init();
//                $scope.received = '';
//                $scope.logger.log("Outbound Message ========================>");
//                var sender = new IsolatedSystemInitiator().send($scope.user,$scope.testCase.id,$scope.message);
//                sender.then(function (response) {
//                    var received = response.incoming;
//                    var sent = response.outgoing;
//                    $scope.logger.log("Outbound message sent successfully.");
//                    $scope.logger.log(sent);
//                    $scope.logger.log("Inbound message received <========================");
//                    $scope.logger.log(received);
//                    $scope.logger.log("Transaction completed");
//                    $scope.connecting = false;
//                    $scope.sent = sent;
//                    $scope.received = received;
//                }, function (error) {
//                    $scope.connecting = false;
//                    $scope.error = error.data;
//                    $scope.logger.log("Error: " + error.data);
//                    $scope.logger.log("Transaction aborted");
//                    IsolatedSystem.response.setContent('');
//                    $scope.received = '';
//                });
//            }else{
//                $scope.error = "No Outbound message found";
//            }
//        };
//
//        $scope.send();
//
//    });


angular.module('isolated')
    .controller('IsolatedSystemValidatorCtrl', ['$scope', '$http', 'IsolatedSystem', '$window', 'HL7EditorUtils', 'HL7CursorUtils', '$timeout', 'HL7TreeUtils', '$modal', 'NewValidationResult', '$rootScope', 'Er7MessageValidator', 'Er7MessageParser', function ($scope, $http, IsolatedSystem, $window, HL7EditorUtils, HL7CursorUtils, $timeout, HL7TreeUtils, $modal, NewValidationResult, $rootScope, Er7MessageValidator, Er7MessageParser) {
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
            var testStep = $scope.testStep;
            if (testStep != null) {
                var testContext = testStep.testContext;
                if(testContext) {
                    var message = testContext != null ? testContext.message : null;
                    var content = message && message != null && message.content != null ? message.content : '';
                    $scope.nodelay = true;
                    $scope.selectedMessage = {'content': content};
                    $scope.editor.doc.setValue($scope.selectedMessage.content);
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
            $scope.editor.setSize(null, 350);

            $scope.editor.on("keyup", function () {
                $timeout(function () {
                    var msg = $scope.editor.doc.getValue();
                    $scope.error = null;
                    if ($scope.tokenPromise) {
                        $timeout.cancel($scope.tokenPromise);
                        $scope.tokenPromise = undefined;
                    }
                    IsolatedSystem.message.name = null;
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
                    $scope.isolated.cursor.init(coordinate.line, coordinate.startIndex, coordinate.endIndex, coordinate.index, true);
                    HL7TreeUtils.selectNodeByIndex($scope.isolated.tree.root, IsolatedSystem.cursor, IsolatedSystem.message.content);
                });
            });

            $scope.isolated.editor.instance = $scope.editor;

            $scope.refreshEditor();

        };

        /**
         * Validate the content of the editor
         */
        $scope.validateMessage = function () {
            $scope.vLoading = true;
            $scope.vError = null;
            if ($scope.testStep != null && $scope.isolated.message.content !== "") {
                try {
                    var validator = new Er7MessageValidator().validate($scope.testStep.testContext.id, $scope.isolated.message.content);
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


        $scope.setValidationResult = function (mvResult) {
            var report = null;
            var validationResult = null;
            if (mvResult !== null) {
                report = {};
                validationResult = new NewValidationResult();
                validationResult.init(mvResult);
                report["result"] = validationResult;
            }
            if ($scope.testStep != null) {
                $scope.testStep.report = report;
            }
            $rootScope.$broadcast('isolated:reportLoaded', report);
            $rootScope.$broadcast('isolated:validationResultLoaded', validationResult);
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
                $scope.execute();
            }

        };

        $scope.saveMessage = function () {
            $scope.isolated.message.download();
        };

        $scope.setMessage = function (message) {
            if (message != null && message != "") {
                $scope.nodelay = true;
                $scope.selectedMessage = {"content": message};
                if ($scope.selectedMessage != null) {
                    $scope.editor.doc.setValue($scope.selectedMessage.content);
                } else {
                    $scope.editor.doc.setValue('');
                    $scope.isolated.message.id = null;
                    $scope.isolated.message.name = '';
                }
                $scope.execute();
            }
        };


        $scope.parseMessage = function () {
            $scope.tLoading = true;
            if ($scope.testStep != null && $scope.isolated.message.content != '') {
                var parsed = new Er7MessageParser().parse($scope.testStep.testContext.id, $scope.isolated.message.content);
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
            var index = HL7TreeUtils.getEndIndex(node, $scope.isolated.message.content);
            $scope.isolated.cursor.init(node.data.lineNumber, node.data.startIndex - 1, index - 1, node.data.startIndex - 1, false);
            HL7EditorUtils.select($scope.editor, $scope.isolated.cursor);
        };

        $scope.execute = function () {
            $scope.error = null;
            $scope.tError = null;
            $scope.mError = null;
            $scope.vError = null;
            $scope.isolated.message.content = $scope.editor.doc.getValue();
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
            $scope.setValidationResult(null);

            $scope.$on('isolated:refreshEditor', function (event) {
                $scope.refreshEditor();
                event.preventDefault();
            });

            $rootScope.$on('isolated:testStepLoaded', function (event, testStep) {
                $scope.refreshEditor();
                $scope.testStep = testStep;
                $scope.loadMessage();
            });
        };

    }])
;


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