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
                templateUrl: 'ProfileViewer.html',
                replace: false,
                controller: 'ProfileViewerCtrl'
            };
        }
    ]);

    mod
        .controller('ProfileViewerCtrl', ['$scope', '$rootScope', 'PvTreetableParams', 'ProfileService', '$http', '$filter', '$cookies', '$sce', '$timeout', function ($scope, $rootScope, PvTreetableParams, ProfileService, $http, $filter, $cookies, $sce, $timeout) {
            $scope.testCase = null;
            $scope.elements = [];
            $scope.tmpConfStatements = [];
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
            $scope.parentsMap = {};
            $scope.componentsParentMap = {};
            $scope.options = {
                concise: true,
                relevance: true,
                collapse: true
            };
            $scope.predicates = [];
            $scope.confStatements = [];
            $scope.segments = [];
            $scope.datatypes = [];
            $rootScope.pvNodesMap = {};
            $scope.model = null;

            $scope.getConstraintsAsString = function (constraints) {
                var str = '';
                for (var index in constraints) {
                    str = str + "<p style=\"text-align: left\">" + constraints[index].id + " - " + constraints[index].description + "</p>";
                }
                return str;
            };

            $scope.isBranch = function (node) {
                var children = $scope.children(node);
                return children != null && children.length > 0;
            };

            $scope.showRefSegment = function (id) {
                if ($scope.segments.length > 0 && id)
                    for (var i = 1; i < $scope.segments.length; i++) {
                        var element = $scope.segments[i];
                        if (element.id == id) {
                            $scope.getNodeContent(element);
                        }
                    }
            };

            $scope.isRelevant = function (node) {
                if (node === undefined || !$scope.options.relevance)
                    return true;
                if (node.hide == undefined || !node.hide || node.hide === false) {
                    if (node.predicates && node.predicates != null && node.predicates.length > 0 ) {
                        return  node.predicates[0].trueUsage === "R" || node.predicates[0].trueUsage === "RE" || node.predicates[0].falseUsage === "R" || node.predicates[0].falseUsage === "RE";
                    }else {
                        return node.usage == null || !node.usage || node.usage === "R" || node.usage === "RE";
                    }
                } else {
                    return false;
                }
                //                if ($scope.options.relevance && node.hide === false) {
////                    if (node.type !== 'SEGMENT') {
//                        if (predicate && predicate != null) {
//                            return predicate.trueUsage === "R" || predicate.trueUsage === "RE" || predicate.falseUsage === "R" || predicate.falseUsage === "RE";
//                        }
//                        return node.usage == null || !node.usage || node.usage === "R" || node.usage === "RE";
////                    } else {
////                        return node.relevent;
////                    }
//                }
//                return true;
            };

//            $scope.getNodePredicate = function (node, predicates) {
//                var predicate = $scope.filterConstraints(node, predicates);
//                if (predicate != null) {
//                    if (predicate.constructor === Array) {
//                        if (predicate.length > 0) {
//                            predicate = predicate[0];
//                        } else {
//                            predicate = null;
//                        }
//                    }
//                }
//                return predicate;
//            };

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
                $rootScope.$emit($scope.type + ':showValueSetDefinition', tableId);
            };

            $scope.getValueSet = function (tableStr) {
                if (tableStr && tableStr != null) {
                    return tableStr.split(":");
                }
                return [];
            };


            $scope.isSegmentVisible = function (segment) {
                if (segment.referencers) {
                    for (var i = 0; i < segment.referencers.length; i++) {
                        var segRef = segment.referencers[i];
                        if (!$scope.visible(segRef)) {
                            return false;
                        }
                    }
                }
                return true;
            };

            $scope.constraintExits = function (contraint, contraints) {
                if (contraints.length > 0) {
                    for (var i = 0; i < contraints.length; i++) {
                        var c = contraints[i];
                        if (c.constraintId === contraint.constraintId) {
                            return true;
                        }
                    }
                }
                return false;
            };


            $scope.processElement = function (element, parent) {
                try {
                    if (element.type === "GROUP") {
                        $scope.processGroup(element, parent);
                    } else if (element.type === "SEGMENT_REF") {
                        $scope.processSegRef(element, parent);
                    } else if (element.type === "SEGMENT") {
                        $scope.processSegment(element, parent);
                    } else if (element.type === "FIELD") {
                        $scope.processField(element, parent);
                    } else if (element.type === "COMPONENT") {
                        $scope.processComponent(element, parent);
                    } else if (element.type === "DATATYPE") {
                        $scope.processDatatype(element, parent);
                    }
                } catch (e) {
                    throw e;
                }
            };

            $scope.processConstraints = function (element, parent) {
                if (element.predicates && element.predicates.length > 0) {
                    for (var i = 0; i < element.predicates.length; i++) {
                        if (!$scope.constraintExits(element.predicates[i], $scope.predicates)) {
                            $scope.predicates.push(element.predicates[i]);
                        }
                    }
                }
                if (element.conformanceStatements && element.conformanceStatements.length > 0) {
                    for (var i = 0; i < element.conformanceStatements.length; i++) {
                        if (!$scope.constraintExits(element.conformanceStatements[i], $scope.confStatements)) {
                            $scope.confStatements.push(element.conformanceStatements[i]);
                        }
                    }
                }
            };

            $scope.processDatatype = function (datatype, fieldOrComponent) {
                $scope.processConstraints(datatype, fieldOrComponent);
                angular.forEach(datatype.children, function (component) {
                    $scope.processComponent(component, datatype, fieldOrComponent);
                });
                datatype.children = $filter('orderBy')(datatype.children, 'position');
            };

            $scope.processSegRef = function (segRef, parent) {
                $scope.processConstraints(segRef, parent);
                segRef.position = parseInt(segRef.position);
                if (parent) {
                    $scope.parentsMap[segRef.id] = parent;
                }
                var segment = $scope.model.segments[segRef.ref];
                $scope.processSegment(segment, segRef);
            };


            $scope.processGroup = function (group, parent) {
                $scope.processConstraints(group, parent);
                group.position = parseInt(group.position);
                $scope.parentsMap[group.id] = parent;
                if (group.children) {
                    angular.forEach(group.children, function (segmentRefOrGroup) {
                        $scope.processElement(segmentRefOrGroup, group);
                    });
                    group.children = $filter('orderBy')(group.children, 'position');
                }
            };


            $scope.processSegment = function (segment, parent) {
                $scope.processConstraints(segment, parent);
                if (!segment.referencers)
                    segment.referencers = [];
                if (segment.referencers.indexOf(parent) === -1) {
                    segment.referencers.push(parent);
                }
                if ($scope.segments.indexOf(segment) === -1) {
                    segment["path"] = segment["name"];
                    $scope.segments.push(segment);
                    angular.forEach(segment.children, function (field) {
                        $scope.processField(field, segment);
                    });
                    segment.children = $filter('orderBy')(segment.children, 'position');
                }
            };


            $scope.processField = function (field, parent) {
                $scope.processConstraints(field, parent);
                field.position = parseInt(field.position);
                $scope.parentsMap[field.id] = parent;
                field["path"] = parent.path + "-" + field.position;
                var dt = field.datatype;
                if (dt === 'varies') {
                    var dynamicMaps = parent.dynamicMaps && parent.dynamicMaps != null && parent.dynamicMaps[field.position] != null ? parent.dynamicMaps[field.position] : null;
                    field.children = [];
                    if (dynamicMaps != null) {
                        dynamicMaps = $filter('orderBy')(dynamicMaps);
                        angular.forEach(dynamicMaps, function (id) {
                            var datatype = $scope.model.datatypes[id];
                            if (datatype != null && datatype != undefined) {
                                field.children.push(datatype);
                                $scope.processDatatype(datatype, field);
                            }
                        });
                    }
                } else {
                    $scope.processDatatype($scope.model.datatypes[field.datatype], field);
                }
            };


            $scope.processComponent = function (component, datatype, fieldOrComponent) {
                $scope.processConstraints(component, parent);
                component.position = parseInt(component.position);
                $scope.parentsMap[component.id] = datatype;
                $scope.processDatatype($scope.model.datatypes[component.datatype], component);
            };


            $scope.initAll = function () {
                $scope.nodeData = [];
                $scope.confStatements = [];
                $scope.predicates = [];
                $scope.segments = [];
                $scope.datatypes = [];
                $scope.parentsMap = [];
                $scope.componentsParentMap = [];
                $scope.model = null;
                $rootScope.pvNodesMap = {};
                $scope.tmpConfStatements = [].concat($scope.confStatements);
            };

            $scope.$on($scope.type + ':profileLoaded', function (event, profile) {
                $scope.model = null;
                $scope.loading = true;
                $scope.options.collapse = true;
                if (profile && profile.id != null) {
                    $scope.profile = profile;
                    $scope.profileService.getJson($scope.profile.id).then(function (jsonObject) {
                        $scope.initAll();
                        $scope.model = angular.fromJson(jsonObject);
                        angular.forEach($scope.model.message.children, function (segmentRefOrGroup) {
                            $scope.processElement(segmentRefOrGroup);
                        });
                        angular.forEach($scope.model.datatypes, function (value, key) {
                            $scope.datatypes.push(value);
                        });
                        $scope.datatypes = $filter('orderBy')($scope.datatypes, 'id');
                        $scope.getNodeContent($scope.model.message);
                        $scope.loading = false;
                    }, function (error) {
                        $scope.error = "Sorry, Cannot load the profile.";
                        $scope.loading = false;
                        $scope.initAll();
                        $scope.refresh();
                    });
                } else {
                    $scope.loading = false;
                    $scope.initAll();
                    $scope.refresh();
                }
            });

            $scope.children = function (node) {
                if (node && $scope.model != null) {
                    if (node.type === 'SEGMENT_REF') {
                        return $scope.children($scope.model.segments[node.ref]);
                    } else if (node.type === 'FIELD' || node.type === 'COMPONENT') {
                        return  node.datatype && node.datatype !== 'varies' && $scope.model.datatypes ? $scope.model.datatypes[node.datatype].children : node.children;
                    } else if (node.type === 'DATATYPE' || node.type == 'SEGMENT' || node.type === 'GROUP') {
                        return node.children;
                    }
                }
                return [];
            };

            $scope.getNodes = function (parent) {
                var children = [];
                if (!parent || parent == null) {
                    if ($scope.nodeData.type === 'SEGMENT' || $scope.nodeData.type === 'MESSAGE') {
                        children = $scope.nodeData.children;
                        if ($scope.nodeData.type === 'SEGMENT') {
                            angular.forEach(children, function (field) {
                                field.conformanceStatements = $scope.getSegmentLevelConfStatements(field);
                                field.predicates = $scope.getSegmentLevelPredicates(field);
                            });
                        } else if ($scope.nodeData.type === 'MESSAGE') {
                            angular.forEach(children, function (element) {
                                element.conformanceStatements = $scope.getMessageLevelConfStatements(element);
                                element.predicates = $scope.getMessageLevelConfStatements(element);
                            });
                        }
                    } else if ($scope.nodeData.type === 'DATATYPE') {
                        children = $scope.datatypes;
                    }
                } else {
                    children = $scope.children(parent);
                    if (parent.type === 'FIELD') {
                        children = angular.copy(children);
                        angular.forEach(children, function (child) {
                             child.type = parent.datatype === 'varies' ? 'DATATYPE' : 'COMPONENT';
                            child.path = parent.path + "." + child.position;
                            child.nodeParent = parent;
                            child.conformanceStatements = [];
                            child.predicates = [];
                            child.conformanceStatements = child.conformanceStatements.concat($scope.getSegmentLevelConfStatements(child));
                            child.predicates = child.predicates.concat($scope.getSegmentLevelPredicates(child));
                            child.conformanceStatements = child.conformanceStatements.concat($scope.getDatatypeLevelConfStatements(child));
                            child.predicates = child.predicates.concat($scope.getDatatypeLevelPredicates(child));

                            if ($scope.nodeData.type === 'MESSAGE') {
                                child.conformanceStatements = child.conformanceStatements.concat($scope.getMessageLevelConfStatements(child));
                                child.predicates = child.predicates.concat($scope.getMessageLevelPredicates(child));
                                child.conformanceStatements = child.conformanceStatements.concat($scope.getGroupLevelConfStatements(child));
                                child.predicates = child.predicates.concat($scope.getGroupLevelPredicates(child));
                            }

                        });
                    } else if (parent.type === 'COMPONENT') {
                        children = angular.copy(children);
                        angular.forEach(children, function (child) {
                             child.type = parent.datatype === 'varies' ? 'DATATYPE' : 'SUBCOMPONENT';
                            child.path = parent.path + "." + child.position;
                            child.nodeParent = parent;
                            child.conformanceStatements = [];
                            child.predicates = [];
                            child.conformanceStatements = child.conformanceStatements.concat($scope.getDatatypeLevelConfStatements(child));
                            child.predicates =  child.predicates.concat($scope.getDatatypeLevelPredicates(child));
                            if ($scope.nodeData.type === 'SEGMENT') {
                                child.conformanceStatements = child.conformanceStatements.concat($scope.getSegmentLevelConfStatements(child));
                                child.predicates = child.predicates.concat($scope.getSegmentLevelPredicates(child));
                            } else if ($scope.nodeData.type === 'MESSAGE') {
                                child.conformanceStatements = child.conformanceStatements.concat($scope.getSegmentLevelConfStatements(child));
                                child.predicates = child.predicates.concat($scope.getSegmentLevelPredicates(child));
                                child.conformanceStatements = child.conformanceStatements.concat($scope.getMessageLevelConfStatements(child));
                                child.predicates = child.predicates.concat($scope.getMessageLevelPredicates(child));
                                child.conformanceStatements = child.conformanceStatements.concat($scope.getGroupLevelConfStatements(child));
                                child.predicates = child.predicates.concat($scope.getGroupLevelPredicates(child));
                            }
                        });
                    } else if (parent.type === 'DATATYPE') {
                        children = angular.copy(children);
                        angular.forEach(children, function (child) {
                            child.type = 'COMPONENT';
                            child.path = child.position;
                            child.conformanceStatements = $scope.getDatatypeLevelConfStatements(child);
                            child.predicates = $scope.getDatatypeLevelPredicates(child);
                        });
                    } else if (parent.type === 'SEGMENT_REF' || parent.type === 'GROUP') {
                        children = angular.copy(children);
                        angular.forEach(children, function (child) {
                            child.nodeParent = parent;
                            child.conformanceStatements = $scope.getMessageLevelConfStatements(child);
                            child.predicates = $scope.getMessageLevelPredicates(child);
                            child.conformanceStatements = child.conformanceStatements.concat($scope.getGroupLevelConfStatements(child));
                            child.predicates =  child.predicates.concat($scope.getGroupLevelPredicates(child));
                            child.conformanceStatements = child.conformanceStatements.concat($scope.getSegmentLevelConfStatements(child));
                            child.predicates = child.predicates.concat($scope.getSegmentLevelPredicates(child));
                        });
                    }
                }
                return children;
            };

            $scope.params = new PvTreetableParams({
                getNodes: function (parent) {
                    return $scope.getNodes(parent);
                },
                shouldExpand: function (node) {
                    return $scope.nodeData.type === 'MESSAGE' && (node && node !== null && (node.type === 'SEGMENT_REF' || node.type === 'GROUP'));
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
                            return node.type === 'SEGMENT' ? 'SegmentReadTree.html' : node.type === 'FIELD' ? 'SegmentFieldReadTree.html' : node.type === 'DATATYPE' ? 'SegmentDatatypeReadTree.html' : 'SegmentComponentReadTree.html';
                        } else if ($scope.nodeData.type === 'MESSAGE') {
                            if (node.type === 'SEGMENT_REF') {
                                return 'MessageSegmentRefReadTree.html';
                            } else if (node.type === 'GROUP') {
                                return 'MessageGroupReadTree.html';
                            } else if (node.type === 'FIELD') {
                                return 'MessageFieldViewTree.html';
                            } else if (node.type === 'COMPONENT' || node.type === 'SUBCOMPONENT') {
                                return 'MessageComponentViewTree.html';
                            } else if (node.type === 'DATATYPE') {
                                return 'MessageDatatypeViewTree.html';
                            }
                        } else if ($scope.nodeData.type === 'DATATYPE') {
                            return node.type === 'DATATYPE' ? 'DatatypeReadTree.html' : node.type === 'COMPONENT' ? 'DatatypeComponentReadTree.html' : 'DatatypeSubComponentReadTree.html';
                        }
                    }
                },
                options: {
                    initialState: 'collapsed'
                }
            });

            $scope.refresh = function () {
                $rootScope.pvNodesMap = {};
                $scope.params.refreshWithState(!$scope.options.collapse ? 'expanded' : 'collapse');
            };

            $scope.hasRelevantChild = function (node) {
                if (node != undefined) {
                    var children = $scope.children(node);
                    if (children && children != null && children.length > 0) {
                        return true;
                    }
                }
                return false;
            };

            $scope.visible = function (node) {
                 return  node ? $scope.isRelevant(node) ? node.type == 'COMPONENT' || node.type === 'SUBCOMPONENT' ?  $scope.visible(node.nodeParent) : $scope.visible($scope.parentsMap[node.id]) : false:true;
            };

            $scope.getNodeContent = function (selectedNode) {
                if (selectedNode != null) {
                    $scope.csWidth = 0;
                    $scope.predWidth = 0;
                    $scope.confStatementsActive = false;
                    $scope.nodeData = selectedNode;
//                    $scope.options.collapse = selectedNode.type !== 'MESSAGE';
                    $scope.options.collapse = true;
                    $scope.refresh();
                    $timeout(function () {
                        $scope.predWidth = null;
                        $scope.tableWidth = null;
                        $scope.csWidth = null;
                        $scope.getCsWidth();
                        $scope.getPredWidth();
                    }, 100);

                }
//                $scope.setAllRelevance($scope.options.relevance);
            };

            $scope.getDatatypesNodesContent = function () {
                $scope.getNodeContent({children: $scope.datatypes, type: 'DATATYPE', name: 'Datatypes'});
            };

            $scope.setAllRelevance = function (value) {
                $scope.options.relevance = value;
//                if (value) {
//                    $scope.hideIndenters();
//                } else {
//                    $scope.showIndenters();
//                }
            };

            $scope.hideIndenters = function () {
                var branches = $('table.pvt tr.branch').not('.ng-hide');
                for (var i = 0; i < branches.length; i++) {
                    var branch = $(branches[i]);
                    var id = branch.attr('data-tt-id');
                    var node = $rootScope.pvNodesMap[id];
                    if (node && node !== null && !$scope.hasRelevantChild(node)) {
                        var a = $(branch[0]).find("td span.indenter a");
                        if (a) {
                            $(a[0]).hide();
                        }
                    }
                }
            };


            $scope.showIndenters = function () {
                var branches = $('table.pvt tr.branch');
                for (var i = 0; i < branches.length; i++) {
                    var branch = $(branches[i]);
                    var id = branch.attr('data-tt-id');
                    var node = $rootScope.pvNodesMap[id];
                    var a = $(branch[0]).find("td span.indenter a");
                    if (a) {
                        $(a[0]).show();
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
                        if (node && node !== null && !$scope.hasRelevantChild(node)) {
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
                var predicates = node.predicates;
                var html = "";
                if (predicates && predicates != null && predicates.length > 0) {
                    angular.forEach(predicates, function (predicate) {
                        html = html + "<p>" + predicate.description + "</p>";
                    });
                }
                return html;
            };

            $scope.getPredicatesAsOneLineString = function (node) {
                var predicates = node.predicates;
                var html = "";
                if (predicates && predicates != null && predicates.length > 0) {
                    angular.forEach(predicates, function (predicate) {
                        html = html + predicate.description;
                    });
                }
                return $sce.trustAsHtml(html);
            };

            $scope.filterConstraints = function (node, constraints) {
                if (constraints) {
                    return $filter('filter')(constraints, {constraintTarget: node.position + '[1]'}, true);
                }
                return null;
            };

            $scope.getMessageChildTargetPath = function (element) {
                if (element == null || element.type === "MESSAGE")
                    return "";
                var parent = element.type === 'COMPONENT' ? element.nodeParent : element.parent;
                var pTarget = $scope.getMessageChildTargetPath(parent);
                return pTarget === "" ? element.position + "[1]" : pTarget + "."
                    + element.position + "[1]";
            };

            $scope.getSegmentChildTargetPath = function (element) {
                if (element == null || element.type === "SEGMENT")
                    return "";
                var parent = element.type === 'COMPONENT' ? element.nodeParent : element.parent;
                var pTarget = $scope.getSegmentChildTargetPath(parent);
                return pTarget === "" ? element.position + "[1]" : pTarget + "."
                    + element.position + "[1]";
            };

            $scope.getDatatypeChildTargetPath = function (element) {
                if (element == null || element.type === "DATATYPE")
                    return "";
                var parent = element.parent;
                var pTarget = $scope.getDatatypeChildTargetPath(parent);
                return pTarget === "" ? element.position + "[1]" : pTarget + "."
                    + element.position + "[1]";
            };

            $scope.getGroupChildTargetPath = function (element, group) {
                if (element == null || (element.type === "GROUP" && element.id === group.id))
                    return "";
                var parent = element.parent;
                var pTarget = $scope.getGroupChildTargetPath(parent);
                return pTarget === "" ? element.position + "[1]" : pTarget + "."
                    + element.position + "[1]";
            };


            $scope.getGroupLevelConfStatements = function (element) {
                if (element.type === 'MESSAGE')
                    return [];
                var group = $scope.getGroup(element) ; // element direct group
                var conformanceStatements = $scope.getGroupLevelConfStatementsByGroup(element, group);
                while ((group = $scope.getGroup(group)) != null) { // go through all the grand parent groups
                    conformanceStatements.concat($scope.getGroupLevelConfStatementsByGroup(element, group));
                }
                return conformanceStatements;
            };

            $scope.getGroupLevelConfStatementsByGroup = function (element, group) {
                var conformanceStatements = [];
                if (group != null) {
                    if (group.conformanceStatements != null && group.conformanceStatements.length > 0) {
                        var targetPath = $scope.getGroupChildTargetPath(element, group);
                        if (targetPath !== "") {
                            angular.forEach(group.conformanceStatements, function (cs) {
                                if (cs.constraintTarget === targetPath) {
                                    conformanceStatements.push(cs);
                                }
                            });
                        }
                    }
                }
                return conformanceStatements;
            };

            $scope.getGroupLevelPredicates = function (element) {
                if (element.type === 'MESSAGE')
                    return [];
                var group = $scope.getGroup(element) ; // element direct group
                if(group != null){
                    var predicates = $scope.getGroupLevelPredicatesByGroup(element, group);
                    while ((group = $scope.getGroup(group)) != null) { // go through all the grand parent groups
                        predicates.concat($scope.getGroupLevelPredicatesByGroup(element, group));
                    }
                    return predicates;
                }
                return [];
            };

            $scope.getGroupLevelPredicatesByGroup = function (element, group) {
                var predicates = [];
                if (group != null) {
                    if (group.predicates != null && group.predicates.length > 0) {
                        var targetPath = $scope.getGroupChildTargetPath(element, group);
                        if (targetPath !== "") {
                            angular.forEach(group.predicates, function (predicate) {
                                if (predicate.constraintTarget === targetPath) {
                                    predicates.push(predicate);
                                }
                            });
                        }
                    }
                }
                return predicates;
            };



            $scope.getMessageLevelConfStatements = function (element) {
                var conformanceStatements = [];
                if ($scope.model.message.conformanceStatements != null && $scope.model.message.conformanceStatements.length > 0) {
                    var targetPath = $scope.getMessageChildTargetPath(element);
                    if (targetPath !== "") {
                        angular.forEach($scope.model.message.conformanceStatements, function (cs) {
                            if (cs.constraintTarget === targetPath) {
                                conformanceStatements.push(cs);
                            }
                        });
                    }
                }
                return conformanceStatements;
            };

            $scope.getMessageLevelPredicates = function (element) {
                var predicates = [];
                if ($scope.model.message.predicates != null && $scope.model.message.predicates.length > 0) {
                    var targetPath = $scope.getMessageChildTargetPath(element);
                    if (targetPath !== "") {
                        angular.forEach($scope.model.message.predicates, function (pred) {
                            if (p.constraintTarget === targetPath) {
                                predicates.push(pred);
                            }
                        });
                    }
                }
                return predicates;
            };

            $scope.getSegment = function (element) {
                if (element.type === 'COMPONENT') {
                     return $scope.getSegment(element.nodeParent);
                } else if (element.type === 'FIELD') { // find the segment
                   return $scope.parentsMap[element.id];
                }
                return null;
             };

            $scope.getGroup = function (element) {
                if(element != null) {
                    if (element.type === 'FIELD') {
                        return $scope.getGroup(element.nodeParent);
                    } else if (element.type === 'COMPONENT') {
                        return $scope.getGroup(element.nodeParent);
                    } else if (element.type === 'SEGMENT_REF') { // find the segment
                        return element.parent;
                    } else if (element.type === 'GROUP') { // find the segment
                        return element.parent;
                    }
                }
                return null;
             };


            $scope.getSegmentLevelPredicates = function (element) {
                var segment = $scope.getSegment(element); // segment
                var predicates = [];
                if (segment != null && segment.predicates && segment.predicates != null && segment.predicates.length > 0) {
                    var targetPath = $scope.getSegmentChildTargetPath(element);
                    if (targetPath !== "") {
                        angular.forEach(segment.predicates, function (pred) {
                            if (pred.constraintTarget === targetPath) {
                                predicates.push(pred);
                            }
                        });
                    }
                }
                return predicates;
            };


            $scope.getSegmentLevelConfStatements = function (element) {
                var segment = $scope.getSegment(element); // segment
                var confStatements = [];
                if (segment != null && segment.conformanceStatements && segment.conformanceStatements != null && segment.conformanceStatements.length > 0) {
                    var targetPath = $scope.getSegmentChildTargetPath(element);
                    if (targetPath !== "") {
                        angular.forEach(segment.conformanceStatements, function (confStat) {
                            if (confStat.constraintTarget === targetPath) {
                                confStatements.push(confStat);
                            }
                        });
                    }
                }
                return confStatements;
            };

            $scope.getDatatypeLevelPredicates = function (element) {
                var datatype = $scope.parentsMap[element.id];
                var predicates = [];
                if (datatype && datatype != null && datatype.predicates.length > 0) {
                    var targetPath = $scope.getDatatypeChildTargetPath(element);
                    if (targetPath !== "") {
                        angular.forEach(datatype.predicates, function (pred) {
                            if (pred.constraintTarget === targetPath) {
                                predicates.push(pred);
                            }
                        });
                    }
                }
                return predicates;
            };

            $scope.getDatatypeLevelConfStatements = function (element) {
                var datatype = $scope.parentsMap[element.id];
                var confStatements = [];
                if (datatype && datatype != null && datatype.conformanceStatements.length > 0) {
                    var targetPath = $scope.getDatatypeChildTargetPath(element);
                    if (targetPath !== "") {
                        angular.forEach(datatype.conformanceStatements, function (confStat) {
                            if (confStat.constraintTarget === targetPath) {
                                confStatements.push(confStat);
                            }
                        });
                    }
                }
                return confStatements;
            };


            $scope.getConfStatementsAsMultipleLinesString = function (node) {
                var confStatements = node.conformanceStatements;
                var html = "";
                if (confStatements && confStatements != null && confStatements.length > 0) {
                    angular.forEach(confStatements, function (conStatement) {
                        html = html + "<p>" + conStatement.constraintId + " : " + conStatement.description + "</p>";
                    });
                }
                return html;
            };

            $scope.getConfStatementsAsOneLineString = function (node, constraints) {
                var confStatements = node.conformanceStatements;
                var html = "";
                if (confStatements && confStatements != null && confStatements.length > 0) {
                    angular.forEach(confStatements, function (conStatement) {
                        html = html + conStatement.constraintId + " : " + conStatement.description;
                    });
                }
                return $sce.trustAsHtml(html);
            };


            $scope.scrollbarWidth = $rootScope.getScrollbarWidth();


            $scope.getTableWidth = function () {
                if ($scope.tableWidth === null) {
                    $scope.tableWidth = $("#executionPanel").width();
                }
                return $scope.tableWidth;
            };

            $scope.getCsWidth = function () {
                if ($scope.csWidth === null) {
                    var tableWidth = $scope.getTableWidth();
                    if (tableWidth > 0) {
                        var otherColumsWidth = !$scope.nodeData || $scope.nodeData === null || $scope.nodeData.type === 'MESSAGE' ? 700 : 950;
                        var left = tableWidth - otherColumsWidth;
                        $scope.csWidth = {"width": 2 * parseInt(left / 3) + "px"};
                    }
                }
                return $scope.csWidth;
            };

            $scope.getPredWidth = function () {
                if ($scope.predWidth === null) {
                    var tableWidth = $scope.getTableWidth();
                    if (tableWidth > 0) {
                        var otherColumsWidth = !$scope.nodeData || $scope.nodeData === null || $scope.nodeData.type === 'MESSAGE' ? 700 : 950;
                        var left = tableWidth - otherColumsWidth;
                        $scope.predWidth = {"width": parseInt(left / 3) + "px"};
                    }
                }
                return $scope.predWidth;
            };


            $scope.getSegmentRefNodeName = function (node) {
                return node && $scope.model.segments[node.ref] ? node.position + "." + $scope.model.segments[node.ref].name + ":" + $scope.model.segments[node.ref].description : '';
            };

            $scope.getGroupNodeName = function (node) {
                return node.position + "." + node.name;
            };

            $scope.getFieldNodeName = function (node) {
                return node.path + ":" + node.name;
            };

            $scope.getComponentNodeName = function (node) {
                return node.path + "." + node.name;
            };

            $scope.getDatatypeNodeName = function (node) {
                return node.position + "." + node.name;
            };

            $scope.getDatatypeNodeName2 = function (node) {
                return node.id;
            };

            $scope.isSubDT = function (component) {
                return component.type === 'COMPONENT' && $scope.parentsMap && $scope.parentsMap[component.id] && $scope.parentsMap[component.id].type === 'COMPONENT';
            };


        }
        ])
    ;


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

            this.shoudlExpand = function (node) {
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
                    if (['getNodes', 'getTemplate', 'options', 'getRelevance', 'toggleRelevance', 'toggleConcise', 'getConcise', 'isRelevant', 'shouldExpand'].indexOf(key) > -1) {
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

//        $scope.addRelevantChildren = function (parentElement, shouldExpand) {
//            var parentNode = parentElement && parentElement.scope() ? parentElement.scope().node : null;
//            var parentId = parentElement ? parentElement.data('ttId') : null;
//
//            if (parentElement) {
//                parentElement.scope().loading = true;
//            }
//
//            var data = params.getNodes(parentNode);
//            var elementPromises = [];
//            angular.forEach(data, function (node) {
//                //if (params.isRelevant(node)) {
//                    elementPromises.push($scope.compileElement(node, parentId, parentNode));
//                //}
//            });
//
//            $q.all(elementPromises).then(function (newElements) {
//                var parentTtNode = parentId != null ? table.treetable("node", parentId) : null;
//                $element.treetable('loadBranch', parentTtNode, newElements);
//                if (params.shouldExpand(parentNode)) {
//                    angular.forEach(newElements, function (el) {
//                        $scope.addChildren($(el), shouldExpand);
//                    });
//                }
//                if (parentElement && parentElement.scope()) {
//                    parentElement.scope().loading = false;
//                }
//            });
//        };


        /**
         * Callback for onNodeExpand to add nodes.
         */
        $scope.onNodeExpand = function () {
            if (this.row.scope().loading) return; // make sure we're not already loading
            table.treetable('unloadBranch', this); // make sure we don't double-load
            $scope.addChildren(this.row, $scope.shouldExpand());
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
                node: '='
            },
            link: function (scope, element, attrs) {
                var branch = angular.isDefined(scope.isBranch) ? scope.isBranch : true;

                // Look for a parent set by the tt-tree directive if one isn't explicitly set
                var parent = angular.isDefined(scope.parent) ? scope.parent : scope.$parent._ttParentId;
                var id = ttNodeCounter;
                element.attr('data-tt-id', ttNodeCounter++);
                element.attr('data-tt-branch', branch);
                element.attr('data-tt-parent-id', parent);
//                var node = angular.isDefined(scope.node) ? scope.node : null;
//                if (node != null) {
//                    $rootScope.pvNodesMap[node] = ttNodeCounter;
//                }
            }
        }
    }]);


})
(angular);