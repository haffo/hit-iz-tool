/**
 * Created by haffo on 5/4/15.
 */

(function ( angular ) {
    'use strict';
    var mod =  angular.module('hit-validation-result', [] );

    mod.directive('validationResult', [
        function () {
            return {
                restrict: 'A',
                scope: {
                    type: '@',
                    message: '=',
                    tree:'=',
                    editor:'=',
                    cursor:'='
                },
                templateUrl:'lib/validation-result/validation-result.html',
                replace: false,
                controller: 'ValidationResultCtrl'
            };
        }
    ]);


    mod.directive('validationResultTable', [
        function () {
            return {
                restrict: 'A',
                templateUrl:'lib/validation-result/validation-result-table.html',
                replace: false
             };
        }
    ]);

    mod
        .controller('ValidationResultCtrl', ['$scope', '$filter', '$modal', '$rootScope', 'ValidationResultHighlighter', '$sce','HL7TreeUtils','HL7EditorUtils', function ($scope, $filter, $modal, $rootScope, ValidationResultHighlighter,$sce,HL7TreeUtils,HL7EditorUtils) {
            $scope.validationTabs = new Array();
            $scope.activeTab = 0;
            $scope.validationResult = null;
            $scope.validResultHighlither = null;
            $scope.validationConfig = {
                dqa : {
                    checked:false
                }
            };
            $scope.failuresConfig = {
                errors : {
                    className : "failure failure-errors",
                    checked:false
                },
                alerts : {
                    className : "failure failure-alerts",
                    checked:false
                },
                warnings : {
                    className : "failure failure-warnings",
                    checked:false
                },
                informationals : {
                    className : "failure failure-infos",
                    checked:false
                },
                affirmatives : {
                    className : "failure failure-affirmatives",
                    checked:false
                }
            };

            $scope.data = [];
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

            $scope.initValidationData = function(data){
                $scope.data = data;
                $scope.tmpData = [].concat($scope.data);
//                $(window).resize();
            };

            $scope.select = function (element) {
                if (element != undefined && element.path != null && element.line != -1) {
                    var node = HL7TreeUtils.selectNodeByPath($scope.tree.root, element.line, element.path);
                    var data = node != null ? node.data : null;
                    $scope.cursor.init(data != null ? data.lineNumber : element.line, data != null ? data.startIndex - 1 : element.column - 1, data != null ? data.endIndex - 1 : element.column - 1, data != null ? data.startIndex - 1 : element.column - 1, false);
                    HL7EditorUtils.select($scope.editor.instance, $scope.cursor);
                }
            };


            $rootScope.$on($scope.type + ':validationResultLoaded', function (event,validationResult) {
                $scope.validationResult = validationResult;
                if($scope.validationResult && $scope.validationResult  != null) {
                    $scope.validResultHighlither = new ValidationResultHighlighter($scope.failuresConfig, $scope.message, $scope.validationResult, $scope.tree, $scope.editor);
                    $scope.validationTabs[0] = true;
                    $scope.failuresConfig.errors.checked = false;
                    $scope.failuresConfig.warnings.checked = false;
                    $scope.failuresConfig.alerts.checked = false;
                    $scope.failuresConfig.informationals.checked = false;
                    $scope.failuresConfig.affirmatives.checked = false;
                    $scope.hideAllFailures();
                    $scope.initValidationData($scope.validationResult['errors'].categories[0].data);
                }
             });

            $scope.hideAllFailures = function () {
                if($scope.validResultHighlither != null) {
                    $scope.validResultHighlither.hideAllFailures();
                 }
            };

            $scope.showFailures = function (type, event) {
                if($scope.validResultHighlither != null)
                    $scope.validResultHighlither.showFailures(type, event);
            };

            $scope.isVFailureChecked = function (type) {
                return $scope.failuresConfig[type].checked;
            };

            $scope.toHTML = function (content) {
                return $sce.trustAsHtml(content);
            };
        }]);



    mod.factory('ValidationResultHighlighter', function ($http, $q, HL7TreeUtils) {
        var ValidationResultHighlighter = function (failuresConfig, message, result, tree, editor) {
            this.failuresConfig = failuresConfig;
            this.histMarksMap = {};
            this.message = message;
            this.result = result;
            this.tree = tree;
            this.editor = editor;
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


        ValidationResultHighlighter.prototype.showFailures = function (type, event) {
            if (angular.element(event.currentTarget).prop('tagName') === 'INPUT') {
                event.stopPropagation();
            }
            if (this.result  && this.result != null && this.tree.root) {
                var failures = this.result[type]["categories"][0].data;
                var colorClass = this.failuresConfig[type].className;
                var checked = this.failuresConfig[type].checked;
                var hitMarks = this.histMarksMap[type];
                var root = this.tree.root;
                var editor = this.editor;
                var content = this.message.content;
                var histMarksMap = this.histMarksMap;
                if (!hitMarks || hitMarks.length === 0) {
                    angular.forEach(failures, function (failure) {
                        var node = HL7TreeUtils.findByPath(root, failure.line, failure.path);
                        if (node != null && node.data && node.data != null) {
                            var endIndex = HL7TreeUtils.getEndIndex(node, content) - 1;
                            var startIndex = node.data.startIndex - 1;
                            var line = parseInt(failure.line) - 1;
                            var markText = editor.instance.doc.markText({
                                line: line,
                                ch: startIndex
                            }, {
                                line: line,
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
                    this.hideFailures(this.histMarksMap[type]);
                }
            }
        };


        return ValidationResultHighlighter;
    });


    mod.factory('NewValidationResult', function (ValidationResult, HL7Utils) {
        var NewValidationResult = function (key) {
            ValidationResult.apply(this, arguments);
            this.json = null;
            this.structure = null;
            this.content = null;
            this.valueSet = null;
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


//    NewValidationResult.prototype.addResult = function (entryObject, result, categoryType) {
//        var all = this.getCategory(entryObject, "All");
//        all.data.push(result);
//        var other = this.getCategory(entryObject, categoryType);
//        other.data.push(result);
//    };


        NewValidationResult.prototype.guid = function() {
            var d = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = (d + Math.random()*16)%16 | 0;
                d = Math.floor(d/16);
                return (c=='x' ? r : (r&0x3|0x8)).toString(16);
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
                entry['id'] = this.guid();
                if (entry['classification'] === 'Error') {
                    this.addResult(this.errors, entry);
                }else if (entry['classification'] === 'Warning') {
                    this.addResult(this.warnings, entry);
                }else if (entry['classification'] === 'Alert') {
                    this.addResult(this.alerts, entry);
                }else if (entry['classification'] === 'Affirmative' || entry['classification'] === 'Informational' || entry['classification'] === 'Info') {
                    this.addResult(this.affirmatives, entry);
                }
//                else if (entry['classification'] === 'DQA') {
//                    this.addResult(this.dqas, entry);
//                }
            } catch (error) {
//                console.log(error);
            }
        };

        NewValidationResult.prototype.init = function (report) {
            ValidationResult.prototype.clear.call(this);
            this.json = report;
//            if (report['Report']) {
//                for (var i = 0; i < report['Report'].length; i++) {
//                    var item = report['Report'][i];
//                    this.addItem(item['Entry']);
//                }
//            }

//        while(i < report.length) {
//            var item = report[i];
//            this.addItem(item);
//
//            while(x < parentJSON.length &&
//                (x = parentJSON.indexOf(item, x)) != -1) {
//
//                count += 1;
//                parentJSON.splice(x,1);
//            }
//
//            parentJSON[i] = new Array(parentJSON[i],count);
//            ++i;
//        }


//
//        if(entries) {
//            for (var i = 0; i < entries.length; i++) {
//                this.addItem(entries[i]);
//            }
//        }

        var entriesNode = report.entries;
        if(entriesNode) {
            var that = this;
            this.structure = entriesNode.structure;
            this.content = entriesNode.content;
            this.valueSet = entriesNode['value-set'];
            if (this.structure) {
                angular.forEach(this.structure, function (item) {
                    that.addItem(item);
                });
            }
            if (this.content) {
                angular.forEach(this.content, function (item) {
                    that.addItem(item);
                });
            }

            if (this.valueSet) {
                angular.forEach(this.valueSet, function (item) {
                    that.addItem(item);
                });
            }
        }

        };
        return NewValidationResult;
    });


})( angular );