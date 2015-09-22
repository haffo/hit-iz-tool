'use strict';

angular.module('documentation')
  .controller('DocumentationCtrl',['$scope', 'ReleaseNoteListLoader','KnownIssueListLoader','UserDocListLoader',  function ($scope,ReleaseNoteListLoader,KnownIssueListLoader,UserDocListLoader) {
        $scope.knownIssues = [];
        $scope.releaseNotes = [];
        $scope.userDocs = [];
        $scope.init = function(){


            var validated = new Er7MessageValidator().validate(id, content, label, $scope.dqaCodes, "1223", "Free");
            validated.then(function (mvResult) {
                $scope.vLoading = false;
                $scope.loadValidationResult(mvResult);
            }, function (error) {
                $scope.vLoading = false;
                $scope.vError = error;
                $scope.loadValidationResult(null);
            });


        };


      }]);
