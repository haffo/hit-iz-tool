'use strict';


angular.module('upload')
    .controller('UploadCtrlCACA', ['$scope', '$http', '$window', '$modal', '$filter', '$rootScope', '$timeout', 'StorageService', 'TestCaseService', 'TestStepService', 'FileUploader', 'Notification', '$modalInstance', 'userInfoService','ProfileGroupListLoader', function ($scope, $http, $window, $modal, $filter, $rootScope, $timeout, StorageService, TestCaseService, TestStepService, FileUploader, Notification, $modalInstance, userInfoService,ProfileGroupListLoader) {
        FileUploader.FileSelect.prototype.isEmptyAfterSelection = function () {
            return true;
        };
        $scope.step = 0;

        $scope.testcase = null;
        $scope.existingTP = {selected: null};
        $scope.selectedTP = {id: null};
        $scope.selectedScope = {key: 'USER'};
        $scope.groupScopes = [];
        $scope.allGroupScopes = [{key: 'USER', name: 'Private'}, {
            key: 'GLOBAL',
            name: 'Public'
        }];


        $scope.profileValidationErrors = [];
        $scope.valueSetValidationErrors = [];
        $scope.constraintValidationErrors = [];

        $scope.existingTestPlans = null;

        $scope.profileCheckToggleStatus = true;

        var profileUploader = $scope.profileUploader = new FileUploader({
            url: 'api/upload/uploadProfile',
            filters: [{
                name: 'xmlFilter',
                fn: function (item) {
                    return /\/(xml)$/.test(item.type);
                }
            }]
        });

        var vsUploader = $scope.vsUploader = new FileUploader({
            url: 'api/upload/uploadVS',
            filters: [{
                name: 'xmlFilter',
                fn: function (item) {
                    return /\/(xml)$/.test(item.type);
                }
            }]
        });

        var constraintsUploader = $scope.constraintsUploader = new FileUploader({
            url: 'api/upload/uploadContraints',
            filters: [{
                name: 'xmlFilter',
                fn: function (item) {
                    return /\/(xml)$/.test(item.type);
                }
            }]
        });


        var zipUploader = $scope.zipUploader = new FileUploader({
            url: 'api/upload/uploadZip',
            autoUpload: true,
            filters: [{
                name: 'zipFilter',
                fn: function (item) {
                    return /\/(zip)$/.test(item.type);
                }
            }]
        });


//        $http.get('../../resources/upload/uploadprofile.json').then(
//                function (object) {
//                	$scope.profileMessages = angular.fromJson(object.data.profiles);
//                },
//                function (response) {
//                }
//            );
//        $http.get('../../resources/upload/resourceError.json').then(
//                function (object) {
//                	
//                	$scope.profileValidationErrors = angular.fromJson(object.data.errors);
//                	$scope.constraintValidationErrors = angular.fromJson(object.data.errors);
//                },
//                function (response) {
//                }
//            );


        profileUploader.onErrorItem = function (fileItem, response, status, headers) {
            Notification.error({
                message: "There was an error while uploading " + fileItem.file.name,
                templateUrl: "NotificationErrorTemplate.html",
                scope: $rootScope,
                delay: 10000
            });
            $scope.step = 1;
        };

        vsUploader.onCompleteItem = function (fileItem, response, status, headers) {
            if (response.success == false) {
                Notification.error({
                    message: "The value set file you uploaded is not valid, please check and correct the error(s) and try again",
                    templateUrl: "NotificationErrorTemplate.html",
                    scope: $rootScope,
                    delay: 10000
                });
                $scope.step = 1;
                $scope.valueSetValidationErrors = angular.fromJson(response.errors);
            }
        };

        constraintsUploader.onCompleteItem = function (fileItem, response, status, headers) {
            if (response.success == false) {
                Notification.error({
                    message: "The constraint file you uploaded is not valid, please check and correct the error(s) and try again",
                    templateUrl: "NotificationErrorTemplate.html",
                    scope: $rootScope,
                    delay: 10000
                });
                $scope.step = 1;
                $scope.constraintValidationErrors = angular.fromJson(response.errors);
            }
        };

        profileUploader.onCompleteItem = function (fileItem, response, status, headers) {
            if (response.success == false) {
                Notification.error({
                    message: "The profile file you uploaded is not valid, please check and correct the error(s) and try again",
                    templateUrl: "NotificationErrorTemplate.html",
                    scope: $rootScope,
                    delay: 10000
                });
                $scope.step = 1;
                $scope.profileValidationErrors = angular.fromJson(response.errors);
            } else {
                $scope.profileMessages = response.profiles;
                $scope.profileCheckToggle();
            }

        };

        profileUploader.onBeforeUploadItem = function (fileItem) {
            fileItem.formData.push({token: $scope.token});
        };
        constraintsUploader.onBeforeUploadItem = function (fileItem) {
            fileItem.formData.push({token: $scope.token});
        };
        vsUploader.onBeforeUploadItem = function (fileItem) {
            fileItem.formData.push({token: $scope.token});
        };
        zipUploader.onBeforeUploadItem = function (fileItem) {
            fileItem.formData.push({token: $scope.token});
        };


        zipUploader.onCompleteItem = function (fileItem, response, status, headers) {
            if (response.success == false) {
                if (response.debugError === undefined) {
                    Notification.error({
                        message: "The zip file you uploaded is not valid, please check and correct the error(s) and try again",
                        templateUrl: "NotificationErrorTemplate.html",
                        scope: $rootScope,
                        delay: 10000
                    });
                    $scope.profileValidationErrors = angular.fromJson(response.profileErrors);
                    $scope.valueSetValidationErrors = angular.fromJson(response.constraintsErrors);
                    $scope.constraintValidationErrors = angular.fromJson(response.vsErrors);
                    $scope.step = 1;
                } else {
                	
                	$scope.executionError = response.message;
                    Notification.error({
                        message: "The tool could not upload and process your file.<br>" + response.message + '<br>' + response.debugError,
                        templateUrl: "NotificationErrorTemplate.html",
                        scope: $rootScope,
                        delay: 10000
                    });
                    $scope.step = 1;
                }
            } else {
                $scope.token = response.token;
                $http.post('api/upload/uploadedProfiles', {token: $scope.token}).then(
                    function (response) {
                        if (response.data.success == false) {
                            if (response.data.debugError === undefined) {
                                Notification.error({
                                    message: "The zip file you uploaded is not valid, please check and correct the error(s)",
                                    templateUrl: "NotificationErrorTemplate.html",
                                    scope: $rootScope,
                                    delay: 10000
                                });
                                $scope.step = 1;
                                $scope.profileValidationErrors = angular.fromJson(response.data.profileErrors);
                                $scope.valueSetValidationErrors = angular.fromJson(response.data.constraintsErrors);
                                $scope.constraintValidationErrors = angular.fromJson(response.data.vsErrors);
                            } else {
                                Notification.error({
                                    message: "  " + response.data.message + '<br>' + response.data.debugError,
                                    templateUrl: "NotificationErrorTemplate.html",
                                    scope: $rootScope,
                                    delay: 10000
                                });
                                $scope.step = 1;
                                $modalInstance.close();
                            }
                        } else {
                            $scope.profileMessages = response.data.profiles;
                            $scope.profileCheckToggle();
                        }
                    },
                    function (response) {

                    }
                );


//        		$scope.profileMessages = response.profiles;
//        		$scope.token = response.token;
            }
        };


        $scope.gotStep = function (step) {
            $scope.step = step;
        };

        $scope.findTestPlan = function () {
            if ($scope.selectedTP.id != null && $scope.selectedTP.id != "" && $scope.existingTestPlans != null && $scope.existingTestPlans.length > 0) {
                for (var i = 0; i < $scope.existingTestPlans.length; i++) {
                    if ($scope.existingTestPlans[i].id == $scope.selectedTP.id) {
                        return $scope.existingTestPlans[i];
                    }
                }
            }
            return null;
        };

        $scope.selectTP = function () {
            $scope.testcase = null;
            console.log("$scope.selectedTP.id=" + $scope.selectedTP.id);
            // console.log("$scope.existingTP.selected=" + angular.toJson($scope.existingTP.selected));
            // console.log("$scope.existingTP.selected=" + angular.fromJson($scope.existingTP.selected));
            // console.log("$scope.existingTP.selected=" + $scope.existingTP.selected);
            $scope.existingTP.selected = $scope.findTestPlan();
            if ($scope.existingTP.selected != null) {
                $scope.testcase = {};
                $scope.testcase['scope'] = $scope.selectedScope.key;
                $scope.testcase['name'] = $scope.existingTP.selected.name;
                $scope.testcase['description'] = $scope.existingTP.selected.description;
                $scope.testcase['groupId'] = $scope.existingTP.selected.id;
                console.log("$scope.testcase=" + angular.toJson($scope.testcase));
            }

        };

        $scope.addNewGroup = function () {
            $scope.existingTP.selected = null;
            $scope.testcase = {};
            $scope.testcase.scope = $scope.selectedScope.key;
            $scope.testcase.name = "";
            $scope.testcase.description = "";
            $scope.testcase.groupId = null;
            $scope.selectedTP.id = null;
        };


        $scope.clearTestGroupForm = function () {
            $scope.testcase.name = "";
            $scope.testcase.description = "";
            $scope.testcase.groupId = null;
            $scope.existingTP.selected = undefined;
        };

        profileUploader.onAfterAddingAll = function (fileItem) {
            if (profileUploader.queue.length > 1) {
                profileUploader.removeFromQueue(0);
            }
        };

        vsUploader.onAfterAddingAll = function (fileItem) {
            if (vsUploader.queue.length > 1) {
                vsUploader.removeFromQueue(0);
            }
        };

        constraintsUploader.onAfterAddingAll = function (fileItem) {
            if (constraintsUploader.queue.length > 1) {
                constraintsUploader.removeFromQueue(0);
            }
        };


        $scope.getSelectedTestcases = function () {
            return _.where($scope.profileMessages, {activated: true});
        };

        $scope.profileCheckToggle = function () {
            $scope.profileMessages.forEach(function (p) {
                p.activated = $scope.profileCheckToggleStatus;
            });
        };

        $scope.upload = function (value) {
            $scope.step = 0;
            $scope.token = $scope.generateUUID();
            $scope.profileValidationErrors = [];
            $scope.valueSetValidationErrors = [];
            $scope.constraintValidationErrors = [];
            vsUploader.uploadAll();
            constraintsUploader.uploadAll();
            profileUploader.uploadAll();
        };

        zipUploader.onBeforeUploadItem = function (fileItem) {
            $scope.profileValidationErrors = [];
            $scope.valueSetValidationErrors = [];
            $scope.constraintValidationErrors = [];
        };

        $scope.remove = function (value) {
            $scope.profileValidationErrors = [];
            $scope.valueSetValidationErrors = [];
            $scope.constraintValidationErrors = [];
            profileUploader.clearQueue();
            vsUploader.clearQueue();
            constraintsUploader.clearQueue();
        };

        $scope.dismissModal = function () {
             $modalInstance.dismiss();
        }


        $scope.addSelectedTestCases = function () {
            $scope.loading = true;
            $http.post('api/upload/addProfiles', {
                groupId: $scope.testcase.groupId,
                testcasename: $scope.testcase.name,
                testcasedescription: $scope.testcase.description,
                testcases: $scope.getSelectedTestcases(),
                scope: $scope.testcase.scope,
                token: $scope.token
            }).then(function (result) {

                if (result.data.status === "SUCCESS") {
                    Notification.success({
                        message: "Profile Added !",
                        templateUrl: "NotificationSuccessTemplate.html",
                        scope: $rootScope,
                        delay: 5000
                    });
                    $modalInstance.close({testPlanId: result.data.testPlanId, scope: $scope.testcase.scope});
                } else {
                    Notification.error({
                        message: result.data.message + '<br><br>Debug message:<br>' + result.data.debugError,
                        templateUrl: "NotificationErrorTemplate.html",
                        scope: $rootScope,
                        delay: 20000
                    });
                }
                $scope.loading = false;
            }, function (error) {
                $scope.loading = false;
                Notification.error({
                    message: error.data,
                    templateUrl: "NotificationErrorTemplate.html",
                    scope: $rootScope,
                    delay: 10000
                });
            });
        }

        $scope.clearTestCases = function () {
            $http.post('api/upload/clearFiles', {token: $scope.token}).then(function (result) {
                $scope.profileMessages.length = 0;
                zipUploader.clearQueue();
                profileUploader.clearQueue();
                vsUploader.clearQueue();
                constraintsUploader.clearQueue();
                $scope.profileValidationErrors = [];
                $scope.valueSetValidationErrors = [];
                $scope.constraintValidationErrors = [];
                $scope.existingTP.selected = undefined;
                Notification.success({
                    message: "Profiles cleared!",
                    templateUrl: "NotificationSuccessTemplate.html",
                    scope: $rootScope,
                    delay: 5000
                });
            }, function (error) {
                Notification.error({
                    message: error.data,
                    templateUrl: "NotificationErrorTemplate.html",
                    scope: $rootScope,
                    delay: 10000
                });
            });
        }

        $scope.getTotalProgress = function () {
            var numberOfactiveQueue = 0;
            var progress = 0;
            if (profileUploader.queue.length > 0) {
                numberOfactiveQueue++;
                progress += profileUploader.progress;

            }
            if (vsUploader.queue.length > 0) {
                numberOfactiveQueue++;
                progress += vsUploader.progress;
            }
            if (constraintsUploader.queue.length > 0) {
                numberOfactiveQueue++;
                progress += constraintsUploader.progress;
            }
            return (progress) / numberOfactiveQueue;
        }

        $scope.generateUUID = function () {
            var d = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
            return uuid;
        };


        $scope.initEnvironment = function () {
            $scope.step = 0;
            if (userInfoService.isAdmin() || userInfoService.isSupervisor()) {
                $scope.groupScopes = $scope.allGroupScopes;
            } else {
                $scope.groupScopes = [$scope.allGroupScopes[0]];
            }
            $scope.selectedScope.key = $scope.groupScopes[0].key;
            $scope.testcase = null;
            $scope.selectScope();
        };


        $scope.selectScope = function () {
            $scope.existingTestPlans = null;
            $scope.selectedTP.id = "";
            $scope.error = null;
            $scope.existingTP.selected = null;
            if ($scope.selectedScope.key && $scope.selectedScope.key !== null && $scope.selectedScope.key !== "") {
                if ($scope.testcase != null && $scope.testcase.group == null) {
                    $scope.testcase.scope = $scope.selectedScope.key;
                }
                var groupLoader = new ProfileGroupListLoader($scope.selectedScope.key);
                groupLoader.then(function (testPlans) {
                    $scope.existingTestPlans = $filter('orderBy')(testPlans, 'position')
                }, function (error) {
                    $scope.error = "Sorry, Cannot load the profile groups. Please try again";
                });
            }
        };


        $scope.initEnvironment();


    }]);


