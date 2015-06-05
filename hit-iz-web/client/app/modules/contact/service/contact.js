'use strict';
//
//angular.module('tool-services').factory('Contact', ['Resource',
//    function ($resource) {
//        return $resource('api/contacts/:id', {id:'@id'});
//    }
//]);
//
//
//angular.module('iz-tool-services').factory('ContactLoader',['Contact', '$q', function(Contact, $q){
//    return function(contactId) {
//        var delay = $q.defer();
//        Contact.get({id:contactId},
//            function(contact) {
//                console.log('Fetched contact ' + contactId);
//                delay.resolve(contact);
//            },
//            function(response) {
//                console.log('Error fetching the contact ' + contactId);
//                if(response.status === 404) {
//                    delay.reject('Cannot find contact ' + contactId);
//                }else{
//                    delay.reject('Unable to fetch contact ' + contactId);
//                }
//            }
//        );
//        return delay.promise;
//    };
//}]);
//
//angular.module('iz-tool-services').factory('ContactListLoader',['Contact', '$q', function(Contact, $q){
//    return function() {
//        var delay = $q.defer();
//        Contact.query(
//            function(contacts) {
//                console.log('Fetched contacts. Total= ' + contacts.length);
//                delay.resolve(contacts);
//            },
//            function(response) {
//                console.log('Error fetching the contacts');
//                delay.reject('Cannot load the contacts');
//            }
//        );
//        return delay.promise;
//    };
//}]);





