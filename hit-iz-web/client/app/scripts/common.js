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
            USER_KEY: 'USER_KEY',
            USER_CONFIG_KEY: 'USER_CONFIG_KEY',
            TRANSPORT_CONFIG_KEY: 'TRANSPORT_CONFIG_KEY',
            APP_STATE_TOKEN: 'APP_STATE_TOKEN',


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


