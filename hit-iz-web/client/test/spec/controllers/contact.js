'use strict';

describe('Controller: ContactCtrl', function () {

  // load the controller's module
  beforeEach(module('izApp'));
  beforeEach(module('izServices'));


  var ContactCtrl;
  var $scope;
  var $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$controller_, _$rootScope_,_$httpBackend_) {
    $scope = _$rootScope_.$new();
    $httpBackend=  _$httpBackend_;
    ContactCtrl = _$controller_('ContactCtrl',{
      $scope: $scope
    });
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should find all contacts', function () {
      $httpBackend.expectGET('api/contacts'). respond([
          {
              'name':'Contact 1',
              'description':'Contact 1 Desc'
             },
            {
              'name':'Contact 2',
              'description':'Contact 2 Desc'
             }
          ]);
      expect($scope.contacts).toBeUndefined();
      //invoke code under test
      $scope.init();
      //simulate response
      $httpBackend.flush();
      //verify results
      expect($scope.contacts.length).toBe(2);
    });

});
