'use strict';
angular.module('connectivity')
    .controller('ConnectivityTestingCtrl', ['$scope', 'Connectivity', '$rootScope', 'StorageService', function ($scope, Connectivity, $rootScope,StorageService) {
        $scope.init = function () {
            var tab = StorageService.get(StorageService.ACTIVE_SUB_TAB_KEY);
            if(tab == null || tab != '/connectivity_execution') tab =  '/connectivity_testcase';
            $rootScope.setSubActive(tab);
        };

        $rootScope.$on('conn:testCaseLoaded', function (event, tab) {
            $rootScope.setSubActive(tab && tab != null ? tab:'/connectivity_execution');
         });

    }]);


angular.module('connectivity')
    .controller('ConnectivityTestCaseCtrl', ['$scope', 'Connectivity', '$rootScope', 'ConnectivityTestCaseListLoader', '$cookies', '$timeout','StorageService','TestCaseService', function ($scope, Connectivity, $rootScope, ConnectivityTestCaseListLoader,$cookies,$timeout,StorageService,TestCaseService) {

        $scope.connectivity = Connectivity;
        $scope.loading = true;
        $scope.error = null;
        $scope.testCases = [];
        $scope.tree = {};
        $scope.testCase = Connectivity.testCase;
        $scope.selectedTestCase = Connectivity.selectedTestCase;
        var testCaseService = new TestCaseService();

        $scope.selectTestCase = function (node) {
            $timeout(function () {
                $scope.selectedTestCase = node;
                StorageService.set(StorageService.SOAP_CONN_SELECTED_TESTCASE_ID_KEY, node.id);
                StorageService.set(StorageService.SOAP_CONN_SELECTED_TESTCASE_TYPE_KEY, node.type);
                $timeout(function () {
                    $rootScope.$broadcast('conn:testCaseSelected');
                });
            });
        };

        $scope.init = function () {
            $scope.error = null;
            $scope.loading = true;
            $scope.testCases = [];

            var tcLoader = new ConnectivityTestCaseListLoader();
            tcLoader.then(function (testCases) {
                $scope.testCases = testCases;
                $scope.tree.build_all($scope.testCases);
                var testCase = null;
                var id = StorageService.get(StorageService.SOAP_CONN_SELECTED_TESTCASE_ID_KEY);
                var type = StorageService.get(StorageService.SOAP_CONN_SELECTED_TESTCASE_TYPE_KEY);
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
                        $scope.selectNode(id,type);
                    }
                }
                testCase = null;
                id = StorageService.get(StorageService.SOAP_CONN_LOADED_TESTCASE_ID_KEY);
                type = StorageService.get(StorageService.SOAP_CONN_LOADED_TESTCASE_TYPE_KEY);
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
                        $scope.loadTestCase(testCase,tab);
                    }
                }

                 $scope.loading = false;
                $scope.error = null;
            }, function (error) {
                $scope.error = "Sorry, Failed to fetch the test cases. Please refresh page and try again.";
                $scope.loading = false;
            });
        };

        $scope.loadTestCase = function (testCase,tab) {
                 Connectivity.testCase = testCase;
                $scope.testCase = Connectivity.testCase;
                var id = StorageService.get(StorageService.SOAP_CONN_LOADED_TESTCASE_ID_KEY);
                var type = StorageService.get(StorageService.SOAP_CONN_LOADED_TESTCASE_TYPE_KEY);
                if (id != $scope.testCase.id || type != $scope.testCase.type) {
                    StorageService.set(StorageService.SOAP_CONN_LOADED_TESTCASE_ID_KEY, $scope.testCase.id);
                    StorageService.set(StorageService.SOAP_CONN_LOADED_TESTCASE_TYPE_KEY, $scope.testCase.type);
                    StorageService.remove(StorageService.SOAP_CONN_REQ_EDITOR_CONTENT_KEY);
                    StorageService.remove(StorageService.SOAP_CONN_RESP_EDITOR_CONTENT_KEY);
                }
                $timeout(function () {
                    $rootScope.$broadcast('conn:testCaseLoaded', tab);
                });
        };

        $scope.isSelectable = function (node) {
            return true;
        };


        $scope.selectNode = function (id,type) {
            $timeout(function () {
                testCaseService.selectNodeByIdAndType($scope.tree, id, type);
            },0);
        };




    }]);

