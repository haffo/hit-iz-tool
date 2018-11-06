angular.module('commonServices', []);
angular.module('common', ['ngResource', 'default', 'xml', 'hl7v2-edi', 'hl7v2', 'edi', 'soap', 'hit-util']);
angular.module('main', ['common']);
angular.module('account', ['common']);
angular.module('cf', ['common']);
angular.module('doc', ['common']);
angular.module('cb', ['common']);
angular.module('envelope', ['soap']);
angular.module('connectivity', ['soap']);
angular.module('hit-tool-directives', []);
angular.module('hit-tool-services', ['common']);
angular.module('documentation', []);
angular.module('domains', []);
angular.module('logs', ['common']);
angular.module('transport', []);

var app = angular.module('hit-app', [
  'ngRoute',
  'ui.bootstrap',
  'ngCookies',
  'LocalStorageModule',
  'ngResource',
  'ngSanitize',
  'ngIdle',
  'ngAnimate',
  'ui.bootstrap',
  'angularBootstrapNavTree',
  'QuickList',
  'hit-util',
  'format',
  'soap',
  'default',
  'hl7v2-edi',
  'xml',
  'hl7v2',
  'edi',
  'soap',
  'envelope',
  'connectivity',
  'cf',
  'cb',
  'ngTreetable',
  'hit-tool-directives',
  'hit-tool-services',
  'commonServices',
  'smart-table',
  'doc',
  'account',
  'main',
  'hit-vocab-search',
  'hit-profile-viewer',
  'hit-validation-result',
  'hit-report-viewer',
  'hit-testcase-details',
  'hit-testcase-tree',
  'hit-dqa',
  'hit-settings',
  'documentation',
  'hit-manual-report-viewer',
  'ui-notification',
  'angularFileUpload',
  'ociFixedHeader',
  'ngFileUpload',
  'ui.tree',
  'ui.select',
  'hit-edit-testcase-details',
  'domains',
  'logs',
    'transport'
]);


var httpHeaders,

//the message to show on the login popup page
  loginMessage,

//the spinner used to show when we are still waiting for a server answer
  spinner,

//The list of messages we don't want to display
  mToHide = ['usernameNotFound', 'emailNotFound', 'usernameFound', 'emailFound', 'loginSuccess', 'userAdded', 'uploadImageFailed'];

//the message to be shown to the user
var msg = {};

