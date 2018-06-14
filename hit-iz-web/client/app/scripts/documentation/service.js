angular.module('doc').factory('TestCaseDocumentationLoader',
  ['$q', '$http', '$rootScope', function ($q, $http,$rootScope) {

    var TestCaseDocumentationLoader = function () {
    };


    TestCaseDocumentationLoader.prototype.getOneByDomainAndScope = function (domain, scope) {
      var delay = $q.defer();
      $http.get('api/documentation/testcases', {timeout: 60000,  params: {"domain": domain,"scope":scope}}).then(
        function (object) {
          if (object.data != null && object.data != "") {
            delay.resolve(angular.fromJson(object.data));
          } else {
            delay.resolve(null);
          }
        },
        function (response) {
          delay.reject(response.data);
        }
      );
      return delay.promise;
    };

    return TestCaseDocumentationLoader;
  }
  ]);



angular.module('doc').factory('DocumentationManager', ['$q', '$http',
  function ($q, $http) {
    var manager = {

      getInstallationGuide :  function () {
        var delay = $q.defer();
        $http.get('api/documentation/installationguides', {timeout: 60000}).then(
          function (object) {
            if(object.data != null && object.data != "") {
              delay.resolve(angular.fromJson(object.data));
            }else{
              delay.resolve(null);
            }
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },

      getTestCaseDocuments: function (domain, scope) {
        var delay = $q.defer();
        $http.get('api/documentation/testcases', {timeout: 60000,  params: {"domain": domain,"scope":scope}}).then(
          function (object) {
            if (object.data != null && object.data != "") {
              delay.resolve(angular.fromJson(object.data));
            } else {
              delay.resolve(null);
            }
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },

      getDocuments: function (domain, scope, type) {
        var delay = $q.defer();
        $http.get('api/documentation/documents', {params: {"domain": domain,"scope":scope,"type":type}}).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },


      saveDocument: function (document) {
        var delay = $q.defer();
        $http.post('api/documentation/documents', document).then(
          function (object) {
               delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },

      deleteDocument: function (id) {
        var delay = $q.defer();
        $http.post('api/documentation/documents/' + id + '/delete').then(
          function (object) {
            delay.resolve(object.data);
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },
      publishDocument: function (id) {
        var delay = $q.defer();
        $http.post('api/documentation/documents/' + id + '/publish').then(
          function (object) {
            delay.resolve(object.data);
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



