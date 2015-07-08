'use strict';
angular.module('connectivity')
    .controller('ConnectivityTestingCtrl', ['$scope', 'Connectivity', '$rootScope', function ($scope, Connectivity, $rootScope) {
        $scope.tabs = new Array();

        $scope.loading = false;
        $scope.setActiveTab = function (value) {
            $scope.tabs[0] = false;
            $scope.tabs[1] = false;
            $scope.activeTab = value;
            $scope.tabs[$scope.activeTab] = true;
            $scope.$broadcast("refreshPanel");
        };

        $scope.init = function () {
            $scope.setActiveTab(0);
        };

        $rootScope.$on('conn:testCaseLoaded', function (event) {
            $scope.setActiveTab(1);
        });


        $scope.disabled = function () {
            return Connectivity.testCase == null || Connectivity.testCase.id === null;
        };

    }]);


angular.module('connectivity')
    .controller('ConnectivityTestCaseCtrl', ['$scope', 'Connectivity', 'ngTreetableParams', '$rootScope', 'ConnectivityTestCaseListLoader', function ($scope, Connectivity, ngTreetableParams, $rootScope, ConnectivityTestCaseListLoader) {

        $scope.connectivity = Connectivity;
        $scope.loading = true;
        $scope.error = null;
        $scope.testCases = [];
        $scope.testCase = Connectivity.testCase;
        $scope.selectedTestCase = Connectivity.selectedTestCase;
        $scope.testCaseTree = {};

        $scope.selectTestCase = function (node) {
            $scope.selectedTestCase = node;
            $rootScope.$broadcast('conn:testCaseSelected');
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
                    return 'SOAPTestCase.html';
                }
            });

            var tcLoader = new ConnectivityTestCaseListLoader();
            tcLoader.then(function (testCases) {
                $scope.testCases = testCases;
                $scope.params.refresh();
                $scope.loading = false;
                $scope.error = null;
            }, function (error) {
                $scope.error = "Sorry, Failed to fetch the test cases. Please refresh page and try again.";
                $scope.loading = false;
            });
        };

        $scope.loadTestCase = function () {
            Connectivity.testCase = $scope.selectedTestCase;
            $scope.testCase = Connectivity.testCase;
            $rootScope.$broadcast('conn:testCaseLoaded');
        };
    }]);

angular.module('connectivity')
    .controller('ConnectivityExecutionCtrl', ['$scope', '$timeout', '$interval', 'Connectivity', '$rootScope', '$modal',
        function ($scope, $timeout, $interval, Connectivity, $rootScope, $modal) {

            $scope.logger = Connectivity.logger;
            $scope.loading = false;
            $scope.testCase = Connectivity.testCase;
            $scope.selectedTestCase = Connectivity.selectedTestCase;
            $scope.loading = false;
            $scope.connecting = false;
            $scope.error = null;
            $scope.endpoint = Connectivity.serverEndpoint;
//        $scope.alert = {message: '', type: ''};
//        $scope.listenForIncoming = null;
//        $scope.counterMax = 30;
//        $scope.counter = 0;
//        $scope.listenerReady = false;
//        $scope.serverEndpoint = Connectivity.serverEndpoint;
            $scope.user = Connectivity.user;
            $scope.hidePwd = true;

            $scope.init = function () {
                $rootScope.$on('conn:testCaseLoaded', function (event) {
                    $scope.testCase = Connectivity.testCase;
                    $scope.logger.init();
                    $scope.loading = true;
                    $scope.error = null;
                    $scope.connecting = false;
                    if (Connectivity.testCase.sutType == 'RECEIVER') {
                        $scope.initOutgoingEnvironment();
                    } else {
                        $scope.initIncomingEnvironment();
                    }
                });

                Connectivity.user.init().then(function (response) {
                }, function (error) {
                     $scope.error = error;
                });
            };

            $scope.log = function (log) {
                $scope.logger.log(log);
            };

            $scope.initOutgoingEnvironment = function () {
                $scope.logger.clear();
                Connectivity.response.setContent('');
                Connectivity.request.setContent(Connectivity.testCase.testContext.message);
            };

            $scope.initIncomingEnvironment = function () {
                Connectivity.request.setContent('');
                Connectivity.response.setContent('');
                $scope.logger.clear();
                $scope.error = null;
                //$(window).trigger('resize');
            };


            $scope.isValidConfig = function(){
                return $scope.user.receiverEndpoint != null && $scope.user.receiverEndpoint != '';
            };


            $scope.openReceiverConfig = function () {
                $scope.logger.init();
                var modalInstance = $modal.open({
                    templateUrl: 'TransactionReceiverCtrl.html',
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
                        },
                        endpoint: function () {
                            return Connectivity.serverEndpoint;
                        }
                    }
                });
                modalInstance.result.then(function (result) {
                    if (result.received != null) {
                        Connectivity.request.setContent(result.received);
                    }
                    if (result.sent != null) {
                        Connectivity.response.setContent(result.sent);
                    }

                }, function () {
                    Connectivity.response.setContent('');
                    Connectivity.request.setContent('');
                });
            };


            $scope.send = function () {
                $scope.logger.init();
                 var modalInstance = $modal.open({
                    templateUrl: 'TransactionSender.html',
                    controller: 'ConnectivitySenderCtrl',
                    size:'lg',
                    backdrop:'static',
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
                    if(result.sent != null){
                        Connectivity.request.setContent(result.sent);
                    }
                    if(result.received != null){
                        Connectivity.response.setContent(result.received);
                    }

                }, function () {
                    Connectivity.response.setContent('');
                });
            };

            $scope.configureReceiver = function () {
                 var modalInstance = $modal.open({
                    templateUrl: 'TransactionConfigureReceiver.html',
                    controller: 'ConnectivityConfigureReceiverCtrl',
                    resolve: {
                        testCase: function () {
                            return Connectivity.testCase;
                        },
                        user: function () {
                            return Connectivity.user;
                        }
                    }
                });
                modalInstance.result.then(function (user) {
                    Connectivity.user.senderUsername = user.senderUsername;
                    Connectivity.user.senderPassword =  user.senderPassword;
                    Connectivity.user.senderFacilityID =  user.senderFacilityID;
                    Connectivity.user.receiverUsername =  user.receiverUsername;
                    Connectivity.user.receiverPassword =  user.receiverPassword;
                    Connectivity.user.receiverFacilityId =  user.receiverFacilityId;
                    Connectivity.user.receiverEndpoint =  user.receiverEndpoint;
                     Connectivity.response.setContent('');
                }, function () {
                    Connectivity.response.setContent('');
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
                    Connectivity.response.setContent('');
                }, function () {
                    Connectivity.response.setContent('');
                });
            };

            $scope.hasRequestContent = function () {
                return Connectivity.request.getContent() != null && Connectivity.request.getContent() != '';
            };

        }]);



