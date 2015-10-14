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
    ['XMLCursorService', 'TreeService', function (XMLCursorService, TreeService) {

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
                var envelopeNode = children[0];
                if (envelopeNode == null) return null;
                return this.findNodeByPath(tree, envelopeNode, cursorObject.line,undefined);
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
        XMLTreeServiceClass.prototype.findByPath = function (tree, line, path) {
            var segmentNode = this.findNodeByLineNumber(tree, line);
            if (segmentNode == undefined || segmentNode == null) return null;
            return this.findNodeByPath(tree, segmentNode, line, path);
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
        XMLTreeServiceClass.prototype.findNodeByPath = function (tree, node, lineNumber, path) {
            if (node.data.start.line <= lineNumber) {
                if (node.data.start.line == lineNumber || node.data.end.line == lineNumber) {
                    return node;
                }
                var children = tree.get_children(node);
                if (children && children.length > 0) {
                    for (var i = 0; i < children.length; i++) {
                        var found = this.findNode(tree, children[i], lineNumber);
                        if (found != null) {
                            return found;
                        }
                    }
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
        XMLTreeServiceClass.prototype.findNodeByIndex = function (tree, node, lineNumber, startIndex, endIndex, message) {
            if (node.data.lineNumber <= lineNumber) {
                var endInd = this.getEndIndex(node, message);
                if (angular.equals(node.data.startIndex, startIndex) && angular.equals(endInd, endIndex)) {
                    return this.findLastChild(tree, node);
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
        };


        XMLTreeServiceClass.prototype.selectNodeByPath = function (treeObject, lineNumber, path) {
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


angular.module('xml').factory('XMLCursorService',
    [ 'CursorService', function (CursorService) {

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
        XMLCursorServiceClass.prototype.getCoordinate = function (editor) {
            try {

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
        XMLCursorServiceClass.prototype.createCoordinate = function (line, startIndex, endIndex, index, triggerTree) {
            try {
                return  angular.fromJson({start: startIndex, end: endIndex});
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


angular.module('xml').factory('XMLMessageValidator', function (MessageValidatorClass) {

    var XMLMessageValidatorClass = function () {
        MessageValidatorClass.call(this, 'xml');
    };

    XMLMessageValidatorClass.prototype = Object.create(MessageValidatorClass.prototype);
    XMLMessageValidatorClass.prototype.constructor = XMLMessageValidatorClass;

    return new XMLMessageValidatorClass();
});

angular.module('xml').factory('XMLMessageParser', function (MessageParserClass) {
    var XMLMessageParserClass = function () {
        MessageParserClass.call(this, 'xml');
     };

    XMLMessageParserClass.prototype = Object.create(MessageParserClass.prototype);
    XMLMessageParserClass.prototype.constructor = XMLMessageParserClass;
    return new XMLMessageParserClass();
});

angular.module('xml').factory('XMLReportService', function (ReportServiceClass) {
    var XMLReportServiceClass = function () {
        ReportServiceClass.call(this, 'xml');
     };
    XMLReportServiceClass.prototype = Object.create(ReportServiceClass.prototype);
    XMLReportServiceClass.prototype.constructor = XMLReportServiceClass;
    return new XMLReportServiceClass();
});





