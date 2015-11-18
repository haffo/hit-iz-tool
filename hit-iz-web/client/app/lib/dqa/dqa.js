/**
 * Created by haffo on 9/17/15.
 */

var mod = angular.module('hit-dqa', ['common']);
mod
    .controller('DQAConfigCtrl', ['$scope', '$modalInstance','StorageService', function ($scope,$modalInstance,StorageService) {
        $scope.selectedCodes = StorageService.get("DQA_OPTIONS_KEY") != null ? angular.fromJson(StorageService.get("DQA_OPTIONS_KEY")):[];
        $scope.options = {
            errors: [
//                {code: '115', desc: 'Patient birth date is after submission'},
//                {code: '116', desc: 'Patient birth date is in future'},
//                {code: '129', desc: 'Patient death date is before birth'},
//                {code: '130', desc: 'Patient death date is in future'},
//                {code: '491', desc: 'Vaccination admin code is invalid for date administered'},
//                {code: '257', desc: 'Vaccination admin date is before or after licensed vaccine range'},
//                {code: '252', desc: 'Vaccination admin date is after message submitted'},
//                {code: '253', desc: 'Vaccination admin date is after patient death date'},
//                {code: '254', desc: 'Vaccination admin date is after system entry date'},
//                {code: '255', desc: 'Vaccination admin date is before birth'},
//                {code: '259', desc: 'Vaccination admin date is before or after when valid for patient age'},
//                {code: '266', desc: 'Vaccination admin date end is different from start date'},
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
                {code: '266', desc: 'Vaccination admin date end is different from start date'}
            ],
            warnings: [
//                {code: '327', desc: 'Vaccination information source is administered but appears to historical'},
//                {code: '329', desc: 'Vaccination information source is historical but appears to be administered'},
//                {code: '256', desc: 'Vaccination admin date is before or after expected vaccine usage range'},
//                {code: '258', desc: 'Vaccination admin date is before or after when expected for patient age'},
//                {code: '268', desc: 'Vaccination administered amount is invalid'},
//                {code: '276', desc: 'Vaccination body route is invalid for vaccine indicated'},
//                {code: '610', desc: 'Vaccination body route is invalid for body site indicated'},
//                {code: '305', desc: 'Vaccination CVX code is deprecated '},
//                {code: '328', desc: 'Vaccination information source is deprecated'},
                {code: '105', desc: 'Patient address state is deprecated'},
                {code: '107', desc: 'Patient address state is invalid'},
                {code: '109', desc: 'Patient address state is unrecognized'},
                {code: '112', desc: 'Patient address zip is invalid'},
                {code: '95', desc: 'Patient address country is deprecated'},
                {code: '120', desc: 'Patient birth date is very long ago'},
                {code: '133', desc: 'Patient death indicator is inconsistent'},
                {code: '135', desc: 'Patient ethnicity is deprecated'},
                {code: '143', desc: 'Patient gender is deprecated'},
                {code: '156', desc: 'Patient guardian name is same as underage patient'},
                {code: '580', desc: "Patient mother's maiden name has junk name"},
                {code: '581', desc: "Patient mother's maiden name has invalid prefixes"},
                {code: '546', desc: "Patient mother's maiden name is unexpectedly short"},
                {code: '172', desc: 'Patient name may be temporary newborn name'},
                {code: '173', desc: 'Patient name may be test name'},
                {code: '578', desc: 'Patient name has junk name'},
                {code: '405', desc: 'Patient name type code is deprecated '},
                {code: '174', desc: 'Patient phone is incomplete'},
                {code: '453', desc: 'Patient phone tel use code is deprecated'},
                {code: '458', desc: 'Patient phone tel equip code is deprecated'},
                {code: '177', desc: 'Patient primary facility id is deprecated'},
                {code: '183', desc: 'Patient primary language is deprecated'},
                {code: '188', desc: 'Patient primary physician id is deprecated'},
                {code: '194', desc: 'Patient protection indicator is deprecated'},
                {code: '201', desc: 'Patient publicity code is deprecated'},
                {code: '206', desc: 'Patient race is deprecated '},
                {code: '213', desc: 'Patient registry status is deprecated'},
                {code: '232', desc: 'Vaccination action code is deprecated'},
                {code: '327', desc: 'Vaccination information source is administered but appears to historical'},
                {code: '329', desc: 'Vaccination information source is historical but appears to be administered'},
                {code: '256', desc: 'Vaccination admin date is before or after expected vaccine usage range'},
                {code: '258', desc: 'Vaccination admin date is before or after when expected for patient age '},
                {code: '268', desc: 'Vaccination administered amount is invalid '},
                {code: '93', desc: 'Patient address city is invalid'},
                {code: '142', desc: 'Patient name first may include middle initial'},
                {code: '140', desc: 'Patient name first is invalid'}
            ]
        };

        $scope.onCheckAllChange = function ($event,type) {
            var checkbox = $event.target;
            if(checkbox.checked){
                $scope.selectAllCodes(type);
            }else{
                $scope.unselectAllCodes(type);
            }
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

        $scope.selectAll = function ($event) {
            $scope.selectedCodes = [];
            var checkbox = $event.target;
            if(checkbox.checked){
                $scope.selectAllCodes('errors');
                $scope.selectAllCodes('warnings');
            }else{
                $scope.unselectAllCodes('errors');
                $scope.unselectAllCodes('warnings');
            }
        };

//        $scope.unselectAll = function (code) {
//            $scope.selectedCodes = [];
//            $scope.unselectAllCodes('errors');
//            $scope.unselectAllCodes('warnings');
//        };


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
