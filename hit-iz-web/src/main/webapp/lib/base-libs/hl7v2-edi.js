angular.module('hl7v2-edi', ['format']);

angular.module('hl7v2-edi').factory('HL7V2EDICursorServiceClass',
    [ 'CursorService', function (CursorService) {

        var HL7V2EDICursorServiceClass = function () {
            CursorService.call(this, arguments);
        };

        HL7V2EDICursorServiceClass.prototype = Object.create(CursorService.prototype);
        HL7V2EDICursorServiceClass.prototype.constructor = HL7V2EDICursorServiceClass;


        /**
         *
         * @param editor
         * @returns {*|Object|Array|string|number|Object|Array|Date|string|number}
         */
        HL7V2EDICursorServiceClass.prototype.getSegment = function (editor) {
            try {
                if (editor != null) {
                    var separators = editor.options.mode.separators;
                    var separatorsArray = this.separatorsArray(separators);
                    var cursor = editor.doc.getCursor(true);
                    var cursorPosition = cursor.ch;
                    var lineContent = editor.doc.getLine(cursor.line);
                    var characters = lineContent.toString().split('');
                    var startIndex = cursorPosition - 1;
                    var endIndex = cursorPosition;
                    if (separators.length == 0) {
                        return;
                    }
                    // get the beginning of the element
                    while (startIndex > 0) {
                        if(characters[startIndex] === separators.segment_separator || characters[startIndex] === '\n' || characters[startIndex] === '\r'){
                            break;
                        }else{
                            startIndex--;
                        }
                    }
                    // get the end of the element
                    while (endIndex < characters.length) {
                        if(characters[endIndex] === separators.segment_separator|| characters[endIndex] === '\n' || characters[endIndex] === '\r'){
                            break;
                        } else {
                            endIndex++;
                        }
                    }
                    return lineContent.substring(startIndex, endIndex+1);
                }
            } catch (e) {

            }
        };

        /**
         *
         * @param editor
         * @returns {*|Object|Array|string|number|Object|Array|Date|string|number}
         */
        HL7V2EDICursorServiceClass.prototype.getCoordinate = function (editor) {
            try {
                if (editor != null) {
                    var separators = editor.options.mode.separators;
                    var separatorsArray = this.separatorsArray(separators);
                    var cursor = editor.doc.getCursor(true);
                    var cursorPosition = cursor.ch;
                    var segment = this.getSegment(editor);
                    var characters = segment.toString().split('');
                    var startIndex = cursorPosition - 1;
                    var endIndex = cursorPosition;
                    if (separators.length == 0) {
                        return;
                    }
                    // get the beginning of the element
                    while (startIndex > 0) {
                        if ($.inArray(characters[startIndex], separatorsArray) !== -1) {
                            break;
                        } else {
                            startIndex--;
                        }
                    }

                    // get the end of the element
                    while (endIndex < characters.length) {
                        if ($.inArray(characters[endIndex], separatorsArray) !== -1) {
                            break;
                        } else {
                            endIndex++;
                        }
                    }
                    return this.createCoordinate(cursor.line + 1, startIndex + 1, endIndex, cursorPosition);
                }
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
        HL7V2EDICursorServiceClass.prototype.createCoordinate = function (line, startIndex, endIndex, index, triggerTree) {
            try {
                return  angular.fromJson( { "start": {"line": line, "index": startIndex},  "end":{ "line": line, "index": endIndex}, "index": index, "triggerTree": triggerTree});
            } catch (e) {

            }
        };

        /**
         *
         * @param index
         * @param container
         * @returns {number}
         */
        HL7V2EDICursorServiceClass.prototype.getStartIndex = function (index, container) {
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
        };

        return  HL7V2EDICursorServiceClass;
    }]);


angular.module('hl7v2-edi').factory('HL7V2EDIEditorServiceClass',
    ['EditorService', function (EditorService) {

        var HL7V2EDIEditorServiceClass = function () {
            EditorService.call(this, arguments);
        };

        HL7V2EDIEditorServiceClass.prototype = Object.create(EditorService.prototype);
        HL7V2EDIEditorServiceClass.prototype.constructor = HL7V2EDIEditorServiceClass;


        /**
         *
         * @param editorObject
         * @param cursorObject
         */
        HL7V2EDIEditorServiceClass.prototype.select = function (editorObject, cursorObject) {
            var startIndex = cursorObject.startIndex;
            var endIndex = cursorObject.endIndex;
            var line = cursorObject.line;
            if (startIndex !== null && endIndex !== null && startIndex >= 0 && endIndex >= 0) {
                var line = parseInt(line) - 1;
                var startObj =  {
                    line: line,
                    ch: startIndex
                };
                var endObj =  {
                    line: line,
                    ch: endIndex
                };
                if(startIndex === endIndex){
                    editorObject.doc.setCursor(startObj, {scroll:true});
                }else {
                    editorObject.doc.setSelection(startObj, endObj, {scroll:true});
                }
//                editorObject.scrollIntoView(startObj, endObj);
            }
        };

        return HL7V2EDIEditorServiceClass;

    }]);


angular.module('hl7v2-edi').factory('HL7V2EDICursorClass',
    ['CursorClass', function (CursorClass) {

        var HL7V2EDICursorClass = function () {
            CursorClass.call(this, arguments);
            this.line = 1;
            this.startIndex = -1;
            this.endIndex = -1;
            this.index = -1;
            this.segment = "";
            this.updateIndicator = '0';
            this.triggerTree = undefined;
        };

        HL7V2EDICursorClass.prototype = Object.create(CursorClass.prototype);
        HL7V2EDICursorClass.prototype.constructor = HL7V2EDICursorClass;

        HL7V2EDICursorClass.prototype.init = function (coordinate, triggerTree) {
            this.line = coordinate.start.line;
            this.startIndex = coordinate.start.index - 1;
            this.endIndex = coordinate.end.index - 1;
            this.index = coordinate.start.index - 1;
            this.triggerTree = triggerTree;
            this.notify();
        };

        HL7V2EDICursorClass.prototype.notify = function () {
            this.updateIndicator = new Date().getTime();
        };

        return HL7V2EDICursorClass;

    }]);


angular.module('format').factory('HL7V2EDIEditorClass', function (EditorClass) {
    var HL7V2EDIEditorClass = function () {
        EditorClass.call(this, arguments);
    };
    HL7V2EDIEditorClass.prototype = Object.create(EditorClass.prototype);
    HL7V2EDIEditorClass.prototype.constructor = HL7V2EDIEditorClass;
    return HL7V2EDIEditorClass;
});


angular.module('hl7v2-edi').factory('HL7V2EDIUtils', function () {

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
                        // MSH[1]-4[1]
                        return path.split("-")[1].split("[")[0];
                    }
                    case "COMPONENT":
                    {
                        // MSH[1]-4[1].1
                        return path.split(".")[1];
                    }
                    case "SUB_COMPONENT":
                    {
                        // MSH[1]-4[1].1.2
                        return path.split(".")[2];
                    }
                }
            } catch (e) {
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

                        // MSH[1]-4[1]
                        return path.split("-")[1].split("[")[1].split("]")[0];
                    }
                    case "COMPONENT":
                    {
                        //                            return path.split("-")[2].split("[")[1].split("]")[0];
                        return 1;
                    }
                    case "SUB_COMPONENT":
                    {
                        //                            return path.split("-")[3].split("[")[1].split("]")[0];
                        return 1;
                    }
                }
            } catch (e) {
                return 1;
            }
        },

        getType: function (path) {

            //MSH[1]-3[1].1

            if (path.indexOf("-") > 0) {
                var path = path.split("-")[1];
                if (path.split(".").length === 0) {
                    return "FIELD";
                } else if (path.split(".").length === 1) {
                    return "COMPONENT";
                } else if (path.split(".").length === 2) {
                    return "SUB_COMPONENT";
                }
            } else {
                return "SEGMENT";
            }
            throw new Error("Invalid Path " + path);
        },

        prettyPath: function (path) {
            return path.replace(/\[[^\]]*?\]/g, '');
        }
    }
});

