/**
 * Created by haffo on 10/9/15.
 */

angular.module('format', []);
angular.module('format').factory('CursorService',
  [function () {
    var CursorService = function () {
    };

    /**
     *
     * @param editor
     */
    CursorService.prototype.getCoordinate = function (editor) {
      angular.fromJson({line: -1, startIndex: -1, endIndex: -1, index: -1, triggerTree: {}});
    };

    /**
     *
     * @param line
     * @param startIndex
     * @param endIndex
     * @param index
     * @param triggerTree
     * @returns {*|Object|Array|Date|string|number|Object|Array|string|number}
     */
    CursorService.prototype.createCoordinate = function (line, startIndex, endIndex, index, triggerTree) {
      try {
        return angular.fromJson({line: -1, startIndex: -1, endIndex: -1, index: -1, triggerTree: {}});
      } catch (e) {
      }
    };

    CursorService.prototype.separatorsArray = function (separators) {
      var t = [];
      for (var type in separators) {
        if (separators.hasOwnProperty(type)) {
          t.push(separators[type]);
        }
      }
      return t;
    };

    /**
     *
     * @param index
     * @param container
     * @returns {number}
     */
    CursorService.prototype.getStartIndex = function (index, container) {
      return 0;
    };


    CursorService.prototype.setCursor = function (cursor) {
      this.cursor = cursor;
    };


    return CursorService;
  }]);


angular.module('format').factory('EditorService',
  ['$rootScope', '$http', '$q', function ($rootScope, $http, $q) {

    this.editor = null;

    var EditorService = function () {
      this.editor = null;
    };

    /**
     *
     * @returns {Array}
     */
    EditorService.prototype.getSeparators = function () {
      return this.editor != null ? this.editor.delimeters : [];
    };

    /**
     *
     * @param editorObject
     * @param cursorObject
     */
    EditorService.prototype.select = function (editorObject, cursorObject) {
      return;
    };


    EditorService.prototype.setEditor = function (editor) {
      this.editor = editor;
    };


    return EditorService;
  }]);


angular.module('format').factory('TreeService',
  [function () {

    this.editor = null;

    var TreeService = function () {
      this.editor = null;
    };

    /**
     *
     * @param type
     * @param path
     * @param segment
     * @returns {*}
     */
    TreeService.prototype.getStringValue = function (type, path, segment) {
      return null;
    };

    TreeService.prototype.getEndIndex = function (node, message) {
      return -1;
    };

    TreeService.prototype.getEndColumn = function (line, column, type, path, message) {
      return -1;
    };


    TreeService.prototype.setEditor = function (editor) {
      this.editor = editor;
    };


    /**
     *
     * @param treeObject
     */
    TreeService.prototype.expandTree = function (treeObject) {
      if (treeObject) {
        var firstNode = treeObject.get_first_branch();
        var children = treeObject.get_siblings(firstNode);
        if (children) {
          for (var i = 0; i < children.length; i++) {
            var first = children[i];
            treeObject.expand_branch(first);
            var seconds = treeObject.get_children(first);
            for (var j = 0; j < seconds.length; j++) {
              var second = seconds[j];
              treeObject.expand_branch(second);
              var thirds = treeObject.get_children(second);
              for (var k = 0; k < thirds.length; k++) {
                var third = thirds[k];
                treeObject.expand_branch(third);
              }
            }
          }
        }
      }
    };

    /**
     *
     * @param tree
     * @param lineNumber
     * @returns {*}
     */
    TreeService.prototype.findNodeByLineNumber = function (tree, lineNumber) {
      if (tree != undefined) {
        var firstNode = tree.get_first_branch();
        var children = tree.get_siblings(firstNode);
        if (children) {
          if (lineNumber === 1) {
            return firstNode;
          } else if (lineNumber <= children.length) {
            return children[lineNumber - 1];
          }
        }
      }
      return null;
    };


    /**
     *
     * @param treeObject
     * @param cursorObject
     */
    TreeService.prototype.selectNodeByIndex = function (treeObject, cursorObject, message) {
      var found = this.findByIndex(treeObject, cursorObject, message);
      if (found !== null) {
        var selectedNode = treeObject.get_selected_branch();
        if (selectedNode !== found) {
          treeObject.collapse_all();
          treeObject.select_branch(found);
          treeObject.expand_branch(found);
        }
      }
      return found;
    };


    TreeService.prototype.selectNodeByPath = function (treeObject, lineNumber, path) {
      var found = this.findByPath(treeObject, lineNumber, path);
      if (found !== null) {
        var selectedNode = treeObject.get_selected_branch();
        if (selectedNode !== found) {
          treeObject.collapse_all();
          treeObject.select_branch(found);
          treeObject.expand_branch(found);
        }
      }
      return found;

    };


    /**
     *
     * @param tree
     * @param node
     * @returns {*}
     */
    TreeService.prototype.findLastChild = function (tree, node) {
      var children = tree.get_children(node);
      if (children && children.length > 0) {
        for (var i = 0; i < children.length; i++) {
          return this.findLastChild(tree, children[i]);
        }
      } else {
        return node;
      }
    };


    return TreeService;
  }]);


angular.module('format').factory('MessageValidatorClass', function ($http, $q, $timeout) {
  this.format = null;
  var MessageValidatorClass = function (format) {
    this.format = format;
  };

  MessageValidatorClass.prototype.validate = function (testContextId, content, nav, contextType, dqaCodes, facilityId) {
    var delay = $q.defer();
    if (this.format && this.format != null) {
      $http.post('api/' + this.format + '/testcontext/' + testContextId + '/validateMessage', angular.fromJson({
        "content": content,
        "contextType": contextType,
        "dqaCodes": dqaCodes,
        "facilityId": facilityId,
        "nav": nav
      })).then(
        function (object) {
          try {
            delay.resolve(angular.fromJson(object.data));
          } catch (e) {
            delay.reject("Invalid character in the message");
          }
        },
        function (response) {
          delay.reject(response.data);
        }
      );


//            $http.get('../../resources/cf/newValidationResult3.json').then(
//                function (object) {
//                    delay.resolve(angular.fromJson(object.data));
//                },
//                function (response) {
//                    delay.reject(response.data);
//                }
//            );

//            $http.get('../../resources/erx/soap-validate-response.json').then(
//                function (object) {
//                    delay.resolve(angular.fromJson(object.data));
//                },
//                function (response) {
//                    delay.reject(response.data);
//                }
//            );

    } else {
      $timeout(function () {
        delay.reject("Unsupported format specified");
      }, 100);
    }

    return delay.promise;
  };


  return MessageValidatorClass;
});


angular.module('format').factory('MessageParserClass', function ($http, $q, $timeout) {
  this.format = null;
  var MessageParserClass = function (format) {
    this.format = format;
  };
  /**
   *
   * @param testContextId
   * @param content
   * @param name
   * @returns {*}
   */
  MessageParserClass.prototype.parse = function (testContextId, content, name) {
    var delay = $q.defer();
    if (this.format && this.format != null) {
      $http.post('api/' + this.format + '/testcontext/' + testContextId + '/parseMessage', angular.fromJson({"content": content})).then(
        function (object) {
          delay.resolve(angular.fromJson(object.data));
        },
        function (response) {
          delay.reject(response.data);
        }
      );

//            $http.get('../../resources/cf/messageObject.json').then(
//                function (object) {
//                    delay.resolve(angular.fromJson(object.data));
//                },
//                function (response) {
//                    delay.reject(response.data);
//                }
//            );
//            $http.get('../../resources/erx/soap-parse-response.json').then(
//                function (object) {
//                    delay.resolve(angular.fromJson(object.data));
//                },
//                function (response) {
//                    delay.reject(response.data);
//                }
//            );
    } else {
      $timeout(function () {
        delay.reject("Unsupported format specified");
      }, 100);
    }

    return delay.promise;
  };

  return MessageParserClass;
});


angular.module('format').factory('CursorClass', function () {
  var CursorClass = function () {
    this.updateIndicator = '0';
  };

  CursorClass.prototype.init = function () {
    this.notify();
  };

  CursorClass.prototype.notify = function () {
    this.updateIndicator = new Date().getTime();
  };

  return CursorClass;
});

