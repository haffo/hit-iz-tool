'use strict';

describe('Controller: SettingCtrl', function () {

  // load the controller's module
  beforeEach(module('izApp'));
  beforeEach(module('izServices'));


  var SettingCtrl;
  var $scope;
  var $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$controller_, _$rootScope_,_$httpBackend_) {
    $scope = _$rootScope_.$new();
    $httpBackend=  _$httpBackend_;
    SettingCtrl = _$controller_('SettingCtrl',{
      $scope: $scope
    });
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should find all settings', function () {
      $httpBackend.whenGET('api/settings'). respond([
          {
              'name':'Setting 1',
              'description':'Setting 1 Desc',
              'testSteps': []
            },
            {
              'name':'Setting 2',
              'description':'Setting 2 Desc',
              'testSteps': []
            }
          ]);
      expect($scope.settings).toBeUndefined();
      //invoke code under test
      $scope.init();
      //simulate response
      $httpBackend.flush();
      //verify results
      expect($scope.settings.length).toBe(2);
    });


  it('should return not found setting', function () {
      $httpBackend.whenGET('api/settings/3000').respond(404,'Cannot find setting 3000');
      //invoke code under test
      $scope.selectSetting(3000);
      //simulate response
      $httpBackend.flush();
      //verify results
      expect($scope.error).toEqual('Cannot find setting 3000');
    });

});
