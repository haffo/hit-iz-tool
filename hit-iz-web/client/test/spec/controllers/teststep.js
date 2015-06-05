'use strict';

describe('Controller: TestStepCtrl', function () {

  // load the controller's module
  beforeEach(module('izApp'));

  var TestStepCtrl,
    $scope,
    $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$controller_, _$rootScope_,_$httpBackend_) {
    $scope = _$rootScope_.$new();
    $httpBackend=  _$httpBackend_;
    TestStepCtrl = _$controller_('TestStepCtrl',{
      $scope: $scope
    });
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should find all test cases', function () {
      $httpBackend.whenGET('api/teststeps'). respond([
          {
              'description':'Test Step 1 Desc',
              'order': 1
            },
            {
              'description':'Test Step 2 Desc',
              'order': 2
            }
          ]);
      //invoke code under test
      expect($scope.testSteps).toBeUndefined();
      $scope.init();
      //simulate response
      $httpBackend.flush();
      //verify results
      expect($scope.testSteps.length).toEqual(2);
    });

  it('should select the test step', function () {
        $httpBackend.whenGET('api/teststeps/1'). respond({
          'id':1,
          'description':'Test Step 1 Desc',
          'order': 1
        });
        expect($scope.selectedTestStep).toBeUndefined();
        //invoke code under test
        $scope.selectTestStep(1);
        //simulate response
        $httpBackend.flush();
        //verify results
        expect($scope.selectedTestStep.id).toEqual(1);
      });

  it('should return not found test step', function () {
        $httpBackend.whenGET('api/teststeps/2000').respond(404,'Cannot find test step 2000');
        //invoke code under test
        $scope.selectTestStep(2000);
        //simulate response
        $httpBackend.flush();
        //verify results
        expect($scope.error).toEqual('Cannot find test step 2000');
      });

});