app.config(function ($routeProvider, $httpProvider, localStorageServiceProvider, KeepaliveProvider, IdleProvider, NotificationProvider, $provide) {

  localStorageServiceProvider
    .setPrefix("hit-app")
    .setStorageType('sessionStorage');

  $routeProvider
    .when('/', {
      templateUrl: 'views/home.html'
    })
    .when('/home', {
      templateUrl: 'views/home.html'
    })
    .when('/doc', {
      templateUrl: 'views/documentation/documentation.html'
    })
    .when('/setting', {
      templateUrl: 'views/setting.html'
    })
    .when('/about', {
      templateUrl: 'views/about.html'
    })
    .when('/contact', {
      templateUrl: 'views/contact.html'
    })
    .when('/soapEnv', {
      templateUrl: 'views/envelope/envelope.html'
    })
    .when('/soapConn', {
      templateUrl: 'views/connectivity/connectivity.html'
    })
    .when('/cf', {
      templateUrl: 'views/cf/cf.html'
    })
    .when('/cb', {
      templateUrl: 'views/cb/cb.html'
    })
    .when('/blank', {
      templateUrl: 'blank.html'
    })
    .when('/error', {
      templateUrl: 'error.html'
    })
      .when('/transport', {
          templateUrl: 'views/transport/transport.html'
      })
    .when('/forgotten', {
      templateUrl: 'views/account/forgotten.html',
      controller: 'ForgottenCtrl'
    }).when('/registration', {
    templateUrl: 'views/account/registration.html',
    controller: 'RegistrationCtrl'
  }).when('/useraccount', {
    templateUrl: 'views/account/userAccount.html'
  }).when('/glossary', {
    templateUrl: 'views/glossary.html'
  }).when('/resetPassword', {
    templateUrl: 'views/account/registerResetPassword.html',
    controller: 'RegisterResetPasswordCtrl',
    resolve: {
      isFirstSetup: function () {
        return false;
      }
    }
  }).when('/registrationSubmitted', {
    templateUrl: 'views/account/registrationSubmitted.html'
  })
    .when('/uploadTokens', {
      templateUrl: 'views/home.html',
      controller: 'UploadTokenCheckCtrl'
    })
    .when('/addprofiles', {
      redirectTo: '/cf'
    })
      .when('/saveCBTokens', {
          templateUrl: 'views/home.html',
          controller: 'UploadCBTokenCheckCtrl'
      })
      .when('/addcbprofiles', {
          templateUrl: 'views/home.html',
          controller: 'UploadCBTokenCheckCtrl'
      })
    .when('/domains', {
      templateUrl: 'views/domains/domains.html'
     })
    .when('/logs', {
      templateUrl: 'views/logs/logs.html'
    })
    .otherwise({
      redirectTo: '/'
    });

  $httpProvider.interceptors.push('interceptor1');
  $httpProvider.interceptors.push('interceptor2');
  $httpProvider.interceptors.push('interceptor3');
  $httpProvider.interceptors.push('interceptor4');


  IdleProvider.idle(7200);
  IdleProvider.timeout(30);
  KeepaliveProvider.interval(10);

  NotificationProvider.setOptions({
    delay: 30000,
    maxCount: 1
  });

  httpHeaders = $httpProvider.defaults.headers;

  //file upload file over bug fix
  $provide.decorator('nvFileOverDirective', ['$delegate', function ($delegate) {
    var directive = $delegate[0],
      link = directive.link;

    directive.compile = function () {
      return function (scope, element, attrs) {
        var overClass = attrs.overClass || 'nv-file-over';
        link.apply(this, arguments);
        element.on('dragleave', function () {
          element.removeClass(overClass);
        });
      };
    };

    return $delegate;
  }]);


});


app.factory('interceptor1', function ($q, $rootScope, $location, StorageService, $window) {
  var handle = function (response) {
    if (response.status === 440) {
      response.data = "Session timeout";
      $rootScope.openSessionExpiredDlg();
    } else if (response.status === 498) {
      response.data = "Invalid Application State";
      $rootScope.openVersionChangeDlg();
    }
//        else if (response.status === 401) {
//            $rootScope.openInvalidReqDlg();
//        }
  };
  return {
    responseError: function (response) {
      handle(response);
      return $q.reject(response);
    }
  };
});


app.factory('interceptor2', function ($q, $rootScope, $location, StorageService, $window) {
  return {
    response: function (response) {
      return response || $q.when(response);
    },
    responseError: function (response) {
      if (response.status === 401) {
        //We catch everything but this one. So public users are not bothered
        //with a login windows when browsing home.
        if (response.config.url !== 'api/accounts/cuser') {
          //We don't intercept this request
          if (response.config.url !== 'api/accounts/login') {
            var deferred = $q.defer(),
              req = {
                config: response.config,
                deferred: deferred
              };
            $rootScope.requests401.push(req);
          }
          $rootScope.$broadcast('event:loginRequired');
//                        return deferred.promise;

          return $q.when(response);
        }
      }
      return $q.reject(response);
    }
  };
});


app.factory('interceptor3', function ($q, $rootScope, $location, StorageService, $window) {
  return {
    response: function (response) {
      //hide the spinner
      spinner = false;
      return response || $q.when(response);
    },
    responseError: function (response) {
      //hide the spinner
      spinner = false;
      return $q.reject(response);
    }
  };
});

