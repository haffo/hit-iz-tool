'use strict';

/* "newcap": false */

angular.module('account')
    .controller('UserProfileCtrl', ['$scope', '$resource', 'AccountLoader', 'Account', 'userInfoService', '$location','Transport','Notification',
        function ($scope, $resource, AccountLoader, Account, userInfoService, $location,Transport,Notification) {
            var PasswordChange = $resource('api/accounts/:id/passwordchange', {id:'@id'});

            $scope.accountpwd = {};

            $scope.initModel = function(data) {
                $scope.account = data;
                $scope.accountOrig = angular.copy($scope.account);
            };

            $scope.updateAccount = function() {
                //not sure it is very clean...
                //TODO: Add call back?
                new Account($scope.account).$save().then(function(){
                }, function(error){
                    Notification.error({message: error.data, templateUrl: "NotificationErrorTemplate.html", scope: $scope, delay: 50000});
                });

                $scope.accountOrig = angular.copy($scope.account);
            };

            $scope.resetForm = function() {
                $scope.account = angular.copy($scope.accountOrig);
            };

            //TODO: Change that: formData is only supported on modern browsers
            $scope.isUnchanged = function(formData) {
                return angular.equals(formData, $scope.accountOrig);
            };


            $scope.changePassword = function() {
                var user = new PasswordChange();
                user.username = $scope.account.username;
                user.password = $scope.accountpwd.currentPassword;
                user.newPassword = $scope.accountpwd.newPassword;
                user.id = $scope.account.id;
                //TODO: Check return value???
                user.$save().then(function(result){
                    $scope.msg = angular.fromJson(result);
                }, function(error){
                    Notification.error({message: error.data, templateUrl: "NotificationErrorTemplate.html", scope: $scope, delay: 50000});
                });
            };

            $scope.deleteAccount = function () {
                var tmpAcct = new Account();
                tmpAcct.id = $scope.account.id;

                tmpAcct.$remove(function() {
                    //console.log("Account removed");
                    //TODO: Add a real check?
                    userInfoService.setCurrentUser(null);
                    $scope.$emit('event:logoutRequest');
                    $location.url('/home');
                },function(error){
                    Notification.error({message: error.data, templateUrl: "NotificationErrorTemplate.html", scope: $scope, delay: 50000});
                });
            };

            /*jshint newcap:false */
            AccountLoader(userInfoService.getAccountID()).then(
                function(data) {
                    $scope.initModel(data);
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                },
                function(error) {
//                console.log('Error fetching account information');
                    Notification.error({message: error.data, templateUrl: "NotificationErrorTemplate.html", scope: $scope, delay: 50000});
                }
            );
        }
    ]);


angular.module('account')
    .controller('UserAccountCtrl', ['$scope', '$resource', 'AccountLoader', 'Account', 'userInfoService', '$location', '$rootScope',
        function ($scope, $resource, AccountLoader, Account, userInfoService, $location,$rootScope) {


            $scope.accordi = { account : true, accounts:false};
            $scope.setSubActive = function (id) {
                if(id && id != null) {
                    $rootScope.setSubActive(id);
                    $('.accountMgt').hide();
                    $('#' + id).show();
                }
            };
            $scope.initAccount = function(){
                if($rootScope.subActivePath == null){
                    $rootScope.subActivePath = "account";
                }
                $scope.setSubActive($rootScope.subActivePath);
            };


        }
    ]);



