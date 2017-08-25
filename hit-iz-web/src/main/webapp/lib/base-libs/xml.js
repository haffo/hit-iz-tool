angular.module('xml', ['format']);

angular.module('xml').factory('XMLMessageFormatter', ['$http', '$q', function ($http, $q) {
    return function (xml) {
        var delay = $q.defer();
        var data = angular.fromJson({"content": xml});

//        $http.get('../../resources/soap/formatted.xml').then(
//            function (object) {
//                delay.resolve(object.data);
//            },
//            function (response) {
//                if (response.status === 404) {
//                    delay.reject('Cannot parse the content');
//                } else {
//                    delay.reject('Unable to parse the content');
//                }
//            }
//        );

        $http.post("api/xml/format", data, {timeout: 60000}).then(
            function (response) {
                delay.resolve(response.data.content);
            },
            function (response) {
                delay.reject(response.data);
            }
        );
        return delay.promise;
    };
}]);

angular.module('xml').factory('XMLTreeService',
    ['XMLCursorService', 'TreeService' , 'XMLNodeFinder', function (XMLCursorService, TreeService,XMLNodeFinder) {

        var XMLTreeServiceClass = function () {
            TreeService.call(this, arguments);
        };

        XMLTreeServiceClass.prototype = Object.create(TreeService.prototype);
        XMLTreeServiceClass.prototype.constructor = XMLTreeServiceClass;


        /**
         *
         * @param treeObject
         * @param cursorObject
         */
        XMLTreeServiceClass.prototype.selectNode = function (treeObject, cursorObject) {
            var found = this.find(treeObject, cursorObject);
            if (found !== null) {
                var selectedNode = treeObject.get_selected_branch();
                if (selectedNode !== found) {
                    treeObject.collapse_all();
                    treeObject.select_branch(found);
                    treeObject.expand_branch(found);
                    cursorObject.start = found.data.start;
                    cursorObject.end = found.data.end;
                }
            }
        };

        /**
         *
         * @param node
         * @returns {*|Object|Array|string|number|Object|Array|Date|string|number}
         */
        XMLTreeServiceClass.prototype.getCoordinate = function (node) {
            return XMLCursorService.createCoordinate(node.data.start, node.data.end);
        };

        /**
         *
         * @param node
         * @param cursorObject
         */
            XMLTreeServiceClass.prototype.setCoordinate = function (node, cursorObject) {
                try {
                    var coordinate = this.getCoordinate(node);
                    if (coordinate !== null) {
                        cursorObject.start = coordinate.start;
                        cursorObject.end = coordinate.end;
                        cursorObject.notify();
                    }
                } catch (e) {

                }
            };



        /**
         *
         * @param tree
         * @param cursorObject
         * @returns {*}
         */
        XMLTreeServiceClass.prototype.findByIndex = function (tree, cursorObject, message) {
            var firstNode = tree.get_first_branch();
            var children = tree.get_siblings(firstNode);
            if (children) {
                var node = children[0];
                if (node == null) return null;
                if( cursorObject.start)
                return XMLNodeFinder.findNodeByLineNumber(tree, node, cursorObject.start.line);
            }
            return null;
        };

        /**
         *
         * @param tree
         * @param line
         * @param path
         * @returns {*}
         */
        XMLTreeServiceClass.prototype.findByPath = function (tree, line) {
//            var parent = this.findNodeByLineNumber(tree, line);
//            if (parent == undefined || parent == null) return null;
//            return XMLNodeFinder.findNodeByLineNumber(tree, parent, line);
//
            if(typeof tree.get_first_branch  == 'function') {
                var firstNode = tree.get_first_branch();
                var children = tree.get_siblings(firstNode);
                if (children) {
                    var parent = children[0];
                    if (parent == null) return null;
                    return XMLNodeFinder.findNodeByLineNumber(tree, parent, line);
                }
            }
            return null;
        };

        /**
         *
         * @param tree
         * @param node
         * @param lineNumber
         * @param startIndex
         * @param endIndex
         * @returns {*}
         */
        XMLTreeServiceClass.prototype.findNodeByPath = function (tree, node, lineNumber) {
            return XMLNodeFinder.findNodeByLineNumber(tree, node, lineNumber);
         };


        /**
         *
         * @param tree
         * @param node
         * @param lineNumber
         * @param startIndex
         * @param endIndex
         * @returns {*}
         */
        XMLTreeServiceClass.prototype.findNodeByIndex = function (tree, node, lineNumber) {
            if (node.data.lineNumber <= lineNumber) {
//                var endInd = this.getEndIndex(node, message);
//                if (angular.equals(node.data.startIndex, startIndex) && angular.equals(endInd, endIndex)) {
//                    return this.findLastChild(tree, node);
//                }
                if (node.data.lineNumber == lineNumber) {
                    return node;
                }

                var children = tree.get_children(node);
                if (children && children.length > 0) {
                    for (var i = 0; i < children.length; i++) {
                        var found = XMLNodeFinder.findNodeByIndex(tree, children[i], lineNumber);
                        if (found != null) {
                            return found;
                        }
                    }
                }
            }
            return null;
        };


        XMLTreeServiceClass.prototype.selectNodeByPath = function (treeObject, lineNumber) {
            var found = this.findByPath(treeObject, lineNumber);
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

//        /**
//         *
//         * @param type
//         * @param path
//         * @param segment
//         * @returns {*}
//         */
//        HL7V2TreeServiceClass.prototype.getStringValue = function (type, path, segment) {
//            var position = HL7V2Service.getPosition(path, type);
//            var instanceNumber = HL7V2Service.getInstanceNumber(path, type);
//            switch (type) {
//                case "SEGMENT":
//                {
//                    return segment.replace("\r", "");
//                }
//                case "FIELD":
//                {
//                    if (segment.startsWith("MSH") && position == 1) return "";
//                    var index = segment.startsWith("MSH") ? position - 2 : position - 1;
//                    var container = segment.substring(4).split("|");
//                    return (instanceNumber > 1 ? container[index].split("~")[instanceNumber - 1] : container[index]).replace("\r", "");
//                }
//                case "COMPONENT":
//                {
//                    var container = this.getStringValue("FIELD", path, segment);
//                    return (instanceNumber > 1 ? container.split("^")[position - 1].split("~")[instanceNumber - 1] : container.split("^")[position - 1]).replace("\r", "");
//                }
//
//                case "SUB_COMPONENT":
//                {
//                    var container = this.getStringValue("COMPONENT", path, segment);
//                    var children = container.split("&");
//                    return  (instanceNumber > 1 ? children[position - 1].split("~")[instanceNumber - 1] : children[position - 1]).replace("\r", "");
//                }
//            }
//        };
//
//        HL7V2TreeServiceClass.prototype.getEndIndex = function (node, message) {
//            try {
//                var data = node.data;
//                if (data.endIndex != undefined && data.endIndex != -1) {
//                    return data.endIndex;
//                }
//
//                return this.getEndColumn(data.lineNumber, data.startIndex, data.type, data.path, message);
////                    var segments = message.toString().split('\n').length == 1 ? message.toString().split("\r") : message.toString().split('\n');
////                    return data.lineNumber - 1 < segments.length ? segments[data.lineNumber - 1] != null && !angular.equals("", segments[data.lineNumber - 1].toString().trim()) ? data.startIndex + this.getStringValue(data.type, data.path, segments[data.lineNumber - 1]).length : -1 : -1;
////
//            } catch (error) {
//                return -1;
//            }
//        };
//
//        HL7V2TreeServiceClass.prototype.getEndColumn = function (line, column, type, path, message) {
//            try {
//                var segments = message.toString().split('\n').length == 1 ? message.toString().split("\r") : message.toString().split('\n');
//                return line - 1 < segments.length ? segments[line - 1] != null && !angular.equals("", segments[line - 1].toString().trim()) ? column + this.getStringValue(type, path, segments[line - 1]).length : -1 : -1;
//            } catch (error) {
//                return -1;
//            }
//        };




        return new XMLTreeServiceClass();

    }]);

angular.module('xml').factory('XMLNodeFinder',
    [ function () {
        return  {
            /**
             *
             * @param tree
             * @param cursor
             * @returns {*}
             */
            findNode: function (tree, line) {
                var firstNode = tree.get_first_branch();
                var children = tree.get_siblings(firstNode);
                if (children) {
                    var node = children[0];
                    if (node == null) return null;
                    return this.findNodeByLineNumber(tree, node, line);
                }
                return null;
            },

            /**
             *
             * @param tree
             * @param node
             * @param lineNumber
             * @returns {*}
             */
            findNodeByLineNumber: function (tree, node, lineNumber) {
                if (node.data.start.line <= lineNumber) {
                    if (node.data.start.line == lineNumber || node.data.end.line == lineNumber) {
                        return node;
                    }
                    var children = tree.get_children(node);
                    if (children && children.length > 0) {
                        for (var i = 0; i < children.length; i++) {
                            var found = this.findNodeByLineNumber(tree, children[i], lineNumber);
                            if (found != null) {
                                return found;
                            }
                        }
                    }
                }
                return null;
            }

        }
    }]);


angular.module('xml').factory('XMLCursorService',
    [ 'CursorService', 'XMLNodeFinder', function (CursorService,XMLNodeFinder) {

        var XMLCursorServiceClass = function () {
            CursorService.call(this, arguments);
        };

        XMLCursorServiceClass.prototype = Object.create(CursorService.prototype);
        XMLCursorServiceClass.prototype.constructor = XMLCursorServiceClass;

        /**
         *
         * @param editor
         * @returns {*|Object|Array|string|number|Object|Array|Date|string|number}
         */
        XMLCursorServiceClass.prototype.getCoordinate = function (editor, tree) {
            try {
                var start, end, line;
                var found = XMLNodeFinder.findNode(tree.root, editor.doc.getCursor(true).line + 1);
                if (found !== null) {
                    start = found.data.start;
                    end = found.data.end;
                }
                return this.createCoordinate(start, end);
            } catch (e) {
            }
        };

        /**
         *
         * @param line
         * @param startIndex
         * @param endIndex
         * @returns {*|Object|Array|string|number|Object|Array|Date|string|number}
         */
        XMLCursorServiceClass.prototype.createCoordinate = function (start, end) {
            try {
                return  angular.fromJson({start: start, end: end});
            } catch (e) {

            }
        };

        /**
         *
         * @param index
         * @param container
         * @returns {number}
         */
        XMLCursorServiceClass.prototype.getStartIndex = function (index, container) {
            return 0;
        };



        return new XMLCursorServiceClass();

    }]);


angular.module('xml').factory('XMLEditorService',
    ['EditorService',function ( EditorService) {

        var XMLEditorServiceClass = function () {
            EditorService.call(this, arguments);
        };

        XMLEditorServiceClass.prototype = Object.create(EditorService.prototype);
        XMLEditorServiceClass.prototype.constructor = XMLEditorServiceClass;

        /**
         *
         * @param tree
         * @param cursor
         * @returns {*}
         */
        XMLEditorServiceClass.prototype.select = function (editorObject,cursorObject) {
            editorObject.doc.setSelection({
                line: cursorObject.start.line - 1,
                ch: cursorObject.start.index
            }, {
                line: cursorObject.end.line - 1,
                ch: cursorObject.end.index
            });
        };

        XMLEditorServiceClass.prototype.isXML = function (message) {
            return message.startsWith("<");
        };

        return new XMLEditorServiceClass();

    }]);

angular.module('xml').factory('XMLCursor',
    ['CursorClass', function (CursorClass) {
        var XMLCursorClass = function () {
            CursorClass.call(this, arguments);
            this.start = {line: 1, index: -1};
            this.end = {line: 1, index: -1};
            this.updateIndicator = '0';
        };

        XMLCursorClass.prototype = Object.create(CursorClass.prototype);
        XMLCursorClass.prototype.constructor = XMLCursorClass;


        XMLCursorClass.prototype.setLine = function (line) {
            this.line = line;
            this.notify();
        };


        XMLCursorClass.prototype.toString = function (line) {
            return  this.line + "," + this.start + "," + this.end;
        };

        XMLCursorClass.prototype.notify = function () {
            this.updateIndicator = new Date().getTime();
        };


        XMLCursorClass.prototype.init = function (coordinate) {
            this.start = coordinate.startIndex;
            this.end = coordinate.endIndex;
            this.notify();
        };

        XMLCursorClass.prototype.notify = function () {
            this.updateIndicator = new Date().getTime();
        };

        return new XMLCursorClass();

    }]);



angular.module('xml').factory('XMLEditor', function (EditorClass) {
    var XMLEditorClass = function () {
        EditorClass.apply(this, arguments);
    };

    XMLEditorClass.prototype = Object.create(EditorClass.prototype);
    XMLEditorClass.prototype.constructor = XMLEditorClass;

    XMLEditorClass.prototype.format = function () {
        this.instance.doc.setValue(this.instance.doc.getValue().replace(/\n/g, "")
            .replace(/[\t ]+\</g, "<")
            .replace(/\>[\t ]+\</g, "><")
            .replace(/\>[\t ]+$/g, ">"));
        var totalLines = this.instance.lineCount();
        var totalChars = this.instance.getTextArea().value.length;
        this.instance.autoFormatRange({line: 0, ch: 0}, {line: totalLines, ch: totalChars});
    };

    return new XMLEditorClass();
});




angular.module('xml').factory('XMLMessageValidator', function ($http, $q, MessageValidatorClass) {

    var XMLMessageValidatorClass = function () {
        MessageValidatorClass.call(this, 'xml');
    };

    XMLMessageValidatorClass.prototype = Object.create(MessageValidatorClass.prototype);
    XMLMessageValidatorClass.prototype.constructor = XMLMessageValidatorClass;

    return new XMLMessageValidatorClass();
});

angular.module('xml').factory('XMLMessageParser', function ($http, $q, MessageParserClass) {
    var XMLMessageParserClass = function () {
        MessageParserClass.call(this, 'xml');
     };

    XMLMessageParserClass.prototype = Object.create(MessageParserClass.prototype);
    XMLMessageParserClass.prototype.constructor = XMLMessageParserClass;
    return new XMLMessageParserClass();
});

angular.module('xml').factory('XMLReportService', function ($http, $q, ReportServiceClass) {
    var XMLReportServiceClass = function () {
        ReportServiceClass.call(this, 'xml');
     };
    XMLReportServiceClass.prototype = Object.create(ReportServiceClass.prototype);
    XMLReportServiceClass.prototype.constructor = XMLReportServiceClass;
    return new XMLReportServiceClass();
});





