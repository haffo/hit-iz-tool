'use strict';

angular.module('profile-viewer')
    .controller('ProfileCtrl', ['$scope', 'ProfileLoader', 'ProfileListLoader', 'ProfileModelLoader', 'ngTreetableParams', function ($scope, ProfileLoader, ProfileListLoader, ProfileModelLoader,ngTreetableParams) {


        $scope.loading = false;

        $scope.currentProfile = {};
        $scope.selectedProfile = {};
        $scope.elements = [];
        $scope.nodeData = [];
        $scope.loading = false;
        $scope.error = null;

        $scope.relevance = true;
        $scope.trim = true;


        $scope.getConfStatementsAsString = function(node){
            var str = '';
            var statements = node.conformanceStatement;
            for(var index in statements){
                str = str + "<p style=\"text-align: left\">" + statements[index].id + " - " + statements[index].englishDescription + "</p>";
            }
            return str;
        };

        $scope.show = function(usage){
            return !$scope.relevance || ($scope.relevance && (usage === 'R' || usage === 'RE' || usage ==='C' || usage == undefined || usage.startsWith('C')));
        };


        $scope.loadProfiles = function(){
             $scope.loading = true;
            var promise = new ProfileListLoader();
            promise.then(function(profiles) {
                $scope.profiles = angular.fromJson(profiles);
                $scope.loading = false;
            }, function(error){
                $scope.error = error;
                $scope.loading = false;
            });
        };

        $scope.selectProfile = function(){
             if( $scope.selectedProfile != null){
                $scope.currentProfile.id= $scope.selectedProfile.id;
            }else{
                $scope.currentProfile.id=-1;
            }
        };

        $scope.init = function () {

            $scope.loadProfiles();

            $scope.params = new ngTreetableParams({
                getNodes: function(parent) {
                    return parent ? parent.children : $scope.nodeData.children;
                },
                getTemplate: function(node) {
                    return 'TreeNode.html';
                }
            });

            $scope.$watch('selectedProfile', function (selectedProfile) {
                $scope.loading = true;
                $scope.nodeData = [];
                if ($scope.selectedProfile != null && $scope.selectedProfile.id != undefined && $scope.selectedProfile.id != -1) {
                    var profile = angular.fromJson($scope.selectedProfile);
                    var loader = new ProfileModelLoader(profile.id);
                    loader.then(function (value) {
                        $scope.loading = false;
                        $scope.elements = value.elements;
                        $scope.nodeData = $scope.elements[0];
                        $scope.params.refresh();
                    }, function (error) {
                        $scope.elements = [];
                        $scope.loading = false;
                        $scope.error = error;
                        $scope.params.refresh();
                    });
                } else {
                    $scope.elements = [];
                    $scope.loading = false;
                    $scope.params.refresh();
                }
            }, true);
        };


        $scope.getNodeContent = function(selectedNode){
            $scope.nodeData = selectedNode;
            $scope.params.refresh();
        };





    }]);