angular.module('format').factory('EditorClass', function ($http, $q) {
  var EditorClass = function () {
    this.instance = null;
    this.updateIndicator = '0';
    this.id = null;
    this.name = '';
  };

  EditorClass.prototype.notifyChange = function () {
    this.updateIndicator = new Date().getTime();
  };

  EditorClass.prototype.init = function (editor) {
    if (editor != undefined) {
      this.instance = editor;
    }
  };

  EditorClass.prototype.getContent = function () {
    if (this.instance != undefined) {
      return this.instance.doc.getValue();
    }
    return null;
  };

  EditorClass.prototype.setContent = function (content) {
    if (this.instance != undefined) {
      this.instance.doc.setValue(content);
      this.notifyChange();
    }
  };


  return EditorClass;
});


angular.module('format').factory('Tree', function () {
  var Tree = function () {
    this.id = null;
    this.root = {};
  };
  return Tree;
});

angular.module('format').factory('Message', function ($http, $q) {
  var Message = function () {
    this.id = null;
    this.name = '';
    this.content = '';
    this.description = '';
    this.updateIndicator = "0";
  };

  Message.prototype.notifyChange = function () {
    this.updateIndicator = new Date().getTime();
  };


  Message.prototype.setContent = function (content) {
    this.content = content != undefined ? content : '';
    this.notifyChange();
  };

  Message.prototype.init = function (m) {
    this.id = m.id;
    this.name = m.name;
    this.description = m.description;
    this.setContent(m.content);
  };


  Message.prototype.download = function () {
    var form = document.createElement("form");
    form.action = "api/message/download";
    form.method = "POST";
    form.target = "_target";
    var input = document.createElement("textarea");
    input.name = "content";
    input.value = this.content;
    form.appendChild(input);
    form.style.display = 'none';
    document.body.appendChild(form);
    form.submit();
  };

  return Message;
});

angular.module('format').factory('TestStepService', function ($filter, $q, $http) {
  var TestStepService = function () {

  };

  TestStepService.clearRecords = function (id) {
    var delay = $q.defer();
    $http.post('api/testStepValidationReport/' + id + '/clearRecords').then(
      function (object) {
        delay.resolve(angular.fromJson(object.data));
      },
      function (response) {
        delay.reject(response.data);
      }
    );
    return delay.promise;
  };
  return TestStepService;

});

angular.module('format').factory('TestCaseService', function ($filter, $q, $http) {
  var TestCaseService = function () {

  };

  TestCaseService.clearRecords = function (id) {
    var delay = $q.defer();
    if (id != null && id != undefined) {
      $http.post('api/testCaseValidationReport/' + id + '/clearRecords').then(
        function (object) {
          delay.resolve(angular.fromJson(object.data));
        },
        function (response) {
          delay.reject(response.data);
        }
      );
    } else {
      delay.resolve(true);
    }
    return delay.promise;
  };


  TestCaseService.prototype.findOneById = function (id, testCase) {
    if (testCase) {
      if (id === testCase.id) {
        return testCase;
      }
      if (testCase.children && testCase.children != null && testCase.children.length > 0) {
        for (var i = 0; i < testCase.children.length; i++) {
          var found = this.findOneById(id, testCase.children[i]);
          if (found != null) {
            return found;
          }
        }
      }
    }
    return null;
  };

  TestCaseService.prototype.findOneByIdAndType = function (id, type, testCase) {
    if (testCase) {
      if (id === testCase.id && type === testCase.type) {
        return testCase;
      }
      if (testCase.children && testCase.children != null && testCase.children.length > 0) {
        for (var i = 0; i < testCase.children.length; i++) {
          var found = this.findOneByIdAndType(id, type, testCase.children[i]);
          if (found != null) {
            return found;
          }
        }
      }
    }
    return null;
  };


  TestCaseService.prototype.buildTree = function (node) {
    if (node.type === 'TestStep') {
      node.label = node.position + "." + node.name;
    } else {
      node.label = node.name;
    }

    if (!node['nav']) node['nav'] = {};

    var that = this;
    if (node.testCases) {
      if (!node["children"]) {
        node["children"] = node.testCases;
        angular.forEach(node.children, function (testCase) {
          testCase['transport'] = node['transport'];
          testCase['domain'] = node['domain'];
          testCase['nav'] = {};
          testCase['nav']['testStep'] = null;
          testCase['nav'] = {};
          testCase['nav']['testCase'] = testCase.name;
          testCase['nav']['testPlan'] = node.type === 'TestPlan' ? node.name : node['nav'].testPlan;
          testCase['nav']['testGroup'] = node.type === 'TestCaseGroup' ? node.name : node['nav'].testGroup;
          that.buildTree(testCase);
        });
      } else {
        angular.forEach(node.testCases, function (testCase) {
          testCase['transport'] = node['transport'];
          testCase['domain'] = node['domain'];
          node["children"].push(testCase);
          testCase['nav'] = {};
          testCase['nav']['testStep'] = null;
          testCase['nav']['testCase'] = testCase.name;
          testCase['nav']['testPlan'] = node.type === 'TestPlan' ? node.name : node['nav'].testPlan;
          testCase['nav']['testGroup'] = node.type === 'TestCaseGroup' ? node.name : node['nav'].testGroup;
          that.buildTree(testCase);
        });
      }
      node["children"] = $filter('orderBy')(node["children"], 'position');
      delete node.testCases;
    }

    if (node.testCaseGroups) {
      if (!node["children"]) {
        node["children"] = node.testCaseGroups;
        angular.forEach(node.children, function (testCaseGroup) {
          testCaseGroup['transport'] = node['transport'];
          testCaseGroup['domain'] = node['domain'];
          testCaseGroup['nav'] = {};
          //node["children"].push(testCaseGroup);
          testCaseGroup['nav']['testCase'] = null;
          testCaseGroup['nav']['testStep'] = null;
          testCaseGroup['nav']['testPlan'] = node.type === 'TestPlan' ? node.name : node['nav'].testPlan;
          testCaseGroup['nav']['testGroup'] = node.type === 'TestCaseGroup' ? node.name : node['nav'].testGroup;
          that.buildTree(testCaseGroup);
        });
      } else {
        angular.forEach(node.testCaseGroups, function (testCaseGroup) {
          testCaseGroup['transport'] = node['transport'];
          testCaseGroup['domain'] = node['domain'];
          node["children"].push(testCaseGroup);
          testCaseGroup['nav'] = {};
          testCaseGroup['nav']['testCase'] = null;
          testCaseGroup['nav']['testStep'] = null;
          testCaseGroup['nav']['testPlan'] = node.type === 'TestPlan' ? node.name : node['nav'].testPlan;
          testCaseGroup['nav']['testGroup'] = node.type === 'TestCaseGroup' ? node.name : node['nav'].testGroup;
          that.buildTree(testCaseGroup);
        });
      }
      node["children"] = $filter('orderBy')(node["children"], 'position');
      delete node.testCaseGroups;
    }

    if (node.testSteps) {
      if (!node["children"]) {
        node["children"] = node.testSteps;
        angular.forEach(node.children, function (testStep) {
          testStep['nav'] = {};
          //node["children"].push(testStep);
          testStep['nav']['testCase'] = node.name;
          testStep['nav']['testStep'] = testStep.name;
          testStep['nav']['testPlan'] = node['nav'].testPlan;
          testStep['nav']['testGroup'] = node['nav'].testGroup;
          that.buildTree(testStep);
        });
      } else {
        angular.forEach(node.testSteps, function (testStep) {
          node["children"].push(testStep);
          testStep['nav'] = {};
          testStep['nav']['testCase'] = node.name;
          testStep['nav']['testStep'] = testStep.name;
          testStep['nav']['testPlan'] = node['nav'].testPlan;
          testStep['nav']['testGroup'] = node['nav'].testGroup;
          that.buildTree(testStep);
        });
      }
      node["children"] = $filter('orderBy')(node["children"], 'position');
      delete node.testSteps;
    }
  };


  TestCaseService.prototype.buildCFTestCases = function (obj) {
    obj.label = !obj.children ? obj.position + "." + obj.name : obj.name;
    obj['nav'] = {};
    obj['nav']['testStep'] = obj.name;
    obj['nav']['testCase'] = null;
    obj['nav']['testPlan'] = null;
    obj['nav']['testGroup'] = null;

    if (obj.children) {
      var that = this;
      obj.children = $filter('orderBy')(obj.children, 'position');
      angular.forEach(obj.children, function (child) {
        child['nav'] = {};
        child['nav']['testStep'] = child.name;
        child['nav']['testCase'] = obj.name;
        child['nav']['testPlan'] = obj['nav'].testPlan;
        child['nav']['testGroup'] = null;
        that.buildCFTestCases(child);
      });
    }
  };


  TestCaseService.prototype.findNode = function (tree, node, id, type) {
    if (node.id === id && ((type != undefined && node.type === type) || (!type && !node.type))) {
      return node;
    }
    var children = tree.get_children(node);
    if (children && children.length > 0) {
      for (var i = 0; i < children.length; i++) {
        var found = this.findNode(tree, children[i], id, type);
        if (found != null) {
          return found;
        }
      }
    }
    return null;
  };


  TestCaseService.prototype.selectNodeByIdAndType = function (tree, id, type) {
    if (id != null && tree != null) {
      var foundNode = null;
      var firstNode = tree.get_first_branch();
      var children = tree.get_siblings(firstNode);
      if (children && children.length > 0) {
        for (var i = 0; i < children.length; i++) {
          var found = this.findNode(tree, children[i], id, type);
          if (found != null) {
            foundNode = found;
            break;
          }
        }
      }
      if (foundNode != null) {
        tree.collapse_all();
        tree.select_branch(foundNode);
        tree.expand_branch(foundNode);
      }
    }
  };

  return TestCaseService;
});


