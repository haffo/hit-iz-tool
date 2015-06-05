'use strict';

describe('Service: SettingListLoader', function () {

    // load the service's module
    beforeEach(module('izServices'));

// instantiate service
    var loader, scope, $httpBackend;


    // Initialize the controller and a mock scope
    beforeEach(inject(function ($rootScope, _$httpBackend_, SettingListLoader) {
        scope = $rootScope.$new();
        $httpBackend = _$httpBackend_;
        loader =  SettingListLoader;
    }));

    it('should load the list of the certifications', function () {
        $httpBackend.whenGET('api/settings'). respond([
            {
                'name':'Setting 1',
                'description':'Setting 1 Desc'
             },
            {
                'name':'Setting 2',
                'description':'Setting 2 Desc'
             }
        ]);
        var settings;

        var promise = loader();
        promise.then(function(ps) {
            settings = ps;
        });

        expect(settings).toBeUndefined();
        $httpBackend.flush();
        expect(settings.length).toBe(2);
    });

    it('should load fail loading the settings for some reason', function () {
        $httpBackend.whenGET('api/settings'). respond(400, '');
        var errorMsg;

        var promise = loader();
        promise.then(function() {
        }, function(error){
            errorMsg = error;
        });

        expect(errorMsg).toBeUndefined();
        $httpBackend.flush();
        expect(errorMsg).toEqual('Cannot load the settings');
    });

});



describe('Service: SettingLoader', function () {

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
    beforeEach(inject(function ($rootScope, _$httpBackend_, SettingLoader) {
        scope = $rootScope.$new();
        $httpBackend = _$httpBackend_;
        loader =  SettingLoader;
    }));

    it('should load the setting', function () {
        $httpBackend.whenGET('api/settings/2'). respond(
            {
                'name':'Setting 2',
                'description':'Setting 2 Desc',
                'testSteps': [],
                'id':2
            }
        );
        var setting;

        var promise = loader(2);
        promise.then(function(tCase) {
            setting = tCase;
        });

        expect(setting).toBeUndefined();
        $httpBackend.flush();
        expect(setting).toEqualData({'name':'Setting 2','description':'Setting 2 Desc','testSteps': [],'id':2});
    });

    it('should fail loading the setting because it is not found', function () {
        $httpBackend.whenGET('api/settings/4567'). respond(404, '');
        var errorMsg;

        var promise = loader(4567);
        promise.then(function() {
        }, function(error){
            errorMsg = error;
        });

        expect(errorMsg).toBeUndefined();
        $httpBackend.flush();
        expect(errorMsg).toEqual('Cannot find setting 4567');
    });

});

