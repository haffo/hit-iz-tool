'use strict';

describe('Controller: DocumentationCtrl', function () {

  // load the controller's module
  beforeEach(module('izApp'));
  beforeEach(module('izServices'));


  var DocumentationCtrl;
  var $scope;
  var $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$controller_, _$rootScope_,_$httpBackend_) {
    $scope = _$rootScope_.$new();
    $httpBackend=  _$httpBackend_;
    DocumentationCtrl = _$controller_('DocumentationCtrl',{
      $scope: $scope
    });
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should find all documentation', function () {
      $httpBackend.whenGET('api/documentations'). respond([
          {
              'name':'Documentation 1',
              'description':'Documentation 1 Desc',
              'testSteps': []
            },
            {
              'name':'Documentation 2',
              'description':'Documentation 2 Desc',
              'testSteps': []
            }
          ]);
      expect($scope.docs).toBeUndefined();
      //invoke code under test
      $scope.init();
      //simulate response
      $httpBackend.flush();
      //verify results
      expect($scope.docs.length).toBe(2);
    });


  it('should return not found test case', function () {
      $httpBackend.whenGET('api/documentations/3000').respond(404,'Cannot find documentation 3000');
      //invoke code under test
      $scope.selectDocumentation(3000);
      //simulate response
      $httpBackend.flush();
      //verify results
      expect($scope.error).toEqual('Cannot find documentation 3000');
    });

});
