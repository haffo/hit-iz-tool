/**
 * Created by haffo on 4/26/16.
 */

'use strict';

angular.module('account').factory('Account', ['$resource',
    function ($resource) {
        return $resource('api/accounts/:id', {id: '@id'});
    }
]);

angular.module('account').factory('LoginService', ['$resource', '$q',
    function ($resource, $q) {
        return function() {
            var myRes = $resource('api/accounts/login');
            var delay = $q.defer();
            myRes.get({},
                function(res) {
                    delay.resolve(res);
                }
            );
            return delay.promise;
        };
    }
]);

angular.module('account').factory('AccountLoader', ['Account', '$q',
    function (Account, $q) {
        return function(acctID) {
            var delay = $q.defer();
            Account.get({id: acctID},
                function(account) {
                    delay.resolve(account);
                },
                function() {
                    delay.reject('Unable to fetch account');
                }
            );
            return delay.promise;
        };
    }
]);


'use strict';


angular.module('account').factory('Testers', ['$resource',
    function ($resource) {
        return $resource('api/shortaccounts', {filter:['accountType::tester', 'accountType::deployer', 'accountType::admin']});
    }
]);

angular.module('account').factory('Supervisors', ['$resource',
    function ($resource) {
        return $resource('api/shortaccounts', {filter:'accountType::supervisor'});
    }
]);


angular.module('account').factory('MultiTestersLoader', ['Testers', '$q',
    function (Testers, $q) {
        return function() {
            var delay = $q.defer();
            Testers.query(
                function(auth) {
                    delay.resolve(auth);
                },
                function() {
                    delay.reject('Unable to fetch list of testers');
                }
            );
            return delay.promise;
        };
    }
]);

angular.module('account').factory('MultiSupervisorsLoader', ['Supervisors', '$q',
    function (Supervisors, $q) {
        return function() {
            var delay = $q.defer();
            Supervisors.query(
                function(res) {
                    delay.resolve(res);
                },
                function() {
                    delay.reject('Unable to fetch list of supervisors');
                }
            );
            return delay.promise;
        };
    }
]);


angular.module('account').factory('userLoaderService', ['userInfo', '$q',
    function (userInfo, $q) {
        var load = function() {
            var delay = $q.defer();
            userInfo.get({},
                function(theUserInfo) {
                    delay.resolve(theUserInfo);
                },
                function() {
                    delay.reject('Unable to fetch user info');
                }
            );
            return delay.promise;
        };
        return {
            load: load
        };
    }
]);
'use strict';

angular.module('account').factory('userInfo', ['$resource',
    function ($resource) {
        return $resource('api/accounts/cuser');
    }
]);

angular.module('account').factory('userLoaderService', ['userInfo', '$q',
    function (userInfo, $q) {
        var load = function() {
            var delay = $q.defer();
            userInfo.get({},
                function(theUserInfo) {
                    delay.resolve(theUserInfo);
                },
                function() {
                    delay.reject('Unable to fetch user info');
                }
            );
            return delay.promise;
        };
        return {
            load: load
        };
    }
]);

