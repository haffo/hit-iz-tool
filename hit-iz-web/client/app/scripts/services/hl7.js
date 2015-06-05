'use strict';

angular.module('hl7').factory('HL7',
    ['$rootScope', '$http', '$q', function ($rootScope, $http, $q) {
        var services = {
            Report: {
                generate: function (url, xmlReport) {
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
                },

                download: function (url, xmlReport) {
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
                }
            },
            Message: {
                parse: function (url, er7Message) {
                    var delay = $q.defer();
                    var data = angular.fromJson({"er7Message": er7Message});
                    $http.post(url, data, {timeout: 60000}).then(
                        function (object) {
                            delay.resolve(angular.fromJson(object.data));
                        },
                        function (response) {
                            delay.reject(response.data);
                        }
                    );
                    return delay.promise;
                },
                get: function (url) {
                    var delay = $q.defer();
                    $http.get(url, {timeout: 60000}).then(
                        function (response) {
                            delay.resolve(angular.fromJson(response.data));
                        },
                        function (response) {
                            delay.reject(response.data);
                        }
                    );
                    return delay.promise;
                },
                validate: function (url, er7Message) {
                    var delay = $q.defer();
                    var data = angular.fromJson({"er7Message": er7Message});
                    $http.post(url, data, {timeout: 60000}).then(
                        function (object) {
                            delay.resolve(angular.fromJson(object.data));
                        },
                        function (response) {
                            delay.reject(response.data);
                        }
                    );
                    return delay.promise;
                },

                download: function (er7Message) {
                    var form = document.createElement("form");
                    form.action = "api/hl7/message/download";
                    form.method = "POST";
                    form.target = "_target";
                    var input = document.createElement("textarea");
                    input.name = "er7Message";
                    input.value = er7Message;
                    form.appendChild(input);
                    form.style.display = 'none';
                    document.body.appendChild(form);
                    form.submit();
                }
            },
            Profile: {
                get: function (url) {
                    var delay = $q.defer();
                    $http.get(url, {timeout: 60000}).then(
                        function (response) {
                            delay.resolve(angular.fromJson(response.data));
                        },
                        function (response) {
                            delay.reject(response.data);
                        }
                    );
                    return delay.promise;
                },
                parse: function (url) {
                    var delay = $q.defer();
                    $http.get(url, {timeout: 60000}).then(
                        function (object) {
                            delay.resolve(angular.fromJson(object.data));
                        },
                        function (response) {
                            delay.reject(response.data);
                        }
                    );
                    return delay.promise;
                }
            },
            MessageListLoader: {
                get: function (url) {
                    var delay = $q.defer();
                    $http.get(url, {timeout: 60000}).then(
                        function (response) {
                            delay.resolve(angular.fromJson(response.data));
                        },
                        function (response) {
                            delay.reject(response.data);
                        }
                    );
                    return delay.promise;
                }
            },


            ValidationResultItem: function () {
                return {
                    data: [],
                    updateIndicator: '0',
                    show: true,
                    setData: function (data) {
                        this.data = data;
                        this.notify();
                    },
                    notify: function () {
                        this.updateIndicator = new Date().getTime();
                    }
                }
            },

            ValidationResult: function (key) {
                return{
                    key: key,
                    xml: '',
                    errors: services.ValidationResultItem(),
                    affirmatives: services.ValidationResultItem(),
                    ignores: services.ValidationResultItem(),
                    alerts: services.ValidationResultItem(),
                    warnings: services.ValidationResultItem(),
                    saveState: function () {
                        sessionStorage.setItem(this.key, this.content);
                    },

                    restoreState: function () {
                        this.content = sessionStorage.getItem(this.key);
                    },
                    hasState: function () {
                        return sessionStorage.getItem(this.key) !== {xml: ''} && sessionStorage.getItem(this.key) != null;
                    },
                    getState: function () {
                        return sessionStorage.getItem(this.key);
                    },
                    getContent: function () {
                        return  this.content;
                    },
                    setContent: function (value) {
                        this.content = value;
                    }
                }
            },
            CurrentMessage: function (key) {
                return{
                    key: key,
                    updateIndicator: '0',
                    data: {id: -1, content: '', name: ''},
                    clear: function () {
                        this.setId(-1);
                        this.setContent('');
                        this.setName('');
                        sessionStorage.setItem(this.key, null);
                    },
                    storeMessage: function () {
                        sessionStorage.setItem(this.key, this.data.content);
                    },
                    getStoredMessage: function () {
                        return sessionStorage.getItem(this.key);
                    },
                    getId: function () {
                        return  this.data.id;
                    },
                    setId: function (id) {
                        this.data.id = id;
                    },
                    getContent: function () {
                        return  this.data.content;
                    },
                    setContent: function (content) {
                        this.data.content = content;
                        this.storeMessage();
                        this.notifyChange();
                    },
                    setName: function (name) {
                        this.data.name = name;
                    },
                    setData: function (id, content, name) {
                        this.data.id = id;
                        this.setContent(content);
                        this.Name(name);
                    },
                    getData: function () {
                        return this.data;
                    },
                    notifyChange: function () {
                        this.updateIndicator = new Date().getTime();
                    }
                }
            },


            Editor: function () {
                return {
                    updateIndicator: '0',
                    editor: null,
                    notifyChange: function () {
                        this.updateIndicator = new Date().getTime();
                    }
                }
            },
            ExampleMessages: function (key) {
                return {
                    key: key,
                    data: null,
                    updateIndicator: '0',
                    clear: function () {
                        sessionStorage.setItem(this.key, null);
                    },
                    saveState: function () {
                        sessionStorage.setItem(this.key, angular.toJson(this.data));
                    },
                    restoreState: function () {
                        this.data = this.getState();
                    },
                    restoreContentState: function () {
                        this.data = this.getState();
                        this.notifyChange();
                    },
                    hasState: function () {
                        return sessionStorage.getItem(this.key) != null;
                    },
                    getState: function () {
                        return angular.fromJson(sessionStorage.getItem(this.key));
                    },
                    setData: function (data) {
                        this.data = data;
                        this.notifyChange();
                        this.saveState();
                    },
                    getData: function () {
                        return this.data;
                    },
                    notifyChange: function () {
                        this.updateIndicator = new Date().getTime();
                    }
                }
            },

            Cursor: function () {
                return {
                    line: 1, startIndex: -1, endIndex: -1, index: -1, segment: "", triggerTree: undefined
                }
            },


            TestCase: {
                get: function (url) {
                    var delay = $q.defer();
                    $http.get(url, {timeout: 60000}).then(
                        function (response) {
                            delay.resolve(angular.fromJson(response.data));
                        },
                        function (response) {
                            delay.reject(response.data);
                        }
                    );
                    return delay.promise;
                },

                new: function (key) {
                    return {
                        key: key,
                        id: -1,
                        saveState: function () {
                            sessionStorage.setItem(this.key, this.id);
                        },

                        restoreState: function () {
                            this.id = sessionStorage.getItem(this.key);
                        },
                        hasState: function () {
                            return sessionStorage.getItem(this.key) != null && sessionStorage.getItem(this.key) != '' && parseInt(sessionStorage.getItem(this.key)) != -1;
                        },
                        getState: function () {
                            return sessionStorage.getItem(this.key);
                        },
                        getId: function () {
                            return  this.id;
                        },
                        setId: function (value) {
                            this.id = value;
                        },
                        get: function (url) {
                            var delay = $q.defer();
                            $http.get(url, {timeout: 60000}).then(
                                function (response) {
                                    delay.resolve(angular.fromJson(response.data));
                                },
                                function (response) {
                                    delay.reject(response.data);
                                }
                            );
                            return delay.promise;
                        }
                    }
                }
            }
        }
        return services;
    }]);


