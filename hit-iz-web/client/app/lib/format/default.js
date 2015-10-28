/**
 * Created by haffo on 10/9/15.
 */
angular.module('default', ['format']);
angular.module('default').factory('DefaultCursorService', function (CursorService) {
    return new CursorService();
});

angular.module('default').factory('DefaultEditorService', function (EditorService) {
    return new EditorService();
});

angular.module('default').factory('DefaultTreeService', function (TreeService) {
    return new TreeService();
});

angular.module('default').factory('DefaultMessageValidator', function (MessageValidatorClass) {
    return new MessageValidatorClass();
});

angular.module('default').factory('DefaultMessageParser', function (MessageParserClass) {
    return new MessageParserClass();

});

angular.module('default').factory('DefaultReportService', function (ReportServiceClass) {
    return new ReportServiceClass();
});


angular.module('default').factory('DefaultCursor', function (CursorClass) {
    return new CursorClass();
});

angular.module('default').factory('DefaultEditor', function (EditorClass) {
    return new EditorClass();
});
