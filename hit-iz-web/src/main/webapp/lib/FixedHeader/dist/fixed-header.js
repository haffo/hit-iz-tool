/*
 @license OCI Fixed Header version 0.1.0
 ⓒ 2014 OCI https://github.com/objectcomputing/FixedHeader
 License: MIT
 */

(function (angular) {
    'use strict';

    angular.module('ociFixedHeader', [])
        .directive('ociFixedHeader', function () {
            return function link(scope, elem) {
                // Wrap the contents of every header cell with div.th-inner so that the
                // CSS can relocate it.
                elem.addClass('table-line-break');
                var header = elem.find('thead').find('tr');
                header.addClass('table-header');
                angular.forEach(header.find('th'), function (th) {
                    var classes = th.className;
                    var inner = $('<div class="th-inner" style="width:inherit;"></div>');
//                    inner.css("width", th.width);
                      inner.addClass(classes);
                    angular.element(th).contents().wrap(inner);
                });

                // Make a clone of the header that we hide using css. The purpose of this
                // is to allow the width of the contents of the header to be included
                // in the calculation of the widths of the columns
                var hiddenHeader = header.clone();
                hiddenHeader.addClass('hidden-header').removeClass('table-header');
                header.after(hiddenHeader);

                // wrap the table in a couple of divs that bring in important css modifications
                elem.wrap('<div class="fixed-table-container"></div>');
                elem.wrap('<div class="fixed-table-container-inner"></div>');
            };
        });
})(angular);
