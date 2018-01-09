'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the clientApp
 */
angular.module('main')
    .controller('MainService', function ($scope) {
    });


angular.module('main').factory('TestingSettings',
    ['$rootScope', function ($rootScope) {
        var service = {
            activeTab:0,
            getActiveTab: function(){
                return service.activeTab;
            },
            setActiveTab: function(value){
                service.activeTab = value;
                service.save();
            },
            save: function () {
                sessionStorage.TestingActiveTab = service.activeTab;
            },
            restore: function () {
                service.activeTab = sessionStorage.TestingActiveTab != null && sessionStorage.TestingActiveTab != "" ? parseInt(sessionStorage.TestingActiveTab):0;
            }
        };
//        $rootScope.$on("TestingSettings:save", service.save);
//        $rootScope.$on("TestingSettings:restore", service.restore);
        return service;
    }]
);


angular.module('main').service('modalService', ['$modal',	function ($modal) {

  var modalDefaults = {
    backdrop: true,
    keyboard: true,
    modalFade: true,
    templateUrl: 'views/modal.html'
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