angular.module('connectivity')
    .controller('ConnectivityExecutionCtrl', ['$scope', '$timeout', '$interval', 'Connectivity', '$rootScope', '$modal', 'Endpoint','$cookies','StorageService',
        function ($scope, $timeout, $interval, Connectivity, $rootScope, $modal, Endpoint,$cookies,StorageService) {

            $scope.logger = Connectivity.logger;
            $scope.loading = false;
            $scope.testCase = Connectivity.testCase;
            $scope.selectedTestCase = Connectivity.selectedTestCase;
            $scope.loading = false;
            $scope.connecting = false;
            $scope.error = null;
            $scope.endpoint = null;
            $scope.user = Connectivity.user;
            $scope.hidePwd = true;

            $scope.init = function () {
                $rootScope.$on('conn:testCaseLoaded', function (event) {
                    $scope.testCase = Connectivity.testCase;
                    $scope.logger.init();
                    $scope.loading = true;
                    $scope.error = null;
                    $scope.connecting = false;
                });
                Connectivity.user.init().then(function (response) {
                    $scope.endpoint = $scope.user.endpoint;
                }, function (error) {
                    $scope.error = error;
                });
            };

            $scope.log = function (log) {
                $scope.logger.log(log);
            };

            $scope.isValidConfig = function () {
                return $scope.user.receiverEndpoint != null && $scope.user.receiverEndpoint != '';
            };


            $scope.openReceiverConfig = function () {
                $scope.logger.init();
                var modalInstance = $modal.open({
                    templateUrl: 'TransactionReceiver.html',
                    controller: 'ConnectivityReceiverCtrl',
                    windowClass: 'app-modal-window',
                    resolve: {
                        testCase: function () {
                            return Connectivity.testCase;
                        },
                        logger: function () {
                            return  Connectivity.logger;
                        },
                        message: function () {
                            return Connectivity.request.getContent();
                        },
                        user: function () {
                            return Connectivity.user;
                        }
                    }
                });
                modalInstance.result.then(function (result) {
                    if (result.received != null) {
                        $scope.triggerReqEvent(result.received);
                     }
                    if (result.sent != null) {
                         $scope.triggerRespEvent(result.sent);
                    }
                }, function () {
                    $scope.triggerReqEvent('');
                    $scope.triggerRespEvent('');
                });
            };


            $scope.send = function () {
                     $scope.logger.init();
                    var modalInstance = $modal.open({
                        templateUrl: 'TransactionSender.html',
                        controller: 'ConnectivitySenderCtrl',
                        size: 'lg',
                        backdrop: 'static',
                        resolve: {
                            testCase: function () {
                                return Connectivity.testCase;
                            },
                            logger: function () {
                                return  Connectivity.logger;
                            },
                            message: function () {
                                return Connectivity.request.editor.getContent();
                            },
                            user: function () {
                                return Connectivity.user;
                            }
                        }
                    });
                    modalInstance.result.then(function (result) {
                        if (result.sent != null) {
                            $scope.triggerReqEvent(result.sent);
                        }
                        if (result.received != null) {
                            $scope.triggerRespEvent(result.received);
                        }

                    }, function () {
                        $scope.triggerRespEvent('');
                    });
             };

            $scope.configureReceiver = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'TransactionConfigureReceiver.html',
                    controller: 'ConnectivityConfigureReceiverCtrl'
                });
                modalInstance.result.then(function (user) {
                    if(user.save === true) {
                        Connectivity.user.senderUsername = user.senderUsername;
                        Connectivity.user.senderPassword = user.senderPassword;
                        Connectivity.user.senderFacilityID = user.senderFacilityID;
                        Connectivity.user.receiverUsername = user.receiverUsername;
                        Connectivity.user.receiverPassword = user.receiverPassword;
                        Connectivity.user.receiverFacilityId = user.receiverFacilityId;
                        Connectivity.user.receiverEndpoint = user.receiverEndpoint;
//                        StorageService.set(StorageService.SOAP_COMM_SENDER_USERNAME_KEY,Connectivity.user.senderUsername);
//                        StorageService.set(StorageService.SOAP_COMM_SENDER_PWD_KEY,Connectivity.user.senderPassword);
//                        StorageService.set(StorageService.SOAP_COMM_SENDER_FACILITYID_KEY,Connectivity.user.senderFacilityID);

                        StorageService.set(StorageService.SOAP_COMM_RECEIVER_USERNAME_KEY,Connectivity.user.receiverUsername);
                        StorageService.set(StorageService.SOAP_COMM_RECEIVER_PWD_KEY,Connectivity.user.receiverPassword);
                        StorageService.set(StorageService.SOAP_COMM_RECEIVER_FACILITYID_KEY,Connectivity.user.receiverFacilityId);
                        StorageService.set(StorageService.SOAP_COMM_RECEIVER_ENDPOINT_KEY,Connectivity.user.receiverEndpoint);

//                        $cookies.put('ConnectivityUser', angular.toJson(Connectivity.user));
                        $scope.triggerRespEvent('');
                        $scope.send();
                    }
                  }, function () {
                     //$scope.triggerRespEvent('');
                });
            };

            $scope.viewReceiver = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'TransactionViewReceiverConfiguration.html',
                    controller: 'ConnectivityViewReceiverConfigurationCtrl',
                    windowClass: 'app-modal-window',
                    resolve: {
                        testCase: function () {
                            return Connectivity.testCase;
                        },
                        user: function () {
                            return Connectivity.user;
                        }
                    }
                });
                modalInstance.result.then(function (result) {
                     $scope.triggerRespEvent('');
                }, function () {
                     $scope.triggerRespEvent('');
                });
            };

            $scope.hasRequestContent = function () {
                return Connectivity.request.getContent() != null && Connectivity.request.getContent() != '';
            };

            $scope.triggerReqEvent = function (message) {
                $timeout(function() {
                    $rootScope.$broadcast('conn:reqMessage', message);
                });
            };
            $scope.triggerRespEvent = function (message) {
                $timeout(function() {
                    $rootScope.$broadcast('conn:respMessage', message);
                });
            };


        }]);


