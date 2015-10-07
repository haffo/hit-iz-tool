angular.module('home')
    .controller('HomeCtrl', ['$scope', '$window', '$rootScope', 'StorageService',function ($scope, $window, $rootScope, IsolatedSystem,StorageService) {

        $scope.myInterval = 5000;
        $scope.noWrapSlides = false;
        $scope.slideActive = [];
        $scope.slideActive[0] = false;
        $scope.slideActive[1] = false;
        $scope.slideActive[2] = false;
        $scope.slideActive[3] = false;



    }]);