angular.module('account').factory('userInfoService', ['StorageService', 'userLoaderService','User','Transport','$q','$timeout','$rootScope',
    function(StorageService,userLoaderService,User,Transport,$q,$timeout,$rootScope) {
        var currentUser = null;
        var supervisor = false,
            tester = false,
            publisher = false,
            deployer = false,
            admin = false,
            id = null,
            username = '',
            fullName= '',
            lastTestPlanPersistenceId = null,
          employer = null;

        //console.log("USER ID=", StorageService.get('userID'));

        var loadFromCookie = function() {
            //console.log("UserID=", StorageService.get('userID'));

            id = StorageService.get('userID');
            username = StorageService.get('username');
            tester = StorageService.get('tester');
            supervisor = StorageService.get('supervisor');
            deployer = StorageService.get('deployer');
            publisher = StorageService.get('publisher');

            admin = StorageService.get('admin');
          lastTestPlanPersistenceId = StorageService.get('lastTestPlanPersistenceId');
          employer = StorageService.get('employer');

        };

        var saveToCookie = function() {
            StorageService.set('accountID', id);
            StorageService.set('username', username);
            StorageService.set('tester', tester);
            StorageService.set('supervisor', supervisor);
            StorageService.set('deployer', deployer);
            StorageService.set('publisher', publisher);
            StorageService.set('admin', admin);
            StorageService.set('fullName', fullName);
          StorageService.set('lastTestPlanPersistenceId', lastTestPlanPersistenceId);
          StorageService.set('employer', employer);

        };

        var clearCookie = function() {
            StorageService.remove('accountID');
            StorageService.remove('username');
            StorageService.remove('tester');
            StorageService.remove('supervisor');
            StorageService.remove('publisher');

            StorageService.remove('deployer');
            StorageService.remove('admin');
            StorageService.remove('hthd');
            StorageService.remove('fullName');
            StorageService.remove('lastTestPlanPersistenceId');
          StorageService.remove('employer');

        };

        var saveHthd = function(header) {
            StorageService.set('hthd', header);
        };

        var getHthd = function(header) {
            return StorageService.get('hthd');
        };

        var hasCookieInfo =  function() {
            if ( StorageService.get('username') === '' ) {
                return false;
            }
            else {
                return true;
            }
        };

        var getAccountID = function() {
            if ( isAuthenticated() ) {
                return currentUser.accountId.toString();
            }
            return '0';
        };

        var isAdmin = function() {
          if (!admin && currentUser != null  && $rootScope.appInfo.adminEmails != null && $rootScope.appInfo.adminEmails) {
            if (Array.isArray($rootScope.appInfo.adminEmails)) {
              admin = $rootScope.appInfo.adminEmails.indexOf(currentUser.email) >= 0;
            } else {
              admin = $rootScope.appInfo.adminEmails === currentUser.email;
            }
          }
          return admin;
        };

        var isTester = function() {
            return tester;
        };

//        var isAuthorizedVendor = function() {
//            return authorizedVendor;
//        };
//
//        var isCustomer = function() {
//            return (author || authorizedVendor);
//        };

        var isSupervisor = function() {
            return supervisor;
        };

        var isDeployer = function() {
            return deployer;
        };
        var isPublisher = function() {
            return publisher;
        };


        var isPending = function() {
            return isAuthenticated() && currentUser != null ? currentUser.pending: false;
        };

        var isAuthenticated = function() {
            var res =  currentUser !== undefined && currentUser != null && currentUser.authenticated === true;
            return res;
//            return true;
        };

        var loadFromServer = function() {
             if ( !isAuthenticated() ) {
                 return userLoaderService.load();
             }else{
                 var delay = $q.defer();
                 $timeout(function(){
                     delay.resolve(currentUser);
                 });
                 return delay.promise;
             }
        };


        var getCurrentUser = function() {
            return currentUser;
        };

        var setCurrentUser = function(newUser) {
            currentUser = newUser;
            if ( currentUser !== null && currentUser !== undefined ) {
                username = currentUser.username;
                id = currentUser.accountId;
                fullName = currentUser.fullName;
              lastTestPlanPersistenceId = currentUser.lastTestPlanPersistenceId;
              employer = currentUser.employer;

              if ( angular.isArray(currentUser.authorities)) {
                    angular.forEach(currentUser.authorities, function(value, key){
                        switch(value.authority)
                        {
                            case 'user':
                                break;
                            case 'admin':
                                admin = true;
                                break;
                            case 'tester':
                                tester = true;
                                break;
                            case 'supervisor':
                              supervisor = true;
                              break;
                            case 'deployer':
                                deployer = true;
                                break;
                            case 'publisher':
                                publisher = true;
                                break;
                            default:
                        }
                    });
                }
                //saveToCookie();
            }
            else {
                supervisor = false;
                tester = false;
                deployer = false;
                publisher = false;
                admin = false;
                username = '';
                id = null;
                fullName = '';
              lastTestPlanPersistenceId = null;
              employer = '';

              //clearCookie();
            }
        };

        var getUsername = function() {
            return username;
        };

        var getFullName = function() {
            return fullName;
        };

      var getLastTestPlanPersistenceId = function() {
        return lastTestPlanPersistenceId;
      };

      var getEmployer = function() {
        return employer;
      };




      return {
            saveHthd: saveHthd,
            getHthd: getHthd,
            hasCookieInfo: hasCookieInfo,
            loadFromCookie: loadFromCookie,
            getAccountID: getAccountID,
            isAdmin: isAdmin,
            isPublisher: isPublisher,
            isTester: isTester,
            isAuthenticated: isAuthenticated,
            isPending: isPending,
            isSupervisor: isSupervisor,
            isDeployer: isDeployer,
            setCurrentUser: setCurrentUser,
            getCurrentUser: getCurrentUser,
            loadFromServer: loadFromServer,
            getUsername: getUsername,
            getFullName: getFullName,
            getLastTestPlanPersistenceId: getLastTestPlanPersistenceId,
            getEmployer: getEmployer

        };
    }
]);