'use strict';

angular.module('connectivity')
    .controller('ConnectivityReqCtrl', ['$scope', '$http', 'Connectivity', 'SOAPFormatter', '$window', 'SOAPEditorUtils', '$timeout', '$rootScope', 'ConnectivityValidator', '$modal', 'StorageService', function ($scope, $http, Connectivity, SOAPFormatter, $window, SOAPEditorUtils, $timeout, $rootScope, ConnectivityValidator, $modal,StorageService) {

        $scope.eLoading = false;
        $scope.vError = null;
        $scope.request = Connectivity.request;
        $scope.editor = null;
        $scope.request = Connectivity.request;
        $scope.validating = false;
        $scope.editorInit = false;
        $scope.serverEndpoint = Connectivity.serverEndpoint;
        $scope.user = Connectivity.user;
        $scope.request = Connectivity.request;
        $scope.rLoading = false;
        $scope.rError = null;
        $scope.resized = false;
        $scope.validationSettings = $scope.request.validationSettings;
        $scope.validationResult = $scope.request.validationResult;
        $scope.editor = $scope.request.editor;
        $scope.itemsByPage = 10;
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
        $scope.selectedExampleMessage = {id: -1, content: ''};
        $scope.error = null;
        $scope.options = {
//            acceptFileTypes: /(\.|\/)(txt|text|hl7|json)$/i,
            paramName: 'file',
            formAcceptCharset: 'utf-8',
            autoUpload: true,
            type: 'POST'
        };

        $scope.hasContent = function () {
            return  $scope.request.getContent() != '' && $scope.request.getContent() != null;
        };

        $scope.getMessageName = function () {
            return $scope.editor.message.name;
        };

        $scope.$on('fileuploadadd', function (e, data) {
            if (data.autoUpload || (data.autoUpload !== false &&
                $(this).fileupload('option', 'autoUpload'))) {
                data.process().done(function () {
                    var fileName = data.files[0].name;
                    data.url = 'api/soap/upload';
                    var jqXHR = data.submit()
                        .success(function (result, textStatus, jqXHR) {
                            var tmp = angular.fromJson(result);
                            $scope.request.editor.instance.doc.setValue(tmp.content);
//                            $scope.$broadcast("connectivityReq:editor:update", true);
//                            $scope.refreshEditor();
                            $scope.uploadError = null;
                            $scope.fileName = fileName;
                        })
                        .error(function (jqXHR, textStatus, errorThrown) {
                            $scope.fileName = fileName;
                            $scope.uploadError = 'Sorry, Failed to upload file: ' + fileName + ", Error: " + errorThrown;
                        })
                        .complete(function (result, textStatus, jqXHR) {

                        });
                });
            }
        });


        $scope.validate = function () {
            $scope.vError = null;
            var backup = $scope.request.editor.instance.doc.getValue();
            if (backup != null && backup != '') {
                $scope.validating = true;
                var validator = new SOAPFormatter(backup);
                validator.then(function (formatted) {
                    $scope.validating = false;
                     $scope.reqMessage(formatted);
                 }, function (error) {
                    $scope.validating = false;
                    $scope.vError = error;
                });
            }
        };

        $scope.clearMessage = function () {
            $scope.error = null;
            $scope.reqMessage('');
        };


        $scope.refreshEditor = function () {
            $timeout(function () {
                if ($scope.editor != undefined) {
                    $scope.editor.refresh();
                }
            }, 1000);
        };


        $scope.saveMessage = function () {
            $scope.request.message.download();
        };

        $scope.resize = function () {
        };

        $scope.validateMessage = function () {
            $scope.refreshEditor();
            $scope.rLoading = true;
            $scope.rError = null;
            if ($scope.testCase != null && $scope.request.getContent() != '') {
                var validator = new ConnectivityValidator().validate($scope.request.message.content, $scope.testCase.id, Connectivity.user.id, 'req', null);
                validator.then(function (result) {
                    $scope.rLoading = false;
                    $scope.setValidationResult(result);
                }, function (error) {
                    $scope.rLoading = false;
                    $scope.rError = error;
                    $scope.setValidationResult({});
                });
            } else {
                $scope.setValidationResult({});
                $scope.rLoading = false;
                $scope.rError = null;
            }
        };

        $scope.setValidationResult = function (mvResult) {
            $scope.request.validationResult.init(mvResult);
            $scope.validationResult = $scope.request.validationResult;
            $scope.errors = $scope.validationResult.errors;
            $scope.affirmatives = $scope.validationResult.affirmatives;
            $scope.alerts = $scope.validationResult.alerts;
            $scope.ignores = $scope.validationResult.ignores;
            $scope.warnings = $scope.validationResult.warnings;
        };

        $scope.select = function (element) {
            if (element.line != -1) {
                Connectivity.request.cursor.setLine(element.line);
            }
        };

        $scope.init = function () {
            $scope.error = null;
            $scope.loading = true;
            $scope.editor = CodeMirror.fromTextArea(document.getElementById("connectivityReqTextArea"), {
                lineNumbers: true,
                fixedGutter: true,
                mode: 'xml',
                readOnly: false,
                showCursorWhenSelecting: true
            });
            $scope.editor.setOption("readOnly", true);
            $scope.editor.setSize("100%", 300);

            $scope.editor.on("dblclick", function (editor) {
                $scope.$apply(function () {
                    $scope.request.cursor.setLine($scope.editor.doc.getCursor(true).line + 1);
                });
//                event.preventDefault();
            });

            $scope.request.editor.init($scope.editor);

            $rootScope.$on('conn:testCaseLoaded', function (event) {
                $scope.testCase = Connectivity.testCase;
                var req = Connectivity.testCase.sutType == 'RECEIVER' ? Connectivity.testCase.testContext.message : StorageService.get(StorageService.SOAP_CONN_REQ_EDITOR_CONTENT_KEY) != null ? StorageService.get(StorageService.SOAP_CONN_REQ_EDITOR_CONTENT_KEY): '';
                $scope.reqMessage(req);
//                var rsp = StorageService.get(StorageService.SOAP_CONN_RESP_EDITOR_CONTENT_KEY);
//                $scope.triggerRespEvent(rsp != null ? rsp:'');
             });

            $rootScope.$on('conn:reqMessage', function (event, message) {
                $scope.reqMessage(message)
            });

            $scope.$watch(function () {
                return $scope.request.cursor.updateIndicator;
            }, function () {
                SOAPEditorUtils.select($scope.request.cursor, $scope.request.editor.instance);
            }, true);

            $scope.setValidationResult({});
            $scope.refreshEditor();

        };

        $scope.reqMessage = function (message) {
            $scope.request.message.content = message;
            $scope.editor.doc.setValue(message);
            StorageService.set(StorageService.SOAP_CONN_REQ_EDITOR_CONTENT_KEY, message);
            $scope.validateMessage();
        };

        $scope.triggerRespEvent = function (message) {
            $rootScope.$broadcast('conn:respMessage',message);
        };


    }]);


