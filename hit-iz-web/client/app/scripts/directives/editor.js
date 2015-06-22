'use strict';

angular.module('tool-directives').directive('hl7editor', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            scope.editor = CodeMirror.fromTextArea(document.getElementById(attrs.id), {
                lineNumbers: true,
                fixedGutter: true,
                theme: "elegant",
                mode: 'edi',
                readOnly:attrs.readonly != undefined && attrs.readonly,
                showCursorWhenSelecting: true
             });

            scope.editor.setSize(null, 300);


            scope.editor.on("change", function (editor) {
                scope.$emit(attrs.type+":editor:update");
            });

            scope.editor.on("dblclick", function (editor) {
                scope.$emit(attrs.type+":editor:dblclick");
            });

            scope.editorInit = true;


//            scope.editor.on("change", function (editor) {
//                $timeout.cancel(scope.tokenPromise);
//                var content = editor.doc.getValue();
//                var load = function () {
//                    //scope.loadMessage(content);
//                };
//                scope.tokenPromise = $timeout(load, scope.loadRate);
//            });
//
//            scope.editor.on("dblclick", function (editor) {
//                scope.$apply(function () {
//                    scope.setCoordinate(true);
//                });
//            });
        }
    }
}]);

angular.module('tool-directives').directive('soapEditor', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            scope.editor = CodeMirror.fromTextArea(document.getElementById(attrs.id), {
                lineNumbers: true,
                fixedGutter: true,
                mode: 'xml',
                readOnly:attrs.readonly != undefined && attrs.readonly,
                showCursorWhenSelecting: true
             });
            scope.editor.setSize(null, 300);

//            if(attrs.value != undefined){
//                scope.editor.doc.setValue(attrs.value);
//            }

//            scope.editor.on("change", function (editor) {
//                scope.$emit(attrs.type+":editor:update", false);
//            });

            scope.editor.on("dblclick", function (editor) {
                scope.$emit(attrs.type+":editor:dblclick");
            });

            scope.editorInit = true;
        }
    }
}]);


