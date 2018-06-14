/**
 * Created by haffo on 5/4/15.
 */
(function (angular) {
  'use strict';
  var mod = angular.module('hit-vocab-search', []);
  mod.directive('vocabSearch', [
    function () {
      return {
        restrict: 'A',
        scope: {
          type: '@'
        },
        templateUrl: 'VocabSearch.html',
        replace: false,
        controller: 'VocabSearchCtrl'
      };
    }
  ]);
  mod
    .controller('VocabSearchCtrl', ['$scope', '$filter', '$modal', '$rootScope', 'VocabularyService', '$modalStack', function ($scope, $filter, $modal, $rootScope, VocabularyService, $modalStack) {
      $scope.selectedValueSetDefinition = null;
      $scope.tmpTableElements = [];
      $scope.sourceData = [];
      $scope.selectedItem = [];
      $scope.error = null;
      $scope.vocabResError = null;
      $scope.loading = false;
      $scope.searchError = null;
      $scope.error = null;
      $scope.searchString = null;
      $scope.selectionCriteria = 'TableId';
      $scope.valueSetDefinitionGroups = [];
      $scope.valueSetIds = null;
      $scope.vocabularyLibrary = null;
      $scope.loading = false;
      $scope.scrollbarWidth = $rootScope.getScrollbarWidth();


//            $rootScope.$on($scope.type + ':valueSetLibraryLoaded', function (event, vocabularyLibrary) {
//                $scope.vocabularyLibrary = vocabularyLibrary;
//                $scope.init($scope.valueSetIds, $scope.vocabularyLibrary);
//            });

      $scope.$on($scope.type + ':valueSetLibraryLoaded', function (event, vocabularyLibrary) {
        if (vocabularyLibrary != null) {
          $scope.vocabularyLibrary = vocabularyLibrary;
          $scope.init($scope.vocabularyLibrary);
        } else {
          $scope.vocabularyLibrary = null;
        }
      });

//            $rootScope.$on($scope.type + ':valueSetIdsCollected', function (event, valueSetIds) {
//                $scope.valueSetIds = valueSetIds;
//                $scope.init($scope.valueSetIds, $scope.vocabularyLibrary);
//            });

      // $rootScope.$on($scope.type + ':showValueSetDefinition', function (event, tableId) {
      //   $modalStack.dismissAll('close');
      //   var t = VocabularyService.findValueSetDefinition(tableId);
      //   $modal.open({
      //     templateUrl: 'TableFoundCtrl.html',
      //     controller: 'ValueSetDetailsCtrl',
      //     windowClass: 'valueset-modal',
      //     animation: false,
      //     keyboard: true,
      //     backdrop: true,
      //     resolve: {
      //       table: function () {
      //         return t;
      //       }
      //     }
      //   });
      // });

//            $scope.init = function (valueSetIds, vocabularyLibrary) {
//                $scope.loading = true;
//                if (valueSetIds != null && vocabularyLibrary != null) {
//                    VocabularyService.getJson(vocabularyLibrary.id).then(function (obj) {
//                        vocabularyLibrary['json'] = angular.fromJson(obj);
//                        var all = angular.fromJson(vocabularyLibrary.json).valueSetDefinitions.valueSetDefinitions;
//                        $scope.valueSetDefinitionGroups = VocabularyService.initValueSetDefinitionGroups(all, valueSetIds);
//                        $scope.loading = false;
//                    }, function (error) {
//                        $scope.error = "Sorry, Cannot load the vocabulary.";
//                        $scope.loading = false;
//                    });
//                }
//            };

      $scope.init = function (vocabularyLibrary) {
        $scope.error = null;
        if (vocabularyLibrary != null) {
          $scope.loading = true;
          VocabularyService.getJson(vocabularyLibrary.id).then(function (obj) {
            vocabularyLibrary['json'] = angular.fromJson(obj);
            var all = angular.fromJson(vocabularyLibrary.json).valueSetDefinitions;
            $scope.valueSetDefinitionGroups = VocabularyService.initValueSetDefinitionGroups(all);
            $scope.loading = false;
          }, function (error) {
            $scope.error = "Sorry, Cannot load the vocabulary.";
            $scope.loading = false;
          });
        } else {
          $scope.valueSetDefinitionGroups = null;
        }
      };

      $scope.searchTableValues = function () {
        $scope.selectedValueSetDefinition = null;
        $scope.selectedTableLibrary = null;
        $scope.searchResults = [];
        $scope.tmpSearchResults = [];
        if ($scope.searchString != null) {
          $scope.searchResults = VocabularyService.searchTableValues($scope.searchString, $scope.selectionCriteria);
          $scope.vocabResError = null;
          $scope.selectedValueSetDefinition = null;
          $scope.tmpTableElements = null;
          if ($scope.searchResults.length == 0) {
            $scope.vocabResError = "No results found for entered search criteria.";
          }
          else if ($scope.searchResults.length === 1 && ($scope.selectionCriteria === 'TableId' || $scope.selectionCriteria === 'ValueSetName' || $scope.selectionCriteria === 'ValueSetCode')) {
            $scope.selectValueSetDefinition2($scope.searchResults[0]);
          }

          $scope.tmpSearchResults = [].concat($scope.searchResults);
        }
      };

      $scope.selectValueSetDefinition = function (tableDefinition, tableLibrary) {
        $scope.searchResults = [];
        $scope.selectionCriteria = "TableId";
        $scope.searchString = null;
        $scope.selectedValueSetDefinition = tableDefinition;
        $scope.selectedTableLibrary = tableLibrary;
        $scope.selectedValueSetDefinition.valueSetElements = $filter('orderBy')($scope.selectedValueSetDefinition.valueSetElements, 'code');
        $scope.tmpTableElements = [].concat($scope.selectedValueSetDefinition.valueSetElements);
      };

      $scope.clearSearchResults = function () {
        $scope.searchResults = null;
        $scope.selectedValueSetDefinition = null;
        $scope.vocabResError = null;
        $scope.tmpTableElements = null;
        $scope.tmpSearchResults = null;
      };

      $scope.selectValueSetDefinition2 = function (tableDefinition) {
        $scope.selectedValueSetDefinition = tableDefinition;
        $scope.selectedValueSetDefinition.tableElements = $filter('orderBy')($scope.selectedValueSetDefinition.tableElements, 'code');
        $scope.tmpTableElements = [].concat($scope.selectedValueSetDefinition.tableElements);
      };


      $scope.isNoValidation = function () {
        return $scope.selectedValueSetDefinition != null && $scope.selectedTableLibrary && $scope.selectedTableLibrary.noValidation && $scope.selectedTableLibrary.noValidation.ids && $scope.selectedTableLibrary.noValidation.ids.indexOf($scope.selectedValueSetDefinition.bindingIdentifier) > 0;
      };

      $scope.isNoCodeFound = function (id) {
        for (var i = 0; i < $scope.selectedTableLibrary.noValidation.ids.length; i++) {
          if ($scope.selectedTableLibrary.noValidation.ids[i].id === id) {
            return true;
          }
        }
        return false;
      };


      $scope.openCopyrightDlg = function () {
        $modalStack.dismissAll('close');
        var modalInstance = $modal.open({
          templateUrl: 'ValueSetCopyrightCtrl.html',
          windowClass: 'valueset-modal',
          animation: false,
          keyboard: true,
          backdrop: true,
          controller: 'ValueSetCopyrightCtrl'
        });
      };


    }]);

  angular.module('hit-vocab-search').controller('ValueSetCopyrightCtrl', function ($scope, $modalInstance) {
    $scope.close = function () {
      $modalInstance.dismiss('cancel');
    };
  });

  angular.module('hit-vocab-search')
    .controller('VocabGroupCtrl', ['$scope', '$timeout', '$rootScope', '$filter', '$modalStack', function ($scope, $timeout, $rootScope, $filter, $modalStack) {
      $scope.tableList = [];
      $scope.tmpList = [].concat($scope.tableList);
      $scope.error = null;
      $scope.tableLibrary = null;
      $scope.scrollbarWidth = $rootScope.getScrollbarWidth();

      $scope.init = function (tableLibrary) {
        if (tableLibrary) {
          $scope.tableLibrary = tableLibrary;
          $scope.tableList = $filter('orderBy')(tableLibrary.valueSetDefinitions, 'bindingIdentifier');
          $scope.tmpList = [].concat($scope.tableList);

        }
      };
    }]);


  mod.factory('VocabularyService', function ($http, $q, $filter) {

    var VocabularyService = {
      valueSetDefinitionGroups: [],
      searchTableValues: function (searchString, selectionCriteria) {
        var searchResults = [];
        if (searchString != null) {
          if (selectionCriteria === 'TableId') {
            angular.forEach(VocabularyService.valueSetDefinitionGroups, function (valueSetDefinitionsGroup) {
              angular.forEach(valueSetDefinitionsGroup.valueSetDefinitions, function (valueSetDefinition) {
                if (valueSetDefinition.bindingIdentifier && valueSetDefinition.bindingIdentifier.indexOf(searchString) !== -1) {
                  searchResults.push(valueSetDefinition);
                }
              });
            });
          } else if (selectionCriteria === 'Value') {
            angular.forEach(VocabularyService.valueSetDefinitionGroups, function (valueSetDefinitionsGroup) {
              angular.forEach(valueSetDefinitionsGroup.valueSetDefinitions, function (valueSetDefinition) {
                angular.forEach(valueSetDefinition.valueSetElements, function (valueSetElement) {
                  if (valueSetElement.value && valueSetElement.value.indexOf(searchString) !== -1) {
                    searchResults.push(valueSetElement);
                  }
                });
              });
            });
          } else if (selectionCriteria === 'Description') {
            angular.forEach(VocabularyService.valueSetDefinitionGroups, function (valueSetDefinitionsGroup) {
              angular.forEach(valueSetDefinitionsGroup.valueSetDefinitions, function (valueSetDefinition) {
                angular.forEach(valueSetDefinition.valueSetElements, function (valueSetElement) {
                  if (valueSetElement.displayName && valueSetElement.displayName.indexOf(searchString) !== -1) {
                    searchResults.push(valueSetElement);
                  }
                });
              });
            });
          } else if (selectionCriteria === 'ValueSetCode') {
            angular.forEach(VocabularyService.valueSetDefinitionGroups, function (valueSetDefinitionsGroup) {
              angular.forEach(valueSetDefinitionsGroup.valueSetDefinitions, function (valueSetDefinition) {
                if (valueSetDefinition.codeSystem && valueSetDefinition.codeSystem.indexOf(searchString) !== -1) {
                  searchResults.push(valueSetDefinition);
                }
              });
            });
          } else if (selectionCriteria === 'ValueSetName') {
            angular.forEach(VocabularyService.valueSetDefinitionGroups, function (valueSetDefinitionsGroup) {
              angular.forEach(valueSetDefinitionsGroup.valueSetDefinitions, function (valueSetDefinition) {
                if (valueSetDefinition.name && valueSetDefinition.name.indexOf(searchString) !== -1) {
                  searchResults.push(valueSetDefinition);
                }
              });
            });
          }
        }
        return searchResults;
      },
      searchTablesById: function (bindingIdentifier) {
        var valueSetDefinitions = [];
        angular.forEach(VocabularyService.valueSetDefinitionGroups, function (valueSetDefinitionsGroup) {
          angular.forEach(valueSetDefinitionsGroup.valueSetDefinitions, function (valueSetDefinition) {
            if (valueSetDefinition.bindingIdentifier && valueSetDefinition.bindingIdentifier.indexOf(bindingIdentifier) !== -1) {
              valueSetDefinitions.push(valueSetDefinition);
            }

          });
        });

        return valueSetDefinitions;
      },

      searchTableById: function (bindingIdentifier) {
        var valueSetDefinitions = [];
        angular.forEach(VocabularyService.valueSetDefinitionGroups, function (valueSetDefinitionsGroup) {
          angular.forEach(valueSetDefinitionsGroup.valueSetDefinitions, function (valueSetDefinition) {
            if (valueSetDefinition.bindingIdentifier && valueSetDefinition.bindingIdentifier === bindingIdentifier) {
              valueSetDefinitions.push(valueSetDefinition);
            }

          });
        });
        return valueSetDefinitions;
      },

      initValueSetDefinitionGroups: function (all) {
        var that = this;
        VocabularyService.valueSetDefinitionGroups = $filter('orderBy')(all, 'position');
        angular.forEach(VocabularyService.valueSetDefinitionGroups, function (valueSetDefinitionGroup) {
          angular.forEach(valueSetDefinitionGroup.valueSetDefinitions, function (valueSetDefinition) {
            valueSetDefinition.valueSetElements = $filter('orderBy')(valueSetDefinition.valueSetElements, 'value');
          });
        });
        return that.valueSetDefinitionGroups;
      },

      findValueSetDefinition: function (tableId) {
        var tables = VocabularyService.searchTableById(tableId, VocabularyService.valueSetDefinitionGroups);
        var t = tables.length > 0 ? tables[0] : null;
        return t;
      },

      getJson: function (id) {
        var delay = $q.defer();
        $http.get('api/valueSetLibrary/' + id).then(
          function (object) {
            try {
              delay.resolve(angular.fromJson(object.data));
            } catch (e) {
              delay.reject("Invalid character");
            }
          },
          function (response) {
            delay.reject(response.data);
          }
        );

        return delay.promise;
      }
    };

    return VocabularyService;

  });


  mod.controller('ValueSetDetailsCtrl', function ($scope, $modalInstance, table, $rootScope, $filter) {
    $scope.valueSet = table;
    $scope.scrollbarWidth = $rootScope.getScrollbarWidth();
    //table.valueSetElements=  $filter('orderBy')(table != null ? table.valueSetElements: [], 'bindingIdentifier');
    $scope.tmpValueSetElements = [].concat(table != null ? table.valueSetElements : []);
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
    $scope.close = function () {
      $modalInstance.close();
    };

  });


})(angular);