angular.module('upload').controller('UploadTokenCtrl', ['$scope', '$http', 'CF', '$window', '$modal', '$filter', '$rootScope', '$timeout', 'StorageService', 'TestCaseService', 'TestStepService', 'userInfoService', 'Notification', 'modalService', '$routeParams', '$location', '$modalInstance', 'ProfileGroupListLoader', function ($scope, $http, CF, $window, $modal, $filter, $rootScope, $timeout, StorageService, TestCaseService, TestStepService, userInfoService, Notification, modalService, $routeParams, $location, $modalInstance, ProfileGroupListLoader) {

    $scope.testcase = null;
    $scope.existingTP = {selected: null};
    $scope.selectedTP = {id: null};
    $scope.selectedScope = {key: 'USER'};
    $scope.groupScopes = [];
    $scope.allGroupScopes = [{key: 'USER', name: 'Private'}, {
        key: 'GLOBAL',
        name: 'Public'
    }];


    $scope.profileValidationErrors = [];
    $scope.valueSetValidationErrors = [];
    $scope.constraintValidationErrors = [];

    $scope.existingTestPlans = null;

    $scope.profileCheckToggleStatus = true;

    $scope.token = $routeParams.x;

    $scope.dismissModal = function () {
        $modalInstance.dismiss();
    };


    $scope.initEnvironment = function () {
        if (userInfoService.isAdmin() || userInfoService.isSupervisor()) {
            $scope.groupScopes = $scope.allGroupScopes;
        } else {
            $scope.groupScopes = [$scope.allGroupScopes[0]];
        }
        $scope.selectedScope.key = $scope.groupScopes[0].key;
        $scope.testcase = null;
        $scope.selectScope();

        if ($scope.token !== undefined) {
            if (userInfoService.isAuthenticated()) {
                $http.post('api/upload/uploadedProfiles', {token: $scope.token}).then(
                    function (response) {
                        if (response.data.success == false) {
                            if (response.data.debugError === undefined) {
                                Notification.error({
                                    message: "The zip file you uploaded is not valid, please check and correct the error(s)",
                                    templateUrl: "NotificationErrorTemplate.html",
                                    scope: $rootScope,
                                    delay: 10000
                                });
                                $scope.profileValidationErrors = angular.fromJson(response.data.profileErrors);
                                $scope.valueSetValidationErrors = angular.fromJson(response.data.constraintsErrors);
                                $scope.constraintValidationErrors = angular.fromJson(response.data.vsErrors);
                            } else {
                                Notification.error({
                                    message: "  " + response.data.message + '<br>' + response.data.debugError,
                                    templateUrl: "NotificationErrorTemplate.html",
                                    scope: $rootScope,
                                    delay: 10000
                                });
                                $modalInstance.close();
                            }
                        } else {
                            $scope.profileMessages = response.data.profiles;
                            $scope.profileCheckToggle();
                        }
                    },
                    function (response) {

                    }
                );
            }
        }
    };

    $scope.selectScope = function () {
        $scope.existingTestPlans = null;
        $scope.selectedTP.id = "";
        $scope.error = null;
        $scope.existingTP.selected = null;
        if ($scope.selectedScope.key && $scope.selectedScope.key !== null && $scope.selectedScope.key !== "") {
            if ($scope.testcase != null && $scope.testcase.group == null) {
                $scope.testcase.scope = $scope.selectedScope.key;
            }
            var groupLoader = new ProfileGroupListLoader($scope.selectedScope.key);
            groupLoader.then(function (testPlans) {
                $scope.existingTestPlans = $filter('orderBy')(testPlans, 'position')
            }, function (error) {
                $scope.error = "Sorry, Cannot load the profile groups. Please try again";
            });
        }
    };


    $scope.addSelectedTestCases = function () {
        $scope.loading = true;
        $http.post('api/upload/addProfiles', {
            groupId: $scope.testcase.groupId,
            testcasename: $scope.testcase.name,
            testcasedescription: $scope.testcase.description,
            testcases: $scope.getSelectedTestcases(),
            token: $scope.token,
            scope: $scope.testcase.scope
        }).then(function (result) {
            if (result.data.status === "SUCCESS") {
                Notification.success({
                    message: "Profile saved !",
                    templateUrl: "NotificationSuccessTemplate.html",
                    scope: $rootScope,
                    delay: 5000
                });
                $modalInstance.close({testPlanId: result.data.testPlanId, scope: $scope.testcase.scope});
            } else {
                Notification.error({
                    message: result.data.message,
                    templateUrl: "NotificationErrorTemplate.html",
                    scope: $rootScope,
                    delay: 10000
                });
            }
            $scope.loading = false;
        }, function (error) {
            $scope.loading = false;
            Notification.error({
                message: error.data,
                templateUrl: "NotificationErrorTemplate.html",
                scope: $rootScope,
                delay: 10000
            });
        });
    };


    $scope.findTestPlan = function () {
        if ($scope.selectedTP.id != null && $scope.selectedTP.id != "" && $scope.existingTestPlans != null && $scope.existingTestPlans.length > 0) {
            for (var i = 0; i < $scope.existingTestPlans.length; i++) {
                if ($scope.existingTestPlans[i].id == $scope.selectedTP.id) {
                    return $scope.existingTestPlans[i];
                }
            }
        }
        return null;
    };

    $scope.selectTP = function () {
        $scope.testcase = null;
        console.log("$scope.selectedTP.id=" + $scope.selectedTP.id);
        // console.log("$scope.existingTP.selected=" + angular.toJson($scope.existingTP.selected));
        // console.log("$scope.existingTP.selected=" + angular.fromJson($scope.existingTP.selected));
        // console.log("$scope.existingTP.selected=" + $scope.existingTP.selected);
        $scope.existingTP.selected = $scope.findTestPlan();
        if ($scope.existingTP.selected != null) {
            $scope.testcase = {};
            $scope.testcase['scope'] = $scope.selectedScope.key;
            $scope.testcase['name'] = $scope.existingTP.selected.name;
            $scope.testcase['description'] = $scope.existingTP.selected.description;
            $scope.testcase['groupId'] = $scope.existingTP.selected.id;
            console.log("$scope.testcase=" + angular.toJson($scope.testcase));
        }

    };

    $scope.addNewGroup = function () {
        $scope.existingTP.selected = null;
        $scope.testcase = {};
        $scope.testcase.scope = $scope.selectedScope.key;
        $scope.testcase.name = "";
        $scope.testcase.description = "";
        $scope.testcase.groupId = null;
        $scope.selectedTP.id = null;
    };


    $scope.clearTestGroupForm = function () {
        $scope.testcase.name = "";
        $scope.testcase.description = "";
        $scope.testcase.groupId = null;
        $scope.existingTP.selected = null;
    };

    $scope.profileCheckToggle = function () {
        $scope.profileMessages.forEach(function (p) {
            p.activated = $scope.profileCheckToggleStatus;
        });
    };

    $scope.getSelectedTestcases = function () {
        return _.where($scope.profileMessages, {activated: true});
    };

    $scope.initEnvironment();

}]);

angular.module('upload').controller('UploadTokenCheckCtrlCACA', ['$scope', '$http', 'CF', '$window', '$modal', '$filter', '$rootScope', '$timeout', 'StorageService', 'TestCaseService', 'TestStepService', 'userInfoService', 'Notification', 'modalService', '$routeParams', '$location', function ($scope, $http, CF, $window, $modal, $filter, $rootScope, $timeout, StorageService, TestCaseService, TestStepService, userInfoService, Notification, modalService, $routeParams, $location) {
    $scope.testcase = {};

    $scope.profileValidationErrors = [];
    $scope.valueSetValidationErrors = [];
    $scope.constraintValidationErrors = [];

    $scope.profileCheckToggleStatus = false;

    $scope.token = decodeURIComponent($routeParams.x);
    $scope.auth = decodeURIComponent($routeParams.y);


    if ($scope.token !== undefined & $scope.auth !== undefined) {


        //check if logged in
        if (!userInfoService.isAuthenticated()) {
            $scope.$emit('event:loginRequestWithAuth', $scope.auth, '/addprofiles?x=' + $scope.token);

        } else {
            $location.url('/addprofiles?x=' + $scope.token);
        }
    }


}]);


