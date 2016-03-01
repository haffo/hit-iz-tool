angular.module('edi', ['hl7v2-edi']);

angular.module('edi').factory('EDICursorService',
    ['HL7V2EDICursorServiceClass', function (HL7V2EDICursorServiceClass) {

        var EDICursorServiceClass = function () {
            HL7V2EDICursorServiceClass.call(this, arguments);
        };

        EDICursorServiceClass.prototype = Object.create(HL7V2EDICursorServiceClass.prototype);
        EDICursorServiceClass.prototype.constructor = EDICursorServiceClass;
        return  new EDICursorServiceClass();
    }]);


angular.module('edi').factory('EDIEditorService',
    ['HL7V2EDIEditorServiceClass', function (HL7V2EDIEditorServiceClass) {

        var EDIEditorServiceClass = function () {
            HL7V2EDIEditorServiceClass.call(this, arguments);
        };

        EDIEditorServiceClass.prototype = Object.create(HL7V2EDIEditorServiceClass.prototype);
        EDIEditorServiceClass.prototype.constructor = EDIEditorServiceClass;

        return new EDIEditorServiceClass();

    }]);


angular.module('edi').factory('EDITreeService',
    ['HL7V2EDITreeServiceClass',function ( HL7V2EDITreeServiceClass) {

        var EDITreeServiceClass = function () {
            HL7V2EDITreeServiceClass.call(this, arguments);
        };

        EDITreeServiceClass.prototype = Object.create(HL7V2EDITreeServiceClass.prototype);
        EDITreeServiceClass.prototype.constructor = EDITreeServiceClass;

        return new EDITreeServiceClass();
    }]);


angular.module('edi').factory('EDIMessageValidator', function ($http, $q, MessageValidatorClass) {

    var EDIMessageValidatorClass = function () {
        MessageValidatorClass.call(this, 'edi');
    };

    EDIMessageValidatorClass.prototype = Object.create(MessageValidatorClass.prototype);
    EDIMessageValidatorClass.prototype.constructor = EDIMessageValidatorClass;

    return new EDIMessageValidatorClass();
});

angular.module('edi').factory('EDIMessageParser', function ($http, $q, MessageParserClass) {
    var EDIMessageParserClass = function () {
        MessageParserClass.call(this, 'edi');
    };
    EDIMessageParserClass.prototype = Object.create(MessageParserClass.prototype);
    EDIMessageParserClass.prototype.constructor = EDIMessageParserClass;
    return new EDIMessageParserClass();
});

angular.module('edi').factory('EDIReportService', function ($http, $q, ReportServiceClass) {
    var EDIReportServiceClass = function () {
        ReportServiceClass.call(this, 'edi');
    };
    EDIReportServiceClass.prototype = Object.create(ReportServiceClass.prototype);
    EDIReportServiceClass.prototype.constructor = EDIReportServiceClass;

    return new EDIReportServiceClass();
});

angular.module('edi').factory('EDICursor', function (HL7V2EDICursorClass) {
    return new HL7V2EDICursorClass();
});


angular.module('edi').factory('EDIEditor', function (HL7V2EDIEditorClass) {
    return new HL7V2EDIEditorClass();
});


