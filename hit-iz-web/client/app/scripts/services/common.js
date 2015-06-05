/**
 * Created by haffo on 11/20/14.
 */


angular.module('commonServices').factory('TestCase', function ($http, TestContext, $q) {
    var TestCase = function () {
        this.id = null;
        this.sutType = null;
        this.label = "";
        this.parentName = "";
        this.testStory = {};
        this.updateIndicator = '0';
        this.testPackagePath = null;
        this.testProcedurePath = null;
        this.instructionsText = null;
        this.instructionsImage = null;
        this.messageContentImage = null;
        this.testDataSpecificationImage = null;
        this.testDataSpecificationImage2 = null;
    };

    TestCase.prototype.init = function (newTestCase) {
        if (newTestCase) {
            this.id = newTestCase.id;
            this.sutType = newTestCase.sutType;
            this.testType = newTestCase.testType;
            this.label = newTestCase.label;
            this.parentName = newTestCase.testPlan != undefined ? newTestCase.testPlan.label : newTestCase.parentName;
            this.testStory = newTestCase.testStory;
            this.testPackagePath = newTestCase.testPackagePath;
            this.testProcedurePath = newTestCase.testProcedurePath;
            this.instructionsText = newTestCase.instructionsText;
            this.instructionsImage = newTestCase.instructionsImage;
            this.messageContentImage = newTestCase.messageContentImage;
            this.testDataSpecificationImage = newTestCase.testDataSpecificationImage;
            this.testDataSpecificationImage2 = newTestCase.testDataSpecificationImage2;
            this.type = newTestCase.type;
            this.notifyChange();
        }
    };


    TestCase.prototype.clear = function () {
        this.id = null;
        this.sutType = null;
        this.testType = null;
        this.label = null;
        this.parentName = null;
        this.testStory = {};
        this.testPackagePath = null;
        this.testProcedurePath = null;
        this.instructionsText = null;
        this.instructionsImage = null;
        this.messageContentImage = null;
        this.testDataSpecificationImage = null;
        this.testDataSpecificationImage2 = null;
        this.type = null;
        this.notifyChange();
    };


    TestCase.prototype.notifyChange = function () {
        this.updateIndicator = new Date().getTime();
    };

    TestCase.prototype.downloadTestPackage = function () {
        if (this.id != null) {
            var self = this;
            var form = document.createElement("form");
            form.action = "api/testCases/" + self.id + "/testPackage";
            form.method = "POST";
            form.target = "_target";
            form.style.display = 'none';
            document.body.appendChild(form);
            form.submit();
        }
    };

    TestCase.prototype.downloadTestProcedure = function () {
        if (this.id != null) {
            var self = this;
            var form = document.createElement("form");
            form.action = "api/testPlans/" + self.id + "/testProcedure";
            form.method = "POST";
            form.target = "_target";
            form.style.display = 'none';
            document.body.appendChild(form);
            form.submit();
        }
    };


    return TestCase;
});


angular.module('commonServices').factory('TestStep', function ($http, $q) {
    var TestStep = function () {
        this.id = null;
        this.label = "";
        this.parentName = "";
        this.testStory = {};
        this.description = null;
        this.dataSheetHtmlPath = null;
        this.dataSheetPdfPath = null;
    };

    TestStep.prototype.init = function (testStep) {
        if (testStep) {
            this.id = testStep.id;
            this.label = testStep.label;
            this.type = testStep.type;
            this.parentName = testStep.parentName;
            this.testStory = testStep.testStory;
            this.description = testStep.description;
            this.dataSheetHtmlPath = testStep.dataSheetHtmlPath;
            this.dataSheetPdfPath = testStep.dataSheetPdfPath;
        }
    };

    return TestStep;
});


angular.module('commonServices').factory('TestContext', function ($http, $q) {
    var TestContext = function () {
        this.id = null;
    };

    TestContext.prototype.init = function (newTestContext) {
        this.id = newTestContext.id;
    };

    TestContext.prototype.clear = function () {
        this.id = null;
    };

    return TestContext;
});

angular.module('commonServices').factory('Editor', function ($http, $q) {
    var Editor = function () {
        this.instance = null;
        this.updateIndicator = '0';
        this.id = null;
        this.name = '';
    };

    Editor.prototype.notifyChange = function () {
        this.updateIndicator = new Date().getTime();
    };

    Editor.prototype.init = function (editor) {
        if (editor != undefined) {
            this.instance = editor;
        }
    };

    Editor.prototype.getContent = function () {
        if (this.instance != undefined) {
            return this.instance.doc.getValue();
        }
        return null;
    };

    Editor.prototype.setContent = function (content) {
        if (this.instance != undefined) {
            this.instance.doc.setValue(content);
            this.notifyChange();
        }
    };


    return Editor;
});

angular.module('commonServices').factory('XmlEditor', function (Editor) {
    var XmlEditor = function () {
        Editor.apply(this, arguments);
    };

    XmlEditor.prototype = Object.create(Editor.prototype);
    XmlEditor.prototype.constructor = XmlEditor;

    XmlEditor.prototype.format = function () {
        this.instance.doc.setValue(this.instance.doc.getValue().replace(/\n/g, "")
            .replace(/[\t ]+\</g, "<")
            .replace(/\>[\t ]+\</g, "><")
            .replace(/\>[\t ]+$/g, ">"));
        var totalLines = this.instance.lineCount();
        var totalChars = this.instance.getTextArea().value.length;
        this.instance.autoFormatRange({line: 0, ch: 0}, {line: totalLines, ch: totalChars});
    };

    return XmlEditor;
});


