/**
 * Created by haffo on 4/26/16.
 */


angular.module('logs').factory('ValidationLogService', ['$q', '$http',
  function ($q, $http) {
    var service = {
      getAll:  function () {
        var delay = $q.defer();
        $http.get("api/logs/validation", {timeout: 180000}).then(
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
      }
    };
    return service;
  }
]);