'use strict';

angular.module('connectivity')
    .controller('ConnectivityReqCtrl', ['$scope', '$http', 'Connectivity', 'XmlFormatter', '$window', 'XmlEditorUtils','$timeout', '$rootScope', 'ConnectivityValidator', '$modal', function ($scope, $http, Connectivity, XmlFormatter, $window, XmlEditorUtils,$timeout,$rootScope,ConnectivityValidator,$modal) {

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
        $scope.validationSettings =  $scope.request.validationSettings;
        $scope.validationResult =  $scope.request.validationResult;
        $scope.editor =  $scope.request.editor;
        $scope.itemsByPage=10;
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
                            $scope.request.editor.doc.setValue(tmp.content);
                            $scope.$broadcast("connectivityReq:editor:update", true);
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
            if(backup != null && backup != '') {
                $scope.validating = true;
                var validator = new XmlFormatter(backup);
                validator.then(function (formatted) {
                    $scope.validating = false;
                    $scope.request.setContent(formatted);
                }, function (error) {
                    $scope.validating = false;
                    $scope.vError = error;
                });
            }
        };

        $scope.clearMessage = function () {
            $scope.error = null;
            $scope.request.setContent('');
            $scope.refreshEditor();
        };


        $scope.refreshEditor = function () {
            if ($scope.editor != undefined) {
                $timeout(function() {
                    $scope.editor.refresh();
                },1000);
            }
        };


        $scope.saveMessage = function () {
            $scope.request.message.download();
        };

        $scope.resize = function () {
        };

        $scope.validateMessage = function () {
            $scope.rLoading = true;
            $scope.rError = null;
            if ($scope.testCase.id != null && $scope.request.getContent() != '') {
                var validator = new ConnectivityValidator().validate($scope.request.message.content,  $scope.testCase.id, Connectivity.user.id, 'req', null);
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
            $scope.validationResult  =  $scope.request.validationResult;
            $scope.errors = $scope.validationResult.errors;
            $scope.affirmatives = $scope.validationResult.affirmatives;
            $scope.alerts = $scope.validationResult.alerts;
            $scope.ignores = $scope.validationResult.ignores;
            $scope.warnings = $scope.validationResult.warnings;
        };

        $scope.select = function (element) {
            if (element.line!= -1) {
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
                readOnly:false,
                showCursorWhenSelecting: true
            });
            $scope.editor.setOption("readOnly", true);
            $scope.editor.setSize(null, 300);

            $scope.editor.on("dblclick", function (editor) {
                $scope.$apply(function () {
                    $scope.request.cursor.setLine($scope.editor.doc.getCursor(true).line + 1);
                });
                event.preventDefault();
            });

            $scope.request.editor.init($scope.editor);

            $rootScope.$on('conn:testCaseLoaded', function (event) {
                $scope.testCase = Connectivity.testCase;
                if(Connectivity.testCase.sutType == 'RECEIVER'){
                    Connectivity.request.setContent(Connectivity.testCase.testContext.message);
                }
                $scope.refreshEditor();
                $scope.validateMessage();

            });


            $scope.$watch(function () {
                return $scope.request.cursor.updateIndicator;
            }, function () {
                XmlEditorUtils.select($scope.request.cursor, $scope.request.editor.instance);
            }, true);

            $scope.$watch(function () {
                return $scope.request.editor.instance.doc.getValue();
            }, function (content) {
                $scope.request.message.content = content;
            }, true);

            $scope.$watch(function () {
                return  $scope.request.message.updateIndicator;
            }, function (token) {
                if (token !== "0") {
                    $scope.validateMessage();
                }
            }, true);



            $scope.setValidationResult({});
            $scope.refreshEditor();

        };


    }]);


