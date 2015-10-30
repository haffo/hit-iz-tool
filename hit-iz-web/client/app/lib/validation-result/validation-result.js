/**
 * Created by haffo on 5/4/15.
 */

(function (angular) {
    'use strict';
    var mod = angular.module('hit-validation-result', []);

    mod.directive('validationResult', [
        function () {
            return {
                restrict: 'A',
                scope: {
                    type: '@',
                    message: '=',
                    dqa: '=',
                    tree: '=',
                    editor: '=',
                    cursor: '=',
                    format: '='
                },
                templateUrl: 'lib/validation-result/validation-result.html',
                replace: false,
                controller: 'ValidationResultCtrl'
            };
        }
    ]);


    mod.directive('validationResultTable', [
        function () {
            return {
                restrict: 'A',
                templateUrl: 'lib/validation-result/validation-result-table.html',
                replace: false
            };
        }
    ]);

    mod
        .controller('ValidationResultCtrl', ['$scope', '$filter', '$modal', '$rootScope', 'ValidationResultHighlighter', '$sce', 'NewValidationResult', '$timeout', 'ServiceDelegator',function ($scope, $filter, $modal, $rootScope, ValidationResultHighlighter, $sce, NewValidationResult, $timeout,ServiceDelegator) {
            $scope.validationTabs = new Array();
            $scope.currentType = null;


            $scope.activeTab = 0;
            $scope.validationResult = null;
            $scope.loadingCategory = false;
            $scope.validResultHighlither = null;
            $scope.active = {
                errors: true,
                alerts: false,
                warnings: false,
                informationals: false,
                affirmatives: false
            };

            $scope.subActive = {
                errors: {
                },
                alerts: {
                },
                warnings: {
                },
                informationals: {
                },
                affirmatives: {
                }
            };

            $scope.checkboxConfig = {
            };

            $scope.failuresConfig = {
                errors: {
                    className: "failure failure-errors",
                    checked: false,
                    active: false
                },
                alerts: {
                    className: "failure failure-alerts",
                    checked: false,
                    active: false
                },
                warnings: {
                    className: "failure failure-warnings",
                    checked: false,
                    active: false
                },
                informationals: {
                    className: "failure failure-infos",
                    checked: false,
                    active: false
                },
                affirmatives: {
                    className: "failure failure-affirmatives",
                    checked: false,
                    active: false
                }
            };

             $scope.currentCategory = null;
            $scope.currentType =null;
            $scope.tmpData = [];
//            $scope.gridOptions = {};
//            $scope.gridOptions.columnDefs = [
//                { name:'path',width:40},
//                { name:'description'},
//                { name:'column',width:20},
//                { name:'stackTrace',width:40,cellTemplate: '<div class="ui-grid-cell-contents"><a ng-show="COL_FIELD != null" class="point" ng-click="grid.appScope.showDetails(COL_FIELD)">StackTrace</a></div>'},
//                { name:'metaData',width:40, cellTemplate: '<div class="ui-grid-cell-contents"><a ng-show="COL_FIELD != null" class="point" ng-click="grid.appScope.showDetails(COL_FIELD)">MetaData</a></div>'}
//            ];
//            $scope.gridOptions.data = 'data';
//            $scope.gridOptions.enableColumnResizing = true;
//            $scope.gridOptions.enableGridMenu = true;
//            $scope.gridOptions.showColumnFooter = true;
//            $scope.gridOptions.fastWatch = true;
//
//            $scope.gridOptions.rowIdentity = function(row) {
//                return row.id;
//            };
//            $scope.gridOptions.getRowIdentity = function(row) {
//                return row.id;
//            };
//
//            $scope.gridOptions.onRegisterApi = function(gridApi){
//                $scope.gridApi = gridApi;
//            };

            $scope.showDetails = function (element) {
                var modalInstance = $modal.open({
                    templateUrl: 'ValidationResultDetailsCtrl.html',
                    controller: 'ValidationResultDetailsCtrl',
                    resolve: {
                        selectedElement: function () {
                            return element;
                        }
                    }
                });
                modalInstance.result.then(function (selectedItem) {
                    $scope.selectedElement = selectedItem;
                }, function () {
                });
            };

//            $scope.initValidationData = function (data) {
//                $scope.loadingCategory = true;
//                $scope.data = data;
//                $scope.tmpData = [].concat($scope.data);
//                $scope.loadingCategory = false;
//            };

            $scope.showValidationTable = function (currentCategory, currentType) {
                $scope.loadingCategory = true;
                $scope.currentCategory = currentCategory;
                $scope.currentType = currentType;
                $scope.tmpData = [].concat($scope.currentCategory.data);
                $scope.subActive = {};
                $scope.subActive[currentType] = {};
                $scope.subActive[currentType][currentCategory.title] = true;
                $scope.loadingCategory = false;
            };

            $scope.select = function (element) {
                if (element != undefined && element.path != null && element.line != -1) {
                    var node = $scope.treeService.selectNodeByPath($scope.tree.root, element.line, element.path);
                    if(node != null) {
                        var endIndex = $scope.treeService.getEndIndex(node, $scope.editor.instance.getValue());
                        node.data.endIndex = endIndex;
                        var coordinate = angular.copy(node.data);
                        coordinate.lineNumber = element.line;
                        $scope.cursor.init(coordinate, false);
                        if ($scope.editorService != null) {
                            $scope.editorService.select($scope.editor.instance, $scope.cursor);
                        }
                    }
                }
            };

            $scope.$on($scope.type + ':validationResultLoaded', function (event, mvResult) {
                if($scope.format != null) {
                    $scope.editorService = ServiceDelegator.getEditorService($scope.format);
                    $scope.treeService = ServiceDelegator.getTreeService($scope.format);
                    $scope.cursorService = ServiceDelegator.getCursorService($scope.format);
                }
                var report = null;
                var validationResult = null;
                if (mvResult !== null) {
                    if (!mvResult.result) {
                        validationResult = new NewValidationResult();
                        validationResult.init(mvResult.json);
                        mvResult['result'] = validationResult;
                    } else {
                        validationResult = mvResult.result;
                    }
                }
                $timeout(function () {
                    $scope.$emit($scope.type + ':reportLoaded', mvResult);
                });

                $scope.validationResult = validationResult;
                if ($scope.validationResult && $scope.validationResult != null) {

                    $scope.checkboxConfig['errors'] = {};
                    $scope.checkboxConfig['alerts'] = {};
                    $scope.checkboxConfig['warnings'] = {};
                    $scope.checkboxConfig['affirmatives'] = {};
                    $scope.checkboxConfig['informationals'] = {};

                    if(validationResult.errors && validationResult.errors.categories) {
                        angular.forEach(validationResult.errors.categories, function (category) {
                            $scope.checkboxConfig['errors'][category.title] = false;
                        });
                    }
                    if(validationResult.alerts&& validationResult.alerts.categories) {
                        angular.forEach(validationResult.alerts.categories, function (category) {
                            $scope.checkboxConfig['alerts'][category.title] = false;
                        });
                    }
                    if(validationResult.warnings&& validationResult.warnings.categories) {
                        angular.forEach(validationResult.warnings.categories, function (category) {
                            $scope.checkboxConfig['warnings'][category.title] = false;
                        });
                    }
                    if(validationResult.affirmatives&& validationResult.affirmatives.categories) {
                        angular.forEach(validationResult.affirmatives.categories, function (category) {
                            $scope.checkboxConfig['affirmatives'][category.title] = false;
                        });
                    }
                    if(validationResult.informationals && validationResult.informationals.categories) {
                        angular.forEach(validationResult.informationals.categories, function (category) {
                            $scope.checkboxConfig['informationals'][category.title] = false;
                        });
                    }
                    $scope.validResultHighlither = new ValidationResultHighlighter($scope.failuresConfig, $scope.message, $scope.validationResult, $scope.tree, $scope.editor, $scope.checkboxConfig, $scope.treeService);
                    $scope.failuresConfig.errors.checked = false;
                    $scope.failuresConfig.warnings.checked = false;
                    $scope.failuresConfig.alerts.checked = false;
                    $scope.failuresConfig.informationals.checked = false;
                    $scope.failuresConfig.affirmatives.checked = false;
                    $scope.firstLoaded = false;
                    $scope.hideAllFailures();
                    $scope.active = {};
                    $scope.active["errors"] = true;
                    $scope.showValidationTable($scope.validationResult['errors'].categories[0], 'errors');
                }
            });


            $scope.hideAllFailures = function () {
                if ($scope.validResultHighlither != null) {
                    $scope.validResultHighlither.hideAllFailures();
                }
            };

            $scope.showFailures = function () {
//                if (event.isPropagationStopped()) {
//                    event.stopPropagation();
//                }
//                if (angular.element(event.currentTarget).prop('tagName') === 'INPUT') {
//                    event.stopPropagation();
//                }
                if ($scope.validResultHighlither != null)
                    $scope.validResultHighlither.toggleFailures($scope.currentType, $scope.currentCategory);
            };

            $scope.isVFailureChecked = function (type) {
                return $scope.failuresConfig[type].checked;
            };

            $scope.toHTML = function (content) {
                return $sce.trustAsHtml(content);
            };

            $scope.scrollbarWidth = $rootScope.getScrollbarWidth();

        }]);


    mod.factory('ValidationResultHighlighter', function ($http, $q) {
        var ValidationResultHighlighter = function (failuresConfig, message, result, tree, editor, checkboxConfig,treeService) {
            this.failuresConfig = failuresConfig;
            this.histMarksMap = {};
            this.message = message;
            this.result = result;
            this.tree = tree;
            this.editor = editor;
            this.checkboxConfig = checkboxConfig;
            this.treeService = treeService;
        };

        ValidationResultHighlighter.prototype.getHistMarksMap = function () {
            return this.histMarksMap;
        };

        ValidationResultHighlighter.prototype.hideFailures = function (hitMarks) {
            if (hitMarks && hitMarks.length > 0) {
                for (var i = 0; i < hitMarks.length; i++) {
                    hitMarks[i].clear();
                }
                hitMarks.length = 0;
            }
        };

        ValidationResultHighlighter.prototype.hideAllFailures = function () {
            this.hideFailures(this.histMarksMap['errors']);
            this.hideFailures(this.histMarksMap['warnings']);
            this.hideFailures(this.histMarksMap['affirmatives']);
            this.hideFailures(this.histMarksMap['informationals']);
            this.hideFailures(this.histMarksMap['alerts']);
        };

        ValidationResultHighlighter.prototype.showFailures = function (type, category) {
            if (this.result && this.result != null && this.tree.root) {
                //if(category.checked) {
                var failures = category.data;
                var colorClass = this.failuresConfig[type].className;
                var hitMarks = this.histMarksMap[type];
                var root = this.tree.root;
                var editor = this.editor;
                var content = this.message.content;
                var histMarksMap = this.histMarksMap;
                var that = this;
                if (!hitMarks || hitMarks.length === 0) {
                    this.checkboxConfig[type][category.title] = true;
                    angular.forEach(failures, function (failure) {
                        var node = that.treeService.findByPath(root, failure.line, failure.path);
                        if (node != null && node.data && node.data != null) {
                            that.treeService.getEndIndex(node, content);
                            var startLine = parseInt(node.data.start && node.data.start != null ? node.data.start.line : failure.line) -1;
                            var endLine = parseInt(node.data.end && node.data.end != null ? node.data.end.line: failure.line) -1;
                            var startIndex = parseInt(node.data.start && node.data.start != null ? node.data.start.index: node.data.startIndex) -1;
                            var endIndex = parseInt(node.data.end && node.data.end != null ? node.data.end.index: node.data.endIndex) -1;
                            var markText = editor.instance.doc.markText({
                                line: startLine,
                                ch: startIndex
                            }, {
                                line: endLine,
                                ch: endIndex
                            }, {atomic: true, className: colorClass, clearWhenEmpty: true, clearOnEnter: true, title: failure.description
                            });

                            if (!histMarksMap[type]) {
                                histMarksMap[type] = [];
                            }
                            histMarksMap[type].push(markText);
                        }
                    });
                } else {
                    this.checkboxConfig[type][category.title] = false;
                    this.hideFailures(this.histMarksMap[type]);
                }
            }
        };

        ValidationResultHighlighter.prototype.toggleFailures = function (type, category) {
            if (this.result && this.result != null && this.tree.root) {
                //if(category.checked) {
                var failures = category.data;
                var colorClass = this.failuresConfig[type].className;
                var hitMarks = this.histMarksMap[type];
                var root = this.tree.root;
                var editor = this.editor;
                var content = this.message.content;
                var histMarksMap = this.histMarksMap;
                var that = this;
                if(category.title === 'All'){
                    for (var key in this.checkboxConfig[type]) {
                        this.checkboxConfig[type][key] = this.checkboxConfig[type][category.title];
                    }
                }
                if (this.checkboxConfig[type][category.title]) {
                     angular.forEach(failures, function (failure) {
                        var node = that.treeService.findByPath(root, failure.line, failure.path);
                        if (node != null && node.data && node.data != null) {
                            try {
                                that.treeService.getEndIndex(node, content);
                                var startLine = parseInt(node.data.start && node.data.start != null ? node.data.start.line : failure.line) - 1;
                                var endLine = parseInt(node.data.end && node.data.end != null ? node.data.end.line : failure.line) - 1;
                                var startIndex = parseInt(node.data.start && node.data.start != null ? node.data.start.index : node.data.startIndex) - 1;
                                var endIndex = parseInt(node.data.end && node.data.end != null ? node.data.end.index : node.data.endIndex) - 1;
                                var markText = editor.instance.doc.markText({
                                    line: startLine,
                                    ch: startIndex
                                }, {
                                    line: endLine,
                                    ch: endIndex
                                }, {atomic: true, className: colorClass, clearWhenEmpty: true, clearOnEnter: true, title: failure.description
                                });
                                if (!histMarksMap[type]) {
                                    histMarksMap[type] = [];
                                }
                                histMarksMap[type].push(markText);
                            }catch(e){

                            }
                        }
                    });
                } else {
                     this.hideFailures(this.histMarksMap[type]);
                }
            }
        };

        return ValidationResultHighlighter;
    });


    mod.factory('NewValidationResult', function (ValidationResult, ValidationResultItem) {
        var NewValidationResult = function (key) {
            ValidationResult.apply(this, arguments);
            this.json = null;
        };

        var Entry = function () {
            this.description = null;
            this.path = null;
            this.line = null;
            this.column = null;
            this.value = null;
            this.details = null;
            this.instance = null;
            this.id = new Date().getTime();
            this.failureType = null;
        };

        Entry.prototype.initLocation = function (l) {
            if (l) {
                this.desc = l.desc;
                this.path = l.path;
                this.line = l.line;
                this.column = l.column;
            }
        };

        NewValidationResult.prototype = Object.create(ValidationResult.prototype);
        NewValidationResult.prototype.constructor = NewValidationResult;

        var guid = function () {
            var d = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
            return uuid;
        };


        NewValidationResult.prototype.addResult = function (entryObject, entry) {
            var all = this.getCategory(entryObject, "All");
            all.data.push(entry);
            var other = this.getCategory(entryObject, entry.category);
            other.data.push(entry);
        };


        NewValidationResult.prototype.getCategory = function (entryObject, categoryType) {
            if (categoryType) {
                var category = null;
                for (var i = 0; i < entryObject.categories.length; i++) {
                    if (entryObject.categories[i].title === categoryType) {
                        category = entryObject.categories[i];
                        break;
                    }
                }
                if (category === null) {
                    category = {"title": categoryType, "data": []};
                    entryObject.categories.push(category);
                }
                return category;
            }

            return null;
        };


        NewValidationResult.prototype.addItem = function (entry) {
            try {
                entry['id'] = guid();
                if (entry['classification'] === 'Error') {
                    this.addResult(this.errors, entry);
                } else if (entry['classification'] === 'Warning') {
                    this.addResult(this.warnings, entry);
                } else if (entry['classification'] === 'Alert') {
                    this.addResult(this.alerts, entry);
                } else if (entry['classification'] === 'Affirmative' || entry['classification'] === 'Informational' || entry['classification'] === 'Info') {
                    this.addResult(this.affirmatives, entry);
                }
            } catch (error) {
                console.log(error);
            }
        };


        NewValidationResult.prototype.loadDetection = function (detection) {
            if (detection) {
                var that = this;
                angular.forEach(detection, function (det) {
                    angular.forEach(det, function (item) {
                        that.addItem(item);
                    });
                });
            }
        };

        NewValidationResult.prototype.init = function (result) {
            ValidationResult.prototype.clear.call(this);
            if (result) {
                this.json = angular.fromJson(result);
                this.loadDetection(this.json.detections['Error']);
                this.loadDetection(this.json.detections['Alert']);
                this.loadDetection(this.json.detections['Warning']);
                this.loadDetection(this.json.detections['Informational']);
            }

        };
        return NewValidationResult;
    });


})(angular);