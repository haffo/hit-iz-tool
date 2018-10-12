angular.module('transport')
    .controller('TransportConfigListCtrl', ['$scope', 'Transport', 'StorageService', '$http', 'User', '$timeout','$rootScope',function ($scope, Transport, StorageService, $http, User,$timeout,$rootScope) {
        $scope.transport = Transport;
        $scope.loading = false;
        $scope.error = null;
        $scope.protocols = [];
        $scope.selectedProtocol = null;

        $scope.hasConfigs = function () {
            return $scope.transport.configs ? Object.getOwnPropertyNames($scope.transport.configs).length > 0 : false;
        };


        $scope.getProtocols = function () {
            return $scope.transport.configs ? Object.getOwnPropertyNames($scope.transport.configs) : [];
        };

        $scope.getProtoDescription = function (protocol) {
            try {
                return $scope.transport.configs[protocol]['description'];
            } catch (error) {
            }
            return null;
        };

        $scope.getConfigs = function () {
            return $scope.transport.configs;
        };

        $scope.initTransportConfigList = function () {
            $scope.error = null;
         };

        $scope.selectProtocol = function (protocolKey) {
            $scope.selectedProtocol = Transport.configs[protocolKey];
            $scope.$broadcast("load-transport-data",protocolKey);
        };

        $scope.isActiveProtocol = function (proto) {
            return $scope.selectedProtocol != null && $scope.selectedProtocol.key === proto;
        };

        $scope.toggleTransport = function (disabled) {
            $scope.transport.disabled = disabled;
            StorageService.set(StorageService.TRANSPORT_DISABLED, disabled);
            if(!disabled) {
                var pr = $scope.getProtocols();
                if(pr != null && pr.length === 1){
                    $scope.selectProtocol(pr[0]);
                }
            }
        };
    }]);


angular.module('transport').controller('InitiatorConfigCtrl', function ($scope, $modalInstance, htmlForm, config, domain, protocol, $http, User) {
    $scope.config = angular.copy(config);
    $scope.form = htmlForm;
    $scope.domain = domain;
    $scope.protocol = protocol;

    $scope.initInitiatorConfig = function (config) {
        $scope.config = angular.copy(config);
    };

    $scope.save = function () {
        var data = angular.fromJson({
            "config": $scope.config,
            "userId": User.info.id,
            "type": "TA_INITIATOR",
            "protocol": $scope.protocol
        });
        $http.post('api/transport/config/save', data);
        $modalInstance.close($scope.config);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

//    $scope.init = function(){
//        $scope.htmlForm = $compile($scope.htmlForm)($scope);
//    };

});


angular.module('transport').controller('TaInitiatorConfigCtrl', function ($scope, $http, User, StorageService, Transport, $rootScope, Notification) {
    $scope.transport = Transport;
    $scope.config = null;
    $scope.prevConfig = null;
    $scope.loading = false;
    $scope.error = null;
    $scope.proto = null;
    $scope.saved = true;
    $scope.dom = null;
    $scope.message = null;


    $scope.$on("load-transport-data", function (event, protocol) {
        $scope.proto = protocol;
        $scope.dom = $rootScope.domain.domain;
        $scope.loadData();
    });



    $scope.initTaInitiatorConfig = function (domain, protocol) {
        if (protocol && protocol != null && domain && domain != null) {
            $scope.proto = protocol;
            $scope.dom = domain;
            $scope.message = null;
            $scope.loadData();

        } else {
            $scope.error = "Protocol or domain not defined."
        }
    };

    $scope.loadData = function () {
        $scope.config = angular.copy($scope.transport.configs[$scope.proto]['data']['taInitiator']);
        $scope.prevConfig = angular.copy($scope.config);
        $scope.message = null;
    };

    $scope.save = function () {
        $scope.error = null;
        $scope.message = null;
        var data = angular.fromJson({
            "config": $scope.config,
            "userId": User.info.id,
            "type": "TA_INITIATOR",
            "protocol": $scope.proto,
            "domain": $scope.dom
        });
        $http.post('api/transport/config/save', data).then(function (result) {
            $scope.transport.configs[$scope.proto]['data']['taInitiator'] = $scope.config;
            $scope.loadData();
            $scope.saved = true;
            Notification.success({
                message: "Configuration Information Saved !",
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
            $scope.saved = false;
            $scope.message = null;
        });
    };

    $scope.reset = function () {
        $scope.config = angular.copy($scope.prevConfig);
        $scope.saved = true;

    };

});

angular.module('transport').controller('SutInitiatorConfigCtrl', function ($scope, $http, Transport, $rootScope, User, Notification) {
    $scope.transport = Transport;
    $scope.config = null;
    $scope.loading = false;
    $scope.saving = false;
    $scope.error = null;
    $scope.proto = null;
    $scope.dom = null;

    $scope.$on("load-transport-data", function (event, protocol) {
        $scope.proto = protocol;
        $scope.dom = $rootScope.domain.domain;
        $scope.loadData();
    });

    $scope.initSutInitiatorConfig = function (domain, protocol) {

        if (protocol && protocol != null && domain && domain != null) {
            $scope.proto = protocol;
            $scope.dom = domain;
            $scope.loadData();
        } else {
            $scope.error = "Protocol or domain not defined."
        }
    };

    $scope.loadData = function () {
        $scope.config = $scope.transport.configs[$scope.proto]['data']['sutInitiator'];
    };

    $scope.save = function () {
        var config = $scope.config;
        if (config) {
            $scope.saving = true;
            var tmpConfig = angular.copy(config);
            delete tmpConfig["password"];
            delete tmpConfig["username"];
            var data = angular.fromJson({
                "config": $scope.config,
                "userId": User.info.id,
                "type": "SUT_INITIATOR",
                "protocol": $scope.proto,
                "domain": $scope.dom
            });
            $http.post('api/transport/config/save', data).then(function (result) {
                $scope.saving = false;
                Notification.success({
                    message: "Configuration Information Saved !",
                    templateUrl: "NotificationSuccessTemplate.html",
                    scope: $rootScope,
                    delay: 5000
                });
            }, function (error) {
                $scope.saving = false;
                $scope.error = error;
                Notification.error({
                    message: error.data,
                    templateUrl: "NotificationErrorTemplate.html",
                    scope: $rootScope,
                    delay: 10000
                });

            });
        }
    };
});




angular.module('transport').controller('CreateTransportConfigCtrl', function ($scope, $modalInstance, scope, DomainsManager) {


});
