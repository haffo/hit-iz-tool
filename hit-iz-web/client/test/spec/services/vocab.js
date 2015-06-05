'use strict';

describe('Service: VocabListLoader', function () {

    // load the service's module
    beforeEach(module('izServices'));

// instantiate service
    var loader, scope, $httpBackend;


    // Initialize the controller and a mock scope
    beforeEach(inject(function ($rootScope, _$httpBackend_, VocabListLoader) {
        scope = $rootScope.$new();
        $httpBackend = _$httpBackend_;
        loader =  VocabListLoader;
    }));

    it('should load the list of the certifications', function () {
        $httpBackend.whenGET('api/vocabs'). respond([
            {
                'name':'Vocab 1',
                'description':'Vocab 1 Desc'
             },
            {
                'name':'Vocab 2',
                'description':'Vocab 2 Desc'
             }
        ]);
        var vocabs;

        var promise = loader();
        promise.then(function(ps) {
            vocabs = ps;
        });

        expect(vocabs).toBeUndefined();
        $httpBackend.flush();
        expect(vocabs.length).toBe(2);
    });

    it('should load fail loading the vocabs for some reason', function () {
        $httpBackend.whenGET('api/vocabs'). respond(400, '');
        var errorMsg;

        var promise = loader();
        promise.then(function() {
        }, function(error){
            errorMsg = error;
        });

        expect(errorMsg).toBeUndefined();
        $httpBackend.flush();
        expect(errorMsg).toEqual('Cannot load the vocabs');
    });

});



describe('Service: VocabLoader', function () {

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
    beforeEach(inject(function ($rootScope, _$httpBackend_, VocabLoader) {
        scope = $rootScope.$new();
        $httpBackend = _$httpBackend_;
        loader =  VocabLoader;
    }));

    it('should load the vocab', function () {
        $httpBackend.whenGET('api/vocabs/2'). respond(
            {
                'name':'Vocab 2',
                'description':'Vocab 2 Desc',
                'testSteps': [],
                'id':2
            }
        );
        var vocab;

        var promise = loader(2);
        promise.then(function(tCase) {
            vocab = tCase;
        });

        expect(vocab).toBeUndefined();
        $httpBackend.flush();
        expect(vocab).toEqualData({'name':'Vocab 2','description':'Vocab 2 Desc','testSteps': [],'id':2});
    });

    it('should fail loading the vocab because it is not found', function () {
        $httpBackend.whenGET('api/vocabs/4567'). respond(404, '');
        var errorMsg;

        var promise = loader(4567);
        promise.then(function() {
        }, function(error){
            errorMsg = error;
        });

        expect(errorMsg).toBeUndefined();
        $httpBackend.flush();
        expect(errorMsg).toEqual('Cannot find vocab 4567');
    });

});