angular.module('hl7').factory('HL7NodeFinder',
    ['$rootScope', '$http', '$q', 'HL7TreeUtils', function ($rootScope, $http, $q, HL7TreeUtils) {
        return  {

        }
    }]);


angular.module('hl7').factory('HL7CursorUtils',
    ['$rootScope', '$http', '$q', 'HL7EditorUtils', function ($rootScope, $http, $q, HL7EditorUtils) {
        return  {
            /**
             *
             * @param active
             * @param editor
             * @param cursorObject
             */
            getCoordinate: function (editor) {
                try {
                    if (editor != null) {
                        var separators = HL7EditorUtils.getSeparators();
                        var cursor = editor.doc.getCursor(true);
                        var cursorPosition = cursor.ch;
                        var segment = editor.doc.getLine(cursor.line);
                        var characters = segment.toString().split('');
                        var startIndex = cursorPosition - 1;
                        var endIndex = cursorPosition;
                        if (separators.length == 0) {
                            return;
                        }
                        // get the beginning of the element
                        while (startIndex > 0) {
                            if ($.inArray(characters[startIndex], separators) !== -1) {
                                break;
                            } else {
                                startIndex--;
                            }
                        }

                        // get the end of the element
                        while (endIndex < characters.length) {
                            if ($.inArray(characters[endIndex], separators) !== -1) {
                                break;
                            } else {
                                endIndex++;
                            }
                        }
                        return this.createCoordinate( cursor.line + 1, startIndex + 1,endIndex,cursorPosition);
                    }
                } catch (e) {

                }
            },

            /**
             *
             * @param line
             * @param startIndex
             * @param endIndex
             * @returns {*|Object|Array|string|number|Object|Array|Date|string|number}
             */
            createCoordinate: function (line, startIndex, endIndex, index, triggerTree) {
                try {
                    return  angular.fromJson({line: line, startIndex: startIndex, endIndex: endIndex, index:index,triggerTree:triggerTree});
                } catch (e) {

                }
            },

            /**
             *
             * @param index
             * @param container
             * @returns {number}
             */
            getStartIndex: function (index, container) {
                if (index >= 0) {
                    var i = 0;
                    var start = 0;
                    var value = null;
                    while (i <= index) {
                        value = container[i];
                        if ("" === value) {
                            start = start + 1;
                        } else {
                            start = start + value.length + 1;
                        }
                        i++;
                    }
                    return start;
                }
                return 0;
            }

        }
    }]);


