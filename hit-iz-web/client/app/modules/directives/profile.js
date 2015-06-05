///**
// * Created by haffo on 5/4/15.
// */
//
//
//angular.module('tool-directives').directive('profile-viewer', ['ngTreetableParams','$rootScope',function (ngTreetableParams,$rootScope) {
//    return {
//        restrict: 'E',
//        require:'ngTreetableParams',
//        scope: {
//            profile: '@=profile',
//            elements: [],
//            nodeData: [],
//            loading: false,
//            error : null,
//            relevance: true,
//            trim: true,
//            params:null,
//            vocabEvent:'='
//        },
//        replace: true,
//        template: '',
//        link: function (scope,ngTreetableParams) {
//            scope.params = new ngTreetableParams({
//                getNodes: function (parent) {
//                    return parent ? parent.children : scope.nodeData.children;
//                },
//                getTemplate: function (node) {
//                    return 'TreeNode.html';
//                }
//            });
//            scope.$watch(function () {
//                return scope.profile.json;
//            }, function (content) {
//                if (content != null && content != '') {
//                    var json = angular.fromJson(content);
//                    scope.loading = true;
//                    scope.nodeData = [];
//                    scope.loading = false;
//                    scope.elements = json.elements;
//                    scope.nodeData = scope.elements[0];
//                    scope.params.refresh();
//                    scope.loading = false;
//
//                } else {
//                    scope.loading = false;
//                    scope.nodeData = [];
//                    scope.elements = [];
//                    scope.params.refresh();
//                }
//            }, true);
//
//            scope.getConstraintsAsString = function (constraints) {
//                var str = '';
//                for (var index in constraints) {
//                    str = str + "<p style=\"text-align: left\">" + constraints[index].id + " - " + constraints[index].description + "</p>";
//                }
//                return str;
//            };
//
//            scope.showRefSegment = function (id) {
//                if (scope.elements.length > 0 && id)
//                    for (var i = 1; i < scope.elements.length; i++) {
//                        var element = scope.elements[i];
//                        if (element.id == id) {
//                            scope.getNodeContent(element);
//                        }
//                    }
//            };
//
//            scope.show = function (node) {
//                return !scope.relevance || (scope.relevance && node.relevent);
//            };
//
//
//            scope.viewTable = function (tableId) {
//                $rootScope.$broadcast(scope.vocabEvent, tableId);
//
//            };
//
////            scope.init = function () {
////                scope.$watch(function () {
////                    return scope.contextFree.testCase.testContext.profile.id;
////                }, function (profileId) {
////                    if (profileId != null) {
////                        scope.loading = true;
////                        var promise = scope.contextFree.testCase.testContext.profile.parse();
////                        promise.then(function (profileData) {
////                            scope.nodeData = [];
////                            scope.loading = false;
////                            scope.elements = profileData.elements;
////                            scope.nodeData = scope.elements[0];
////                            scope.params.refresh();
////                            scope.loading = false;
////                        }, function (error) {
////                            scope.error = error;
////                            scope.loading = false;
////                        });
////                    } else {
////                        scope.loading = false;
////                        scope.nodeData = [];
////                        scope.elements = [];
////                        scope.params.refresh();
////                    }
////                }, true);
////
////                scope.params = new ngTreetableParams({
////                    getNodes: function (parent) {
////                        return parent ? parent.children : scope.nodeData.children;
////                    },
////                    getTemplate: function (node) {
////                        return 'TreeNode.html';
////                    }
//////                ,
//////                options: {
//////                    initialState: 'expanded'
//////                 }
////                });
////            };
//
//            scope.getNodeContent = function (selectedNode) {
//                scope.nodeData = selectedNode;
//                scope.params.refresh();
//                //scope.params.expandAll();
//            };
//
//
//        }
//    }
//}]);