angular.module('account').directive('stDateRange', ['$timeout', function ($timeout) {
  return {
    restrict: 'E',
    require: '^stTable',
    scope: {
      before: '=',
      after: '='
    },
    templateUrl: 'stDateRange.html',

    link: function (scope, element, attr, table) {

      var inputs = element.find('input');
      var inputBefore = angular.element(inputs[0]);
      var inputAfter = angular.element(inputs[1]);
      var predicateName = attr.predicate;


      [inputBefore, inputAfter].forEach(function (input) {

        input.bind('blur', function () {


          var query = {};

          if (!scope.isBeforeOpen && !scope.isAfterOpen) {

            if (scope.before) {
              query.before = scope.before;
            }

            if (scope.after) {
              query.after = scope.after;
            }

            scope.$apply(function () {
              table.search(query, predicateName);
            })
          }
        });
      });

      function open(before) {
        return function ($event) {
          $event.preventDefault();
          $event.stopPropagation();

          if (before) {
            scope.isBeforeOpen = true;
          } else {
            scope.isAfterOpen = true;
          }
        }
      }

      scope.openBefore = open(true);
      scope.openAfter = open();
    }
  }
}]).directive('stNumberRange', ['$timeout', function ($timeout) {
  return {
    restrict: 'E',
    require: '^stTable',
    scope: {
      lower: '=',
      higher: '='
    },
    templateUrl: 'stNumberRange.html',
    link: function (scope, element, attr, table) {
      var inputs = element.find('input');
      var inputLower = angular.element(inputs[0]);
      var inputHigher = angular.element(inputs[1]);
      var predicateName = attr.predicate;

      [inputLower, inputHigher].forEach(function (input, index) {

        input.bind('blur', function () {
          var query = {};

          if (scope.lower) {
            query.lower = scope.lower;
          }

          if (scope.higher) {
            query.higher = scope.higher;
          }

          scope.$apply(function () {
            table.search(query, predicateName)
          });
        });
      });
    }
  };
}]).filter('customFilter', ['$filter', function ($filter) {
  var filterFilter = $filter('filter');
  var standardComparator = function standardComparator(obj, text) {
    text = ('' + text).toLowerCase();
    return ('' + obj).toLowerCase().indexOf(text) > -1;
  };

  return function customFilter(array, expression) {
    function customComparator(actual, expected) {

      var isBeforeActivated = expected.before;
      var isAfterActivated = expected.after;
      var isLower = expected.lower;
      var isHigher = expected.higher;
      var higherLimit;
      var lowerLimit;
      var itemDate;
      var queryDate;


      if (angular.isObject(expected)) {

        //date range
        if (expected.before || expected.after) {
          try {
            if (isBeforeActivated) {
              higherLimit = expected.before;

              itemDate = new Date(actual);
              queryDate = new Date(higherLimit);

              if (itemDate > queryDate) {
                return false;
              }
            }

            if (isAfterActivated) {
              lowerLimit = expected.after;


              itemDate = new Date(actual);
              queryDate = new Date(lowerLimit);

              if (itemDate < queryDate) {
                return false;
              }
            }

            return true;
          } catch (e) {
            return false;
          }

        } else if (isLower || isHigher) {
          //number range
          if (isLower) {
            higherLimit = expected.lower;

            if (actual > higherLimit) {
              return false;
            }
          }

          if (isHigher) {
            lowerLimit = expected.higher;
            if (actual < lowerLimit) {
              return false;
            }
          }

          return true;
        }
        //etc

        return true;

      }
      return standardComparator(actual, expected);
    }

    var output = filterFilter(array, expression, customComparator);
    return output;
  };
}]);


