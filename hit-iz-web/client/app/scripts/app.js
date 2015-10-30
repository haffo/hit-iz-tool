'use strict';

angular.module('commonServices', []);
angular.module('common', ['ngResource', 'my.resource', 'default', 'xml', 'hl7v2-edi', 'hl7v2', 'edi','soap']);
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
    'hit-testcase-viewer',
    'hit-testcase-tree',
    'hit-doc',
    'hit-dqa',
    'documentation'
]);

app.config(function ($routeProvider, $httpProvider, localStorageServiceProvider) {

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
            templateUrl: 'views/envelope/testing.html'
        })
        .when('/soapConn', {
            templateUrl: 'views/connectivity/testing.html'
        })
        .when('/cf', {
            templateUrl: 'views/cf/testing.html'
        })
        .when('/is', {
            templateUrl: 'views/isolated/testing.html'
        })
        .when('/cb', {
            templateUrl: 'views/cb/testing.html'
        })
        .otherwise({
            redirectTo: '/'
        });

    $httpProvider.interceptors.push('dataChangedInterceptor');

});

app.factory('dataChangedInterceptor', ['$q','$rootScope', function($q, $rootScope) {
    var responseInterceptor = {
        response: function(resp) {
            var deferred = $q.defer();
            var dTime =  resp.config.headers['dTime'];
            if (dTime && dTime != null && $rootScope.appInfo.date != null && dTime!== $rootScope.appInfo.date){
                $rootScope.openVersionChangeDlg();
            }
            deferred.resolve(resp);
            return deferred.promise;
        }
    };

    return responseInterceptor;
}]);

//app.factory('503Interceptor', function ($injector, $q, $rootScope) {
//    return function (responsePromise) {
//        return responsePromise.then(null, function (errResponse) {
//            if (errResponse.status === 503) {
//                $rootScope.showError(errResponse);
//            } else {
//                return $q.reject(errResponse);
//            }
//        });
//    };
//}).factory('sessionTimeoutInterceptor', function ($injector, $q, $rootScope) {
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

app.run(function ($rootScope, $location, $modal, TestingSettings, AppInfo, $q, $sce, $templateCache, $compile, StorageService, $window, $route,$timeout) {

    $rootScope.appInfo = {};

    $rootScope.stackPosition = 0;

    $rootScope.scrollbarWidth = null;


    new AppInfo().then(function (appInfo) {
        $rootScope.appInfo = appInfo;
    }, function (error) {
        $rootScope.appInfo = {};
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
//
//            if (newLocation != null) {
//                $rootScope.setActive(newLocation);
//            }

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

    $rootScope.initAppInfo = function () {
        var delay = $q.defer();
        if ($rootScope.appInfo === null) {
            return new AppInfo().then(function (appInfo) {
                $rootScope.appInfo = appInfo;
                delay.resolve($rootScope.appInfo);
                return delay.promise;
            })
        } else {
            delay.resolve($rootScope.appInfo);
            return delay.promise;
        }
    };


    $rootScope.downloadArtifact = function (path) {
        var form = document.createElement("form");
        form.action = "api/testartifact/download";
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
//        scope.$watch(
//            function(scope) {
//                // watch the 'compile' expression for changes
//                return scope.$eval(attrs.compile);
//            },
//            function(value) {
//                // when the 'compile' expression changes
//                // assign it into the current DOM
//                element.html(value);
//
//                // compile the new DOM and link it to the current
//                // scope.
//                // NOTE: we only compile .childNodes so that
//                // we don't get into infinite loop compiling ourselves
//                return $compile(content);
//            }
//        );
        return $compile(content);
    };


    $rootScope.$on('$locationChangeSuccess', function () {
        //$rootScope.activePath = $location.path();
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
        var modalInstance = $modal.open({
            templateUrl: 'VersionChangeCtrl.html',
            size:'lg',
            keyboard:'false',
            controller: 'VersionChangeCtrl'
        });
    };

    $rootScope.nav = function (target) {
        $location.path(target);
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


angular.module('hit-tool-services').factory('AppInfo', ['$http', '$q', function ($http, $q) {
    return function () {
        var delay = $q.defer();
        $http.get('api/appInfo').then(
            function (object) {
                delay.resolve(angular.fromJson(object.data));
            },
            function (response) {
                delay.reject(response.data);
            }
        );

//        $http.get('../../resources/appInfo.json').then(
//            function (object) {
//                delay.resolve(angular.fromJson(object.data));
//            },
//            function (response) {
//                delay.reject(response.data);
//            }
//        );

        return delay.promise;
    };
}]);


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


app.controller('VersionChangeCtrl', [ '$scope', '$modalInstance','StorageService','$window',
    function ($scope, $modalInstance,StorageService,$window) {
        $scope.refresh = function () {
            StorageService.clearAll();
            $modalInstance.close($window.location.reload());
        };
    }
]);








