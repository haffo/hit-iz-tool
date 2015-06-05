'use strict';

describe('Controller: ProfileCtrl', function () {

  // load the controller's module
  beforeEach(module('izApp'));
  beforeEach(module('izServices'));


  var ProfileCtrl;
  var $scope;
  var $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$controller_, _$rootScope_,_$httpBackend_) {
    $scope = _$rootScope_.$new();
    $httpBackend=  _$httpBackend_;
    ProfileCtrl = _$controller_('ProfileCtrl',{
      $scope: $scope
    });
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should find all profiles', function () {
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
      expect($scope.profiles).toBeUndefined();
      //invoke code under test
      $scope.init();
      //simulate response
      $httpBackend.flush();
      //verify results
      expect($scope.profiles.length).toBe(2);
    });


  it('should return not found profile', function () {
      $httpBackend.whenGET('api/profiles/3000').respond(404,'Cannot find profile 3000');
      //invoke code under test
      $scope.selectProfile(3000);
      //simulate response
      $httpBackend.flush();
      //verify results
      expect($scope.error).toEqual('Cannot find profile 3000');
    });

});
