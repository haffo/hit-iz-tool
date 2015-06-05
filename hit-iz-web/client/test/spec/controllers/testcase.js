'use strict';

describe('Controller: TestCaseCtrl', function () {

  // load the controller's module
  beforeEach(module('izApp'));
  beforeEach(module('izServices'));


  var TestCaseCtrl;
  var $scope;
  var $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$controller_, _$rootScope_,_$httpBackend_) {
    $scope = _$rootScope_.$new();
    $httpBackend=  _$httpBackend_;
    TestCaseCtrl = _$controller_('TestCaseCtrl',{
      $scope: $scope
    });
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should find all test cases', function () {
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
      expect($scope.testCases).toBeUndefined();
      //invoke code under test
      $scope.init();
      //simulate response
      $httpBackend.flush();
      //verify results
      expect($scope.testCases.length).toBe(2);
    });


  it('should return not found test case', function () {
      $httpBackend.whenGET('api/testcases/3000').respond(404,'Cannot find test case 3000');
      //invoke code under test
      $scope.selectTestCase(3000);
      //simulate response
      $httpBackend.flush();
      //verify results
      expect($scope.error).toEqual('Cannot find test case 3000');
    });

});
