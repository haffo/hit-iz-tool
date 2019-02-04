angular.module('domains')
    .controller('DomainsCtrl', function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, userInfoService, StorageService, DomainsManager, $modal, $location,$window) {
        $scope.status = {userDoc: true};
        $scope.selectedDomain = {id: null};
        $scope.userDomains = null;
        $scope.userDomain = null;
        $scope.alertMessage = null;
        $scope.loading = false;
        $scope.loadingDomain = false;
        $scope.loadingAction = false;
        $scope.loadingDomains = false;
        $scope.domainsErrors = null;

        $scope.hasDomainAccess = function (domain) {
            return userInfoService.isAuthenticated() && (userInfoService.isAdmin() || (domain != null && domain.owner === userInfoService.getUsername()));
        };


        $scope.initDomain = function () {
            $scope.loadDomains();
        };

        $scope.viewDomain = function (domain, waitingTime) {
            waitingTime = waitingTime == undefined ? 3000: waitingTime;
            $scope.loadingDomain = true;
            $scope.errorDomain = null;
            $scope.originalUserDomain = null;
            $scope.userDomain = null;
            $timeout(function () {
                if ($rootScope.isDomainsManagementSupported() && userInfoService.isAuthenticated()) {
                    if (domain != null && $scope.hasDomainAccess(domain)) {
                        $scope.userDomain = null;
                        $scope.errorDomain = null;
                        $scope.userDomain = angular.copy(domain);
                        $scope.originalUserDomain = angular.copy($scope.userDomain);
                        $scope.loadingDomain = false;
                    } else {
                        $scope.loadingDomain = false;
                    }
                } else {
                    $scope.loadingDomain = false;
                }
            }, waitingTime);
        };

        $scope.openDomain = function (domain) {
            var url = $window.location.protocol + "//" + $window.location.host + $window.location.pathname + "#/home?d="+ domain.domain;
            $window.open(url, "open_toolscope_page",'_blank');
        };

        $scope.displayScope = function(scope){
          return scope === 'GLOBAL' ? 'Public': 'USER' ? 'Private': 'Unknown';
        };

        $scope.loadDomains = function () {
            $scope.userDomains = null;
            $scope.loadingDomains = true;
            $scope.domainsError = null;
            DomainsManager.findByUserAndRole().then(function (domains) {
                $scope.userDomains = domains;
                $scope.userDomains = $filter('orderBy')($scope.userDomains, 'position');
                $scope.loadingDomains = false;
                if ($scope.userDomains != null && $scope.userDomains.length > 0) {
                    var dom = null;
                    if ($scope.userDomains.length === 1) {
                        dom = $scope.userDomains[0];
                    } else {
                        for (var i = 0; i < $scope.userDomains.length; i++) {
                            if ($scope.userDomains[i].domain === $rootScope.domain.domain) {
                                dom = $scope.userDomains[i];
                                break;
                            }
                        }
                    }
                    if(dom != null){
                        $scope.viewDomain(dom);
                    }
                }
            }, function(error){
                $scope.loadingDomains = false;
                $scope.domainsError = error;
            });
        };

        $scope.closeAlert = function(){
            $scope.alertMessage = null;
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
                            $scope.setErrorAlert(error.text);
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
                $scope.setErrorAlert(error.text);

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


        $scope.saveAndPublishDomain = function () {
            if ($rootScope.canPublish()) {
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
                            DomainsManager.saveAndPublish($scope.userDomain).then(function (result) {
                                $scope.userDomain = result;
                                $scope.originalUserDomain = angular.copy(result);
                                $scope.loadingAction = false;
                                $scope.setSuccessAlert("Tool scope " + $scope.userDomain.name  + " is now public. Please note only public test plans will be visible to users!");
                                if($scope.userDomain.domain === $rootScope.domain.domain) {
                                    $rootScope.domain = angular.copy(result);
                                    $rootScope.reloadPage();
                                }
                            }, function (error) {
                                $scope.loadingAction = false;
                                $scope.setErrorAlert(error.text);

                            });
                        }
                    });
            }
        };

        $scope.publishDomain = function (dom) {
            if ($rootScope.canPublish()) {
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
                            DomainsManager.publish(dom.id).then(function (result) {
                                $scope.setSuccessAlert("Tool scope " + dom.name  + " is now public. Please note only public test plans will be visible to users!");
                                if(dom.domain === $rootScope.domain.domain) {
                                    $rootScope.domain = angular.copy(result);
                                    $rootScope.reloadPage();
                                }
                            }, function (error) {
                                $scope.setErrorAlert(error.text);
                            });
                        }
                    });
            }
        };

        $scope.unpublishDomain = function (dom) {
            if ($rootScope.canPublish()) {
                var modalInstance = $modal.open({
                    templateUrl: 'views/domains/confirm-unpublish.html',
                    controller: 'ConfirmDialogCtrl',
                    size: 'md',
                    backdrop: 'static',
                    keyboard: false
                });
                modalInstance.result.then(
                    function (result) {
                        if (result) {
                            DomainsManager.unpublish(dom.id).then(function (result) {
                                $scope.setSuccessAlert("Tool scope " + dom.name  + " is now private!");
                                if(dom.domain === $rootScope.domain.domain) {
                                    $rootScope.domain = angular.copy(result);
                                    $rootScope.reloadPage();
                                }
                            }, function (error) {
                                $scope.setErrorAlert(error.text);
                            });
                        }
                    });
            }
        };





        $scope.saveAndUnpublishDomain = function () {
            if ($rootScope.canPublish()) {
                var modalInstance = $modal.open({
                    templateUrl: 'views/domains/confirm-unpublish.html',
                    controller: 'ConfirmDialogCtrl',
                    size: 'md',
                    backdrop: 'static',
                    keyboard: false
                });
                modalInstance.result.then(
                    function (result) {
                        if (result) {
                            $scope.loadingAction = true;
                            DomainsManager.saveAndUnpublish($scope.userDomain).then(function (result) {
                                $scope.userDomain = result;
                                $scope.originalUserDomain = angular.copy(result);
                                $scope.loadingAction = false;
                                $scope.setSuccessAlert("Tool scope " + $scope.userDomain.name  + " is now private. Please note only you can access the tool scope!");
                                if($scope.userDomain.domain === $rootScope.domain.domain) {
                                    $rootScope.domain = angular.copy(result);
                                    $rootScope.reloadPage();
                                }
                            }, function (error) {
                                $scope.loadingAction = false;
                                $scope.setErrorAlert(error.text);

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

    $scope.newDomain = {name: null, domain: null, homeTitle: null};
    $scope.error = null;
    $scope.loading = false;

    $scope.submit = function () {
        if ($scope.newDomain.name != null && $scope.newDomain.name != "" && $scope.newDomain.homeTitle != null && $scope.newDomain.homeTitle != "" && $scope.newDomain.name.toLowerCase() != "app") {
            $scope.error = null;
            $scope.loading = true;
            $scope.newDomain.domain = $scope.newDomain.name.replace(/\s+/g, '-').toLowerCase();
            DomainsManager.create($scope.newDomain.name, $scope.newDomain.domain, scope, $scope.newDomain.homeTitle).then(function (result) {
                $scope.loading = false;
                $modalInstance.close(result);
            }, function (error) {
                $scope.loading = false;
                $scope.error = error.text;
            });
        }
    };
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});
