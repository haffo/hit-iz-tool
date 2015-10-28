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
                return  angular.fromJson({line: -1, startIndex: -1, endIndex: -1, index: -1, triggerTree: {}});
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

    MessageValidatorClass.prototype.validate = function (testContextId, content, nav, contextType,dqaCodes, facilityId) {
        var delay = $q.defer();
        if (this.format && this.format != null) {
            $http.post('api/' + this.format + '/testcontext/' + testContextId + '/validateMessage', angular.fromJson({"content": content, "contextType": contextType,"dqaCodes": dqaCodes, "facilityId": facilityId, "nav":nav})).then(
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

//
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





angular.module('format').factory('ReportServiceClass', function ($http, $q, $filter) {
    this.format = null;
    var ReportServiceClass = function (format) {
        this.content = {
            metaData: {},
            result: {}
        };
        this.format = format;
    };

    ReportServiceClass.prototype.download = function (url, json) {
        var form = document.createElement("form");
        form.action = url;
        form.method = "POST";
        form.target = "_target";
        var input = document.createElement("textarea");
        input.name = "json";
        input.value = json;
        form.appendChild(input);
        form.style.display = 'none';
        document.body.appendChild(form);
        form.submit();
    };


    ReportServiceClass.prototype.generate = function (url, json) {
        var delay = $q.defer();
        $http({
            url: url,
            data: $.param({'json': json}),
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

    ReportServiceClass.prototype.generateByFormat = function (json, format) {
        if (this.format && this.format != null) {
            return this.generate("api/" + this.format + "/report/generateAs/" + format, json);
        } else {
            var delay = $q.defer();
            $timeout(function () {
                delay.reject("Unsupported format specified");
            }, 100);
            return delay.promise;
        }
    };

    ReportServiceClass.prototype.downloadAs = function (json, format) {
        if (this.format && this.format != null) {
            return this.download("api/" + this.format + "/report/downloadAs/" + format, json);
        }
        return;
    };

    return ReportServiceClass;
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


angular.module('format').factory('Report', function ($http, $q) {
    var Report = function () {
        this.html = null;
    };
    Report.prototype.generate = function (url, xmlReport) {
        var delay = $q.defer();
        $http({
            url: url,
            data: $.param({'xmlReport': xmlReport}),
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

    Report.prototype.download = function (url, xmlReport) {
        var form = document.createElement("form");
        form.action = url;
        form.method = "POST";
        form.target = "_target";
        var input = document.createElement("textarea");
        input.name = "xmlReport";
        input.value = xmlReport;
        form.appendChild(input);
        form.style.display = 'none';
        document.body.appendChild(form);
        form.submit();
    };

    return Report;
});



angular.module('format').factory('TestCaseService', function ($filter) {
    var TestCaseService = function () {

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

        if(!node['nav']) node['nav'] = {};

        var that = this;
        if (node.testCases) {
            if (!node["children"]) {
                node["children"] = node.testCases;
                angular.forEach(node.children, function (testCase) {
                    testCase['nav'] = {};
                    testCase['nav']['testStep'] = null;
                    testCase['nav'] = {};
                    testCase['nav']['testCase'] = testCase.name;
                    testCase['nav']['testPlan'] = node.type === 'TestPlan' ? node.name : node['nav'].testPlan;
                    testCase['nav']['testGroup'] = node.type === 'TestCaseGroup' ? node.name : node['nav'].testGroup;
                    that.buildTree(testCase );
                });
            } else {
                angular.forEach(node.testCases, function (testCase) {
                    node["children"].push(testCase);
                    testCase['nav'] = {};
                    testCase['nav']['testStep'] = null;
                    testCase['nav']['testCase'] = testCase.name;
                    testCase['nav']['testPlan'] = node.type === 'TestPlan' ? node.name : node['nav'].testPlan;
                    testCase['nav']['testGroup'] = node.type === 'TestCaseGroup' ? node.name : node['nav'].testGroup;
                    that.buildTree(testCase );
                });
            }
            node["children"] = $filter('orderBy')(node["children"], 'position');
            delete node.testCases;
        }

        if (node.testCaseGroups) {
            if (!node["children"]) {
                node["children"] = node.testCaseGroups;
                angular.forEach(node.children, function (testCaseGroup) {
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
                    testStep['nav']['testStep'] = testStep.position + "." + testStep.name;
                    testStep['nav']['testPlan'] = node['nav'].testPlan;
                    testStep['nav']['testGroup'] = node['nav'].testGroup;
                    that.buildTree(testStep);
                });
            } else {
                angular.forEach(node.testSteps, function (testStep) {
                    node["children"].push(testStep);
                    testStep['nav'] = {};
                    testStep['nav']['testCase'] = node.name;
                    testStep['nav']['testStep'] = testStep.position + "." + testStep.name;
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
        obj.label = !obj.children ? obj.position + "." + obj.name: obj.name;
        obj['nav'] = {};
        obj['nav']['testStep'] = obj.label;
        obj['nav']['testCase'] = null;
        obj['nav']['testPlan'] =null;
        obj['nav']['testGroup'] =null;

        if (obj.children) {
            var that = this;
            obj.children = $filter('orderBy')(obj.children, 'position');
            angular.forEach(obj.children, function (child) {
                child['nav'] = {};
                child['nav']['testStep'] = child.label;
                child['nav']['testCase'] = obj.label;
                child['nav']['testPlan'] = obj['nav'].testPlan;
                child['nav']['testGroup'] =null;
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
                var found = this.findNode(tree, children[i],  id, type);
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
            data: $.param({'jsonReport': this.content }),
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


angular.module('format').factory('Clock', function ($interval) {
    var Clock = function (intervl) {
        this.value = undefined;
        this.intervl = intervl;
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
        return  this.content;
    };
    ValidationResult.prototype.setContent = function (value) {
        this.content = value;
    };

    return ValidationResult;
});





angular.module('format').factory('ServiceDelegator', function (HL7V2MessageValidator, EDIMessageValidator, XMLMessageValidator, HL7V2MessageParser, EDIMessageParser, XMLMessageParser, HL7V2CursorService, HL7V2EditorService, HL7V2TreeService, EDICursorService, EDIEditorService, EDITreeService, XMLCursorService, XMLEditorService, XMLTreeService, DefaultMessageValidator, DefaultMessageParser, DefaultCursorService, DefaultEditorService, DefaultTreeService, HL7V2ReportService, EDIReportService, XMLReportService, DefaultReportService,XMLCursor,EDICursor,HL7V2Cursor,DefaultCursor,  XMLEditor,EDIEditor,HL7V2Editor,DefaultEditor) {
    return {
        getMessageValidator: function (format) {
            if (format === 'hl7v2') {
                return  HL7V2MessageValidator;
            } else if (format === 'xml') {
                return  XMLMessageValidator;
            } else if (format === 'edi') {
                return  EDIMessageValidator;
            }
            return  DefaultMessageValidator;
        },
        getMessageParser: function (format) {
            if (format === 'hl7v2') {
                return  HL7V2MessageParser;
            } else if (format === 'xml') {
                return  XMLMessageParser;
            } else if (format === 'edi') {
                return  EDIMessageParser;
            }
            return  DefaultMessageParser;
        },
        getMode: function (format) {
            if (format === 'hl7v2') {
                return  "hl7v2";
            } else if (format === 'xml') {
                return  "xml";
            } else if (format === 'edi') {
                return  "edi";
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
                editor.setOption("theme", format !== 'xml' ? "elegant": "default");
            }
        },
        getCursorService: function (format) {
            if (format === 'hl7v2') {
                return  HL7V2CursorService;
            } else if (format === 'xml') {
                return  XMLCursorService;
            } else if (format === 'edi') {
                return  EDICursorService;
            }
            return DefaultCursorService;
        },
        getEditorService: function (format) {
            if (format === 'hl7v2') {
                return  HL7V2EditorService;
            } else if (format === 'xml') {
                return  XMLEditorService;
            } else if (format === 'edi') {
                return  EDIEditorService;
            }
            return DefaultEditorService;
        },
        getTreeService: function (format) {
            if (format === 'hl7v2') {
                return  HL7V2TreeService;
            } else if (format === 'xml') {
                return  XMLTreeService;
            } else if (format === 'edi') {
                return  EDITreeService;
            }
            return DefaultTreeService;
        },
        getReportService: function (format) {
            if (format === 'hl7v2') {
                return  HL7V2ReportService;
            } else if (format === 'xml') {
                return  XMLReportService;
            } else if (format === 'edi') {
                return  EDIReportService;
            }
            return DefaultReportService;
        },
        getCursor: function (format) {
            if (format === 'hl7v2') {
                return  HL7V2Cursor;
            } else if (format === 'xml') {
                return  XMLCursor;
            } else if (format === 'edi') {
                return  EDICursor;
            }
            return DefaultCursor;
        },
        getEditor: function (format) {
            if (format === 'hl7v2') {
                return  HL7V2Editor;
            } else if (format === 'xml') {
                return  XMLEditor;
            } else if (format === 'edi') {
                return  EDIEditor;
            }
            return DefaultEditor;
        }
    }
});




