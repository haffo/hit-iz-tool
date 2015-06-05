'use strict';

describe('Service: ProfileListLoader', function () {

    // load the service's module
    beforeEach(module('izServices'));

// instantiate service
    var loader, scope, $httpBackend;


    // Initialize the controller and a mock scope
    beforeEach(inject(function ($rootScope, _$httpBackend_, ProfileListLoader) {
        scope = $rootScope.$new();
        $httpBackend = _$httpBackend_;
        loader =  ProfileListLoader;
    }));

    it('should load the list of the certifications', function () {
        $httpBackend.whenGET('api/profiles'). respond([
            {
                'name':'Profile 1',
                'description':'Profile 1 Desc'
             },
            {
                'name':'Profile 2',
                'description':'Profile 2 Desc'
             }
        ]);
        var profiles;

        var promise = loader();
        promise.then(function(ps) {
            profiles = ps;
        });

        expect(profiles).toBeUndefined();
        $httpBackend.flush();
        expect(profiles.length).toBe(2);
    });

    it('should load fail loading the profiles for some reason', function () {
        $httpBackend.whenGET('api/profiles'). respond(400, '');
        var errorMsg;

        var promise = loader();
        promise.then(function() {
        }, function(error){
            errorMsg = error;
        });

        expect(errorMsg).toBeUndefined();
        $httpBackend.flush();
        expect(errorMsg).toEqual('Cannot load the profiles');
    });

});



describe('Service: ProfileLoader', function () {

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
    beforeEach(inject(function ($rootScope, _$httpBackend_, ProfileLoader) {
        scope = $rootScope.$new();
        $httpBackend = _$httpBackend_;
        loader =  ProfileLoader;
    }));

    it('should load the profile', function () {
        $httpBackend.whenGET('api/profiles/2'). respond(
            {
                'name':'Profile 2',
                'description':'Profile 2 Desc',
                'testSteps': [],
                'id':2
            }
        );
        var profile;

        var promise = loader(2);
        promise.then(function(tCase) {
            profile = tCase;
        });

        expect(profile).toBeUndefined();
        $httpBackend.flush();
        expect(profile).toEqualData({'name':'Profile 2','description':'Profile 2 Desc','testSteps': [],'id':2});
    });

    it('should fail loading the profile because it is not found', function () {
        $httpBackend.whenGET('api/profiles/4567'). respond(404, '');
        var errorMsg;

        var promise = loader(4567);
        promise.then(function() {
        }, function(error){
            errorMsg = error;
        });

        expect(errorMsg).toBeUndefined();
        $httpBackend.flush();
        expect(errorMsg).toEqual('Cannot find profile 4567');
    });

});

