angular.module('domains')
  .controller('DomainsCtrl', function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, userInfoService, StorageService, DomainsManager, $modal, $location) {
    $scope.status = {userDoc: true};
    $scope.selectedDomain = {id: null};
    $scope.userDomains = null;
    $scope.userDomain = null;
    $scope.alertMessage = null;
    $scope.loading = false;
    $scope.loadingDomain = false;
    $scope.loadingAction = false;

    $scope.initDomain = function () {
      $scope.loadingDomain = true;
      $scope.errorDomain = null;
      $scope.originalUserDomain = null;
      $scope.userDomain = null;
      $timeout(function () {
        if ($rootScope.isDomainsManagementSupported() && userInfoService.isAuthenticated()) {
          if ($rootScope.domain != null && $rootScope.hasWriteAccess()) {
            $scope.userDomain = null;
            $scope.errorDomain = null;
            $scope.userDomain = angular.copy($rootScope.domain);
            $scope.originalUserDomain = angular.copy($scope.userDomain);
            $scope.loadingDomain = false;
          } else {
            $scope.loadingDomain = false;
          }
        } else {
          $scope.loadingDomain = false;
        }
      }, 3000);
    };


    // $scope.selectScope = function () {
    //   $scope.error = null;
    //   if ($scope.selectedScope.key && $scope.selectedScope.key !== null && $scope.selectedScope.key !== "") {
    //     StorageService.set(StorageService.DOMAIN_MANAGE_SELECTED_SCOPE_KEY, $scope.selectedScope.key);
    //     $scope.loading = true;
    //     DomainsManager.getDomainsByScope($scope.selectedScope.key).then(function(userDomains){
    //       $scope.error = null;
    //       $scope.loading = false;
    //       $scope.userDomains = $filter('orderBy')(userDomains, 'position');
    //       var targetId = null;
    //       if ($scope.userDomains.length > 0) {
    //         if ($scope.userDomains.length === 1) {
    //           targetId = $scope.userDomains[0].id;
    //         }
    //
    //         if (targetId == null) {
    //           var previousTpId = StorageService.get(StorageService.DOMAIN_MANAGE_SELECTED_KEY);
    //           targetId = previousTpId == undefined || previousTpId == null ? "" : previousTpId;
    //         }
    //
    //         if(targetId != null) {
    //           $scope.selectedDomain.id = targetId.toString();
    //           $scope.selectDomain();
    //         }
    //       }
    //     }, function(error){
    //         $scope.loading = false;
    //         $scope.setErrorAlert( "Sorry, Cannot load the domains. Please try again");
    //     });
    //   }
    // };


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
              $scope.loadingAction = false;
              $scope.setSuccessAlert("Tool scope deleted successfully!");
              $rootScope.domain = null;
              $rootScope.reloadPage();
            }, function (error) {
              $scope.loadingAction = false;
              $scope.setErrorAlert(error);
            });
          }
        });
    };


    $scope.saveDomain = function () {
      $scope.loadingAction = true;
      DomainsManager.save($scope.userDomain).then(function (result) {
        $scope.userDomain = result;
        $scope.originalUserDomain = angular.copy(result);
        $scope.loadingAction = false;
        $scope.setSuccessAlert("Tool scope saved successfully!");
        $rootScope.domain = angular.copy(result);
        $rootScope.reloadPage();
      }, function (error) {
        $scope.loadingAction = false;
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
            $scope.setSuccessAlert("Tool scope reset successfully!");
          }
        });

    };


    $scope.publishDomain = function () {
      if($rootScope.canPublish()) {
        var modalInstance = $modal.open({
          templateUrl: 'views/domains/confirm-publish.html',
          controller: 'ConfirmDialogCtrl',
          size: 'md',
          backdrop: 'static',
          keyboard: false
        });
        modalInstance.result.then(
          function (result) {
            if (result) {
              $scope.loadingAction = true;
              DomainsManager.publish($scope.userDomain).then(function (result) {
                $scope.userDomain = result;
                $scope.originalUserDomain = angular.copy(result);
                $scope.loadingAction = false;
                $scope.setSuccessAlert("Your  tool scope is now public. Please note only public test plans will be visible to users!");
                $rootScope.domain = angular.copy(result);
                $rootScope.reloadPage();
              }, function (error) {
                $scope.loadingAction = false;
                $scope.setErrorAlert(error);

              });
            }
          });
      }
    };


    // $scope.createDomain = function () {
    //   var modalInstance = $modal.open({
    //     templateUrl: 'views/domains/create.html',
    //     controller: 'CreateDomainCtrl',
    //     size: 'md',
    //     backdrop: 'static',
    //     keyboard: false,
    //     backdropClick: false,
    //     resolve: {
    //       scope: function () {
    //         return 'USER'
    //       }
    //     }
    //   });
    //   modalInstance.result.then(
    //     function (newDomain) {
    //       if (newDomain) {
    //         $rootScope.selectDomain(newDomain.domain);
    //       }
    //     });
    // };

    $scope.loadDefaultHomeContent = function () {
      DomainsManager.getDefaultHomeContent().then(function (result) {
        $scope.userDomain.homeContent = result;
      }, function (error) {
        $scope.loadingAction = false;
        $scope.setErrorAlert(error);
      });
    };

    $scope.loadDefaultProfileInfo = function () {
      DomainsManager.getDefaultProfileInfo().then(function (result) {
        $scope.userDomain.profileInfo = result;
      }, function (error) {
        $scope.setErrorAlert(error);
      });
    };

    $scope.loadDefaultValueSetCopyright = function () {
      DomainsManager.getDefaultValueSetCopyright().then(function (result) {
        $scope.userDomain.valueSetCopyright = result;
      }, function (error) {
        $scope.setErrorAlert(error);
      });
    };


    $scope.loadDefaultMessageContent = function () {
      DomainsManager.getDefaultMessageContent().then(function (result) {
        $scope.userDomain.messageContent = result;
      }, function (error) {
        $scope.setErrorAlert(error);
      });
    };


    $scope.loadDefaultValidationResultInfo = function () {
      DomainsManager.getDefaultValidationResultInfo().then(function (result) {
        $scope.userDomain.validationResultInfo = result;
      }, function (error) {
        $scope.setErrorAlert(error);
      });
    };


  });


angular.module('domains').controller('CreateDomainCtrl', function ($scope, $modalInstance, scope, DomainsManager) {

  $scope.newDomain = {name: null, domain: null, homeTitle:null};
  $scope.error = null;
  $scope.loading = false;

  $scope.submit = function () {
    if ($scope.newDomain.name != null && $scope.newDomain.name != ""  && $scope.newDomain.homeTitle != null && $scope.newDomain.homeTitle != "" && $scope.newDomain.name.toLowerCase() != "app") {
      $scope.error = null;
      $scope.loading = true;
      $scope.newDomain.domain = $scope.newDomain.name.replace(/\s+/g, '-').toLowerCase();
      DomainsManager.create($scope.newDomain.name, $scope.newDomain.domain, scope,$scope.newDomain.homeTitle).then(function (result) {
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
