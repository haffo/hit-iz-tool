'use strict';


angular.module('cf').factory('CF',
    ['$rootScope', '$http', '$q', 'Message', 'Tree', function ($rootScope, $http, $q, Message, Tree) {
        var CF = {
            editor: null,
            cursor: null,
            tree: new Tree(),
            testCase: null,
            selectedTestCase: null,
            message: new Message(),
            searchTableId: 0
        };
        return CF;
}]);


angular.module('cf').factory('CFTestPlanListLoader', ['$q', '$http',
    function ($q, $http) {
        return function (scope) {
            var delay = $q.defer();
                $http.get("api/cf/testplans", {timeout: 180000, params: {"scope": scope}}).then(
                    function (object) {
                         delay.resolve(angular.fromJson(object.data));
                    },
                    function (response) {
                        delay.reject(response.data);
                    }
                );
//                $http.get('../../resources/cf/testCases.json').then(
//                    function (object) {
//                         delay.resolve(angular.fromJson(object.data));
//                    },
//                    function (response) {
//                        delay.reject(response.data);
//                    }
//                );

            return delay.promise;
        };
    }
]);


angular.module('cf').factory('CFTestPlanLoader', ['$q', '$http',
  function ($q, $http) {
    return function (id) {
      var delay = $q.defer();
      $http.get("api/cf/testplans/" + id, {timeout: 180000}).then(
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



angular.module('cf').factory('CFTestPlanManager', ['$q', '$http',
  function ($q, $http) {
    var manager = {
      getProfiles: function(groupId){
        var delay = $q.defer();
        $http.get("api/cf/groups/"+ groupId + "/profiles", {timeout: 180000}).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },

      getTokenProfiles: function(token){
        var delay = $q.defer();
        $http.get("api/cf/hl7v2/resources/tokens/"+ token + "/profiles", {timeout: 180000}).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },

      getTestPlan:  function (id) {
        var delay = $q.defer();
        $http.get("api/cf/testplans/" + id, {timeout: 180000}).then(
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
        $http.get("api/cf/groups", {timeout: 180000, params: {"scope": scope}}).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },

      create : function (catego, scop, pos) {
        var delay = $q.defer();
        $http.post('api/cf/groups/create', {params : {category: catego, scope: scop, position: pos}}).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },

      delete : function (groupId) {
        var delay = $q.defer();
        $http.post('api/cf/groups/' + groupId + '/delete').then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },
      deleteAll : function (groupIds) {
        var delay = $q.defer();
        $http.post('api/cf/groups/delete', {params: {groupIds: groupIds}}).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },
      saveGroupInfo : function (groupInfo) {
        var delay = $q.defer();
        $http.post('api/cf/groups/info', groupInfo).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },
      deleteToken : function (tok) {
        var delay = $q.defer();
        $http.post('api/cf/tokens/'+ tok + "/delete").then(function (object) {
          delay.resolve(angular.fromJson(object.data));
        }, function (error) {
          delay.reject(response.data);
        });
        return delay.promise;
      },
      updateCategory:  function (category, groups) {
        var delay = $q.defer();
        $http.post("api/cf/categories", {params: {category: category, groups: groups}}).then(
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