angular.module('commonServices').factory('EDICursor', function () {
    var EDICursor = function () {
        this.line = 1;
        this.startIndex = -1;
        this.endIndex = -1;
        this.index = -1;
        this.segment = "";
        this.updateIndicator = '0';
        this.triggerTree = undefined;
    };

    EDICursor.prototype.init = function (line, startIndex, endIndex, index, triggerTree) {
        this.line = line;
        this.startIndex = startIndex;
        this.endIndex = endIndex;
        this.index = index;
        this.triggerTree = triggerTree;
        this.notify();
    };

    EDICursor.prototype.notify = function () {
        this.updateIndicator = new Date().getTime();
    };

    return EDICursor;
});


angular.module('commonServices').factory('XmlCursor', function () {
    var XmlCursor = function () {
        this.line = -1;
        this.start = {line: 1, index: -1};
        this.end = {line: 1, index: -1};
        this.updateIndicator = '0';
    };

    XmlCursor.prototype.setLine = function (line) {
        this.line = line;
        this.notify();
    };


    XmlCursor.prototype.toString = function (line) {
        return  this.line + "," + this.start + "," + this.end;
    };

    XmlCursor.prototype.notify = function () {
        this.updateIndicator = new Date().getTime();
    };


    return XmlCursor;
});


angular.module('commonServices').factory('ValidationResultItem', function () {
    var ValidationResultItem = function () {
        this.data = [];
        this.categories = [];
        this.categories.push({"title": "All", "data": []});
        this.show = true;
        this.updateIndicator = '0';
    };

    ValidationResultItem.prototype.init = function (data) {
        this.data = data;
        this.categories = [];
        this.categories.push({"title": "All", "data": []});
        this.show = true;
        this.notify();
    };
    ValidationResultItem.prototype.notify = function () {
        this.updateIndicator = new Date().getTime();
    };
    return ValidationResultItem;
});


angular.module('commonServices').factory('ValidationSettings', function () {
    var ValidationSettings = function () {
        this.errors = true;
        this.affirmatives = true;
        this.ignores = true;
        this.alerts = true;
        this.warnings = true;
    };
    return ValidationSettings;
});

angular.module('commonServices').factory('ValidationResult', function (ValidationResultItem, $q) {
    var ValidationResult = function (key) {
        this.key = key;
        this.xml = '';
        this.errors = new ValidationResultItem();
        this.affirmatives = new ValidationResultItem();
        this.ignores = new ValidationResultItem();
        this.alerts = new ValidationResultItem();
        this.warnings = new ValidationResultItem();
        this.informationals = new ValidationResultItem();
        this.id = '';
    };


    ValidationResult.prototype.updateId = function () {
        this.id = new Date().getTime();
    };


    ValidationResult.prototype.clear = function () {
        this.xml = '';
        this.errors = new ValidationResultItem();
        this.affirmatives = new ValidationResultItem();
        this.ignores = new ValidationResultItem();
        this.alerts = new ValidationResultItem();
        this.warnings = new ValidationResultItem();
        this.informationals = new ValidationResultItem();
        this.updateId();
    };

    ValidationResult.prototype.init = function (object) {
        this.xml = object.xml;
        this.errors.init(object.errors);
        this.affirmatives.init(object.affirmatives);
        this.ignores.init(object.ignores);
        this.alerts.init(object.alerts);
        this.warnings.init(object.warnings);
        this.informationals.init(object.informationals);
        this.updateId();
    };


    ValidationResult.prototype.saveState = function () {
        sessionStorage.setItem(this.key, this.content);
    };

    ValidationResult.prototype.restoreState = function () {
        this.content = sessionStorage.getItem(this.key);
    };
    ValidationResult.prototype.hasState = function () {
        return sessionStorage.getItem(this.key) !== {xml: ''} && sessionStorage.getItem(this.key) != null;
    };
    ValidationResult.prototype.getState = function () {
        return sessionStorage.getItem(this.key);
    };
    ValidationResult.prototype.getContent = function () {
        return  this.content;
    };
    ValidationResult.prototype.setContent = function (value) {
        this.content = value;
    };

    return ValidationResult;
});