angular.module('connectivity')
    .controller('ConnectivityReqReportCtrl', ['$scope', '$sce', '$http', 'SoapValidationReportGenerator', 'SoapValidationReportDownloader', 'Connectivity', '$rootScope', function ($scope, $sce, $http, SoapValidationReportGenerator, SoapValidationReportDownloader, Connectivity, $rootScope) {
        $scope.connectivityReqHtmlReport = null;
        $scope.error = null;
        $scope.loading = false;
        $scope.testCase = Connectivity.testCase;
        $scope.validationResult = Connectivity.validationResult;

        $scope.init = function () {
            $rootScope.$on('conn:testCaseLoaded', function (event) {
                $scope.testCase = Connectivity.testCase;
            });

            $scope.$watch(function () {
                return  $scope.validationResult.xml;
            }, function (xmlReport) {
                if (xmlReport != null && xmlReport != '') {
                    $scope.loading = true;
                    var promise = new SoapValidationReportGenerator(xmlReport, 'html');
                    promise.then(function (json) {
                        $scope.connectivityReqHtmlReport = json.htmlReport;
                        $scope.loading = false;
                        $scope.error = null;
                    }, function (error) {
                        $scope.error = error;
                        $scope.loading = false;
                        $scope.connectivityReqHtmlReport = null;
                    });
                } else {
                    $scope.loading = false;
                    $scope.connectivityReqHtmlReport = null;
                    $scope.error = null;
                }
            }, true);
        };

        $scope.downloadAs = function (format) {
            //var data = angular.fromJson({"xmlReport": ConnectivityRequestMessageValidationResult.xml});
            SoapValidationReportDownloader.downloadAs($scope.validationResult.xml, format);
        };

    }]);

