'use strict';

angular.module('xml', []);
angular.module('hl7', []);
angular.module('commonServices', []);
angular.module('common', ['ngResource', 'my.resource', 'xml', 'hl7']);
angular.module('soap', ['common']);
angular.module('cf', ['common']);
angular.module('doc', ['common']);
angular.module('cb', ['common']);
angular.module('envelope', ['soap']);
angular.module('connectivity', ['soap']);
angular.module('isolated', ['common']);
angular.module('hit-tool-directives', []);
angular.module('hit-tool-services', ['common']);
var app = angular.module('tool', [
    'ngRoute',
    'ui.bootstrap',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngAnimate',
    'ui.bootstrap',
    'angularBootstrapNavTree',
    'ui.grid', 'ui.grid.infiniteScroll',
    'ui.grid.treeView',
    'QuickList',
    'treeControl',
//    'ngGrid',
//    'treeGrid',
//    'angular-loading-bar',
    'soap',
    'xml',
    'hl7',
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
    'hit-profile-viewer',
    'hit-validation-result',
    'hit-vocab-search',
    'hit-report-viewer',
    'hit-testcase-viewer'
]);

app.config(function ($routeProvider, $httpProvider) {
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

//    $httpProvider.responseInterceptors.push('503Interceptor');
//    $httpProvider.responseInterceptors.push('sessionTimeoutInterceptor');
//    $httpProvider.responseInterceptors.push('404Interceptor');
});

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

app.run(function ($rootScope, $location, $modal, TestingSettings, AppInfo,$q,$sce,$templateCache) {

    $rootScope.appInfo = {};

    new AppInfo().then(function(appInfo){
        $rootScope.appInfo = appInfo;
    }, function(error){
        $rootScope.appInfo = {};
    });


    $rootScope.$watch(function () {
        return $location.path();
    }, function (newLocation, oldLocation) {
        if(newLocation != null) {
            $rootScope.setActive(newLocation);
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
            return new AppInfo().then(function(appInfo){
                $rootScope.appInfo = appInfo;
                delay.resolve($rootScope.appInfo);
                return delay.promise;
            })
        } else {
            delay.resolve($rootScope.appInfo);
            return delay.promise;
        }
    };

    $rootScope.tabs = new Array();





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










