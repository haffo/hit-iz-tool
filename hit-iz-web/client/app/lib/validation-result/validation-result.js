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
                report:'=',
                tree:'=',
                editor:'='
            },
            templateUrl:'/lib/validation-result/validation-result.html',
            replace: false,
            controller: 'ValidationResultCtrl'
        };
    }
]);

    mod
    .controller('ValidationResultCtrl', ['$scope', '$filter', '$modal', '$rootScope', 'ValidationResultHighlighter', function ($scope, $filter, $modal, $rootScope, ValidationResultHighlighter) {
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

        $rootScope.$on($scope.type + ':validationResultLoaded', function (event,validationResult) {
            $scope.validResultHighlither = new ValidationResultHighlighter($scope.failuresConfig,$scope.message, $scope.report, $scope.tree, $scope.editor);
            $scope.validationResult = validationResult;
            $scope.validationTabs[0] = true;
            $scope.failuresConfig.errors.checked = false;
            $scope.failuresConfig.warnings.checked = false;
            $scope.failuresConfig.alerts.checked = false;
            $scope.failuresConfig.informationals.checked = false;
            $scope.failuresConfig.affirmatives.checked = false;
            $scope.hideAllFailures();
        });


        $scope.hideAllFailures = function () {
            if($scope.validResultHighlither != null)
            $scope.validResultHighlither.hideAllFailures();
        };

        $scope.showFailures = function (type, event) {
            if($scope.validResultHighlither != null)
            $scope.validResultHighlither.showFailures(type, event);
        };

        $scope.isVFailureChecked = function (type) {
            return $scope.failuresConfig[type].checked;
        };

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

    }]);


    mod.factory('ValidationResultHighlighter', function ($http, $q, HL7TreeUtils) {
    var ValidationResultHighlighter = function (failuresConfig, message, report, tree, editor) {
        this.failuresConfig = failuresConfig;
        this.histMarksMap = {};
        this.message = message;
        this.report = report;
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
        if (this.report && this.tree.root) {
            var failures = this.report["result"][type]["categories"][0].data;
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
})( angular );