angular.module('hl7').factory('HL7EditorUtils',
    ['$rootScope', '$http', '$q', function ($rootScope, $http, $q) {
        return  {
            /**
             *
             * @param tree
             * @param cursor
             * @returns {string[]}
             */
            getSeparators: function () {
                return [ '|', '^', '&', '~' ];
            },

            /**
             *
             * @param tree
             * @param cursor
             */
            getSeparatorsMap: function (tree, cursor) {
                var separators = this.getSeparators();
                var separatorsMap = new Array(4);
                separatorsMap['field_separator'] = separators[0];
                separatorsMap['component_separator'] = separators[1];
                separatorsMap['subcomponent_separator'] = separators[2];
                separatorsMap['continuation_separator'] = separators[3];
                return separatorsMap;
            },
            /**
             *
             * @param editorObject
             * @param cursorObject
             */
            select: function (editorObject, cursorObject) {
                var startIndex = cursorObject.startIndex;
                var endIndex = cursorObject.endIndex;
                var line = cursorObject.line;
                if (startIndex !== null && endIndex !== null && startIndex >= 0 && endIndex >= 0) {
                    var line = parseInt(line) - 1;
                    editorObject.doc.setSelection({
                        line: line,
                        ch: startIndex
                    }, {
                        line: line,
                        ch: endIndex
                    });

                    editorObject.scrollIntoView({
                        line: line,
                        ch: startIndex
                    }, {
                        line: line,
                        ch: endIndex
                    });
                }
            },
            isHL7: function (message) {
                return message.startsWith("MSH");
            }
        }
    }]);


angular.module('hl7').factory('HL7Utils', function () {

    return  {

        getPosition: function (path, type) {
            try {
                switch (type) {
                    case "SEGMENT":
                    {
                        return  1;
                    }
                    case "FIELD":
                    {
                        // MSH[1].7[1]
                        return path.split("-")[1].split(".")[0];
                    }
                    case "COMPONENT":
                    {
                        // MSH[1].7[1].3[1]
                        return path.split(".")[1];
                    }
                    case "SUB_COMPONENT":
                    {
                        // MSH[1].7[1].3[1].4[1]
                        return path.split(".")[2];
                    }
                }
            }catch(e){
                return 0;
            }
        },


        getInstanceNumber: function (path, type) {
            try {
                switch (type) {
                        case "SEGMENT":
                        {
                            // MSH[1]
                            return path.split("[")[1].split("]")[0];
                        }
                        case "FIELD":
                        {
                            // MSH[1].7[1]
                            return path.split("-")[1].split("[")[1].split("]")[0];
                        }
                        case "COMPONENT":
                        {
                            // MSH[1].7[1].3[1]
                            return path.split("-")[2].split("[")[1].split("]")[0];
                        }
                        case "SUB_COMPONENT":
                        {
                            // MSH[1].7[1].3[1].4[1]
                            return path.split("-")[3].split("[")[1].split("]")[0];
                        }
                }
            }catch(e){
                return 1;
            }
        },

        getType: function (path) {
            if(path.indexOf("-") > 0){
                if (path.split(".").length === 1) {
                    return "FIELD";
                } else if (path.split(".").length === 2) {
                    return "COMPONENT";
                } else if (path.split(".").length === 3) {
                    return "SUB_COMPONENT";
                }
            }else{
                return "SEGMENT";
            }
            throw new Error("Invalid Path " + path);
        },

        prettyPath: function (path) {
            return path.replace(/\[[^\]]*?\]/g, '');
         }


    }

});