angular.module('connectivity')
    .controller('ConnectivityConfigureReceiverCtrl', function ($scope, $sce, $http, Connectivity, $rootScope, $modalInstance) {
        $scope.testCase = Connectivity.testCase;
        $scope.user = angular.copy(Connectivity.user);
        $scope.user.save = false;
        $scope.send = function () {
            $scope.user.save = true;
            $modalInstance.close($scope.user);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });


angular.module('connectivity')
    .controller('ConnectivityViewReceiverConfigurationCtrl', function ($scope, $sce, $http, Connectivity, $rootScope, $modalInstance, testCase, user) {
        $scope.testCase = Connectivity.testCase;
        $scope.user =  Connectivity.user;
        $scope.close = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.hasRequestContent = function () {
            return $scope.message != null && $scope.message != '';
        };

    });


angular.module('connectivity')
    .controller('ConnectivitySenderCtrl', function ($scope, $sce, $http, Connectivity, $rootScope, $modalInstance, testCase, ConnectivityInitiator, message, user, logger) {
        $scope.testCase = testCase;
        $scope.message = message;
        $scope.user = user;
        $scope.logger = logger;
        $scope.sent = null;
        $scope.received = null;
        $scope.connecting = false;
        $scope.error = null;

        $scope.isValidConfig = function () {
            return $scope.user.receiverEndpoint != null && $scope.user.receiverEndpoint != '';
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

        $scope.send = function () {
            $scope.error = null;
            if ($scope.user.receiverEndpoint != '' && $scope.hasRequestContent()) {
                $scope.connecting = true;
                $scope.logger.init();
                $scope.received = '';
                $scope.logger.log("Sending request ========================>");
                var sender = new ConnectivityInitiator().send($scope.user, $scope.testCase.id, $scope.message);
                sender.then(function (response) {
                    var received = response.incoming;
                    var sent = response.outgoing;
                    $scope.logger.log("Outgoing message sent successfully.");
                    $scope.logger.log("Outgoing message is:");
                    $scope.logger.log(sent);
                    $scope.logger.log("Incoming message received <========================");
                    $scope.logger.log("Incoming message is:");
                    $scope.logger.log(received);
                    $scope.logger.log("Transaction completed");
                    $scope.connecting = false;
                    $scope.sent = sent;
                    $scope.received = received;
                }, function (error) {
                    $scope.connecting = false;
                    $scope.error = error.data;
                    $scope.logger.log("Error: " + error.data);
                    $scope.logger.log("Transaction aborted");
                    $rootScope.$broadcast('conn:respMessage','');
                    $scope.received = '';
                });
            } else {
                $scope.error = "No outgoing message found";
            }
        };

        $scope.send();

    });

angular.module('connectivity')
    .controller('ConnectivityRespCtrl', ['$scope', '$http', 'Connectivity', '$window', 'SOAPFormatter', 'SOAPEditorUtils', '$timeout', '$rootScope', 'ConnectivityValidator', '$modal', 'StorageService',function ($scope, $http, Connectivity, $window, SOAPFormatter, SOAPEditorUtils, $timeout, $rootScope, ConnectivityValidator, $modal,StorageService) {
        $scope.testCase = Connectivity.testCase;
        $scope.response = Connectivity.response;
        $scope.selectedTestCase = Connectivity.selectedTestCase;
        $scope.loading = true;
        $scope.error = null;


        $scope.eLoading = false;
        $scope.validating = false;
        $scope.editorInit = false;


        $scope.rLoading = false;
        $scope.rError = null;
        $scope.resized = false;
        $scope.validationSettings = Connectivity.response.validationSettings;
        $scope.validationResult = Connectivity.response.validationResult;

        $scope.itemsByPage = 10;

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


        // Options you want to pass to jQuery File Upload e.g.:
        $scope.options = {
//            acceptFileTypes: /(\.|\/)(txt|text|hl7|json)$/i,
            paramName: 'file',
            formAcceptCharset: 'utf-8',
            autoUpload: true,
            type: 'POST'
        };

        $scope.error = null;

        $scope.init = function () {
            $scope.error = null;
            $scope.testCases = [];
            $scope.loading = true;

            $scope.editor = CodeMirror.fromTextArea(document.getElementById("connectivityRespTextArea"), {
                lineNumbers: true,
                fixedGutter: true,
                mode: 'xml',
                readOnly: false,
                showCursorWhenSelecting: true
            });

            $scope.editor.setOption("readOnly", true);
            $scope.editor.setSize("100%", 300);

            $scope.editor.on("dblclick", function (editor) {
                $scope.$apply(function () {
                    $scope.response.cursor.setLine($scope.editor.doc.getCursor(true).line + 1);
                });
                event.preventDefault();
            });

            $scope.response.editor.init($scope.editor);


            $scope.$watch(function () {
                return  $scope.response.cursor.updateIndicator;
            }, function () {
                SOAPEditorUtils.select($scope.response.cursor, $scope.editor);
            }, true);

            $rootScope.$on('conn:testCaseLoaded', function (event) {
                $scope.testCase = Connectivity.testCase;
                $scope.refreshEditor();
                var rsp = StorageService.get(StorageService.SOAP_CONN_RESP_EDITOR_CONTENT_KEY);
                $scope.respMessage(rsp != null ? rsp:'');
            });

            $rootScope.$on('conn:respMessage', function (event, message) {
                $scope.respMessage(message);
            });

            $scope.setValidationResult({});
            $scope.refreshEditor();

        };

        $scope.respMessage = function (message) {
            $scope.response.message.content = message;
            $scope.editor.doc.setValue(message);
            StorageService.set(StorageService.SOAP_CONN_RESP_EDITOR_CONTENT_KEY,message);
            $scope.refreshEditor();
            $scope.validateMessage();
        };

        $scope.triggerReqEvent = function (message) {
            $rootScope.$broadcast('conn:reqMessage',message);
        };

        $scope.triggerRespEvent = function (message) {
            $rootScope.$broadcast('conn:respMessage',message);
        };

        /**
         *
         */
        $scope.hasContent = function () {
            return $scope.response.getContent() != '' && $scope.response.getContent() != null;
        };

        $scope.getMessageName = function () {
            return $scope.response.message.name;
        };

        $scope.clearMessage = function () {
            $scope.error = null;
            $scope.respMessage('');
        };

        $scope.refreshEditor = function () {
            if ($scope.editor != undefined) {
                $timeout(function () {
                    $scope.editor.refresh();
                }, 1000);
            }
        };

        $scope.saveMessage = function () {
            $scope.response.message.download();
        };

        $scope.validate = function () {
            $scope.error = null;
            var backup = $scope.response.editor.instance.doc.getValue();
            if (backup != null && backup != '') {
                $scope.validating = true;
                var validator = new SOAPFormatter(backup);
                validator.then(function (formatted) {
                    $scope.validating = false;
                    $scope.respMessage(formatted);
                }, function (error) {
                    $scope.validating = false;
                    $scope.error = error;
                });
            }
        };


        $scope.resize = function () {
        };

        /**
         * Validate the content of the editor
         */
        $scope.validateMessage = function () {
            $scope.rLoading = true;
            $scope.rError = null;
            if (Connectivity.testCase != null && Connectivity.response.getContent() != '') {
                var validator = new ConnectivityValidator().validate($scope.response.message.content, Connectivity.testCase.id, Connectivity.user.id, 'resp', Connectivity.request.getContent());
                validator.then(function (result) {
                    $scope.rLoading = false;
                    $scope.setValidationResult(result);
                }, function (error) {
                    $scope.rLoading = false;
                    $scope.rError = error;
                    $scope.setValidationResult({});
                });
            } else {
                $scope.setValidationResult({});
                $scope.rLoading = false;
                $scope.rError = null;
            }
        };


        $scope.setValidationResult = function (mvResult) {
            $scope.response.validationResult.init(mvResult);
            $scope.validationResult = $scope.response.validationResult;
            $scope.errors = $scope.validationResult.errors;
            $scope.affirmatives = $scope.validationResult.affirmatives;
            $scope.alerts = $scope.validationResult.alerts;
            $scope.ignores = $scope.validationResult.ignores;
            $scope.warnings = $scope.validationResult.warnings;
        };

        $scope.select = function (element) {
            if (element.line != -1) {
                Connectivity.response.cursor.setLine(element.line);
            }
        };


    }]);


angular.module('connectivity')
    .controller('ConnectivityRespReportCtrl', ['$scope', '$sce', '$http', 'SoapValidationReportGenerator', 'SoapValidationReportDownloader', 'Connectivity' , function ($scope, $sce, $http, SoapValidationReportGenerator, SoapValidationReportDownloader, Connectivity) {
        $scope.connectivityRespHtmlReport = null;
        $scope.error = null;
        $scope.loading = false;
        $scope.testCase = Connectivity.testCase;

        $scope.init = function () {
            $scope.$watch(function () {
                return  Connectivity.response.validationResult.xml;
            }, function (xmlReport) {
                if (xmlReport != null && xmlReport != '') {
                    $scope.loading = true;
                    var promise = new SoapValidationReportGenerator(xmlReport, 'html');
                    promise.then(function (json) {
                        $scope.connectivityRespHtmlReport = $sce.trustAsHtml(json.htmlReport);
                        $scope.loading = false;
                        $scope.error = null;
                    }, function (error) {
                        $scope.error = error;
                        $scope.loading = false;
                        $scope.connectivityRespHtmlReport = null;
                    });
                } else {
                    $scope.loading = false;
                    $scope.connectivityRespHtmlReport = null;
                    $scope.error = null;
                }
            }, true);
        };


        $scope.downloadAs = function (format) {
            SoapValidationReportDownloader.downloadAs(Connectivity.response.validationResult.xml, format);
        };

    }]);

angular.module('connectivity')
    .controller('ConnectivityReceiverCtrl', function ($scope, $sce, $http, Connectivity, $rootScope, $modalInstance, testCase, logger, ConnectivityClock, message) {
        $scope.testCase = testCase;
        $scope.user = Connectivity.user;
        $scope.logger = logger;
        $scope.endpoint = $scope.user.endpoint;
        $scope.message = message;
        $scope.sent = null;
        $scope.received = null;
        $scope.connecting = false;
        $scope.error = null;
        $scope.counterMax = 30;
        $scope.counter = 0;
        $scope.listenerReady = false;
        $scope.warning = null;
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
            ConnectivityClock.stop();
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
            $scope.warning = null;

            $scope.log("Configuring connection. Please wait...");
            Connectivity.user.transaction.openConnection().then(function (response) {
                    $scope.log("Connection configured.");
                    var execute = function () {
                        ++$scope.counter;
                        $scope.log("Waiting for incoming message....Elapsed time(second):" + $scope.counter + "s");
                        $scope.user.transaction.messages().then(function (response) {
                            var incoming = $scope.user.transaction.incoming;
                            var outgoing = $scope.user.transaction.outgoing;
                            if ($scope.counter < $scope.counterMax) {
                                if (incoming != null && incoming != '' && $scope.received == '') {
                                    $scope.log("Incoming Message Received <--------------------------------------");
                                    $scope.log(incoming);
                                    $scope.received = incoming;
                                }
                                if (outgoing != null && outgoing != '' && $scope.sent == '') {
                                    $scope.log("Outgoing Message Sent:    -------------------------------------->");
                                    $scope.log(outgoing);
                                    $scope.sent = outgoing;
                                }
                                if ($scope.received != '' && $scope.sent != '') {
                                    $scope.stop();
                                }
                            } else {
                                if (incoming == null || incoming == '') {
                                    $scope.warning = "We did not receive any incoming message after 30s. <p>Possible cause (1): You are using wrong credentials. Please check the credentials in your outbound SOAP Envelope against those created for your system.</p>  <p>Possible cause (2):The SOAP endpoint address may be incorrect.   Verify that you are using the correct SOAP endpoint address that is displayed by the tool.</p>" +
                                        "<p>Possible cause (3):The HTTP header field Content-Type  may not be set correctly for use with SOAP 1.2.   SOAP 1.2 requires application/soap+xml, and SOAP 1.2 requires text/xml.  The NIST Tool follows SOAP 1.2, which is required by section 2 of the 'CDC Transport Layer Protocol Recommendation V1.1' (http://www.cdc.gov/vaccines/programs/iis/technical-guidance/SOAP/downloads/transport-specification.pdf)</p>";

                                    $scope.log("We did not receive any incoming message after 30s");

                                } else if (outgoing == null || outgoing == '') {
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
                    ConnectivityClock.start(execute);
                }, function (error) {
                    $scope.log("Failed to configure incoming connection: Error: " + error);
                    $scope.log("Transaction aborted");
                    $scope.connecting = false;
                    $scope.error = error;
                }
            );
        };

    });