app.factory('interceptor4', function ($q, $rootScope, $location, StorageService, $window) {
  var setMessage = function (response) {
    //if the response has a text and a type property, it is a message to be shown
    if (response.data && response.data.text && response.data.type) {
      if (response.status === 401) {
//                        console.log("setting login message");
        loginMessage = {
          text: response.data.text,
          type: response.data.type,
          skip: response.data.skip,
          show: true,
          manualHandle: response.data.manualHandle
        };

      } else if (response.status === 503) {
        msg = {
          text: "server.down",
          type: "danger",
          show: true,
          manualHandle: true
        };
      } else {
        console.log(response.status);
        msg = {
          text: response.data.text,
          type: response.data.type,
          skip: response.data.skip,
          show: true,
          manualHandle: response.data.manualHandle
        };
        var found = false;
        var i = 0;
        while (i < mToHide.length && !found) {
          if (msg.text === mToHide[i]) {
            found = true;
          }
          i++;
        }
        if (found === true) {
          msg.show = false;
        } else {
//                        //hide the msg in 5 seconds
//                                                setTimeout(
//                                                    function() {
//                                                        msg.show = false;
//                                                        //tell angular to refresh
//                                                        $rootScope.$apply();
//                                                    },
//                                                    10000
//                                                );
        }
      }
    }
  };

  return {
    response: function (response) {
      setMessage(response);
      return response || $q.when(response);
    },

    responseError: function (response) {
      setMessage(response);
      return $q.reject(response);
    }
  };
});


