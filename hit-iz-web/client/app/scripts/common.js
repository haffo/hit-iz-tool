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
      CB_LOADED_TESTSTEP_TYPE_KEY: 'CB_LOADED_TESTSTEP_TYPE_KEY',
      CB_LOADED_TESTSTEP_ID_KEY: 'CB_LOADED_TESTSTEP_ID',

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
      DQA_OPTIONS_KEY: 'DQA_OPTIONS_KEY',
      SETTINGS_KEY: 'SETTINGS_KEY',
      USER_KEY: 'USER_KEY',
      USER_CONFIG_KEY: 'USER_CONFIG_KEY',
      TRANSPORT_CONFIG_KEY: 'TRANSPORT_CONFIG_KEY',
      APP_STATE_TOKEN: 'APP_STATE_TOKEN',
      TRANSPORT_DISABLED: 'TRANSPORT_DISABLED',
      TRANSPORT_PROTOCOL: 'TRANSPORT_PROTOCOL',
      CB_SELECTED_TESTPLAN_ID_KEY: 'CB_SELECTED_TESTPLAN_ID',
      CB_SELECTED_TESTPLAN_TYPE_KEY: 'CB_SELECTED_TESTPLAN_TYPE',
      CB_SELECTED_TESTPLAN_SCOPE_KEY: 'CB_SELECTED_TESTPLAN_SCOPE_KEY',
      CF_SELECTED_TESTPLAN_SCOPE_KEY: 'CF_SELECTED_TESTPLAN_SCOPE_KEY',
      CF_SELECTED_TESTPLAN_ID_KEY: 'CF_SELECTED_TESTPLAN_ID',
      CF_SELECTED_TESTPLAN_TYPE_KEY: 'CF_SELECTED_TESTPLAN_TYPE',
      TRANSPORT_TIMEOUT: 'TRANSPORT_TIMEOUT',
      CF_ACTIVE_SUB_TAB_KEY: 'ACTIVE_CF_SUB_TAB_KEY',
      CB_MANAGE_SELECTED_TESTCASE_ID_KEY: 'CB_MANAGE_SELECTED_TESTCASE_ID',
      CB_MANAGE_SELECTED_TESTCASE_TYPE_KEY: 'CB_MANAGE_SELECTED_TESTCASE_TYPE',
      CB_MANAGE_LOADED_TESTCASE_ID_KEY: 'CB_MANAGE_LOADED_TESTCASE_ID',
      CB_MANAGE_LOADED_TESTCASE_TYPE_KEY: 'CB_MANAGE_LOADED_TESTCASE_TYPE',
      CB_MANAGE_LOADED_TESTSTEP_TYPE_KEY: 'CB_MANAGE_LOADED_TESTSTEP_TYPE_KEY',
      CB_MANAGE_LOADED_TESTSTEP_ID_KEY: 'CB_MANAGE_LOADED_TESTSTEP_ID',
      CB_MANAGE_SELECTED_TESTPLAN_ID_KEY: 'CB_MANAGE_SELECTED_TESTPLAN_ID',
      CB_MANAGE_SELECTED_TESTPLAN_TYPE_KEY: 'CB_MANAGE_SELECTED_TESTPLAN_TYPE',
      CB_MANAGE_SELECTED_TESTPLAN_SCOPE_KEY: 'CB_MANAGE_SELECTED_TESTPLAN_SCOPE_KEY',
      DOC_MANAGE_SELECTED_SCOPE_KEY: 'DOC_MANAGE_SELECTED_SCOPE_KEY',
      APP_SELECTED_DOMAIN: 'APP_SELECTED_DOMAIN',
      DOMAIN_MANAGE_SELECTED_SCOPE_KEY: 'DOMAIN_MANAGE_SELECTED_SCOPE_KEY',
      DOMAIN_MANAGE_SELECTED_ID: 'DOMAIN_MANAGE_SELECTED_ID',
      CF_MANAGE_SELECTED_TESTPLAN_ID_KEY: 'CF_MANAGE_SELECTED_TESTPLAN_ID_KEY',

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
      },
      getTransportConfig: function (domain, protocol) {
        return localStorageService.get(domain + "-" + protocol + "-transport-configs");
      },
      setTransportConfig: function (domain, protocol, val) {
        return localStorageService.set(domain + "-" + protocol + "-transport-configs", val);
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

angular.module('format').factory('IZReportClass', function ($http, $q) {
  var IZReportClass = function () {
    this.html = null;
  };
  IZReportClass.prototype.generate = function (content) {
    var delay = $q.defer();
    var that = this;
    $http({
      url: "api/iz/report/generate",
      data: $.param({'content': content}),
      headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
      method: 'POST',
      timeout: 60000
    }).success(function (data) {
      var res = angular.fromJson(data);
      that.html = res['htmlReport'];
      delay.resolve(that.html);
    }).error(function (err) {
      that.html = null;
      delay.reject(err);
    });
    return delay.promise;
  };

  IZReportClass.prototype.download = function (format, title, content) {
    var form = document.createElement("form");
    form.action = "api/iz/report/download";
    form.method = "POST";
    form.target = "_target";
    var input = document.createElement("textarea");
    input.name = "content";
    input.value = content;
    form.appendChild(input);

    input = document.createElement("input");
    input.name = "format";
    input.value = format;
    form.appendChild(input);

    input = document.createElement("input");
    input.name = "title";
    input.value = title;
    form.appendChild(input);

    form.style.display = 'none';
    document.body.appendChild(form);
    form.submit();
  };


  return IZReportClass;
});
