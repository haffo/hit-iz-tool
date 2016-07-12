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