angular.module('commonServices').factory('NewValidationResult', function (ValidationResult, HL7Utils) {
    var NewValidationResult = function (key) {
        ValidationResult.apply(this, arguments);
        this.json = null;
//        this.content = null;
//        this.structure = null;
//        this.valueSet = null;
//        this.descriptions = {};
//        this.descriptions["InvalidLine"] = "Invalid Segment: '%content%' at line %line% is an invalid segment.";
//        this.descriptions["UnexpectedLine"] = "Unexpected Segment: Segment %content% at line %line% not expected at this location.";
//        this.descriptions["UnescapedSeparators"] = "The primitive element %path% (%desc%) contains an un-escaped delimiter."; // TODO: check later
////        this.descriptions["XUsage"] = "Element '%path%' is not defined in the profile or element '%path%' is forbidden.";
//        this.descriptions["XUsage"] = "The %type% %path% (%desc%) is present whereas it is an unsupported element; Usage = X";
//        this.descriptions["WUsage"] = "The %type% %path% (%desc%) is present where as it is a withdrawn element; Usage=W.";
//        this.descriptions["RUsage"] = "The required %type% '%prettyPath%' (%desc%) is missing";
//        this.descriptions["REUsage"] = "Element '%location%' is missing. Depending on the use case and data availability it may be appropriate to value this element.";
//        this.descriptions["MaxCard"] = "Invalid Maximum Cardinality: %type% %path% must be in the cardinality range of [%min%,%max%]; %occurence% occurrences found.";
//        this.descriptions["MinCard"] = "Invalid Minimum Cardinality: %type% %path% must be in the cardinality range of [%min%,%max%]; %occurence% occurrences found.";
//        this.descriptions["Length"] = "Invalid length: The length of '%path%' (%desc%) must be within the range [%min%,%max%], Length= %value%"; //
//        this.descriptions["Success"] = "%id% - %content%";
//        this.descriptions["Failure"] = "%id% - %content%"; // constraint
//        this.descriptions["SpecError"] = "DESC_NOT_DEFINED";
//        this.descriptions["PredicateSpecError"] = "Predicate '%content%' at '%target%' Failed";
//        this.descriptions["PredicateFailure"] = "%id% - %content%"; // constraint
//        this.descriptions["PredicateSuccess"] = "%id% - %content%";
//        this.descriptions["VSNotFound"] = "Value Set Not Found: %valueSetId%. The value '%value%' at location '%path%' (%desc%) cannot be evaluated.";
//        this.descriptions["CodeNotFound"] = "Code Not Found: The value '%value%' at location %path% (%desc%) is not member of the value set '%id%'.";
//        this.descriptions["PVS"] = "The value %value% at location '%path%' (%desc%) is a permitted (P) code; Value Set: %valueSetId%.";
//        this.descriptions["EVS"] = "The value %value% at location '%path%' (%desc%) is a excluded (E) code; Value Set: %valueSetId%.";
//        this.descriptions["Format"] = "DESC_NOT_DEFINED";
//        this.descriptions["EmptyVS"] = "Empty Value Set: The %type% at %path% (%desc%) value set %valueSetId% is empty.";
//        this.descriptions["NoVal"]="Value Set Excluded. The value set '%valueSetId%' at location %path% (%desc%) is excluded from validation.";

        //the value is excluded from the validation

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
            if (entry['classification'] === 'Error') {
                this.addResult(this.errors, entry);
            } else if (entry['classification'] === 'Informational' || entry['classification'] === 'Info') {
                this.addResult(this.informationals, entry);
            } else if (entry['classification'] === 'Warning') {
                this.addResult(this.warnings, entry);
            } else if (entry['classification'] === 'Alert') {
                this.addResult(this.alerts, entry);
            } else if (entry['classification'] === 'Affirmative') {
                this.addResult(this.affirmatives, entry);
            } else if (entry['classification'] === 'DQA') {
                this.addResult(this.dqas, entry);
            }
//
//            if (entry["InvalidLines"] !== undefined) {
//                var obj = entry["InvalidLines"];
//                for (var i = 0; i < obj.length; i++) {
//                    var InvalidLine = obj[i];
//                    var f = new Entry();
//                    f.failureType = "InvalidLine";
//                    f.line = InvalidLine.number;
//                    f.value = InvalidLine.content;
//                    var desc = this.descriptions[f.failureType];
//                    f['LineDetails'] = {"number": f.line, "content": f.value};
//                    f.description = desc != undefined ? desc.replace('%line%', f.line).replace('%content%', f.value) : '';
//                    this.addResult(this.errors, f, 'Line');
//                }
//            } else if (entry["UnexpectedLines"] !== undefined) {
//                var obj = entry["UnexpectedLines"];
//                for (var i = 0; i < obj.length; i++) {
//                    var unexpectedLine = obj[i];
//                    var f = new Entry();
//                    f.failureType = "UnexpectedLine";
//                    f.line = unexpectedLine.number;
//                    f.value = unexpectedLine.content;
//                    var desc = this.descriptions[f.failureType];
//                    f['LineDetails'] = {"number": f.line, "content": f.value};
//                    f.description = desc != undefined ? desc.replace('%line%', f.line).replace('%content%', f.value.substring(0, 3)) : '';
//                    this.addResult(this.errors, f, 'Line');
//                }
//            } else if (entry["UnescapedSeparators"] != undefined) {
//                var obj = entry["UnescapedSeparators"];
//                var f = new Entry();
//                f.failureType = "UnescapedSeparators";
//                f.initLocation(obj.location);
//                var desc = this.descriptions[f.failureType];
//                f.description = desc != undefined ? desc.replace('%path%', HL7Utils.prettyPath(f.path)).replace('%desc%', f.desc) : '';
//                this.addResult(this.errors, f, 'Format');
//            } else if (entry.XUsage != undefined) {
//                var obj = entry.XUsage;
//                var f = new Entry();
//                f.failureType = "XUsage";
//                f.initLocation(obj.location);
//                var desc = this.descriptions[f.failureType];
//                f.description = desc != undefined ? desc.replace('%path%', HL7Utils.prettyPath(f.path)).replace('%desc%', f.desc).replace('%type%', angular.lowercase(HL7Utils.getType(f.path))) : '';
//                this.addResult(this.errors, f, 'Usage');
//            } else if (entry.RUsage != undefined) {
//                var obj = entry.RUsage;
//                var f = new Entry();
//                f.failureType = "RUsage";
//                f.initLocation(obj.location);
//                var desc = this.descriptions[f.failureType];
//                f.description = desc != undefined ? desc.replace('%prettyPath%', HL7Utils.prettyPath(f.path)).replace('%desc%', f.desc).replace('%type%', angular.lowercase(HL7Utils.getType(f.path))) : 'Description Not Defined';
//                this.addResult(this.errors, f, 'Usage');
//            } else if (entry.REUsage != undefined) {
//                var obj = entry.REUsage;
//                var f = new Entry();
//                f.failureType = "REUsage";
//                f.initLocation(obj.location);
//                var desc = this.descriptions[f.failureType];
//                f.description = desc != undefined ? desc.replace('%location%', HL7Utils.prettyPath(f.path)) : '';
//                this.addResult(this.informationals, f, 'REUsage');
//            } else if (entry.WUsage != undefined) {
//                var obj = entry.WUsage;
//                var f = new Entry();
//                f.failureType = "WUsage";
//                f.initLocation(obj.location);
//                var desc = this.descriptions[f.failureType];
//                f.description = desc != undefined ? desc.replace('%path%', HL7Utils.prettyPath(f.path)).replace('%desc%', f.desc).replace('%type%', angular.lowercase(HL7Utils.getType(f.path))) : '';
//                this.addResult(this.errors, f, 'Usage');
//            } else if (entry.MaxCard != undefined) {
//                var obj = entry.MaxCard;
//                var f = new Entry();
//                f.failureType = "MaxCard";
//                f.initLocation(obj.location);
//                f['range'] = obj.range;
//                f.instance = obj.instance;
//                var desc = this.descriptions[f.failureType];
//                f.description = desc != undefined ? desc.replace('%min%', f.range.min).replace('%type%', HL7Utils.getType(f.path)).replace('%path%', HL7Utils.prettyPath(f.path)).replace('%max%', f.range.max).replace('%occurence%', f.instance) : '';
//                this.addResult(this.errors, f, 'Cardinality');
//            } else if (entry.Extra != undefined) {
//                var obj = entry.Extra;
//                var f = new Entry();
//                f.failureType = "Extra";
//                f.initLocation(obj.location);
//                var desc = this.descriptions[f.failureType];
//                f.description = desc != undefined ? desc : '';
//                this.addResult(this.errors, f, 'Extra');
//            } else if (entry.MinCard != undefined) {
//                var obj = entry.MinCard;
//                var f = new Entry();
//                f.failureType = "MinCard";
//                f.initLocation(obj.location);
//                f['range'] = obj.range;
//                f.instance = obj.instance;
//                var desc = this.descriptions[f.failureType];
//                f.description = desc != undefined ? desc.replace('%min%', f.range.min).replace('%type%', HL7Utils.getType(f.path)).replace('%path%', HL7Utils.prettyPath(f.path)).replace('%max%', f.range.max).replace('%occurence%', f.instance) : '';
//                this.addResult(this.errors, f, 'Cardinality');
//            } else if (entry["Length"] != undefined) {
//                var obj = entry["Length"];
//                var f = new Entry();
//                f.failureType = "Length";
//                f.initLocation(obj.location);
//                f['range'] = obj.range;
//                f.value = obj.value;
//                var desc = this.descriptions[f.failureType];
//                f.description = desc != undefined ? desc.replace('%path%', HL7Utils.prettyPath(f.path)).replace('%min%', f.range.min).replace('%max%', f.range.max).replace('%desc%', f.desc).replace('%value%', f.value.length) : '';
//                this.addResult(this.errors, f, 'Length');
//            } else if (entry["Format"] != undefined) {
//                var obj = entry["Format"];
//                var f = new Entry();
//                f.failureType = "Format";
//                f.initLocation(obj.location);
//                f.details = obj.details;
////            var desc =this.descriptions[f.failureType];
//                f.description = f.details;
//                this.addResult(this.errors, f, 'Format');
//            } else if (entry.Success != undefined) {
//                var obj = entry.Success;
//                var f = new Entry();
//                f.failureType = "Success";
//                if (obj.context) {
//                    f.initLocation(obj.context.location);
//                }
//                f['constraint'] = obj.constraint;
//                var desc = this.descriptions[f.failureType];
//                f.description = desc != undefined ? desc.replace('%id%', f.constraint.id).replace('%content%', f.constraint.description) : '';
//                this.addResult(this.affirmatives, f, 'Success');
//            } else if (entry.Failure != undefined) {
//                var obj = entry.Failure;
//                var f = new Entry();
//                f.failureType = "Failure";
//                if (obj.context) {
//                    f.initLocation(obj.context.location);
//                }
//                f['constraint'] = obj.constraint;
//                f['stack'] = obj.stack;
//                var desc = '';
////            if(f.stack != undefined && f.stack.length > 0) {
////                for (var i = 0; i < f.stack.length; i++) {
////                    desc = desc + f.stack[i].expression + "<br />";
////                }
////            }
////          var desc =this.descriptions[f.failureType];
//                f.description = f.constraint.description;
//                this.addResult(this.errors, f, 'Conformance Statement');
//            } else if (entry.SpecError != undefined) {
//                var obj = entry.SpecError;
//                var f = new Entry();
//                f.failureType = "SpecError";
//                if (obj.context) {
//                    f.initLocation(obj.context.location);
//                }
//                f['constraint'] = obj.constraint;
//                f['trace'] = obj.trace;
//                var desc = '';
//                if (f.trace != undefined && f.trace.length > 0) {
//                    for (var i = 0; i < f.trace.length; i++) {
//                        desc = desc + f.trace[i].expression + "<br />";
//                    }
//                }
//                f.description = desc;
//                this.addResult(this.alerts, f, 'SpecError');
//            } else if (entry.PredicateSpecError != undefined) {
//                var obj = entry.PredicateSpecError;
//                var f = new Entry();
//                f.failureType = "PredicateSpecError";
//                f.desc = '';
//                f.path = obj.predicate.target;
//                f.line = -1;
//                f.column = -1;
//                f['reasons'] = obj.reasons;
//                var desc = this.descriptions[f.failureType];
//                f.description = desc != undefined ? desc.replace('%target%', HL7Utils.prettyPath(f.path)).replace('%content%', HL7Utils.prettyPath(f.path)) : '';
//                this.addResult(this.alerts, f, 'PredicateSpecError');
//            } else if (entry.PredicateFailure != undefined) {
//                var obj = entry.PredicateFailure;
//                var f = new Entry();
//                f.failureType = "PredicateFailure";
//                f.desc = '';
//                f.line = -1;
//                f.column = -1;
//                f['violations'] = obj.violations;
//                var tmp = null;
//                var violation = f.violations[0];
//                for (var prop in violation) {
//                    tmp = violation[prop];
//                    break;
//                }
//                f.path = tmp != null ? tmp.location.path : 'NOT_DEFINED'; // TODO: FIXME
//                var desc = obj.predicate.description;
//                f.description = desc;
//                f.line = tmp.line;
//                f.column = tmp.column;
//                this.addResult(this.errors, f, 'Predicate');
//            } else if (entry.PredicateSuccess != undefined) {
//                var obj = entry.PredicateSuccess;
//                var f = new Entry();
//                f.failureType = "PredicateSuccess";
//                f.desc = '';
//                f.path = obj.predicate.target;
//                f.line = -1;
//                f.column = -1;
//                var desc = obj.predicate.description;
//                f.description = desc;
//                this.addResult(this.affirmatives, f, 'Predicate');
//            } else if (entry["VSNotFound"] != undefined) {
//                var obj = entry["VSNotFound"];
//                var f = new Entry();
//                f.failureType = "VSNotFound";
//                f.initLocation(obj.location);
//                var desc = this.descriptions[f.failureType];
//                f.description = desc != undefined ? desc.replace('%value%', obj.value).replace('%path%', HL7Utils.prettyPath(f.path)).replace('%desc%', f.desc).replace('%valueSetId%', obj['ValueSetId']) : '';
//                this.addResult(this.alerts, f, 'VS-NotFound');
//            } else if (entry["CodeNotFound"] != undefined) {
//                var obj = entry["CodeNotFound"];
//                var f = new Entry();
//                f.failureType = "CodeNotFound";
//                f.initLocation(obj.location);
//                var desc = this.descriptions[f.failureType];
//                f.description = desc != undefined ? desc.replace('%value%', obj.value).replace('%desc%', f.desc).replace('%path%', HL7Utils.prettyPath(f.path)).replace('%id%', obj['valueSet'].id) : '';
//                f['valueSetDetails'] = {"value": obj.value, "valueSet": obj.valueSet, "bindingStrength": obj.bindingStrength};
//                this.addResult(this.errors, f, 'Coded Element');
//            } else if (entry["EVS"] != undefined) {
//                var obj = entry["EVS"];
//                var f = new Entry();
//                f.failureType = "EVS";
//                f['valueSetDetails'] = {"value": obj.value, "valueSet": obj.valueSet, "bindingStrength": obj.bindingStrength};
//                f.initLocation(obj.location);
//                var desc = this.descriptions[f.failureType];
//                f.description = desc.replace('%value%', obj.value).replace('%path%', HL7Utils.prettyPath(f.path)).replace('%desc%', f.desc).replace('%valueSetId%', obj['valueSet'].id);
//                this.addResult(this.errors, f, 'Excluded Code');
//            } else if (entry["PVS"] != undefined) {
//                var obj = entry["PVS"];
//                var f = new Entry();
//                f.failureType = "PVS";
//                f['valueSetDetails'] = {"value": obj.value, "valueSet": obj.valueSet, "bindingStrength": obj.bindingStrength};
//                f.initLocation(obj.location);
//                var desc = this.descriptions[f.failureType];
//                f.description = desc.replace('%value%', obj.value).replace('%path%', HL7Utils.prettyPath(f.path)).replace('%desc%', f.desc).replace('%valueSetId%', obj['valueSet'].id);
//                this.addResult(this.warnings, f, 'Permitted Code');
//            } else if (entry["VSSpecError"] != undefined) {
//                var obj = entry["VSSpecError"];
//                var f = new Entry();
//                f.failureType = "VSSpecError";
//                f['valueSetDetails'] = {"valueSet": obj["valueSetId"], "spec": obj.spec, "msg": obj.msg};
//                f.initLocation(obj.location);
//                var desc = obj.msg;
//                f.description = desc;
//                this.addResult(this.alerts, f, 'VSSpecError');
//            } else if (entry["EmptyVS"] != undefined) {
//                var obj = entry["EmptyVS"];
//                var f = new Entry();
//                f.failureType = "EmptyVS";
//                f['valueSetDetails'] = {"valueSet": obj.valueSet, "bindingStrength": obj.bindingStrength};
//                f.initLocation(obj.location);
//                var desc = this.descriptions[f.failureType];
//                f.description = desc.replace('%path%', HL7Utils.prettyPath(f.path)).replace('%desc%', f.desc).replace('%valueSetId%', obj['valueSet'].id).replace('%type%', HL7Utils.getType(f.path));
//                this.addResult(this.errors, f, 'Empty Value Set');
//            } else if (entry["VSError"] != undefined) {
//                var obj = entry["VSError"];
//                var f = new Entry();
//                f.failureType = "VSError";
//                f['valueSetDetails'] = {"valueSet": obj.valueSet, "bindingStrength": obj.bindingStrength, "reason": obj.reason};
//                f.initLocation(obj.location);
//                var desc = obj.reason;
//                f.description = desc;
//                this.addResult(this.errors, f, 'VSError');
//            } else if (entry["CodedElem"] != undefined) {
//                var obj = entry["CodedElem"];
//                var f = new Entry();
//                f.failureType = "CodedElem";
//                f['valueSetDetails'] = {"spec": obj.spec, "details": obj.details};
//                f.initLocation(obj.location);
//                var desc = obj.msg;
//                f.description = desc;
//                this.addResult(this.errors, f, 'Coded Element');
//            } else if (entry["NoVal"] != undefined) {
//                var obj = entry["NoVal"];
//                var f = new Entry();
//                f.failureType = "NoVal";
//                f.initLocation(obj.location);
//                var desc =this.descriptions[f.failureType];
//                f.description = desc.replace('%path%', HL7Utils.prettyPath(f.path)).replace('%desc%', f.desc).replace('%valueSetId%', obj['valueSetId']);
//                this.addResult(this.alerts, f, 'Coded Element');
//            }
        } catch (error) {
            console.log(error);
        }
    };

    NewValidationResult.prototype.init = function (report) {
        ValidationResult.prototype.clear.call(this);
        this.json = report;
        if (report['Report']) {
            for (var i = 0; i < report['Report'].length; i++) {
                var item = report['Report'][i];
                this.addItem(item['Entry']);
            }
        }


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
//        this.structure = report.structure;
//        this.content = report.content;
//        this.valueSet = report.valueSet;
//        if (this.structure) {
//            for (var i = 0; i < this.structure.length; i++) {
//                this.addItem(this.structure [i]);
//            }
//        }
//        if (this.content) {
//            for (var i = 0; i < this.content.length; i++) {
//                this.addItem(this.content [i]);
//            }
//        }
//
//        if (this.valueSet) {
//            for (var i = 0; i < this.valueSet.length; i++) {
//                this.addItem(this.valueSet [i]);
//            }
//        }

    };
    return NewValidationResult;
});


