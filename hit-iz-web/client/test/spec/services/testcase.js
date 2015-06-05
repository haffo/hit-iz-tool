'use strict';

describe('Service: TestCaseListLoader', function () {

    // load the service's module
    beforeEach(module('izServices'));

// instantiate service
    var loader, scope, $httpBackend;


    // Initialize the controller and a mock scope
    beforeEach(inject(function ($rootScope, _$httpBackend_, TestCaseListLoader) {
        scope = $rootScope.$new();
        $httpBackend = _$httpBackend_;
        loader =  TestCaseListLoader;
    }));

    it('should load the list of the certifications', function () {
        $httpBackend.whenGET('api/testcases'). respond([
            {
                'name':'Test Case 1',
                'description':'Test Case 1 Desc',
                'testSteps': []
            },
            {
                'name':'Test Case 2',
                'description':'Test Case 2 Desc',
                'testSteps': []
            }
        ]);
        var testCases;

        var promise = loader();
        promise.then(function(tCases) {
            testCases = tCases;
        });

        expect(testCases).toBeUndefined();
        $httpBackend.flush();
        expect(testCases.length).toBe(2);
    });

    it('should load fail loading the testcases for some reason', function () {
        $httpBackend.whenGET('api/testcases'). respond(400, '');
        var errorMsg;

        var promise = loader();
        promise.then(function() {
        }, function(error){
            errorMsg = error;
        });

        expect(errorMsg).toBeUndefined();
        $httpBackend.flush();
        expect(errorMsg).toEqual('Cannot load the test cases');
    });

});



describe('Service: TestCaseLoader', function () {

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
    beforeEach(inject(function ($rootScope, _$httpBackend_, TestCaseLoader) {
        scope = $rootScope.$new();
        $httpBackend = _$httpBackend_;
        loader =  TestCaseLoader;
    }));

    it('should load the test case', function () {
        $httpBackend.whenGET('api/testcases/2'). respond(
            {
                'name':'Test Case 2',
                'description':'Test Case 2 Desc',
                'testSteps': [],
                'id':2
            }
        );
        var testCase;

        var promise = loader(2);
        promise.then(function(tCase) {
            testCase = tCase;
        });

        expect(testCase).toBeUndefined();
        $httpBackend.flush();
        expect(testCase).toEqualData({'name':'Test Case 2','description':'Test Case 2 Desc','testSteps': [],'id':2});
    });

    it('should fail loading the testcase because it is not found', function () {
        $httpBackend.whenGET('api/testcases/4567'). respond(404, '');
        var errorMsg;

        var promise = loader(4567);
        promise.then(function() {
        }, function(error){
            errorMsg = error;
        });

        expect(errorMsg).toBeUndefined();
        $httpBackend.flush();
        expect(errorMsg).toEqual('Cannot find test case 4567');
    });

});

