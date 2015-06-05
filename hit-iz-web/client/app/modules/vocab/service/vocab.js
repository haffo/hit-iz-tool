'use strict';
//
//angular.module('iz-vocab-tool-services').factory('Vocab', ['Resource',
//    function ($resource) {
//        return $resource('api/vocabs/:id', {id:'@id'});
//    }
//]);
//
//
//angular.module('iz-vocab-tool-services').factory('VocabLoader',['Vocab', '$q', function(Vocab, $q){
//    return function(vocabId) {
//        var delay = $q.defer();
//        Vocab.get({id:vocabId},
//            function(vocab) {
//                console.log('Fetched vocab ' + vocabId);
//                delay.resolve(vocab);
//            },
//            function(response) {
//                console.log('Error fetching the vocab ' + vocabId);
//                if(response.status === 404) {
//                    delay.reject('Cannot find vocab ' + vocabId);
//                }else{
//                    delay.reject('Unable to fetch vocab ' + vocabId);
//                }
//            }
//        );
//        return delay.promise;
//    };
//}]);
//
//angular.module('iz-vocab-tool-services').factory('VocabListLoader',['Vocab', '$q', function(Vocab, $q){
//    return function() {
//        var delay = $q.defer();
//        Vocab.query(
//            function(vocabs) {
//                console.log('Fetched vocabs. Total= ' + vocabs.length);
//                delay.resolve(vocabs);
//            },
//            function(response) {
//                console.log('Error fetching the vocabs');
//                delay.reject('Cannot load the vocabs');
//            }
//        );
//        return delay.promise;
//    };
//}]);
//
//
//
//
//
