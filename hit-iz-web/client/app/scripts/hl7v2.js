angular.module('hl7v2').factory('HL7CursorUtils',
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


angular.module('hl7v2').factory('HL7EditorUtils',
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


angular.module('hl7v2').factory('HL7Utils', function () {

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
            }catch(e){
                return 1;
            }
        },

        getType: function (path) {

            //MSH[1]-3[1].1

            if(path.indexOf("-") > 0){
                var path =  path.split("-")[1];
                if (path.split(".").length === 0) {
                    return "FIELD";
                } else if (path.split(".").length === 1) {
                    return "COMPONENT";
                } else if (path.split(".").length === 2) {
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

angular.module('hl7v2').factory('HL7TreeUtils',
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
                return found;
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
                return found;

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



angular.module('hl7v2').factory('Er7MessageValidator', function ($http, $q, HL7EditorUtils) {
    var Er7MessageValidator = function () {
    };

    Er7MessageValidator.prototype.validate = function (testContextId, content, name, dqaCodes, facilityId, contextType) {
        var delay = $q.defer();
        if (!HL7EditorUtils.isHL7(content)) {
            delay.reject("Message provided is not an HL7 v2 message");
        } else {
//
            $http.get('../../resources/cf/newValidationResult3.json').then(
                function (object) {
                    delay.resolve(angular.fromJson(object.data));
                },
                function (response) {
                    delay.reject(response.data);
                }
            );
//            $http.post('api/hl7v2/testcontext/' + testContextId + '/validateMessage', angular.fromJson({"content": content, "dqaCodes": dqaCodes, "facilityId": "1223", "contextType": contextType})).then(
//                function (object) {
//                    try {
//                        delay.resolve(angular.fromJson(object.data));
//                    } catch (e) {
//                        delay.reject("Invalid character in the message");
//                    }
//                },
//                function (response) {
//                    delay.reject(response.data);
//                }
//            );
        }
        return delay.promise;
    };

    return Er7MessageValidator;
});

angular.module('hl7v2').factory('Er7MessageParser', function ($http, $q, HL7EditorUtils) {
    var Er7MessageParser = function () {
    };

    Er7MessageParser.prototype.parse = function (testContextId, content, name) {
        var delay = $q.defer();
        if (!HL7EditorUtils.isHL7(content)) {
            delay.reject("Message provided is not an HL7 v2 message");
        } else {
//            $http.post('api/hl7v2/testcontext/' + testContextId + '/parseMessage', angular.fromJson({"content": content})).then(
//                function (object) {
//                    delay.resolve(angular.fromJson(object.data));
//                },
//                function (response) {
//                    delay.reject(response.data);
//                }
//            );

            $http.get('../../resources/cf/messageObject.json').then(
                function (object) {
                    delay.resolve(angular.fromJson(object.data));
                },
                function (response) {
                    delay.reject(response.data);
                }
            );
        }

        return delay.promise;
    };

    return Er7MessageParser;
});



