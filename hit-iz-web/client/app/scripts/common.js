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
        form.action = "api/message/download";
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
        return this.generate("api/report/generateAs/" + format, json);
    };

    DataInstanceReport.prototype.downloadByFormat = function (json, format) {
        return this.generate("api/report/downloadAs/" + format, json);
    };
    return DataInstanceReport;
});

angular.module('commonServices').factory('Er7MessageValidator', function ($http, $q, HL7EditorUtils) {
    var Er7MessageValidator = function () {
    };

    Er7MessageValidator.prototype.validate = function (testContextId, content, name) {
        var delay = $q.defer();
        if (!HL7EditorUtils.isHL7(content)) {
            delay.reject("Message provided is not an HL7 v2 message");
        } else {
//
//            $http.get('../../resources/cf/newValidationResult3.json').then(
//                function (object) {
//                    delay.resolve(angular.fromJson(object.data));
//                },
//                function (response) {
//                    delay.reject(response.data);
//                }
//            );
            $http.post('api/testcontext/'+ testContextId + '/validateMessage', angular.fromJson({"content": content})).then(
                function (object) {
                    try {
                        delay.resolve(angular.fromJson(object.data));
                    } catch (e) {
                        delay.reject("Invalid character in the message");
                    }
                },
                function (response) {
                    delay.reject(response.data);
                }
            );
        }
        return delay.promise;
    };

    return Er7MessageValidator;
});

angular.module('commonServices').factory('Er7MessageParser', function ($http, $q, HL7EditorUtils) {
    var Er7MessageParser = function () {
    };

    Er7MessageParser.prototype.parse = function (testContextId, content, name) {
        var delay = $q.defer();
        if (!HL7EditorUtils.isHL7(content)) {
            delay.reject("Message provided is not an HL7 v2 message");
        } else {
             $http.post('api/testcontext/' + testContextId + '/parseMessage', angular.fromJson({"content": content})).then(
                function (object) {
                    delay.resolve(angular.fromJson(object.data));
                },
                function (response) {
                    delay.reject(response.data);
                }
            );

//            $http.get('../../resources/cf/messageObject.json').then(
//                function (object) {
//                    delay.resolve(angular.fromJson(object.data));
//                },
//                function (response) {
//                    delay.reject(response.data);
//                }
//            );
        }

        return delay.promise;
    };

    return Er7MessageParser;
});


angular.module('commonServices').factory('DQAMessageValidator', function ($http, $q) {
    var DQAMessageValidator = function () {
    };

    DQAMessageValidator.prototype.validate = function (testContextId,content, facilityId) {
        var delay = $q.defer();

        $http.post('api/testcontext/' + testContextId + '/dqaValidateMessage', angular.fromJson({"content": content, "facilityId": facilityId})).then(
            function (object) {
                delay.resolve(angular.fromJson(object.data));
            },
            function (response) {
                delay.reject(response.data);
            }
        );

//        $http.get('../../resources/cf/newValidationResult4.json').then(
//            function (object) {
//                delay.resolve(angular.fromJson(object.data));
//            },
//            function (response) {
//                delay.reject(response.data);
//            }
//        );
        return delay.promise;
    };

    return DQAMessageValidator;
});