//
//angular.module('hl7').factory('ValidationBinder',
//    [ 'HL7TreeUtils', function (HL7TreeUtils) {
//        return  {
//            tree: null,
//            editor: null,
//            result: null,
//            init: function (tree, editor, result) {
//                this.tree = tree;
//                this.editor = editor;
//                this.result = result;
//                var firstNode = tree.get_first_branch();
//                var children = tree.get_siblings(firstNode);
//                if (children && children.length > 0) {
//                    for (var i = 0; i < children.length; i++) {
//                        this.initNode(children[i]);
//                    }
//                }
//            },
//            initNode: function (node) {
//                this.setEndIndex(node);
//                this.setValidationResults(node);
//                var children = this.tree.get_children(node);
//                if (children && children.length > 0) {
//                    for (var i = 0; i < children.length; i++) {
//                        this.initNode(children[i]);
//                    }
//                }
//            },
//
//            setEndIndex: function (node) {
//                var endIndex = HL7TreeUtils.getEndIndex(node, this.editor.doc.getValue());
//                node.data.endIndex = endIndex;
//            },
//
//
//            setValidationResults: function (node) {
//                node["validation"] = [];
//                node.validation["errors"] = [];
//                node.validation["alerts"] = [];
//                node.validation["informationals"] = [];
//
//                if (this.result.errors.data && this.result.errors.data.length > 0) {
//                    for (var i = 0; i < this.result.errors.data.length; i++) {
//                        var error = this.result.errors.data[i];
//                        if (error.path === node.data.path) {
//                            node.validation.errors.push(error);
//                        }
//                    }
//                }
//                if (this.result.alerts.data && this.result.alerts.data.length > 0) {
//                    for (var i = 0; i < this.result.alerts.data.length; i++) {
//                        var error = this.result.alerts.data[i];
//                        if (error.path === node.data.path) {
//                            node.validation.alerts.push(error);
//                        }
//                    }
//
//                }
//
//                if (this.result.informationals.data && this.result.informationals.data.length > 0) {
//                    for (var i = 0; i < this.result.informationals.data.length; i++) {
//                        var error = this.result.informationals.data[i];
//                        if (error.path === node.data.path) {
//                            node.validation.informationals.push(error);
//                        }
//                    }
//                }
//            },
//
//            clear: function () {
//                this.tree = null;
//                this.editor = null;
//                this.result = null;
//            }
//        }
//    }]);

