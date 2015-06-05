'use strict';

describe('Service: DocumentationListLoader', function () {

    // load the service's module
    beforeEach(module('izServices'));

// instantiate service
    var loader, scope, $httpBackend;


    // Initialize the controller and a mock scope
    beforeEach(inject(function ($rootScope, _$httpBackend_, DocumentationListLoader) {
        scope = $rootScope.$new();
        $httpBackend = _$httpBackend_;
        loader =  DocumentationListLoader;
    }));

    it('should load the list of the certifications', function () {
        $httpBackend.whenGET('api/documentations'). respond([
            {
                'name':'Documentation 1',
                'description':'Documentation 1 Desc'
             },
            {
                'name':'Documentation 2',
                'description':'Documentation 2 Desc'
             }
        ]);
        var documentations;

        var promise = loader();
        promise.then(function(ps) {
            documentations = ps;
        });

        expect(documentations).toBeUndefined();
        $httpBackend.flush();
        expect(documentations.length).toBe(2);
    });

    it('should load fail loading the documentations for some reason', function () {
        $httpBackend.whenGET('api/documentations'). respond(400, '');
        var errorMsg;

        var promise = loader();
        promise.then(function() {
        }, function(error){
            errorMsg = error;
        });

        expect(errorMsg).toBeUndefined();
        $httpBackend.flush();
        expect(errorMsg).toEqual('Cannot load the documentations');
    });

});



describe('Service: DocumentationLoader', function () {

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
    beforeEach(inject(function ($rootScope, _$httpBackend_, DocumentationLoader) {
        scope = $rootScope.$new();
        $httpBackend = _$httpBackend_;
        loader =  DocumentationLoader;
    }));

    it('should load the documentation', function () {
        $httpBackend.whenGET('api/documentations/2'). respond(
            {
                'name':'Documentation 2',
                'description':'Documentation 2 Desc',
                'id':2
            }
        );
        var documentation;

        var promise = loader(2);
        promise.then(function(tCase) {
            documentation = tCase;
        });

        expect(documentation).toBeUndefined();
        $httpBackend.flush();
        expect(documentation).toEqualData({'name':'Documentation 2','description':'Documentation 2 Desc','id':2});
    });

    it('should fail loading the documentation because it is not found', function () {
        $httpBackend.whenGET('api/documentations/4567'). respond(404, '');
        var errorMsg;

        var promise = loader(4567);
        promise.then(function() {
        }, function(error){
            errorMsg = error;
        });

        expect(errorMsg).toBeUndefined();
        $httpBackend.flush();
        expect(errorMsg).toEqual('Cannot find documentation 4567');
    });

});