angular.module('commonServices').factory('VocabularyService', function ($http, $q,$modal) {
    var VocabularyService = function () {
        this.valueSetDefinitionsGroups = [];
    };

    VocabularyService.prototype.searchTableValues = function (searchString, selectionCriteria) {
        var searchResults = [];
        if (searchString != null) {
            if (selectionCriteria === 'TableId') {
                angular.forEach(this.valueSetDefinitionsGroups, function (valueSetDefinitionsGroup) {
                    angular.forEach(valueSetDefinitionsGroup.children, function (valueSetDefinition) {
                        if (valueSetDefinition.bindingIdentifier && valueSetDefinition.bindingIdentifier.indexOf(searchString) !== -1) {
                            searchResults.push(valueSetDefinition);
                        }
                    });
                });
            } else if (selectionCriteria === 'Value') {
                angular.forEach(this.valueSetDefinitionsGroups, function (valueSetDefinitionsGroup) {
                    angular.forEach(valueSetDefinitionsGroup.children, function (valueSetDefinition) {
                        angular.forEach(valueSetDefinition.valueSetElements, function (valueSetElement) {
                            if (valueSetElement.value && valueSetElement.value.indexOf(searchString) !== -1) {
                                searchResults.push(valueSetElement);
                            }
                        });
                    });
                });
            } else if (selectionCriteria === 'Description') {
                angular.forEach(this.valueSetDefinitionsGroups, function (valueSetDefinitionsGroup) {
                    angular.forEach(valueSetDefinitionsGroup.children, function (valueSetDefinition) {
                        angular.forEach(valueSetDefinition.valueSetElements, function (valueSetElement) {
                            if (valueSetElement.displayName && valueSetElement.displayName.indexOf(searchString) !== -1) {
                                searchResults.push(valueSetElement);
                            }
                        });
                    });
                });
            } else if (selectionCriteria === 'ValueSetCode') {
                angular.forEach(this.valueSetDefinitionsGroups, function (valueSetDefinitionsGroup) {
                    angular.forEach(valueSetDefinitionsGroup.children, function (valueSetDefinition) {
                        if (valueSetDefinition.codeSystem && valueSetDefinition.codeSystem.indexOf(searchString) !== -1) {
                            searchResults.push(valueSetDefinition);
                        }
                    });
                });
            } else if (selectionCriteria === 'ValueSetName') {
                angular.forEach(this.valueSetDefinitionsGroups, function (valueSetDefinitionsGroup) {
                    angular.forEach(valueSetDefinitionsGroup.children, function (valueSetDefinition) {
                        if (valueSetDefinition.name && valueSetDefinition.name.indexOf(searchString) !== -1) {
                            searchResults.push(valueSetDefinition);
                        }
                    });
                });
            }
        }
        return searchResults;
    };

    VocabularyService.prototype.searchTablesById = function (bindingIdentifier) {
        var valueSetDefinitions = [];
        angular.forEach(this.valueSetDefinitionsGroups, function (valueSetDefinitionsGroup) {
            angular.forEach(valueSetDefinitionsGroup.children, function (valueSetDefinition) {
                if (valueSetDefinition.bindingIdentifier && valueSetDefinition.bindingIdentifier.indexOf(bindingIdentifier) !== -1) {
                    valueSetDefinitions.push(valueSetDefinition);
                }
            });
        });

        return valueSetDefinitions;
    };

    VocabularyService.prototype.getValueSetDefinitionGroups = function (all, valueSetIds) {
        this.valueSetDefinitionGroups = [];
        var that = this;
        angular.forEach(all, function (valueSetDefinition) {
            if (valueSetIds.indexOf(valueSetDefinition.bindingIdentifier) !== -1) {
                var found = that.findValueSetDefinitions(valueSetDefinition.displayClassifier, that.valueSetDefinitionGroups);
                if (found === null) {
                    found = angular.fromJson({"name": valueSetDefinition.displayClassifier, "children": []});
                    that.valueSetDefinitionGroups.push(found);
                }
                valueSetDefinition.valueSetElements = $filter('orderBy')(valueSetDefinition.valueSetElements, 'value');
                found.children.push(valueSetDefinition);
            }
        });
        return this.valueSetDefinitionGroups;
    };

    VocabularyService.prototype.findValueSetDefinitions = function (classifier) {
        var res = null;
        angular.forEach(this.valueSetDefinitionGroups, function (child) {
            if (res === null) {
                if (child.name === classifier) {
                    res = child;
                }
            }
        });
        return res;
    };

    VocabularyService.prototype.showValueSetDefinition = function(tableId){
        var tables = this.searchTablesById(tableId, this.valueSetDefinitionGroups);
        var t = tables.length > 0 ? tables[0] : null;
        if (t != null) {
            var modalInstance = $modal.open({
                templateUrl: 'TableFoundCtrl.html',
                controller: 'TableFoundCtrl',
                windowClass: 'app-modal-window',
                resolve: {
                    table: function () {
                        return t;
                    }
                }
            });
        }
    };

    return VocabularyService;

});


angular.module('commonServices').factory('ProfileService', function ($http, $q, $filter) {
    var ProfileService = function () {
    };


    ProfileService.prototype.getValueSetIds = function (segments, datatypes) {
        var valueSetIds = [];
        angular.forEach(segments, function (segment) {
            angular.forEach(segment.children, function (field) {
                if (field.table && valueSetIds.indexOf(field.table) === -1) {
                    valueSetIds.push(field.table);
                }
            });
        });
        angular.forEach(datatypes, function (datatype) {
            angular.forEach(datatype.children, function (component) {
                if (component.table && valueSetIds.indexOf(component.table) === -1) {
                    valueSetIds.push(component.table);
                }
                if (component.children && component.children.length > 0) {
                    angular.forEach(component.children, function (subcomponent) {
                        if (subcomponent.table && valueSetIds.indexOf(subcomponent.table) === -1) {
                            valueSetIds.push(subcomponent.table);
                        }
                        if (subcomponent.children && subcomponent.children.length > 0) {
                            angular.forEach(subcomponent.children, function (subcomponent2) {
                                if (subcomponent2.table && valueSetIds.indexOf(subcomponent2.table) === -1) {
                                    valueSetIds.push(subcomponent2.table);
                                }
                            });
                        }
                    });
                }
            });
        });
        return valueSetIds;
    };

    ProfileService.prototype.setDatatypesTypesAndIcons = function (datatypes) {
        if (datatypes !== null) {
            var that = this;
            angular.forEach(datatypes.children, function (datatype) {
                if (datatype.children.length > 0) {
                    angular.forEach(datatype.children, function (component) {
                        that.setComponentTypesAndIcons(component);
                    });
                }
            });
        }
    };
    ProfileService.prototype.setComponentTypesAndIcons = function (component) {
        component.type = "COMPONENT";
        component.icon = "component.png";
        var that = this;
        if (component.children.length > 0) {
            angular.forEach(component.children, function (subcomponent) {
                that.setSubComponentTypesAndIcons(subcomponent);
            });
        }
    };

    ProfileService.prototype.setSubComponentTypesAndIcons = function (subComponent) {
        subComponent.type = "SUBCOMPONENT";
        subComponent.icon = "subcomponent.png";
        var that = this;
        if (subComponent.children.length > 0) {
            angular.forEach(subComponent.children, function (child) {
                that.setSubComponentTypesAndIcons(child);
            });
        }
    };

    return ProfileService;

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



