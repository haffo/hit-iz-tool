'use strict';

'use strict';

angular.module('cf')
  .controller('CFEnvCtrl', ['$scope', '$window', '$rootScope', 'CB', 'StorageService', '$timeout', 'TestCaseService', 'TestStepService', function ($scope, $window, $rootScope, CB, StorageService, $timeout, TestCaseService, TestStepService) {

    $scope.testCase = null;

    $scope.setSubActive = function (tab) {
      $rootScope.setSubActive(tab);
      if (tab === '/cf_execution') {
        $scope.$broadcast('cf:refreshEditor');
      }
    };

    $scope.initEnv = function () {
      var tab = StorageService.get(StorageService.ACTIVE_SUB_TAB_KEY);
      if (tab == null || tab != '/cf_execution') tab = '/cf_execution';
      $scope.setSubActive(tab);
      // $scope.$on('cf:testCaseLoaded', function (event, testCase, tab) {
      //   $scope.testCase = testCase;
      // });
    };

  }]);



angular.module('cf')
  .controller('CFTestExecutionCtrl', ['$scope', '$http', 'CF', '$window', '$modal', '$filter', '$rootScope', 'CFTestPlanListLoader', '$timeout', 'StorageService', 'TestCaseService', 'TestStepService', 'userInfoService', 'CFTestPlanLoader', function ($scope, $http, CF, $window, $modal, $filter, $rootScope, CFTestPlanListLoader, $timeout, StorageService, TestCaseService, TestStepService,userInfoService,CFTestPlanLoader) {

    $scope.cf = CF;
    $scope.loading = false;
    $scope.loadingTC = false;
    $scope.error = null;
    $scope.testCases = [];
    $scope.testCase = null;
    $scope.tree = {};
    $scope.tabs = new Array();
    $scope.error = null;
    $scope.collapsed = false;
    $scope.selectedTP = {id: null};
    $scope.selectedScope = {key: null};
    $scope.testPlanScopes = [{key: 'USER', name: 'Private'}, {key: 'GLOBAL', name: 'Public'}];

    var testCaseService = new TestCaseService();

    $scope.setActiveTab = function (value) {
      $scope.tabs[0] = false;
      $scope.tabs[1] = false;
      $scope.tabs[2] = false;
      $scope.tabs[3] = false;
      $scope.activeTab = value;
      $scope.tabs[$scope.activeTab] = true;
    };

    $scope.getTestCaseDisplayName = function (testCase) {
      return testCase.parentName + " - " + testCase.label;
    };


    $scope.selectTP = function () {
      $scope.loadingTC = false;
      $scope.errorTC = null;
      $scope.testCase = null;
      console.log("$scope.selectedTP.id=" + $scope.selectedTP.id);
      if ($scope.selectedTP.id && $scope.selectedTP.id !== null && $scope.selectedTP.id !== "") {
        $scope.loadingTC = true;
        var tcLoader = new CFTestPlanLoader($scope.selectedTP.id);
        tcLoader.then(function (testPlan) {
          $scope.testCases = [testPlan];
          testCaseService.buildCFTestCases(testPlan);
          $scope.refreshTree();
          StorageService.set(StorageService.CF_SELECTED_TESTPLAN_ID_KEY, $scope.selectedTP.id);
          $scope.loadingTC = false;
        }, function (error) {
          $scope.loadingTC = false;
          $scope.errorTP = "Sorry, Cannot load the test cases. Please try again";
        });
      } else {
        $scope.testCases = null;
        StorageService.set(StorageService.CF_SELECTED_TESTPLAN_ID_KEY, "");
        $scope.loadingTC = false;
      }
    };

    $scope.selectScope = function () {
      $scope.error = null;
       $scope.errorTP = null;
      $scope.testCases = null;
      $scope.testPlans = null;
      $scope.testCase = null;
      $scope.loadingTC = false;
      $scope.loading = false;
      StorageService.set(StorageService.CF_SELECTED_TESTPLAN_SCOPE_KEY, $scope.selectedScope.key);
      if ($scope.selectedScope.key && $scope.selectedScope.key !== null && $scope.selectedScope.key !== "") {
        $scope.loading = true;
        var tcLoader = new CFTestPlanListLoader($scope.selectedScope.key);
        tcLoader.then(function (testPlans) {
          $scope.error = null;
          $scope.testPlans = $filter('orderBy')(testPlans, 'position');
          var targetId = null;
          if ($scope.testPlans.length > 0) {
            if ($scope.testPlans.length === 1) {
              targetId = $scope.testPlans[0].id;
            } else if (userInfoService.isAuthenticated()) {
              var lastTestPlanPersistenceId = userInfoService.getLastTestPlanPersistenceId();
              var tp = findTPByPersistenceId(lastTestPlanPersistenceId, $scope.testPlans);
              if (tp != null) {
                targetId = tp.id;
              }
            }
            if (targetId == null) {
              var previousTpId = StorageService.get(StorageService.CF_SELECTED_TESTPLAN_ID_KEY);
              targetId = previousTpId == undefined || previousTpId == null ? "" : previousTpId;
            }
            $scope.selectedTP.id = targetId.toString();
            $scope.selectTP();
          } else {
            $scope.loadingTC = false;
          }
          $scope.loading = false;
        }, function (error) {
          $scope.loadingTC = false;
          $scope.loading = false;
          $scope.error = "Sorry, Cannot load the test plans. Please try again";
        });
      } else {
        $scope.loading = false;
        StorageService.set(StorageService.CF_SELECTED_TESTPLAN_ID_KEY, "");
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


    $scope.selectTestCase = function (testCase) {
      $scope.loadingTC = true;
      $timeout(function () {
        var previousId = StorageService.get(StorageService.CF_LOADED_TESTCASE_ID_KEY);
        if (previousId != null) TestStepService.clearRecords(previousId);
        if (testCase.testContext && testCase.testContext != null) {
          CF.testCase = testCase;
          $scope.testCase = CF.testCase;
          var id = StorageService.get(StorageService.CF_LOADED_TESTCASE_ID_KEY);
          if (id != testCase.id) {
            StorageService.set(StorageService.CF_LOADED_TESTCASE_ID_KEY, testCase.id);
            StorageService.remove(StorageService.CF_EDITOR_CONTENT_KEY);
          }
          $scope.$broadcast('cf:testCaseLoaded', $scope.testCase);
          $scope.$broadcast('cf:profileLoaded', $scope.testCase.testContext.profile);
          $scope.$broadcast('cf:valueSetLibraryLoaded', $scope.testCase.testContext.vocabularyLibrary);
        }
        $scope.loadingTC = false;
      });
    };


    $scope.refreshTree = function () {
      $timeout(function () {
        if ($scope.testCases != null) {
          if (typeof $scope.tree.build_all == 'function') {
            $scope.tree.build_all($scope.testCases);
            var testCase = null;
            var id = StorageService.get(StorageService.CF_LOADED_TESTCASE_ID_KEY);
            if (id != null) {
              for (var i = 0; i < $scope.testCases.length; i++) {
                var found = testCaseService.findOneById(id, $scope.testCases[i]);
                if (found != null) {
                  testCase = found;
                  break;
                }
              }
            }
            if (testCase == null && $scope.testCases != null && $scope.testCases.length >= 0) {
              testCase = $scope.testCases[0];
            }
            if (testCase != null) {
              $scope.selectNode(testCase.id, testCase.type);
            }
            $scope.expandAll();
            $scope.error = null;
          } else {
            $scope.error = "Error: Something went wrong. Please refresh your page again.";
          }
        }
        $scope.loading = false;
      }, 1000);
    };

    $scope.initTesting = function () {

      if (!userInfoService.isAuthenticated()) {
        $scope.selectedScope.key = $scope.testPlanScopes[1].key; // GLOBAL
      } else {
        var tmp = StorageService.get(StorageService.CF_SELECTED_TESTPLAN_SCOPE_KEY);
        $scope.selectedScope.key = tmp && tmp != null ? tmp : $scope.testPlanScopes[1].key;
      }
      $scope.selectScope();

    };


    $scope.selectNode = function (id, type) {
      $timeout(function () {
        testCaseService.selectNodeByIdAndType($scope.tree, id, type);
      }, 0);
    };


    $scope.openProfileInfo = function () {
      var modalInstance = $modal.open({
        templateUrl: 'CFProfileInfoCtrl.html',
        windowClass: 'profile-modal',
        controller: 'CFProfileInfoCtrl'
      });
    };

    $scope.isSelectable = function (node) {
      return node.testContext && node.testContext != null;
    };


    $scope.expandAll = function () {
      if ($scope.tree != null)
        $scope.tree.expand_all();
    };

    $scope.collapseAll = function () {
      if ($scope.tree != null)
        $scope.tree.collapse_all();
    };

    $scope.$on("$destroy", function () {
      var testStepId = StorageService.get(StorageService.CF_LOADED_TESTCASE_ID_KEY);
      if (testStepId != null) TestStepService.clearRecords(testStepId);
    });

    $rootScope.$on('event:logoutConfirmed', function () {
      $scope.initTesting();
    });

    $rootScope.$on('event:loginConfirmed', function () {
      $scope.initTesting();
    });



  }]);

angular.module('cf').controller('CFProfileInfoCtrl', function ($scope, $modalInstance) {
  $scope.close = function () {
    $modalInstance.dismiss('cancel');
  };
});

angular.module('cf')
  .controller('CFValidatorCtrl', ['$scope', '$http', 'CF', '$window', '$timeout', '$modal', 'NewValidationResult', '$rootScope', 'ServiceDelegator', 'StorageService', 'TestStepService', 'MessageUtil', 'FileUpload', 'Notification', function ($scope, $http, CF, $window, $timeout, $modal, NewValidationResult, $rootScope, ServiceDelegator, StorageService, TestStepService, MessageUtil, FileUpload, Notification) {
    $scope.cf = CF;
    $scope.testCase = CF.testCase;
    $scope.message = CF.message;
    $scope.selectedMessage = {};
    $scope.loading = true;
    $scope.error = null;
    $scope.vError = null;
    $scope.vLoading = true;
    $scope.mError = null;
    $scope.mLoading = true;
    $scope.delimeters = [];
    $scope.counter = 0;
    $scope.type = "cf";
    $scope.loadRate = 4000;
    $scope.tokenPromise = null;
    $scope.editorInit = false;
    $scope.nodelay = false;

    $scope.resized = false;
    $scope.selectedItem = null;
    $scope.activeTab = 0;

    $scope.tError = null;
    $scope.tLoading = false;
    $scope.hasNonPrintable = false;
    $scope.dqaCodes = StorageService.get(StorageService.DQA_OPTIONS_KEY) != null ? angular.fromJson(StorageService.get(StorageService.DQA_OPTIONS_KEY)) : [];

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

    $scope.hasContent = function () {
      return $scope.cf.message.content != '' && $scope.cf.message.content != null;
    };


    $scope.refreshEditor = function () {
      $timeout(function () {
        if ($scope.editor)
          $scope.editor.refresh();
      }, 1000);
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
          $scope.cf.message.name = fileName;
          $scope.cf.editor.instance.doc.setValue(tmp.content);
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

    $scope.loadMessage = function () {
      if ($scope.cf.testCase.testContext.message && $scope.cf.testCase.testContext.message != null) {
        $scope.nodelay = true;
        $scope.selectedMessage = $scope.cf.testCase.testContext.message;
        if ($scope.selectedMessage != null && $scope.selectedMessage.content != null) {
          $scope.editor.doc.setValue($scope.selectedMessage.content);
        } else {
          $scope.editor.doc.setValue('');
          $scope.cf.message.id = null;
          $scope.cf.message.name = '';
        }
        $scope.execute();
      }
    };

    $scope.setLoadRate = function (value) {
      $scope.loadRate = value;
    };


    $scope.initCodemirror = function () {
      $scope.editor = CodeMirror.fromTextArea(document.getElementById("cfTextArea"), {
        lineNumbers: true,
        fixedGutter: true,
        theme: "elegant",
        readOnly: false,
        showCursorWhenSelecting: true,
        gutters: ["CodeMirror-linenumbers", "cm-edi-segment-name"]
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
          CF.message.name = null;
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
          var coordinate = ServiceDelegator.getCursorService($scope.testCase.testContext.format).getCoordinate($scope.editor, $scope.cf.tree);
          // coordinate.lineNumber = coordinate.start.line;
          coordinate.start.index = coordinate.start.index + 1;
          coordinate.end.index = coordinate.end.index + 1;
          $scope.cf.cursor.init(coordinate, true);
          ServiceDelegator.getTreeService($scope.testCase.testContext.format).selectNodeByIndex($scope.cf.tree.root, CF.cursor, CF.message.content);
        });
      });
    };

    /**
     * Validate the content of the editor
     */
    $scope.validateMessage = function () {
      try {
        $scope.vLoading = true;
        $scope.vError = null;
        if ($scope.cf.testCase != null && $scope.cf.message.content !== "") {
          var id = $scope.cf.testCase.testContext.id;
          var content = $scope.cf.message.content;
          var label = $scope.cf.testCase.label;
          var validated = ServiceDelegator.getMessageValidator($scope.testCase.testContext.format).validate(id, content, null, "Free", $scope.cf.testCase.testContext.dqa === true ? $scope.dqaCodes : [], "1223");
          validated.then(function (mvResult) {
            $scope.vLoading = false;
            $scope.loadValidationResult(mvResult);
          }, function (error) {
            $scope.vLoading = false;
            $scope.vError = error;
            $scope.loadValidationResult(null);
          });
        } else {
          $scope.loadValidationResult(null);
          $scope.vLoading = false;
          $scope.vError = null;
        }
      } catch (error) {
        $scope.vLoading = false;
        $scope.vError = error;
        $scope.loadValidationResult(null);
      }
    };

    $scope.loadValidationResult = function (mvResult) {
      $timeout(function () {
        $rootScope.$emit('cf:validationResultLoaded', mvResult, $scope.cf.testCase);
      });
    };

    $scope.select = function (element) {
      if (element != undefined && element.path != null && element.line != -1) {
        var node = ServiceDelegator.getTreeService($scope.testCase.testContext.format).selectNodeByPath($scope.cf.tree.root, element.line, element.path);
        //var data = node != null ? node.data : null;
        // $scope.cf.cursor.init(data != null && data.start != null ? data.start.line : element.line, data != null && data.start != null  ? data.start.index - 1 : element.column - 1, data != null && data.end != null  ? data.end.index - 1 : element.column - 1, data != null && data.start != null  ? data.start.index - 1 : element.column - 1, false);
        $scope.cf.cursor.init(node.data, false);
        ServiceDelegator.getEditorService($scope.testCase.testContext.format).select($scope.editor, $scope.cf.cursor);
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
      $scope.cf.message.download();
    };

    $scope.parseMessage = function () {
      try {
        if ($scope.cf.testCase != null && $scope.cf.testCase.testContext != null && $scope.cf.message.content != '') {
          $scope.tLoading = true;
          var parsed = ServiceDelegator.getMessageParser($scope.testCase.testContext.format).parse($scope.cf.testCase.testContext.id, $scope.cf.message.content);
          parsed.then(function (value) {
            $scope.tLoading = false;
            $scope.cf.tree.root.build_all(value.elements);
            ServiceDelegator.updateEditorMode($scope.editor, value.delimeters, $scope.cf.testCase.testContext.format);
            ServiceDelegator.getEditorService($scope.testCase.testContext.format).setEditor($scope.editor);
            ServiceDelegator.getTreeService($scope.testCase.testContext.format).setEditor($scope.editor);
          }, function (error) {
            $scope.tLoading = false;
            $scope.tError = error;
          });
        } else {
          if (typeof $scope.cf.tree.root.build_all == 'function') {
            $scope.cf.tree.root.build_all([]);
          }
          $scope.tError = null;
          $scope.tLoading = false;
        }
      } catch (error) {
        $scope.tLoading = false;
        $scope.tError = error;
      }
    };

    $scope.onNodeSelect = function (node) {
      ServiceDelegator.getTreeService($scope.testCase.testContext.format).getEndIndex(node, $scope.cf.message.content);
      $scope.cf.cursor.init(node.data, false);
      ServiceDelegator.getEditorService($scope.testCase.testContext.format).select($scope.editor, $scope.cf.cursor);
    };

    $scope.execute = function () {
      if ($scope.cf.testCase != null) {
        if ($scope.tokenPromise) {
          $timeout.cancel($scope.tokenPromise);
          $scope.tokenPromise = undefined;
        }
        $scope.error = null;
        $scope.tError = null;
        $scope.mError = null;
        $scope.vError = null;
        $scope.cf.message.content = $scope.editor.doc.getValue();
        $scope.setHasNonPrintableCharacters();
        StorageService.set(StorageService.CF_EDITOR_CONTENT_KEY, $scope.cf.message.content);
        $scope.validateMessage();
        $scope.parseMessage();
        $scope.refreshEditor();
      }
    };

    $scope.removeDuplicates = function () {
      $scope.vLoading = true;
      $scope.$broadcast('cf:removeDuplicates');
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
      $scope.refreshEditor();
      $scope.$on('cf:testCaseLoaded', function (event, testCase) {
        $scope.testCase = testCase;
        if ($scope.testCase != null) {
          var content = StorageService.get(StorageService.CF_EDITOR_CONTENT_KEY) == null ? '' : StorageService.get(StorageService.CF_EDITOR_CONTENT_KEY);
          $scope.nodelay = true;
          $scope.mError = null;
          $scope.cf.editor = ServiceDelegator.getEditor($scope.testCase.testContext.format);
          $scope.cf.editor.instance = $scope.editor;
          $scope.cf.cursor = ServiceDelegator.getCursor($scope.testCase.testContext.format);
          TestStepService.clearRecords($scope.testCase.id);
          if ($scope   .editor) {
            $scope.editor.doc.setValue(content);
            $scope.execute();
          }
        }
      });

      $rootScope.$on('cf:duplicatesRemoved', function (event, report) {
        $scope.vLoading = false;
      });
    };

    $scope.expandAll = function () {
      if ($scope.cf.tree.root != null)
        $scope.cf.tree.root.expand_all();
    };

    $scope.collapseAll = function () {
      if ($scope.cf.tree.root != null)
        $scope.cf.tree.root.collapse_all();
    };


    $scope.setHasNonPrintableCharacters = function () {
      $scope.hasNonPrintable = MessageUtil.hasNonPrintable($scope.cf.message.content);
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
            return $scope.cf.message.content;
          }
        }
      });
    };


  }]);