angular.module('hl7v2-edi').factory('HL7V2EDITreeServiceClass',
    ['$rootScope', '$http', '$q', 'HL7V2EDIUtils', 'TreeService', function ($rootScope, $http, $q, HL7V2EDIUtils, TreeService) {

        var HL7V2EDITreeServiceClass = function () {
            TreeService.call(this, arguments);
        };

        HL7V2EDITreeServiceClass.prototype = Object.create(TreeService.prototype);
        HL7V2EDITreeServiceClass.prototype.constructor = HL7V2EDITreeServiceClass;


        /**
         *
         * @param tree
         * @param cursorObject
         * @returns {*}
         */
        HL7V2EDITreeServiceClass.prototype.findByIndex = function (tree, cursorObject, message) {
            var segmentNode = this.findNodeByLineNumber(tree, cursorObject.line);
            if (segmentNode == undefined || segmentNode == null) return null;
            return this.findNodeByIndex(tree, segmentNode, cursorObject.line, cursorObject.startIndex + 1, cursorObject.endIndex + 1, message);
        };

        /**
         *
         * @param tree
         * @param line
         * @param path
         * @returns {*}
         */
        HL7V2EDITreeServiceClass.prototype.findByPath = function (tree, line, path) {
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
        HL7V2EDITreeServiceClass.prototype.findNodeByPath = function (tree, node, lineNumber, path) {
            if (path.startsWith(node.data.path)) {
                if (angular.equals(node.data.path, path)) {
//                        return this.findLastChild(tree, node);
                    return node;
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
        HL7V2EDITreeServiceClass.prototype.findNodeByIndex = function (tree, node, lineNumber, startIndex, endIndex, message) {
            if (node.data.start.line <= lineNumber) {
                var endInd = this.getEndIndex(node, message);
                if (angular.equals(node.data.start.index, startIndex) && angular.equals(endInd, endIndex)) {
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

        /**
         *
         * @param type
         * @param path
         * @param segment
         * @returns {*}
         */
        HL7V2EDITreeServiceClass.prototype.getStringValue = function (type, path, segment) {
            var position = HL7V2EDIUtils.getPosition(path, type);
            var instanceNumber = HL7V2EDIUtils.getInstanceNumber(path, type);
            var separators = this.editor.options.mode.separators;
            switch (type) {
                case "SEGMENT":
                {
                    return segment.replace(separators.segment_separator, "");
                }
                case "FIELD":
                {
                    if (segment.startsWith("MSH") && position == 1) return "";
                    var index = segment.startsWith("MSH") ? position - 2 : position - 1;
                    var container = segment.substring(4).split(separators.field_separator);
                    return (instanceNumber > 1 ? container[index].split(separators.repetition_separator)[instanceNumber - 1] : container[index]).replace("\r", "");
                }
                case "COMPONENT":
                {
                    var container = this.getStringValue("FIELD", path, segment);
                    return (instanceNumber > 1 ? container.split(separators.component_separator)[position - 1].split(separators.subcomponent_separator)[instanceNumber - 1] : container.split(separators.component_separator)[position - 1]).replace(separators.segment_separator, "");
                }

                case "SUB_COMPONENT":
                {
                    var container = this.getStringValue("COMPONENT", path, segment);
                    var children = container.split(separators.subcomponent_separator);
                    return  (instanceNumber > 1 ? children[position - 1].split(separators.repetition_separator)[instanceNumber - 1] : children[position - 1]).replace(separators.segment_separator, "");
                }
            }
        };

        HL7V2EDITreeServiceClass.prototype.getEndIndex = function (node, message) {
            try {
                var data = node.data;
                if (data.end.index != undefined && data.end.index != -1) {
                    return data.end.index;
                }
                data.end.index =  this.getEndColumn(data.start.line, data.start.index, data.type, data.path, message);
                return data.end.index;
            } catch (error) {
                return -1;
            }
        };

        HL7V2EDITreeServiceClass.prototype.getEndColumn = function (line, column, type, path, message) {
            try {
                var segments = message.toString().split('\n').length == 1 ? message.toString().split(separators.segment_separator) : message.toString().split('\n');
                return line - 1 < segments.length ? segments[line - 1] != null && !angular.equals("", segments[line - 1].toString().trim()) ? column + this.getStringValue(type, path, segments[line - 1]).length : -1 : -1;
            } catch (error) {
                return -1;
            }
        };

        return HL7V2EDITreeServiceClass;
    }]);


