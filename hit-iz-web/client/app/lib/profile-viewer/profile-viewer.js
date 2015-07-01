/**
 * Created by haffo on 5/4/15.
 */

(function ( angular ) {
    'use strict';
    var mod =  angular.module('hit-profile-viewer', [] );
    mod.directive('profileViewer', [
    function () {
        return {
            restrict: 'A',
            scope: {
                type: '@'
            },
            templateUrl: '/lib/profile-viewer/profile-viewer.html',
            replace: false,
            controller: 'ProfileViewerCtrl'
        };
    }
]);

    mod
    .controller('ProfileViewerCtrl', ['$scope', '$rootScope', 'ngTreetableParams', 'ProfileService', function ($scope, $rootScope, ngTreetableParams, ProfileService) {
        $scope.testCase = null;
        $scope.elements = [];
        $scope.nodeData = [];
        $scope.loading = false;
        $scope.error = null;
        $scope.profile = null;
        $scope.relevance = true;
        $scope.trim = true;
        $scope.profileService = new ProfileService();


        $scope.getConstraintsAsString = function (constraints) {
            var str = '';
            for (var index in constraints) {
                str = str + "<p style=\"text-align: left\">" + constraints[index].id + " - " + constraints[index].description + "</p>";
            }
            return str;
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
            return !$scope.relevance || ($scope.relevance && node.relevent);
        };


        $scope.showValueSetDefinition = function (tableId) {
            $rootScope.$broadcast($scope.type + ':showValueSetDefinition', tableId);
        };


        $rootScope.$on($scope.type + ':profileLoaded', function (event, profile) {
            if (profile && profile.json != null && profile.json != "") {
                $scope.profile = profile;
                $scope.loading = true;
                $scope.nodeData = [];
                $scope.loading = false;
                $scope.elements = angular.fromJson($scope.profile.json).elements;

                var datatypes = null;
                var segments = [];

                angular.forEach($scope.elements, function (element) {
                    if (element.name === 'Datatypes' && datatypes === null) {
                        datatypes = element;
                    }
                    if (element.type === 'SEGMENT') {
                        segments.push(element);
                    }
                });
                $scope.profileService.setDatatypesTypesAndIcons(datatypes);
                var valueSetIds = $scope.profileService.getValueSetIds(segments, datatypes.children);
                $rootScope.$broadcast($scope.type + ':valueSetIdsCollected', valueSetIds);
                $scope.nodeData = $scope.elements[0];
                $scope.params.refresh();
                $scope.loading = false;
            } else {
                $scope.loading = false;
                $scope.nodeData = [];
                $scope.elements = [];
                $scope.params.refresh();
            }
        });
        $scope.params = new ngTreetableParams({
            getNodes: function (parent) {
                return parent ? parent.children : $scope.nodeData.children;
            },
            getTemplate: function (node) {
                return 'ProfileViewerNode.html';
            }
        });

        $scope.getNodeContent = function (selectedNode) {
            $scope.nodeData = selectedNode;
            $scope.params.refresh();
            //$scope.params.expandAll();
        };

    }]);


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

    return ProfileService;

});

})( angular );