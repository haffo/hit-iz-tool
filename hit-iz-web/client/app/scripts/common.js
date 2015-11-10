/**
 * Created by haffo on 11/20/14.
 */

angular.module('commonServices').factory('StorageService',
    ['$rootScope', 'localStorageService', function ($rootScope, localStorageService) {
        var service = {
            CF_EDITOR_CONTENT_KEY: 'CF_EDITOR_CONTENT',
            CF_LOADED_TESTCASE_ID_KEY: 'CF_LOADED_TESTCASE_ID',
            CF_LOADED_TESTCASE_TYPE_KEY: 'CF_LOADED_TESTCASE_TYPE',

            CB_EDITOR_CONTENT_KEY: 'CB_EDITOR_CONTENT',
            CB_SELECTED_TESTCASE_ID_KEY: 'CB_SELECTED_TESTCASE_ID',
            CB_SELECTED_TESTCASE_TYPE_KEY: 'CB_SELECTED_TESTCASE_TYPE',
            CB_LOADED_TESTCASE_ID_KEY: 'CB_LOADED_TESTCASE_ID',
            CB_LOADED_TESTCASE_TYPE_KEY: 'CB_LOADED_TESTCASE_TYPE',

            ISOLATED_EDITOR_CONTENT_KEY: 'ISOLATED_EDITOR_CONTENT',
            ISOLATED_SELECTED_TESTCASE_ID_KEY: 'ISOLATED_SELECTED_TESTCASE_ID',
            ISOLATED_LOADED_TESTCASE_ID_KEY: 'ISOLATED_LOADED_TESTCASE_ID',
            ISOLATED_LOADED_TESTSTEP_ID_KEY: 'ISOLATED_LOADED_TESTSTEP_ID',
            ISOLATED_LOADED_TESTSTEP_TYPE_KEY: 'ISOLATED_LOADED_TESTSTEP_TYPE',
            ISOLATED_SELECTED_TESTCASE_TYPE_KEY: 'ISOLATED_SELECTED_TESTCASE_TYPE',
            ISOLATED_LOADED_TESTCASE_TYPE_KEY: 'ISOLATED_LOADED_TESTCASE_TYPE',

            SOAP_ENV_EDITOR_CONTENT_KEY: 'SOAP_ENV_EDITOR_CONTENT',
            SOAP_ENV_SELECTED_TESTCASE_ID_KEY: 'SOAP_ENV_SELECTED_TESTCASE_ID',
            SOAP_ENV_SELECTED_TESTCASE_TYPE_KEY: 'SOAP_ENV_SELECTED_TESTCASE_TYPE',
            SOAP_ENV_LOADED_TESTCASE_ID_KEY: 'SOAP_ENV_LOADED_TESTCASE_ID',
            SOAP_ENV_LOADED_TESTCASE_TYPE_KEY: 'SOAP_ENV_LOADED_TESTCASE_TYPE',

            SOAP_CONN_REQ_EDITOR_CONTENT_KEY: 'SOAP_CONN_REQ_EDITOR_CONTENT',
            SOAP_CONN_RESP_EDITOR_CONTENT_KEY: 'SOAP_CONN_RESP_EDITOR_CONTENT',
            SOAP_CONN_SELECTED_TESTCASE_ID_KEY: 'SOAP_CONN_SELECTED_TESTCASE_ID',
            SOAP_CONN_SELECTED_TESTCASE_TYPE_KEY: 'SOAP_CONN_SELECTED_TESTCASE_TYPE',
            SOAP_CONN_LOADED_TESTCASE_ID_KEY: 'SOAP_CONN_LOADED_TESTCASE_ID',
            SOAP_CONN_LOADED_TESTCASE_TYPE_KEY: 'SOAP_CONN_LOADED_TESTCASE_TYPE',

            ACTIVE_SUB_TAB_KEY: 'ACTIVE_SUB_TAB',
            SOAP_COMM_SENDER_USERNAME_KEY: 'SOAP_COMM_SENDER_USERNAME',
            SOAP_COMM_SENDER_PWD_KEY: 'SOAP_COMM_SENDER_PWD',
            SOAP_COMM_SENDER_ENDPOINT_KEY: 'SOAP_COMM_SENDER_ENDPOINT',
            SOAP_COMM_SENDER_FACILITYID_KEY: 'SOAP_COMM_SENDER_FACILITYID',

            SOAP_COMM_RECEIVER_USERNAME_KEY: 'SOAP_COMM_RECEIVER_USERNAME',
            SOAP_COMM_RECEIVER_PWD_KEY: 'SOAP_COMM_RECEIVER_PWD',
            SOAP_COMM_RECEIVER_ENDPOINT_KEY: 'SOAP_COMM_RECEIVER_ENDPOINT',
            SOAP_COMM_RECEIVER_FACILITYID_KEY: 'SOAP_COMM_RECEIVER_FACILITYID',
            DQA_OPTIONS_KEY: 'DQA_OPTIONS_KEY',
            SETTINGS_KEY: 'SETTINGS_KEY',

            remove: function (key) {
                return localStorageService.remove(key);
            },

            removeList: function removeItems(key1, key2, key3) {
                return localStorageService.remove(key1, key2, key3);
            },

            clearAll: function () {
                return localStorageService.clearAll();
            },
            set: function (key, val) {
                return localStorageService.set(key, val);
            },
            get: function (key) {
                return localStorageService.get(key);
            }
        };
        return service;
    }]
);


