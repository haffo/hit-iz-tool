'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('izApp'));
  beforeEach(module('izServices'));

    var MainCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope
    });
  }));

  it('should have /home as initial page displayed', function () {
    expect(scope.activePath).toBe('/home');
  });

  it('should have save the current page', function () {
      scope.setActive('/testrunner');
      expect(scope.isActive('/testrunner')).toBe(true);
    });

});