angular.module('commonServices').factory('DQAValidationResult', function () {
    var DQAValidationResult = function (result) {
        this.errors = [];
        this.warnings = [];
        for (var i = 0; i < result['issuesList'].length; i++) {
            var issue = result['issuesList'][i];
            if (issue.type === 'Error') {
                this.errors.push(issue);
            } else {
                this.warnings.push(issue);
            }
        }
    };
    return DQAValidationResult;
});


angular.module('commonServices').factory('Profile', function ($http, $q) {
    var Profile = function () {
        this.id = null;
        this.xml = '';
        this.json = '';
        this.name = [];
        this.description = '';
    };


    Profile.prototype.notifyChange = function () {
        this.updateIndicator = new Date().getTime();
    };


    Profile.prototype.init = function (data) {
        this.id = data.id;
        this.xml = data.xml;
        this.json = null;
        this.name = data.name;
        this.description = data.description;
    };

    Profile.prototype.clear = function () {
        this.id = null;
        this.xml = null;
        this.json = null;
        this.name = null;
        this.description = null;
    };

    return Profile;
});


angular.module('commonServices').factory('Message', function ($http, $q) {
    var Message = function () {
        this.id = null;
        this.name = '';
        this.content = '';
        this.description = '';
        this.updateIndicator = "0";
    };

    Message.prototype.notifyChange = function () {
        this.updateIndicator = new Date().getTime();
    };


    Message.prototype.setContent = function (content) {
        this.content = content != undefined ? content : '';
        this.notifyChange();
    };

    Message.prototype.init = function (m) {
        this.id = m.id;
        this.name = m.name;
        this.description = m.description;
        this.setContent(m.content);
    };


    Message.prototype.download = function () {
        var form = document.createElement("form");
        form.action = "api/messages/downloadContent";
        form.method = "POST";
        form.target = "_target";
        var input = document.createElement("textarea");
        input.name = "content";
        input.value = this.content;
        form.appendChild(input);
        form.style.display = 'none';
        document.body.appendChild(form);
        form.submit();
    };

    return Message;
});


