'use strict';

angular.module('tool')
  .controller('ContactCtrl',['$scope', 'ContactLoader', 'ContactListLoader', function ($scope, ContactLoader, ContactListLoader) {
        $scope.init = function(){
             var promise = new ContactListLoader();
             promise.then(function(contacts) {
                $scope.contacts = contacts;
             }, function(error){
                $scope.error = error;
             });
              return promise;
        };

 }]);
