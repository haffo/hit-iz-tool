'use strict';

angular.module('tool')
    .controller('TestingCtrl', ['$scope', '$q', '$rootScope', 'TestingSettings', function ($scope, $q, $rootScope, TestingSettings) {
        $scope.loading = false;

        /*
         *
         */
        $scope.init = function () {
            TestingSettings.restore();
            $rootScope.selectTestingType(TestingSettings.getActiveTab());
        };

    }]);


angular.module('tool').controller('ValidationResultDetailsCtrl', function ($scope, $modalInstance, selectedElement) {

    $scope.selectedElement = selectedElement;

    $scope.ok = function () {
        $modalInstance.close($scope.selectedElement);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

