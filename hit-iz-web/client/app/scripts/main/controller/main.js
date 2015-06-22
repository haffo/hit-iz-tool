'use strict';

angular.module('tool')
    .controller('MainCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {

//        Idle.watch();
//
//        $rootScope.$on('IdleStart', function () {
//            closeModals();
//            $rootScope.warning = $modal.open({
//                templateUrl: 'warning-dialog.html',
//                windowClass: 'modal-danger'
//            });
//        });
//
//        $rootScope.$on('IdleEnd', function () {
//            closeModals();
//        });
//
//        $rootScope.$on('IdleTimeout', function () {
//            closeModals();
//            $rootScope.timedout = $modal.open({
//                templateUrl: 'timedout-dialog.html',
//                windowClass: 'modal-danger'
//            });
//        });
//
//        function closeModals() {
//            if ($rootScope.warning) {
//                $rootScope.warning.close();
//                $rootScope.warning = null;
//            }
//
//            if ($rootScope.timedout) {
//                $rootScope.timedout.close();
//                $rootScope.timedout = null;
//            }
//        };
//
//        $rootScope.start = function () {
//            closeModals();
//            Idle.watch();
//            $rootScope.started = true;
//        };
//
//        $rootScope.stop = function () {
//            closeModals();
//            Idle.unwatch();
//            $rootScope.started = false;
//
//        };

    }]);
