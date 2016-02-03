'use strict';

angular.module('commonServices', []);
angular.module('common', ['ngResource', 'my.resource', 'default', 'xml', 'hl7v2-edi', 'hl7v2', 'edi', 'soap']);
angular.module('cf', ['common']);
angular.module('doc', ['common']);
angular.module('cb', ['common']);
angular.module('envelope', ['soap']);
angular.module('connectivity', ['soap']);
angular.module('isolated', ['common']);
angular.module('hit-tool-directives', []);
angular.module('hit-tool-services', ['common']);
angular.module('documentation', []);
var app = angular.module('tool', [
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
    'isolated',
    'ngTreetable',
    'blueimp.fileupload',
    'hit-tool-directives',
    'hit-tool-services',
    'commonServices',
    'smart-table',
    'doc',
    'hit-vocab-search',
    'hit-profile-viewer',
    'hit-validation-result',
    'hit-report-viewer',
    'hit-testcase-details',
    'hit-testcase-tree',
    'hit-doc',
    'hit-dqa',
    'hit-settings',
    'documentation'
]);

var httpHeaders;

app.config(function ($routeProvider, $httpProvider, localStorageServiceProvider, KeepaliveProvider, IdleProvider) {

    localStorageServiceProvider
        .setPrefix('hit-tool')
        .setStorageType('sessionStorage');

    $routeProvider
        .when('/', {
            templateUrl: 'views/home.html'
        })
        .when('/home', {
            templateUrl: 'views/home.html'
        })
        .when('/doc', {
            templateUrl: 'views/doc.html'
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
//        .when('/is', {
//            templateUrl: 'views/isolated/isolated.html'
//        })
        .when('/cb', {
            templateUrl: 'views/cb/cb.html'
        })
        .when('/blank', {
            templateUrl: 'blank.html'
        })
        .when('/error', {
            templateUrl: 'error.html'
        })
        .otherwise({
            redirectTo: '/'
        });

    $httpProvider.interceptors.push('ErrorInterceptor');


    IdleProvider.idle(7200);
    IdleProvider.timeout(30);
    KeepaliveProvider.interval(10);

    httpHeaders = $httpProvider.defaults.headers;

});


app.factory('ErrorInterceptor', function ($q, $rootScope, $location, StorageService, $window) {
    var handle = function (response) {
        if (response.status === 440) {
            response.data = "Session timeout";
            $rootScope.openSessionExpiredDlg();
        } else if (response.status === 498) {
            response.data = "Invalid Application State";
            $rootScope.openVersionChangeDlg();
        } else if (response.status === 401) {
            $rootScope.openInvalidReqDlg();
        }
    };
    return {
        responseError: function (response) {
            handle(response);
            return $q.reject(response);
        }
    };
});

//
//
//
// .factory('sessionTimeoutInterceptor', function ($injector, $q, $rootScope) {
//    return function (responsePromise) {
//        return responsePromise.then(null, function (errResponse) {
//            if (errResponse.reason === "The session has expired") {
//                $rootScope.showError(errResponse);
//            } else {
//                return $q.reject(errResponse);
//            }
//        });
//    };
//}).factory('404Interceptor', function ($injector, $q, $rootScope) {
//    return function (responsePromise) {
//        return responsePromise.then(null, function (errResponse) {
//            if (errResponse.status === 404) {
//                errResponse.data = "Cannot reach the server. The server might be down";
//            }
//            return $q.reject(errResponse);
//        });
//    };
//});

app.run(function (Session, $rootScope, $location, $modal, TestingSettings, AppInfo, $q, $sce, $templateCache, $compile, StorageService, $window, $route, $timeout, $http, User, Idle) {


    $rootScope.appInfo = {};

    $rootScope.stackPosition = 0;

    $rootScope.scrollbarWidth = null;
    $rootScope.vcModalInstance = null;
    $rootScope.sessionExpiredModalInstance = null;
    $rootScope.errorModalInstanceInstance = null;
    Session.create().then(function (response) {
        // load current user
        User.load().then(function (response) {
        }, function (error) {
            $rootScope.openCriticalErrorDlg("Sorry we could not create a new user for your session. Please refresh the page and try again.");
        });
        // load app info
        AppInfo.get().then(function (appInfo) {
            $rootScope.appInfo = appInfo;
            httpHeaders.common['rsbVersion'] = appInfo.rsbVersion;
            var previousToken = StorageService.get(StorageService.APP_STATE_TOKEN);
            if (previousToken != null && previousToken !== appInfo.rsbVersion) {
                $rootScope.openVersionChangeDlg();
            }
            StorageService.set(StorageService.APP_STATE_TOKEN, appInfo.rsbVersion);
        }, function (error) {
            $rootScope.appInfo = {};
            $rootScope.openCriticalErrorDlg("Sorry we could not communicate with the server. Please try again");
        });
    }, function (error) {
        $rootScope.openCriticalErrorDlg("Sorry we could not start your session. Please refresh the page and try again.");
    });


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


    $rootScope.showError = function (error) {
        var modalInstance = $modal.open({
            templateUrl: 'ErrorDlgDetails.html',
            controller: 'ErrorDetailsCtrl',
            resolve: {
                error: function () {
                    return error;
                }
            }
        });
        modalInstance.result.then(function (error) {
            $rootScope.error = error;
        }, function () {
        });
    };

    $rootScope.cutString = function (str) {
        if (str.length > 20) str = str.substring(0, 20) + "...";
        return str;
    };

    $rootScope.toHTML = function (content) {
        return $sce.trustAsHtml(content);
        //return  content;
    };


    $rootScope.selectTestingType = function (value) {
        $rootScope.tabs[0] = false;
        $rootScope.tabs[1] = false;
        $rootScope.tabs[2] = false;
        $rootScope.tabs[3] = false;
        $rootScope.tabs[4] = false;
        $rootScope.tabs[5] = false;
        $rootScope.activeTab = value;
        $rootScope.tabs[$rootScope.activeTab] = true;
        TestingSettings.setActiveTab($rootScope.activeTab);
    };
    $rootScope.downloadArtifact = function (path) {
        var form = document.createElement("form");
        form.action = "api/artifact/download";
        form.method = "POST";
        form.target = "_target";
        var input = document.createElement("input");
        input.name = "path";
        input.value = path;
        form.appendChild(input);
        form.style.display = 'none';
        document.body.appendChild(form);
        form.submit();
    };


    $rootScope.tabs = new Array();

    $rootScope.compile = function (content) {
        return $compile(content);
    };


    $rootScope.$on('$locationChangeSuccess', function () {
        $rootScope.setActive($location.path());
    });


    $rootScope.getScrollbarWidth = function () {

        if ($rootScope.scrollbarWidth == null) {
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


    $rootScope.openValidationResultInfo = function () {
        var modalInstance = $modal.open({
            templateUrl: 'ValidationResultInfoCtrl.html',
            windowClass: 'profile-modal',
            controller: 'ValidationResultInfoCtrl'
        });
    };

    $rootScope.openVersionChangeDlg = function () {
        StorageService.clearAll();
        if(!$rootScope.vcModalInstance || $rootScope.vcModalInstance === null || !$rootScope.vcModalInstance.opened) {
            $rootScope.vcModalInstance = $modal.open({
                templateUrl: 'VersionChanged.html',
                size: 'lg',
                backdrop: 'static',
                keyboard: 'false',
                'controller': 'FailureCtrl',
                resolve: {
                    error: function () {
                        return "";
                    }
                }
            });
            $rootScope.vcModalInstance.result.then(function () {
                $rootScope.clearTemplate();
                $rootScope.reloadPage();
            }, function () {
                $rootScope.clearTemplate();
                $rootScope.reloadPage();
            });
        }
    };

    $rootScope.openCriticalErrorDlg = function (errorMessage) {
        StorageService.clearAll();
        if(!$rootScope.errorModalInstance || $rootScope.errorModalInstance === null || !$rootScope.errorModalInstance.opened) {
            $rootScope.errorModalInstance = $modal.open({
                templateUrl: 'CriticalError.html',
                size: 'lg',
                backdrop: true,
                keyboard: 'true',
                'controller': 'FailureCtrl',
                resolve: {
                    error: function () {
                        return errorMessage;
                    }
                }
            });
            $rootScope.errorModalInstance.result.then(function () {
                $rootScope.clearTemplate();
                $rootScope.reloadPage();
            }, function () {
                $rootScope.clearTemplate();
                $rootScope.reloadPage();
            });
        }
    };

    $rootScope.openSessionExpiredDlg = function () {
        StorageService.clearAll();
        if(!$rootScope.sessionExpiredModalInstance || $rootScope.sessionExpiredModalInstance === null || !$rootScope.sessionExpiredModalInstance.opened) {
            $rootScope.sessionExpiredModalInstance = $modal.open({
                templateUrl: 'timedout-dialog.html',
                size: 'lg',
                backdrop: true,
                keyboard: 'true',
                'controller': 'FailureCtrl',
                resolve: {
                    error: function () {
                        return "";
                    }
                }
            });
            $rootScope.sessionExpiredModalInstance.result.then(function () {
                $rootScope.clearTemplate();
                $rootScope.reloadPage();
            }, function () {
                $rootScope.clearTemplate();
                $rootScope.reloadPage();
            });
        }
    };


    $rootScope.clearTemplate = function () {
        $templateCache.removeAll();
    };

    $rootScope.openErrorDlg = function () {
        $location.path('/error');
    };

    $rootScope.pettyPrintType = function (type) {
        return type === 'TestStep' ? 'Test Step' : type === 'TestCase' ? 'Test Case' : type;
    };


    $rootScope.reloadPage = function () {
        $window.location.reload();
    };

    $rootScope.openInvalidReqDlg = function () {
        if(!$rootScope.errorModalInstance || $rootScope.errorModalInstance === null || !$rootScope.errorModalInstance.opened) {
            $rootScope.errorModalInstance = $modal.open({
                templateUrl: 'InvalidReqCtrl.html',
                size: 'lg',
                backdrop: true,
                keyboard: 'false',
                'controller': 'FailureCtrl',
                resolve: {
                    error: function () {
                        return "";
                    }
                }
            });
            $rootScope.errorModalInstance.result.then(function () {
                $rootScope.reloadPage();
            }, function () {
                $rootScope.reloadPage();
            });
        }
    };

    $rootScope.openNotFoundDlg = function () {
        if(!$rootScope.errorModalInstance || $rootScope.errorModalInstance === null || !$rootScope.errorModalInstance.opened) {
            $rootScope.errorModalInstance = $modal.open({
                    templateUrl: 'NotFoundCtrl.html',
                    size: 'lg',
                    backdrop: true,
                    keyboard: 'false',
                    'controller': 'FailureCtrl',
                    resolve: {
                        error: function () {
                            return "";
                        }
                    }
                });

            $rootScope.errorModalInstance.result.then(function () {
                $rootScope.reloadPage();
            }, function () {
                $rootScope.reloadPage();
            });
        }
    };


    $rootScope.nav = function (target) {
        $location.path(target);
    };

    $rootScope.showSettings = function () {
        var modalInstance = $modal.open({
            templateUrl: 'SettingsCtrl.html',
            size: 'lg',
            keyboard: 'false',
            controller: 'SettingsCtrl'
        });
    };

//    $rootScope.$on('$routeChangeStart', function(event, next, current) {
//        if (typeof(current) !== 'undefined'){
//            $templateCache.remove(current.templateUrl);
//        }
//    });


    $rootScope.started = false;

    Idle.watch();

    $rootScope.$on('IdleStart', function () {
        closeModals();
        $rootScope.warning = $modal.open({
            templateUrl: 'warning-dialog.html',
            windowClass: 'modal-danger'
        });
    });

    $rootScope.$on('IdleEnd', function () {
        closeModals();
    });

    $rootScope.$on('IdleTimeout', function () {
        closeModals();
        StorageService.clearAll();
        Session.delete().then(
            function (response) {
                $rootScope.timedout = $modal.open({
                    templateUrl: 'timedout-dialog.html',
                    windowClass: 'modal-danger',
                    backdrop: true,
                    keyboard: 'false',
                    controller: 'FailureCtrl',
                    resolve: {
                        error: function () {
                            return "";
                        }
                    }
                });
                $rootScope.timedout.result.then(function () {
                    $rootScope.clearTemplate();
                    $rootScope.reloadPage();
                }, function () {
                    $rootScope.clearTemplate();
                    $rootScope.reloadPage();
                });
            }
        );
    });

    function closeModals() {
        if ($rootScope.warning) {
            $rootScope.warning.close();
            $rootScope.warning = null;
        }
        if ($rootScope.timedout) {
            $rootScope.timedout.close();
            $rootScope.timedout = null;
        }
    };

    $rootScope.start = function () {
        closeModals();
        Idle.watch();
        $rootScope.started = true;
    };

    $rootScope.stop = function () {
        closeModals();
        Idle.unwatch();
        $rootScope.started = false;
    };

});


angular.module('ui.bootstrap.carousel', ['ui.bootstrap.transition'])
    .controller('CarouselController', ['$scope', '$timeout', '$transition', '$q', function ($scope, $timeout, $transition, $q) {
    }]).directive('carousel', [function () {
        return {

        }
    }]);


angular.module('hit-tool-services').factory('TabSettings',
    ['$rootScope', function ($rootScope) {
        return {
            new: function (key) {
                return{
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


angular.module('commonServices').factory('Clock', function ($interval) {
    var Clock = function (intervl) {
        this.value = undefined;
        this.intervl = intervl;
    };
    Clock.prototype.start = function (fn) {
        if (angular.isDefined(this.value)) {
            this.stop();
        }
        this.value = $interval(fn, this.intervl);
    };
    Clock.prototype.stop = function () {
        if (angular.isDefined(this.value)) {
            $interval.cancel(this.value);
            this.value = undefined;
        }
    };
    return Clock;
});

//
//angular.module('hit-tool-services').factory('AppInfo', ['$http', '$q', function ($http, $q) {
//    return function () {
//        var delay = $q.defer();
//        $http.get('api/appInfo').then(
//            function (object) {
//                delay.resolve(angular.fromJson(object.data));
//            },
//            function (response) {
//                delay.reject(response.data);
//            }
//        );
////
////        $http.get('../../resources/appInfo.json').then(
////            function (object) {
////                delay.resolve(angular.fromJson(object.data));
////            },
////            function (response) {
////                delay.reject(response.data);
////            }
////        );
//
//        return delay.promise;
//    };
//}]);


app.controller('TableFoundCtrl', function ($scope, $modalInstance, table) {
    $scope.table = table;
    $scope.tmpTableElements = [].concat(table != null ? table.valueSetElements : []);
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});


app.controller('ValidationResultInfoCtrl', [ '$scope', '$modalInstance',
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

app.directive('stRatio', function () {
    return {

        link: function (scope, element, attr) {
            var ratio = +(attr.stRatio);
            element.css('width', ratio + '%');
        }
    };
});


app.controller('ErrorCtrl', [ '$scope', '$modalInstance', 'StorageService', '$window',
    function ($scope, $modalInstance, StorageService, $window) {
        $scope.refresh = function () {
            $modalInstance.close($window.location.reload());
        };
    }
]);

app.controller('FailureCtrl', [ '$scope', '$modalInstance', 'StorageService', '$window', 'error',
    function ($scope, $modalInstance, StorageService, $window, error) {
        $scope.error = error;
        $scope.close = function () {
            $modalInstance.close();
        };
    }
]);








