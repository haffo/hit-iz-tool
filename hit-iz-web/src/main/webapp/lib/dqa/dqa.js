/**
 * Created by haffo on 9/17/15.
 */

var mod = angular.module('hit-dqa', ['common']);
mod
    .controller('DQAConfigCtrl', ['$scope', '$modalInstance','StorageService', function ($scope,$modalInstance,StorageService) {
        $scope.selectedCodes = StorageService.get("DQA_OPTIONS_KEY") != null ? angular.fromJson(StorageService.get("DQA_OPTIONS_KEY")):[];
        $scope.options = {
            errors: [
                {code: '115', desc: 'Patient birth date is after submission'},
                {code: '116', desc: 'Patient birth date is in future'},
                {code: '129', desc: 'Patient death date is before birth'},
                {code: '130', desc: 'Patient death date is in future'},
                {code: '491', desc: 'Vaccination admin code is invalid for date administered'},
                {code: '257', desc: 'Vaccination admin date is before or after licensed vaccine range'},
                {code: '252', desc: 'Vaccination admin date is after message submitted'},
                {code: '253', desc: 'Vaccination admin date is after patient death date'},
                {code: '254', desc: 'Vaccination admin date is after system entry date'},
                {code: '255', desc: 'Vaccination admin date is before birth'},
                {code: '259', desc: 'Vaccination admin date is before or after when valid for patient age'},
                {code: '266', desc: 'Vaccination admin date end is different from start date'}
            ],
            warnings: [
                {code: '327', desc: 'Vaccination information source is administered but appears to historical'},
                {code: '329', desc: 'Vaccination information source is historical but appears to be administered'},
                {code: '256', desc: 'Vaccination admin date is before or after expected vaccine usage range'},
                {code: '258', desc: 'Vaccination admin date is before or after when expected for patient age'},
                {code: '268', desc: 'Vaccination administered amount is invalid'},
                {code: '276', desc: 'Vaccination body route is invalid for vaccine indicated'},
                {code: '610', desc: 'Vaccination body route is invalid for body site indicated'},
                {code: '305', desc: 'Vaccination CVX code is deprecated '},
                {code: '328', desc: 'Vaccination information source is deprecated'}
            ]
        };

        $scope.onCodeCheck = function ($event,code) {
            var checkbox = $event.target;
            if(checkbox.checked){
                $scope.selectCode(code);
            }else{
                $scope.unselectCode(code);
            }
        };

        $scope.selectCode = function (code) {
            var index = $scope.selectedCodes.indexOf(code);
            if(index < 0) {
                $scope.selectedCodes.push(code);
            }
        };

        $scope.unselectCode = function (code) {
            var index = $scope.selectedCodes.indexOf(code);
            if(index >= 0) {
                $scope.selectedCodes.splice(index, 1);
            }
        };

        $scope.selectAll = function (code) {
            $scope.selectedCodes = [];
            $scope.selectAllCodes('errors');
            $scope.selectAllCodes('warnings');
        };

        $scope.unselectAll = function (code) {
            $scope.selectedCodes = [];
            $scope.unselectAllCodes('errors');
            $scope.unselectAllCodes('warnings');
        };


        $scope.selectAllCodes = function (type) {
            angular.forEach($scope.options[type], function (obj) {
                $scope.selectCode(obj.code);
            });
        };

        $scope.unselectAllCodes = function (type) {
            angular.forEach($scope.options[type], function (obj) {
                $scope.unselectCode(obj.code);
            });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.save = function () {
            StorageService.set(StorageService.DQA_OPTIONS_KEY,angular.toJson($scope.selectedCodes));
            $modalInstance.close($scope.selectedCodes);
        };

    }]);
