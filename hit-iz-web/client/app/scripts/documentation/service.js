angular.module('doc').factory('TestCaseDocumentationLoader',
  ['$q', '$http', '$rootScope', function ($q, $http,$rootScope) {

    var TestCaseDocumentationLoader = function () {
    };


    TestCaseDocumentationLoader.prototype.getOneByStageAndDomain = function (stage) {
      var delay = $q.defer();
//
//                $http.get('../../resources/documentation/cb.json').then(
//                    function (object) {
//                        delay.resolve(angular.fromJson(object.data));
//                    },
//                    function (response) {
//                        delay.reject(response.data);
//                    }
//                );

      $http.get('api/documentation/testcases', {timeout: 60000,  params: {"domain": $rootScope.domain.value}}).then(
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


angular.module('doc').factory('KnownIssueListLoader', ['$q', '$http', 'StorageService', '$timeout',
  function ($q, $http, StorageService, $timeout) {
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
//                $http.get('../../resources/documentation/docs.json').then(
//                    function (object) {
//                        delay.resolve(angular.fromJson(object.data));
//                    },
//                    function (response) {
//                        delay.reject(response.data);
//                    }
//                );

      return delay.promise;
    };
  }
]);


angular.module('doc').factory('ReleaseNoteListLoader', ['$q', '$http', 'StorageService', '$timeout',
  function ($q, $http, StorageService, $timeout) {
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
//
//                $http.get('../../resources/documentation/docs.json').then(
//                    function (object) {
//                        delay.resolve(angular.fromJson(object.data));
//                    },
//                    function (response) {
//                        delay.reject(response.data);
//                    }
//                );

      return delay.promise;
    };
  }
]);

angular.module('doc').factory('UserDocListLoader', ['$q', '$http', 'StorageService', '$timeout','$rootScope',
  function ($q, $http, StorageService, $timeout,$rootScope) {
    return function () {
      var delay = $q.defer();
      $http.get("api/documentation/userdocs", {params: {"domain":$rootScope.domain.value}}).then(
        function (object) {
          delay.resolve(angular.fromJson(object.data));
        },
        function (response) {
          delay.reject(response.data);
        }
      );
//
//                $http.get('../../resources/documentation/docs.json').then(
//                    function (object) {
//                        delay.resolve(angular.fromJson(object.data));
//                    },
//                    function (response) {
//                        delay.reject(response.data);
//                    }
//                );

      return delay.promise;
    };
  }
]);


angular.module('doc').factory('ResourceDocListLoader', ['$q', '$http', 'StorageService', '$timeout','$rootScope',
  function ($q, $http, StorageService, $timeout,$rootScope) {
    return function (type) {
      var delay = $q.defer();
      $http.get('api/documentation/resourcedocs', {params: {"type": type, "domain":$rootScope.domain.value}, timeout: 60000}).then(
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


angular.module('doc').factory('DeliverableListLoader', ['$q', '$http', 'StorageService', '$timeout',
  function ($q, $http, StorageService, $timeout, $rootScope) {
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

angular.module('doc').factory('InstallationGuideLoader', ['$q', '$http', '$timeout',
  function ($q, $http, $timeout, $rootScope) {
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


