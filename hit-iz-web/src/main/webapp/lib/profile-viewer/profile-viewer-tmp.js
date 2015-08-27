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
        .controller('ProfileViewerCtrl', ['$scope', '$rootScope', 'ngTreetableParams', 'ProfileService', '$http', '$filter', function ($scope, $rootScope, ngTreetableParams, ProfileService, $http, $filter) {
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
            $scope.options = {
                concise: true,
                relevance: true,
                collapse: true
            };

            $scope.getConstraintsAsString = function (constraints) {
                var str = '';
                for (var index in constraints) {
                    str = str + "<p style=\"text-align: left\">" + constraints[index].id + " - " + constraints[index].description + "</p>";
                }
                return str;
            };

            $scope.isBranch = function (node) {
                var isBranch = false;
                if (node.children != null && node.children.length > 0) {
                    for (var i = 0; i < node.children.length; i++) {
                        if ($scope.show(node.children[i])) {
                            isBranch = true;
                            break;
                        }
                    }
                }
                return isBranch;
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

            $scope.show = function (node) {
                return !$scope.options.relevance || ($scope.options.relevance && node.relevent);
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

            $scope.setRelevance = function(value){
              $scope.options.relevance = value;
              if($scope.options.relevance){
                  $('.notRelevant').hide();
              }else{
                 $('.notRelevant').show();
               }
            };

            $scope.showValueSetDefinition = function (tableId) {
                $rootScope.$broadcast($scope.type + ':showValueSetDefinition', tableId);
            };

            $rootScope.$on($scope.type + ':profileLoaded', function (event, profile) {
                $scope.loading = true;
                $scope.options.collapse = true;
                if (profile && profile.id != null) {
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
            $scope.params = new ngTreetableParams({
                getNodes: function (parent) {
                    return parent ? parent.children : $scope.nodeData.children;
                },
                getTemplate: function (node) {
                    if ($scope.nodeData && $scope.nodeData.type != undefined) {
                        if ($scope.nodeData.type === 'SEGMENT') {
                            return 'SegmentNode.html';
                        } else if ($scope.nodeData.type === 'MESSAGE') {
                            return 'MessageNode.html';
                        } else if ($scope.nodeData.type === 'DATATYPE') {
                            return 'DatatypeNode.html';
                        }
                    }
                    return 'MessageNode.html';
                },
                options: {
                    initialState: 'collapsed'
                }
            });

            $scope.refresh = function () {

                $scope.params.refreshWithState(!$scope.options.collapse ? 'expanded' : 'collapse');
            };

            $scope.getNodeContent = function (selectedNode) {
                if (selectedNode != null) {
                    $scope.confStatementsActive = false;
                    $scope.nodeData = selectedNode;
                    $scope.options.collapse = selectedNode.type !== 'MESSAGE';
                    $scope.refresh();
                    $scope.setRelevance($scope.options.relevance);
                }
            };

            $scope.showConfStatements = function () {
                $scope.confStatementsActive = true;
            };

        }]);

    mod.directive('stRatio', function () {
        return {

            link: function (scope, element, attr) {
                var ratio = +(attr.stRatio);
                element.css('width', ratio + '%');
            }
        };
    });

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
//            $http.post('api/profile/' + id).then(
//                function (object) {
//                    try {
//                        delay.resolve(angular.fromJson(object.data));
//                    } catch (e) {
//                        delay.reject("Invalid character");
//                    }
//                },
//                function (response) {
//                    delay.reject(response.data);
//                }
//            );

            $http.get('../../resources/cf/profile.json').then(
                function (object) {
                    delay.resolve(angular.fromJson(object.data));
                },
                function (response) {
                    delay.reject(response.data);
                }
            );

            return delay.promise;
        };

        return ProfileService;

    });

})(angular);