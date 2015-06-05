'use strict';

describe('Controller: VocabCtrl', function () {

    // load the controller's module
    beforeEach(module('izApp'));
    beforeEach(module('izServices'));


    var VocabCtrl;
    var $scope;
    var $httpBackend;

    // Initialize the controller and a mock scope
    beforeEach(inject(function (_$controller_, _$rootScope_,_$httpBackend_) {
        $scope = _$rootScope_.$new();
        $httpBackend=  _$httpBackend_;
        VocabCtrl = _$controller_('VocabCtrl',{
            $scope: $scope
        });
    }));

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should find all vocabs', function () {
        $httpBackend.whenGET('api/vocabs'). respond([
            {
                'name':'Vocab 1',
                'description':'Vocab 1 Desc',
                'testSteps': []
            },
            {
                'name':'Vocab 2',
                'description':'Vocab 2 Desc',
                'testSteps': []
            }
        ]);
        expect($scope.vocabs).toBeUndefined();
        //invoke code under test
        $scope.init();
        //simulate response
        $httpBackend.flush();
        //verify results
        expect($scope.vocabs.length).toBe(2);
    });


    it('should return not found vocab', function () {
        $httpBackend.whenGET('api/vocabs/3000').respond(404,'Cannot find vocab 3000');
        //invoke code under test
        $scope.selectVocab(3000);
        //simulate response
        $httpBackend.flush();
        //verify results
        expect($scope.error).toEqual('Cannot find vocab 3000');
    });

});
