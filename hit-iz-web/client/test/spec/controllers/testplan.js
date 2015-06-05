'use strict';

describe("Controller: TestPlanListCtrl", function () {

  // load the controller's module
  beforeEach(module('izApp'));

  var TestPlanListCtrl,
    $scope,
    $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$controller_, _$rootScope_,_$httpBackend_) {
    $scope = _$rootScope_.$new();
    $httpBackend=  _$httpBackend_;
    TestPlanListCtrl = _$controller_('TestPlanListCtrl',{
      $scope: $scope
    });
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should find all test cases', function () {
      $httpBackend.whenGET('api/testplans'). respond([
          {
              'name':'Test Plan 1',
              'description':'Test Plan 1 Desc',
              'testCases': []
            },
            {
              'name':'Test Plan 2',
              'description':'Test Plan 2 Desc',
              'testCases': []
            }
          ]);
      //invoke code under test
      $scope.init();
      //simulate response
      $httpBackend.flush();
      //verify results
      expect($scope.testPlans.length).toEqual(2);
    });

});
