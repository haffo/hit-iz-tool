/**
 * Created by haffo on 9/17/15.
 */

var mod = angular.module('hit-settings', ['common']);
mod
    .controller('SettingsCtrl', function ($scope, $modalInstance, StorageService, $rootScope, Settings) {

        $scope.options = angular.copy(Settings.options);

        $scope.onCheckAllValidationOptions = function ($event) {
            var checkbox = $event.target;
            if (checkbox.checked) {
                $scope.selectAllValidationOptions();
            } else {
                $scope.unselectAllValidationOptions();
            }
        };

        $scope.selectAllValidationOptions = function () {
            $scope.options.validation.show.errors = true;
            $scope.options.validation.show.alerts = true;
            $scope.options.validation.show.warnings = true;
            $scope.options.validation.show.affirmatives = true;
          };

        $scope.isAllValidationOptionsChecked = function () {
            return
            $scope.options.validation.show.errors &&
            $scope.options.validation.show.alerts &&
            $scope.options.validation.show.warnings &&
            $scope.options.validation.show.affirmatives
          };

        $scope.unselectAllValidationOptions = function () {
            $scope.options.validation.show.errors = true;
            $scope.options.validation.show.alerts = false;
            $scope.options.validation.show.warnings = false;
            $scope.options.validation.show.affirmatives = false;
          };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.save = function () {
            Settings.set($scope.options);
            $modalInstance.close($scope.options);
        };

    });


mod.factory('Settings',
    ['StorageService', function (StorageService) {
        var options = StorageService.get(StorageService.SETTINGS_KEY) == null ? {
            validation: {
                show: {
                    errors: true,
                    alerts: true,
                    warnings: true,
                    affirmatives: false,
                    ignores: true
                }
            }
        } : angular.fromJson(StorageService.get(StorageService.SETTINGS_KEY));

        var Settings = {
            options: options,
            set: function (options) {
                Settings.options = options;
                StorageService.set(StorageService.SETTINGS_KEY, angular.toJson(options));
            }
        };
        return Settings;
    }]);