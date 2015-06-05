'use strict';

describe('Service: ContactListLoader', function () {

    // load the service's module
    beforeEach(module('izServices'));

// instantiate service
    var loader, scope, $httpBackend;


    // Initialize the controller and a mock scope
    beforeEach(inject(function ($rootScope, _$httpBackend_, ContactListLoader) {
        scope = $rootScope.$new();
        $httpBackend = _$httpBackend_;
        loader =  ContactListLoader;
    }));

    it('should load the list of the certifications', function () {
        $httpBackend.whenGET('api/contacts'). respond([
            {
                'name':'Contact 1',
                'description':'Contact 1 Desc'
             },
            {
                'name':'Contact 2',
                'description':'Contact 2 Desc'
             }
        ]);
        var contacts;

        var promise = loader();
        promise.then(function(ps) {
            contacts = ps;
        });

        expect(contacts).toBeUndefined();
        $httpBackend.flush();
        expect(contacts.length).toBe(2);
    });

    it('should load fail loading the contacts for some reason', function () {
        $httpBackend.whenGET('api/contacts'). respond(400, '');
        var errorMsg;

        var promise = loader();
        promise.then(function() {
        }, function(error){
            errorMsg = error;
        });

        expect(errorMsg).toBeUndefined();
        $httpBackend.flush();
        expect(errorMsg).toEqual('Cannot load the contacts');
    });

});



describe('Service: ContactLoader', function () {

    // load the service's module
    beforeEach(module('izServices'));
    beforeEach(function() {
        this.addMatchers({
            toEqualData: function(expected) {
                return angular.equals(this.actual, expected);
            }
        });
    });

    // instantiate service
    var loader, scope, $httpBackend;


    // Initialize the controller and a mock scope
    beforeEach(inject(function ($rootScope, _$httpBackend_, ContactLoader) {
        scope = $rootScope.$new();
        $httpBackend = _$httpBackend_;
        loader =  ContactLoader;
    }));

    it('should load the contact', function () {
        $httpBackend.whenGET('api/contacts/2'). respond(
            {
                'name':'Contact 2',
                'description':'Contact 2 Desc',
                'testSteps': [],
                'id':2
            }
        );
        var contact;

        var promise = loader(2);
        promise.then(function(tCase) {
            contact = tCase;
        });

        expect(contact).toBeUndefined();
        $httpBackend.flush();
        expect(contact).toEqualData({'name':'Contact 2','description':'Contact 2 Desc','testSteps': [],'id':2});
    });

    it('should fail loading the contact because it is not found', function () {
        $httpBackend.whenGET('api/contacts/4567'). respond(404, '');
        var errorMsg;

        var promise = loader(4567);
        promise.then(function() {
        }, function(error){
            errorMsg = error;
        });

        expect(errorMsg).toBeUndefined();
        $httpBackend.flush();
        expect(errorMsg).toEqual('Cannot find contact 4567');
    });

});

