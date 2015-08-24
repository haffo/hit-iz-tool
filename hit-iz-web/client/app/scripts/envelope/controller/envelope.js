'use strict';

angular.module('envelope')
    .controller('EnvelopeTestingCtrl', ['$scope', '$window', '$rootScope', 'Envelope', function ($scope, $window, $rootScope, Envelope) {
        $scope.loading = false;
        $scope.error = null;
        $scope.tabs = new Array();
        $scope.setActiveTab = function (value) {
            $scope.tabs[0] = false;
            $scope.tabs[1] = false;
            $scope.tabs[2] = false;
            $scope.activeTab = value;
            $scope.tabs[$scope.activeTab] = true;
        };

        $scope.init = function () {
            $rootScope.setSubActive('/envelope_testcase');
        };

        $rootScope.$on('env:testCaseLoaded', function (event) {
            if (Envelope.testCase != null && Envelope.testCase.id != null) {
                $rootScope.setSubActive('/envelope_execution');
            }
        });

        $scope.hasContent = function () {
            return Envelope.getContent() != '' && Envelope.getContent() != null;
        };

        $scope.disabled  = function () {
            return Envelope.testCase == null || Envelope.testCase.id  === null;
        };

    }]);


angular.module('envelope')
    .controller('EnvelopeExecutionCtrl', ['$scope', '$window', '$rootScope', 'Envelope', function ($scope, $window, $rootScope,Envelope) {
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
            return $scope.testCase != null ? $scope.testCase.type: '';
        };
        $scope.init = function () {
            $scope.error = null;
            $scope.loading = false;
            $rootScope.$on('env:testCaseLoaded', function (event, testCase) {
                $scope.setActiveTab(0);
                $scope.testCase = Envelope.testCase;
            });
        };
    }]);


angular.module('envelope')
    .controller('EnvelopeTestCaseCtrl', ['$scope', '$window', '$rootScope', 'Envelope', 'ngTreetableParams', 'EnvelopeTestCaseListLoader', function ($scope, $window, $rootScope, Envelope,ngTreetableParams, EnvelopeTestCaseListLoader) {

        $scope.selectedTestCase = Envelope.selectedTestCase;
        $scope.testCase = Envelope.testCase;
        $scope.testCases = [];
        $scope.loading = true;
        $scope.error = null;
        $scope.testCaseTree = {};

        /**
         *
         */
        $scope.init = function () {
            $scope.error = null;
            $scope.testCases = [];
            $scope.loading = true;
            $scope.params = new ngTreetableParams({
                getNodes: function (parent) {
                    return parent && parent != null ? parent.children : $scope.testCases;
                },
                getTemplate: function (node) {
                    return 'SOAPTestCase.html';
                }
            });
            var tcLoader = new EnvelopeTestCaseListLoader();
            tcLoader.then(function (testCases) {
                $scope.error = null;
                $scope.testCases = testCases;
                $scope.params.refresh();
                $scope.loading = false;
            }, function (error) {
                $scope.loading = false;
                $scope.error = "Sorry,Cannot fetch the test cases. Please refresh the page.";
            });
         };

        $scope.refreshEditor = function () {
            $scope.$broadcast("envelope:editor:init");
        };

        $scope.selectTestCase = function (node) {
            $scope.selectedTestCase = node;
            $rootScope.$broadcast('env:testCaseSelected');

        };

        $scope.loadTestCase = function () {
            Envelope.testCase = $scope.selectedTestCase;
            $scope.testCase = Envelope.testCase;
            $rootScope.$broadcast('env:testCaseLoaded',$scope.testCase);
        };
    }]);