angular.module('commonServices').factory('Tree', function () {
    var Tree = function () {
        this.id = null;
        this.root = {};
    };
    return Tree;
});


angular.module('commonServices').factory('Er7Message', function ($http, $q, Message) {
    var Er7Message = function () {
        Message.apply(this, arguments);
    };

    Er7Message.prototype = Object.create(Message.prototype);
    Er7Message.prototype.constructor = Er7Message;


    return Er7Message;
});


angular.module('commonServices').factory('Report', function ($http, $q) {
    var Report = function () {
        this.html = null;
    };

    Report.prototype.generate = function (url, xmlReport) {
        var delay = $q.defer();
        $http({
            url: url,
            data: $.param({'xmlReport': xmlReport}),
            headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
            method: 'POST',
            timeout: 60000
        }).success(function (data) {
            delay.resolve(angular.fromJson(data));
        }).error(function (err) {
            delay.reject(err);
        });
        return delay.promise;
    };

    Report.prototype.download = function (url, xmlReport) {
        var form = document.createElement("form");
        form.action = url;
        form.method = "POST";
        form.target = "_target";
        var input = document.createElement("textarea");
        input.name = "xmlReport";
        input.value = xmlReport;
        form.appendChild(input);
        form.style.display = 'none';
        document.body.appendChild(form);
        form.submit();
    };


    return Report;
});


