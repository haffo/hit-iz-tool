'use strict';

angular.module('xml', []);
angular.module('hl7', []);
angular.module('commonServices', []);
angular.module('common', ['ngResource', 'my.resource', 'xml', 'hl7']);
angular.module('soap', ['common']);
angular.module('contextFree', ['common']);
angular.module('doc', ['common']);
angular.module('contextBased', ['common']);
angular.module('envelope', ['soap']);
angular.module('connectivity', ['soap']);
angular.module('profile-viewer', ['common']);
angular.module('tool-directives', []);
angular.module('tool-services', ['common']);
var app = angular.module('tool', [
    'ngRoute',
    'ui.bootstrap',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngAnimate',
    'ui.bootstrap',
    'angularBootstrapNavTree',
//    'ngGrid',
//    'treeGrid',
//    'angular-loading-bar',
    'soap',
    'xml',
    'hl7',
    'envelope',
    'connectivity',
    'contextFree',
    'contextBased',
    'profile-viewer',
    'ngTreetable',
    'blueimp.fileupload',
    'tool-directives',
    'tool-services',
    'commonServices',
    'smart-table',
    'doc'
]);

app.config(function ($routeProvider, $httpProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/home.html'
        })
        .when('/home', {
            templateUrl: 'views/home.html'
        })
        .when('/testing', {
            templateUrl: 'views/testing/testing.html'
        })
        .when('/doc', {
            templateUrl: 'views/documentation/doc.html'
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
        .otherwise({
            redirectTo: '/'
        });

    $httpProvider.responseInterceptors.push('503Interceptor');
    $httpProvider.responseInterceptors.push('sessionTimeoutInterceptor');

});

app.factory('503Interceptor', function ($injector, $q, $rootScope) {
    return function (responsePromise) {
        return responsePromise.then(null, function (errResponse) {
            if (errResponse.status === 503) {
                $rootScope.showError(errResponse);
            } else {
                return $q.reject(errResponse);
            }
        });
    };
}).factory('sessionTimeoutInterceptor', function ($injector, $q, $rootScope) {
    return function (responsePromise) {
        return responsePromise.then(null, function (errResponse) {
            if (errResponse.reason === "The session has expired") {
                $rootScope.showError(errResponse);
            } else {
                return $q.reject(errResponse);
            }
        });
    };
});

app.run(function ($rootScope, $location, $modal, TestingSettings, AppInfo) {
    $rootScope.appInfo = {};

    $rootScope.$watch(function () {
        return $location.path();
    }, function (newLocation, oldLocation) {
        $rootScope.setActive(newLocation);
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

    new AppInfo().then(function (response) {
        $rootScope.appInfo = response;
    });

    $rootScope.tabs = new Array();
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

});


angular.module('ui.bootstrap.carousel', ['ui.bootstrap.transition'])
    .controller('CarouselController', ['$scope', '$timeout', '$transition', '$q', function ($scope, $timeout, $transition, $q) {
    }]).directive('carousel', [function () {
        return {

        }
    }]);


angular.module('tool-services').factory('TabSettings',
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


angular.module('tool-services').factory('AppInfo', ['$http', '$q', function ($http, $q) {
    return function () {
        var delay = $q.defer();
//        $http.get('api/appInfo').then(
//            function (object) {
//                delay.resolve(angular.fromJson(object.data));
//            },
//            function (response) {
//                delay.reject(response.data);
//            }
//        );


        $http.get('../../resources/appInfo.json').then(
            function (object) {
                delay.resolve(angular.fromJson(object.data));
            },
            function (response) {
                delay.reject(response.data);
            }
        );

        return delay.promise;
    };
}]);


angular.module('tool-services').controller('TableFoundCtrl', function ($scope, $modalInstance, table) {
    $scope.table = table;
    $scope.tmpTableElements = [].concat(table != null ? table.tableElements : []);
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});









