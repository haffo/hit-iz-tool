angular.module('hl7v2', ['hl7v2-edi']);

angular.module('hl7v2').factory('HL7V2CursorService',
    ['HL7V2EDICursorServiceClass', function (HL7V2EDICursorServiceClass) {

        var HL7V2CursorServiceClass = function () {
            HL7V2EDICursorServiceClass.call(this, arguments);
        };

        HL7V2CursorServiceClass.prototype = Object.create(HL7V2EDICursorServiceClass.prototype);
        HL7V2CursorServiceClass.prototype.constructor = HL7V2CursorServiceClass;

        return  new HL7V2CursorServiceClass();
    }]);


angular.module('hl7v2').factory('HL7V2EditorService',
    ['HL7V2EDIEditorServiceClass', function (HL7V2EDIEditorServiceClass) {

        var HL7V2EditorServiceClass = function () {
            HL7V2EDIEditorServiceClass.call(this, arguments);
        };

        HL7V2EditorServiceClass.prototype = Object.create(HL7V2EDIEditorServiceClass.prototype);
        HL7V2EditorServiceClass.prototype.constructor = HL7V2EditorServiceClass;


        HL7V2EditorServiceClass.prototype.isActualFormat = function (message) {
            return message.startsWith("MSH");
        };

        return new HL7V2EditorServiceClass();

    }]);


angular.module('hl7v2').factory('HL7V2TreeService',
    ['HL7V2EDITreeServiceClass', function (HL7V2EDITreeServiceClass) {

        var HL7V2TreeServiceClass = function () {
            HL7V2EDITreeServiceClass.call(this, arguments);
        };

        HL7V2TreeServiceClass.prototype = Object.create(HL7V2EDITreeServiceClass.prototype);
        HL7V2TreeServiceClass.prototype.constructor = HL7V2TreeServiceClass;

        return new HL7V2TreeServiceClass();
    }]);


angular.module('hl7v2').factory('HL7V2MessageValidator', function (MessageValidatorClass) {
    var HL7V2MessageValidatorClass = function () {
         MessageValidatorClass.call(this, 'hl7v2');
    };

    HL7V2MessageValidatorClass.prototype = Object.create(MessageValidatorClass.prototype);
    HL7V2MessageValidatorClass.prototype.constructor = HL7V2MessageValidatorClass;

    return new HL7V2MessageValidatorClass();
});

angular.module('hl7v2').factory('HL7V2MessageParser', function (MessageParserClass) {
    var HL7V2MessageParserClass = function () {
        MessageParserClass.call(this, 'hl7v2');
     };
    HL7V2MessageParserClass.prototype = Object.create(MessageParserClass.prototype);
    HL7V2MessageParserClass.prototype.constructor = HL7V2MessageParserClass;
    return new HL7V2MessageParserClass();
});

angular.module('hl7v2').factory('HL7V2ReportService', function (ReportServiceClass) {
    var HL7V2ReportServiceClass = function () {
        ReportServiceClass.call(this, 'hl7v2');
     };
    HL7V2ReportServiceClass.prototype = Object.create(ReportServiceClass.prototype);
    HL7V2ReportServiceClass.prototype.constructor = HL7V2ReportServiceClass;
    return new HL7V2ReportServiceClass();
});

angular.module('hl7v2').factory('HL7V2Cursor', function (HL7V2EDICursorClass) {
    return new HL7V2EDICursorClass();
});


angular.module('hl7v2').factory('HL7V2Editor', function (HL7V2EDIEditorClass) {
    return new HL7V2EDIEditorClass();
});