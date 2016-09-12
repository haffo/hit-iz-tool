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
            $scope.confStatementsActive = false;
            $scope.nodeData = [];
            $scope.loading = false;
            $scope.error = null;
            $scope.profile = null;
            $scope.profileService = new ProfileService();
            $scope.loading = false;
            $scope.loadingTabContent = false;
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
            $rootScope.pvNodesMap = {};
            $scope.model = null;
            $scope.onlyRelevantElementsModel = null;
            $scope.allElementsModel = null;

            /**
             *
             * @param collection
             * @returns {*}
             */
            var sortByPosition = function (collection) {
                var sorted = _.sortBy(collection, function (element) {
                    return element.position;
                });
                return sorted;
            };

            /**
             *
             * @param predicates
             * @param targetPath
             * @returns {Array}
             */
            var findConstraintsByTargetPath = function (predicates, targetPath) {
                var rs = [];
                if (predicates != null && predicates.length > 0 && targetPath !== "" && targetPath !== null) {
                    rs = _.filter(predicates, function (predicate) {
                        return fixPath(predicate.constraintTarget) === fixPath(targetPath);
                    });
                }
                return rs;
            };

            /**
             *
             * @param targetPath
             * @returns {*}
             */
            var fixPath = function (targetPath) {
                var path = targetPath;
                if (targetPath != null && targetPath != "") {
                    var sections = targetPath.split(".");
                    if (sections != null && sections.length > 0) {
                        path = null;
                        _.each(sections, function (section) {
                            var res = section;
                            if (section.indexOf("[") != -1 && section.indexOf("]") != -1) {
                                var d = section.split("["); // 23, 1]
                                res = d[0] + "[*]";
                            }
                            path = path != null ? path + "." + res : res;
                        });
                    }
                }
                return path;
            };

            /**
             *
             * @param value
             */
            $scope.setAllConcise = function (value) {
                $scope.loadingTabContent = true;
                $timeout(function () {
                    $scope.options.concise = value;
                    $scope.loadingTabContent = false;
                });
            };


            /**
             *
             * @param constraints
             * @returns {string}
             */
            $scope.getConstraintsAsString = function (constraints) {
                var str = '';
                for (var index in constraints) {
                    str = str + "<p style=\"text-align: left\">" + constraints[index].id + " - " + constraints[index].description + "</p>";
                }
                return str;
            };

            /**
             *
             * @param node
             * @returns {boolean}
             */
            $scope.isBranch = function (node) {
                var children = getNodeChildren(node);
                return children != null && children.length > 0;
            };

            /**
             *
             * @param id
             */
            $scope.showRefSegment = function (id) {
                if ($scope.model.segmentList.length > 0 && id)
                    for (var i = 1; i < $scope.model.segmentList.length; i++) {
                        var element = $scope.model.segmentList[i];
                        if (element.id == id) {
                            $scope.getTabContent(element);
                        }
                    }
            };

            /**
             *
             * @param node
             * @returns {boolean}
             */
            $scope.isRelevant = function (node) {
                return (node === undefined || !$scope.options.relevance) ? true: isNodeUsageRelevant(node);
            };

            var isNodeUsageRelevant = function (node) {
                if (node.hide == undefined || !node.hide || node.hide === false) {
                    if (node.selfPredicates && node.selfPredicates != null && node.selfPredicates.length > 0) {
                        return  node.selfPredicates[0].trueUsage === "R" || node.selfPredicates[0].trueUsage === "RE" || node.selfPredicates[0].falseUsage === "R" || node.selfPredicates[0].falseUsage === "RE";
                    } else {
                        return node.usage == null || !node.usage || node.usage === "R" || node.usage === "RE";
                    }
                } else {
                    return false;
                }
            };



            /**
             *
             * @param collapse
             */
            $scope.collapseAll = function (collapse) {
                $scope.options.collapse = collapse;
                refresh();
            };

            /**
             *
             * @param tableId
             */
            $scope.showValueSetDefinition = function (tableId) {
                $rootScope.$emit($scope.type + ':showValueSetDefinition', tableId);
            };

            /**
             *
             * @param tableStr
             * @returns {*}
             */
            $scope.getValueSet = function (tableStr) {
                if (tableStr && tableStr != null) {
                    return tableStr.split(":");
                }
                return [];
            };


            /**
             *
             * @param segment
             * @returns {boolean}
             */
            $scope.isSegmentVisible = function (segment) {
                if (segment.referencers) {
                    for (var i = 0; i < segment.referencers.length; i++) {
                        var segRef = segment.referencers[i];
                        var relevent = segRef && segRef != null && (!$scope.options.relevance ? true: segRef.usageRelevent);
                        if (!relevent) {
                            return false;
                        }
                    }
                }
                return true;
            };

            /**
             *
             * @param datatype
             * @returns {boolean}
             */
            $scope.isDatatypeVisible = function (datatype) {
                if (datatype.referencers) {
                    for (var i = 0; i < datatype.referencers.length; i++) {
                        var referencer = datatype.referencers[i];
                        if (!$scope.visible(referencer)) {
                            return false;
                        }
                    }
                }
                return true;
            };

            /**
             *
             * @param contraint
             * @param contraints
             * @returns {boolean}
             */
            var constraintExits = function (contraint, contraints) {
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

            /**
             *
             * @param element
             * @param parent
             */
            var processElement = function (element, parent) {
                try {
                    if (element.type === "GROUP") {
                        processGroup(element, parent);
                    } else if (element.type === "SEGMENT_REF") {
                        processSegRef(element, parent);
                    } else if (element.type === "SEGMENT") {
                        processSegment(element, parent);
                    } else if (element.type === "FIELD") {
                        processField(element, parent);
                    } else if (element.type === "COMPONENT") {
                        processComponent(element, parent);
                    } else if (element.type === "DATATYPE") {
                        processDatatype(element, parent);
                    }
                } catch (e) {
                    throw e;
                }
            };

            /**
             *
             * @param element
             * @param parent
             */
            var processConstraints = function (element, parent) {
                if (element.predicates && element.predicates.length > 0) {
                    for (var i = 0; i < element.predicates.length; i++) {
                        if (!constraintExits(element.predicates[i], $scope.model.predicateList)) {
                            $scope.model.predicateList.push(element.predicates[i]);
                        }
                    }
                }
                if (element.conformanceStatements && element.conformanceStatements.length > 0) {
                    for (var i = 0; i < element.conformanceStatements.length; i++) {
                        if (!constraintExits(element.conformanceStatements[i], $scope.model.confStatementList)) {
                            $scope.model.confStatementList.push(element.conformanceStatements[i]);
                        }
                    }
                }
            };

            $scope.collectSelfConstraints = function (element, parent) {
                if (element.selfPredicates && element.selfPredicates.length > 0) {
                    for (var i = 0; i < element.selfPredicates.length; i++) {
                        if (!constraintExits(element.selfPredicates[i], $scope.model.predicateList)) {
                            $scope.model.predicateList.push(element.selfPredicates[i]);
                        }
                    }
                }
                if (element.selfConformanceStatements && element.selfConformanceStatements.length > 0) {
                    for (var i = 0; i < element.selfConformanceStatements.length; i++) {
                        if (!constraintExits(element.selfConformanceStatements[i], $scope.model.confStatementList)) {
                            $scope.model.confStatementList.push(element.selfConformanceStatements[i]);
                        }
                    }
                }
            };



            /**
             *
             * @param datatype
             * @param fieldOrComponent
             */
            var processDatatype = function (datatype, fieldOrComponent) {
               processConstraints(datatype, fieldOrComponent);
                if (!datatype.referencers)
                    datatype.referencers = [];
                if (datatype.referencers.indexOf(fieldOrComponent) === -1) {
                    datatype.referencers.push(fieldOrComponent);
                }
                if ($scope.model.datatypeList.indexOf(datatype) === -1) {
                    $scope.model.datatypeList.push(datatype);
                    if (datatype.children && datatype.children != null && datatype.children.length > 0) {
                        angular.forEach(datatype.children, function (component) {
                           processComponent(component, datatype, fieldOrComponent);
                        });
                        datatype.children = sortByPosition(datatype.children);
                    }
                }
            };

            /**
             *
             * @param segRef
             * @param messageOrGroup
             */
            var processSegRef = function (segRef, messageOrGroup) {
                $scope.collectSelfConstraints(segRef, messageOrGroup);
                segRef.position = parseInt(segRef.position);
                segRef.usageRelevent = messageOrGroup != undefined && messageOrGroup != null ? messageOrGroup.usageRelevent && isNodeUsageRelevant(segRef) : isNodeUsageRelevant(segRef);
                if (messageOrGroup && messageOrGroup != null) {
                    $scope.parentsMap[segRef.id] = messageOrGroup;
                }
                var segment = $scope.model.segments[segRef.ref];
               processSegment(segment, segRef);
            };

            /**
             *
             * @param group
             * @param parent
             */
            var processGroup = function (group, parent) {
               processConstraints(group, parent);
                group.position = parseInt(group.position);
                $scope.parentsMap[group.id] = parent;
                group.usageRelevent = parent != undefined &&  parent != null ? parent.usageRelevent && isNodeUsageRelevant(group):isNodeUsageRelevant(group);
                if (group.children && group.children != null && group.children.length > 0) {
                    angular.forEach(group.children, function (segmentRefOrGroup) {
                       processElement(segmentRefOrGroup, group);
                    });
                    group.children = sortByPosition(group.children);
                }
            };


            /**
             *
             * @param segment
             * @param parent
             */
            var processSegment = function (segment, parent) {
               processConstraints(segment, parent);
                if (!segment.referencers)
                    segment.referencers = [];
                if (segment.referencers.indexOf(parent) === -1) {
                    segment.referencers.push(parent);
                }
                if ($scope.model.segmentList.indexOf(segment) === -1) {
                    segment["path"] = segment["name"];
                    $scope.model.segmentList.push(segment);
                    if (segment.children && segment.children.length > 0) {
                        angular.forEach(segment.children, function (field) {
                           processField(field, segment);
                        });
                        segment.children = sortByPosition(segment.children);
                    }
                }
            };


            /**
             *
             * @param field
             * @param parent
             */
            var processField = function (field, parent) {
                $scope.collectSelfConstraints(field, parent);
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
                               processDatatype(datatype, field);
                            }
                        });
                    }
                } else {
                   processDatatype($scope.model.datatypes[field.datatype], field);
                }
            };

            /**
             *
             * @param component
             * @param datatype
             * @param fieldOrComponent
             */
            var processComponent = function (component, datatype, fieldOrComponent) {
               processConstraints(component, datatype);
                component.position = parseInt(component.position);
                $scope.parentsMap[component.id] = datatype;
               processDatatype($scope.model.datatypes[component.datatype], component);
            };

            /**
             *
             */
            var processMessage = function () {
                angular.forEach($scope.model.message.children, function (segmentRefOrGroup) {
                   processElement(segmentRefOrGroup);
                });
                $scope.model.message.children = $filter('orderBy')($scope.model.message.children, 'position');
                if ($scope.options.relevance) {
                    $scope.onlyRelevantElementsModel = $scope.model;
                } else {
                    $scope.allElementsModel = $scope.model;
                }
            };


            /**
             *
             */
            var initAll = function () {
                $scope.parentsMap = [];
                $scope.componentsParentMap = [];
                $scope.model = null;
                $rootScope.pvNodesMap = {};
                $scope.onlyRelevantElementsModel = null;
                $scope.allElementsModel = null;
            };


            $scope.$on($scope.type + ':profileLoaded', function (event, profile) {
                $scope.model = null;
                $scope.loading = true;
                $scope.options.collapse = true;
                $scope.nodeData = [];
                $scope.loadingTabContent = false;
                if (profile && profile.id != null) {
                    $scope.profile = profile;
                    $scope.profileService.getJson($scope.profile.id).then(function (jsonObject) {
                        initAll();
                        $scope.originalModel = angular.fromJson(jsonObject);
                        $scope.executeRelevance();
                        $scope.getTabContent($scope.model.message);
                        $scope.loading = false;
                    }, function (error) {
                        $scope.error = "Sorry, Cannot load the profile.";
                        $scope.loading = false;
                        initAll();
                        refresh();
                    });
                } else {
                    $scope.loading = false;
                    initAll();
                    refresh();
                }
            });

            /**
             *
             */
            $scope.executeRelevance = function () {
                    if ($scope.options.relevance && $scope.onlyRelevantElementsModel != null) {
                        $scope.model = angular.copy($scope.onlyRelevantElementsModel);
                    } else if (!$scope.options.relevance && $scope.allElementsModel != null) {
                        $scope.model = angular.copy($scope.allElementsModel);
                    } else {
                        initAll();
                        $scope.model = angular.copy($scope.originalModel);
                        if ($scope.model != null) {
                            $scope.model.datatypeList = [];
                            $scope.model.segmentList = [];
                            $scope.model.predicateList = [];
                            $scope.model.confStatementList = [];
                            $scope.model.tmpConfStatementList = [].concat($scope.model.confStatementList);
                           processMessage();
                        }
                     }
            };

            /**
             *
             * @param node
             * @returns {*}
             */
            var getNodeChildren = function (node) {
                if (node && $scope.model != null && $scope.model.segments != null) {
                    if (node.type === 'SEGMENT_REF') {
                        return getNodeChildren($scope.model.segments[node.ref]);
                    } else if (node.type === 'FIELD' || node.type === 'COMPONENT') {
                        return  node.datatype && node.datatype !== 'varies' && $scope.model.datatypes ? $scope.model.datatypes[node.datatype].children : node.children;
                    } else if (node.type === 'DATATYPE' || node.type == 'SEGMENT' || node.type === 'GROUP') {
                        return node.children;
                    }
                }
                return [];
            };

            /**
             *
             * @param removeCandidates
             * @param all
             * @returns {*}
             */
            var removeNotVisibles = function (removeCandidates, all) {
                if (removeCandidates.length > 0 && all != null && all.length > 0) {
                    angular.forEach(removeCandidates, function (removeCandidate) {
                        var index = all.indexOf(removeCandidate);
                        all.splice(index, 1);
                    });
                }
                return all;
            }

            /**
             *
             * @param parent
             * @param removeCandidates
             * @returns {*}
             */
            var processFieldChildrenConstraints = function (parent, removeCandidates) {
                var children = angular.copy(getNodeChildren(parent));
                angular.forEach(children, function (child) {
                    child.type = parent.datatype === 'varies' ? 'DATATYPE' : 'COMPONENT';
                    child.path = parent.path + "." + child.position;
                    child.nodeParent = parent;
                    child.selfConformanceStatements = [];
                    child.selfPredicates = [];
                    child.selfConformanceStatements = child.selfConformanceStatements.concat(getSegmentLevelConfStatements(child));
                    child.selfPredicates = child.selfPredicates.concat(getSegmentLevelPredicates(child));
                    child.selfConformanceStatements = child.selfConformanceStatements.concat(getDatatypeLevelConfStatements(child));
                    child.selfPredicates = child.selfPredicates.concat(getDatatypeLevelPredicates(child));
                    if ($scope.nodeData.type === 'MESSAGE') {
                        child.selfConformanceStatements = child.selfConformanceStatements.concat(getMessageLevelConfStatements(child));
                        child.selfPredicates = child.selfPredicates.concat(getMessageLevelPredicates(child));
                        child.selfConformanceStatements = child.selfConformanceStatements.concat(getGroupLevelConfStatements(child));
                        child.selfPredicates = child.selfPredicates.concat(getGroupLevelPredicates(child));
                    }
                    if (!$scope.visible(child)) {
                        removeCandidates.push(child);
                    }
                });
                return children;
            };

            /**
             *
             * @param parent
             * @param removeCandidates
             * @returns {*}
             */
            var processComponentChildrenConstraints = function (parent, removeCandidates) {
                var children = angular.copy(getNodeChildren(parent));
                angular.forEach(children, function (child) {
                    child.type = parent.datatype === 'varies' ? 'DATATYPE' : 'SUBCOMPONENT';
                    child.path = parent.path + "." + child.position;
                    child.nodeParent = parent;
                    child.selfConformanceStatements = [];
                    child.selfPredicates = [];
                    child.selfConformanceStatements = child.selfConformanceStatements.concat(getDatatypeLevelConfStatements(child));
                    child.selfPredicates = child.selfPredicates.concat(getDatatypeLevelPredicates(child));
                    if ($scope.nodeData.type === 'SEGMENT') {
                        child.selfConformanceStatements = child.selfConformanceStatements.concat(getSegmentLevelConfStatements(child));
                        child.selfPredicates = child.selfPredicates.concat(getSegmentLevelPredicates(child));
                    } else if ($scope.nodeData.type === 'MESSAGE') {
                        child.selfConformanceStatements = child.selfConformanceStatements.concat(getSegmentLevelConfStatements(child));
                        child.selfPredicates = child.selfPredicates.concat(getSegmentLevelPredicates(child));
                        child.selfConformanceStatements = child.selfConformanceStatements.concat(getMessageLevelConfStatements(child));
                        child.selfPredicates = child.selfPredicates.concat(getMessageLevelPredicates(child));
                        child.selfConformanceStatements = child.selfConformanceStatements.concat(getGroupLevelConfStatements(child));
                        child.selfPredicates = child.selfPredicates.concat(getGroupLevelPredicates(child));
                    }
                    if (!$scope.visible(child)) {
                        removeCandidates.push(child);
                    }
                });
                return children;
            };

            /**
             *
             * @param parent
             * @param removeCandidates
             * @returns {*}
             */
            var processDatatypeChildrenConstraints = function (parent, removeCandidates) {
                var children = angular.copy(getNodeChildren(parent));
                angular.forEach(children, function (child) {
                    child.type = 'COMPONENT';
                    child.path = child.position;
                    child.selfConformanceStatements = [];
                    child.selfPredicates = [];
                    child.selfConformanceStatements = child.selfConformanceStatements.concat(getDatatypeLevelConfStatements(child));
                    child.selfPredicates = child.selfPredicates.concat(getDatatypeLevelPredicates(child));
                    if (!$scope.visible(child)) {
                        removeCandidates.push(child);
                    }
                });
                return children;
            };

            /**
             *
             * @param parent
             * @param removeCandidates
             * @returns {*}
             */
            var processGroupChildrenConstraints = function (parent, removeCandidates) {
                var children = angular.copy(getNodeChildren(parent));
                angular.forEach(children, function (child) {
                    child.nodeParent = parent;
                    child.selfConformanceStatements = [];
                    child.selfPredicates = [];
                    child.selfConformanceStatements = child.selfConformanceStatements.concat(getGroupLevelConfStatements(child));
                    child.selfPredicates = child.selfPredicates.concat(getGroupLevelPredicates(child));
                    child.selfConformanceStatements = child.selfConformanceStatements.concat(getMessageLevelConfStatements(child));
                    child.selfPredicates = child.selfPredicates.concat(getMessageLevelPredicates(child));
                    if (!$scope.visible(child)) {
                        removeCandidates.push(child);
                    }

                });
                return children;
            };

            /**
             *
             * @param parent
             * @param removeCandidates
             * @returns {*}
             */
            var processSegmentRefChildrenConstraints = function (parent, removeCandidates) {
                var children = angular.copy(getNodeChildren(parent));
                angular.forEach(children, function (child) {
                    child.nodeParent = parent;
                    child.selfConformanceStatements = [];
                    child.selfPredicates = [];
                    child.selfConformanceStatements = child.selfConformanceStatements.concat(getGroupLevelConfStatements(child));
                    child.selfPredicates = child.selfPredicates.concat(getGroupLevelPredicates(child));
                    child.selfConformanceStatements = child.selfConformanceStatements.concat(getMessageLevelConfStatements(child));
                    child.selfPredicates = child.selfPredicates.concat(getMessageLevelPredicates(child));
                    child.selfConformanceStatements = child.selfConformanceStatements.concat(getSegmentLevelConfStatements(child));
                    child.selfPredicates = child.selfPredicates.concat(getSegmentLevelPredicates(child));
                    if (!$scope.visible(child)) {
                        removeCandidates.push(child);
                    }
                });
                return children;
            };

            /**
             *
             * @param nodeData
             * @param removeCandidates
             * @returns {*}
             */
            var processSegmentTabChildrenConstraints = function (nodeData, removeCandidates) {
                var children = nodeData.children;
                angular.forEach(children, function (child) {
                    child.selfConformanceStatements = [];
                    child.selfPredicates = [];
                    child.selfConformanceStatements = getSegmentLevelConfStatements(child);
                    child.selfPredicates = getSegmentLevelPredicates(child);
                    if (!$scope.visible(child)) {
                        removeCandidates.push(child);
                    }
                });
                return children;
            };

            /**
             *
             * @param nodeData
             * @param removeCandidates
             * @returns {*}
             */
            var processMessageTabChildrenConstraints = function (nodeData, removeCandidates) {
                var children = nodeData.children;
                angular.forEach(children, function (child) {
                    child.selfConformanceStatements = [];
                    child.selfPredicates = [];
                    child.selfConformanceStatements = getSegmentLevelConfStatements(child);
                    child.selfPredicates = getSegmentLevelPredicates(child);
                    if (!$scope.visible(child)) {
                        removeCandidates.push(child);
                    }
                });
                return children;
            };

            /**
             *
             * @returns {Array}
             */
            var processDataTypeTabChildrenConstraints = function () {
                var children = $scope.model.datatypeList;
                return children;
            };


            /**
             * return children of a node
             * @param parent: node to get the children of
             * @returns {Array}: collection of children nodes
             */
            $scope.getNodes = function (parent) {
                var removeCandidates = [];
                var children = [];
                if (!parent || parent == null) {
                    if ($scope.nodeData.type === 'SEGMENT' || $scope.nodeData.type === 'MESSAGE') {
                        if ($scope.nodeData.type === 'SEGMENT') {
                            children = processSegmentTabChildrenConstraints($scope.nodeData, removeCandidates);
                        } else if ($scope.nodeData.type === 'MESSAGE') {
                            children = processMessageTabChildrenConstraints($scope.nodeData, removeCandidates);
                        }
                    } else if ($scope.nodeData.type === 'DATATYPE') {
                        children = processDataTypeTabChildrenConstraints();
                    }
                } else {
                    if (parent.type === 'FIELD') {
                        children = processFieldChildrenConstraints(parent, removeCandidates);
                    } else if (parent.type === 'COMPONENT') {
                        children = processComponentChildrenConstraints(parent, removeCandidates);
                    } else if (parent.type === 'DATATYPE') {
                        children = processDatatypeChildrenConstraints(parent, removeCandidates);
                    } else if (parent.type === 'GROUP') {
                        children = processGroupChildrenConstraints(parent, removeCandidates);
                    } else if (parent.type === 'SEGMENT_REF') {
                        children = processSegmentRefChildrenConstraints(parent, removeCandidates);
                    }
                }
                return removeNotVisibles(removeCandidates, children);
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

            /**
             *
             */
            var refresh = function () {
                $rootScope.pvNodesMap = {};
                $scope.params.refreshWithState(!$scope.options.collapse ? 'expanded' : 'collapse');
            };

            /**
             *
             * @param node
             * @returns {boolean}
             */
            $scope.hasRelevantChild = function (node) {
                if (node != undefined) {
                    var children = $scope.getNodes(node);
                    if (children && children != null && children.length > 0) {
                        return true;
                    }
                }
                return false;
            };

            /**
             *
             * @param node
             * @returns {*|boolean}
             */
            $scope.visible = function (node) {
                return node && node != null && $scope.isRelevant(node);
            };

            /**
             *
             * @param selectedNode
             */
            $scope.getTabContent = function (selectedNode) {
                $scope.loadingTabContent = true;
                $timeout(function () {
                    if (selectedNode != null) {
                        $scope.csWidth = 0;
                        $scope.predWidth = 0;
                        $scope.confStatementsActive = false;
                        $scope.nodeData = selectedNode;
//                    $scope.options.collapse = selectedNode.type !== 'MESSAGE';
                        $scope.options.collapse = true;
                        refresh();
                        $scope.predWidth = null;
                        $scope.tableWidth = null;
                        $scope.csWidth = null;
                        getCsWidth();
                        getPredWidth();
                    }
                    $scope.loadingTabContent = false;
                });
            };

            /**
             *
             * @param name
             * @returns {*}
             */
            var findSegmentByName = function (name) {
                return _.find($scope.model.segmentList, function (segment) {
                    return segment.name == name;
                })
            };

            /**
             *
             */
            $scope.getDatatypesNodesContent = function () {
                $scope.getTabContent({children: $scope.model.datatypeList, type: 'DATATYPE', name: 'Datatypes'});
            };

            /**
             *
             * @param value
             */
            $scope.setAllRelevance = function (value) {
                $scope.options.relevance = value;
                $scope.executeRelevance();
            };
            /**
             *
             * @param value
             */
            $scope.loadContent = function () {
                    if (!$scope.confStatementsActive && $scope.nodeData != null) {
                        if ($scope.nodeData.name === 'FULL') {
                            $scope.getTabContent($scope.model.message);
                        } else if ($scope.nodeData.name === 'Datatypes') {
                            $scope.getDatatypesNodesContent();
                        } else {
                            var segment = findSegmentByName($scope.nodeData.name);
                            $scope.getTabContent(segment);
                        }
                    } else if ($scope.confStatementsActive) {
                        $scope.showConfStatements();
                    }
            };

            /**
             *
             */
            $scope.showConfStatements = function () {
                $scope.loadingTabContent = true;
                $timeout(function () {
                    $scope.confStatementsActive = true;
                    $scope.loadingTabContent = false;
                });
            };

            /**
             *
             * @param node
             * @returns {string}
             */
            $scope.getPredicatesAsMultipleLinesString = function (node) {
                var predicates = node.selfPredicates;
                var html = "";
                if (predicates && predicates != null && predicates.length > 0) {
                    angular.forEach(predicates, function (predicate) {
                        html = html + "<p>" + predicate.description + "</p>";
                    });
                }
                return html;
            };

            /**
             *
             * @param node
             * @returns {*}
             */
            $scope.getPredicatesAsOneLineString = function (node) {
                var predicates = node.selfPredicates;
                var html = "";
                if (predicates && predicates != null && predicates.length > 0) {
                    angular.forEach(predicates, function (predicate) {
                        html = html + predicate.description;
                    });
                }
                return $sce.trustAsHtml(html);
            };

            /**
             *
             * @param node
             * @param constraints
             * @returns {*}
             */
            $scope.filterConstraints = function (node, constraints) {
                if (constraints) {
                    return _.filter(constraints, function (constraint) {
                        return fixPath(constraint.constraintTarget) === fixPath(node.position + '[1]');
                    });
                }
                return null;
            };
            /**
             *
             * @param element
             * @returns {string}
             */
            var getMessageChildTargetPath = function (element) {
                if (element == null || element.type === "MESSAGE")
                    return "";
                var parent = element.type === 'COMPONENT' || element.type === 'FIELD' ? element.nodeParent : $scope.parentsMap[element.id]; //X
                var pTarget =getMessageChildTargetPath(parent);
                return pTarget === "" ? element.position + "[1]" : pTarget + "."
                    + element.position + "[1]";
            };

            /**
             *
             * @param element
             * @returns {string}
             */
            var getSegmentChildTargetPath = function (element) {
                if (element == null || element.type === "SEGMENT")
                    return "";
                var parent = element.type === 'COMPONENT' ? element.nodeParent : $scope.parentsMap[element.id]; //X
                var pTarget = getSegmentChildTargetPath(parent);
                return pTarget === "" ? element.position + "[1]" : pTarget + "."
                    + element.position + "[1]";
            };

            /**
             *
             * @param element
             * @returns {string}
             */
            var getDatatypeChildTargetPath = function (element) {
                if (element == null || element.type === "DATATYPE")
                    return "";
                var parent = $scope.parentsMap[element.id]; //X
                var pTarget = getDatatypeChildTargetPath(parent);
                return pTarget === "" ? element.position + "[1]" : pTarget + "."
                    + element.position + "[1]";
            };

            /**
             *
             * @param element
             * @param group
             * @returns {*}
             */
            var getGroupChildTargetPath = function (element, group) {
                if (!element || element == null || (element.type === "GROUP" && group && group != null && element.id === group.id))
                    return "";
                if (isDirectParent(element, group)) {
                    return getGroupDirectChildTargetPath(element);
                } else {
                    var parent = $scope.parentsMap[element.id];
                    var pTarget = getGroupChildTargetPath(parent, group);
                    return pTarget === "" ? getGroupDirectChildTargetPath(element) : pTarget + "."
                        + getGroupDirectChildTargetPath(element);
                }
            };

            /**
             *
             * @param element
             * @param group
             * @returns {boolean}
             */
            var isDirectParent = function (element, group) {
                return $scope.parentsMap[element.id] != undefined && $scope.parentsMap[element.id].id === group.id;
            };

            /**
             *
             * @param element
             * @returns {string}
             */
            var getGroupDirectChildTargetPath = function (element) {
                return element.position + "[1]";
            };

            /**
             *
             * @param element
             * @returns {*}
             */
            var getGroupLevelConfStatements = function (element) {
                if (element.type === 'MESSAGE')
                    return [];
                var group = getGroup(element); // element direct group
                var conformanceStatements = getGroupLevelConfStatementsByGroup(element, group);
                while ((group = getGroup(group)) != null) { // go through all the grand parent groups
                    conformanceStatements = conformanceStatements.concat(getGroupLevelConfStatementsByGroup(element, group));
                }
                return conformanceStatements;
            };

            /**
             *
             * @param element
             * @param group
             * @returns {Array}
             */
            var getGroupLevelConfStatementsByGroup = function (element, group) {
                var conformanceStatements = [];
                if (group != null) {
                    if (group.conformanceStatements != null && group.conformanceStatements.length > 0) {
                        var targetPath = getGroupChildTargetPath(element, group);
                        if (targetPath !== "") {
                            conformanceStatements = conformanceStatements.concat(findConstraintsByTargetPath(group.conformanceStatements, targetPath));
                        }
                    }
                }
                return conformanceStatements;
            };

            /**
             *
             * @param element
             * @returns {*}
             */
            var getGroupLevelPredicates = function (element) {
                if (element.type === 'MESSAGE')
                    return [];
                var group = getGroup(element); // element direct group
                if (group != null) {
                    var predicates = getGroupLevelPredicatesByGroup(element, group);
                    while ((group = getGroup(group)) != null) { // go through all the grand parent groups
                        predicates = predicates.concat(getGroupLevelPredicatesByGroup(element, group));
                    }
                    return predicates;
                }
                return [];
            };

            /**
             *
             * @param element
             * @param group
             * @returns {Array}
             */
            var getDirectGroupLevelPredicatesByGroup = function (element, group) {
                if (group != null && group.predicates != null && group.predicates.length > 0) {
                    var targetPath = getGroupDirectChildTargetPath(element, group);
                    return findConstraintsByTargetPath(group.predicates, targetPath);
                }
                return [];
            };

            /**
             *
             * @param element
             * @param group
             * @returns {Array}
             */
            var getGroupLevelPredicatesByGroup = function (element, group) {
                if (group != null && group.predicates != null && group.predicates.length > 0) {
                    var targetPath = getGroupChildTargetPath(element, group);
                    return findConstraintsByTargetPath(group.predicates, targetPath);
                }
                return [];
            };

            /**
             *
             * @param element
             * @returns {Array}
             */
            var getMessageLevelConfStatements = function (element) {
                var conformanceStatements = [];
                if ($scope.model.message.conformanceStatements != null && $scope.model.message.conformanceStatements.length > 0) {
                    var targetPath =getMessageChildTargetPath(element);
                    if (targetPath !== "") {
                        conformanceStatements = conformanceStatements.concat(findConstraintsByTargetPath($scope.model.message.conformanceStatements, targetPath));
                    }
                }
                return conformanceStatements;
            };

            /**
             *
             * @param element
             * @returns {Array}
             */
            var getMessageLevelPredicates = function (element) {
                var predicates = [];
                if ($scope.model.message.predicates != null && $scope.model.message.predicates.length > 0) {
                    var targetPath =getMessageChildTargetPath(element);
                    if (targetPath !== "") {
                        predicates = predicates.concat(findConstraintsByTargetPath($scope.model.message.predicates, targetPath));
                    }
                }
                return predicates;
            };

            /**
             *
             * @param element
             * @returns {*}
             */
            var getSegment = function (element) {
                if (element.type === 'COMPONENT') {
                    return getSegment(element.nodeParent);
                } else if (element.type === 'FIELD') { // find the segment
                    return $scope.parentsMap[element.id];
                }
                return null;
            };

            /**
             *
             * @param element
             * @returns {*}
             */
            var getGroup = function (element) {
                if (element != null) {
                    if (element.type === 'FIELD') {
                        return getGroup(element.nodeParent);
                    } else if (element.type === 'COMPONENT') {
                        return getGroup(element.nodeParent);
                    } else if (element.type === 'SEGMENT_REF') { // find the segment
                        return $scope.parentsMap[element.id]; //X
                    } else if (element.type === 'GROUP') { // find the segment
                        return $scope.parentsMap[element.id]; //X
                    }
                }
                return null;
            };


            /**
             *
             * @param element
             * @returns {Array}
             */
            var getSegmentLevelPredicates = function (element) {
                var segment = getSegment(element); // segment
                var predicates = [];
                if (segment != null && segment.predicates && segment.predicates != null && segment.predicates.length > 0) {
                    var targetPath = getSegmentChildTargetPath(element);
                    if (targetPath !== "") {
                        predicates = predicates.concat(findConstraintsByTargetPath(segment.predicates, targetPath));

                    }
                }
                return predicates;
            };

            /**
             *
             * @param element
             * @returns {Array}
             */
           var getSegmentLevelConfStatements = function (element) {
                var segment = getSegment(element); // segment
                var confStatements = [];
                if (segment != null && segment.conformanceStatements && segment.conformanceStatements != null && segment.conformanceStatements.length > 0) {
                    var targetPath = getSegmentChildTargetPath(element);
                    if (targetPath !== "") {
                        confStatements = confStatements.concat(findConstraintsByTargetPath(segment.conformanceStatements, targetPath));
                    }
                }
                return confStatements;
            };

            /**
             *
             * @param element
             * @returns {Array}
             */
            var getDatatypeLevelPredicates = function (element) {
                var datatype = $scope.parentsMap[element.id];
                var predicates = [];
                if (datatype && datatype != null && datatype.predicates.length > 0) {
                    var targetPath = getDatatypeChildTargetPath(element);
                    if (targetPath !== "") {
                        predicates = predicates.concat(findConstraintsByTargetPath(datatype.predicates, targetPath));
                    }
                }
                return predicates;
            };

            /**
             *
             * @param element
             * @returns {Array}
             */
            var getDatatypeLevelConfStatements = function (element) {
                var datatype = $scope.parentsMap[element.id];
                var confStatements = [];
                if (datatype && datatype != null && datatype.conformanceStatements.length > 0) {
                    var targetPath = getDatatypeChildTargetPath(element);
                    if (targetPath !== "") {
                        confStatements = confStatements.concat(findConstraintsByTargetPath(datatype.conformanceStatements, targetPath));
                    }
                }
                return confStatements;
            };

            /**
             *
             * @param node
             * @returns {string}
             */
            $scope.getConfStatementsAsMultipleLinesString = function (node) {
                var confStatements = node.selfConformanceStatements;
                var html = "";
                if (confStatements && confStatements != null && confStatements.length > 0) {
                    angular.forEach(confStatements, function (conStatement) {
                        html = html + "<p>" + conStatement.constraintId + " : " + conStatement.description + "</p>";
                    });
                }
                return html;
            };

            /**
             *
             * @param node
             * @param constraints
             * @returns {*}
             */
            $scope.getConfStatementsAsOneLineString = function (node, constraints) {
                var confStatements = node.selfConformanceStatements;
                var html = "";
                if (confStatements && confStatements != null && confStatements.length > 0) {
                    angular.forEach(confStatements, function (conStatement) {
                        html = html + conStatement.constraintId + " : " + conStatement.description;
                    });
                }
                return $sce.trustAsHtml(html);
            };


            $scope.scrollbarWidth = $rootScope.getScrollbarWidth();


            /**
             *
             * @returns {null|*|$scope.tableWidth}
             */
            var getTableWidth = function () {
                if ($scope.tableWidth === null) {
                    $scope.tableWidth = $("#executionPanel").width();
                }
                return $scope.tableWidth;
            };

            /**
             *
             * @returns {null|*|$scope.csWidth}
             */
            var getCsWidth = function () {
                //if ($scope.csWidth === null) {
                var tableWidth = getTableWidth();
                if (tableWidth > 0) {
                    var otherColumsWidth = !$scope.nodeData || $scope.nodeData === null || $scope.nodeData.type === 'MESSAGE' ? 800 : 800;
                    var left = tableWidth - otherColumsWidth;
                    $scope.csWidth = {"width": 2 * parseInt(left / 3) + "px"};
                }
                //}
                return $scope.csWidth;
            };

            var getPredWidth = function () {
                //if ($scope.predWidth === null) {
                var tableWidth = getTableWidth();
                if (tableWidth > 0) {
                    //var otherColumsWidth = !$scope.nodeData || $scope.nodeData === null || $scope.nodeData.type === 'MESSAGE' ? 800 : 800;
                    var left = tableWidth - 800;
                    $scope.predWidth = {"width": parseInt(left / 3) + "px"};
                }
                // }
                return $scope.predWidth;
            };


            /**
             *
             * @param node
             * @returns {string}
             */
            $scope.getSegmentRefNodeName = function (node) {
                return node && $scope.model != null && $scope.model.segments != null && $scope.model.segments[node.ref] ? node.position + "." + $scope.model.segments[node.ref].name + ":" + $scope.model.segments[node.ref].description : '';
            };

            /**
             *
             * @param node
             * @returns {string}
             */
            $scope.getGroupNodeName = function (node) {
                return node.position + "." + node.name;
            };

            /**
             *
             * @param node
             * @returns {string}
             */
            $scope.getFieldNodeName = function (node) {
                return node.path + ":" + node.name;
            };

            /**
             *
             * @param node
             * @returns {string}
             */
            $scope.getComponentNodeName = function (node) {
                return node.path + "." + node.name;
            };

            /**
             *
             * @param node
             * @returns {string}
             */
            $scope.getDatatypeNodeName = function (node) {
                return node.position + "." + node.name;
            };

            /**
             *
             * @param node
             * @returns {*}
             */
            $scope.getDatatypeNodeName2 = function (node) {
                return node.id;
            };

            /**
             *
             * @param node
             * @returns {string}
             */
            $scope.getDatatypeNodeName3 = function (node) {
                return node.id + ":" + node.description;
            };

            /**
             *
             * @param component
             * @returns {boolean|{}|*|$scope.parentsMap}
             */
            $scope.isSubDT = function (component) {
                return component.type === 'COMPONENT' && $scope.parentsMap && $scope.parentsMap[component.id] && $scope.parentsMap[component.id].type === 'COMPONENT';
            };

            /**
             *
             * @param node
             * @returns {string}
             */
            $scope.getComponentNodeName2 = function (node) {
                return node.position + "." + node.name;
            };

            /**
             *
             * @param node
             * @returns {string}
             */
            $scope.getSegmentReadName = function (node) {
                return node.name + "." + node.description;
            };
        }
        ]);




    mod.factory('ProfileService', function ($http, $q, $filter) {
        var ProfileService = function () {
        };

        /**
         *
         * @param segments
         * @param datatypes
         * @returns {Array}
         */
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

        /**
         *
         * @param datatypes
         */
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

        /**
         *
         * @param component
         */
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

        /**
         *
         * @param subComponent
         */
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

        /**
         *
         * @param id
         * @returns {*}
         */
        ProfileService.prototype.getJson = function (id) {
            var delay = $q.defer();
            $http.get('api/profile/' + id).then(
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

//            $http.get('../../resources/cf/profile-loi-2.json').then(
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
            //var tpl = params.getTemplate(node);

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