app.run(function (Session, $rootScope, $location, $modal, TestingSettings, AppInfo, $q, $sce, $templateCache, $compile, StorageService, $window, $route, $timeout, $http, User, Idle, Transport, IdleService, userInfoService, base64, Notification, $filter, $routeParams, DomainsManager) {


  var domainParam = $location.search()['d'] ? decodeURIComponent($location.search()['d']) : null;


  $rootScope.appInfo = {};


  $rootScope.stackPosition = 0;
  $rootScope.transportSupported = false;
  $rootScope.scrollbarWidth = null;
  $rootScope.vcModalInstance = null;
  $rootScope.sessionExpiredModalInstance = null;
  $rootScope.errorModalInstanceInstance = null;

  function getContextPath() {
    return $window.location.pathname.substring(0, $window.location.pathname.indexOf("/", 2));
  }

  var initUser = function (user) {
    userInfoService.setCurrentUser(user);
    User.initUser(user);
   };



  $rootScope.clearDomainSession = function () {
    StorageService.set(StorageService.CF_SELECTED_TESTPLAN_ID_KEY, null);
    StorageService.set(StorageService.CF_EDITOR_CONTENT_KEY, null);
    StorageService.set(StorageService.CF_LOADED_TESTCASE_ID_KEY, null);
    StorageService.set(StorageService.CB_EDITOR_CONTENT_KEY, null);
    StorageService.set(StorageService.CB_SELECTED_TESTCASE_TYPE_KEY, null);
    StorageService.set(StorageService.CB_LOADED_TESTCASE_ID_KEY, null);
    StorageService.set(StorageService.CB_LOADED_TESTCASE_TYPE_KEY, null);
    StorageService.set(StorageService.CB_LOADED_TESTSTEP_TYPE_KEY, null);
    StorageService.set(StorageService.CB_LOADED_TESTSTEP_ID_KEY, null);
    StorageService.set(StorageService.ISOLATED_EDITOR_CONTENT_KEY, null);
    StorageService.set(StorageService.ISOLATED_SELECTED_TESTCASE_TYPE_KEY, null);
    StorageService.set(StorageService.CB_SELECTED_TESTPLAN_ID_KEY, null);
    StorageService.set(StorageService.CB_SELECTED_TESTPLAN_TYPE_KEY, null);
    StorageService.set(StorageService.CB_SELECTED_TESTPLAN_SCOPE_KEY, null);
    StorageService.set(StorageService.CF_SELECTED_TESTPLAN_SCOPE_KEY, null);
    StorageService.set(StorageService.CF_SELECTED_TESTPLAN_ID_KEY, null);
    StorageService.set(StorageService.CF_SELECTED_TESTPLAN_TYPE_KEY, null);
    StorageService.set(StorageService.CB_MANAGE_SELECTED_TESTCASE_ID_KEY, null);
    StorageService.set(StorageService.CB_MANAGE_SELECTED_TESTCASE_TYPE_KEY, null);
    StorageService.set(StorageService.CB_MANAGE_LOADED_TESTCASE_ID_KEY, null);
    StorageService.set(StorageService.CB_MANAGE_LOADED_TESTCASE_TYPE_KEY, null);
    StorageService.set(StorageService.CB_MANAGE_LOADED_TESTSTEP_TYPE_KEY, null);
    StorageService.set(StorageService.CB_MANAGE_LOADED_TESTSTEP_ID_KEY, null);
    StorageService.set(StorageService.CB_MANAGE_SELECTED_TESTPLAN_ID_KEY, null);
    StorageService.set(StorageService.CB_MANAGE_SELECTED_TESTPLAN_TYPE_KEY, null);
    StorageService.set(StorageService.CB_MANAGE_SELECTED_TESTPLAN_SCOPE_KEY, null);
    StorageService.set(StorageService.APP_SELECTED_DOMAIN, null);
  };

  $rootScope.selectDomain = function (domain) {
    if (domain != null) {
      StorageService.set(StorageService.APP_SELECTED_DOMAIN, domain);
      $location.search('d', domain);
      $rootScope.reloadPage();
    }
  };


  $rootScope.reloadPage = function () {
    $window.location.reload();
  };


  $rootScope.$watch(function () {
    return $location.path();
  }, function (newLocation, oldLocation) {
    //true only for onPopState
    if ($rootScope.activePath === newLocation) {
      var back,
        historyState = $window.history.state;
      back = !!(historyState && historyState.position <= $rootScope.stackPosition);
      if (back) {
        //back button
        $rootScope.stackPosition--;
      } else {
        //forward button
        $rootScope.stackPosition++;
      }
    } else {
      //normal-way change of page (via link click)
      if ($route.current) {
        $window.history.replaceState({
          position: $rootScope.stackPosition
        }, '');
        $rootScope.stackPosition++;
      }
    }
  });

  $rootScope.isActive = function (path) {
    return path === $rootScope.activePath;
  };

  $rootScope.setActive = function (path) {
    if (path === '' || path === '/') {
      $location.path('/home');
    } else {
      $rootScope.activePath = path;
    }
  };

  $rootScope.isSubActive = function (path) {
    return path === $rootScope.subActivePath;
  };

  $rootScope.setSubActive = function (path) {
    $rootScope.subActivePath = path;
    StorageService.set(StorageService.ACTIVE_SUB_TAB_KEY, path);
  };


  //make current message accessible to root scope and therefore all scopes
  $rootScope.msg = function () {
    return msg;
  };

  //make current loginMessage accessible to root scope and therefore all scopes
  $rootScope.loginMessage = function () {
//            console.log("calling loginMessage()");
    return loginMessage;
  };

  //showSpinner can be referenced from the view
  $rootScope.showSpinner = function () {
    return spinner;
  };

  $rootScope.createGuestIfNotExist = function () {
    User.createGuestIfNotExist().then(function (guest) {
      initUser(guest);
    }, function (error) {
      $rootScope.openCriticalErrorDlg("ERROR: Sorry, Failed to initialize the session. Please refresh the page and try again.");
    });
  };

  /**
   * Holds all the requests which failed due to 401 response.
   */
  $rootScope.requests401 = [];

  $rootScope.$on('event:loginRequired', function () {
//            console.log("in loginRequired event");
    $rootScope.showLoginDialog();
  });

  $rootScope.$on('event:loginRequiredWithRedirect', function (event, path) {
    $rootScope.showLoginDialog(path);
  });


  /**
   * On 'event:loginConfirmed', resend all the 401 requests.
   */
  $rootScope.$on('event:loginConfirmed', function () {
    initUser(userInfoService.getCurrentUser());
    var i,
      requests = $rootScope.requests401,
      retry = function (req) {
        $http(req.config).then(function (response) {
          req.deferred.resolve(response);
        });
      };
    for (i = 0; i < requests.length; i += 1) {
      retry(requests[i]);
    }
    $rootScope.requests401 = [];
    $window.location.reload();
  });

  /*jshint sub: true */
  /**
   * On 'event:loginRequest' send credentials to the server.
   */
  $rootScope.$on('event:loginRequest', function (event, username, password) {
    httpHeaders.common['Accept'] = 'application/json';
    httpHeaders.common['Authorization'] = 'Basic ' + base64.encode(username + ':' + password);
//        httpHeaders.common['withCredentials']=true;
//        httpHeaders.common['Origin']="http://localhost:9000";
    $http.get('api/accounts/login').success(function () {
      //If we are here in this callback, login was successfull
      //Let's get user info now
      httpHeaders.common['Authorization'] = null;
      $http.get('api/accounts/cuser').then(function (result) {
        if (result.data && result.data != null) {
          var rs = angular.fromJson(result.data);
          userInfoService.setCurrentUser(rs);
          $rootScope.$broadcast('event:loginConfirmed');
        } else {
          userInfoService.setCurrentUser(null);
        }
      }, function () {
        userInfoService.setCurrentUser(null);
      });
    });
  });

  /**
   * On 'event:loginRequest' send credentials to the server.
   */
  $rootScope.$on('event:loginRequestWithAuth', function (event, auth, path) {
    httpHeaders.common['Accept'] = 'application/json';
    httpHeaders.common['Authorization'] = 'Basic ' + auth;
    console.log("logging in...");
    $http.get('api/accounts/login').success(function () {
       httpHeaders.common['Authorization'] = null;
      $http.get('api/accounts/cuser').then(function (result) {
        if (result.data && result.data != null) {
          var rs = angular.fromJson(result.data);
          initUser(rs);
          $rootScope.$broadcast('event:loginConfirmed');
          if (path !== undefined){
                $location.url(path);
          }
        } else {
          userInfoService.setCurrentUser(null);
        }
      }, function () {
        userInfoService.setCurrentUser(null);
      });
    });
  });


  /*jshint sub: true */
  /**
   * On 'event:loginRequest' send credentials to the server.
   */
  $rootScope.$on('event:loginRedirectRequest', function (event, username, password, path) {
    httpHeaders.common['Accept'] = 'application/json';
    httpHeaders.common['Authorization'] = 'Basic ' + base64.encode(username + ':' + password);
//        httpHeaders.common['withCredentials']=true;
//        httpHeaders.common['Origin']="http://localhost:9000";
    $http.get('api/accounts/login').success(function () {
      //If we are here in this callback, login was successfull
      //Let's get user info now
      httpHeaders.common['Authorization'] = null;
      $http.get('api/accounts/cuser').then(function (result) {
        if (result.data && result.data != null) {
          var rs = angular.fromJson(result.data);
          initUser(rs);
          $rootScope.$broadcast('event:loginConfirmed');
        } else {
          userInfoService.setCurrentUser(null);
        }
        //redirect
        $location.url(path);
      }, function () {
        userInfoService.setCurrentUser(null);
      });
    });
  });

  /**
   * On 'logoutRequest' invoke logout on the server.
   */
  $rootScope.$on('event:logoutRequest', function () {
    httpHeaders.common['Authorization'] = null;
    userInfoService.setCurrentUser(null);
    $http.get('j_spring_security_logout').then(function (result) {
      $rootScope.createGuestIfNotExist();
      $rootScope.$broadcast('event:logoutConfirmed');
    });
  });

  /**
   * On 'loginCancel' clears the Authentication header
   */
  $rootScope.$on('event:loginCancel', function () {
    httpHeaders.common['Authorization'] = null;
  });

  $rootScope.$on('$routeChangeStart', function (next, current) {
//            console.log('route changing');
    // If there is a message while change Route the stop showing the message
    if (msg && msg.manualHandle === 'false') {
//                console.log('detected msg with text: ' + msg.text);
      msg.show = false;
    }
  });

  $rootScope.$watch(function () {
    return $rootScope.msg().text;
  }, function (value) {
    $rootScope.showNotification($rootScope.msg());
  });

  $rootScope.$watch('language()', function (value) {
    $rootScope.showNotification($rootScope.msg());
  });

  $rootScope.loadFromCookie = function () {
    if (userInfoService.hasCookieInfo() === true) {
      //console.log("found cookie!")
      userInfoService.loadFromCookie();
      httpHeaders.common['Authorization'] = userInfoService.getHthd();
    }
    else {
      //console.log("cookie not found");
    }
  };

  $rootScope.showNotification = function (m) {
    if (m != undefined && m.show && m.text != null) {
      var msg = angular.copy(m);
      var message = $.i18n.prop(msg.text);
      var type = msg.type;
      if (type === "danger") {
        Notification.error({
          message: message,
          templateUrl: "NotificationErrorTemplate.html",
          scope: $rootScope,
          delay: 10000
        });
      } else if (type === 'warning') {
        Notification.warning({
          message: message,
          templateUrl: "NotificationWarningTemplate.html",
          scope: $rootScope,
          delay: 5000
        });
      } else if (type === 'success') {
        Notification.success({
          message: message,
          templateUrl: "NotificationSuccessTemplate.html",
          scope: $rootScope,
          delay: 5000
        });
      }
      //reset
      m.text = null;
      m.type = null;
      m.show = false;
    }
  };

  $rootScope.getScrollbarWidth = function () {
    if ($rootScope.scrollbarWidth == 0) {
      var outer = document.createElement("div");
      outer.style.visibility = "hidden";
      outer.style.width = "100px";
      outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

      document.body.appendChild(outer);

      var widthNoScroll = outer.offsetWidth;
      // force scrollbars
      outer.style.overflow = "scroll";

      // add innerdiv
      var inner = document.createElement("div");
      inner.style.width = "100%";
      outer.appendChild(inner);

      var widthWithScroll = inner.offsetWidth;

      // remove divs
      outer.parentNode.removeChild(outer);

      $rootScope.scrollbarWidth = widthNoScroll - widthWithScroll;
    }

    return $rootScope.scrollbarWidth;
  };

  //loadAppInfo();
  userInfoService.loadFromServer().then(function (currentUser) {
    if (currentUser !== null && currentUser.accountId != null && currentUser.accountId != undefined) {
      initUser(currentUser);
    } else {
      $rootScope.createGuestIfNotExist();
    }
  }, function (error) {
    $rootScope.createGuestIfNotExist();
  });


  $rootScope.getAppInfo = function () {
    return $rootScope.appInfo;
  };


  $rootScope.isAuthenticationRequired = function () {
    return $rootScope.getAppInfo().options && ($rootScope.getAppInfo().options['AUTHENTICATION_REQUIRED'] === "true");
  };

  $rootScope.isEmployerRequired = function () {
    return $rootScope.getAppInfo().options && ($rootScope.getAppInfo().options['EMPLOYER_REQUIRED'] === "true");
  };


  $rootScope.isCbManagementSupported = function () {
    return $rootScope.getAppInfo().options && ($rootScope.getAppInfo().options['CB_MANAGEMENT_SUPPORTED'] === "true");
  };

  $rootScope.isCfManagementSupported = function () {
    return $rootScope.getAppInfo().options && ($rootScope.getAppInfo().options['CF_MANAGEMENT_SUPPORTED'] === "true");
  };


  $rootScope.isDocumentationManagementSupported = function () {
    return $rootScope.getAppInfo().options && ($rootScope.getAppInfo().options['DOC_MANAGEMENT_SUPPORTED'] === "true");
  };

  $rootScope.isDomainOwner = function (email) {
    return $rootScope.domain != null && $rootScope.domain.ownerEmails != null && $rootScope.domain.ownerEmails.length() > 0 && $rootScope.domain.ownerEmails.indexOf(email) != -1;
  };


  $rootScope.isDomainsManagementSupported = function () {
      return $rootScope.getAppInfo().options && ($rootScope.getAppInfo().options['DOMAIN_MANAGEMENT_SUPPORTED'] === "true" || $rootScope.getAppInfo().options['DOMAIN_MANAGEMENT_SUPPORTED'] === true) || userInfoService.isAdmin() || userInfoService.isSupervisor() || userInfoService.isDeployer();
  };

    $rootScope.isLoggedIn = function () {
        return userInfoService.isAuthenticated();
    };




});