angular.module('commonServices').factory('DataInstanceReport', function ($http, NewValidationReport) {
    var DataInstanceReport = function () {
        NewValidationReport.call(this, arguments);
    };

    DataInstanceReport.prototype = Object.create(NewValidationReport.prototype);
    DataInstanceReport.prototype.constructor = DataInstanceReport;

    DataInstanceReport.prototype.generateByFormat = function (json, format) {
        return this.generate("api/datainstance/report/generate/" + format, json);
    };

    DataInstanceReport.prototype.downloadByFormat = function (json, format) {
        return this.generate("api/datainstance/report/download/" + format, json);
    };
    return DataInstanceReport;
});

angular.module('commonServices').factory('Er7MessageValidator', function ($http, $q,HL7EditorUtils) {
    var Er7MessageValidator = function () {
    };

    Er7MessageValidator.prototype.validate = function (testcaseId, message, name) {
        var delay = $q.defer();
        if(!HL7EditorUtils.isHL7(message)){
            delay.reject("Message provided is not an HL7 v2 message");
        }else {
            var data = angular.fromJson({"testCaseId": testcaseId, "er7Message": message, "name": name});
//
            $http.get('../../resources/cf/newValidationResult3.json').then(
                function (object) {
                    delay.resolve(angular.fromJson(object.data));
                },
                function (response) {
                    delay.reject(response.data);
                }
            );

//        $http.post("api/datainstance/message/validate", data, {timeout: 60000}).then(
//            function (object) {
//                try {
//                    delay.resolve(angular.fromJson(object.data));
//                } catch (e) {
//                    delay.reject("Invalid character in received response");
//                }
//
//            },
//            function (response) {
//                delay.reject(response.data);
//            }
//        );

        }
        return delay.promise;
    };

    return Er7MessageValidator;
});