angular.module('commonServices').factory('Er7Message', function ($http, $q, Message) {
    var Er7Message = function () {
        Message.apply(this, arguments);
    };

    Er7Message.prototype = Object.create(Message.prototype);
    Er7Message.prototype.constructor = Er7Message;


    return Er7Message;
});


angular.module('commonServices').factory('TransactionUser', function (Endpoint, Transaction, $q, $http) {
    var TransactionUser = function () {
        this.id = null;
        this.senderUsername = null; // tool auto generate or collect this at registration
        this.senderPassword = null; // tool auto generate or collect this at registration
        this.senderFacilityID = null;
        this.receiverUsername = null; // user enter this into the tool as a receiver
        this.receiverPassword = null; // user enter this into the tool as a receiver
        this.receiverFacilityId = null; // user enter this into the tool as a receiver
        this.receiverEndpoint = null; // user enter this into the tool as a receiver
        this.endpoint = new Endpoint();
        this.transaction = new Transaction();
    };

    TransactionUser.prototype.init = function () {
        var delay = $q.defer();
        var self = this;
//        var data = angular.fromJson({"username": self.username, "tokenId": self.tokenId, "id": self.id});
        var data = angular.fromJson({"id": self.id});
        $http.post('api/transaction/initUser', data).then(
            function (response) {
                var user = angular.fromJson(response.data);
                self.id = user.id;
                self.senderUsername = user.username;
                self.senderPassword = user.password;
                self.senderFacilityID = user.facilityID;
                self.endpoint = new Endpoint(user.endpoint);
                self.transaction.init(self.senderUsername, self.senderPassword, self.senderFacilityID);
                delay.resolve(true);
            },
            function (response) {
                delay.reject(response);
            }
        );

//
//        $http.get('../../resources/connectivity/user.json').then(
//            function (response) {
//                var user = angular.fromJson(response.data);
//                self.id = user.id;
//                self.senderUsername = user.username;
//                self.senderPassword = user.password;
//                self.senderFacilityID = user.facilityID;
//        self.endpoint = new Endpoint(user.endpoint);
//                self.transaction.init(self.senderUsername, self.senderPassword, self.senderFacilityID);
//                delay.resolve(true);
//            },
//            function (response) {
//                delay.reject(response);
//            }
//        );

        return delay.promise;
    };


    return TransactionUser;
});


angular.module('commonServices').factory('Transaction', function ($q, $http) {
    var Transaction = function () {
        this.username = null;
        this.running = false;
        this.password = null;
        this.facilityID = null;
        this.incoming = null;
        this.outgoing = null;
    };

    Transaction.prototype.messages = function () {
        var delay = $q.defer();
        var self = this;
        var data = angular.fromJson({"username": self.username, "password": self.password, "facilityID": self.facilityID});
        $http.post('api/transaction', data).then(
            function (response) {
                var transaction = angular.fromJson(response.data);
                self.incoming = transaction.incoming;
                self.outgoing = transaction.outgoing;
                delay.resolve(transaction);
            },
            function (response) {
                delay.reject(null);
            }
        );

//        $http.get('../../resources/connectivity/transaction.json').then(
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

        return delay.promise;
    };

    Transaction.prototype.init = function (username, password, facilityID) {
        this.clearMessages();
        this.username = username;
        this.password = password;
        this.facilityID = facilityID;
    };


    Transaction.prototype.clearMessages = function () {
        this.incoming = null;
        this.outgoing = null;
    };

    Transaction.prototype.closeConnection = function () {
        var self = this;
        var delay = $q.defer();
        var data = angular.fromJson({"username": self.username, "password": self.password, "facilityID": self.facilityID});
        $http.post('api/transaction/close', data).then(
            function (response) {
                self.running = true;
                self.clearMessages();
                delay.resolve(true);
            },
            function (response) {
                self.running = false;
                delay.reject(null);
            }
        );
//
//        $http.get('../../resources/connectivity/clearFacilityId.json').then(
//            function (response) {
//
//                self.clearMessages();
//                delay.resolve(true);
//            },
//            function (response) {
//                delay.reject(null);
//            }
//        );
        return delay.promise;
    };

    Transaction.prototype.openConnection = function (responseMessageId) {
        var self = this;
        var delay = $q.defer();
        var data = angular.fromJson({"username": self.username, "password": self.password, "facilityID": self.facilityID, "responseMessageId": responseMessageId});
        $http.post('api/transaction/open', data).then(
            function (response) {
                self.running = true;
                self.clearMessages();
                delay.resolve(true);
            },
            function (response) {
                self.running = false;
                delay.reject(null);
            }
        );

//        $http.get('../../resources/connectivity/initFacilityId.json').then(
//            function (response) {
//                self.running = true;
//                delay.resolve(true);
//            },
//            function (response) {
//                self.running = false;
//                delay.reject(null);
//            }
//        );


        return delay.promise;
    };
    return Transaction;
});





