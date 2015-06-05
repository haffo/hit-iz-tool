//'use strict';
//
//angular.module('iz-vocab-tool')
//  .controller('VocabCtrl',['$scope', 'VocabLoader', 'VocabListLoader', function ($scope, VocabLoader, VocabListLoader) {
//        $scope.init = function(){
//             var promise = new VocabListLoader();
//             promise.then(function(vocabs) {
//                $scope.vocabs = vocabs;
//             }, function(error){
//                $scope.error = error;
//             });
//              return promise;
//        };
//
//        $scope.selectVocab = function(vocabId){
//            $scope.selectedVocab = null;
//             var promise = new VocabLoader(vocabId);
//             promise.then(function(vocab) {
//                    $scope.selectedVocab = vocab;
//             }, function(error){
//                 $scope.error = error;
//             });
//             return promise;
//        };
//
//      }]);
