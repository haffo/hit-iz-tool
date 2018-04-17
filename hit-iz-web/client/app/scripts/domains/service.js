angular.module('domains').factory('DomainsManager', ['$q', '$http',
  function ($q, $http) {
    var manager = {

      getDomainsByScope:  function (scope) {
        var delay = $q.defer();
        $http.get('api/domains/search-by-scope', {timeout: 60000,  params: {"scope":scope}}).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },

      getDomainById:  function (id) {
        var delay = $q.defer();
        $http.get('api/domains/' + id, {timeout: 60000}).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },

      getDomainByKey: function (key) {
        var delay = $q.defer();
        $http.get('api/domains/search-by-key',{timeout: 60000,  params: {"key":key}}).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },

      save: function (domain) {
        var delay = $q.defer();
        var data = angular.fromJson(domain);
        $http.post('api/domains/' + domain.id,data).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },
      publish: function (domain) {
        var delay = $q.defer();
        var data = angular.fromJson(domain);
        $http.post('api/domains/' + domain.id + "/publish",data).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },
      delete: function (id) {
        var delay = $q.defer();
        $http.post('api/domains/' + id + "/delete").then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },
      create: function (name, key,scope) {
        var delay = $q.defer();
        $http.post('api/domains/create', {params: {"key": key,"name": name, "scope":scope}}).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },
      getDefaultHomeContent: function () {
        var delay = $q.defer();
        $http.post('api/domains/home-content').then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },
      getDefaultValueSetCopyright: function () {
        var delay = $q.defer();
        $http.post('api/domains/valueset-copyright').then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },
      getDefaultProfileInfo: function () {
        var delay = $q.defer();
        $http.post('api/domains/profile-info').then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },
      getDefaultMessageContent: function () {
        var delay = $q.defer();
        $http.post('api/domains/message-content').then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },
      getDefaultValidationResultInfo: function () {
        var delay = $q.defer();
        $http.post('api/domains/validation-result-info').then(
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


