/**
 * Created by haffo on 10/20/14.
 */
angular.module('soap', []);
angular.module('soap').factory('SoapValidationReportGenerator', ['$http', '$q', function ($http, $q) {
    return function (xmlReport, format) {
        var delay = $q.defer();
        $http({
            url: 'api/soap/report/generate/' + format,
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
}]);


angular.module('soap').factory('SoapValidationReportDownloader', ['$http', '$q', function ($http, $q) {
    return {
        downloadAs: function (xmlReport, format) {
            var form = document.createElement("form");
            form.action = "api/soap/report/download/" + format;
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
    };
}]);

/**
 * Created by haffo on 10/20/14.
 */
angular.module('soap').factory('XmlParser', ['$http', '$q', function ($http, $q) {
    return function (xml) {
        var delay = $q.defer();
        var data = angular.fromJson({"content": xml});

//        $http.get('../../resources/soap/soap.json').then(
//            function (object) {
//                delay.resolve(angular.fromJson(object.data));
//            },
//            function (response) {
//                if (response.status === 404) {
//                    delay.reject('Cannot parse the content');
//                } else {
//                    delay.reject('Unable to parse the content');
//                }
//            }
//        );

        $http.post("api/xmlgeneric/parse", data, {timeout: 60000}).then(
            function (object) {
                delay.resolve(angular.fromJson(object.data));
            },
            function (response) {
                delay.reject(response.data);
            }
        );
        return delay.promise;
    };
}]);


angular.module('soap').factory('XmlEscaper',
    [function () {
        var xml_special_to_escaped_one_map = {
            '&': '&',
            '"': '"',
            '&lt;': '&lt;',
            '>': '&gt;'
        };

        var escaped_one_to_xml_special_map = {
            '&': '&',
            '"': '"',
            '&lt;': '&lt;',
            '&gt;': '>'
        };


        var XmlEscaper = {

            encodeXml: function (string) {
//                return string.replace(/([\&"&lt;>])/g, function (str, item) {
//                    return xml_special_to_escaped_one_map[item];
//                });
                return string.replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&apos;');
            },

            decodeXml: function (string) {
//                return string.replace(/("|&lt;|&gt;|&)/g,
//                    function (str, item) {
//                        return escaped_one_to_xml_special_map[item];
//                    });
                return string.replace(/&apos;/g, "'")
                    .replace(/&quot;/g, '"')
                    .replace(/&gt;/g, '>')
                    .replace(/&lt;/g, '<')
                    .replace(/&amp;/g, '&');

            }
        };

        return XmlEscaper;
    }]);


angular.module('soap').factory('XmlFormatter', ['$http', '$q', function ($http, $q) {
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

        $http.post("api/xmlgeneric/format", data, {timeout: 60000}).then(
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


angular.module('soap').factory('XmlNodeFinder',
    ['$rootScope', function ($rootScope) {
        return  {
            /**
             *
             * @param tree
             * @param cursor
             * @returns {*}
             */
            find: function (tree, cursor) {
                var firstNode = tree.get_first_branch();
                var children = tree.get_siblings(firstNode);
                if (children) {
                    var envelopeNode = children[0];
                    if (envelopeNode == null) return null;
                    return this.findNode(tree, envelopeNode, cursor.line);
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
            findNode: function (tree, node, lineNumber) {
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
            }

        }
    }]);


angular.module('soap').factory('XmlCursorUtils',
    ['$rootScope', function ($rootScope) {
        return  {
            createCoordinate: function (start, end) {
                try {
                    return  angular.fromJson({start: start, end: end});
                } catch (e) {

                }
            }
        }
    }]);


angular.module('soap').factory('XmlEditorUtils',
    ['$rootScope', '$http', '$q', function ($rootScope, $http, $q) {
        return  {
            select: function (cursorObject, editorObject) {
                editorObject.doc.setSelection({
                    line: cursorObject.start.line - 1,
                    ch: cursorObject.start.index
                }, {
                    line: cursorObject.end.line - 1,
                    ch: cursorObject.end.index
                });
            },
            isXML: function (message) {
                return message.startsWith("<");
            }
        }
    }]);

angular.module('soap').factory('XmlTreeUtils',
    ['$rootScope', '$http', '$q', 'XmlNodeFinder', 'XmlCursorUtils', function ($rootScope, $http, $q, XmlNodeFinder, XmlCursorUtils) {
        return  {
            /**
             *
             * @param treeObject
             * @param cursorObject
             */
            selectNode: function (treeObject, cursorObject) {
                var found = XmlNodeFinder.find(treeObject, cursorObject);
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
            },


            /**
             *
             * @param node
             * @returns {*|Object|Array|string|number|Object|Array|Date|string|number}
             */
            getCoordinate: function (node) {
                return XmlCursorUtils.createCoordinate(node.data.start, node.data.end);
            },

            /**
             *
             * @param node
             * @param cursorObject
             */
            setCoordinate: function (node, cursorObject) {
                try {
                    var coordinate = this.getCoordinate(node);
                    if (coordinate !== null) {
                        cursorObject.start = coordinate.start;
                        cursorObject.end = coordinate.end;
                        cursorObject.notify();
                    }
                } catch (e) {

                }
            },

            /**
             *
             * @param treeObject
             */
            expandTree: function (treeObject) {
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
            }
        }
    }]);