angular.module('ui.bootstrap.carousel', ['ui.bootstrap.transition'])
  .controller('CarouselController', ['$scope', '$timeout', '$transition', '$q', function ($scope, $timeout, $transition, $q) {
  }]).directive('carousel', [function () {
  return {}
}]);


angular.module('hit-tool-services').factory('TabSettings',
  ['$rootScope', function ($rootScope) {
    return {
      new: function (key) {
        return {
          key: key,
          activeTab: 0,
          getActiveTab: function () {
            return this.activeTab;
          },
          setActiveTab: function (value) {
            this.activeTab = value;
            this.save();
          },
          save: function () {
            sessionStorage.setItem(this.key, this.activeTab);
          },
          restore: function () {
            this.activeTab = sessionStorage.getItem(this.key) != null && sessionStorage.getItem(this.key) != "" ? parseInt(sessionStorage.getItem(this.key)) : 0;
          }
        };
      }
    };
  }]
);


app.controller('ErrorDetailsCtrl', function ($scope, $modalInstance, error) {
  $scope.error = error;
  $scope.ok = function () {
    $modalInstance.close($scope.error);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  $scope.refresh = function () {
    $modalInstance.close($window.location.reload());
  };
});

app.directive('stRatio', function () {

  return {

    link: function (scope, element, attr) {

      var ratio = +(attr.stRatio);


      element.css('width', ratio + '%');


    }

  };

});

app.controller('TableFoundCtrl', function ($scope, $modalInstance, table) {
  $scope.table = table;
  $scope.tmpTableElements = [].concat(table != null ? table.valueSetElements : []);
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});


app.controller('ValidationResultInfoCtrl', ['$scope', '$modalInstance',
  function ($scope, $modalInstance) {
    $scope.close = function () {
      $modalInstance.dismiss('cancel');
    };
  }
]);


app.filter('capitalize', function () {
  return function (input) {
    return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
  }
});


app.controller('ErrorCtrl', ['$scope', '$modalInstance', 'StorageService', '$window',
  function ($scope, $modalInstance, StorageService, $window) {
    $scope.refresh = function () {
      $modalInstance.close($window.location.reload());
    };
  }
]);

app.controller('FailureCtrl', ['$scope', '$modalInstance', 'StorageService', '$window', 'error',
  function ($scope, $modalInstance, StorageService, $window, error) {
    $scope.error = error;
    $scope.close = function () {
      $modalInstance.close();
    };
  }
]);


app
  .service('base64', function base64() {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var keyStr = 'ABCDEFGHIJKLMNOP' +
      'QRSTUVWXYZabcdef' +
      'ghijklmnopqrstuv' +
      'wxyz0123456789+/' +
      '=';
    this.encode = function (input) {
      var output = '',
        chr1, chr2, chr3 = '',
        enc1, enc2, enc3, enc4 = '',
        i = 0;

      while (i < input.length) {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
          enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
          enc4 = 64;
        }

        output = output +
          keyStr.charAt(enc1) +
          keyStr.charAt(enc2) +
          keyStr.charAt(enc3) +
          keyStr.charAt(enc4);
        chr1 = chr2 = chr3 = '';
        enc1 = enc2 = enc3 = enc4 = '';
      }

      return output;
    };

    this.decode = function (input) {
      var output = '',
        chr1, chr2, chr3 = '',
        enc1, enc2, enc3, enc4 = '',
        i = 0;

      // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

      while (i < input.length) {
        enc1 = keyStr.indexOf(input.charAt(i++));
        enc2 = keyStr.indexOf(input.charAt(i++));
        enc3 = keyStr.indexOf(input.charAt(i++));
        enc4 = keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 !== 64) {
          output = output + String.fromCharCode(chr2);
        }
        if (enc4 !== 64) {
          output = output + String.fromCharCode(chr3);
        }

        chr1 = chr2 = chr3 = '';
        enc1 = enc2 = enc3 = enc4 = '';
      }
    };
  });

app.factory('i18n', function () {
  // AngularJS will instantiate a singleton by calling "new" on this function
  var language;
  var setLanguage = function (theLanguage) {
    $.i18n.properties({
      name: 'messages',
      path: 'lang/',
      mode: 'map',
      language: theLanguage,
      callback: function () {
        language = theLanguage;
      }
    });
  };
  setLanguage('en');
  return {
    setLanguage: setLanguage
  };
});

app.factory('Resource', ['$resource', function ($resource) {
  return function (url, params, methods) {
    var defaults = {
      update: {method: 'put', isArray: false},
      create: {method: 'post'}
    };

    methods = angular.extend(defaults, methods);

    var resource = $resource(url, params, methods);

    resource.prototype.$save = function (successHandler, errorHandler) {
      if (!this.id) {
        return this.$create(successHandler, errorHandler);
      }
      else {
        return this.$update(successHandler, errorHandler);
      }
    };

    return resource;
  };
}])