angular.module('hl7').factory('HL7TreeUtils',
    ['$rootScope', '$http', '$q', 'HL7CursorUtils', 'HL7Utils', function ($rootScope, $http, $q, HL7CursorUtils, HL7Utils) {
        return  {


            /**
             *
             * @param tree
             * @param cursorObject
             * @returns {*}
             */
            findByIndex: function (tree, cursorObject, message) {
                var segmentNode = this.findNodeByLineNumber(tree, cursorObject.line);
                if (segmentNode == undefined || segmentNode == null) return null;
                return this.findNodeByIndex(tree, segmentNode, cursorObject.line, cursorObject.startIndex + 1, cursorObject.endIndex + 1, message);
            },

            /**
             *
             * @param tree
             * @param line
             * @param path
             * @returns {*}
             */
            findByPath: function (tree, line, path) {
                var segmentNode = this.findNodeByLineNumber(tree, line);
                if (segmentNode == undefined || segmentNode == null) return null;
                return this.findNodeByPath(tree, segmentNode, line, path);
            },

            /**
             *
             * @param tree
             * @param node
             * @param lineNumber
             * @param startIndex
             * @param endIndex
             * @returns {*}
             */
            findNodeByPath: function (tree, node, lineNumber, path) {
                if (path.startsWith(node.data.path)) {
                    if (angular.equals(node.data.path , path)) {
                        return this.findLastChild(tree, node);
                    }
                    var children = tree.get_children(node);
                    if (children && children.length > 0) {
                        for (var i = 0; i < children.length; i++) {
                            var found = this.findNodeByPath(tree, children[i], lineNumber, path);
                            if (found != null) {
                                return found;
                            }
                        }
                    }
                }
                return null;
            },

            findLastChild: function (tree, node) {
                var children = tree.get_children(node);
                if (children && children.length > 0) {
                    for (var i = 0; i < children.length; i++) {
                        return this.findLastChild(tree, children[i]);
                    }
                } else {
                    return node;
                }
            },


            /**
             *
             * @param tree
             * @param node
             * @param lineNumber
             * @param startIndex
             * @param endIndex
             * @returns {*}
             */
            findNodeByIndex: function (tree, node, lineNumber, startIndex, endIndex, message) {
                if (node.data.lineNumber <= lineNumber) {
                    var endInd = this.getEndIndex(node, message);
                    if (angular.equals(node.data.startIndex,startIndex) && angular.equals(endInd,endIndex)) {
                        return this.findLastChild(tree,node);
                    }
                    var children = tree.get_children(node);
                    if (children && children.length > 0) {
                        for (var i = 0; i < children.length; i++) {
                            var found = this.findNodeByIndex(tree, children[i], lineNumber, startIndex, endIndex, message);
                            if (found != null) {
                                return found;
                            }
                        }
                    }
                }
                return null;
            },

            /**
             *
             * @param tree
             * @param lineNumber
             * @returns {*}
             */
            findNodeByLineNumber: function (tree, lineNumber) {
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
            },

            /**
             *
             * @param treeObject
             * @param cursorObject
             */
            selectNodeByIndex: function (treeObject, cursorObject, message) {
                var found = this.findByIndex(treeObject, cursorObject, message);
                if (found !== null) {
                    var selectedNode = treeObject.get_selected_branch();
                    if (selectedNode !== found) {
                        treeObject.collapse_all();
                        treeObject.select_branch(found);
                        treeObject.expand_branch(found);
                    }
                }
            },
            selectNodeByPath: function (treeObject, lineNumber, path) {
                var found = this.findByPath(treeObject, lineNumber, path);
                if (found !== null) {
                    var selectedNode = treeObject.get_selected_branch();
                    if (selectedNode !== found) {
                        treeObject.collapse_all();
                        treeObject.select_branch(found);
                        treeObject.expand_branch(found);
                    }
                }
            },

            /**
             *
             * @param type
             * @param path
             * @param segment
             * @returns {*}
             */
            getStringValue: function (type, path, segment) {
                     var position = HL7Utils.getPosition(path, type);
                    var instanceNumber = HL7Utils.getInstanceNumber(path, type);
                    switch (type) {
                        case "SEGMENT":
                        {
                            return segment.replace("\r", "");
                        }
                        case "FIELD":
                        {
                            if (segment.startsWith("MSH") && position == 1) return "";
                            var index = segment.startsWith("MSH") ? position - 2 : position - 1;
                            var container = segment.substring(4).split("|");
                            return (instanceNumber > 1 ? container[index].split("~")[instanceNumber - 1] : container[index]).replace("\r", "");
                        }
                        case "COMPONENT":
                        {
                            var container = this.getStringValue("FIELD", path, segment);
                            return (instanceNumber > 1 ? container.split("^")[position - 1].split("~")[instanceNumber - 1] : container.split("^")[position - 1]).replace("\r", "");
                        }

                        case "SUB_COMPONENT":
                        {
                            var container = this.getStringValue("COMPONENT", path, segment);
                            var children = container.split("&");
                            return  (instanceNumber > 1 ? children[position - 1].split("~")[instanceNumber - 1] : children[position - 1]).replace("\r", "");
                        }
                    }
            },

            getEndIndex: function (node, message) {
                try {
                    var data = node.data;
                    if (data.endIndex != undefined && data.endIndex != -1) {
                        return data.endIndex;
                    }

                    return this.getEndColumn(data.lineNumber, data.startIndex, data.type, data.path,message);
//                    var segments = message.toString().split('\n').length == 1 ? message.toString().split("\r") : message.toString().split('\n');
//                    return data.lineNumber - 1 < segments.length ? segments[data.lineNumber - 1] != null && !angular.equals("", segments[data.lineNumber - 1].toString().trim()) ? data.startIndex + this.getStringValue(data.type, data.path, segments[data.lineNumber - 1]).length : -1 : -1;
//
                }catch(error){
                     return -1;
                }
            },
            getEndColumn: function (line, column, type,path, message) {
                try {
                    var segments = message.toString().split('\n').length == 1 ? message.toString().split("\r") : message.toString().split('\n');
                    return line - 1 < segments.length ? segments[line - 1] != null && !angular.equals("", segments[line - 1].toString().trim()) ? column + this.getStringValue(type, path, segments[line - 1]).length : -1 : -1;
                }catch(error){
                    return -1;
                }
            }

        }
    }]);