angular.module('cf')
  .controller('CFReportCtrl', ['$scope', '$sce', '$http', 'CF', function ($scope, $sce, $http, CF) {
    $scope.cf = CF;
  }]);

angular.module('cf')
  .controller('CFVocabularyCtrl', ['$scope', 'CF', function ($scope, CF) {
    $scope.cf = CF;
  }]);

angular.module('cf')
  .controller('CFProfileViewerCtrl', ['$scope', 'CF', '$rootScope', function ($scope, CF, $rootScope) {
    $scope.cf = CF;
  }]);





angular.module('cf')
  .controller('CFUploadCtrl', ['$scope', '$http', '$window', '$modal', '$filter', '$rootScope', '$timeout', 'StorageService', 'TestCaseService', 'TestStepService', 'FileUploader', 'Notification', '$modalInstance', 'userInfoService','ProfileGroupListLoader', function ($scope, $http, $window, $modal, $filter, $rootScope, $timeout, StorageService, TestCaseService, TestStepService, FileUploader, Notification, $modalInstance, userInfoService,ProfileGroupListLoader) {

    FileUploader.FileSelect.prototype.isEmptyAfterSelection = function () {
      return true;
    };
    $scope.step = 0;

    $scope.testcase = null;
    $scope.existingTP = {selected: null};
    $scope.selectedTP = {id: null};
    $scope.selectedScope = {key: 'USER'};
    $scope.groupScopes = [];
    $scope.allGroupScopes = [{key: 'USER', name: 'Private'}, {
      key: 'GLOBAL',
      name: 'Public'
    }];


    $scope.profileValidationErrors = [];
    $scope.valueSetValidationErrors = [];
    $scope.constraintValidationErrors = [];

    $scope.existingTestPlans = null;

    $scope.profileCheckToggleStatus = true;

    var profileUploader = $scope.profileUploader = new FileUploader({
      url: 'api/upload/uploadProfile',
      filters: [{
        name: 'xmlFilter',
        fn: function (item) {
          return /\/(xml)$/.test(item.type);
        }
      }]
    });

    var vsUploader = $scope.vsUploader = new FileUploader({
      url: 'api/upload/uploadVS',
      filters: [{
        name: 'xmlFilter',
        fn: function (item) {
          return /\/(xml)$/.test(item.type);
        }
      }]
    });

    var constraintsUploader = $scope.constraintsUploader = new FileUploader({
      url: 'api/upload/uploadContraints',
      filters: [{
        name: 'xmlFilter',
        fn: function (item) {
          return /\/(xml)$/.test(item.type);
        }
      }]
    });


    var zipUploader = $scope.zipUploader = new FileUploader({
      url: 'api/upload/uploadZip',
      autoUpload: true,
      filters: [{
        name: 'zipFilter',
        fn: function (item) {
          return /\/(zip)$/.test(item.type);
        }
      }]
    });


//        $http.get('../../resources/upload/uploadprofile.json').then(
//                function (object) {
//                	$scope.profileMessages = angular.fromJson(object.data.profiles);
//                },
//                function (response) {
//                }
//            );
//        $http.get('../../resources/upload/resourceError.json').then(
//                function (object) {
//
//                	$scope.profileValidationErrors = angular.fromJson(object.data.errors);
//                	$scope.constraintValidationErrors = angular.fromJson(object.data.errors);
//                },
//                function (response) {
//                }
//            );


    profileUploader.onErrorItem = function (fileItem, response, status, headers) {
      Notification.error({
        message: "There was an error while uploading " + fileItem.file.name,
        templateUrl: "NotificationErrorTemplate.html",
        scope: $rootScope,
        delay: 10000
      });
      $scope.step = 1;
    };

    vsUploader.onCompleteItem = function (fileItem, response, status, headers) {
      if (response.success == false) {
        Notification.error({
          message: "The value set file you uploaded is not valid, please check and correct the error(s) and try again",
          templateUrl: "NotificationErrorTemplate.html",
          scope: $rootScope,
          delay: 10000
        });
        $scope.step = 1;
        $scope.valueSetValidationErrors = angular.fromJson(response.errors);
      }
    };

    constraintsUploader.onCompleteItem = function (fileItem, response, status, headers) {
      if (response.success == false) {
        Notification.error({
          message: "The constraint file you uploaded is not valid, please check and correct the error(s) and try again",
          templateUrl: "NotificationErrorTemplate.html",
          scope: $rootScope,
          delay: 10000
        });
        $scope.step = 1;
        $scope.constraintValidationErrors = angular.fromJson(response.errors);
      }
    };

    profileUploader.onCompleteItem = function (fileItem, response, status, headers) {
      if (response.success == false) {
        Notification.error({
          message: "The profile file you uploaded is not valid, please check and correct the error(s) and try again",
          templateUrl: "NotificationErrorTemplate.html",
          scope: $rootScope,
          delay: 10000
        });
        $scope.step = 1;
        $scope.profileValidationErrors = angular.fromJson(response.errors);
      } else {
        $scope.profileMessages = response.profiles;
        $scope.profileCheckToggle();
      }

    };

    profileUploader.onBeforeUploadItem = function (fileItem) {
      fileItem.formData.push({token: $scope.token});
    };
    constraintsUploader.onBeforeUploadItem = function (fileItem) {
      fileItem.formData.push({token: $scope.token});
    };
    vsUploader.onBeforeUploadItem = function (fileItem) {
      fileItem.formData.push({token: $scope.token});
    };
    zipUploader.onBeforeUploadItem = function (fileItem) {
      fileItem.formData.push({token: $scope.token});
    };


    zipUploader.onCompleteItem = function (fileItem, response, status, headers) {
      if (response.success == false) {
        if (response.debugError === undefined) {
          Notification.error({
            message: "The zip file you uploaded is not valid, please check and correct the error(s) and try again",
            templateUrl: "NotificationErrorTemplate.html",
            scope: $rootScope,
            delay: 10000
          });
          $scope.profileValidationErrors = angular.fromJson(response.profileErrors);
          $scope.valueSetValidationErrors = angular.fromJson(response.constraintsErrors);
          $scope.constraintValidationErrors = angular.fromJson(response.vsErrors);
          $scope.step = 1;
        } else {
          Notification.error({
            message: "The tool could not upload and process your file.<br>" + response.message + '<br>' + response.debugError,
            templateUrl: "NotificationErrorTemplate.html",
            scope: $rootScope,
            delay: 10000
          });
          $scope.step = 1;
        }
      } else {
        $scope.token = response.token;
        $http.post('api/upload/uploadedProfiles', {token: $scope.token}).then(
          function (response) {
            if (response.data.success == false) {
              if (response.data.debugError === undefined) {
                Notification.error({
                  message: "The zip file you uploaded is not valid, please check and correct the error(s)",
                  templateUrl: "NotificationErrorTemplate.html",
                  scope: $rootScope,
                  delay: 10000
                });
                $scope.step = 1;
                $scope.profileValidationErrors = angular.fromJson(response.data.profileErrors);
                $scope.valueSetValidationErrors = angular.fromJson(response.data.constraintsErrors);
                $scope.constraintValidationErrors = angular.fromJson(response.data.vsErrors);
              } else {
                Notification.error({
                  message: "  " + response.data.message + '<br>' + response.data.debugError,
                  templateUrl: "NotificationErrorTemplate.html",
                  scope: $rootScope,
                  delay: 10000
                });
                $scope.step = 1;
                $modalInstance.close();
              }
            } else {
              $scope.profileMessages = response.data.profiles;
              $scope.profileCheckToggle();
            }
          },
          function (response) {

          }
        );


//        		$scope.profileMessages = response.profiles;
//        		$scope.token = response.token;
      }
    };


    $scope.gotStep = function (step) {
      $scope.step = step;
    };

    $scope.findTestPlan = function () {
      if ($scope.selectedTP.id != null && $scope.selectedTP.id != "" && $scope.existingTestPlans != null && $scope.existingTestPlans.length > 0) {
        for (var i = 0; i < $scope.existingTestPlans.length; i++) {
          if ($scope.existingTestPlans[i].id == $scope.selectedTP.id) {
            return $scope.existingTestPlans[i];
          }
        }
      }
      return null;
    };

    $scope.selectTP = function () {
      $scope.testcase = null;
      console.log("$scope.selectedTP.id=" + $scope.selectedTP.id);
      // console.log("$scope.existingTP.selected=" + angular.toJson($scope.existingTP.selected));
      // console.log("$scope.existingTP.selected=" + angular.fromJson($scope.existingTP.selected));
      // console.log("$scope.existingTP.selected=" + $scope.existingTP.selected);
      $scope.existingTP.selected = $scope.findTestPlan();
      if ($scope.existingTP.selected != null) {
        $scope.testcase = {};
        $scope.testcase['scope'] = $scope.selectedScope.key;
        $scope.testcase['name'] = $scope.existingTP.selected.name;
        $scope.testcase['description'] = $scope.existingTP.selected.description;
        $scope.testcase['groupId'] = $scope.existingTP.selected.id;
        console.log("$scope.testcase=" + angular.toJson($scope.testcase));
      }

    };

    $scope.addNewGroup = function () {
      $scope.existingTP.selected = null;
      $scope.testcase = {};
      $scope.testcase.scope = $scope.selectedScope.key;
      $scope.testcase.name = "";
      $scope.testcase.description = "";
      $scope.testcase.groupId = null;
      $scope.selectedTP.id = null;
    };


    $scope.clearTestGroupForm = function () {
      $scope.testcase.name = "";
      $scope.testcase.description = "";
      $scope.testcase.groupId = null;
      $scope.existingTP.selected = undefined;
    };

    profileUploader.onAfterAddingAll = function (fileItem) {
      if (profileUploader.queue.length > 1) {
        profileUploader.removeFromQueue(0);
      }
    };

    vsUploader.onAfterAddingAll = function (fileItem) {
      if (vsUploader.queue.length > 1) {
        vsUploader.removeFromQueue(0);
      }
    };

    constraintsUploader.onAfterAddingAll = function (fileItem) {
      if (constraintsUploader.queue.length > 1) {
        constraintsUploader.removeFromQueue(0);
      }
    };


    $scope.getSelectedTestcases = function () {
      return _.where($scope.profileMessages, {activated: true});
    };

    $scope.profileCheckToggle = function () {
      $scope.profileMessages.forEach(function (p) {
        p.activated = $scope.profileCheckToggleStatus;
      });
    };

    $scope.upload = function (value) {
      $scope.step = 0;
      $scope.token = $scope.generateUUID();
      $scope.profileValidationErrors = [];
      $scope.valueSetValidationErrors = [];
      $scope.constraintValidationErrors = [];
      vsUploader.uploadAll();
      constraintsUploader.uploadAll();
      profileUploader.uploadAll();
    };

    zipUploader.onBeforeUploadItem = function (fileItem) {
      $scope.profileValidationErrors = [];
      $scope.valueSetValidationErrors = [];
      $scope.constraintValidationErrors = [];
    };

    $scope.remove = function (value) {
      $scope.profileValidationErrors = [];
      $scope.valueSetValidationErrors = [];
      $scope.constraintValidationErrors = [];
      profileUploader.clearQueue();
      vsUploader.clearQueue();
      constraintsUploader.clearQueue();
    };

    $scope.dismissModal = function () {
      $modalInstance.dismiss();
    }


    $scope.addSelectedTestCases = function () {
      $scope.loading = true;
      $http.post('api/upload/addProfiles', {
        groupId: $scope.testcase.groupId,
        testcasename: $scope.testcase.name,
        testcasedescription: $scope.testcase.description,
        testcases: $scope.getSelectedTestcases(),
        scope: $scope.testcase.scope,
        token: $scope.token
      }).then(function (result) {

        if (result.data.status === "SUCCESS") {
          Notification.success({
            message: "Profile Added !",
            templateUrl: "NotificationSuccessTemplate.html",
            scope: $rootScope,
            delay: 5000
          });
          $modalInstance.close({testPlanId: result.data.testPlanId, scope: $scope.testcase.scope});
        } else {
          Notification.error({
            message: result.data.message + '<br><br>Debug message:<br>' + result.data.debugError,
            templateUrl: "NotificationErrorTemplate.html",
            scope: $rootScope,
            delay: 20000
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

    $scope.clearTestCases = function () {
      $http.post('api/upload/clearFiles', {token: $scope.token}).then(function (result) {
        $scope.profileMessages.length = 0;
        zipUploader.clearQueue();
        profileUploader.clearQueue();
        vsUploader.clearQueue();
        constraintsUploader.clearQueue();
        $scope.profileValidationErrors = [];
        $scope.valueSetValidationErrors = [];
        $scope.constraintValidationErrors = [];
        $scope.existingTP.selected = undefined;
        Notification.success({
          message: "Profiles cleared!",
          templateUrl: "NotificationSuccessTemplate.html",
          scope: $rootScope,
          delay: 5000
        });
      }, function (error) {
        Notification.error({
          message: error.data,
          templateUrl: "NotificationErrorTemplate.html",
          scope: $rootScope,
          delay: 10000
        });
      });
    }

    $scope.getTotalProgress = function () {
      var numberOfactiveQueue = 0;
      var progress = 0;
      if (profileUploader.queue.length > 0) {
        numberOfactiveQueue++;
        progress += profileUploader.progress;

      }
      if (vsUploader.queue.length > 0) {
        numberOfactiveQueue++;
        progress += vsUploader.progress;
      }
      if (constraintsUploader.queue.length > 0) {
        numberOfactiveQueue++;
        progress += constraintsUploader.progress;
      }
      return (progress) / numberOfactiveQueue;
    }

    $scope.generateUUID = function () {
      var d = new Date().getTime();
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
      return uuid;
    };


    $scope.initEnvironment = function () {
      $scope.step = 0;
      if (userInfoService.isAdmin() || userInfoService.isSupervisor()) {
        $scope.groupScopes = $scope.allGroupScopes;
      } else {
        $scope.groupScopes = [$scope.allGroupScopes[0]];
      }
      $scope.selectedScope.key = $scope.groupScopes[0].key;
      $scope.testcase = null;
      $scope.selectScope();
    };


    $scope.selectScope = function () {
      $scope.existingTestPlans = null;
      $scope.selectedTP.id = "";
      $scope.error = null;
      $scope.existingTP.selected = null;
      if ($scope.selectedScope.key && $scope.selectedScope.key !== null && $scope.selectedScope.key !== "") {
        if ($scope.testcase != null && $scope.testcase.group == null) {
          $scope.testcase.scope = $scope.selectedScope.key;
        }
        var groupLoader = new ProfileGroupListLoader($scope.selectedScope.key);
        groupLoader.then(function (testPlans) {
          $scope.existingTestPlans = $filter('orderBy')(testPlans, 'position')
        }, function (error) {
          $scope.error = "Sorry, Cannot load the profile groups. Please try again";
        });
      }
    };


    $scope.initEnvironment();


  }]);


angular.module('cf').controller('UploadTokenCtrl', ['$scope', '$http', 'CF', '$window', '$modal', '$filter', '$rootScope', '$timeout', 'StorageService', 'TestCaseService', 'TestStepService', 'userInfoService', 'Notification', 'modalService', '$routeParams', '$location', '$modalInstance', 'ProfileGroupListLoader', function ($scope, $http, CF, $window, $modal, $filter, $rootScope, $timeout, StorageService, TestCaseService, TestStepService, userInfoService, Notification, modalService, $routeParams, $location, $modalInstance, ProfileGroupListLoader) {

  $scope.testcase = null;
  $scope.existingTP = {selected: null};
  $scope.selectedTP = {id: null};
  $scope.selectedScope = {key: 'USER'};
  $scope.groupScopes = [];
  $scope.allGroupScopes = [{key: 'USER', name: 'Private'}, {
    key: 'GLOBAL',
    name: 'Public'
  }];


  $scope.profileValidationErrors = [];
  $scope.valueSetValidationErrors = [];
  $scope.constraintValidationErrors = [];

  $scope.existingTestPlans = null;

  $scope.profileCheckToggleStatus = true;

  $scope.token = $routeParams.x;

  $scope.dismissModal = function () {
    $modalInstance.dismiss();
  };


  $scope.initEnvironment = function () {
    if (userInfoService.isAdmin() || userInfoService.isSupervisor()) {
      $scope.groupScopes = $scope.allGroupScopes;
    } else {
      $scope.groupScopes = [$scope.allGroupScopes[0]];
    }
    $scope.selectedScope.key = $scope.groupScopes[0].key;
    $scope.testcase = null;
    $scope.selectScope();

    if ($scope.token !== undefined) {
      if (userInfoService.isAuthenticated()) {
        $http.post('api/upload/uploadedProfiles', {token: $scope.token}).then(
          function (response) {
            if (response.data.success == false) {
              if (response.data.debugError === undefined) {
                Notification.error({
                  message: "The zip file you uploaded is not valid, please check and correct the error(s)",
                  templateUrl: "NotificationErrorTemplate.html",
                  scope: $rootScope,
                  delay: 10000
                });
                $scope.profileValidationErrors = angular.fromJson(response.data.profileErrors);
                $scope.valueSetValidationErrors = angular.fromJson(response.data.constraintsErrors);
                $scope.constraintValidationErrors = angular.fromJson(response.data.vsErrors);
              } else {
                Notification.error({
                  message: "  " + response.data.message + '<br>' + response.data.debugError,
                  templateUrl: "NotificationErrorTemplate.html",
                  scope: $rootScope,
                  delay: 10000
                });
                $modalInstance.close();
              }
            } else {
              $scope.profileMessages = response.data.profiles;
              $scope.profileCheckToggle();
            }
          },
          function (response) {

          }
        );
      }
    }
  };

  $scope.selectScope = function () {
    $scope.existingTestPlans = null;
    $scope.selectedTP.id = "";
    $scope.error = null;
    $scope.existingTP.selected = null;
    if ($scope.selectedScope.key && $scope.selectedScope.key !== null && $scope.selectedScope.key !== "") {
      if ($scope.testcase != null && $scope.testcase.group == null) {
        $scope.testcase.scope = $scope.selectedScope.key;
      }
      var groupLoader = new ProfileGroupListLoader($scope.selectedScope.key);
      groupLoader.then(function (testPlans) {
        $scope.existingTestPlans = $filter('orderBy')(testPlans, 'position')
      }, function (error) {
        $scope.error = "Sorry, Cannot load the profile groups. Please try again";
      });
    }
  };


  $scope.addSelectedTestCases = function () {
    $scope.loading = true;
    $http.post('api/upload/addProfiles', {
      groupId: $scope.testcase.groupId,
      testcasename: $scope.testcase.name,
      testcasedescription: $scope.testcase.description,
      testcases: $scope.getSelectedTestcases(),
      token: $scope.token,
      scope: $scope.testcase.scope
    }).then(function (result) {
      if (result.data.status === "SUCCESS") {
        Notification.success({
          message: "Profile saved !",
          templateUrl: "NotificationSuccessTemplate.html",
          scope: $rootScope,
          delay: 5000
        });
        $modalInstance.close({testPlanId: result.data.testPlanId, scope: $scope.testcase.scope});
      } else {
        Notification.error({
          message: result.data.message,
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
  };


  $scope.findTestPlan = function () {
    if ($scope.selectedTP.id != null && $scope.selectedTP.id != "" && $scope.existingTestPlans != null && $scope.existingTestPlans.length > 0) {
      for (var i = 0; i < $scope.existingTestPlans.length; i++) {
        if ($scope.existingTestPlans[i].id == $scope.selectedTP.id) {
          return $scope.existingTestPlans[i];
        }
      }
    }
    return null;
  };

  $scope.selectTP = function () {
    $scope.testcase = null;
    console.log("$scope.selectedTP.id=" + $scope.selectedTP.id);
    // console.log("$scope.existingTP.selected=" + angular.toJson($scope.existingTP.selected));
    // console.log("$scope.existingTP.selected=" + angular.fromJson($scope.existingTP.selected));
    // console.log("$scope.existingTP.selected=" + $scope.existingTP.selected);
    $scope.existingTP.selected = $scope.findTestPlan();
    if ($scope.existingTP.selected != null) {
      $scope.testcase = {};
      $scope.testcase['scope'] = $scope.selectedScope.key;
      $scope.testcase['name'] = $scope.existingTP.selected.name;
      $scope.testcase['description'] = $scope.existingTP.selected.description;
      $scope.testcase['groupId'] = $scope.existingTP.selected.id;
      console.log("$scope.testcase=" + angular.toJson($scope.testcase));
    }

  };

  $scope.addNewGroup = function () {
    $scope.existingTP.selected = null;
    $scope.testcase = {};
    $scope.testcase.scope = $scope.selectedScope.key;
    $scope.testcase.name = "";
    $scope.testcase.description = "";
    $scope.testcase.groupId = null;
    $scope.selectedTP.id = null;
  };


  $scope.clearTestGroupForm = function () {
    $scope.testcase.name = "";
    $scope.testcase.description = "";
    $scope.testcase.groupId = null;
    $scope.existingTP.selected = null;
  };

  $scope.profileCheckToggle = function () {
    $scope.profileMessages.forEach(function (p) {
      p.activated = $scope.profileCheckToggleStatus;
    });
  };

  $scope.getSelectedTestcases = function () {
    return _.where($scope.profileMessages, {activated: true});
  };

  $scope.initEnvironment();

}]);

angular.module('cf').controller('UploadTokenCheckCtrl', ['$scope', '$http', 'CF', '$window', '$modal', '$filter', '$rootScope', '$timeout', 'StorageService', 'TestCaseService', 'TestStepService', 'userInfoService', 'Notification', 'modalService', '$routeParams', '$location', function ($scope, $http, CF, $window, $modal, $filter, $rootScope, $timeout, StorageService, TestCaseService, TestStepService, userInfoService, Notification, modalService, $routeParams, $location) {
  $scope.testcase = {};

  $scope.profileValidationErrors = [];
  $scope.valueSetValidationErrors = [];
  $scope.constraintValidationErrors = [];

  $scope.profileCheckToggleStatus = false;

  $scope.token = decodeURIComponent($routeParams.x);
  $scope.auth = decodeURIComponent($routeParams.y);


  if ($scope.token !== undefined & $scope.auth !== undefined) {


    //check if logged in
    if (!userInfoService.isAuthenticated()) {
      $scope.$emit('event:loginRequestWithAuth', $scope.auth, '/addprofiles?x=' + $scope.token);

    } else {
      $location.url('/addprofiles?x=' + $scope.token);
    }
  }


}]);


angular.module('cf')
  .controller('CFTestManagementCtrl', ['$scope', '$http', '$window', '$filter', '$rootScope', '$timeout', 'StorageService', 'TestCaseService', 'TestStepService', 'FileUploader', 'Notification', 'userInfoService','ProfileGroupListLoader', function ($scope, $http, $window, $filter, $rootScope, $timeout, StorageService, TestCaseService, TestStepService, FileUploader, Notification, userInfoService,ProfileGroupListLoader) {

    FileUploader.FileSelect.prototype.isEmptyAfterSelection = function () {
      return true;
    };
    $scope.step = 0;

    $scope.testcase = null;
    $scope.existingTP = {selected: null};
    $scope.selectedTP = {id: null};
    $scope.selectedScope = {key: 'USER'};
    $scope.groupScopes = [];
    $scope.allGroupScopes = [{key: 'USER', name: 'Private'}, {
      key: 'GLOBAL',
      name: 'Public'
    }];





    $scope.findTestPlan = function () {
      if ($scope.selectedTP.id != null && $scope.selectedTP.id != "" && $scope.existingTestPlans != null && $scope.existingTestPlans.length > 0) {
        for (var i = 0; i < $scope.existingTestPlans.length; i++) {
          if ($scope.existingTestPlans[i].id == $scope.selectedTP.id) {
            return $scope.existingTestPlans[i];
          }
        }
      }
      return null;
    };

    $scope.selectTP = function () {
      $scope.testcase = null;
      console.log("$scope.selectedTP.id=" + $scope.selectedTP.id);
      // console.log("$scope.existingTP.selected=" + angular.toJson($scope.existingTP.selected));
      // console.log("$scope.existingTP.selected=" + angular.fromJson($scope.existingTP.selected));
      // console.log("$scope.existingTP.selected=" + $scope.existingTP.selected);
      $scope.existingTP.selected = $scope.findTestPlan();
      if ($scope.existingTP.selected != null) {
        $scope.testcase = {};
        $scope.testcase['scope'] = $scope.selectedScope.key;
        $scope.testcase['name'] = $scope.existingTP.selected.name;
        $scope.testcase['description'] = $scope.existingTP.selected.description;
        $scope.testcase['groupId'] = $scope.existingTP.selected.id;
        console.log("$scope.testcase=" + angular.toJson($scope.testcase));
      }

    };

    $scope.addNewGroup = function () {
      $scope.existingTP.selected = null;
      $scope.testcase = {};
      $scope.testcase.scope = $scope.selectedScope.key;
      $scope.testcase.name = "";
      $scope.testcase.description = "";
      $scope.testcase.groupId = null;
      $scope.selectedTP.id = null;
    };


    $scope.clearTestGroupForm = function () {
      $scope.testcase.name = "";
      $scope.testcase.description = "";
      $scope.testcase.groupId = null;
      $scope.existingTP.selected = undefined;
    };


    $scope.selectScope = function () {
      $scope.existingTestPlans = null;
      $scope.selectedTP.id = "";
      $scope.error = null;
      $scope.existingTP.selected = null;
      if ($scope.selectedScope.key && $scope.selectedScope.key !== null && $scope.selectedScope.key !== "") {
        if ($scope.testcase != null && $scope.testcase.group == null) {
          $scope.testcase.scope = $scope.selectedScope.key;
        }
        var groupLoader = new ProfileGroupListLoader($scope.selectedScope.key);
        groupLoader.then(function (testPlans) {
          $scope.existingTestPlans = $filter('orderBy')(testPlans, 'position')
        }, function (error) {
          $scope.error = "Sorry, Cannot load the profile groups. Please try again";
        });
      }
    };

    $scope.initManagement = function () {
      $scope.step = 0;
      if (userInfoService.isAdmin() || userInfoService.isSupervisor()) {
        $scope.groupScopes = $scope.allGroupScopes;
      } else {
        $scope.groupScopes = [$scope.allGroupScopes[0]];
      }
      $scope.selectedScope.key = $scope.groupScopes[0].key;
      $scope.testcase = null;
      $scope.selectScope();
    };









  }]);



