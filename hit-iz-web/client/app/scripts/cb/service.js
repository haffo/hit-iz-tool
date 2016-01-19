'use strict';


angular.module('cb').factory('CB',
    ['Message', 'ValidationSettings', 'Tree', 'StorageService', 'Transport','Logger', 'User', function (Message, ValidationSettings,Tree,StorageService,Transport,Logger, User) {

        var initTransport = function(){
            var transport = new Transport();
            if(StorageService.get(StorageService.USER_CONFIG_KEY) != null) {
                transport.config = angular.fromJson(StorageService.get(StorageService.USER_CONFIG_KEY));
            }
            return transport;
        };
        var CB = {
            testCase: null,
            selectedTestCase: null,
            editor:null,
            tree: new Tree(),
            transport:  initTransport(),
            cursor: null,
            message: new Message(),
            logger: new Logger(),
            validationSettings: new ValidationSettings(),
            setContent: function (value) {
                CB.message.content = value;
                CB.editor.instance.doc.setValue(value);
                CB.message.notifyChange();
            },
            getContent: function () {
                return  CB.message.content;
            }
        };

        return CB;
    }]);


angular.module('cb').factory('CBTestCaseListLoader', ['$q','$http',
    function ($q,$http) {
        return function() {
            var delay = $q.defer();
            $http.get("api/cb/testcases").then(
                function (object) {
                    delay.resolve(angular.fromJson(object.data));
                },
                function (response) {
                    delay.reject(response.data);
                }
            );

//
//            $http.get("../../resources/erx/cb-testCases.json").then(
//                function (object) {
//                    delay.resolve(angular.fromJson(object.data));
//                },
//                function (response) {
//                    delay.reject(response.data);
//                }
//            );


//            $http.get("../../resources/cb/testPlans.json").then(
//                function (object) {
//                    delay.resolve(angular.fromJson(object.data));
//                },
//                function (response) {
//                    delay.reject(response.data);
//                }
//            );


//            $http.get("../../resources/cb/isolatedTestPlans.json").then(
//                function (object) {
//                    delay.resolve(angular.fromJson(object.data));
//                },
//                function (response) {
//                    delay.reject(response.data);
//                }
//            );


            return delay.promise;
        };
    }
]);





//angular.module('cb').factory('Transaction', function ($q, $http) {
//    var Transaction = function () {
//        this.transportAccount = null;
//        this.running = false;
//        this.incoming = null;
//        this.outgoing = null;
//    };
//
//    Transaction.prototype.messages = function () {
//        var delay = $q.defer();
//        var self = this;
//        var data = angular.fromJson(this.transportAccount);
//        $http.post('api/transaction/find', data).then(
//            function (response) {
//                var transaction = angular.fromJson(response.data);
//                self.incoming = transaction.incoming;
//                self.outgoing = transaction.outgoing;
//                delay.resolve(transaction);
//            },
//            function (response) {
//                delay.reject(null);
//            }
//        );
//
////        $http.get('../../resources/cb/transaction.json').then(
////            function (response) {
////                var transaction = angular.fromJson(response.data);
////                self.incoming = transaction.incoming;
////                self.outgoing = transaction.outgoing;
////                delay.resolve(transaction);
////            },
////            function (response) {
////                delay.reject(null);
////            }
////        );
//
//        return delay.promise;
//    };
//
//    Transaction.prototype.init = function (transportAccount) {
//        this.clearMessages();
//        this.transportAccount = transportAccount;
//     };
//
//
//    Transaction.prototype.clearMessages = function () {
//        this.incoming = null;
//        this.outgoing = null;
//    };
//
//    Transaction.prototype.closeConnection = function () {
//        var self = this;
//        var delay = $q.defer();
//        var data = angular.fromJson(this.userInfo);
//        $http.post('api/transaction/close', data).then(
//            function (response) {
//                self.running = true;
//                self.clearMessages();
//                delay.resolve(true);
//            },
//            function (response) {
//                self.running = false;
//                delay.reject(null);
//            }
//        );
////
////        $http.get('../../resources/cb/clearFacilityId.json').then(
////            function (response) {
////
////                self.clearMessages();
////                delay.resolve(true);
////            },
////            function (response) {
////                delay.reject(null);
////            }
////        );
//        return delay.promise;
//    };
//
//    Transaction.prototype.openConnection = function (responseMessageId) {
//        var self = this;
//        var delay = $q.defer();
//        var data = angular.fromJson({"username": self.username, "password": self.password, "facilityID": self.facilityID, "responseMessageId": responseMessageId});
//        $http.post('api/transaction/open', data).then(
//            function (response) {
//                self.running = true;
//                self.clearMessages();
//                delay.resolve(true);
//            },
//            function (response) {
//                self.running = false;
//                delay.reject(null);
//            }
//        );
//
////        $http.get('../../resources/cb/initFacilityId.json').then(
////            function (response) {
////                self.running = true;
////                delay.resolve(true);
////            },
////            function (response) {
////                self.running = false;
////                delay.reject(null);
////            }
////        );
//
//
//        return delay.promise;
//    };
//    return Transaction;
//});