angular.module('format').factory('DataInstanceReport', function ($http, NewValidationReport) {
  var DataInstanceReport = function () {
    NewValidationReport.call(this, arguments);
  };

  DataInstanceReport.prototype = Object.create(NewValidationReport.prototype);
  DataInstanceReport.prototype.constructor = DataInstanceReport;

  DataInstanceReport.prototype.generateByFormat = function (json, format) {
    return this.generate("api/report/generateAs/" + format, json);
  };

  DataInstanceReport.prototype.downloadByFormat = function (json, format) {
    return this.generate("api/report/downloadAs/" + format, json);
  };
  return DataInstanceReport;
});

angular.module('format').factory('NewValidationReport', function ($http, $q) {
  var NewValidationReport = function () {
    this.content = {
      metaData: {},
      result: {}
    }
  };
  NewValidationReport.prototype.download = function (url) {
    var form = document.createElement("form");
    form.action = url;
    form.method = "POST";
    form.target = "_target";
    var input = document.createElement("textarea");
    input.name = "jsonReport";
    input.value = this.content;
    form.appendChild(input);
    form.style.display = 'none';
    document.body.appendChild(form);
    form.submit();
  };


  NewValidationReport.prototype.generate = function (url) {
    var delay = $q.defer();
    $http({
      url: url,
      data: $.param({'jsonReport': this.content}),
      headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
      method: 'POST',
      timeout: 60000
    }).success(function (data) {
      delay.resolve(angular.fromJson(data));
    }).error(function (err) {
      delay.reject(err);
    });
    return delay.promise;
  };


  return NewValidationReport;
});


angular.module('format').factory('Logger', function () {
  var Logger = function () {
    this.content = '';

    this.ins = [
      "Starting listener. Please wait...",
      "Listener started.",
      "Waiting for incoming message....Elapsed time(second):",
      "<-------------------------------------- Inbound Message ",
      "Inbound message is Invalid",
      "Outbound message is Invalid",
      "Transaction completed",
      "We did not receive any incoming message after 30s. <p>Possible cause (1): You are using wrong credentials. Please check the credentials in your outbound message against those created for your system.</p>  <p>Possible cause (2):The endpoint address may be incorrect.   Verify that you are using the correct endpoint address that is displayed by the tool.</p>",
      "We did not receive any incoming message after 30s",
      "We were unable to send the response after 30s",
      "Failed to start listener. ",
      "Transaction aborted",
      "Outbound Message  -------------------------------------->",
      "Listener stopped",
      "Stopping listener. Please wait....",
      "No Inbound message received"
    ];

    this.ous = [
      "Sending outbound Message. Please wait...",
      "Outbound Message  -------------------------------------->",
      "Inbound message received <========================",
      "Transaction completed",
      "Incorrect message received",
      "Transaction aborted",
      "Transaction stopped",
      "No outbound message sent"
    ];
  };

  Logger.prototype.logInbound = function (index) {
    this.log(this.ins[index]);
  };

  Logger.prototype.getInbound = function (index) {
    return this.ins[index];
  };


  Logger.prototype.getOutbound = function (index) {
    return this.ous[index];
  };


  Logger.prototype.logOutbound = function (index) {
    this.log(this.ous[index]);
  };


  Logger.prototype.log = function (value) {
    this.content = this.content + "\n" + this.getCurrentTime() + ":" + value;
  };

  Logger.prototype.clear = function () {
    this.content = '';
  };

  Logger.prototype.init = function () {
    this.clear();
  };


  Logger.prototype.getCurrentTime = function () {
    var now = new Date();
    return (((now.getMonth() + 1) < 10) ? "0" : "") + (now.getMonth() + 1) + "/" + ((now.getDate() < 10) ? "0" : "") + now.getDate() + "/" + now.getFullYear() + " - " +
      ((now.getHours() < 10) ? "0" : "") + now.getHours() + ":" + ((now.getMinutes() < 10) ? "0" : "") + now.getMinutes() + ":" + ((now.getSeconds() < 10) ? "0" : "") + now.getSeconds();
  };
  return Logger;
});


angular.module('format').factory('Endpoint', function () {
  var Endpoint = function () {
    this.value = null;
  };

  var Endpoint = function (url) {
    this.value = url;
  };

  return Endpoint;
});


angular.module('format').factory('SecurityFaultCredentials', function ($q, $http) {

  var SecurityFaultCredentials = function () {
    this.username = null;
    this.password = null;
  };

  SecurityFaultCredentials.prototype.init = function (username, password) {
    this.username = username;
    this.password = password;
  };

  return SecurityFaultCredentials;
});


angular.module('format').factory('Clock', function ($interval, $timeout) {
  var Clock = function (intervl) {
    this.value = undefined;
    this.intervl = intervl;
    this.timeout = null;
  };
  Clock.prototype.start = function (fn) {
    if (angular.isDefined(this.value)) {
      this.stop();
    }
    this.value = $interval(fn, this.intervl);
  };


  Clock.prototype.stop = function () {
    if (angular.isDefined(this.value)) {
      $interval.cancel(this.value);
      this.value = undefined;
    }
  };
  return Clock;
});


angular.module('format').factory('ValidationResultItem', function () {
  var ValidationResultItem = function () {
    this.data = [];
    this.categories = [];
    this.categories.push({"title": "All", "data": []});
    this.show = true;
    this.updateIndicator = '0';
  };

  ValidationResultItem.prototype.init = function (data) {
    this.data = data;
    this.categories = [];
    this.categories.push({"title": "All", "data": []});
    this.show = true;
    this.notify();
  };
  ValidationResultItem.prototype.notify = function () {
    this.updateIndicator = new Date().getTime();
  };
  return ValidationResultItem;
});


angular.module('format').factory('ValidationSettings', function () {
  var ValidationSettings = function () {
    this.errors = true;
    this.affirmatives = true;
    this.ignores = true;
    this.alerts = true;
    this.warnings = true;
  };
  return ValidationSettings;
});