angular.module('connectivity')
    .controller('ConnectivityReqReportCtrl', ['$scope', '$sce', '$http',  'SoapValidationReportGenerator', 'SoapValidationReportDownloader','Connectivity','$rootScope', function ($scope, $sce, $http, SoapValidationReportGenerator, SoapValidationReportDownloader,Connectivity,$rootScope) {
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
                        $scope.connectivityReqHtmlReport = $sce.trustAsHtml(json.htmlReport);
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
    .controller('ConnectivityConfigureReceiverCtrl', function ($scope, $sce, $http,Connectivity,$rootScope, $modalInstance, testCase,user) {
        $scope.testCase = testCase;
        $scope.user = angular.copy(user);
        $scope.save = function () {
            $modalInstance.close($scope.user);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.hasRequestContent = function () {
            return  $scope.message != null &&  $scope.message != '';
        };

    });


angular.module('connectivity')
    .controller('ConnectivityViewReceiverConfigurationCtrl', function ($scope, $sce, $http,Connectivity,$rootScope, $modalInstance, testCase,ConnectivityInitiator, message, user, logger) {
        $scope.testCase = testCase;
        $scope.user = user;
        $scope.close = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.hasRequestContent = function () {
            return  $scope.message != null &&  $scope.message != '';
        };

    });




angular.module('connectivity')
    .controller('ConnectivitySenderCtrl', function ($scope, $sce, $http,Connectivity,$rootScope, $modalInstance, testCase,ConnectivityInitiator, message, user, logger) {
        $scope.testCase = testCase;
        $scope.message = message;
        $scope.user = user;
        $scope.logger = logger;
        $scope.sent = null;
        $scope.received = null;
        $scope.connecting = false;
        $scope.error = null;

        $scope.isValidConfig = function(){
            return $scope.user.receiverEndpoint != null && $scope.user.receiverEndpoint != '';
        };

        $scope.close = function () {
            $modalInstance.close({"sent": $scope.sent, "received":$scope.received});
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.hasRequestContent = function () {
            return  $scope.message != null &&  $scope.message != '';
        };

        $scope.send = function () {
            $scope.error = null;
            if ($scope.user.receiverEndpoint != '' && $scope.hasRequestContent()) {
                $scope.connecting = true;
                $scope.logger.init();
                $scope.received = '';
                $scope.logger.log("Sending request ========================>");
                var sender = new ConnectivityInitiator().send($scope.user,$scope.testCase.id,$scope.message);
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
                    Connectivity.response.setContent('');
                    $scope.received = '';
                });
            }else{
                $scope.error = "No outgoing message found";
            }
        };

        $scope.send();

    });

angular.module('connectivity')
    .controller('ConnectivityRespCtrl', ['$scope', '$http', 'Connectivity', '$window','XmlFormatter','XmlEditorUtils', '$timeout','$rootScope','ConnectivityValidator', '$modal', function ($scope, $http, Connectivity, $window,XmlFormatter,XmlEditorUtils,$timeout, $rootScope,ConnectivityValidator,$modal) {
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

        $scope.itemsByPage=10;

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
                readOnly:false,
                showCursorWhenSelecting: true
            });

            $scope.editor.setOption("readOnly", true);
            $scope.editor.setSize(null, 300);

            $scope.editor.on("dblclick", function (editor) {
                $scope.$apply(function () {
                    $scope.response.cursor.setLine($scope.editor.doc.getCursor(true).line+1);
                });
                event.preventDefault();
            });

            $scope.response.editor.init($scope.editor);


            $scope.$watch(function () {
                return  $scope.response.cursor.updateIndicator;
            }, function () {
                XmlEditorUtils.select( $scope.response.cursor,$scope.editor);
            }, true);


            $rootScope.$on('conn:testCaseLoaded', function (event) {
                $scope.testCase = Connectivity.testCase;
                $scope.refreshEditor();
                $scope.clearMessage();
            });


            $scope.$watch(function () {
                return $scope.response.editor.instance.doc.getValue();
            }, function (content) {
                $scope.response.message.content = content;
            }, true);



            $scope.$watch(function(){
                return Connectivity.response.message.updateIndicator;
            }, function (token) {
                if(token && token !== '0') {
                    $scope.validateMessage();
                }
            }, true);

            $scope.setValidationResult({});
            $scope.refreshEditor();


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
            $scope.response.setContent('');
            $scope.refreshEditor();
        };

        $scope.refreshEditor = function () {
            if ($scope.editor != undefined) {
                $timeout(function() {
                    $scope.editor.refresh();
                },1000);
            }
        };


        $scope.saveMessage = function () {
            $scope.response.message.download();
        };

        $scope.validate = function(){
            $scope.error = null;
            var backup = $scope.response.editor.instance.doc.getValue();
            if(backup != null && backup != '') {
                $scope.validating = true;
                var validator = new XmlFormatter(backup);
                validator.then(function (formatted) {
                    $scope.validating = false;
                    $scope.response.setContent(formatted);
                }, function (error) {
                    $scope.validating = false;
                    $scope.error = error;
                });
            }
        };


        $scope.resize = function(){
        };

        /**
         * Validate the content of the editor
         */
        $scope.validateMessage = function () {
            $scope.rLoading = true;
            $scope.rError = null;
            if (Connectivity.testCase.id != null && Connectivity.response.getContent() != '') {
                var validator = new ConnectivityValidator().validate($scope.response.message.content,  Connectivity.testCase.id, Connectivity.user.id, 'resp', Connectivity.request.getContent());
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
            $scope.validationResult  =  $scope.response.validationResult;
            $scope.errors = $scope.validationResult.errors;
            $scope.affirmatives = $scope.validationResult.affirmatives;
            $scope.alerts = $scope.validationResult.alerts;
            $scope.ignores = $scope.validationResult.ignores;
            $scope.warnings = $scope.validationResult.warnings;
        };

        $scope.select = function (element) {
            if (element.line!= -1) {
                Connectivity.response.cursor.setLine(element.line);
            }
        };



    }]);


angular.module('connectivity')
    .controller('ConnectivityRespReportCtrl', ['$scope','$sce', '$http', 'SoapValidationReportGenerator','SoapValidationReportDownloader','Connectivity' ,function ($scope, $sce, $http, SoapValidationReportGenerator,SoapValidationReportDownloader,Connectivity) {
        $scope.connectivityRespHtmlReport = null;
        $scope.error = null;
        $scope.loading = false;
        $scope.testCase = Connectivity.testCase;

        $scope.init = function () {
            $scope.$watch(function () {
                return  Connectivity.response.validationResult.xml;
            }, function (xmlReport) {
                if(xmlReport!=null && xmlReport != '') {
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
                }else{
                    $scope.loading = false;
                    $scope.connectivityRespHtmlReport = null;
                    $scope.error = null;
                }
            }, true);
        };


        $scope.downloadAs = function(format){
            SoapValidationReportDownloader.downloadAs(Connectivity.response.validationResult.xml, format);
        };

    }]);

angular.module('connectivity')
    .controller('ConnectivityReceiverCtrl', function ($scope, $sce, $http,Connectivity,$rootScope, $modalInstance, testCase, user, logger,ConnectivityClock, endpoint,message) {
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
            $modalInstance.close({"sent": $scope.sent, "received":$scope.received});
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.hasRequestContent = function () {
            return  $scope.message != null &&  $scope.message != '';
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
                                if (incoming != null && incoming != '' && $scope.received  == '') {
                                    $scope.log("Incoming Message Received <--------------------------------------");
                                    $scope.log(incoming);
                                    $scope.received = incoming;
                                }
                                if (outgoing != null && outgoing != '' && $scope.sent  == '') {
                                    $scope.log("Outgoing Message Sent:    -------------------------------------->");
                                    $scope.log(outgoing);
                                    $scope.sent = outgoing;
                                }
                                if ($scope.received != '' && $scope.sent != '') {
                                    $scope.stop();
                                }
                            } else {
                                if (incoming == null || incoming == '') {
                                    $scope.log("We did not receive any incoming message after 30s or you are using wrong " +
                                        "credentials.");
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

