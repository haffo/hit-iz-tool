/**
 * Created by haffo on 4/26/16.
 */


angular.module('logs').factory('ValidationLogService', ['$q', '$http',
  function ($q, $http) {
    var service = {

      getTotalCount:  function (domain) {
        var delay = $q.defer();
        $http.get("api/logs/validation/"+ domain + "/count", {timeout: 180000}).then(
          function (object) {
            delay.resolve(object.data);
          },
          function (response) {
            delay.reject(response.data);
          }
        );

        return delay.promise;
      },

      getAll:  function (domain) {
        var delay = $q.defer();
        $http.get("api/logs/validation/"+ domain, {timeout: 180000}).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );

        return delay.promise;
      },

      getById: function (logId) {
        var delay = $q.defer();
        $http.get("api/logs/validation/" + logId, {timeout: 180000}).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },

      deleteLog: function (logId) {
        var delay = $q.defer();
        $http.post("api/logs/validation/" + logId + "/delete").then(
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
    return service;
  }
]);



angular.module('logs').factory('TransportLogService', ['$q', '$http',
  function ($q, $http) {
    var service = {

      getTotalCount:  function (domain) {
        var delay = $q.defer();
        $http.get("api/logs/transport/"+ domain + "/count", {timeout: 180000}).then(
          function (object) {
            delay.resolve(object.data);
          },
          function (response) {
            delay.reject(response.data);
          }
        );

        return delay.promise;
      },

      getAll:  function (domain) {
        var delay = $q.defer();
        $http.get("api/logs/transport/" +domain , {timeout: 180000}).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );

        return delay.promise;
      },

      getById: function (logId) {
        var delay = $q.defer();
        $http.get("api/logs/transport/" + logId, {timeout: 180000}).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },
      deleteLog: function (logId) {
        var delay = $q.defer();
        $http.post("api/logs/transport/" + logId + "/delete").then(
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
    return service;
  }
]);

