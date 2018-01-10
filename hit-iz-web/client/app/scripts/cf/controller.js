'use strict';

'use strict';

angular.module('cf')
  .controller('CFEnvCtrl', ['$scope', '$window', '$rootScope', 'CF', 'StorageService', '$timeout', 'TestCaseService', 'TestStepService', '$routeParams', '$location', 'userInfoService', '$modalStack', '$modal', function ($scope, $window, $rootScope, CB, StorageService, $timeout, TestCaseService, TestStepService, $routeParams, $location, userInfoService, $modalStack, $modal) {

    $scope.testCase = null;
    $scope.token = $routeParams.x;
    $scope.nav = $routeParams.nav;


    $scope.setSubActive = function (tab) {
      $rootScope.setSubActive(tab);
      if (tab === '/cf_execution') {
        $rootScope.$broadcast('event:cf:initExecution');
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


    if ($scope.token !== undefined) {
      if (!userInfoService.isAuthenticated()) {
        $scope.$broadcast('event:loginRequiredWithRedirect', $location.url());
      } else {
        $timeout(function () {
          $scope.setSubActive("/cf_management");
          $scope.$broadcast('cf:uploadToken', $scope.token);
        });
      }
    } else {
      if ($scope.nav === 'manage' && userInfoService.isAuthenticated()) {
        $timeout(function () {
          $scope.setSubActive("/cf_management");
          $scope.$broadcast('event:cf:manage', decodeURIComponent($routeParams.scope));
        });
      } else {
        $scope.setSubActive("/cf_execution");
        $scope.$broadcast('event:cf:execute', decodeURIComponent($routeParams.scope), decodeURIComponent($routeParams.cat), decodeURIComponent($routeParams.group));
      }
    }

  }]);


angular.module('cf')
  .controller('CFTestExecutionCtrl', ['$scope', '$http', 'CF', '$window', '$modal', '$filter', '$rootScope', 'CFTestPlanExecutioner', '$timeout', 'StorageService', 'TestCaseService', 'TestStepService', 'userInfoService', function ($scope, $http, CF, $window, $modal, $filter, $rootScope, CFTestPlanExecutioner, $timeout, StorageService, TestCaseService, TestStepService, userInfoService) {

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
    $scope.allTestPlanScopes = [{key: 'USER', name: 'Private'}, {key: 'GLOBAL', name: 'Public'}];
    $scope.testPlanScopes = [];

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
      if ($scope.selectedTP.id && $scope.selectedTP.id !== null && $scope.selectedTP.id !== "") {
        $scope.loadingTC = true;
        CFTestPlanExecutioner.getTestPlan($scope.selectedTP.id).then(function (testPlan) {
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
      $scope.selectedTP.id = "";
      StorageService.set(StorageService.CF_SELECTED_TESTPLAN_SCOPE_KEY, $scope.selectedScope.key);
      if ($scope.selectedScope.key && $scope.selectedScope.key !== null && $scope.selectedScope.key !== "") {
        $scope.loading = true;
        CFTestPlanExecutioner.getTestPlans($scope.selectedScope.key).then(function (testPlans) {
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
      if (userInfoService.isAuthenticated()) {
        $scope.testPlanScopes = $scope.allTestPlanScopes;
        var tmp = StorageService.get(StorageService.CF_SELECTED_TESTPLAN_SCOPE_KEY);
        $scope.selectedScope.key = tmp && tmp != null ? tmp : $scope.testPlanScopes[1].key;
      } else {
        $scope.testPlanScopes = [$scope.allTestPlanScopes[1]];
        $scope.selectedScope.key = $scope.allTestPlanScopes[1].key; // GLOBAL
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

    $scope.$on('event:cf:execute', function (scope, cat, group) {
      $scope.selectedScope.key = scope; // User
      if (group && group != null) {
        $scope.selectedTP.id = group;
        StorageService.set(StorageService.CF_SELECTED_TESTPLAN_ID_KEY, group);
        $scope.selectedTP.id = group;
        $scope.selectedScope.key = scope ? scope : $scope.testPlanScopes[0].key;
        $scope.selectTP();
      }
      $scope.selectScope();
    });

    $rootScope.$on('event:cf:initExecution', function () {
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
          if ($scope.editor) {
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
  .controller('CFTestManagementCtrl', ['$scope', '$http', '$window', '$filter', '$rootScope', '$timeout', 'StorageService', 'TestCaseService', 'TestStepService', 'FileUploader', 'Notification', 'userInfoService', 'CFTestPlanManager', 'modalService', '$modalStack', '$modal', '$routeParams', '$location', function ($scope, $http, $window, $filter, $rootScope, $timeout, StorageService, TestCaseService, TestStepService, FileUploader, Notification, userInfoService, CFTestPlanManager, modalService, $modalStack, $modal, $routeParams, $location) {


    $scope.selectedScope = {key: 'USER'};
    $scope.groupScopes = [];
    $scope.allGroupScopes = [{key: 'USER', name: 'Private'}, {
      key: 'GLOBAL',
      name: 'Public'
    }];
    $scope.uploaded = false;
    $scope.testcase = null;
    $scope.existingTP = {selected: null};
    $scope.selectedTP = {id: null};
    $scope.categoryNodes = [];
    $scope.profileValidationErrors = [];
    $scope.valueSetValidationErrors = [];
    $scope.constraintValidationErrors = [];
    $scope.existingTestPlans = null;

    $scope.tmpNewMessages = [];
    $scope.tmpOldMessages = [];


    $scope.token = $routeParams.x;

    $scope.positions = function(messages) {
      var array = new Array(messages.length);
      for(var index =0; index < array.length ; index ++){
        array[index] = index + 1;
      }
      return array;
    };

    Array.prototype.move = function (old_index, new_index) {
      if (new_index >= this.length) {
        var k = new_index - this.length;
        while ((k--) + 1) {
          this.push(undefined);
        }
      }
      this.splice(new_index, 0, this.splice(old_index, 1)[0]);
      return this; // for testing purposes
    };


    // $scope.setPositions = function(array){
    //   if(array != null && array != undefined && array.length > 0) {
    //     array = $filter('orderBy')(array, 'position');
    //     array = _.reject(array, function (item) {
    //       return item.removed == true;
    //     });
    //     for (var index = 0; index < array.length; index++) {
    //       array[index].position = index + 1;
    //     }
    //   }
    //   return array;
    // };

    $scope.sortAndFilters = function(item, array){
      var old_index =  array.indexOf(item);
      var newPosition = item.position;
      var new_index = newPosition -1;

      if (new_index >= array.length) {
        var k = new_index - array.length;
        while ((k--) + 1) {
          array.push(undefined);
        }
      }
      array.splice(new_index, 0, array.splice(old_index, 1)[0]);
      for (var index = 0; index < array.length; index++) {
        array[index].position = index + 1;
      }

      return array;
    };

    $scope.filterMessages = function(array){
      array = _.reject(array, function (item) {
        return item.removed == true;
      });
      array = $filter('orderBy')(array, 'position');
      for (var index = 0; index < array.length; index++) {
        array[index].position = index + 1;
      }
      array = $filter('orderBy')(array, 'position');
      return array;
    };


    $scope.syncNewProfilesPositions = function(item){
      $scope.tmpNewMessages = $scope.sortAndFilters(item, $scope.tmpNewMessages);
    };

    $scope.syncOldProfilesPositions = function(item){
       $scope.tmpOldMessages = $scope.sortAndFilters(item, $scope.tmpOldMessages);
    };



    $scope.$on('event:cf:manage', function (event, targetScope) {
      $scope.testcase = null;
      if (userInfoService.isAdmin() || userInfoService.isSupervisor()) {
        $scope.groupScopes = $scope.allGroupScopes;
      } else {
        $scope.groupScopes = [$scope.allGroupScopes[0]];
      }

      if (targetScope === $scope.allGroupScopes[1].key && !userInfoService.isAdmin() && !userInfoService.isSupervisor()) {
        targetScope = $scope.allGroupScopes[0]; // make private
      }
      $scope.selectedScope = {key: targetScope};
      $scope.testcase = null;
      $scope.selectScope();
    });


    $rootScope.$on('event:logoutConfirmed', function () {
      $scope.initManagement();
    });

    $rootScope.$on('event:loginConfirmed', function () {
      $scope.initManagement();
    });


    $scope.initManagement = function () {
      if (userInfoService.isAdmin() || userInfoService.isSupervisor()) {
        $scope.groupScopes = $scope.allGroupScopes;
      } else {
        $scope.groupScopes = [$scope.allGroupScopes[0]];
      }
      $scope.selectedScope.key = $scope.groupScopes[0].key;
      $scope.testcase = null;
      $scope.selectScope();

      if ($scope.token !== undefined && $scope.token !== null) {
        if (userInfoService.isAuthenticated()) {
          CFTestPlanManager.getTokenProfiles("hl7v2", $scope.token).then(
            function (response) {
              if (response.success == false) {
                if (response.debugError === undefined) {
                  Notification.error({
                    message: "The zip file you uploaded is not valid, please check and correct the error(s)",
                    templateUrl: "NotificationErrorTemplate.html",
                    scope: $rootScope,
                    delay: 10000
                  });
                  $scope.profileValidationErrors = angular.fromJson(response.profileErrors);
                  $scope.valueSetValidationErrors = angular.fromJson(response.constraintsErrors);
                  $scope.constraintValidationErrors = angular.fromJson(response.vsErrors);
                } else {
                  Notification.error({
                    message: "  " + response.message + '<br>' + response.debugError,
                    templateUrl: "NotificationErrorTemplate.html",
                    scope: $rootScope,
                    delay: 10000
                  });
                }
              } else {
                $scope.profileMessages = response.profiles;
                $scope.tmpNewMessages = $scope.filterMessages($scope.profileMessages);
                $scope.originalProfileMessages = angular.copy($scope.profileMessages);

              }
            },
            function (response) {

            }
          );
        }
      }
    };

    /**
     *
     */
    $scope.selectScope = function () {
      $scope.existingTestPlans = null;
      $scope.selectedTP.id = "";
      $scope.error = null;
      $scope.testcase = null;
      $scope.existingTP.selected = null;
      $scope.oldProfileMessages = null;
      if ($scope.selectedScope.key && $scope.selectedScope.key !== null && $scope.selectedScope.key !== "") {
        // if ($scope.testcase != null && $scope.testcase.group == null) {
        //   $scope.testcase.scope = $scope.selectedScope.key;
        // }
        CFTestPlanManager.getTestPlans($scope.selectedScope.key).then(function (testPlans) {
          $scope.existingTestPlans = testPlans;
          $scope.categoryNodes = $scope.generateTreeNodes(testPlans);
        }, function (error) {
          $scope.error = "Sorry, Failed to load the profile groups. Please try again";
        });
      }
    };

    /**
     *
     * @param groupId
     */
    $scope.loadOldProfileMessages = function (groupId) {
      CFTestPlanManager.getProfiles(groupId).then(function (profiles) {

        $scope.oldProfileMessages =  profiles;
        $scope.tmpOldMessages = $scope.filterMessages($scope.oldProfileMessages);
        $scope.originalOldProfileMessages = angular.copy($scope.oldProfileMessages);
      }, function (error) {
        $scope.error = "Sorry, Failed to load the existing profiles. Please try again";
      });
    };


    /**
     *
     * @param profileGroups
     * @returns {{}}
     */
    $scope.categorize = function (profileGroups) {
      var categoryMap = {};
      if(profileGroups != null && profileGroups.length > 0) {
        angular.forEach(profileGroups, function (profileGroup) {
          if (categoryMap[profileGroup.category] == undefined) {
            categoryMap[profileGroup.category] = [];
          }
          categoryMap[profileGroup.category].push(profileGroup);
        });
      }
      return categoryMap;
    };


    /**
     *
     * @param profileGroups
     * @returns {Array}
     */
    $scope.generateTreeNodes = function (profileGroups) {
      var categoryNodes = [];
      if(profileGroups != null) {
        profileGroups = $filter('orderBy')(profileGroups, 'position');
        var categoryMap = $scope.categorize(profileGroups);
        for (var key in categoryMap) {
          var groups = categoryMap[key];
          var treeNode = {};
          treeNode['id'] = key;
          treeNode['name'] = key;
          treeNode['nodes'] = [];
          if (groups && groups.length > 0) {
            angular.forEach(groups, function (group) {
              var groupNode = {};
              groupNode['id'] = group.id;
              groupNode['description'] = group.description;
              groupNode['scope'] = group.scope;
              groupNode['name'] = group.name;
              groupNode['persistentId'] = group.persistentId;
              groupNode['category'] = key;
              treeNode['nodes'].push(groupNode);
            });
          }
          categoryNodes.push(treeNode);
        }
      }
      return categoryNodes;
    };


    /**
     *
     * @param groupId
     */
    $scope.deleteGroup = function (groupId) {

      var modalInstance = $modal.open({
        templateUrl: 'views/cf/manage/confirm-delete-group.html',
        controller: 'ConfirmDialogCtrl',
        size: 'md',
        backdrop: 'static',
        keyboard: false
      });

      modalInstance.result.then(
        function (result) {
          if (result) {
            CFTestPlanManager.deleteGroup(groupId).then(function (result) {
              if (result.status === "SUCCESS") {
                var group = $scope.findGroup(groupId);
                var index = $scope.existingTestPlans.indexOf(group);
                if (index > -1) {
                  $scope.existingTestPlans.splice(index, 1);
                }
                for (var i = 0; i < $scope.categoryNodes.length; i++) {
                  var groupNodes = $scope.categoryNodes[i].nodes;
                  if (groupNodes && groupNodes.length > 0) {
                    var ind = -1;
                    for (var j = 0; j < groupNodes.length; j++) {
                      var node = groupNodes[j];
                      if (node.id == groupId) {
                        ind = j;
                        break;
                      }
                    }
                    if (ind > -1) {
                      groupNodes.splice(ind, 1);
                      break;
                    }
                  }
                }
                Notification.success({
                  message: "Profile group deleted successfully !",
                  templateUrl: "NotificationSuccessTemplate.html",
                  scope: $rootScope,
                  delay: 5000
                });
                if ($scope.testcase != null && groupId === $scope.testcase.groupId) {
                  $scope.selectGroup(null);
                }
              } else {
                $scope.error = result.message;
              }
            }, function (error) {
              $scope.error = "Sorry, Cannot create a delete the profile group. Please try again";
            });
          }
        }, function(result){

        });
    };

    /**
     *
     */


    /**
     *
     */
    $scope.findTestPlan = function () {
      return $scope.findGroup($scope.selectedTP.id);
    };

    /**
     *
     * @param groupId
     * @returns {*}
     */
    $scope.findGroup = function (groupId) {
      if (groupId != null && groupId != "" && $scope.existingTestPlans != null && $scope.existingTestPlans.length > 0) {
        for (var i = 0; i < $scope.existingTestPlans.length; i++) {
          if ($scope.existingTestPlans[i].id == groupId) {
            return $scope.existingTestPlans[i];
          }
        }
      }
      return null;
    };

    $scope.findGroupByPersistenceId = function (persistentId) {
      if (persistentId != null && persistentId != "" && $scope.existingTestPlans != null && $scope.existingTestPlans.length > 0) {
        for (var i = 0; i < $scope.existingTestPlans.length; i++) {
          if ($scope.existingTestPlans[i].persistentId == persistentId) {
            return $scope.existingTestPlans[i];
          }
        }
      }
      return null;
    };


    /**
     *
     * @param categoryId
     * @returns {*}
     */
    $scope.findCategory = function (categoryId) {
      if ($scope.selectedTP.id != null && $scope.selectedTP.id != "" && $scope.existingTestPlans != null && $scope.existingTestPlans.length > 0) {
        for (var i = 0; i < $scope.existingTestPlans.length; i++) {
          if ($scope.existingTestPlans[i].id == $scope.selectedTP.id) {
            return $scope.existingTestPlans[i];
          }
        }
      }
      return null;
    };


    /**
     *
     * @param groupId
     */
    $scope.selectGroup = function (node) {
      $scope.selectedNode = node;
      $scope.testcase = null;
      $scope.oldProfileMessages = [];
      $scope.originalOldProfileMessages = angular.copy($scope.oldProfileMessages);

      if(node != null) {
        $scope.selectedTP.id = node.id;
        $scope.testcase = {};
        $scope.testcase['scope'] = $scope.selectedScope.key;
        $scope.testcase['name'] = node.name;
        $scope.testcase['description'] = node.description;
        $scope.testcase['groupId'] = node.id;
        $scope.testcase['persistentId'] = node.persistentId;
        $scope.testcase['category'] = node.category;
        $scope.loadOldProfileMessages(node.id);
      }
    };

    $scope.addNewGroup = function (categoryNode) {
      var position = categoryNode.nodes ? categoryNode.nodes.length + 1 : 1;
      CFTestPlanManager.create(categoryNode.id, $scope.selectedScope.key, position).then(function (group) {
        if (!$scope.existingTestPlans || $scope.existingTestPlans == null)
          $scope.existingTestPlans = [];
        $scope.existingTestPlans.push(group);
        var treeNode = {};
        treeNode['id'] = group.id;
        treeNode['persistentId'] = group.persistentId;
        treeNode['name'] = group.name;
        treeNode['description'] = group.description;
        treeNode['scope'] = group.scope;
        treeNode['category'] = categoryNode.id;
        treeNode['nodes'] = [];
        if (!categoryNode['nodes'])
          categoryNode['nodes'] = [];
        categoryNode['nodes'].push(treeNode);

        $scope.selectGroup(treeNode);
      }, function (error) {
        $scope.error = "Sorry, Cannot create a new profile group. Please try again";
      });
    };

    $scope.deleteCategory = function (categoryNode) {
      var modalInstance = $modal.open({
        templateUrl: 'views/cf/manage/confirm-delete-category.html',
        controller: 'ConfirmDialogCtrl',
        size: 'md',
        backdrop: 'static',
        keyboard: false
      });

      modalInstance.result.then(
        function (result) {
          if (result) {
            $scope.error = null;
            if (categoryNode.nodes && categoryNode.nodes.length > 0) {
              var groupIds = [];
              for (var k = 0; k < categoryNode.nodes.length; k++) {
                groupIds.push(categoryNode.nodes[k].id);
              }
              CFTestPlanManager.deleteGroups(groupIds).then(function (results) {
                for (var i = 0; i < results.length; i++) {
                  var result = results[i];
                  var group = $scope.findGroup(result.id);
                  if (group != null && result.status === "SUCCESS") {
                    var index = $scope.existingTestPlans.indexOf(group);
                    if (index > -1) {
                      $scope.existingTestPlans.splice(index, 1);
                    }
                    var ind = -1;
                    for (var j = 0; j < categoryNode.nodes.length; j++) {
                      var node = categoryNode.nodes[j];
                      if (node.id == group.id) {
                        ind = j;
                        break;
                      }
                    }
                    if (ind > -1) {
                      if ($scope.testcase != null && categoryNode.nodes[ind].id === $scope.testcase.groupId) {
                        $scope.selectGroup(null);
                      }
                      categoryNode.nodes.splice(ind, 1);
                    }
                    if (categoryNode.nodes.length == 0) {
                      var index = $scope.categoryNodes.indexOf(categoryNode);
                      if (index > -1) {
                        $scope.categoryNodes.splice(index, 1);
                      }
                      Notification.success({
                        message: "Profile group category deleted successfully !",
                        templateUrl: "NotificationSuccessTemplate.html",
                        scope: $rootScope,
                        delay: 5000
                      });
                    }
                  } else if (result.status === "FAILURE") {
                    $scope.error = $scope.error + result.message + "\n";
                  }
                }
              }, function (error) {
                $scope.error = "Sorry, Cannot delete the profile category. Please try again";
              });
            } else {
              var index = $scope.categoryNodes.indexOf(categoryNode);
              if (index > -1) {
                $scope.categoryNodes.splice(index, 1);
                Notification.success({
                  message: "Profile group category deleted successfully !",
                  templateUrl: "NotificationSuccessTemplate.html",
                  scope: $rootScope,
                  delay: 5000
                });
              }
            }
          }
        },
        function (result) {

        }
      );
    };

    $scope.selectCategory = function (node) {
      $scope.categoryNode = node;
      $scope.category = {};
      $scope.category.name = node.id;
    };

    $scope.editCategory = function (node) {
      node.originalCategoryName = node.name;
      node.edit = true
    };

    $scope.resetCategory = function (node) {
      node.name = node.originalCategoryName;
      node.originalCategoryName = null;
      node.edit = false;
    };


    $scope.isValidCategory = function (node) {
      if ($scope.categoryNodes != null && $scope.categoryNodes.length > 0) {
        for (var i = 0; i < $scope.categoryNodes.length; i++) {
          if ($scope.categoryNodes[i].name === node.name && $scope.categoryNodes[i].id != node.id) {
            return false;
          }
        }
      }
      return true;
    };


    $scope.saveCategory = function (node) {
      if (node.originalCategoryName != node.name) {
        if ($scope.isValidCategory(node)) {
          node.id = node.name;
          if (node.nodes != null && node.nodes.length > 0) {
            var groups = [];
            for (var j = 0; j < node.nodes.length; j++) {
              groups.push(node.nodes[j].id);
            }
            CFTestPlanManager.updateCategories(node.name, groups).then(function () {
              if ($scope.existingTestPlans != null) {
                for (var j = 0; j < $scope.existingTestPlans.length; j++) {
                  if (groups.indexOf($scope.existingTestPlans[j].id) > -1) {
                    $scope.existingTestPlans[j].category = node.name;
                  }
                  if ($scope.testcase != null && $scope.testcase.groupId === $scope.existingTestPlans[j].id) {
                    $scope.testcase.category = $scope.existingTestPlans[j].category;
                  }
                }
              }

              if (node.nodes != null && node.nodes.length > 0) {
                for (var j = 0; j < node.nodes.length; j++) {
                  node.nodes[j].category = node.name;
                }
              }

              Notification.success({
                message: "Category saved successfully !",
                templateUrl: "NotificationSuccessTemplate.html",
                scope: $rootScope,
                delay: 5000
              });
              node.edit = false;

            }, function (error) {
              $scope.error = "Could not saved the category, please try again";

            });
          } else {
            node.edit = false;
          }
        }
      }
    };

    $scope.addNewCategory = function () {
      var treeNode = {};
      var key = "Category-" + new Date().getTime();
      treeNode['id'] = key;
      treeNode['name'] = key;
      treeNode['nodes'] = [];
      if (!$scope.categoryNodes)
        $scope.categoryNodes = [];
      $scope.categoryNodes.push(treeNode);
      $scope.editCategory(treeNode);
    };

    $scope.publishGroup = function () {
      var modalInstance = $modal.open({
        templateUrl: 'views/cf/manage/confirm-publish-group.html',
        controller: 'ConfirmDialogCtrl',
        size: 'md',
        backdrop: 'static',
        keyboard: false
      });
      modalInstance.result.then(
        function (result) {
          if (result) {
            $scope.loading = true;
            $scope.executionError = null;
              CFTestPlanManager.saveGroup("hl7v2", $scope.testcase.scope, $scope.token, $scope.getUpdatedProfiles(), $scope.getRemovedProfiles(), $scope.getAddedProfiles(), $scope.testcase).then(function (result) {
              if (result.status === "SUCCESS") {
                $scope.selectedNode['name'] = $scope.testcase['name'];
                $scope.selectedNode['description'] = $scope.testcase['description'];
                $scope.selectedNode['scope'] = 'GLOBAL';
                $scope.uploaded = false;
                $scope.profileMessages = [];
                $scope.oldProfileMessages = [];
                $scope.token = null;

                CFTestPlanManager.publishGroup($scope.testcase.groupId).then(function (result) {
                  if (result.status === "SUCCESS") {
                    var group = $scope.findGroup($scope.selectedNode.id);
                    if(group != null){
                      group['id'] =  $scope.selectedNode.id;
                      group['persistentId'] =  $scope.selectedNode.persistentId;
                      group['name'] =  $scope.selectedNode.name;
                      group['description'] =  $scope.selectedNode.description;
                      group['scope'] =  $scope.selectedNode.scope;
                      group['category'] =  $scope.selectedNode.category;
                    }
                    $scope.selectedScope.key = 'GLOBAL';
                    $scope.selectScope();
                    $scope.selectGroup($scope.selectedNode);
                    Notification.success({
                      message: "Profile group has been successfully published !",
                      templateUrl: "NotificationSuccessTemplate.html",
                      scope: $rootScope,
                      delay: 5000
                    });
                  } else {
                    // Notification.error({
                    //   message: result.message,
                    //   templateUrl: "NotificationErrorTemplate.html",
                    //   scope: $rootScope,
                    //   delay: 10000
                    // });

                    $scope.executionError = result.message;


                  }
                  $scope.loading = false;
                }, function (error) {
                  $scope.loading = false;
                  $scope.executionError = error.data;
                  // Notification.error({
                  //   message: error.data,
                  //   templateUrl: "NotificationErrorTemplate.html",
                  //   scope: $rootScope,
                  //   delay: 10000
                  // });
                });
              } else {
                $scope.executionError = result.message;

                // Notification.error({
                //   message: result.message,
                //   templateUrl: "NotificationErrorTemplate.html",
                //   scope: $rootScope,
                //   delay: 10000
                // });
              }
              $scope.loading = false;
            }, function (error) {
              $scope.loading = false;
              // Notification.error({
              //   message: error.data,
              //   templateUrl: "NotificationErrorTemplate.html",
              //   scope: $rootScope,
              //   delay: 10000
              // });

              $scope.executionError = error.data;


            });
          }
        }, function (result) {

        });
    };


    $scope.saveGroup = function () {
      $scope.loading = true;
      CFTestPlanManager.saveGroup("hl7v2", $scope.testcase.scope, $scope.token, $scope.getUpdatedProfiles(), $scope.getRemovedProfiles(), $scope.getAddedProfiles(), $scope.testcase).then(function (result) {
        if (result.status === "SUCCESS") {
          $scope.selectedNode['name'] = $scope.testcase['name'];
          $scope.selectedNode['description'] = $scope.testcase['description'];
          var group = $scope.findGroup($scope.selectedNode.id);
          if(group != null){
            group['id'] =  $scope.selectedNode.id;
            group['persistentId'] =  $scope.selectedNode.persistentId;
            group['name'] =  $scope.selectedNode.name;
            group['description'] =  $scope.selectedNode.description;
            group['scope'] =  $scope.selectedNode.scope;
            group['category'] =  $scope.selectedNode.category;
          }
          Notification.success({
            message: "Profile Group saved successfully!",
            templateUrl: "NotificationSuccessTemplate.html",
            scope: $rootScope,
            delay: 5000
          });

          $scope.uploaded = false;
          $scope.profileMessages = [];
          $scope.oldProfileMessages = [];
          $scope.token = null;
          $scope.selectGroup($scope.selectedNode);
           // if($scope.uploaded == true){
          //   $scope.uploaded = false;
          //   $scope.profileMessages = [];
          //   $scope.oldProfileMessages = [];
          //   $scope.token = null;
          //   $scope.selectGroup($scope.selectedNode);
          // }else {
          //   $location.url('/cf?nav=execution&&group=' + $scope.testcase.groupId + "&scope=" + $scope.testcase.scope + "&cat=" + $scope.testcase.category);
          // }

        } else {
          // Notification.error({
          //   message: result.message,
          //   templateUrl: "NotificationErrorTemplate.html",
          //   scope: $rootScope,
          //   delay: 10000
          // });

          $scope.executionError = result.message;

        }
        $scope.loading = false;
      }, function (error) {
        $scope.loading = false;
        // Notification.error({
        //   message: error.data,
        //   templateUrl: "NotificationErrorTemplate.html",
        //   scope: $rootScope,
        //   delay: 10000
        // });

        $scope.executionError = error.data;




      });
    };

    $scope.reset = function () {

      var modalInstance = $modal.open({
        templateUrl: 'views/cf/manage/confirm-reset-group.html',
        controller: 'ConfirmDialogCtrl',
        size: 'md',
        backdrop: 'static',
        keyboard: false
      });
      modalInstance.result.then(
        function (result) {
          if (result) {

            if ($scope.selectedNode != null) {
              $scope.testcase['name'] = $scope.selectedNode['name'];
              $scope.testcase['description'] = $scope.selectedNode['description'];
            }

            $scope.profileMessages =  angular.copy($scope.originalProfileMessages);
            $scope.tmpNewMessages = $scope.filterMessages($scope.profileMessages);
            $scope.oldProfileMessages =  angular.copy($scope.originalOldProfileMessages);
            $scope.tmpOldMessages = $scope.filterMessages($scope.oldProfileMessages);

            if ($scope.token != null && $scope.uploaded == true) {
              // from an upload
              CFTestPlanManager.deleteToken($scope.token);
              $scope.token = null;
            }

          }
        }, function (result) {

        });
    };

    $scope.cancelToken = function () {
      if ($scope.token != null) {
        CFTestPlanManager.deleteToken($scope.token).then(function (result) {
          $scope.token = null;
          $scope.testcase = null;
          $scope.profileMessages = null;
          $scope.originalProfileMessages = null;
          $scope.originalOldProfileMessages = null;
          $scope.oldProfileMessages = null;
          $scope.existingTP = {selected: null};
          $scope.selectedTP = {id: null};
          $scope.profileValidationErrors = [];
          $scope.valueSetValidationErrors = [];
          $scope.constraintValidationErrors = [];
          Notification.success({
            message: "Changes removed successfully!",
            templateUrl: "NotificationSuccessTemplate.html",
            scope: $rootScope,
            delay: 5000
          });
          $timeout(function () {
            $location.url("/cf?nav=manage&&scope=" + $scope.selectedScope.key);
          });
        }, function (error) {
          // Notification.error({
          //   message: error.data,
          //   templateUrl: "NotificationErrorTemplate.html",
          //   scope: $rootScope,
          //   delay: 10000
          // });

          $scope.executionError = error.data;


        });
      }
    };

    $scope.deleteNewProfile = function (profile) {
      profile['removed'] = true;
      $scope.tmpNewMessages = $scope.filterMessages($scope.profileMessages);

    };


    $scope.deleteOldProfile = function (profile) {
      profile['removed'] = true;
      $scope.tmpOldMessages = $scope.filterMessages($scope.oldProfileMessages);
    };


    $scope.getAddedProfiles = function () {
      return _.reject($scope.profileMessages, function (message) {
        return message.removed == true;
      });
    };


    $scope.getRemovedProfiles = function () {
      return _.reject($scope.oldProfileMessages, function (message) {
        return message.removed == undefined || message.removed == false;
      });
    };


    $scope.getUpdatedProfiles = function () {
      return _.reject($scope.oldProfileMessages, function (message) {
        return message.removed == true;
      });
    };


    $scope.treeOptions = {
      beforeDrop: function (e) {
        $scope.error = null;
        var sourceNode = e.source.nodeScope.$modelValue;
        var destNode = e.dest.nodesScope.node;
        // display modal if the node is being dropped into a smaller container
        if (sourceNode != null && destNode != null && sourceNode.category != destNode.name) {
          return CFTestPlanManager.updateCategory(destNode.id,sourceNode.id).then(function (result) {
            if (result.status == 'SUCCESS') {
              return true;
            } else {
              $scope.error = "Failed to change " + sourceNode.name + "'s category.";
              return false;
            }
          }, function (error) {
            $scope.error = "Failed to change " + sourceNode.name + "'s category.";
            return false;
          });
        } else {
          return false;
        }
      }
    };


    $scope.openUploadModal = function () {
      $modalStack.dismissAll('close');
      var modalInstance = $modal.open({
        templateUrl: 'views/cf/manage/upload.html',
        controller: 'UploadCtrl',
        controllerAs: 'ctrl',
        windowClass: 'upload-modal',
        backdrop: 'static',
        keyboard: false
      });

      modalInstance.result.then(
        function (result, profiles) {
          if (result.token != null) {
            $scope.token = result.token;
            $scope.uploaded = true;
            $scope.originalProfileMessages = [];
            $scope.profileMessages = [];
            for (var i = 0; i < result.profiles.length; i++) {
              var profile = result.profiles[i];
              $scope.profileMessages.push(profile);
            }
            $scope.tmpNewMessages = $scope.filterMessages($scope.profileMessages);
          }
        },
        function (result) {

        }
      );
    };



    $scope.editExampleMessage = function (item) {
      $modalStack.dismissAll('close');
      var modalInstance = $modal.open({
        templateUrl: 'views/cf/manage/message.html',
        controller: 'CFManageExampleMessageCtrl',
        controllerAs: 'ctrl',
        windowClass: 'upload-modal',
        backdrop: 'static',
        keyboard: false,
        resolve: {
          exampleMessage: function () {
            return item.exampleMessage;
          }
        }
      });

      modalInstance.result.then(
        function (exampleMessage) {
          item.exampleMessage = exampleMessage;
        },
        function (result) {
        }
      );
    };




  }]);



angular.module('cf')
  .controller('CFManageExampleMessageCtrl', function ($scope, $http, $window, $modal, $filter, $rootScope, $timeout, StorageService, FileUploader, Notification, $modalInstance, exampleMessage) {

    $scope.exampleMessage  = exampleMessage;

    $scope.save = function () {
      $modalInstance.close($scope.exampleMessage);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };

  });


angular.module('cf')
  .controller('UploadCtrl', ['$scope', '$http', '$window', '$modal', '$filter', '$rootScope', '$timeout', 'StorageService', 'TestCaseService', 'TestStepService', 'FileUploader', 'Notification', '$modalInstance', 'userInfoService', 'CFTestPlanManager', function ($scope, $http, $window, $modal, $filter, $rootScope, $timeout, StorageService, TestCaseService, TestStepService, FileUploader, Notification, $modalInstance, userInfoService, CFTestPlanManager) {

    FileUploader.FileSelect.prototype.isEmptyAfterSelection = function () {
      return true;
    };
    $scope.step = 0;

    $scope.profileValidationErrors = [];
    $scope.valueSetValidationErrors = [];
    $scope.constraintValidationErrors = [];


    var profileUploader = $scope.profileUploader = new FileUploader({
      url: 'api/cf/hl7v2/management/uploadProfiles',
      autoUpload: true,
      filters: [{
        name: 'xmlFilter',
        fn: function (item) {
          return /\/(xml)$/.test(item.type);
        }
      }]
    });

    var vsUploader = $scope.vsUploader = new FileUploader({
      url: 'api/cf/hl7v2/management/uploadValueSets',
      autoUpload: true,
      filters: [{
        name: 'xmlFilter',
        fn: function (item) {
          return /\/(xml)$/.test(item.type);
        }
      }]
    });

    var constraintsUploader = $scope.constraintsUploader = new FileUploader({
      url: 'api/cf/hl7v2/management/uploadConstraints',
      autoUpload: true,
      filters: [{
        name: 'xmlFilter',
        fn: function (item) {
          return /\/(xml)$/.test(item.type);
        }
      }]
    });


    var zipUploader = $scope.zipUploader = new FileUploader({
      url: 'api/cf/hl7v2/management/uploadZip',
      autoUpload: true,
      filters: [{
        name: 'zipFilter',
        fn: function (item) {
          return /\/(zip)$/.test(item.type);
        }
      }]
    });


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
        $scope.tmpNewMessages = $scope.filterMessages($scope.profileMessages);

      }

    };

    profileUploader.onBeforeUploadItem = function (fileItem) {
      $scope.profileValidationErrors = [];
      if ($scope.token == null) {
        $scope.token = $scope.generateUUID();
      }
      fileItem.formData.push({token: $scope.token});
    };
    constraintsUploader.onBeforeUploadItem = function (fileItem) {
      $scope.constraintValidationErrors = [];
      if ($scope.token == null) {
        $scope.token = $scope.generateUUID();
      }
      fileItem.formData.push({token: $scope.token});
    };
    vsUploader.onBeforeUploadItem = function (fileItem) {
      $scope.valueSetValidationErrors = [];
      if ($scope.token == null) {
        $scope.token = $scope.generateUUID();
      }
      fileItem.formData.push({token: $scope.token});
    };
    zipUploader.onBeforeUploadItem = function (fileItem) {

      $scope.profileValidationErrors = [];
      $scope.valueSetValidationErrors = [];
      $scope.constraintValidationErrors = [];
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
        CFTestPlanManager.getTokenProfiles("hl7v2", $scope.token).then(
          function (response) {
            if (response.success == false) {
              if (response.debugError === undefined) {
                Notification.error({
                  message: "The zip file you uploaded is not valid, please check and correct the error(s)",
                  templateUrl: "NotificationErrorTemplate.html",
                  scope: $rootScope,
                  delay: 10000
                });
                $scope.step = 1;
                $scope.profileValidationErrors = angular.fromJson(response.profileErrors);
                $scope.valueSetValidationErrors = angular.fromJson(response.constraintsErrors);
                $scope.constraintValidationErrors = angular.fromJson(response.vsErrors);
              } else {
                Notification.error({
                  message: "  " + response.message + '<br>' + response.debugError,
                  templateUrl: "NotificationErrorTemplate.html",
                  scope: $rootScope,
                  delay: 10000
                });
                $scope.step = 1;
              }
            } else {
              $scope.profileMessages = response.profiles;
              $scope.tmpNewMessages = $scope.filterMessages($scope.profileMessages);

              $scope.addSelectedTestCases();
            }
          },
          function (response) {

          }
        );
      }
    };

    $scope.gotStep = function (step) {
      $scope.step = step;
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
      return $scope.profileMessages;
    };

    // $scope.profileCheckToggle = function () {
    //   $scope.profileMessages.forEach(function (p) {
    //     p.activated = $scope.profileCheckToggleStatus;
    //   });
    // };

    // $scope.upload = function (value) {
    //   $scope.step = 0;
    //   $scope.token = $scope.generateUUID();
    //   $scope.profileValidationErrors = [];
    //   $scope.valueSetValidationErrors = [];
    //   $scope.constraintValidationErrors = [];
    //   vsUploader.uploadAll();
    //   constraintsUploader.uploadAll();
    //   profileUploader.uploadAll();
    // };

    zipUploader.onBeforeUploadItem = function (fileItem) {
      $scope.profileValidationErrors = [];
      $scope.valueSetValidationErrors = [];
      $scope.constraintValidationErrors = [];
      $scope.token = null;
    };

    // $scope.remove = function (value) {
    //   $scope.profileValidationErrors = [];
    //   $scope.valueSetValidationErrors = [];
    //   $scope.constraintValidationErrors = [];
    //   profileUploader.clearQueue();
    //   vsUploader.clearQueue();
    //   constraintsUploader.clearQueue();
    // };

    $scope.dismissModal = function () {
      $modalInstance.dismiss();
    };

    $scope.addSelectedTestCases = function () {
      $scope.loading = true;
      Notification.success({
        message: "Profile Added !",
        templateUrl: "NotificationSuccessTemplate.html",
        scope: $rootScope,
        delay: 5000
      });
      $modalInstance.close({token: $scope.token, profiles: $scope.getSelectedTestcases()});

      // $http.post('api/cf/hl7v2/management/profiles/add', {
      //   groupId: $scope.testcase.groupId,
      //   testcasename: $scope.testcase.name,
      //   testcasedescription: $scope.testcase.description,
      //   testcases: $scope.getSelectedTestcases(),
      //   scope: $scope.testcase.scope,
      //   token: $scope.token
      // }).then(function (result) {
      //
      //   if (result.status === "SUCCESS") {
      //     Notification.success({
      //       message: "Profile Added !",
      //       templateUrl: "NotificationSuccessTemplate.html",
      //       scope: $rootScope,
      //       delay: 5000
      //     });
      //     $modalInstance.close({testPlanId: result.testPlanId, scope: $scope.testcase.scope});
      //   } else {
      //     Notification.error({
      //       message: result.message + '<br><br>Debug message:<br>' + result.debugError,
      //       templateUrl: "NotificationErrorTemplate.html",
      //       scope: $rootScope,
      //       delay: 20000
      //     });
      //   }
      //   $scope.loading = false;
      // }, function (error) {
      //   $scope.loading = false;
      //   Notification.error({
      //     message: error.data,
      //     templateUrl: "NotificationErrorTemplate.html",
      //     scope: $rootScope,
      //     delay: 10000
      //   });
      // });
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

  }]);


angular.module('cf').controller('UploadTokenCheckCtrl', ['$scope', '$http', 'CF', '$window', '$modal', '$filter', '$rootScope', '$timeout', 'StorageService', 'TestCaseService', 'TestStepService', 'userInfoService', 'Notification', 'modalService', '$routeParams', '$location', function ($scope, $http, CF, $window, $modal, $filter, $rootScope, $timeout, StorageService, TestCaseService, TestStepService, userInfoService, Notification, modalService, $routeParams, $location) {
  $scope.testcase = {};

  $scope.profileValidationErrors = [];
  $scope.valueSetValidationErrors = [];
  $scope.constraintValidationErrors = [];

  $scope.profileCheckToggleStatus = false;

  $scope.token = decodeURIComponent($routeParams.x);
  $scope.auth = decodeURIComponent($routeParams.y);


  if ($scope.token !== undefined && $scope.auth !== undefined) {


    //check if logged in
    if (!userInfoService.isAuthenticated()) {
      $scope.$emit('event:loginRequestWithAuth', $scope.auth, '/addprofiles?x=' + $scope.token);
    } else {
      $location.url('/addprofiles?x=' + $scope.token);
    }
  }


}]);
