'use strict';

angular.module('main').controller('MainCtrl',
    function ($scope, $rootScope, i18n, $location, userInfoService, $modal, $filter, base64, $http, Idle, Notification, IdleService, StorageService, TestingSettings,Session,AppInfo,User,$templateCache,$window,$sce) {
        //This line fetches the info from the server if the user is currently logged in.
        //If success, the app is updated according to the role.
        $rootScope.loginDialog = null;
        $rootScope.started = false;


        $scope.language = function () {
            return i18n.language;
        };

        $scope.setLanguage = function (lang) {
            i18n.setLanguage(lang);
        };

        $scope.activeWhen = function (value) {
            return value ? 'active' : '';
        };

        $scope.activeIfInList = function (value, pathsList) {
            var found = false;
            if (angular.isArray(pathsList) === false) {
                return '';
            }
            var i = 0;
            while ((i < pathsList.length) && (found === false)) {
                if (pathsList[i] === value) {
                    return 'active';
                }
                i++;
            }
            return '';
        };

        $scope.path = function () {
            return $location.url();
        };

        $scope.login = function () {
            $scope.$emit('event:loginRequest', $scope.username, $scope.password);
        };

        $scope.loginReq = function () {
            if ($rootScope.loginMessage()) {
                $rootScope.loginMessage().text = "";
                $rootScope.loginMessage().show = false;
            }
            $scope.$emit('event:loginRequired');
        };

        $scope.logout = function () {
            $scope.execLogout();
        };

        $scope.execLogout = function () {
            userInfoService.setCurrentUser(null);
            $scope.username = $scope.password = null;
            $scope.$emit('event:logoutRequest');
            $location.url('/home');
        };

        $scope.cancel = function () {
            $scope.$emit('event:loginCancel');
        };

        $scope.isAuthenticated = function () {
            return userInfoService.isAuthenticated();
        };

        $scope.isPending = function () {
            return userInfoService.isPending();
        };


        $scope.isSupervisor = function () {
            return userInfoService.isSupervisor();
        };

        $scope.isTester = function () {
            return userInfoService.isTester();
        };

        $scope.isAdmin = function () {
            return userInfoService.isAdmin();
        };

        $scope.getRoleAsString = function () {
            if ($scope.isTester() === true) {
                return 'tester';
            }
            if ($scope.isSupervisor() === true) {
                return 'Supervisor';
            }
            if ($scope.isAdmin() === true) {
                return 'Admin';
            }
            return 'undefined';
        };

        $scope.getUsername = function () {
            if (userInfoService.isAuthenticated() === true) {
                return userInfoService.getUsername();
            }
            return '';
        };

        $rootScope.showLoginDialog = function (username, password) {

            if ($rootScope.loginDialog && $rootScope.loginDialog != null && $rootScope.loginDialog.opened) {
                $rootScope.loginDialog.dismiss('cancel');
            }

            $rootScope.loginDialog = $modal.open({
                backdrop: 'static',
                keyboard: 'false',
                controller: 'LoginCtrl',
                size: 'lg',
                templateUrl: 'views/account/login.html',
                resolve: {
                    user: function () {
                        return {username: $scope.username, password: $scope.password};
                    }
                }
            });

            $rootScope.loginDialog.result.then(function (result) {
                if (result) {
                    $scope.username = result.username;
                    $scope.password = result.password;
                    $scope.login();
                } else {
                    $scope.cancel();
                }
            });
        };

        $rootScope.started = false;

        Idle.watch();

        $rootScope.$on('IdleStart', function () {
            closeModals();
            $rootScope.warning = $modal.open({
                templateUrl: 'warning-dialog.html',
                windowClass: 'modal-danger'
            });
        });

        $rootScope.$on('IdleEnd', function () {
            closeModals();
        });

        $rootScope.$on('IdleTimeout', function () {
            closeModals();
            if ($scope.isAuthenticated()) {
                $rootScope.$emit('event:execLogout');
                $rootScope.timedout = $modal.open({
                    templateUrl: 'timedout-dialog.html',
                    windowClass: 'modal-danger'
                });
            } else {
                StorageService.clearAll();
                Session.delete().then(
                    function (response) {
                        $rootScope.timedout = $modal.open({
                            templateUrl: 'timedout-dialog.html',
                            windowClass: 'modal-danger',
                            backdrop: true,
                            keyboard: 'false',
                            controller: 'FailureCtrl',
                            resolve: {
                                error: function () {
                                    return "";
                                }
                            }
                        });
                        $rootScope.timedout.result.then(function () {
                            $rootScope.clearTemplate();
                            $rootScope.reloadPage();
                        }, function () {
                            $rootScope.clearTemplate();
                            $rootScope.reloadPage();
                        });
                    }
                );
            }
        });

        $scope.$on('Keepalive', function () {
            if ($scope.isAuthenticated()) {
                IdleService.keepAlive();
            }
        });

        $rootScope.$on('Keepalive', function() {
            IdleService.keepAlive();
        });


        $rootScope.$on('event:execLogout', function () {
            $scope.execLogout();
        });

        function closeModals() {
            if ($rootScope.warning) {
                $rootScope.warning.close();
                $rootScope.warning = null;
            }

            if ($rootScope.timedout) {
                $rootScope.timedout.close();
                $rootScope.timedout = null;
            }
        };

        $rootScope.start = function () {
            closeModals();
            Idle.watch();
            $rootScope.started = true;
        };

        $rootScope.stop = function () {
            closeModals();
            Idle.unwatch();
            $rootScope.started = false;

        };


        $scope.checkForIE = function () {
            var BrowserDetect = {
                init: function () {
                    this.browser = this.searchString(this.dataBrowser) || 'An unknown browser';
                    this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || 'an unknown version';
                    this.OS = this.searchString(this.dataOS) || 'an unknown OS';
                },
                searchString: function (data) {
                    for (var i = 0; i < data.length; i++) {
                        var dataString = data[i].string;
                        var dataProp = data[i].prop;
                        this.versionSearchString = data[i].versionSearch || data[i].identity;
                        if (dataString) {
                            if (dataString.indexOf(data[i].subString) !== -1) {
                                return data[i].identity;
                            }
                        }
                        else if (dataProp) {
                            return data[i].identity;
                        }
                    }
                },
                searchVersion: function (dataString) {
                    var index = dataString.indexOf(this.versionSearchString);
                    if (index === -1) {
                        return;
                    }
                    return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
                },
                dataBrowser: [
                    {
                        string: navigator.userAgent,
                        subString: 'Chrome',
                        identity: 'Chrome'
                    },
                    {   string: navigator.userAgent,
                        subString: 'OmniWeb',
                        versionSearch: 'OmniWeb/',
                        identity: 'OmniWeb'
                    },
                    {
                        string: navigator.vendor,
                        subString: 'Apple',
                        identity: 'Safari',
                        versionSearch: 'Version'
                    },
                    {
                        prop: window.opera,
                        identity: 'Opera',
                        versionSearch: 'Version'
                    },
                    {
                        string: navigator.vendor,
                        subString: 'iCab',
                        identity: 'iCab'
                    },
                    {
                        string: navigator.vendor,
                        subString: 'KDE',
                        identity: 'Konqueror'
                    },
                    {
                        string: navigator.userAgent,
                        subString: 'Firefox',
                        identity: 'Firefox'
                    },
                    {
                        string: navigator.vendor,
                        subString: 'Camino',
                        identity: 'Camino'
                    },
                    {       // for newer Netscapes (6+)
                        string: navigator.userAgent,
                        subString: 'Netscape',
                        identity: 'Netscape'
                    },
                    {
                        string: navigator.userAgent,
                        subString: 'MSIE',
                        identity: 'Explorer',
                        versionSearch: 'MSIE'
                    },
                    {
                        string: navigator.userAgent,
                        subString: 'Gecko',
                        identity: 'Mozilla',
                        versionSearch: 'rv'
                    },
                    {       // for older Netscapes (4-)
                        string: navigator.userAgent,
                        subString: 'Mozilla',
                        identity: 'Netscape',
                        versionSearch: 'Mozilla'
                    }
                ],
                dataOS: [
                    {
                        string: navigator.platform,
                        subString: 'Win',
                        identity: 'Windows'
                    },
                    {
                        string: navigator.platform,
                        subString: 'Mac',
                        identity: 'Mac'
                    },
                    {
                        string: navigator.userAgent,
                        subString: 'iPhone',
                        identity: 'iPhone/iPod'
                    },
                    {
                        string: navigator.platform,
                        subString: 'Linux',
                        identity: 'Linux'
                    }
                ]

            };
            BrowserDetect.init();

            if (BrowserDetect.browser === 'Explorer') {
                var title = 'You are using Internet Explorer';
                var msg = 'This site is not yet optimized with Internet Explorer. For the best user experience, please use Chrome, Firefox or Safari. Thank you for your patience.';
                var btns = [
                    {result: 'ok', label: 'OK', cssClass: 'btn'}
                ];

                //$dialog.messageBox(title, msg, btns).open();


            }
        };

        $rootScope.readonly = false;
        $scope.scrollbarWidth = 0;



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

        $rootScope.openRichTextDlg = function (obj, key, title, disabled) {
            var modalInstance = $modal.open({
                templateUrl: 'RichTextCtrl.html',
                controller: 'RichTextCtrl',
                windowClass: 'app-modal-window',
                backdrop: true,
                keyboard: true,
                backdropClick: false,
                resolve: {
                    editorTarget: function () {
                        return {
                            key: key,
                            obj: obj,
                            disabled: disabled,
                            title: title
                        };
                    }
                }
            });
        };

        $rootScope.openInputTextDlg = function (obj, key, title, disabled) {
            var modalInstance = $modal.open({
                templateUrl: 'InputTextCtrl.html',
                controller: 'InputTextCtrl',
                backdrop: true,
                keyboard: true,
                windowClass: 'app-modal-window',
                backdropClick: false,
                resolve: {
                    editorTarget: function () {
                        return {
                            key: key,
                            obj: obj,
                            disabled: disabled,
                            title: title
                        };
                    }
                }
            });
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
        $rootScope.downloadArtifact = function (path) {
            var form = document.createElement("form");
            form.action = "api/artifact/download";
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
            return $compile(content);
        };

        $rootScope.$on('$locationChangeSuccess', function () {
            $rootScope.setActive($location.path());
        });


        $rootScope.openValidationResultInfo = function () {
            var modalInstance = $modal.open({
                templateUrl: 'ValidationResultInfoCtrl.html',
                windowClass: 'profile-modal',
                controller: 'ValidationResultInfoCtrl'
            });
        };

        $rootScope.openVersionChangeDlg = function () {
            StorageService.clearAll();
            if (!$rootScope.vcModalInstance || $rootScope.vcModalInstance === null || !$rootScope.vcModalInstance.opened) {
                $rootScope.vcModalInstance = $modal.open({
                    templateUrl: 'VersionChanged.html',
                    size: 'lg',
                    backdrop: 'static',
                    keyboard: 'false',
                    'controller': 'FailureCtrl',
                    resolve: {
                        error: function () {
                            return "";
                        }
                    }
                });
                $rootScope.vcModalInstance.result.then(function () {
                    $rootScope.clearTemplate();
                    $rootScope.reloadPage();
                }, function () {
                    $rootScope.clearTemplate();
                    $rootScope.reloadPage();
                });
            }
        };

        $rootScope.openCriticalErrorDlg = function (errorMessage) {
            StorageService.clearAll();
            if (!$rootScope.errorModalInstance || $rootScope.errorModalInstance === null || !$rootScope.errorModalInstance.opened) {
                $rootScope.errorModalInstance = $modal.open({
                    templateUrl: 'CriticalError.html',
                    size: 'lg',
                    backdrop: true,
                    keyboard: 'true',
                    'controller': 'FailureCtrl',
                    resolve: {
                        error: function () {
                            return errorMessage;
                        }
                    }
                });
                $rootScope.errorModalInstance.result.then(function () {
                    $rootScope.clearTemplate();
                    $rootScope.reloadPage();
                }, function () {
                    $rootScope.clearTemplate();
                    $rootScope.reloadPage();
                });
            }
        };

        $rootScope.openSessionExpiredDlg = function () {
            StorageService.clearAll();
            if (!$rootScope.sessionExpiredModalInstance || $rootScope.sessionExpiredModalInstance === null || !$rootScope.sessionExpiredModalInstance.opened) {
                $rootScope.sessionExpiredModalInstance = $modal.open({
                    templateUrl: 'timedout-dialog.html',
                    size: 'lg',
                    backdrop: true,
                    keyboard: 'true',
                    'controller': 'FailureCtrl',
                    resolve: {
                        error: function () {
                            return "";
                        }
                    }
                });
                $rootScope.sessionExpiredModalInstance.result.then(function () {
                    $rootScope.clearTemplate();
                    $rootScope.reloadPage();
                }, function () {
                    $rootScope.clearTemplate();
                    $rootScope.reloadPage();
                });
            }
        };


        $rootScope.clearTemplate = function () {
            $templateCache.removeAll();
        };

        $rootScope.openErrorDlg = function () {
            $location.path('/error');
        };

        $rootScope.pettyPrintType = function (type) {
            return type === 'TestStep' ? 'Test Step' : type === 'TestCase' ? 'Test Case' : type;
        };


        $rootScope.reloadPage = function () {
            $window.location.reload();
        };

        $rootScope.openInvalidReqDlg = function () {
            if (!$rootScope.errorModalInstance || $rootScope.errorModalInstance === null || !$rootScope.errorModalInstance.opened) {
                $rootScope.errorModalInstance = $modal.open({
                    templateUrl: 'InvalidReqCtrl.html',
                    size: 'lg',
                    backdrop: true,
                    keyboard: 'false',
                    'controller': 'FailureCtrl',
                    resolve: {
                        error: function () {
                            return "";
                        }
                    }
                });
                $rootScope.errorModalInstance.result.then(function () {
                    $rootScope.reloadPage();
                }, function () {
                    $rootScope.reloadPage();
                });
            }
        };

        $rootScope.openNotFoundDlg = function () {
            if (!$rootScope.errorModalInstance || $rootScope.errorModalInstance === null || !$rootScope.errorModalInstance.opened) {
                $rootScope.errorModalInstance = $modal.open({
                    templateUrl: 'NotFoundCtrl.html',
                    size: 'lg',
                    backdrop: true,
                    keyboard: 'false',
                    'controller': 'FailureCtrl',
                    resolve: {
                        error: function () {
                            return "";
                        }
                    }
                });

                $rootScope.errorModalInstance.result.then(function () {
                    $rootScope.reloadPage();
                }, function () {
                    $rootScope.reloadPage();
                });
            }
        };


        $rootScope.nav = function (target) {
            $location.path(target);
        };

        $rootScope.showSettings = function () {
            var modalInstance = $modal.open({
                templateUrl: 'SettingsCtrl.html',
                size: 'lg',
                keyboard: 'false',
                controller: 'SettingsCtrl'
            });
        };

        $scope.init = function () {
        };

        $scope.getFullName = function () {
            if (userInfoService.isAuthenticated() === true) {
                return userInfoService.getFullName();
            }
            return '';
        };

    });

angular.module('main').controller('LoginCtrl', ['$scope', '$modalInstance', 'user', function ($scope, $modalInstance, user) {
    $scope.user = user;

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.login = function () {
//        console.log("logging in...");
        $modalInstance.close($scope.user);
    };
}]);


angular.module('main').controller('RichTextCtrl', ['$scope', '$modalInstance', 'editorTarget', function ($scope, $modalInstance, editorTarget) {
    $scope.editorTarget = editorTarget;

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.close = function () {
        $modalInstance.close($scope.editorTarget);
    };
}]);


angular.module('main').controller('InputTextCtrl', ['$scope', '$modalInstance', 'editorTarget', function ($scope, $modalInstance, editorTarget) {
    $scope.editorTarget = editorTarget;

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.close = function () {
        $modalInstance.close($scope.editorTarget);
    };
}]);

angular.module('main').controller('ConfirmLogoutCtrl', ["$scope", "$modalInstance", "$rootScope", "$http", function ($scope, $modalInstance, $rootScope, $http) {
    $scope.logout = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);


angular.module('main').controller('MessageWithHexadecimalDlgCtrl',  function ($scope, $modalInstance,original,MessageUtil) {
    $scope.showHex = true;
    var messageWithHexadecimal = MessageUtil.toHexadecimal(original);
    $scope.message = messageWithHexadecimal;

    $scope.toggleHexadecimal = function(){
        $scope.showHex = !$scope.showHex;
        $scope.message = $scope.showHex ? messageWithHexadecimal: original;
    };

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    };

});



angular.module('main').controller('ValidationResultDetailsCtrl', function ($scope, $modalInstance, selectedElement) {

    $scope.selectedElement = selectedElement;

    $scope.ok = function () {
        $modalInstance.close($scope.selectedElement);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

