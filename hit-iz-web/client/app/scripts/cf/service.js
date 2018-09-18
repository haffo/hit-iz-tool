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



angular.module('cf').factory('CFTestPlanExecutioner', ['$q', '$http',
  function ($q, $http) {
    var manager = {
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

      getTestPlans: function (scope,domain) {
        var delay = $q.defer();
        $http.get("api/cf/testplans", {timeout: 180000, params: {"scope": scope, "domain":domain}}).then(
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


angular.module('cf').factory('CFTestPlanManager', ['$q', '$http',
  function ($q, $http) {
    var manager = {
      getTestStepGroupProfiles: function(groupId){
        var delay = $q.defer();
        $http.get("api/cf/management/testStepGroups/"+ groupId + "/profiles", {timeout: 180000}).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },
      getTestPlanProfiles: function(groupId){
        var delay = $q.defer();
        $http.get("api/cf/management/testPlans/"+ groupId + "/profiles", {timeout: 180000}).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },


      getTokenProfiles: function(format, token){
        var delay = $q.defer();
        $http.get("api/cf/" + format + "/management/tokens/"+ token + "/profiles", {timeout: 180000}).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },
      //
      // getTestPlan:  function (id) {
      //   var delay = $q.defer();
      //   $http.get("api/cf/testplans/" + id, {timeout: 180000}).then(
      //     function (object) {
      //       delay.resolve(angular.fromJson(object.data));
      //     },
      //     function (response) {
      //       delay.reject(response.data);
      //     }
      //   );
      //
      //   return delay.promise;
      // },

      getTestPlan:  function (id) {
        var delay = $q.defer();
        $http.get("api/cf/management/testPlans/" + id, {timeout: 180000}).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );

        return delay.promise;
      },

      getTestPlans: function (scope,domain) {
        var delay = $q.defer();
        $http.get("api/cf/management/testPlans", {timeout: 180000, params: {"scope": scope,"domain":domain}}).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },

      addChild : function (newGroup, parent) {
        var delay = $q.defer();
        var params = $.param({position: newGroup.position, name: newGroup.name, description:newGroup.description,
          scope: newGroup.scope,domain:newGroup.domain});
        var config = {
          headers : {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
          }
        };
        var url =  null;
        if(parent.type == 'TestPlan'){
          url = 'api/cf/management/testPlans/' + parent.id + "/addChild"
        }else{
          url = 'api/cf/management/testStepGroups/' + parent.id + "/addChild"
        }
        $http.post(url, params,config).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },

      createTestPlan : function (testPlan) {
        var delay = $q.defer();
        var params = $.param({name: testPlan.name, description: testPlan.description, position: testPlan.position,domain:testPlan.domain,scope:testPlan.scope});
        var config = {
          headers : {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
          }
        };
        $http.post('api/cf/management/testPlans/create', params,config).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },


      deleteProfile : function (domain, profileId) {
        var delay = $q.defer();
        $http.post('api/cf/'+ domain+ '/management/profiles/' + profileId + '/delete').then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },



      deleteTestStepGroup:  function (testStepGroup) {
        var delay = $q.defer();
        var context = testStepGroup.parent.type === 'TestPlan' ? 'testPlans/' : 'testStepGroups/';
        $http.post('api/cf/management/' + context + testStepGroup.parent.id + '/testStepGroups/'+ testStepGroup.id + '/delete').then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },

      deleteTestPlan:  function (testPlan) {
        var delay = $q.defer();
        $http.post('api/cf/management/testPlans/'+ testPlan.id + '/delete').then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },




      // deleteGroups : function (groupIds) {
      //   var delay = $q.defer();
      //   $http.post('api/cf/management/groups/delete', groupIds).then(
      //     function (object) {
      //       delay.resolve(angular.fromJson(object.data));
      //     },
      //     function (response) {
      //       delay.reject(response.data);
      //     }
      //   );
      //   return delay.promise;
      // },
      //


      updateLocation : function (destination, child, newPosition) {
        var params = $.param({newPosition: newPosition,oldParentId:child.parent.id,
          oldParentType:child.parent.type,newParentId:destination.id,newParentType:destination.type});
        var config = {
          headers : {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
          }
        };
        var delay = $q.defer();
        $http.post('api/cf/management/testStepGroups/' + child.id + '/location', params,config).then(
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
        $http.post('api/cf/management/tokens/'+ tok + "/delete").then(function (object) {
          delay.resolve(angular.fromJson(object.data));
        }, function (error) {
          delay.reject(response.data);
        });
        return delay.promise;
      },


      // updateCategories:  function (category, groups) {
      //   var delay = $q.defer();
      //   $http.post("api/cf/management/categories/" +category , groups).then(
      //     function (object) {
      //       delay.resolve(angular.fromJson(object.data));
      //     },
      //     function (response) {
      //       delay.reject(response.data);
      //     }
      //   );
      //   return delay.promise;
      // },
      //
      //



      saveTestStepGroup:  function (format, scope, token, updated, removed, added, metadata) {
        var delay = $q.defer();
        $http.post('api/cf/'+ format + '/management/testStepGroups/' +metadata.groupId, {
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

      saveTestPlan:  function (format, scope, token, updated, removed, added, metadata) {
        var delay = $q.defer();
        $http.post('api/cf/'+ format + '/management/testPlans/' +metadata.groupId, {
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




      publishTestPlan:  function (groupId) {
        var delay = $q.defer();
        $http.post('api/cf/management/testPlans/'+ groupId + '/publish').then(
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

angular.module('cf').service('modalService', ['$modal',	function ($modal) {

    var modalDefaults = {
        backdrop: true,
        keyboard: true,
        modalFade: true,
        templateUrl: 'views/cf/modal.html'
    };

    var modalOptions = {
        closeButtonText: 'Close',
        actionButtonText: 'OK',
        headerText: 'Proceed?',
        bodyText: 'Perform this action?'
    };

    this.showModal = function (customModalDefaults, customModalOptions) {
        if (!customModalDefaults) customModalDefaults = {};
        customModalDefaults.backdrop = 'static';
        return this.show(customModalDefaults, customModalOptions);
    };

    this.show = function (customModalDefaults, customModalOptions) {
        //Create temp objects to work with since we're in a singleton service
        var tempModalDefaults = {};
        var tempModalOptions = {};

        //Map angular-ui modal custom defaults to modal defaults defined in service
        angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

        //Map modal.html $scope custom properties to defaults defined in service
        angular.extend(tempModalOptions, modalOptions, customModalOptions);

        if (!tempModalDefaults.controller) {
            tempModalDefaults.controller = ['$scope','$modalInstance',function ($scope, $modalInstance) {
                $scope.modalOptions = tempModalOptions;
                $scope.modalOptions.ok = function (result) {
                    $modalInstance.close(result);
                };
                $scope.modalOptions.close = function (result) {
                    $modalInstance.dismiss('cancel');
                };
            }];
        }

        return $modal.open(tempModalDefaults).result;
    };

}]);



