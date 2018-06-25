'use strict';

/* "newcap": false */

angular.module('logs')
  .controller('ValidationLogCtrl', ['$scope', 'ValidationLogService', 'Notification',
    function ($scope, ValidationLogService, Notification) {

      $scope.logs = null;
      $scope.logDetails = null;
      $scope.error = null;
      $scope.loadingAll = false;
      $scope.loadingOne = false;

      $scope.initValidationLogs = function () {
        $scope.loadingAll = true;
        ValidationLogService.getAll().then(function (logs) {
          $scope.logs = logs;
          $scope.loadingAll = false;
        }, function (error) {
          $scope.loadingAll = false;
          $scope.error = "Sorry, Cannot load the logs. Please try again. \n DEBUG:" + error;
        });
      };

      $scope.loadLogDetails = function (logId) {
        $scope.loadingOne = true;
        ValidationLogService.getById(logId).then(function (logDetails) {
          $scope.logDetails = logDetails;
          $scope.loadingOne = false;
        }, function (error) {
          $scope.loadingOne = false;
          $scope.error = "Sorry, Cannot load the log details. Please try again. \n DEBUG:" + error;
        });
      };

    }
  ]);


angular.module('logs')
  .controller('TransportLogCtrl', ['$scope', '$resource', 'AccountLoader', 'Account', 'userInfoService', '$location', '$rootScope',
    function ($scope, $resource, AccountLoader, Account, userInfoService, $location, $rootScope) {


    }
  ]);


