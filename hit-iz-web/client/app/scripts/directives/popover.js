/**
 * Created by haffo on 2/19/15.
 */

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