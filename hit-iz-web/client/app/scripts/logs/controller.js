'use strict';

/* "newcap": false */


angular.module('logs')
  .controller('LogCtrl', ['$scope', 'ValidationLogService', 'TransportLogService','$rootScope','$timeout',
    function ($scope, ValidationLogService, TransportLogService,$rootScope,$timeout) {

      $scope.numberOfValidationLogs = 0;
      $scope.numberOfTransportLogs = 0;
      $scope.error = null;
      $scope.loadingAll = false;
      $scope.loadingOne = false;

      $scope.currentDate = new Date();

      $scope.selectedType = null;

      $scope.initLogs = function () {
        $scope.loadingAll = true;
        $scope.numberOfValidationLogs = 0;
        $timeout(function() {
            ValidationLogService.getTotalCount($rootScope.domain.domain).then(function (numberOfValidationLogs) {
                $scope.numberOfValidationLogs = numberOfValidationLogs;
                $scope.loadingAll = false;
            }, function (error) {
                $scope.loadingAll = false;
                $scope.error = "Sorry, Cannot load the logs. Please try again. \n DEBUG:" + error;
            });
            $scope.numberOfTransportLogs = 0;
            TransportLogService.getTotalCount($rootScope.domain.domain).then(function (numberOfTransportLogs) {
                $scope.numberOfTransportLogs = numberOfTransportLogs;
                $scope.loadingAll = false;
            }, function (error) {
                $scope.loadingAll = false;
                $scope.error = "Sorry, Cannot load the logs. Please try again. \n DEBUG:" + error;
            });
        }, 1000);


        $rootScope.$on('logs:decreaseValidationCount', function (event) {
          $scope.numberOfValidationLogs -=1;
        });

        $rootScope.$on('logs:decreaseTransportCount', function (event) {
          $scope.numberOfTransportLogs -=1;
        });




      };

      $scope.selectType = function (type) {
        $scope.selectedType = type;
      };

    }
  ]);


angular.module('logs')
  .controller('ValidationLogCtrl', ['$scope', 'ValidationLogService', 'Notification', '$modal','$rootScope','$timeout',
    function ($scope, ValidationLogService, Notification, $modal,$rootScope,$timeout) {

      $scope.logs = null;
      $scope.tmpLogs = null;
      $scope.logDetails = null;
      $scope.error = null;
      $scope.loadingAll = false;
      $scope.loadingOne = false;

      $scope.allLogs = null;
      $scope.contextType = "*";
      $scope.userType = "*";
      $scope.resultType = "*";


      $scope.initValidationLogs = function () {
          $scope.loadingAll = true;
          $timeout(function() {
              ValidationLogService.getAll($rootScope.domain.domain).then(function (logs) {
                  $scope.allLogs = logs;
                  $scope.contextType = "*";
                  $scope.userType = "*";
                  $scope.resultType = "*";
                  $scope.filterBy();
                  $scope.loadingAll = false;
              }, function (error) {
                  $scope.loadingAll = false;
                  $scope.error = "Sorry, Cannot load the logs. Please try again. \n DEBUG:" + error;
              });
          },1000);
      };

      $scope.openLogDetails = function (validationLogItem) {
        var modalInstance = $modal.open({
          templateUrl: 'ValidationLogDetails.html',
          controller: 'ValidationLogDetailsCtrl',
          windowClass: 'valueset-modal',
          animation: false,
          keyboard: true,
          backdrop: true,
          resolve: {
            validationLogItem: function () {
              return validationLogItem;
            }
          }
        });
      };

      $scope.filterBy = function () {
        $scope.logs = $scope.filterByResultType($scope.filterByUserType($scope.filterByContextType($scope.allLogs)));
        $scope.tmpLogs = [].concat($scope.logs);
      };


      $scope.filterByContextType = function (inputLogs) {
        return _.filter(inputLogs, function (log) {
          return ($scope.contextType === "*" ) || ($scope.contextType === log.testingStage);
        });
      };

      $scope.filterByUserType = function (inputLogs) {
        return _.filter(inputLogs, function (log) {
          return ($scope.userType === "*" ) || ($scope.userType === "AUTH" && log.userFullname.indexOf("Guest-") === -1) || ($scope.userType === "NOT_AUTH" && log.userFullname.indexOf("Guest-") !== -1)
        });
      };

      $scope.filterByResultType = function (inputLogs) {
        return _.filter(inputLogs, function (log) {
          return ($scope.resultType === "*" ) || ($scope.resultType === "SUCCESS" && log.validationResult) || ($scope.resultType === "FAILED" && !log.validationResult)
        });
      };

      $scope.deleteLog = function(log){
        ValidationLogService.deleteLog(log.id).then(function (result) {
          $rootScope.$emit('logs:decreaseValidationCount');
          var index = $scope.logs.indexOf(log);
          if(index > -1){
            $scope.logs.splice(index, 1);
          }
        }, function (error) {
          $scope.error = "Sorry, Cannot delete the log. Please try again. \n DEBUG:" + error;
        });
      };


    }
  ]);