angular.module('account')
    .controller('AccountsListCtrl', ['$scope', 'MultiTestersLoader', 'MultiSupervisorsLoader','Account', '$modal', '$resource','AccountLoader','userInfoService','$location','Notification',
        function ($scope, MultiTestersLoader, MultiSupervisorsLoader, Account, $modal, $resource, AccountLoader, userInfoService, $location, Notification) {

            //$scope.accountTypes = [{ 'name':'Author', 'type':'author'}, {name:'Supervisor', type:'supervisor'}];
            //$scope.accountType = $scope.accountTypes[0];
            $scope.tmpAccountList = [].concat($scope.accountList);
            $scope.account = null;
            $scope.accountOrig = null;
            $scope.accountType = "tester";
            $scope.scrollbarWidth = $scope.getScrollbarWidth();
            $scope.authorities = [];

//        var PasswordChange = $resource('api/accounts/:id/passwordchange', {id:'@id'});
            var PasswordChange = $resource('api/accounts/:id/userpasswordchange', {id:'@id'});
            var ApproveAccount = $resource('api/accounts/:id/approveaccount', {id:'@id'});
            var SuspendAccount = $resource('api/accounts/:id/suspendaccount', {id:'@id'});
          var AccountTypeChange = $resource('api/accounts/:id/useraccounttypechange', {id:'@id'});

          $scope.msg = null;

            $scope.accountpwd = {};

            $scope.updateAccount = function() {
                //not sure it is very clean...
                //TODO: Add call back?
                new Account($scope.account).$save(function(data){

                }, function(error){
                    Notification.error({message: error.data, templateUrl: "NotificationErrorTemplate.html", scope: $scope, delay: 50000});
                });
                $scope.accountOrig = angular.copy($scope.account);
            };

            $scope.resetForm = function() {
                $scope.account = angular.copy($scope.accountOrig);
            };

            //TODO: Change that: formData is only supported on modern browsers
            $scope.isUnchanged = function(formData) {
                return angular.equals(formData, $scope.accountOrig);
            };

            $scope.changePassword = function() {
                var user = new PasswordChange();
                user.username = $scope.account.username;
                user.password = $scope.accountpwd.currentPassword;
                user.newPassword = $scope.accountpwd.newPassword;
                user.id = $scope.account.id;
                //TODO: Check return value???
                user.$save().then(function(result){
                    $scope.msg = angular.fromJson(result);
                },function(error){
                    Notification.error({message: error.data, templateUrl: "NotificationErrorTemplate.html", scope: $scope, delay: 50000});
                });
            };

          $scope.saveAccountType = function() {
            var authorityChange = new AccountTypeChange();
            authorityChange.username = $scope.account.username;
            authorityChange.accountType = $scope.account.accountType;
            authorityChange.id = $scope.account.id;
            //TODO: Check return value???
            authorityChange.$save().then(function(result){
              $scope.msg = angular.fromJson(result);
            },function(error){
              Notification.error({message: error.data, templateUrl: "NotificationErrorTemplate.html", scope: $scope, delay: 50000});
            });
          };


            $scope.loadAccounts = function(){
                if (userInfoService.isAuthenticated() && userInfoService.isAdmin()) {
                    $scope.msg = null;
                    new MultiTestersLoader().then(function (response) {
                        $scope.accountList = response;
                        $scope.tmpAccountList = [].concat($scope.accountList);
                    },function(error){
                        Notification.error({message: error.data, templateUrl: "NotificationErrorTemplate.html", scope: $scope, delay: 50000});
                    });
                }
            };

            $scope.initManageAccounts = function(){
                $scope.loadAccounts();
            };

            $scope.selectAccount = function(row) {
                $scope.accountpwd = {};
                $scope.account = row;
              $scope.authorities =
                $scope.accountOrig = angular.copy($scope.account);
            };

            $scope.deleteAccount = function() {
                $scope.confirmDelete($scope.account);
            };

            $scope.confirmDelete = function (accountToDelete) {
                var modalInstance = $modal.open({
                    templateUrl: 'ConfirmAccountDeleteCtrl.html',
                    controller: 'ConfirmAccountDeleteCtrl',
                    resolve: {
                        accountToDelete: function () {
                            return accountToDelete;
                        },
                        accountList: function () {
                            return $scope.accountList;
                        }
                    }
                });
                modalInstance.result.then(function (accountToDelete) {
                  var rowIndex = $scope.accountList.indexOf(accountToDelete);
                    if(rowIndex !== -1){
                      $scope.accountList.splice(rowIndex,1);
                    }
                    $scope.tmpAccountList = [].concat($scope.accountList);
                    $scope.account =null;
                }, function (error) {
                     Notification.error({message: error.data, templateUrl: "NotificationErrorTemplate.html", scope: $scope, delay: 50000});
                });
            };

            // $scope.approveAccount = function() {
            //     var user = new ApproveAccount();
            //     user.username = $scope.account.username;
            //     user.id = $scope.account.id;
            //     user.$save().then(function(result){
            //         $scope.account.pending = false;
            //         $scope.msg = angular.fromJson(result);
            //     },function(error){
            //         Notification.error({message: error.data, templateUrl: "NotificationErrorTemplate.html", scope: $scope, delay: 50000});
            //     });
            // };
            //
            // $scope.suspendAccount = function(){
            //     var user = new SuspendAccount();
            //     user.username = $scope.account.username;
            //     user.id = $scope.account.id;
            //     user.$save().then(function(result){
            //         $scope.account.pending = true;
            //         $scope.msg = angular.fromJson(result);
            //     },function(error){
            //         Notification.error({message: error.data, templateUrl: "NotificationErrorTemplate.html", scope: $scope, delay: 50000});
            //     });
            // };


        }
    ]);



