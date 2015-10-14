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


//        /**
//         *
//         * @param tree
//         * @param cursorObject
//         * @returns {*}
//         */
//        TreeService.prototype.findByIndex = function (tree, cursorObject, message) {
//            return null;
//        };
//
//        /**
//         *
//         * @param tree
//         * @param line
//         * @param path
//         * @returns {*}
//         */
//        TreeService.prototype.findByPath = function (tree, line, path) {
//            return null;
//        };
//
//        /**
//         *
//         * @param tree
//         * @param node
//         * @param lineNumber
//         * @param startIndex
//         * @param endIndex
//         * @returns {*}
//         */
//        TreeService.prototype.findNodeByPath = function (tree, node, lineNumber, path) {
//            return null;
//        };
//
//        /**
//         *
//         * @param tree
//         * @param node
//         * @param lineNumber
//         * @param startIndex
//         * @param endIndex
//         * @returns {*}
//         */
//        TreeService.prototype.findNodeByIndex = function (tree, node, lineNumber, startIndex, endIndex, message) {
//            return null;
//        };
//
//

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

    MessageValidatorClass.prototype.validate = function (testContextId, content, name, contextType,dqaCodes, facilityId) {
        var delay = $q.defer();
        if (this.format && this.format != null) {
            $http.post('api/' + this.format + '/testcontext/' + testContextId + '/validateMessage', angular.fromJson({"content": content, "contextType": contextType,"dqaCodes": dqaCodes, "facilityId": facilityId})).then(
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
        } else {
            $timeout(function () {
                delay.reject("Unsupported format specified");
            }, 100);
        }

        return delay.promise;
    };

    return MessageParserClass;
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

    ReportServiceClass.prototype.downloadAs = function (json, targetFormat) {
        if (this.format && this.format != null) {
            return this.download("api/" + this.format + "/report/downloadAs/" + targetFormat, json);
        }
        return;
    };

    return ReportServiceClass;
});


angular.module('format').factory('ServiceDelegator', function (EDIMessageValidator, HL7V2MessageValidator,XMLMessageValidator, HL7V2MessageParser, EDIMessageParser, XMLMessageParser, HL7V2CursorService, HL7V2EditorService, HL7V2TreeService, EDICursorService, EDIEditorService, EDITreeService, XMLCursorService, XMLEditorService, XMLTreeService, DefaultMessageValidator, DefaultMessageParser, DefaultCursorService, DefaultEditorService, DefaultTreeService, HL7V2ReportService, EDIReportService, XMLReportService, DefaultReportService) {
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
                return  'hl7v2';
            } else if (format === 'xml') {
                return  "xml'";
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
            }
        },
        getCursorService: function (format) {
            if (format === 'hl7v2') {
                return  HL7V2CursorService;
            } else if (format === 'xml') {
                return  XMLEditorService;
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
        }
    }
});