angular.module('logs')
  .controller('TransportLogCtrl', ['$scope', 'TransportLogService', 'Notification', '$modal','$rootScope','$timeout',
    function ($scope, TransportLogService, Notification, $modal,$rootScope,$timeout) {

      $scope.logs = null;
      $scope.tmpLogs = null;
      $scope.logDetails = null;
      $scope.error = null;
      $scope.loadingAll = false;
      $scope.loadingOne = false;

      $scope.allLogs = null;
      $scope.selected = {};
      $scope.selected.transportType = "*";
      $scope.selected.protocol = "*";
      $scope.userType = "*";
      $scope.transportTypes = [];
      $scope.protocols = [];

      $scope.initTransportLogs = function () {
          $scope.loadingAll = true;
          $timeout(function() {
              TransportLogService.getAll($rootScope.domain.domain).then(function (logs) {
                  $scope.allLogs = logs;
                  $scope.selected.transportType = "*";
                  $scope.selected.protocol = "*";
                  $scope.userType = "*";
                  $scope.protocols = _(logs).chain().flatten().pluck('protocol').unique().value();
                  $scope.transportTypes = _(logs).chain().flatten().pluck('testingType').unique().value();
                  $scope.filterBy();
                  $scope.loadingAll = false;
              }, function (error) {
                  $scope.loadingAll = false;
                  $scope.error = "Sorry, Cannot load the logs. Please try again. \n DEBUG:" + error;
              });
          },1000);
      };

      $scope.openLogDetails = function (transportLogItem) {
        var modalInstance = $modal.open({
          templateUrl: 'TransportLogDetails.html',
          controller: 'TransportLogDetailsCtrl',
          windowClass: 'valueset-modal',
          animation: false,
          keyboard: true,
          backdrop: true,
          resolve: {
            transportLogItem: function () {
              return transportLogItem;
            }
          }
        });
      };



      $scope.filterBy = function () {
        $scope.logs = $scope.filterByProtocol($scope.filterByTransportType($scope.filterByUserType($scope.allLogs)));
        $scope.tmpLogs = [].concat($scope.logs);
      };

      $scope.filterByUserType = function (inputLogs) {
        return _.filter(inputLogs, function (log) {
          return ($scope.userType === "*" ) || ($scope.userType === "AUTH" && log.userFullname.indexOf("Guest-") === -1) || ($scope.userType === "NOT_AUTH" && log.userFullname.indexOf("Guest-") !== -1)
        });
      };


      $scope.filterByProtocol= function (inputLogs) {
        return _.filter(inputLogs, function (log) {
          return ($scope.selected.protocol === "*" ) || ($scope.selected.protocol === log.protocol);
        });
      };

      $scope.filterByTransportType = function (inputLogs) {
        return _.filter(inputLogs, function (log) {
          return ($scope.selected.transportType === "*" ) || ($scope.selected.transportType === log.testingType);
        });
      };


      $scope.getTransportTypeIcon = function (connType) {
        return connType === 'TA_MANUAL' || connType === 'SUT_MANUAL' ? 'fa fa-wrench' : connType === 'SUT_RESPONDER' || connType === 'SUT_INITIATOR' ? 'fa fa-arrow-right' : connType === 'TA_RESPONDER' || connType === 'TA_INITIATOR' ? 'fa fa-arrow-left' : 'fa fa-check-square-o';
      };

      $scope.deleteLog = function(log){
        TransportLogService.deleteLog(log.id).then(function (result) {
          $rootScope.$emit('logs:decreaseTransportCount');
          var index = $scope.logs.indexOf(log);
          if(index > -1){
            $scope.logs.splice(index, 1);
          }
        }, function (error) {
          $scope.error = "Sorry, Cannot delete the log. Please try again. \n DEBUG:" + error;
        });
      };

    }
  ]);


angular.module('logs').controller('TransportLogDetailsCtrl', function ($scope, $modalInstance, transportLogItem) {
  $scope.transportLogItem = transportLogItem;

  $scope.close = function () {
    $modalInstance.dismiss('cancel');
  };

});


angular.module('logs').controller('ValidationLogDetailsCtrl', function ($scope, $modalInstance, validationLogItem) {
  $scope.validationLogItem = validationLogItem;
  $scope.segmentErrors = [];
  Object.keys($scope.validationLogItem.errorCountInSegment).forEach(function (segment) {
    $scope.segmentErrors.push({"segment": segment, "errorCount": $scope.validationLogItem.errorCountInSegment[segment]})
  });

  $scope.tmpSegmentErrors = [].concat($scope.segmentErrors);


  $scope.close = function () {
    $modalInstance.dismiss('cancel');
  };

});