angular.module('format').factory('ValidationResult', function (ValidationResultItem, $q) {
  var ValidationResult = function (key) {
    this.key = key;
    this.xml = '';
    this.errors = new ValidationResultItem();
    this.affirmatives = new ValidationResultItem();
    this.ignores = new ValidationResultItem();
    this.alerts = new ValidationResultItem();
    this.warnings = new ValidationResultItem();
    this.informationals = new ValidationResultItem();
    this.id = '';
  };


  ValidationResult.prototype.updateId = function () {
    this.id = new Date().getTime();
  };


  ValidationResult.prototype.clear = function () {
    this.xml = '';
    this.errors = new ValidationResultItem();
    this.affirmatives = new ValidationResultItem();
    this.ignores = new ValidationResultItem();
    this.alerts = new ValidationResultItem();
    this.warnings = new ValidationResultItem();
    this.informationals = new ValidationResultItem();
    this.updateId();
  };

  ValidationResult.prototype.init = function (object) {
    this.xml = object.xml;
    this.errors.init(object.errors);
    this.affirmatives.init(object.affirmatives);
    this.ignores.init(object.ignores);
    this.alerts.init(object.alerts);
    this.warnings.init(object.warnings);
    this.informationals.init(object.informationals);
    this.updateId();
  };


  ValidationResult.prototype.saveState = function () {
    sessionStorage.setItem(this.key, this.content);
  };

  ValidationResult.prototype.restoreState = function () {
    this.content = sessionStorage.getItem(this.key);
  };
  ValidationResult.prototype.hasState = function () {
    return sessionStorage.getItem(this.key) !== {xml: ''} && sessionStorage.getItem(this.key) != null;
  };
  ValidationResult.prototype.getState = function () {
    return sessionStorage.getItem(this.key);
  };
  ValidationResult.prototype.getContent = function () {
    return this.content;
  };
  ValidationResult.prototype.setContent = function (value) {
    this.content = value;
  };

  return ValidationResult;
});


angular.module('format').factory('AppInfo', ['$http', '$q', function ($http, $q) {
  return {
    get: function () {
      var delay = $q.defer();
      $http.get('api/appInfo').then(
        function (object) {
          delay.resolve(angular.fromJson(object.data));
        },
        function (response) {
          delay.reject(response.data);
        }
      );

//            $http.get('../../resources/appInfo.json').then(
//                function (object) {
//                    delay.resolve(angular.fromJson(object.data));
//                },
//                function (response) {
//                    delay.reject(response.data);
//                }
//            );

      return delay.promise;

    }
  };
}]);


angular.module('format').factory('User', function ($q, $http, StorageService) {
  var UserClass = function () {
    this.info = null;
  };

  UserClass.prototype.setInfo = function (data) {
    this.info = data;
    //StorageService.set(StorageService.USER_KEY,angular.toJson(data));
  };

  UserClass.prototype.getGuest = function () {
    var delay = $q.defer();
    var user = this;
    $http.post('api/accounts/guest').then(
      function (response) {
        var data = angular.fromJson(response.data);
        delay.resolve(data);
      },
      function (response) {
        delay.reject(response.data);
      }
    );

//        $http.get('../../resources/cb/user.json').then(
//            function (response) {
//                var data = angular.fromJson(response.data);
//                user.setInfo(data);
//                delay.resolve(data);
//            },
//            function (response) {
//                user.setInfo(null);
//                delay.reject(response.data);
//            }
//        );


    return delay.promise;
  };

  UserClass.prototype.createGuestIfNotExist = function () {
    var delay = $q.defer();
    var user = this;
    $http.post('api/accounts/guest/createIfNotExist').then(
      function (response) {
        var data = angular.fromJson(response.data);
        delay.resolve(data);
      },
      function (response) {
        delay.reject(response.data);
      }
    );

//
//        $http.get('../../resources/cb/user.json').then(
//            function (response) {
//                var data = angular.fromJson(response.data);
//                user.setInfo(data);
//                delay.resolve(data);
//            },
//            function (response) {
//                user.setInfo(null);
//                delay.reject(response.data);
//            }
//        );

    return delay.promise;
  };


  UserClass.prototype.initUser = function (currentUser) {
    this.info = {};
    if (currentUser != null && currentUser) {
      this.info.id = currentUser.accountId;
    }
  };

//        var delay = $q.defer();
//        var user = this;
//        $http.post('api/accounts/guest/delete').then(
//            function (response) {
//                var data = angular.fromJson(response.data);
//                user.setInfo(null);
//                delay.resolve(true);
//            },
//            function (response) {
//                user.setInfo(null);
//                delay.reject(response.data);
//            }
//        );
//        return delay.promise;
//    };

//    UserClass.prototype.delete = function () {
//        if(this.info && this.info != null && this.info.id != null){
//            $http.post("api/user/" + this.info.id + "/delete");
//        }
//        //StorageService.remove(StorageService.USER_KEY);
//    };

  return new UserClass();
});


angular.module('format').factory('Session', ['$q', '$http', function ($q, $http) {
  var SessionClass = function () {
  };

  SessionClass.prototype.create = function (data) {
    var delay = $q.defer();
    $http.post('api/session/create').then(
      function (response) {
        delay.resolve(response);
      },
      function (response) {
        delay.reject(response.data);
      }
    );
//        $http.get('../../resources/cb/session.json').then(
//            function (response) {
//                delay.resolve(angular.fromJson(response.data));
//            },
//            function (response) {
//                delay.reject('Sorry,we did not get a response');
//            }
//        );
    return delay.promise;
  };

  SessionClass.prototype.delete = function (data) {
    var delay = $q.defer();
    $http.post('api/session/delete').then(
      function (response) {
        delay.resolve(response);
      },
      function (response) {
        delay.reject(response.data);
      }
    );
    return delay.promise;
  };

  return new SessionClass();
}]);


