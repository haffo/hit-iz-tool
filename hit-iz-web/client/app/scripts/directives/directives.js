/**
 * Created by haffo on 2/13/15.
 */


angular.module('hit-tool-directives').directive('compile', function ($compile) {
    return function(scope, element, attrs) {
        scope.$watch(
            function(scope) {
                // watch the 'compile' expression for changes
                return scope.$eval(attrs.compile);
            },
            function(value) {
                // when the 'compile' expression changes
                // assign it into the current DOM
                element.html(value);

                // compile the new DOM and link it to the current
                // scope.
                // NOTE: we only compile .childNodes so that
                // we don't get into infinite loop compiling ourselves
                $compile(element.contents())(scope);
            }
        );
    };
});


angular.module('hit-tool-directives').directive('stRatio',function(){
    return {
        link:function(scope, element, attr){
            var ratio=+(attr.stRatio);
            element.css('width',ratio+'%');
        }
    };
});


angular.module('hit-tool-directives').directive('csSelect', function () {
    return {
        require: '^stTable',
        template: '',
        scope: {
            row: '=csSelect'
        },
        link: function (scope, element, attr, ctrl) {

            element.bind('change', function (evt) {
                scope.$apply(function () {
                    ctrl.select(scope.row, 'single');
                });
            });

            scope.$watch('row.isSelected', function (newValue, oldValue) {
                if (newValue === true) {
                    element.parent().addClass('st-selected');
                } else {
                    element.parent().removeClass('st-selected');
                }
            });
        }
    };
});


angular.module('hit-tool-directives').directive('mypopover', function ($compile,$templateCache) {
    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            var  popOverContent = $templateCache.get("profileInfo.html");
            var options = {
                content: popOverContent,
                placement: "bottom",
                html: true
            };
            $(element).popover(options);
        }
    };
});


angular.module('hit-tool-directives').directive('windowExit', function($window, $templateCache,$http,User) {
    return {
        restrict: 'AE',
        //performance will be improved in compile
        compile: function(element, attrs){
            var myEvent = $window.attachEvent || $window.addEventListener,
                chkevent = $window.attachEvent ? 'onbeforeunload' : 'beforeunload'; /// make IE7, IE8 compatable
            myEvent(chkevent, function (e) { // For >=IE7, Chrome, Firefox
                $templateCache.removeAll();
            });
        }
    };
});


angular.module('hit-tool-directives')
    .directive('msg', [function () {
        return {
            restrict: 'EA',
            replace: true,
            link: function (scope, element, attrs) {
                //console.log("Dir");
                var key = attrs.key;
                if (attrs.keyExpr) {
                    scope.$watch(attrs.keyExpr, function (value) {
                        key = value;
                        element.text($.i18n.prop(value));
                    });
                }
                scope.$watch('language()', function (value) {
                    element.text($.i18n.prop(key));
                });
            }
        };
    }]);



angular.module('hit-tool-directives').directive('selectMin', function () {
  return {
    restrict: 'A',
    require: 'ngModel',
    scope: {
      ngMin: '='
    },
    link: function ($scope, $element, $attrs, ngModelController) {
      ngModelController.$validators.min = function (value) {
        if (value) {
          return value >= $scope.ngMin;
        }
        return true;
      };
    }
  };
});
