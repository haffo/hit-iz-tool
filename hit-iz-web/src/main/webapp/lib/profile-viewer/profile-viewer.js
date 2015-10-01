/**
 * Created by haffo on 5/4/15.
 */

(function (angular) {
    'use strict';
    var mod = angular.module('hit-profile-viewer', []);
    mod.directive('profileViewer', [
        function () {
            return {
                restrict: 'A',
                scope: {
                    type: '@'
                },
                templateUrl: 'lib/profile-viewer/profile-viewer.html',
                replace: false,
                controller: 'ProfileViewerCtrl'
            };
        }
    ]);

    mod
        .controller('ProfileViewerCtrl', ['$scope', '$rootScope', 'PvTreetableParams', 'ProfileService', '$http', '$filter', '$cookies', '$sce', '$timeout', function ($scope, $rootScope, PvTreetableParams, ProfileService, $http, $filter, $cookies, $sce, $timeout) {
            $scope.testCase = null;
            $scope.elements = [];
            $scope.confStatements = [];
            $scope.tmpConfStatements = [].concat($scope.confStatements);
            $scope.confStatementsActive = false;
            $scope.nodeData = [];
            $scope.loading = false;
            $scope.error = null;
            $scope.profile = null;
            $scope.profileService = new ProfileService();
            $scope.loading = false;
            $scope.error = null;
            $scope.csWidth = null;
            $scope.predWidth = null;
            $scope.tableWidth = null;

            $scope.options = {
                concise: true,
                relevance: true,
                collapse: true
            };
            $rootScope.pvNodesMap = {};

            $scope.getConstraintsAsString = function (constraints) {
                var str = '';
                for (var index in constraints) {
                    str = str + "<p style=\"text-align: left\">" + constraints[index].id + " - " + constraints[index].description + "</p>";
                }
                return str;
            };

            $scope.isBranch = function (node) {
                return node.children != null && node.children.length > 0;

//                if (node.children != null && node.children.length > 0) {
//                    for (var i = 0; i < node.children.length; i++) {
//                        if ($scope.isRelevant(node.children[i])) {
//                            return true;
//                        }
//                    }
//                }
//                return false;
            };

            $scope.showRefSegment = function (id) {
                if ($scope.elements.length > 0 && id)
                    for (var i = 1; i < $scope.elements.length; i++) {
                        var element = $scope.elements[i];
                        if (element.id == id) {
                            $scope.getNodeContent(element);
                        }
                    }
            };

            $scope.isRelevant = function (node) {
                return !$scope.options.relevance || ($scope.options.relevance && node.relevent === true);
            };

            $scope.collapseAll = function (collapse) {
                $scope.options.collapse = collapse;
                $scope.refresh();
            };

            $scope.collectConfStatements = function (obj, confStatementsMap) {
                if (obj) {
                    if (obj.conformanceStatements && obj.conformanceStatements !== null) {
                        angular.forEach(obj.conformanceStatements, function (conformanceStatement) {
                            if (!confStatementsMap.hasOwnProperty(conformanceStatement.id)) {
                                confStatementsMap[conformanceStatement.id] = conformanceStatement;
                                $scope.confStatements.push(conformanceStatement);
                            }
                        });
                    }
                    if (obj.children) {
                        angular.forEach(obj.children, function (child) {
                            $scope.collectConfStatements(child, confStatementsMap);
                        });
                    }
                }
            };


            $scope.showValueSetDefinition = function (tableId) {
                $timeout(function () {
                    $rootScope.$broadcast($scope.type + ':showValueSetDefinition', tableId);
                });
            };

            $scope.getValueSet = function (tableStr) {
                if (tableStr && tableStr != null) {
                    return tableStr.split(":");
                }
                return [];
            };

            $rootScope.$on($scope.type + ':profileLoaded', function (event, profile) {
                if (profile && profile.id != null) {
                    if ($scope.profile === null || $scope.profile.id != profile.id) {
                        $scope.loading = true;
                        $scope.options.collapse = true;
                        $scope.profile = profile;
                        $scope.profileService.getJson($scope.profile.id).then(function (jsonObject) {
                            $scope.loading = false;
                            $scope.loading = true;
                            $scope.nodeData = [];
                            $scope.loading = false;
                            profile['json'] = angular.fromJson(jsonObject);
                            $scope.elements = profile.json.elements;
                            var datatypes = null;
                            var segments = [];
                            var message = null;
                            var confStatementsMap = {};
                            $scope.confStatements = [];
                            angular.forEach($scope.elements, function (element) {
                                if (element.name === 'Datatypes' && datatypes === null) {
                                    datatypes = element;
                                }
                                if (element.type === 'SEGMENT') {
                                    segments.push(element);
                                }
                                $scope.collectConfStatements(element, confStatementsMap);
                            });
                            $scope.confStatements = $filter('orderBy')($scope.confStatements, 'id');
                            $scope.tmpConfStatements = [].concat($scope.confStatements);
                            $scope.profileService.setDatatypesTypesAndIcons(datatypes);
//                        var valueSetIds = $scope.profileService.getValueSetIds(segments, datatypes.children);
//                        $rootScope.$broadcast($scope.type + ':valueSetIdsCollected', valueSetIds);
                            $scope.getNodeContent($scope.elements[0]);
                            $scope.loading = false;
                        }, function (error) {
                            $scope.error = "Sorry, Cannot load the profile.";
                            $scope.loading = false;
                            $scope.nodeData = [];
                            $scope.elements = [];
                            $scope.confStatements = [];
                            $scope.tmpConfStatements = [].concat($scope.confStatements);
                            $scope.refresh();
                        });
                    }
                } else {
                    $scope.loading = false;
                    $scope.nodeData = [];
                    $scope.elements = [];
                    $scope.refresh();
                    $scope.loading = false;
                    $scope.confStatements = [];
                    $scope.tmpConfStatements = [].concat($scope.confStatements);

                }
            });

            $scope.params = new PvTreetableParams({
                getNodes: function (parent) {
                    return parent ? parent.children : $scope.nodeData.children;
                },
                toggleRelevance: function () {
                    return $scope.setAllRelevance($scope.options.relevance);
                },
                toggleConcise: function () {
                    return $scope.setAllConcise($scope.options.concise);
                },
                getRelevance: function () {
                    return $scope.options.relevance;
                },
                isRelevant: function (node) {
                    return $scope.isRelevant(node);
                },
                getConcise: function () {
                    return $scope.options.concise;
                },
                getTemplate: function (node) {
                    if ($scope.nodeData && $scope.nodeData.type != undefined) {
                        if ($scope.nodeData.type === 'SEGMENT') {
                            return 'SegmentNode.html';
                        } else if ($scope.nodeData.type === 'MESSAGE') {
                            return 'MessageNode.html';
                        } else if ($scope.nodeData.type === 'DATATYPE') {
                            return node.type === 'DATATYPE' ? 'DatatypeNode.html' : 'FieldOrComponentNode.html';
                        }
                    }
                    return 'MessageNode.html';
                },
                options: {
                    initialState: 'collapsed'
                }
            });

            $scope.refresh = function () {
                $rootScope.pvNodesMap = {};
                $scope.params.refreshWithState(!$scope.options.collapse ? 'expanded' : 'collapse');
            };

            $scope.hasARelevantChild = function (node) {
                if (node.children != null && node.children.length > 0) {
                    for (var i = 0; i < node.children.length; i++) {
                        if ($scope.isRelevant(node.children[i])) {
                            return true;
                        }
                    }
                }
                return false;
            };

            $scope.getNodeContent = function (selectedNode) {
                if (selectedNode != null) {
                    $scope.csWidth = 0;
                    $scope.predWidth = 0;
                    $scope.confStatementsActive = false;
                    $scope.nodeData = selectedNode;
                    $scope.options.collapse = selectedNode.type !== 'MESSAGE';
                    $scope.refresh();
                    $timeout(function() {
                        $scope.predWidth = null;
                        $scope.tableWidth = null;
                        $scope.csWidth = null;
                        $scope.getCsWidth();
                        $scope.getPredWidth();
                    },100);

                }
//                $scope.setAllRelevance($scope.options.relevance);
            };

            $scope.setAllRelevance = function (value) {
                $scope.options.relevance = value;
                if (!$scope.options.relevance) {
                    $('table.pvt tr span.indenter a').show();
                    $('table.pvt tr.notRelevant').show();
                } else {
                    $('table.pvt tr.notRelevant').hide();
                    var branches = $('table.pvt tr.branch').not('.ng-hide').not('.notRelevant');
                    for (var i = 0; i < branches.length; i++) {
                        var branch = $(branches[i]);
                        var id = branch.attr('data-tt-id');
                        var node = $rootScope.pvNodesMap[id];
                        if (node && node !== null && !$scope.hasARelevantChild(node)) {
                            var a = $(branch[0]).find("td span.indenter a");
                            if (a) {
                                $(a[0]).hide();
                            }
                        }
                    }
                }
            };


            $scope.setRowRelevance = function (rowId) {
                if (!$scope.options.relevance) {
                    $('table.pvt tr span.indenter a').show();
                    $('table.pvt tr.notRelevant').show();
                } else {
                    $('table.pvt tr.notRelevant').hide();
                    var branches = $('table.pvt tr.branch[data-tt-parent-id="' + rowId + "'" + ']').not('.ng-hide').not('.notRelevant');
                    for (var i = 0; i < branches.length; i++) {
                        var branch = $(branches[i]);
                        var id = branch.attr('data-tt-id');
                        var node = $rootScope.pvNodesMap[id];
                        if (node && node !== null && !$scope.hasARelevantChild(node)) {
                            var a = $(branch[0]).find("td span.indenter a");
                            if (a) {
                                $(a[0]).hide();
                            }
                        }
                    }
                }
            };

            $scope.setAllConcise = function (value) {
                $scope.options.concise = value;
                if (!$scope.options.concise) {
                    $('table.pvt tr td span.concise-view').hide();
                    $('table.pvt tr td span.expanded-view').show();
                } else {
                    $('table.pvt tr td span.concise-view').show();
                    $('table.pvt tr td span.expanded-view').hide();
                }
            };

            $scope.showConfStatements = function () {
                $scope.confStatementsActive = true;
            };

            $scope.getPredicatesAsMultipleLinesString = function (node) {
                var html = "";
                angular.forEach(node.predicates, function (predicate) {
                    html = html + "<p>" + predicate.description + "</p>";
                });
                return html;
            };

            $scope.getPredicatesAsOneLineString = function (node) {
                var html = "";
                angular.forEach(node.predicates, function (predicate) {
                    html = html + predicate.description;
                });
                return $sce.trustAsHtml(html);
            };


            $scope.getConfStatementsAsMultipleLinesString = function (node) {
                var html = "";
                angular.forEach(node.conformanceStatements, function (conStatement) {
                    html = html + "<p>" + conStatement.id + " : " + conStatement.description + "</p>";
                });
                return html;
            };

            $scope.getConfStatementsAsOneLineString = function (node) {
                var html = "";
                angular.forEach(node.conformanceStatements, function (conStatement) {
                    html = html + conStatement.id + " : " + conStatement.description;
                });
                return $sce.trustAsHtml(html);
            };


            $scope.scrollbarWidth = $rootScope.getScrollbarWidth();


            $scope.getTableWidth = function () {
                if($scope.tableWidth === null) {
                    $scope.tableWidth = $("#executionPanel").width();
                }
                return $scope.tableWidth;
            };

            $scope.getCsWidth = function(){
                if($scope.csWidth === null){
                    var tableWidth = $scope.getTableWidth();
                    if(tableWidth > 0) {
                        var otherColumsWidth = !$scope.nodeData || $scope.nodeData === null || $scope.nodeData.type === 'MESSAGE' ? 700 : 950;
                        var left = tableWidth - otherColumsWidth;
                        $scope.csWidth = {"width" : 2 * parseInt(left / 3) + "px"};
                    }
                }
                return $scope.csWidth;
            };

            $scope.getPredWidth = function(){
                if($scope.predWidth === null){
                    var tableWidth = $scope.getTableWidth();
                    if(tableWidth > 0) {
                        var otherColumsWidth = !$scope.nodeData || $scope.nodeData === null || $scope.nodeData.type === 'MESSAGE' ? 700 : 950;
                        var left = tableWidth - otherColumsWidth;
                        $scope.predWidth = {"width" :parseInt(left / 3) + "px"};
                     }
                }
                return $scope.predWidth;
            }



        }]);

    mod.directive('stRatio', function () {
        return {

            link: function (scope, element, attr) {
                var ratio = +(attr.stRatio);
                element.css('width', ratio + '%');
            }
        };
    });

//    mod.directive('conciseView', function () {
//        return {
//            link: function (scope, element, attr) {
//                var width = element.parent("td").width();
//                element.css('width', width);
//            }
//        };
//    });


    mod.factory('ProfileService', function ($http, $q, $filter) {
        var ProfileService = function () {
        };

        ProfileService.prototype.getValueSetIds = function (segments, datatypes) {
            var valueSetIds = [];
            angular.forEach(segments, function (segment) {
                angular.forEach(segment.children, function (field) {
                    if (field.table && valueSetIds.indexOf(field.table) === -1) {
                        valueSetIds.push(field.table);
                    }
                });
            });
            angular.forEach(datatypes, function (datatype) {
                angular.forEach(datatype.children, function (component) {
                    if (component.table && valueSetIds.indexOf(component.table) === -1) {
                        valueSetIds.push(component.table);
                    }
                    if (component.children && component.children.length > 0) {
                        angular.forEach(component.children, function (subcomponent) {
                            if (subcomponent.table && valueSetIds.indexOf(subcomponent.table) === -1) {
                                valueSetIds.push(subcomponent.table);
                            }
                            if (subcomponent.children && subcomponent.children.length > 0) {
                                angular.forEach(subcomponent.children, function (subcomponent2) {
                                    if (subcomponent2.table && valueSetIds.indexOf(subcomponent2.table) === -1) {
                                        valueSetIds.push(subcomponent2.table);
                                    }
                                });
                            }
                        });
                    }
                });
            });
            return valueSetIds;
        };

        ProfileService.prototype.setDatatypesTypesAndIcons = function (datatypes) {
            if (datatypes !== null) {
                var that = this;
                angular.forEach(datatypes.children, function (datatype) {
                    if (datatype.children.length > 0) {
                        angular.forEach(datatype.children, function (component) {
                            that.setComponentTypesAndIcons(component);
                        });
                    }
                });
            }
        };
        ProfileService.prototype.setComponentTypesAndIcons = function (component) {
            component.type = "COMPONENT";
            component.icon = "component.png";
            var that = this;
            if (component.children.length > 0) {
                angular.forEach(component.children, function (subcomponent) {
                    that.setSubComponentTypesAndIcons(subcomponent);
                });
            }
        };

        ProfileService.prototype.setSubComponentTypesAndIcons = function (subComponent) {
            subComponent.type = "SUBCOMPONENT";
            subComponent.icon = "subcomponent.png";
            var that = this;
            if (subComponent.children.length > 0) {
                angular.forEach(subComponent.children, function (child) {
                    that.setSubComponentTypesAndIcons(child);
                });
            }
        };

        ProfileService.prototype.getJson = function (id) {
            var delay = $q.defer();
            $http.post('api/profile/' + id).then(
                function (object) {
                    try {
                        delay.resolve(angular.fromJson(object.data));
                    } catch (e) {
                        delay.reject("Invalid character");
                    }
                },
                function (response) {
                    delay.reject(response.data);
                }
            );

//            $http.get('../../resources/cf/profile.json').then(
//                function (object) {
//                    delay.resolve(angular.fromJson(object.data));
//                },
//                function (response) {
//                    delay.reject(response.data);
//                }
//            );

            return delay.promise;
        };

        return ProfileService;

    });


    mod.factory('PvTreetableParams', ['$log', function ($log) {
        var params = function (baseConfiguration) {
            var self = this;

            /**
             * @ngdoc method
             * @param {<any>} parent A parent node to fetch children of, or null if fetching root nodes.
             */
            this.getNodes = function (parent) {
            }

            this.getRelevance = function () {
            }

            this.toggleRelevance = function () {
            }

            this.toggleConcise = function () {
            }

            this.isRelevant = function (node) {
            }

            /**
             * @ngdoc method
             * @param {<any>} node A node returned from getNodes
             */
            this.getTemplate = function (node) {
            }

            /**
             * @ngdoc property
             */
            this.options = {};

            /**
             * @ngdoc method
             */
            this.refresh = function () {
            }

            if (angular.isObject(baseConfiguration)) {
                angular.forEach(baseConfiguration, function (val, key) {
                    if (['getNodes', 'getTemplate', 'options', 'getRelevance', 'toggleRelevance', 'toggleConcise', 'getConcise','isRelevant'].indexOf(key) > -1) {
                        self[key] = val;
                    } else {
                        $log.warn('PvTreetableParams - Ignoring unexpected property "' + key + '".');
                    }
                });
            }

        }
        return params;
    }]);

    mod.controller('PvTreetableController', ['$scope', '$element', '$compile', '$templateCache', '$q', '$http', '$timeout', function ($scope, $element, $compile, $templateCache, $q, $http, $timeout) {

        var params = $scope.pvParams;
        var table = $element;

        $scope.compileElement = function (node, parentId, parentNode) {
            var tpl = params.getTemplate(node);

            var templatePromise = $http.get(params.getTemplate(node), {cache: $templateCache}).then(function (result) {
                return result.data;
            });

            return templatePromise.then(function (template) {
                var template_scope = $scope.$parent.$new();
                angular.extend(template_scope, {
                    node: node,
                    parentNode: parentNode
                });
                template_scope._ttParentId = parentId;
                return $compile(template)(template_scope).get(0);
            })

        };

        /**
         * Expands the given node.
         * @param parentElement the parent node element, or null for the root
         * @param shouldExpand whether all descendants of `parentElement` should also be expanded
         */
        $scope.addChildren = function (parentElement, shouldExpand) {
            var parentNode = parentElement && parentElement.scope() ? parentElement.scope().node : null;
            var parentId = parentElement ? parentElement.data('ttId') : null;

            if (parentElement) {
                parentElement.scope().loading = true;
            }

            var data = params.getNodes(parentNode);
            var elementPromises = [];
            angular.forEach(data, function (node) {
                  elementPromises.push($scope.compileElement(node, parentId, parentNode));
             });

            $q.all(elementPromises).then(function (newElements) {
                var parentTtNode = parentId != null ? table.treetable("node", parentId) : null;

                $element.treetable('loadBranch', parentTtNode, newElements);

                if (shouldExpand) {
                    angular.forEach(newElements, function (el) {
                        $scope.addChildren($(el), shouldExpand);
                    });
                }
                if (parentElement && parentElement.scope()) {
                    parentElement.scope().loading = false;
                }
            });
        };

        $scope.addRelevantChildren = function (parentElement, shouldExpand) {
            var parentNode = parentElement && parentElement.scope() ? parentElement.scope().node : null;
            var parentId = parentElement ? parentElement.data('ttId') : null;

            if (parentElement) {
                parentElement.scope().loading = true;
            }

            var data = params.getNodes(parentNode);
            var elementPromises = [];
            angular.forEach(data, function (node) {
                if(params.isRelevant(node)) {
                elementPromises.push($scope.compileElement(node, parentId, parentNode));
                }
            });

            $q.all(elementPromises).then(function (newElements) {
                var parentTtNode = parentId != null ? table.treetable("node", parentId) : null;

                $element.treetable('loadBranch', parentTtNode, newElements);

                if (shouldExpand) {
                    angular.forEach(newElements, function (el) {
                        $scope.addChildren($(el), shouldExpand);
                    });
                }
                if (parentElement && parentElement.scope()) {
                    parentElement.scope().loading = false;
                }
            });
        };


        /**
         * Callback for onNodeExpand to add nodes.
         */
        $scope.onNodeExpand = function () {
            if (this.row.scope().loading) return; // make sure we're not already loading
            table.treetable('unloadBranch', this); // make sure we don't double-load
            $scope.addRelevantChildren(this.row, $scope.shouldExpand());
            var id = this.row ? this.row.data('ttId') : null;
            //$scope.toggleNodeView(id);
        };

        /**
         * Callback for onNodeCollapse to remove nodes.
         */
        $scope.onNodeCollapse = function () {
            if (this.row.scope().loading) return; // make sure we're not already loading
            table.treetable('unloadBranch', this);
        };

        /**
         * Rebuilds the entire table.
         */
        $scope.refresh = function () {
            if (table && table.data('treetable')) {
                var rootNodes = table.data('treetable').nodes;
                while (rootNodes.length > 0) {
                    table.treetable('removeNode', rootNodes[0].id);
                }
                $scope.addChildren(null, $scope.shouldExpand());
                $scope.toggleAllView();
            }
        };

        $scope.toggleAllView = function () {
            $timeout(function () {
                params.toggleRelevance();
                //params.toggleConcise();
            }, 100);
        };


        $scope.setRowConcise = function (rowId) {

        };

        // COntinie work on toggle here
        $scope.toggleNodeView = function (id) {
//            $timeout(function () {
//                if (!params.getConcise()) {
//                    $('table.pvt tr td span span.concise-view').hide();
//                    $('table.pvt tr td span span.expanded-view').show();
//                } else {
//                    $('table.pvt tr td span span.expanded-view').hide();
//                    $('table.pvt tr  td span span.concise-view').show();
//                }
//            }, 100);
        };

        $scope.refreshWithState = function (state) {
            $scope.options.initialState = state;
            $scope.refresh();
        };


        $scope.getNode = function (id) {
            return table.treetable("node", id);
        };


        $scope.toggleExpand = function (id, expand) {
        };

        // attach to params for convenience
        params.refresh = $scope.refresh;
        params.force = true;
//          params.expand = $scope.expandChildren;
//          params.collapse = $scope.collapseChildren;

        params.refreshWithState = $scope.refreshWithState;
        params.toggleExpand = $scope.toggleExpand;
        params.getNode = $scope.getNode;

        /**
         * Build options for the internal treetable library.
         */
        $scope.getOptions = function () {
            var opts = angular.extend({
                expandable: true,
                onNodeExpand: $scope.onNodeExpand,
                onNodeCollapse: $scope.onNodeCollapse
            }, params.options);

            if (params.options) {
                // Inject required event handlers before custom ones
                angular.forEach(['onNodeCollapse', 'onNodeExpand'], function (event) {
                    if (params.options[event]) {
                        opts[event] = function () {
                            $scope[event].apply(this, arguments);
                            params.options[event].apply(this, arguments);
                        }
                    }
                });
            }

            return opts;
        };

        $scope.shouldExpand = function () {
            return $scope.options.initialState === 'expanded';
        };

        $scope.options = $scope.getOptions();
        table.treetable($scope.options);
        $scope.addChildren(null, $scope.shouldExpand());

    }]);

    mod.directive('pvTable', [function () {
        return {
            restrict: 'AC',
            scope: {
                pvParams: '='
            },
            controller: 'PvTreetableController'
        }
    }]);

    mod.directive('pvNode', ['$cookies', '$rootScope', function ($cookies, $rootScope) {
        var ttNodeCounter = 0;
        return {
            restrict: 'AC',
            scope: {
                isBranch: '=',
                parent: '=',
                data: '='
            },
            link: function (scope, element, attrs) {
                var branch = angular.isDefined(scope.isBranch) ? scope.isBranch : true;

                // Look for a parent set by the tt-tree directive if one isn't explicitly set
                var parent = angular.isDefined(scope.parent) ? scope.parent : scope.$parent._ttParentId;
                var id = ttNodeCounter;
                element.attr('data-tt-id', ttNodeCounter++);
                element.attr('data-tt-branch', branch);
                element.attr('data-tt-parent-id', parent);

                var data = angular.isDefined(scope.data) ? scope.data : null;
                if (data != null) {
                    if (!data.relevent) {
                        element.addClass('notRelevant');
                    }
                    $rootScope.pvNodesMap[id] = data;
//                    element.attr('data-tt-node', angular.toJson(data));
                }
            }
        }

    }]);


})(angular);