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


angular.module('doc').factory('KnownIssueListLoader', ['$q', '$http',
  function ($q, $http) {
    return function () {
      var delay = $q.defer();
      $http.get("api/documentation/knownissues").then(
        function (object) {
          delay.resolve(angular.fromJson(object.data));
        },
        function (response) {
          delay.reject(response.data);
        }
      );
      return delay.promise;
    };
  }
]);


angular.module('doc').factory('ReleaseNoteListLoader', ['$q', '$http',
  function ($q, $http) {
    return function () {
      var delay = $q.defer();
      $http.get("api/documentation/releasenotes").then(
        function (object) {
          delay.resolve(angular.fromJson(object.data));
        },
        function (response) {
          delay.reject(response.data);
        }
      );
      return delay.promise;
    };
  }
]);

angular.module('doc').factory('UserDocListLoader', ['$q', '$http',
  function ($q, $http) {
    return function (domain, scope) {
      var delay = $q.defer();
      $http.get("api/documentation/userdocs", {params: {"domain":domain, "scope":scope}}).then(
        function (object) {
          delay.resolve(angular.fromJson(object.data));
        },
        function (response) {
          delay.reject(response.data);
        }
      );
      return delay.promise;
    };
  }
]);


angular.module('doc').factory('ResourceDocListLoader', ['$q', '$http',
  function ($q, $http) {
    return function (type, scope, domain) {
      var delay = $q.defer();
      $http.get('api/documentation/resourcedocs', {params: {"type": type, "domain":domain, "scope":scope}, timeout: 60000}).then(
        function (object) {
          delay.resolve(angular.fromJson(object.data));
        },
        function (response) {
          delay.reject(response.data);
        }
      );
      return delay.promise;
    };
  }
]);


angular.module('doc').factory('DeliverableListLoader', ['$q', '$http',
  function ($q, $http) {
    return function () {
      var delay = $q.defer();
      $http.get('api/documentation/deliverables', {timeout: 60000}).then(
        function (object) {
          delay.resolve(angular.fromJson(object.data));
        },
        function (response) {
          delay.reject(response.data);
        }
      );
      return delay.promise;
    };
  }
]);

angular.module('doc').factory('InstallationGuideLoader', ['$q', '$http',
  function ($q, $http) {
    return function () {
      var delay = $q.defer();
      $http.get('api/documentation/installationguide', {timeout: 60000}).then(
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
    };
  }
]);