angular.module('commonServices').factory('Er7MessageParser', function ($http, $q,HL7EditorUtils) {
    var Er7MessageParser = function () {
    };

    Er7MessageParser.prototype.parse = function (testcaseId, message, name) {
        var delay = $q.defer();
        if(!HL7EditorUtils.isHL7(message)){
            delay.reject("Message provided is not an HL7 v2 message");
         }else {
            var data = angular.fromJson({"testCaseId": testcaseId, "er7Message": message, "name": name});
//        $http.post('api/datainstance/message/parse', data, {timeout: 60000}).then(
//            function (object) {
//                delay.resolve(angular.fromJson(object.data));
//            },
//            function (response) {
//                delay.reject(response.data);
//            }
//        );

            $http.get('../../resources/cf/messageObject.json').then(
                function (object) {
                    delay.resolve(angular.fromJson(object.data));
                },
                function (response) {
                    delay.reject(response.data);
                }
            );
        }

        return delay.promise;
    };

    return Er7MessageParser;
});


angular.module('commonServices').factory('DQAMessageValidator', function ($http, $q) {
    var DQAMessageValidator = function () {
    };

    DQAMessageValidator.prototype.validate = function (message, facilityId) {
        var delay = $q.defer();
        var data = angular.fromJson({"er7Message": message, "facilityId": facilityId});
//        $http.post("api/datainstance/message/dqaValidate", data, {timeout: 60000}).then(
//            function (object) {
//                try {
//                    delay.resolve(angular.fromJson(object.data));
//                } catch (e) {
//                    delay.reject("Invalid character in received response");
//                }
//            },
//            function (response) {
//                delay.reject(response.data);
//            }
//        );

        $http.get('../../resources/cf/newValidationResult4.json').then(
            function (object) {
                delay.resolve(angular.fromJson(object.data));
            },
            function (response) {
                delay.reject(response.data);
            }
        );
        return delay.promise;
    };

    return DQAMessageValidator;
});


