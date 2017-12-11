/**
 * Created by haffo on 5/4/15.
 */

(function (angular) {
    'use strict';
    var mod = angular.module('hit-edit-testcase-details', []);

    mod.directive('editTestcaseDetails', [
        function () {
            return {
                restrict: 'A',
                scope: {
                    type: '@'
                },
                templateUrl: 'EditTestCaseDetails.html',
                controller: 'EditTestCaseDetailsCtrl'
            };
        }
    ]);


    mod.directive('editTestDataSpecification', [
        function () {
            return {
                restrict: 'A',
                scope: {
                    target: '@'
                },
                templateUrl: 'EditTestDataSpecification.html',
                controller: 'EditTestDataSpecificationCtrl'
            };
        }
    ]);

    mod.directive('editTestStory', [
        function () {
            return {
                restrict: 'A',
                scope: {
                    target: '@'
                },
                templateUrl: 'EditTestStory.html',
                controller: 'EditTestStoryCtrl'
            };
        }
    ]);


    mod.directive('editMessageContent', [
        function () {
            return {
                restrict: 'A',
                scope: {
                    target: '@'
                },
                templateUrl: 'EditMessageContent.html',
                controller: 'EditMessageContentCtrl'
            };
        }
    ]);

    mod.directive('editTestDescription', [
        function () {
            return {
                restrict: 'A',
                scope: {
                    target: '@'
                },
                templateUrl: 'EditTestDescription.html',
                controller: 'EditTestDescriptionCtrl'
            };
        }
    ]);


    mod.directive('editJurorDocument', [
        function () {
            return {
                restrict: 'A',
                scope: {
                    target: '@'
                },
                templateUrl: 'EditJurorDocument.html',
                controller: 'EditJurorDocumentCtrl'
            };
        }
    ]);

    mod.directive('editExampleMessage', [
        function () {
            return {
                restrict: 'A',
                scope: {
                    target: '@'
                },
                templateUrl: 'EditExampleMessage.html',
                controller: 'EditExampleMessageCtrl'
            };
        }
    ]);

    mod.directive('editSupplementDocuments', [
        function () {
            return {
                restrict: 'A',
                scope: {
                    target: '@'
                },
                templateUrl: 'EditSupplementDocuments.html',
                controller: 'EditSupplementDocumentsCtrl'
            };
        }
    ]);

    mod
        .controller('EditExampleMessageCtrl',function ($scope, $rootScope, $sce, TestCaseDetailsService, $compile, $timeout, $modal,Notification) {
            $scope.editor = null;
            $scope.exampleMessage = null;
            $scope.eId = $scope.target + "-exampleMessage";
            $scope.$on($scope.eId, function (event, exampleMessage, format, title) {
                $scope.exampleMessage = exampleMessage;
                $scope.title = title;
            });

        });

    mod
        .controller('EditJurorDocumentCtrl', function ($scope, $rootScope, $sce, TestCaseDetailsService, $compile, $timeout, $modal,TestDetailsManagementService,Notification) {
            $scope.jurorDocument = null;
            $scope.error = null;
            $scope.eId = $scope.target + "-jurorDocument";
          $scope.editMode = false;
          $scope.testCase = null;
          $scope.originalValue = null;
          $scope.value = null;


          $scope.$on($scope.eId, function (event, jurorDocument, title) {
                $scope.jurorDocument = jurorDocument;
                if($scope.jurorDocument !=null && $scope.jurorDocument.html !=null){
                    $scope.jurorDocument.html =  TestCaseDetailsService.disableInputs($scope.jurorDocument.html);
                }
                $scope.error = null;
                $scope.title = title;
          });

          $scope.$on("event:editTestArtifact", function (event, testCase) {
            $scope.testCase = testCase;
          });

          $scope.edit = function () {
            $scope.editMode = true;
            $scope.value = $scope.testCase['jurorDocument'].html;
            $scope.originalValue = $scope.value;
          };

          $scope.cancel = function () {
            $scope.editMode = false;
            $scope.token = null;
            $scope.value =  $scope.originalValue ;
          };

          $scope.reset = function () {
            $scope.editMode = true;
            $scope.token = null;
            $scope.value =  $scope.originalValue ;
          };

          $scope.save = function () {
            $scope.editMode = true;
            if($scope.testCase['jurorDocument'] != null) {
              TestDetailsManagementService.updateArtifact($scope.testCase['jurorDocument'].id, $scope.value, $scope.token).then(function (result) {
                if (result.status === "SUCCESS") {
                  $scope.editMode = false;
                  $scope.testCase['jurorDocument'].html = $scope.value;
                  $scope.value = null;
                  $scope.originalValue = null;
                  var element = $("#" + $scope.eId);
                  if (element && element != null) {
                    element.html($scope.testCase['jurorDocument'].html);
                    $compile(element.contents())($scope);
                  }
                  Notification.success({
                    message: "Juror Document saved successfully!",
                    templateUrl: "NotificationSuccessTemplate.html",
                    scope: $rootScope,
                    delay: 5000
                  });
                } else {
                  $scope.error = "Sorry, Operation failed: \n" + result.message;
                }
              }, function (result) {
                $scope.error = "Sorry, Operation failed. Please try again";
              });
            }
          };

          $scope.delete = function () {
            var modalInstance = $modal.open({
              templateUrl: 'views/cb/manage/confirm-delete-jurorDocument.html',
              controller: 'ConfirmDialogCtrl',
              size: 'md',
              backdrop: 'static',
              keyboard: false
            });

            modalInstance.result.then(
              function (result) {
                if (result) {
                  $scope.error = null;
                  if ($scope.testCase['jurorDocument'] != null) {
                    TestDetailsManagementService.deleteArtifact($scope.testCase['jurorDocument'].id).then(function (result) {
                      if (result.status === "SUCCESS") {
                        delete $scope.testCase['jurorDocument'];
                        Notification.success({
                          message: "Juror Document deleted Successful!",
                          templateUrl: "NotificationSuccessTemplate.html",
                          scope: $rootScope,
                          delay: 5000
                        });
                      } else {
                        $scope.error = "Sorry, could not delete the juror document: \n" + result.message;
                      }
                    }, function (result) {
                      $scope.error = "Sorry, Operation failed. Please try again";
                    });
                  }
                }});
          };






        });

    mod
        .controller('EditTestDataSpecificationCtrl', function ($scope, $rootScope, $sce, TestCaseDetailsService, $compile, $timeout, $modal,TestDetailsManagementService,Notification) {
            $scope.loading = false;
            $scope.testDataSpecification = null;
            $scope.error = null;
            $scope.title = null;

            $scope.editMode = false;
            $scope.testCase = null;
            $scope.originalValue = null;
            $scope.value = null;

          $scope.eId = $scope.target + "-testDataSpecification";
            $scope.$on($scope.eId, function (event, testDataSpecification, title) {
              $scope.testDataSpecification = testDataSpecification;
              if($scope.testDataSpecification !=null && $scope.testDataSpecification.html !=null){
                $scope.testDataSpecification.html =  TestCaseDetailsService.disableInputs($scope.testDataSpecification.html);
              }
              $scope.loading = false;
              $scope.error = null;
              $scope.title = title;
            });

          $scope.$on("event:editTestArtifact", function (event, testCase) {
            $scope.testCase = testCase;
          });

          $scope.edit = function () {
            $scope.editMode = true;
            $scope.value = $scope.testCase['testDataSpecification'].html;
            $scope.originalValue = $scope.value;
          };

          $scope.cancel = function () {
            $scope.editMode = false;
            $scope.token = null;
            $scope.value =  $scope.originalValue ;
          };

          $scope.reset = function () {
            $scope.editMode = true;
            $scope.token = null;
            $scope.value =  $scope.originalValue ;
          };

          $scope.save = function () {
            $scope.editMode = true;
            if($scope.testCase['testDataSpecification'] != null) {
              TestDetailsManagementService.updateArtifact($scope.testCase['testDataSpecification'].id, $scope.value, $scope.token).then(function (result) {
                if (result.status === "SUCCESS") {
                  $scope.editMode = false;
                  $scope.testCase['testDataSpecification'].html = $scope.value;
                  $scope.value = null;
                  $scope.originalValue = null;
                  var element = $("#" + $scope.eId);
                  if (element && element != null) {
                    element.html($scope.testCase['testDataSpecification'].html);
                    $compile(element.contents())($scope);
                  }
                  Notification.success({
                    message: "Test Data specification saved Successful!",
                    templateUrl: "NotificationSuccessTemplate.html",
                    scope: $rootScope,
                    delay: 5000
                  });
                } else {
                  $scope.error = "Sorry, Operation failed: \n" + result.message;
                }
              }, function (result) {
                $scope.error = "Sorry, Operation failed. Please try again";
              });
            }
          };

          $scope.delete = function () {
            var modalInstance = $modal.open({
              templateUrl: 'views/cb/manage/confirm-delete-tds.html',
              controller: 'ConfirmDialogCtrl',
              size: 'md',
              backdrop: 'static',
              keyboard: false
            });

            modalInstance.result.then(
              function (result) {
                if (result) {
                  $scope.error = null;
                  if ($scope.testCase['testDataSpecification'] != null) {
                    TestDetailsManagementService.deleteArtifact($scope.testCase['testDataSpecification'].id).then(function (result) {
                      if (result.status === "SUCCESS") {
                        delete $scope.testCase['testDataSpecification'];
                        Notification.success({
                          message: "Test Data specification delete Successful!",
                          templateUrl: "NotificationSuccessTemplate.html",
                          scope: $rootScope,
                          delay: 5000
                        });
                      } else {
                        $scope.error = "Sorry, Operation failed: \n" + result.message;
                      }
                    }, function (result) {
                      $scope.error = "Sorry, Operation failed. Please try again";
                    });
                  }
                }});
          };






        });

    mod
        .controller('EditMessageContentCtrl', function ($scope, $rootScope, $sce, TestCaseDetailsService, $compile, $timeout, $modal,TestDetailsManagementService,Notification) {
            $scope.messageContent = null;
            $scope.eId = $scope.target + "-messageContent";
          $scope.editMode = false;
          $scope.testCase = null;
          $scope.originalValue = null;
          $scope.value = null;


          $scope.$on($scope.eId, function (event, messageContent, title) {
                $scope.messageContent = messageContent;
                if($scope.messageContent !=null && $scope.messageContent.html !=null){
                    $scope.messageContent.html =  TestCaseDetailsService.disableInputs($scope.messageContent.html);
                }
                $scope.title = title;
            });

            $scope.openMcInfo = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'MessageContentInfo.html',
                    windowClass: 'message-content-info-modal',
                    controller: 'MessageContentInfoCtrl',
                    keyboard: true,
                    backdrop: true
                });
            };

            $scope.isMcHelpPresent = function () {
                return $rootScope.appInfo != null && $rootScope.appInfo.messageContentInfo != null;
            };


          $scope.$on("event:editTestArtifact", function (event, testCase) {
            $scope.testCase = testCase;
          });

          $scope.edit = function () {
            $scope.editMode = true;
            $scope.value = $scope.testCase['messageContent'].html;
            $scope.originalValue = $scope.value;
          };

          $scope.cancel = function () {
            $scope.editMode = false;
            $scope.token = null;
            $scope.value =  $scope.originalValue ;
          };

          $scope.reset = function () {
            $scope.editMode = true;
            $scope.token = null;
            $scope.value =  $scope.originalValue ;
          };

          $scope.save = function () {
            $scope.editMode = true;
            if($scope.testCase['messageContent'] != null) {
              TestDetailsManagementService.updateArtifact($scope.testCase['messageContent'].id, $scope.value, $scope.token).then(function (result) {
                if (result.status === "SUCCESS") {
                  $scope.editMode = false;
                  $scope.testCase['messageContent'].html = $scope.value;
                  $scope.value = null;
                  $scope.originalValue = null;
                  var element = $("#" + $scope.eId);
                  if (element && element != null) {
                    element.html($scope.testCase['messageContent'].html);
                    $compile(element.contents())($scope);
                  }
                  Notification.success({
                    message: "Message content saved Successful!",
                    templateUrl: "NotificationSuccessTemplate.html",
                    scope: $rootScope,
                    delay: 5000
                  });
                } else {
                  $scope.error = "Sorry, Operation failed: \n" + result.message;
                }
              }, function (result) {
                $scope.error = "Sorry, Operation failed. Please try again";
              });
            }
          };

          $scope.delete = function () {
            var modalInstance = $modal.open({
              templateUrl: 'views/cb/manage/confirm-delete-messageContent.html',
              controller: 'ConfirmDialogCtrl',
              size: 'md',
              backdrop: 'static',
              keyboard: false
            });

            modalInstance.result.then(
              function (result) {
                if (result) {
                  $scope.error = null;
                  if ($scope.testCase['messageContent'] != null) {
                    TestDetailsManagementService.deleteArtifact($scope.testCase['messageContent'].id).then(function (result) {
                      if (result.status === "SUCCESS") {
                        delete $scope.testCase['messageContent'];
                        Notification.success({
                          message: "Message content deleted successful!",
                          templateUrl: "NotificationSuccessTemplate.html",
                          scope: $rootScope,
                          delay: 5000
                        });
                      } else {
                        $scope.error = "Sorry, Operation failed: \n" + result.message;
                      }
                    }, function (result) {
                      $scope.error = "Sorry, Operation failed. Please try again";
                    });
                  }
                }});
          };



        });


    mod
        .controller('EditTestStoryCtrl',function ($scope, $rootScope, $sce, TestCaseDetailsService, $compile, $timeout, $modal,TestDetailsManagementService,Notification) {
            $scope.messageContent = null;
            $scope.eId = $scope.target + "-testStory";

          $scope.editMode = false;
          $scope.testCase = null;
          $scope.originalValue = null;
          $scope.value = null;


            $scope.$on($scope.eId, function (event, testStory, title) {
                $scope.testStory = testStory;
                if($scope.testStory !=null && $scope.testStory.html !=null){
                    $scope.testStory.html =  TestCaseDetailsService.disableInputs($scope.testStory.html);
                }
                $scope.title = title;
            });

          $scope.$on("event:editTestArtifact", function (event, testCase) {
            $scope.testCase = testCase;
          });

          $scope.edit = function () {
            $scope.editMode = true;
            $scope.value = $scope.testCase['testStory'].html;
            $scope.originalValue = $scope.value;
          };

          $scope.cancel = function () {
            $scope.editMode = false;
            $scope.token = null;
            $scope.value =  $scope.originalValue ;
          };

          $scope.reset = function () {
            $scope.editMode = true;
            $scope.token = null;
            $scope.value =  $scope.originalValue ;
          };

          $scope.save = function () {
            $scope.editMode = true;
            if($scope.testCase['testStory'] != null) {
              TestDetailsManagementService.updateArtifact($scope.testCase['testStory'].id, $scope.value, $scope.token).then(function (result) {
                if (result.status === "SUCCESS") {
                  $scope.editMode = false;
                  $scope.testCase['testStory'].html = $scope.value;
                  $scope.value = null;
                  $scope.originalValue = null;
                  var element = $("#" + $scope.eId);
                  if (element && element != null) {
                    element.html($scope.testCase['testStory'].html);
                    $compile(element.contents())($scope);
                  }
                  Notification.success({
                    message: "Test story saved successful!",
                    templateUrl: "NotificationSuccessTemplate.html",
                    scope: $rootScope,
                    delay: 5000
                  });
                } else {
                  $scope.error = "Sorry, Operation failed: \n" + result.message;
                }
              }, function (result) {
                $scope.error = "Sorry, Operation failed. Please try again";
              });
            }
          };

          $scope.delete = function () {
            var modalInstance = $modal.open({
              templateUrl: 'views/cb/manage/confirm-delete-testStory.html',
              controller: 'ConfirmDialogCtrl',
              size: 'md',
              backdrop: 'static',
              keyboard: false
            });

            modalInstance.result.then(
              function (result) {
                if (result) {
                  $scope.error = null;
                  if ($scope.testCase['testStory'] != null) {
                    TestDetailsManagementService.deleteArtifact($scope.testCase['testStory'].id).then(function (result) {
                      if (result.status === "SUCCESS") {
                        delete $scope.testCase['testStory'];
                        Notification.success({
                          message: "Test story deleted successful!",
                          templateUrl: "NotificationSuccessTemplate.html",
                          scope: $rootScope,
                          delay: 5000
                        });
                      } else {
                        $scope.error = "Sorry, could not delete the test story: \n" + result.message;
                      }
                    }, function (result) {
                      $scope.error = "Sorry, Operation failed. Please try again";
                    });
                  }
                }});
          };




        });

    mod
        .controller('EditSupplementDocumentsCtrl', function ($scope, $rootScope, $sce, TestCaseDetailsService, $compile, $timeout, $modal,TestDetailsManagementService,Notification) {
            $scope.supplements = null;
            $scope.eId = $scope.target + "-supplements";
            $scope.$on($scope.eId, function (event, supplements, title) {
                 $scope.supplements = supplements;
            });

            $scope.isLink = function (path) {
                return path && path != null && path.startsWith("http");
            };

            $scope.downloadDocument = function (path) {
                if (path != null) {
                    var form = document.createElement("form");
                    form.action = "api/documentation/downloadDocument";
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
        });

    mod
        .controller('EditTestDescriptionCtrl', function ($scope, $rootScope, $sce, TestCaseDetailsService, $compile, $timeout, $modal,TestDetailsManagementService,Notification) {
            $scope.description = null;
            $scope.eId = $scope.target + "-testDescription";
            $scope.$on($scope.eId, function (event, description, title) {
                $scope.description = description;
                if($scope.description !=null){
                    $scope.description =  TestCaseDetailsService.disableInputs($scope.description);
                }
                $scope.title = title;
            });
        });

    mod
        .controller('EditTestCaseDetailsCtrl',  function ($scope, $rootScope, $sce, TestCaseDetailsService, $compile, $timeout, $modal,TestDetailsManagementService,Notification) {
            $scope.tabs = [];
            $scope.loading = false;
            $scope.editor = null;
            $scope.error = null;
            $scope.target = 'edit-selected-testcase';
            $scope.$on($scope.type + ':testCaseSelected', function (event, testCase) {
                $scope.tabs[0] = true;
                $scope.tabs[1] = false;
                $scope.tabs[2] = false;
                $scope.tabs[3] = false;
                $scope.tabs[4] = false;
                $scope.tabs[5] = false;
                $scope.testCase = testCase;
                $scope.loading = true;
                $scope.error = null;
                $scope.editor = null;

                var testContext = testCase['testContext'];
                if (testContext && testContext != null) {
                    var exampleMsgId = $scope.target + '-exampleMessage';
                    TestCaseDetailsService.removeHtml(exampleMsgId);
                    var exampleMessage = testContext.message && testContext.message.content && testContext.message.content != null ? testContext.message.content : null;
                    if (exampleMessage != null) {
                        $scope.$broadcast(exampleMsgId, exampleMessage, testContext.format, testCase.name);
                    }
                }
                TestCaseDetailsService.details(testCase.type, testCase.id).then(function (result) {
                    $scope.testCase['testStory'] = result['testStory'];
                    $scope.testCase['jurorDocument'] = result['jurorDocument'];
                    $scope.testCase['testDataSpecification'] = result['testDataSpecification'];
                    $scope.testCase['messageContent'] = result['messageContent'];
                    $scope.testCase['supplements'] = result['supplements'];

                    var tsId = $scope.target + '-testStory';
                    var jDocId = $scope.target + '-jurorDocument';
                    var mcId = $scope.target + '-messageContent';
                    var tdsId = $scope.target + '-testDataSpecification';
                    var descId = $scope.target + '-testDescription';
                    var supplementsId = $scope.target + '-supplements';

                    TestCaseDetailsService.removeHtml(tdsId);
                    TestCaseDetailsService.removeHtml(mcId);
                    TestCaseDetailsService.removeHtml(jDocId);
                    TestCaseDetailsService.removeHtml(tsId);
                    TestCaseDetailsService.removeHtml(descId);

                    $scope.$broadcast(tsId, $scope.testCase['testStory'], $scope.testCase.name + "-TestStory");
                    $scope.$broadcast(jDocId, $scope.testCase['jurorDocument'], $scope.testCase.name + "-JurorDocument");
                    $scope.$broadcast(mcId, $scope.testCase['messageContent'], $scope.testCase.name + "-MessageContent");
                    $scope.$broadcast(tdsId, $scope.testCase['testDataSpecification'], $scope.testCase.name + "-TestDataSpecification");
                    $scope.$broadcast(descId, $scope.testCase['description'], $scope.testCase.name + "-TestDescription");
                    $scope.$broadcast(supplementsId, $scope.testCase['supplements'], $scope.testCase.name + "-Supplements");

                    $scope.loadTestInfo();
                    $scope.loading = false;
                    $scope.error = null;
                }, function (error) {
                    $scope.testCase['testStory'] = null;
                    $scope.testCase['testPackage'] = null;
                    $scope.testCase['jurorDocument'] = null;
                    $scope.testCase['testDataSpecification'] = null;
                    $scope.testCase['messageContent'] = null;
                    $scope.testCase['supplements'] = null;
                    $scope.loading = false;
                    $scope.error = "Sorry, could not load the details. Please try again";
                });
            });

            $scope.loadTestInfo = function () {
                if ($scope.testCase != null) {
                    if ($scope.testCase['testStory'] && $scope.testCase['testStory'] != null) {
                        $scope.loadTestStory();
                    } else {
                        $scope.loadTestDescription();
                    }
                }
            };

            $scope.loadTestStory = function () {
                $scope.loadHtmlContent($scope.target + "-" + "testStory", $scope.testCase["testStory"]);
            };

            $scope.loadTestDescription = function () {
              var element = TestCaseDetailsService.loadHtmlContent($scope.target + "-" + "testDescription", $scope.testCase['description']);
                if (element && element != null) {
                    $compile(element.contents())($scope);
                }
            };

            $scope.loadArtifactHtml = function (key) {
              $scope.loadHtmlContent($scope.target + "-" + key, $scope.testCase[key]);
            };

            $scope.loadHtmlContent = function (id, content) {
              $scope.$broadcast("event:editTestArtifact",$scope.testCase);
              var element = TestCaseDetailsService.loadArtifactHtml(id, content);
              if (element && element != null) {
                    $compile(element.contents())($scope);
              }
            };

            $scope.loadTestDocuments = function (key) {
                $scope.loadHtmlContent($scope.target + "-" + key, $scope.testCase[key]);
            };




//            var getTestType = function (testCase) {
//                return testCase.type.toLowerCase();
//            };
//
//            var getItem = function (obj, type) {
//                return {
//                    "dataElement": obj.DataElement,
//                    "categorization": obj.Categrization,
//                    "data": obj.Data,
//                    "location": obj.Location,
//                    "type": type
//                }
//            };

            $scope.toHTML = function (content) {
                return $sce.trustAsHtml(content);
            };

            var getSizeByContent = function (content) {
                var tabs = content.split("\n");
                if (tabs.length === 0)
                    tabs = content.split("\t");
                if (tabs.length === 0)
                    tabs = content.split("\r");
                var length = tabs.length > 30 ? 30 : tabs.length + 3;
                return parseInt((420 * length) / 30);
            };

            $scope.buildExampleMessageEditor = function () {
                var eId = $scope.target + '-exampleMessage';
                if ($scope.editor === null || !$scope.editor) {
                    $timeout(function () {
                        $scope.editor = TestCaseDetailsService.buildExampleMessageEditor(eId, $scope.testCase.testContext.message.content, $scope.editor, $scope.testCase.testContext && $scope.testCase.testContext != null ? $scope.testCase.testContext.format : null);
                    }, 100);
                }
                $timeout(function () {
                    if ($("#" + eId)) {
                        $("#" + eId).scrollLeft();
                    }
                }, 1000);
            };
        });




  mod.factory('TestDetailsManagementService', ['$q', '$http',
    function ($q, $http) {
      var manager = {

        updateArtifact: function (id, content, token) {
          var delay = $q.defer();
          var params = $.param({content: content, token: token});
          var config = {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
            }
          };
          $http.post("api/cb/management/artifacts/" + id, params, config).then(
            function (object) {
              try {
                delay.resolve(angular.fromJson(object.data));
              } catch (e) {
                delay.reject(e);
              }
            },
            function (response) {
              delay.reject(response.data);
            }
          );
          return delay.promise;
        },

        deleteArtifact: function (id) {
          var delay = $q.defer();
          $http.post("api/cb/management/artifacts/" + id + "/delete").then(
            function (object) {
              try {
                delay.resolve(angular.fromJson(object.data));
              } catch (e) {
                delay.reject(e);
              }
            },
            function (response) {
              delay.reject(response.data);
            }
          );
          return delay.promise;
        },

        deleteTest: function (context, id) {
          var delay = $q.defer();
          $http.post("api/cb/management/" + context + "/" + id + "/delete").then(
            function (object) {
              try {
                delay.resolve(angular.fromJson(object.data));
              } catch (e) {
                delay.reject(e);
              }
            },
            function (response) {
              delay.reject(response.data);
            }
          );
          return delay.promise;
        }
      };

      return manager;
    }
  ]);

  mod.controller('EditMessageContentInfoCtrl',
        function ($scope, $modalInstance, $rootScope) {
            $scope.mcHelpInfo = $rootScope.appInfo.messageContentInfo;
            $scope.close = function () {
                $modalInstance.dismiss('cancel');
            }
        }
    );


})
(angular);