angular.module('account').controller('ConfirmAccountDeleteCtrl', function ($scope, $modalInstance, accountToDelete,accountList,Account,Notification) {

    $scope.accountToDelete = accountToDelete;
    $scope.accountList = accountList;
    $scope.delete = function () {
        //console.log('Delete for', $scope.accountList[rowIndex]);
        Account.remove({id:accountToDelete.id},
            function() {
                $modalInstance.close($scope.accountToDelete);
            },
            function(error) {
                 Notification.error({message: error.data, templateUrl: "NotificationErrorTemplate.html", scope: $scope, delay: 50000});
            }
        );
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

angular.module('account')
    .controller('ForgottenCtrl', ['$scope', '$resource','$rootScope','Notification',
        function ($scope, $resource,$rootScope, Notification) {
            var ForgottenRequest = $resource('api/sooa/accounts/passwordreset', {username:'@username'});

            $scope.requestResetPassword =  function() {
                var resetReq = new ForgottenRequest();
                resetReq.username = $scope.username;
                resetReq.$save(function() {
                    if ( resetReq.text === 'resetRequestProcessed' ) {
                        $scope.username = '';
                    }
                }, function(error){
                    Notification.error({message: error.data, templateUrl: "NotificationErrorTemplate.html", scope: $scope, delay: 50000});
                });
            };

            $scope.getAppInfo = function(){
                return $rootScope.appInfo;
            };
        }
    ]);



'use strict';

angular.module('account')
    .controller('RegistrationCtrl', ['$scope', '$resource', '$modal', '$location','$rootScope','Notification',
        function ($scope, $resource, $modal, $location,$rootScope,Notification) {
            $scope.account = {};
            $scope.registered = false;
            $scope.agreed = false;

            //Creating a type to check with the server if a username already exists.
            var Username = $resource('api/sooa/usernames/:username', {username: '@username'});
            var Email = $resource('api/sooa/emails/:email', {email: '@email'});

            var NewAccount = $resource('api/sooa/accounts/register');

            $scope.registerAccount = function() {
                if($scope.agreed) {
                    //console.log("Creating account");
                    var acctToRegister = new NewAccount();
                    acctToRegister.accountType = 'tester';
                    acctToRegister.employer =  $scope.account.employer;
                    acctToRegister.fullName =  $scope.account.fullName;
                    acctToRegister.phone =  $scope.account.phone;
                    acctToRegister.title =  $scope.account.title;
                    acctToRegister.juridiction =  $scope.account.juridiction;
                    acctToRegister.username =  $scope.account.username;
                    acctToRegister.password =  $scope.account.password;
                    acctToRegister.email =  $scope.account.email;
                    acctToRegister.signedConfidentialityAgreement = true;
                    acctToRegister.$save(
                        function() {
                            if (acctToRegister.text ===  'userAdded') {
                                $scope.account = {};
                                //should unfreeze the form
                                $scope.registered = true;
                                $location.path('/home');
                                Notification.success({message: $rootScope.appInfo.registrationSubmittedContent, templateUrl: "NotificationSuccessTemplate.html", scope: $rootScope, delay: 30000});
                            }else{
                                $scope.registered = false;
                            }
                        },
                        function() {
                            $scope.registered = false;
                        }
                    );
                    //should freeze the form - at least the button
                    $scope.registered = true;
                }
            };


            $scope.getAppInfo = function(){
                return $rootScope.appInfo;
            };

        }
    ]);



'use strict';

angular.module('account')
    .controller('RegisterResetPasswordCtrl', ['$scope', '$resource', '$modal', '$routeParams', 'isFirstSetup','Notification',
        function ($scope, $resource, $modal, $routeParams, isFirstSetup, Notification) {
            $scope.agreed = false;
            $scope.displayForm = true;
            $scope.isFirstSetup = isFirstSetup;

            if ( !angular.isDefined($routeParams.username) ) {
                $scope.displayForm = false;
            }
            if ( $routeParams.username === '' ) {
                $scope.displayForm = false;
            }
            if ( !angular.isDefined($routeParams.token) ) {
                $scope.displayForm = false;
            }
            if ( $routeParams.token === '' ) {
                $scope.displayForm = false;
            }
            if ( !angular.isDefined($routeParams.userId) ) {
                $scope.displayForm = false;
            }
            if ( $routeParams.userId === '' ) {
                $scope.displayForm = false;
            }

            //to register an account for the first time
            var AcctInitPassword = $resource('api/sooa/accounts/register/:userId/passwordreset', {userId:'@userId', token:'@token'});
            //to reset the password
            var AcctResetPassword = $resource('api/sooa/accounts/:id/passwordreset', {id:'@userId', token:'@token'});

            $scope.user = {};
            $scope.user.username = $routeParams.username;
            $scope.user.newUsername = $routeParams.username;
            $scope.user.userId = $routeParams.userId;
            $scope.user.token = $routeParams.token;



//        $scope.confirmRegistration = function() {
//            var modalInstance = $modal.open({
//                backdrop: true,
//                keyboard: true,
//                backdropClick: false,
//                controller: 'AgreementCtrl',
//                templateUrl: 'views/agreement.html'
//            });
//            modalInstance.result.then(function (result) {
//                if(result) {
//                    var initAcctPass = new AcctInitPassword($scope.user);
//                    initAcctPass.signedConfidentialityAgreement = true;
//                    initAcctPass.$save(function() {
//                        $scope.user.password = '';
//                        $scope.user.passwordConfirm = '';
//                    });
//                }
//                else {
//                    //console.log("Agreement not accepted");
//                }
//            });
//        };

            $scope.changePassword = function() {
                if($scope.agreed) {
                    var resetAcctPass = new AcctResetPassword($scope.user);
                    resetAcctPass.$save(function () {
                        $scope.user.password = '';
                        $scope.user.passwordConfirm = '';
                    }, function(error){
                        Notification.error({message: error.data, templateUrl: "NotificationErrorTemplate.html", scope: $scope, delay: 50000});
                    });
                }
            };
        }
    ]);