angular.module('commonServices').factory('VocabularyService', function ($http, $q) {
    var VocabularyService = function () {
    };

    VocabularyService.prototype.searchTableValues = function (searchString, selectionCriteria, tableLibraries) {
        var searchResults = [];
        if (searchString != null) {
            if (selectionCriteria === 'TableId') {
                angular.forEach(tableLibraries, function (vocabularyCollection) {
                    angular.forEach(vocabularyCollection.children, function (library) {
                        angular.forEach(library.tableSet.tableDefinitions, function (tableDefinition) {
                            if (tableDefinition.tdId && tableDefinition.tdId.indexOf(searchString) !== -1) {
                                searchResults.push(tableDefinition);
                            }
                        });
                    });
                });
            } else if (selectionCriteria === 'Value') {
                angular.forEach(tableLibraries, function (vocabularyCollection) {
                    angular.forEach(vocabularyCollection.children, function (library) {
                        angular.forEach(library.tableSet.tableDefinitions, function (tableDefinition) {
                            angular.forEach(tableDefinition.tableElements, function (tableElement) {
                                if (tableElement.code && tableElement.code.indexOf(searchString) !== -1) {
                                    tableElement.codesys = tableElement.codesys == null ? tableDefinition.codesys : tableElement.codesys;
                                    searchResults.push(tableElement);
                                }
                            });
                        });
                    });
                });
            } else if (selectionCriteria === 'Description') {
                angular.forEach(tableLibraries, function (vocabularyCollection) {
                    angular.forEach(vocabularyCollection.children, function (library) {
                        angular.forEach(library.tableSet.tableDefinitions, function (tableDefinition) {
                            angular.forEach(tableDefinition.tableElements, function (tableElement) {
                                if (tableElement.displayName && tableElement.displayName.indexOf(searchString) !== -1) {
                                    tableElement.codesys = tableElement.codesys == null ? tableDefinition.codesys : tableElement.codesys;
                                    searchResults.push(tableElement);

                                }
                            });
                        });
                    });
                });
            } else if (selectionCriteria === 'ValueSetCode') {
                angular.forEach(tableLibraries, function (vocabularyCollection) {
                    angular.forEach(vocabularyCollection.children, function (library) {
                        angular.forEach(library.tableSet.tableDefinitions, function (tableDefinition) {
                            if (tableDefinition.codesys && tableDefinition.codesys.indexOf(searchString) !== -1) {
                                searchResults.push(tableDefinition);
                            }
                        });
                    });
                });
            } else if (selectionCriteria === 'ValueSetName') {
                angular.forEach(tableLibraries, function (vocabularyCollection) {
                    angular.forEach(vocabularyCollection.children, function (library) {
                        angular.forEach(library.tableSet.tableDefinitions, function (tableDefinition) {
                            if (tableDefinition.name && tableDefinition.name.indexOf(searchString) !== -1) {
                                searchResults.push(tableDefinition);
                            }
                        });
                    });
                });
            }

        }
        return searchResults;

    };

    VocabularyService.prototype.searchTablesById = function (tableId, tableLibraries) {
        var tables = [];
        angular.forEach(tableLibraries, function (vocabularyCollection) {
            angular.forEach(vocabularyCollection.children, function (library) {
                angular.forEach(library.tableSet.tableDefinitions, function (tableDefinition) {
                    if (tableDefinition.tdId && tableDefinition.tdId.indexOf(tableId) !== -1) {
                        tables.push(tableDefinition);
                    }
                });
            });
        });

        return tables;
    };


    return VocabularyService;

});


angular.module('commonServices').factory('NewValidationReport', function ($http, $q) {
    var NewValidationReport = function () {
        this.content = {
            metaData: {},
            result: {}
        }
    };
    NewValidationReport.prototype.download = function (url) {
        var form = document.createElement("form");
        form.action = url;
        form.method = "POST";
        form.target = "_target";
        var input = document.createElement("textarea");
        input.name = "jsonReport";
        input.value = this.content;
        form.appendChild(input);
        form.style.display = 'none';
        document.body.appendChild(form);
        form.submit();
    };


    NewValidationReport.prototype.generate = function (url) {
        var delay = $q.defer();
        $http({
            url: url,
            data: $.param({'jsonReport': this.content }),
            headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
            method: 'POST',
            timeout: 60000
        }).success(function (data) {
            delay.resolve(angular.fromJson(data));
        }).error(function (err) {
            delay.reject(err);
        });
        return delay.promise;
    };


    return NewValidationReport;
});

angular.module('commonServices').factory('ValidationResultHighlighter', function ($http, $q, HL7TreeUtils) {
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


angular.module('commonServices').factory('Logger', function () {
    var Logger = function () {
        this.content = '';
    };

    Logger.prototype.log = function (value) {
        this.content = this.content + "\n" + this.getCurrentTime() + ":" + value;
    };

    Logger.prototype.clear = function () {
        this.content = '';
    };

    Logger.prototype.init = function () {
        this.clear();
    };


    Logger.prototype.getCurrentTime = function () {
        var now = new Date();
        return (((now.getMonth() + 1) < 10) ? "0" : "") + (now.getMonth() + 1) + "/" + ((now.getDate() < 10) ? "0" : "") + now.getDate() + "/" + now.getFullYear() + " - " +
            ((now.getHours() < 10) ? "0" : "") + now.getHours() + ":" + ((now.getMinutes() < 10) ? "0" : "") + now.getMinutes() + ":" + ((now.getSeconds() < 10) ? "0" : "") + now.getSeconds();
    };
    return Logger;
});


angular.module('commonServices').factory('Endpoint', function () {
    var Endpoint = function () {
        this.value = null;
    };

    var Endpoint = function (url) {
        this.value = url;
    };

    return Endpoint;
});


angular.module('commonServices').factory('SecurityFaultCredentials', function ($q, $http) {

    var SecurityFaultCredentials = function () {
        this.username = null;
        this.password = null;
    };

    SecurityFaultCredentials.prototype.init = function (username, password) {
        this.username = username;
        this.password = password;
    };

    return SecurityFaultCredentials;
});


angular.module('commonServices').factory('Clock', function ($interval) {
    var Clock = function (intervl) {
        this.value = undefined;
        this.intervl = intervl;
    };
    Clock.prototype.start = function (fn) {
        if (angular.isDefined(this.value)) {
            this.stop();
        }
        this.value = $interval(fn, this.intervl);
    };
    Clock.prototype.stop = function () {
        if (angular.isDefined(this.value)) {
            $interval.cancel(this.value);
            this.value = undefined;
        }
    };
    return Clock;
});



