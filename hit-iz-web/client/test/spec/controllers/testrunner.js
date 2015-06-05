'use strict';

describe('Controller: TestRunnerCtrl', function () {

  // load the controller's module
  beforeEach(module('izApp'));
  beforeEach(module('ui.bootstrap'));

  var TestRunnerCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TestRunnerCtrl = $controller('TestRunnerCtrl',{
      $scope: scope
    });
  }));

});
