angular.module('domains')
  .controller('DomainsCtrl', function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, userInfoService,StorageService,DomainsManager,$modal) {
    $scope.status = {userDoc: true};
    $scope.selectedDomain =  {id:null};
    $scope.selectedScope = {key: 'USER'};
    $scope.domainsScopes = [];
    $scope.allDomainsScopes = [{key: 'USER', name: 'Private'}, {
      key: 'GLOBAL',
      name: 'Public'
    }];

    $scope.userDomains = null;
    $scope.userDomain = null;

    $scope.alertMessage = null;

    $scope.initDomains = function () {
      if ($rootScope.isDomainsManagementSupported() && userInfoService.isAuthenticated()) {
        if (userInfoService.isAdmin() || userInfoService.isSupervisor()) {
          $scope.domainsScopes = $scope.allDomainsScopes;
        } else {
          $scope.domainsScopes = [$scope.allDomainsScopes[1]];
        }
      }else{
        $scope.domainsScopes = [$scope.allDomainsScopes[1]];
      }
      $scope.selectedScope.key = $scope.domainsScopes[0].key;
      $scope.selectScope();
    };


    $scope.selectScope = function () {
      $scope.error = null;
      if ($scope.selectedScope.key && $scope.selectedScope.key !== null && $scope.selectedScope.key !== "") {
        StorageService.set(StorageService.DOMAIN_MANAGE_SELECTED_SCOPE_KEY, $scope.selectedScope.key);
        $scope.loading = true;
        DomainsManager.getDomainsByScope($scope.selectedScope.key).then(function(userDomains){
          $scope.error = null;
          $scope.loading = false;
          $scope.userDomains = $filter('orderBy')(userDomains, 'position');
          var targetId = null;
          if ($scope.userDomains.length > 0) {
            if ($scope.userDomains.length === 1) {
              targetId = $scope.userDomains[0].id;
            }

            if (targetId == null) {
              var previousTpId = StorageService.get(StorageService.DOMAIN_MANAGE_SELECTED_KEY);
              targetId = previousTpId == undefined || previousTpId == null ? "" : previousTpId;
            }

            if(targetId != null) {
              $scope.selectedDomain.id = targetId.toString();
              $scope.selectDomain();
            }
          }
        }, function(error){
            $scope.loading = false;
            $scope.setErrorAlert( "Sorry, Cannot load the domains. Please try again");
        });
      }
    };

    $scope.selectDomain = function () {
      $scope.errorDomain = null;
      $scope.userDomain = null;
      if ($scope.selectedDomain.id && $scope.selectedDomain.id !== null && $scope.selectedDomain.id !== "") {
        $scope.loadingDomain = true;
        StorageService.set(StorageService.DOMAIN_MANAGE_SELECTED_ID, $scope.selectedDomain.id);
        DomainsManager.getDomainById($scope.selectedDomain.id).then(function (userDomain) {
          $scope.userDomain = userDomain;
          $scope.originalUserDomain = angular.copy(userDomain);
          $scope.loadingDomain = false;
        }, function (error) {
          $scope.loadingDomain = false;
          $scope.setErrorAlert( "Sorry, Cannot load the domains. Please try again");
        });
      }
    };

    $scope.setErrorAlert = function (message) {
      $scope.alertMessage = {};
      $scope.alertMessage.type = "danger";
      $scope.alertMessage.message = message;
    };

    $scope.setInfoAlert = function (message) {
      $scope.alertMessage = {};
      $scope.alertMessage.type = "info";
      $scope.alertMessage.message = message;
    };


    $scope.setSuccessAlert = function (message) {
      $scope.alertMessage = {};
      $scope.alertMessage.type = "success";
      $scope.alertMessage.message = message;
    };



    $scope.deleteDomain = function () {
      var modalInstance = $modal.open({
        templateUrl: 'views/domains/confirm-delete.html',
        controller: 'ConfirmDialogCtrl',
        size: 'md',
        backdrop: 'static',
        keyboard: false
      });
      modalInstance.result.then(
        function (result) {
          if (result) {
            DomainsManager.delete($scope.userDomain.id).then(function (response) {
              $scope.userDomain = null;
              $scope.originalUserDomain = null;
              $scope.loadingDomain = false;
              $scope.setSuccessAlert("Domain deleted successfully!");
            }, function (error) {
              $scope.loadingDomain = false;
              $scope.errorDomain = error;
              $scope.setErrorAlert(error);
            });
          }
        });
    };


    $scope.saveDomain = function () {
      DomainsManager.save($scope.userDomain).then(function (result) {
        $scope.userDomain = result;
        $scope.originalUserDomain = angular.copy(result);
        $scope.loadingDomain = false;
        $scope.setSuccessAlert("Domain saved successfully!");

      }, function (error) {
        $scope.loadingDomain = false;
        $scope.setErrorAlert(error);

      });
    };

    $scope.resetDomain = function () {
      var modalInstance = $modal.open({
        templateUrl: 'views/domains/confirm-reset.html',
        controller: 'ConfirmDialogCtrl',
        size: 'md',
        backdrop: 'static',
        keyboard: false
      });
      modalInstance.result.then(
        function (result) {
          if (result) {
            $scope.userDomain = $scope.originalUserDomain;
            $scope.originalUserDomain = angular.copy($scope.userDomain);
            $scope.setSuccessAlert("Domain reset successfully!");
          }
        });

    };


    $scope.publishDomain = function () {
      var modalInstance = $modal.open({
        templateUrl: 'views/domains/confirm-reset.html',
        controller: 'ConfirmDialogCtrl',
        size: 'md',
        backdrop: 'static',
        keyboard: false
      });
      modalInstance.result.then(
        function (result) {
          if (result) {
            DomainsManager.publish($scope.userDomain).then(function (result) {
              $scope.userDomain = result;
              $scope.originalUserDomain = angular.copy(result);
              $scope.selectedScope.key = $scope.domainsScopes[1].key;
              $scope.loadingDomain = false;
              $scope.setSuccessAlert("Domain published successfully!");
            }, function (error) {
              $scope.loadingDomain = false;
              $scope.setErrorAlert(error);

            });
          }
        });
    };


    $scope.createDomain = function () {
      var modalInstance = $modal.open({
        templateUrl: 'views/domains/create.html',
        controller: 'CreateDomainCtrl',
        size: 'md',
        backdrop: 'static',
        keyboard: false,
        backdropClick: false,
        resolve: {
          scope: function () {
               return $scope.selectedScope.key
           }
        }
      });
      modalInstance.result.then(
        function (newDomain) {
          if (newDomain) {
            StorageService.set(StorageService.DOMAIN_MANAGE_SELECTED_ID, newDomain.id);
            $scope.userDomains.push(newDomain);
            $scope.userDomain = newDomain;
            $scope.originalUserDomain = angular.copy(newDomain);
            $scope.selectedDomain.id = newDomain.id;
          }
        });
    };

    $scope.loadDefaultHomeContent = function(){
      DomainsManager.getDefaultHomeContent().then(function (result) {
        $scope.userDomain.homeContent = result;
      }, function (error) {
        $scope.loadingDomain = false;
        $scope.setErrorAlert(error);
      });
    };

    $scope.loadDefaultProfileInfo = function(){
      DomainsManager.getDefaultProfileInfo().then(function (result) {
        $scope.userDomain.profileInfo = result;
      }, function (error) {
        $scope.setErrorAlert(error);
      });
    };

    $scope.loadDefaultValueSetCopyright = function(){
      DomainsManager.getDefaultValueSetCopyright().then(function (result) {
        $scope.userDomain.valueSetCopyright = result;
      }, function (error) {
        $scope.setErrorAlert(error);
      });
    };



    $scope.loadDefaultMessageContent = function(){
      DomainsManager.getDefaultMessageContent().then(function (result) {
        $scope.userDomain.messageContent = result;
      }, function (error) {
        $scope.setErrorAlert(error);
      });
    };


    $scope.loadDefaultValidationResultInfo = function(){
      DomainsManager.getDefaultValidationResultInfo().then(function (result) {
        $scope.userDomain.validationResultInfo = result;
      }, function (error) {
        $scope.setErrorAlert(error);
      });
    };













  });


angular.module('domains').controller('CreateDomainCtrl', function ($scope, $modalInstance, scope,DomainsManager) {

  $scope.newDomain = {name: null};
  $scope.error = null;
  $scope.loading = false;

  $scope.submit = function () {
    if($scope.newDomain.name != null && $scope.newDomain.name != "" && $scope.newDomain.key != null && $scope.newDomain.key != "") {
      $scope.error = null;
      $scope.loading = true;
      DomainsManager.create($scope.newDomain.name, $scope.newDomain.key, scope).then(function (result) {
        $scope.loading = false;
        $modalInstance.close(result);
      }, function (error) {
        $scope.loading = false;
        $scope.error = error;
      });
    }
  };
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});