angular.module('format').factory('Transport', function ($q, $http, StorageService, User, $timeout, $rootScope) {
    var Transport = {
      running: false,
      configs: {},
      transactions: [],
      logs: {},
      disabled: StorageService.get(StorageService.TRANSPORT_DISABLED) != null ? StorageService.get(StorageService.TRANSPORT_DISABLED) : true,

      /**
       *
       * @param domain
       */
      setDisabled: function (disabled) {
        this.disabled = disabled;
      },

      getAllConfigForms: function () {
        var delay = $q.defer();
        $http.get('api/transport/config/forms').then(
          function (response) {
            var data = angular.fromJson(response.data);
            delay.resolve(data);
          },
          function (response) {
            delay.reject(response);
          }
        );

//                $http.get('../../resources/cb/transport-config-forms.json').then(
//                        function (response) {
//                            delay.resolve(angular.fromJson(response.data));
//                        },
//                        function (response) {
//                            delay.reject(response);
//                        }
//                );

        return delay.promise;
      },

      getConfigData: function (domain, protocol) {
        var delay = $q.defer();
        var self = this;
        if (domain != null && protocol != null && User.info && User.info != null && User.info.id != null) {
          $http.post('api/transport/' + domain + "/" + protocol + '/configs').then(
            function (response) {
              delay.resolve(angular.fromJson(response.data));
            },
            function (response) {
              delay.reject(response);
            }
          );
//
//                    $http.get('../../resources/cb/transport-config-data.json').then(
//                        function (response) {
//                            delay.resolve(angular.fromJson(response.data));
//                        },
//                        function (response) {
//                            delay.reject(response);
//                        }
//                    );
        } else {
          delay.reject("Domain, protocol or user info not provided");
        }
        return delay.promise;
      },


      searchTransaction: function (testStepId, config, responseMessageId, domain, protocol) {
        var delay = $q.defer();
        var self = this;
        if (config != null) {
          var data = angular.fromJson({
            "testStepId": testStepId,
            "userId": User.info.id,
            "config": config,
            "responseMessageId": responseMessageId
          });
          $http.post('api/transport/' + domain + "/" + protocol + '/searchTransaction', data).then(
            function (response) {
              if (response.data != null && response.data != "") {
                self.transactions[testStepId] = angular.fromJson(response.data);
              } else {
                self.transactions[testStepId] = null;
              }
              delay.resolve(self.transactions[testStepId]);
            },
            function (response) {
              self.transactions[testStepId] = null;
              delay.reject(self.transactions[testStepId]);
            }
          );
//                    $http.get('../../resources/cb/transaction.json').then(
//                        function (response) {
//                            if (response.data != null && response.data != "") {
//                                self.transactions[testStepId] = angular.fromJson(response.data);
//                            } else {
//                                self.transactions[testStepId] = null;
//                            }
//                            delay.resolve(self.transactions[testStepId]);
//                        },
//                        function (response) {
//                            delay.reject(null);
//                        }
//                    );
        } else {
          delay.reject("Configuration info not found");
        }

        return delay.promise;
      },

      deleteTransaction: function (testStepId) {
        var delay = $q.defer();
        var self = this;
        if (self.transactions && self.transactions != null && self.transactions[testStepId]) {
          var transaction = self.transactions[testStepId];
          $http.post('api/transport/transaction/' + transaction.id + '/delete').then(
            function (response) {
              delete self.transactions[testStepId];
              delay.resolve(true);
            },
            function (response) {
              delete self.transactions[testStepId];
              delay.resolve(true);
            }
          );
        } else {
          delay.resolve(true);
        }
        return delay.promise;
      },

      stopListener: function (testStepId, domain, protocol) {
        var self = this;
        var delay = $q.defer();
        this.deleteTransaction(testStepId).then(function (result) {
          var data = angular.fromJson({"testStepId": testStepId});
          $http.post('api/transport/' + domain + "/" + protocol + '/stopListener', data).then(
            function (response) {
              self.running = true;
              delay.resolve(true);
            },
            function (response) {
              self.running = false;
              delay.reject(null);
            }
          );
        });

//
//                $http.get('../../resources/cb/stopListener.json').then(
//                    function (response) {
//                        self.running = true;
//                        self.deleteTransaction(testStepId);
//                        delay.resolve(true);
//                    },
//                    function (response) {
//                        self.running = false;
//                        delay.reject(null);
//                    }
//                );
        return delay.promise;
      },

      startListener: function (testStepId, responseMessageId, domain, protocol) {
        var delay = $q.defer();
        var self = this;
        this.deleteTransaction(testStepId).then(function (result) {
          var data = angular.fromJson({"testStepId": testStepId, "responseMessageId": responseMessageId});
          $http.post('api/transport/' + domain + "/" + protocol + '/startListener', data).then(
            function (response) {
              self.running = true;
              delay.resolve(true);
            },
            function (response) {
              self.running = false;
              delay.reject(null);
            }
          );
        });

//                $http.get('../../resources/cb/startListener.json').then(
//                    function (response) {
//                        self.running = true;
//                        delay.resolve(true);
//                    },
//                    function (response) {
//                        self.running = false;
//                        delay.reject(null);
//                    }
//                );
        return delay.promise;
      },

      send: function (testStepId, message, domain, protocol) {
        var delay = $q.defer();
        var self = this;
        this.deleteTransaction(testStepId).then(function (result) {
          var data = angular.fromJson({
            "testStepId": testStepId,
            "message": message,
            "config": self.configs[domain][protocol].data.taInitiator
          });
          $http.post('api/transport/' + domain + "/" + protocol + '/send', data).then(
            function (response) {
              self.transactions[testStepId] = angular.fromJson(response.data);
              delay.resolve(self.transactions[testStepId]);
            },
            function (response) {
              self.transactions[testStepId] = null;
              delay.reject(response);
            }
          );
//                    $http.get('../../resources/cb/send.json').then(
//                        function (response) {
//                            self.transactions[testStepId] = angular.fromJson(response.data);
//                            delay.resolve(self.transactions[testStepId]);
//                        },
//                        function (response) {
//                            delay.reject(response);
//                        }
//                    );
        });
        return delay.promise;
      },

      init: function () {
        this.error = null;
        var delay = $q.defer();
        var self = this;
        self.configs = {};
        this.getAllConfigForms().then(function (transportForms) {
          $rootScope.transportSupported = transportForms != null && transportForms.length > 0;
          if ($rootScope.transportSupported) {
            angular.forEach(transportForms, function (transportForm) {
              var domain = transportForm.domain;
              var protocol = transportForm.protocol;
              if (!self.configs[domain]) {
                self.configs[domain] = {};
              }
              if (!self.configs[domain][protocol]) {
                self.configs[domain][protocol] = {};
              }
              if (!self.configs[domain][protocol]['forms']) {
                self.configs[domain][protocol]['forms'] = {};
              }
              self.configs[domain][protocol]['forms'] = transportForm;

              self.getConfigData(domain, protocol).then(function (data) {
                self.configs[domain][protocol]['data'] = data;
                self.configs[domain][protocol]['open'] = {
                  ta: true,
                  sut: false
                };
                $rootScope.$emit(domain + "-" + protocol + "-data-loaded");
              }, function (error) {
                self.configs[domain][protocol]['error'] = error.data;
              });
            });
          }
        }, function (error) {
          self.error = "No transport configs found.";
        });
      },
      populateMessage: function (testStepId, message, domain, protocol) {
        var delay = $q.defer();
        var self = this;
        var data = angular.fromJson({"testStepId": testStepId, "message": message});
        $http.post('api/transport/' + domain + "/" + protocol + '/populateMessage', data).then(
          function (response) {
            delay.resolve(angular.fromJson(response.data));
          },
          function (response) {
            delay.reject(null);
          }
        );

//                $http.get('../../resources/cb/startListener.json').then(
//                    function (response) {
//                        self.running = true;
//                        delay.resolve(true);
//                    },
//                    function (response) {
//                        self.running = false;
//                        delay.reject(null);
//                    }
//                );
        return delay.promise;
      }
    };

    return Transport;
  }
);


angular.module('format')
  .controller('TransportConfigListCtrl', ['$scope', 'Transport', 'StorageService', '$http', 'User', function ($scope, Transport, StorageService, $http, User) {
    $scope.transport = Transport;
    $scope.loading = false;
    $scope.selectedProto = null;
    $scope.selected = {
      domain: null,
      protocol: null
    };

    $scope.getDomains = function () {
      return $scope.transport.configs ? Object.getOwnPropertyNames($scope.transport.configs) : [];
    };

    $scope.getProtocols = function (domain) {
      return domain != null && $scope.transport.configs && $scope.transport.configs[domain] ? Object.getOwnPropertyNames($scope.transport.configs[domain]) : [];
    };

    $scope.getProtoDescription = function (domain, protocol) {
      try {
        return $scope.transport.configs[domain][protocol]['forms']['description'];
      } catch (error) {
      }
      return null;
    };

    $scope.getConfigs = function () {
      return $scope.transport.configs;
    };


    $scope.initTransportConfigList = function () {
      var doms = $scope.getDomains();
      if (doms.length > 0)
        $scope.selected.domain = doms[0];
      var protos = $scope.getProtocols($scope.selected.domain);
      if (protos.length > 0)
        $scope.selected.protocol = protos[0];
    };

    $scope.selectPane = function (dom, proto) {
      $scope.selected.protocol = proto;
      $scope.selected.domain = dom;
    };

    $scope.isActivePane = function (dom, proto) {
      return $scope.selected.protocol != null && $scope.selected.protocol === proto && $scope.selected.domain != null && $scope.selected.domain === dom;
    };

    $scope.toggleTransport = function (disabled) {
      $scope.transport.disabled = disabled;
      StorageService.set(StorageService.TRANSPORT_DISABLED, disabled);
    };


  }]);


