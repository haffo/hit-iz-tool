'use strict';


angular.module('cb').factory('CB',
    ['Message', 'ValidationSettings', 'Tree', 'StorageService', 'Transport', 'Logger', 'User', function (Message, ValidationSettings, Tree, StorageService, Transport, Logger, User) {
        var CB = {
            testCase: null,
            selectedTestCase: null,
            selectedTestPlan: null,
            editor: null,
            tree: new Tree(),
            cursor: null,
            message: new Message(),
            logger: new Logger(),
            validationSettings: new ValidationSettings(),
            setContent: function (value) {
                CB.message.content = value;
                CB.editor.instance.doc.setValue(value);
                CB.message.notifyChange();
            },
            getContent: function () {
                return  CB.message.content;
            }
        };
        return CB;
    }]);

angular.module('cb').factory('CBTestPlanListLoader', ['$q', '$http',
    function ($q, $http) {
        return function (scope) {
            var delay = $q.defer();
            $http.get("api/cb/testplans", {timeout: 180000, params: {"scope": scope}}).then(
                function (object) {
                    delay.resolve(angular.fromJson(object.data));
                },
                function (response) {
                    delay.reject(response.data);
                }
            );


//            $http.get("../../resources/cb/testPlans.json").then(
//                function (object) {
//                    delay.resolve(angular.fromJson(object.data));
//                },
//                function (response) {
//                    delay.reject(response.data);
//                }
//            );
            return delay.promise;
        };
    }
]);


angular.module('cb').factory('CBTestPlanLoader', ['$q', '$http',
  function ($q, $http) {
    return function (id) {
      var delay = $q.defer();
      $http.get("api/cb/testplans/" + id, {timeout: 180000}).then(
        function (object) {
          delay.resolve(angular.fromJson(object.data));
        },
        function (response) {
          delay.reject(response.data);
        }
      );


//            $http.get("../../resources/cb/testPlans.json").then(
//                function (object) {
//                    delay.resolve(angular.fromJson(object.data));
//                },
//                function (response) {
//                    delay.reject(response.data);
//                }
//            );
      return delay.promise;
    };
  }
]);











angular.module('cb').factory('CBTestPlanManager', ['$q', '$http',
  function ($q, $http) {
    var manager = {
      getTestPlan:  function (id) {
        var delay = $q.defer();
        $http.get("api/cb/testplans/" + id, {timeout: 180000}).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );

        return delay.promise;
      },

      getTestPlans: function (scope) {
        var delay = $q.defer();
        $http.get("api/cb/testplans", {timeout: 180000, params: {"scope": scope}}).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },
      saveGroup:  function (domain, scope, token, updated, removed, added, metadata) {
        var delay = $q.defer();
        $http.post('api/cb/'+ domain + '/management/groups/' +metadata.groupId, {
          groupId: metadata.groupId,
          testcasename:metadata.name,
          testcasedescription: metadata.description,
          added: added,
          removed: removed,
          updated: updated,
          token: token,
          scope: scope
        }).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },
      publishGroup:  function (groupId) {
        var delay = $q.defer();
        $http.post('api/cb/management/groups/'+ groupId + '/publish').then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },
      deleteTestStep:  function (testStepId) {
        var delay = $q.defer();
        $http.post('api/cb/management/testSteps/'+ testStepId + '/delete').then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },
      deleteTestCase:  function (testCaseId) {
        var delay = $q.defer();
        $http.post('api/cb/management/testCases/'+ testCaseId + '/delete').then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },
      deleteTestPlan:  function (testPlanId) {
        var delay = $q.defer();
        $http.post('api/cb/management/testPlans/'+ testPlanId + '/delete').then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },

      deleteTestGroup:  function (testGroupId) {
        var delay = $q.defer();
        $http.post('api/cb/management/testCaseGroups/'+ testGroupId + '/delete').then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
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