angular.module('envelope')
    .controller('EnvelopeValidatorCtrl', ['$scope', '$http', '$window', 'XmlFormatter', 'Envelope','XmlEditorUtils', '$rootScope', 'XmlParser', 'XmlTreeUtils', 'EnvelopeValidator','$timeout', function ($scope, $http, $window, XmlFormatter, Envelope,XmlEditorUtils,$rootScope,XmlParser,XmlTreeUtils,EnvelopeValidator,$timeout) {
        $scope.testCase = Envelope.testCase;
        $scope.selectedTestCase = Envelope.selectedTestCase;
        $scope.vLoading = true;
        $scope.vError = null;
        $scope.selectedMessage = {id: -1, content: ''};

        $scope.eLoading = false;
        $scope.validating = false;
        $scope.editorInit = false;
        $scope.eError = null;

        $scope.rLoading = false;
        $scope.rError = null;
        $scope.resized = false;
        $scope.validationSettings = Envelope.validationSettings;
        $scope.validationResult = Envelope.validationResult;


        $scope.envelopeObject = [];
        $scope.tError = null;
        $scope.envelopeTree = {};
        $scope.tLoading = false;


        $scope.refreshEditor = function () {
            if ($scope.editor != undefined) {
                $timeout(function() {
                    $scope.editor.refresh();
                },1000);
             }
        };

        $scope.loadExampleMessage = function () {
            var content = Envelope.testCase.testContext.exampleMessage.content;
            var formatter = new XmlFormatter(content);
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
            $scope.refreshEditor();
            $scope.validateMessage();
            $scope.parse();
        };



        $scope.validate = function () {
            $scope.error = null;
            var backup = Envelope.editor.instance.doc.getValue();
            if (backup != '') {
                $scope.validating = true;
                var formatter = new XmlFormatter(backup);
                formatter.then(function (formatted) {
                    $scope.validating = false;
                    $scope.message(formatted);
                }, function (error) {
                    $scope.validating = false;
                    $scope.error = error;
                });
            }else{
                 $scope.message('');
            }
        };

        $scope.init = function () {

            $scope.editor = CodeMirror.fromTextArea(document.getElementById("envelopeTextArea"), {
                lineNumbers: true,
                fixedGutter: true,
                mode: 'xml',
                readOnly:false,
                showCursorWhenSelecting: true
            });

            $scope.editor.on("dblclick", function (editor) {
                $scope.$apply(function () {
                    Envelope.cursor.setLine(editor.doc.getCursor(true).line + 1);
                });
//                event.preventDefault();
            });

            $scope.editor.setSize(null, 300);
            Envelope.editor.init($scope.editor);

            $scope.tLoading = false;

            $scope.$watch(function () {
                return Envelope.cursor.updateIndicator;
            }, function () {
                XmlEditorUtils.select(Envelope.cursor, $scope.editor);
            }, true);

            $scope.$watch(function () {
                return Envelope.cursor.toString();
            }, function () {
                XmlTreeUtils.selectNode($scope.envelopeTree, Envelope.cursor);
            }, true);

//            $scope.$watch(function () {
//                return $scope.envelopeObject;
//            }, function () {
//                XmlTreeUtils.expandTree($scope.envelopeTree);
//            }, true);

            $rootScope.$on('env:expandTree', function (event) {
                XmlTreeUtils.expandTree($scope.envelopeTree);
            });

//
//            $scope.$on("refreshPanel", function (event) {
//                $scope.refreshEditor();
//            });

            $rootScope.$on('env:testCaseLoaded', function (event) {
                $scope.testCase = Envelope.testCase;
                $scope.message('');
            });


//            $scope.$watch(function () {
//                return Envelope.message.updateIndicator;
//            }, function (token) {
//                if (token !== "0") {
//                    $scope.validateMessage();
//                    $scope.parse();
//                }
//            }, true);

//            $scope.$watch(function () {
//                return Envelope.testCase.id;
//            }, function (token) {
//                if (token != null) {
//                    $scope.validateMessage();
//                }
//            }, true);


            $scope.setValidationResult({});
            $scope.refreshEditor();



//
//            $scope.$watch(function () {
//                return Envelope.testCase.id;
//            }, function () {
//                $scope.parse();
//            }, true);






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
                    data.url = 'api/soap/upload';
                    var jqXHR = data.submit()
                        .success(function (result, textStatus, jqXHR) {
                            var tmp = angular.fromJson(result);
//                          EnvelopeCurrentMessage.setName(fileName);
                            Envelope.setContent(result.content);
                            $scope.$broadcast("envelope:editor:update", true);
                            $scope.uploadError = null;
                            $scope.fileName = fileName;
                        })
                        .error(function (jqXHR, textStatus, errorThrown) {
                            $scope.fileName = fileName;
                            $scope.uploadError = 'Sorry, Cannot upload file: ' + fileName + ", Error: " + errorThrown;
                        })
                        .complete(function (result, textStatus, jqXHR) {

                        });
                });
            }
        });

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
            $scope.rLoading = true;
            $scope.rError = null;
            if (Envelope.testCase.id != null && Envelope.editor.instance != null && Envelope.editor.instance.doc.getValue() != '') {
                var validated =  new EnvelopeValidator().validate(Envelope.message.content, Envelope.testCase.id);
                validated.then(function (result) {
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

        $scope.setValidationResult = function (result) {
            Envelope.validationResult.init(result);
        };

        $scope.select = function (element) {
            if (element.line!= -1) {
                Envelope.cursor.setLine(element.line);
            }
        };

        $scope.parse = function () {
            $scope.tLoading = true;
            $scope.envelopeObject = [];
            $scope.tError = null;
            if (Envelope.testCase.id !== null && Envelope.getContent() != '') {
                var loader = new XmlParser(Envelope.getContent());
                loader.then(function (value) {
                    $scope.tLoading = false;
                    $scope.envelopeObject = value;
                    $rootScope.$broadcast('env:expandTree');
                }, function (tError) {
                    $scope.tLoading = false;
                    $scope.tError = tError;
                });
            } else {
                $scope.tLoading = false;
            }
        };


        $scope.onEnvelopeNodeSelect = function (node) {
            XmlTreeUtils.setCoordinate(node, Envelope.cursor);
        };


    }]);

'use strict';


angular.module('envelope')
    .controller('EnvelopeReportCtrl', ['$scope', '$sce', '$http', 'Envelope', 'SoapValidationReportGenerator', 'SoapValidationReportDownloader', '$rootScope', function ($scope, $sce, $http, Envelope, SoapValidationReportGenerator, SoapValidationReportDownloader,$rootScope) {
        $scope.envelopeHtmlReport = null;
        $scope.error = null;
        $scope.loading = false;
        $scope.testCase = Envelope.testCase;

        $scope.init = function () {
            $scope.$watch(function () {
                return  Envelope.validationResult.xml;
            }, function (xmlReport) {
                if (xmlReport != null && xmlReport != '') {
                    $scope.loading = true;
                    var promise = new SoapValidationReportGenerator(xmlReport, 'html');
                    promise.then(function (json) {
                        $scope.envelopeHtmlReport = $sce.trustAsHtml(json.htmlReport);
                        $scope.loading = false;
                        $scope.error = null;
                    }, function (error) {
                        $scope.error = error;
                        $scope.loading = false;
                        $scope.envelopeHtmlReport = null;
                    });
                } else {
                    $scope.loading = false;
                    $scope.envelopeHtmlReport = null;
                    $scope.error = null;
                }
            }, true);

            $rootScope.$on('env:testCaseLoaded', function (event) {
                $scope.testCase = Envelope.testCase;

            });

        };


        $scope.downloadAs = function (format) {
            //var data = angular.fromJson({"xmlReport": EnvelopeMessageValidationResult.xml});
            SoapValidationReportDownloader.downloadAs(Envelope.validationResult.xml, format);
        };

    }]);


'use strict';