angular.module('format').controller('InitiatorConfigCtrl', function ($scope, $modalInstance, htmlForm, config, domain, protocol, $http, User) {
  $scope.config = angular.copy(config);
  $scope.form = htmlForm;
  $scope.domain = domain;
  $scope.protocol = protocol;

  $scope.initInitiatorConfig = function (config) {
    $scope.config = angular.copy(config);
  };

  $scope.save = function () {
//        $http.get('../../resources/cb/saveConfig.json');
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


angular.module('format').controller('TaInitiatorConfigCtrl', function ($scope, $http, User, StorageService, Transport, $rootScope, Notification) {
  $scope.transport = Transport;
  $scope.config = null;
  $scope.prevConfig = null;
  $scope.loading = false;
  $scope.error = null;
  $scope.protocol = null;
  $scope.saved = true;
  $scope.domain = null;
  $scope.message = null;

  $scope.initTaInitiatorConfig = function (domain, protocol) {
    if (protocol && protocol != null && domain && domain != null) {
      $scope.protocol = protocol;
      $scope.domain = domain;
      $scope.message = null;
      $scope.loadData();
      $rootScope.$on(domain + "-" + protocol + "-data-loaded", function (event) {
        $scope.loadData();
      });

//
//            if (!$scope.transport.configs[domain][protocol]['data'] || !$scope.transport.configs[domain][protocol]['data']['taInitiator']) {
//                $scope.loading = true;
//                $scope.transport.getConfigData(domain, protocol).then(function (data) {
//                    $scope.transport.configs[domain][protocol]['data'] = data;
//                    $scope.config = data.taInitiator;
//                    $scope.prevConfig = angular.copy($scope.config);
//                    $scope.loading = false;
//                }, function (error) {
//                    $scope.error = error.data;
//                    $scope.loading = false;
//                });
//            } else {
//                $scope.config = $scope.transport.configs[domain][protocol]['data']['taInitiator'];
//                $scope.prevConfig = angular.copy($scope.config);
//            }
    } else {
      $scope.error = "Protocol or domain not defined."
    }
  };

  $scope.loadData = function () {
    $scope.config = angular.copy($scope.transport.configs[$scope.domain][$scope.protocol]['data']['taInitiator']);
    $scope.prevConfig = angular.copy($scope.config);
    $scope.message = null;
  };

  $scope.save = function () {
    $scope.error = null;
    $scope.message = null;
//        $http.get('../../resources/cb/saveConfig.json');
    var data = angular.fromJson({
      "config": $scope.config,
      "userId": User.info.id,
      "type": "TA_INITIATOR",
      "protocol": $scope.protocol,
      "domain": $scope.domain
    });
    $http.post('api/transport/config/save', data).then(function (result) {
      $scope.transport.configs[$scope.domain][$scope.protocol]['data']['taInitiator'] = $scope.config;
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

angular.module('format').controller('SutInitiatorConfigCtrl', function ($scope, $http, Transport, $rootScope, User, Notification) {
  $scope.transport = Transport;
  $scope.config = null;
  $scope.loading = false;
  $scope.saving = false;
  $scope.error = null;
  $scope.protocol = null;
  $scope.initSutInitiatorConfig = function (domain, protocol) {
    if (protocol && protocol != null && domain && domain != null) {
      $scope.protocol = protocol;
      $scope.domain = domain;
      $scope.loadData();
      $rootScope.$on(domain + "-" + protocol + "-data-loaded", function (event) {
        $scope.loadData();
      });
//            $scope.config = $scope.transport.configs[domain][protocol]['data']['sutInitiator'];
//            if (!$scope.transport.configs[domain][protocol]['data'] || !$scope.transport.configs[domain][protocol]['data']['sutInitiator']) {
//                $scope.loading = true;
//                $scope.transport.getConfigData(domain, protocol).then(function (data) {
//                    $scope.loading = false;
//                    $scope.transport.configs[domain][protocol]['data'] = data;
//                    $scope.config = data.sutInitiator;
//                }, function (error) {
//                    $scope.error = error.data;
//                    $scope.loading = false;
//                });
//            } else {
//                $scope.config = $scope.transport.configs[domain][protocol]['data']['sutInitiator'];
//            }
    } else {
      $scope.error = "Protocol or domain not defined."
    }
  };

  $scope.loadData = function () {
    $scope.config = $scope.transport.configs[$scope.domain][$scope.protocol]['data']['sutInitiator'];
  };

  $scope.saveSutInitiatorConfig = function (domain, protocole) {
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
        "protocol": protocole,
        "domain": domain
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


angular.module('format').factory('TestExecutionService',
  ['$q', '$http', '$rootScope', 'ReportService', 'TestCaseService', 'StorageService', function ($q, $http, $rootScope, ReportService, TestCaseService, StorageService) {

    var TestExecutionService = {
      resultOptions: [
        {"title": "Passed", "value": "PASSED", "class": "fa fa-check green"},
        {"title": "Passed - Notable Exception", "value": "PASSED_NOTABLE_EXCEPTION", "class": "fa fa-check green"},
        {"title": "Failed", "value": "FAILED", "class": "fa fa-check red"},
        {"title": "Failed - Not Supported", "value": "FAILED_NOT_SUPPORTED", "class": "fa fa-check red"},
        {"title": "Incomplete", "value": "INCOMPLETE", "class": "fa fa-check gray"},
        {"title": "Inconclusive", "value": "INCONCLUSIVE", "class": "fa fa-check yellow"}
      ],
      executionOptions: [
        {"title": "In Progress", "value": "IN_PROGRESS"},
        {"title": "Complete", "value": "COMPLETE"},
        {"title": "Incomplete", "value": "INCOMPLETE"}
      ],
      testStepValidationResults: StorageService.get("testStepValidationResults") != null ? angular.fromJson(StorageService.get("testStepValidationResults")) : {},
      testStepExecutionStatuses: StorageService.get("testStepExecutionStatuses") != null ? angular.fromJson(StorageService.get("testStepExecutionStatuses")) : {},
      testCaseExecutionStatuses: StorageService.get("testCaseExecutionStatuses") != null ? angular.fromJson(StorageService.get("testCaseExecutionStatuses")) : {},
      testCaseValidationResults: StorageService.get("testCaseValidationResults") != null ? angular.fromJson(StorageService.get("testCaseValidationResults")) : {},
      testCaseComments: StorageService.get("testCaseComments") != null ? angular.fromJson(StorageService.get("testCaseComments")) : {},
      testStepComments: StorageService.get("testStepComments") != null ? angular.fromJson(StorageService.get("testStepComments")) : {},
      testStepValidationReports: StorageService.get("testStepValidationReports") != null ? angular.fromJson(StorageService.get("testStepValidationReports")) : {},
      testStepExecutionMessages: StorageService.get("testStepExecutionMessages") != null ? angular.fromJson(StorageService.get("testStepExecutionMessages")) : {},
      testStepMessageTrees: StorageService.get("testStepMessageTrees") != null ? angular.fromJson(StorageService.get("testStepMessageTrees")) : {},
      testStepValidationReportObjects: StorageService.get("testStepValidationReportObjects") != null ? angular.fromJson(StorageService.get("testStepValidationReportObjects")) : {}
    };


    TestExecutionService.init = function () {
      TestExecutionService.testStepValidationResults = StorageService.get("testStepValidationResults") != null ? angular.fromJson(StorageService.get("testStepValidationResults")) : {};
      TestExecutionService.testStepExecutionStatuses = StorageService.get("testStepExecutionStatuses") != null ? angular.fromJson(StorageService.get("testStepExecutionStatuses")) : {};
      TestExecutionService.testCaseExecutionStatuses = StorageService.get("testCaseExecutionStatuses") != null ? angular.fromJson(StorageService.get("testCaseExecutionStatuses")) : {};
      TestExecutionService.testCaseValidationResults = StorageService.get("testCaseValidationResults") != null ? angular.fromJson(StorageService.get("testCaseValidationResults")) : {};
      TestExecutionService.testCaseComments = StorageService.get("testCaseComments") != null ? angular.fromJson(StorageService.get("testCaseComments")) : {};
      TestExecutionService.testStepComments = StorageService.get("testStepComments") != null ? angular.fromJson(StorageService.get("testStepComments")) : {};
      TestExecutionService.testStepValidationReports = StorageService.get("testStepValidationReports") != null ? angular.fromJson(StorageService.get("testStepValidationReports")) : {};
      TestExecutionService.testStepExecutionMessages = StorageService.get("testStepExecutionMessages") != null ? angular.fromJson(StorageService.get("testStepExecutionMessages")) : {};
      TestExecutionService.testStepMessageTrees = StorageService.get("testStepMessageTrees") != null ? angular.fromJson(StorageService.get("testStepMessageTrees")) : {};
      TestExecutionService.testStepValidationReportObjects = StorageService.get("testStepValidationReportObjects") != null ? angular.fromJson(StorageService.get("testStepValidationReportObjects")) : {};

    };

    TestExecutionService.clear = function (testCaseId) {
      StorageService.remove("testStepValidationResults");
      StorageService.remove("testStepExecutionStatuses");
      StorageService.remove("testCaseExecutionStatuses");
      StorageService.remove("testCaseValidationResults");
      StorageService.remove("testCaseComments");
      StorageService.remove("testStepComments");
      StorageService.remove("testStepValidationReports");
      StorageService.remove("testStepExecutionMessages");
      StorageService.remove("testStepMessageTrees");
      StorageService.remove("testStepValidationReportObjects");
      TestExecutionService.testStepValidationResults = {};
      TestExecutionService.testStepExecutionStatuses = {};
      TestExecutionService.testCaseExecutionStatuses = {};
      TestExecutionService.testCaseValidationResults = {};
      TestExecutionService.testCaseComments = {};
      TestExecutionService.testStepComments = {};
      TestExecutionService.testStepValidationReports = {};
      TestExecutionService.testStepExecutionMessages = {};
      TestExecutionService.testStepMessageTrees = {};
      TestExecutionService.testStepValidationReportObjects = {};
      return TestCaseService.clearRecords(testCaseId);
    };


    TestExecutionService.initTestStep = function (testStep) {
//            delete TestExecutionService.testStepComments[testStep.id];
//            delete TestExecutionService.testStepValidationResults[testStep.id];
//            delete TestExecutionService.testStepExecutionStatuses[testStep.id];
//            delete TestExecutionService.testStepValidationReports[testStep.id];
//            delete TestExecutionService.testStepMessageTrees[testStep.id];
//            delete TestExecutionService.testStepExecutionMessages[testStep.id];
//            delete TestExecutionService.testStepValidationReportObjects[testStep.id];
      return ReportService.initTestStepValidationReport(testStep.id);
    };


    TestExecutionService.setTestStepValidationReportObject = function (step, value) {
      if (step != null) {
        TestExecutionService.testStepValidationReportObjects[step.id] = angular.toJson(value);
        StorageService.set("testStepValidationReportObjects", angular.toJson(TestExecutionService.testStepValidationReportObjects));
      }
    };

    TestExecutionService.getTestStepValidationReportObject = function (step) {
      return step != null && TestExecutionService.testStepValidationReportObjects[step.id] ? angular.fromJson(TestExecutionService.testStepValidationReportObjects[step.id]) : undefined;
    };


    TestExecutionService.getTestStepExecutionStatus = function (step) {
      return step != null ? TestExecutionService.testStepExecutionStatuses[step.id] : undefined;
    };


    TestExecutionService.setTestStepExecutionStatus = function (step, value) {
      if (step != null) {
        TestExecutionService.testStepExecutionStatuses[step.id] = value;
        StorageService.set("testStepExecutionStatuses", angular.toJson(TestExecutionService.testStepExecutionStatuses));

      }
    };

    TestExecutionService.getTestStepExecutionStatus = function (step) {
      return step != null ? TestExecutionService.testStepExecutionStatuses[step.id] : undefined;
    };

    TestExecutionService.setTestCaseValidationResult = function (testCase, value) {
      if (testCase != null) {
        TestExecutionService.testCaseValidationResults[testCase.id] = value;
        StorageService.set("testCaseValidationResults", angular.toJson(TestExecutionService.testCaseValidationResults));

      }
    };

    TestExecutionService.getTestCaseValidationResult = function (testCase) {
      return testCase != null ? TestExecutionService.testCaseValidationResults[testCase.id] : undefined;
    };

    TestExecutionService.setTestCaseExecutionStatus = function (testCase, value) {
      if (testCase != null) {
        TestExecutionService.testCaseExecutionStatuses[testCase.id] = value;
        StorageService.set("testCaseExecutionStatuses", angular.toJson(TestExecutionService.testCaseExecutionStatuses));

      }
    };

    TestExecutionService.getTestCaseExecutionStatus = function (testCase) {
      return testCase != null ? TestExecutionService.testCaseExecutionStatuses[testCase.id] : undefined;
    };

    TestExecutionService.getTestStepValidationResult = function (step) {
      return step != null ? TestExecutionService.testStepValidationResults[step.id] : undefined;
    };

    TestExecutionService.getTestCaseComments = function (testCase) {
      return testCase != null ? TestExecutionService.testCaseComments[testCase.id] : undefined;
    };

    TestExecutionService.setTestCaseComments = function (testCase) {
      return testCase != null ? TestExecutionService.testCaseComments[testCase.id] : undefined;
    };

    TestExecutionService.getTestStepComments = function (testStep) {
      return testStep != null ? TestExecutionService.testStepComments[testStep.id] : undefined;
    };

    TestExecutionService.setTestStepComments = function (testStep, value) {
      TestExecutionService.testStepComments[testStep.id] = value;
      StorageService.set("testStepComments", angular.toJson(TestExecutionService.testStepComments));
      return TestExecutionService.updateTestStepValidationReport(testStep);
    };

    TestExecutionService.deleteTestStepComments = function (testStep) {
      delete TestExecutionService.testStepComments[testStep.id];
      StorageService.set("testStepComments", angular.toJson(TestExecutionService.testStepComments));
      return TestExecutionService.updateTestStepValidationReport(testStep);
    };


    TestExecutionService.setTestStepValidationResult = function (step, value) {
      TestExecutionService.testStepValidationResults[step.id] = value;
      StorageService.set("testStepValidationResults", angular.toJson(TestExecutionService.testStepValidationResults));
      return TestExecutionService.updateTestStepValidationReport(step);
    };

    TestExecutionService.deleteTestStepValidationResult = function (step) {
      delete TestExecutionService.testStepValidationResults[step.id];
      StorageService.set("testStepValidationResults", angular.toJson(TestExecutionService.testStepValidationResults));
      return TestExecutionService.updateTestStepValidationReport(step);
    };


    TestExecutionService.getTestStepMessageValidationResult = function (step) {
      var result = -1;
      try {
        result = TestExecutionService.getTestStepValidationReport(step).result.errors.categories[0].data.length;
      } catch (errr) {

      }
      return result;
    };

    TestExecutionService.getTestStepMessageValidationResultDesc = function (step) {
      var result = TestExecutionService.getTestStepMessageValidationResult(step);
      return result > 0 ? 'FAILED' : result === 0 ? 'PASSED' : undefined;
    };

    TestExecutionService.setTestCaseValidationResultFromTestSteps = function (testCase) {
      var results = [];
      for (var i = 0; i < testCase.children.length; i++) {
        var testStep = testCase.children[i];
        var result = TestExecutionService.getTestStepValidationResult(testStep);
        result = result != null && result != undefined && result != '' ? result : 'INCOMPLETE';
        results.push(result);
      }
      var res = null;
      if (results.indexOf('INCOMPLETE') >= 0) {
        res = 'INCOMPLETE';
      } else if (results.indexOf('INCONCLUSIVE') >= 0) {
        res = 'INCONCLUSIVE';
      } else if (results.indexOf('FAILED_NOT_SUPPORTED') >= 0 || results.indexOf('FAILED') >= 0) {
        res = 'FAILED';
      } else if (results.indexOf('PASSED_NOTABLE_EXCEPTION') >= 0) {
        res = 'PASSED_NOTABLE_EXCEPTION';
      } else {
        res = 'PASSED';
      }
      TestExecutionService.setTestCaseValidationResult(testCase, res);
    };

    TestExecutionService.getResultOptionByValue = function (value) {
      for (var i = 0; i < TestExecutionService.resultOptions.length; i++) {
        if (TestExecutionService.resultOptions[i].value === value) {
          return TestExecutionService.resultOptions[i];
        }
      }
      return null;
    };


    TestExecutionService.getValidationResult = function (step) {
      return step != null && TestExecutionService.getTestStepValidationReport(step) ? TestExecutionService.getTestStepValidationReport(step).result : undefined;
    };

    TestExecutionService.setTestStepExecutionMessage = function (step, value) {
      if (step != null) {
        TestExecutionService.testStepExecutionMessages[step.id] = value;
        StorageService.set("testStepExecutionMessages", angular.toJson(TestExecutionService.testStepExecutionMessages));
      }

    };

    TestExecutionService.getTestStepExecutionMessage = function (step) {
      return step != null ? TestExecutionService.testStepExecutionMessages[step.id] : undefined;
    };

    TestExecutionService.setTestStepMessageTree = function (step, value) {
      if (step != null) {
        TestExecutionService.testStepMessageTrees[step.id] = value;
        StorageService.set("testStepMessageTrees", angular.toJson(TestExecutionService.testStepMessageTrees));
      }
    };

    TestExecutionService.getTestStepMessageTree = function (step) {
      return step != null ? TestExecutionService.testStepMessageTrees[step.id] : undefined;
    };

    TestExecutionService.getTestStepValidationReport = function (step) {
      return step != null ? TestExecutionService.testStepValidationReports[step.id] : undefined;
    };

    TestExecutionService.setTestStepValidationReport = function (step, value) {
      TestExecutionService.testStepValidationReports[step.id] = value;
      StorageService.set("testStepValidationReports", angular.toJson(TestExecutionService.testStepValidationReports));
    };


    TestExecutionService.deleteTestStepExecutionStatus = function (step) {
      if (step != null) {
        delete  TestExecutionService.testStepExecutionStatuses[step.id];
        StorageService.set("testStepExecutionStatuses", angular.toJson(TestExecutionService.testStepExecutionStatuses));
      }
    };

    TestExecutionService.deleteTestCaseExecutionStatus = function (testCase) {
      if (testCase != null) {
        delete  TestExecutionService.testCaseExecutionStatuses[testCase.id];
        StorageService.set("testCaseExecutionStatuses", angular.toJson(TestExecutionService.testCaseExecutionStatuses));
      }
    };

    TestExecutionService.deleteTestCaseValidationResult = function (testCase) {
      if (testCase != null) {
        delete  TestExecutionService.testCaseValidationResults[testCase.id];
        StorageService.set("testCaseValidationResults", angular.toJson(TestExecutionService.testCaseValidationResults));
      }
    };


    TestExecutionService.deleteTestStepValidationReport = function (step) {
      delete TestExecutionService.testStepValidationReports[step.id];
      StorageService.set("testStepValidationReports", angular.toJson(TestExecutionService.testStepValidationReports));

    };

    TestExecutionService.deleteTestStepExecutionMessage = function (step) {
      if (step) {
        delete TestExecutionService.testStepExecutionMessages[step.id];
        StorageService.set("testStepExecutionMessages", angular.toJson(TestExecutionService.testStepExecutionMessages));
      }
    };

    TestExecutionService.deleteTestStepMessageTree = function (step) {
      if (step) {
        delete  TestExecutionService.testStepMessageTrees[step.id];
        StorageService.set("testStepMessageTrees", angular.toJson(TestExecutionService.testStepMessageTrees));
      }
    };

    TestExecutionService.updateTestStepValidationReport = function (testStep) {
      StorageService.set("testStepValidationResults", angular.toJson(TestExecutionService.testStepValidationResults));
      StorageService.set("testStepComments", angular.toJson(TestExecutionService.testStepComments));
      var result = TestExecutionService.getTestStepValidationResult(testStep);
      result = result != undefined ? result : null;
      var comments = TestExecutionService.getTestStepComments(testStep);
      comments = comments != undefined ? comments : null;
      var report = TestExecutionService.getTestStepValidationReport(testStep);
      var xmlMessageOrManualValidation = report != null ? report.xml : null;
      return ReportService.updateTestStepValidationReport(xmlMessageOrManualValidation, testStep.id, result, comments);
    };

//        TestExecutionService.updateTestStepValidationReport = function (testStep) {
//            StorageService.set("testStepValidationResults", angular.toJson(TestExecutionService.testStepValidationResults));
//            StorageService.set("testStepComments", angular.toJson(TestExecutionService.testStepComments));
//            var result = TestExecutionService.getTestStepValidationResult(testStep);
//            result = result != undefined ? result : null;
//            var comments = TestExecutionService.getTestStepComments(testStep);
//            comments = comments != undefined ? comments : null;
//            return ReportService.updateTestStepValidationReport(testStep, result, comments);
//        };
//


    return TestExecutionService;
  }]);


angular.module('format').factory('TestExecutionClock', function ($interval, Clock) {
  return new Clock(1000);
});


angular.module('format').factory('ServiceDelegator', function (HL7V2MessageValidator, EDIMessageValidator, XMLMessageValidator, HL7V2MessageParser, EDIMessageParser, XMLMessageParser, HL7V2CursorService, HL7V2EditorService, HL7V2TreeService, EDICursorService, EDIEditorService, EDITreeService, XMLCursorService, XMLEditorService, XMLTreeService, DefaultMessageValidator, DefaultMessageParser, DefaultCursorService, DefaultEditorService, DefaultTreeService, XMLCursor, EDICursor, HL7V2Cursor, DefaultCursor, XMLEditor, EDIEditor, HL7V2Editor, DefaultEditor) {
  return {
    getMessageValidator: function (format) {
      if (format === 'hl7v2') {
        return HL7V2MessageValidator;
      } else if (format === 'xml') {
        return XMLMessageValidator;
      } else if (format === 'edi') {
        return EDIMessageValidator;
      }
      return DefaultMessageValidator;
    },
    getMessageParser: function (format) {
      if (format === 'hl7v2') {
        return HL7V2MessageParser;
      } else if (format === 'xml') {
        return XMLMessageParser;
      } else if (format === 'edi') {
        return EDIMessageParser;
      }
      return DefaultMessageParser;
    },
    getMode: function (format) {
      if (format === 'hl7v2') {
        return "hl7v2";
      } else if (format === 'xml') {
        return "xml";
      } else if (format === 'edi') {
        return "edi";
      }
      return "default";
    },
    updateEditorMode: function (editor, delimeters, format) {
      if (editor && editor != null) {
        var mode = this.getMode(format);
        editor.setOption("mode", {
          name: mode,
          separators: delimeters
        });
        editor.setOption("theme", format !== 'xml' ? "elegant" : "default");
      }
    },
    getCursorService: function (format) {
      if (format === 'hl7v2') {
        return HL7V2CursorService;
      } else if (format === 'xml') {
        return XMLCursorService;
      } else if (format === 'edi') {
        return EDICursorService;
      }
      return DefaultCursorService;
    },
    getEditorService: function (format) {
      if (format === 'hl7v2') {
        return HL7V2EditorService;
      } else if (format === 'xml') {
        return XMLEditorService;
      } else if (format === 'edi') {
        return EDIEditorService;
      }
      return DefaultEditorService;
    },
    getTreeService: function (format) {
      if (format === 'hl7v2') {
        return HL7V2TreeService;
      } else if (format === 'xml') {
        return XMLTreeService;
      } else if (format === 'edi') {
        return EDITreeService;
      }
      return DefaultTreeService;
    },
    getCursor: function (format) {
      if (format === 'hl7v2') {
        return HL7V2Cursor;
      } else if (format === 'xml') {
        return XMLCursor;
      } else if (format === 'edi') {
        return EDICursor;
      }
      return DefaultCursor;
    },
    getEditor: function (format) {
      if (format === 'hl7v2') {
        return HL7V2Editor;
      } else if (format === 'xml') {
        return XMLEditor;
      } else if (format === 'edi') {
        return EDIEditor;
      }
      return DefaultEditor;
    }
  }
});

angular.module('format').factory('IdleService',
  function ($http) {
    var IdleService = {
      keepAlive: function () {
        return $http.get(
          'api/session/keepAlive');
      }
    };
    return IdleService;
  });


angular.module('format').factory('FileUpload', function ($filter, $q, Upload, Notification) {
  var FileUpload = function () {

  };

  FileUpload.uploadMessage = function (file, errFiles) {
    var delay = $q.defer();
    if (errFiles && errFiles[0]) {
      var errFile = errFiles[0];
      var errorMsg = null;
      if (errFile.$error === 'pattern') {
        errorMsg = "Unsupported content type. Supported content types are : '" + errFile.$errorParam + "'";
      }
      if (errFile.$error === 'maxSize') {
        errorMsg = "File is too big. Maximum accepted size is : '" + errFile.$errorParam + "'";
      }
      delay.reject({"data": errorMsg});
    } else if (file) {
      file.upload = Upload.upload({
        url: 'api/message/upload',
        data: {file: file}
      });
      file.upload.then(function (response) {
        delay.resolve(response);
      }, function (response) {
        delay.reject(response);
      });
    }
    return delay.promise;
  };
  return FileUpload;

});
