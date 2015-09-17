'use strict';

angular.module('documentation')
  .controller('DocumentationCtrl',['$scope', 'TestCaseDocumentationLoader',  function ($scope,TestCaseDocumentationLoader) {

        $scope.cbError = null;
        $scope.cbLoading = false;
        $scope.testCases = [];
        $scope.tree = {};

        $scope.init = function(){
            $scope.tcLoading = true;
            var tcLoader = new TestCaseDocumentationLoader().getOneByStage('CB');
            tcLoader.then(function (testCases) {
                $scope.tcError = null;
                $scope.testCases = testCases;
                for (var i = 0; i < $scope.testCases.length; i++) {
                    $scope.testCases[i]["json"] = angular.fromJson($scope.testCases[i]["json"]);
                }
                $scope.tree.build_all($scope.testCases);
                $scope.tcLoading = false;
            }, function (error) {
                $scope.tcLoading = false;
                $scope.tcError = "Sorry,Cannot fetch the test cases. Please refresh the page.";
            });


        };



      }]);
