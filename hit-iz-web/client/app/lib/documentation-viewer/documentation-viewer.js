(function () {

    var mod = angular.module('hit-doc', []);

    mod.directive('documentationViewer', [
        function () {
            return {
                restrict: 'A',
                scope: {
                    stage: '@'
                },
                templateUrl: 'DocumentationViewer.html',
                replace: false,
                controller: 'DocumentationCtrl'
            };
        }
    ]);


    mod.directive('testcaseDoc', [
        function () {
            return {
                restrict: 'A',
                scope: {
                    stage: '@'
                },
                templateUrl: 'TestCaseDoc.html',
                replace: false,
                controller: 'TestCaseDocumentationCtrl'
            };
        }
    ]);


    mod.directive('knownIssues', [
        function () {
            return {
                restrict: 'A',
                templateUrl: 'KnownIssues.html',
                replace: false,
                controller: 'KnownIssuesCtrl'
            };
        }
    ]);

    mod.directive('releaseNotes', [
        function () {
            return {
                restrict: 'A',
                templateUrl: 'ReleaseNotes.html',
                replace: false,
                controller: 'ReleaseNotesCtrl'
            };
        }
    ]);


    mod.directive('userDocs', [
        function () {
            return {
                restrict: 'A',
                templateUrl: 'UserDocs.html',
                replace: false,
                controller: 'UserDocsCtrl'
            };
        }
    ]);


    mod.directive('resourceDoc', [
        function () {
            return {
                restrict: 'A',
                scope: {
                    type: '@',
                    name: '@'
                },
                templateUrl: 'ResourceDoc.html',
                replace: false,
                controller: 'ResourceDocsCtrl'
            };
        }
    ]);

    mod.directive('installationGuide', [
        function () {
            return {
                restrict: 'A',
                templateUrl: 'InstallationGuide.html',
                replace: false,
                controller: 'InstallationGuideCtrl'
            };
        }
    ]);


    mod.directive('toolDownloads', [
        function () {
            return {
                restrict: 'A',
                templateUrl: 'ToolDownloadList.html',
                replace: false,
                controller: 'ToolDownloadListCtrl'
            };
        }
    ]);



    mod
        .controller('DocumentationCtrl', ['$scope', '$rootScope', '$http', '$filter', '$cookies', '$sce', '$timeout', function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout) {
            $scope.status = {userDoc: true};
            $scope.scrollbarWidth = $rootScope.getScrollbarWidth();

            $scope.downloadDocument = function (path) {
                if (path != null) {
                    var form = document.createElement("form");
                    form.action = "api/documentation/downloadDocument";
                    form.method = "POST";
                    form.target = "_target";
                    var input = document.createElement("input");
                    input.name = "path";
                    input.value = path;
                    form.appendChild(input);
                    form.style.display = 'none';
                    document.body.appendChild(form);
                    form.submit();
                }
            }

        }]);


    mod
        .controller('UserDocsCtrl', ['$scope', '$rootScope', '$http', '$filter', '$cookies', '$sce', '$timeout', 'UserDocListLoader', function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, UserDocListLoader) {
            $scope.docs = [];
            $scope.loading = true;
            $scope.error = null;
            $scope.scrollbarWidth = $rootScope.getScrollbarWidth();

            var loader = new UserDocListLoader();
            loader.then(function (result) {
                $scope.loading = false;
                $scope.docs = result;
            }, function (error) {
                $scope.loading = false;
                $scope.error = null;
                $scope.docs = [];
            });

            $scope.isLink = function (path) {
                return path && path != null && path.startsWith("http");
            };

            $scope.downloadDocument = function (path) {
                if (path != null) {
                    var form = document.createElement("form");
                    form.action = "api/documentation/downloadDocument";
                    form.method = "POST";
                    form.target = "_target";
                    var input = document.createElement("input");
                    input.name = "path";
                    input.value = path;
                    form.appendChild(input);
                    form.style.display = 'none';
                    document.body.appendChild(form);
                    form.submit();
                }
            };

            $scope.gotToDoc = function (path) {
                if (path != null) {
                    var form = document.createElement("form");
                    form.action = "api/documentation/downloadDocument";
                    form.method = "POST";
                    form.target = "_target";
                    var input = document.createElement("input");
                    input.name = "path";
                    input.value = path;
                    form.appendChild(input);
                    form.style.display = 'none';
                    document.body.appendChild(form);
                    form.submit();
                }
            }

        }]);


    mod
        .controller('ReleaseNotesCtrl', ['$scope', '$rootScope', '$http', '$filter', '$cookies', '$sce', '$timeout', 'ReleaseNoteListLoader', function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, ReleaseNoteListLoader) {
            $scope.docs = [];
            $scope.loading = false;
            $scope.error = null;
            $scope.scrollbarWidth = $rootScope.getScrollbarWidth();

            var loader = new ReleaseNoteListLoader();
            loader.then(function (result) {
                $scope.loading = false;
                $scope.docs = result;
            }, function (error) {
                $scope.loading = false;
                $scope.error = null;
                $scope.docs = [];
            });

            $scope.downloadDocument = function (path) {
                if (path != null) {
                    var form = document.createElement("form");
                    form.action = "api/documentation/downloadDocument";
                    form.method = "POST";
                    form.target = "_target";
                    var input = document.createElement("input");
                    input.name = "path";
                    input.value = path;
                    form.appendChild(input);
                    form.style.display = 'none';
                    document.body.appendChild(form);
                    form.submit();
                }
            }


        }]);


    mod
        .controller('KnownIssuesCtrl', ['$scope', '$rootScope', '$http', '$filter', '$cookies', '$sce', '$timeout', 'KnownIssueListLoader', function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, KnownIssueListLoader) {
            $scope.docs = [];
            $scope.loading = false;
            $scope.error = null;
            $scope.scrollbarWidth = $rootScope.getScrollbarWidth();

            var loader = new KnownIssueListLoader();
            loader.then(function (result) {
                $scope.loading = false;
                $scope.docs = result;
            }, function (error) {
                $scope.loading = false;
                $scope.error = null;
                $scope.docs = [];
            });

            $scope.downloadDocument = function (path) {
                if (path != null) {
                    var form = document.createElement("form");
                    form.action = "api/documentation/downloadDocument";
                    form.method = "POST";
                    form.target = "_target";
                    var input = document.createElement("input");
                    input.name = "path";
                    input.value = path;
                    form.appendChild(input);
                    form.style.display = 'none';
                    document.body.appendChild(form);
                    form.submit();
                }
            }

        }]);

    mod
        .controller('ResourceDocsCtrl', ['$scope', '$rootScope', '$http', '$filter', '$cookies', '$sce', '$timeout', 'ResourceDocListLoader', function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, ResourceDocListLoader) {
            $scope.data = null;
            $scope.loading = false;
            $scope.error = null;
            $scope.scrollbarWidth = $rootScope.getScrollbarWidth();
            if ($scope.type != null && $scope.type != "" && $scope.name != null && $scope.name != "") {
                $scope.loading = true;
                var listLoader = new ResourceDocListLoader($scope.type);
                listLoader.then(function (result) {
                    $scope.error = null;
                    $scope.data = result;
                    $scope.loading = false;
                }, function (error) {
                    $scope.loading = false;
                    $scope.error = "Sorry, failed to load the " + $scope.name;
                });
            }

            $scope.downloadResourceDocs = function () {
                if ($scope.type != null) {
                    var form = document.createElement("form");
                    form.action = "api/documentation/downloadResourceDocs";
                    form.method = "POST";
                    form.target = "_target";
                    var input = document.createElement("input");
                    input.name = "type";
                    input.value = $scope.type;
                    form.appendChild(input);
                    form.style.display = 'none';
                    document.body.appendChild(form);
                    form.submit();
                }
            };

            $scope.downloadDocument = function (path) {
                if (path != null) {
                    var form = document.createElement("form");
                    form.action = "api/documentation/downloadDocument";
                    form.method = "POST";
                    form.target = "_target";
                    var input = document.createElement("input");
                    input.name = "path";
                    input.value = path;
                    form.appendChild(input);
                    form.style.display = 'none';
                    document.body.appendChild(form);
                    form.submit();
                }
            }

        }]);

    mod
        .controller('ToolDownloadListCtrl', ['$scope', '$rootScope', '$http', '$filter', '$cookies', '$sce', '$timeout', 'DeliverableListLoader', function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, DeliverableListLoader) {
            $scope.data = [];
            $scope.loading = false;
            $scope.error = null;
            $scope.scrollbarWidth = $rootScope.getScrollbarWidth();
            $scope.loading = true;
            var listLoader = new DeliverableListLoader();
            listLoader.then(function (result) {
                $scope.error = null;
                $scope.data = result;
                $scope.loading = false;
            }, function (error) {
                $scope.loading = false;
                $scope.error = "Sorry, failed to load the files";
                $scope.data = [];
            });
        }]);

    mod
        .controller('InstallationGuideCtrl', ['$scope', '$rootScope', '$http', '$filter', '$cookies', '$sce', '$timeout', 'InstallationGuideLoader', function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, InstallationGuideLoader) {
            $scope.doc = null;
            $scope.loading = false;
            $scope.error = null;
            $scope.scrollbarWidth = $rootScope.getScrollbarWidth();
            $scope.loading = true;
            var listLoader = new InstallationGuideLoader();
            listLoader.then(function (result) {
                $scope.error = null;
                $scope.doc = result;
                $scope.loading = false;
            }, function (error) {
                $scope.loading = false;
                $scope.error = "Sorry, failed to load the installation guide";
                $scope.doc = null;
            });

            $scope.downloadDocument = function (path) {
                if (path != null) {
                    var form = document.createElement("form");
                    form.action = "api/documentation/downloadDocument";
                    form.method = "POST";
                    form.target = "_target";
                    var input = document.createElement("input");
                    input.name = "path";
                    input.value = path;
                    form.appendChild(input);
                    form.style.display = 'none';
                    document.body.appendChild(form);
                    form.submit();
                }
            }
        }]);


    mod
        .controller('TestCaseDocumentationCtrl', ['$scope', '$rootScope', '$http', '$filter', '$cookies', '$sce', '$timeout', 'TestCaseDocumentationLoader', 'ngTreetableParams', function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, TestCaseDocumentationLoader, ngTreetableParams) {
            $scope.context = null;
            $scope.data = null;
            $scope.loading = false;
            $scope.scrollbarWidth = $rootScope.getScrollbarWidth();
            $scope.error = null;
            var testCaseLoader = new TestCaseDocumentationLoader();
            $scope.error = null;
            $scope.tree = {};
            if ($scope.stage != null && $scope.stage != '') {
                $scope.loading = true;
                var tcLoader = testCaseLoader.getOneByStage($scope.stage);
                tcLoader.then(function (data) {
                    $scope.error = null;
                    if (data != null) {
                        $scope.context = data;
                        $scope.data = angular.fromJson($scope.context.json);
                        $scope.params.refresh();
                    }
                    $scope.loading = false;
                }, function (error) {
                    $scope.loading = false;
                    $scope.error = "Sorry, failed to load the documents";
                });
            }


            $scope.params = new ngTreetableParams({
                getNodes: function (parent) {
                    return parent ? parent.children : $scope.data != null ? $scope.data.children : [];
                },
                getTemplate: function (node) {
                    return 'TestCaseDocumentationNode.html';
                },
                options: {
                    initialState: 'collapsed'
                }
            });

            $scope.downloadCompleteTestPackage = function (stage) {
                if (stage != null) {
                    var form = document.createElement("form");
                    form.action = "api/documentation/testPackages";
                    form.method = "POST";
                    form.target = "_target";
                    var input = document.createElement("input");
                    input.name = "stage";
                    input.value = stage;
                    form.appendChild(input);
                    form.style.display = 'none';
                    document.body.appendChild(form);
                    form.submit();
                }
            };

            $scope.downloadExampleMessages = function (stage) {
                if (stage != null) {
                    var form = document.createElement("form");
                    form.action = "api/documentation/exampleMessages";
                    form.method = "POST";
                    form.target = "_target";
                    var input = document.createElement("input");
                    input.name = "stage";
                    input.value = stage;
                    form.appendChild(input);
                    form.style.display = 'none';
                    document.body.appendChild(form);
                    form.submit();
                }
            };

            $scope.downloadArtifact = function (path, title) {
                if (path != null && title) {
                    var form = document.createElement("form");
                    form.action = "api/documentation/artifact";
                    form.method = "POST";
                    form.target = "_target";
                    var input = document.createElement("input");
                    input.name = "path";
                    input.value = path;
                    form.appendChild(input);
                    input = document.createElement("input");
                    input.name = "title";
                    input.value = title;
                    form.appendChild(input);
                    form.style.display = 'none';
                    document.body.appendChild(form);
                    form.submit();
                }
            };

            $scope.formatUrl = function (format) {
                return "api/" + format + "/documentation/";
            };


            $scope.downloadMessage = function (row) {
                $scope.downloadContextFile(row.id, row.type, $scope.formatUrl(row.format) + "message", row.title);
            };

            $scope.downloadProfile = function (row) {
                $scope.downloadContextFile(row.id, row.type, $scope.formatUrl(row.format) + "profile", row.title);
            };

            $scope.downloadValueSetLib = function (row) {
                $scope.downloadContextFile(row.id, row.type, $scope.formatUrl(row.format) + "valuesetlib", row.title);
            };

            $scope.downloadContextFile = function (targetId, targetType, targetUrl, targetTitle) {
                if (targetId != null && targetType != null && targetUrl != null) {
                    var form = document.createElement("form");
                    form.action = targetUrl;
                    form.method = "POST";
                    form.target = "_target";
                    var input = document.createElement("input");
                    input.name = "targetId";
                    input.value = targetId;
                    form.appendChild(input);

                    input = document.createElement("input");
                    input.name = "targetType";
                    input.value = targetType;
                    form.appendChild(input);


                    input = document.createElement("input");
                    input.name = "targetTitle";
                    input.value = targetTitle;
                    form.appendChild(input);


                    form.style.display = 'none';
                    document.body.appendChild(form);
                    form.submit();
                }
            };

            $scope.downloadDocument = function (path) {
                if (path != null) {
                    var form = document.createElement("form");
                    form.action = "api/documentation/downloadDocument";
                    form.method = "POST";
                    form.target = "_target";
                    var input = document.createElement("input");
                    input.name = "path";
                    input.value = path;
                    form.appendChild(input);
                    form.style.display = 'none';
                    document.body.appendChild(form);
                    form.submit();
                }
            }


        }]);


    mod.factory('TestCaseDocumentationLoader',
        ['$q', '$http', function ($q, $http) {

            var TestCaseDocumentationLoader = function () {
            };


            TestCaseDocumentationLoader.prototype.getOneByStage = function (stage) {
                var delay = $q.defer();
//
//                $http.get('../../resources/documentation/cb.json').then(
//                    function (object) {
//                        delay.resolve(angular.fromJson(object.data));
//                    },
//                    function (response) {
//                        delay.reject(response.data);
//                    }
//                );

                $http.get('api/documentation/testcases', {params: {"stage": stage}, timeout: 60000}).then(
                    function (object) {
                        if (object.data != null && object.data != "") {
                            delay.resolve(angular.fromJson(object.data));
                        } else {
                            delay.resolve(null);
                        }
                    },
                    function (response) {
                        delay.reject(response.data);
                    }
                );
                return delay.promise;
            };


            return TestCaseDocumentationLoader;
        }
        ]);


    mod.directive('testcaseDocTree', [
        '$timeout', function ($timeout, $rootScope) {
            return {
                restrict: 'E',
                templateUrl: '/testcase-doc-tree.html',
                replace: true,
                scope: {
                    treeControl: '='
                },
                link: function (scope, element, attrs) {
                    var error, expand_all_parents, expand_level, for_all_ancestors, for_each_branch, get_parent, n, on_treeData_change, select_branch, selected_branch, tree;
                    error = function (s) {
                        // console.log('ERROR:' + s);
                        debugger;
                        return void 0;
                    };
                    if (attrs.iconExpand == null) {
                        attrs.iconExpand = 'fa fa-caret-right';
                    }
                    if (attrs.iconCollapse == null) {
                        attrs.iconCollapse = 'fa fa-caret-down';
                    }
                    if (attrs.iconLeaf == null) {
                        attrs.iconLeaf = 'fa fa-file';
                    }
                    if (attrs.expandLevel == null) {
                        attrs.expandLevel = '3';
                    }
                    scope.treeData = [];
                    expand_level = parseInt(attrs.expandLevel, 10);
                    if (!scope.treeData) {
                        alert('no treeData defined for the tree!');
                        return;
                    }
                    if (scope.treeData.length == null) {
                        if (treeData.title != null) {
                            scope.treeData = [treeData];
                        } else {
                            alert('treeData should be an array of root branches');
                            return;
                        }
                    }
                    for_each_branch = function (f) {
                        var do_f, root_branch, _i, _len, _ref, _results;
                        do_f = function (branch, level) {
                            var child, _i, _len, _ref, _results;
                            f(branch, level);
                            if (branch.children != null) {
                                _ref = branch.children;
                                _results = [];
                                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                    child = _ref[_i];
                                    _results.push(do_f(child, level + 1));
                                }
                                return _results;
                            }
                        };
                        _ref = scope.treeData;
                        _results = [];
                        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                            root_branch = _ref[_i];
                            _results.push(do_f(root_branch, 1));
                        }
                        return _results;
                    };
                    selected_branch = null;
                    select_branch = function (branch) {
                        if (!branch) {
                            if (selected_branch != null) {
                                selected_branch.selected = false;
                            }
                            selected_branch = null;
                            return;
                        }
                        if (branch !== selected_branch) {
                            if (selected_branch != null) {
                                selected_branch.selected = false;
                            }
                            branch.selected = true;
                            selected_branch = branch;
                            expand_all_parents(branch);
                            if (branch.onSelect != null) {
                                return $timeout(function () {
                                    return branch.onSelect(branch);
                                });
                            } else {
                                if (scope.onSelect != null) {
                                    return $timeout(function () {
                                        return scope.onSelect({
                                            branch: branch
                                        });
                                    });
                                }
                            }
                        }
                    };
                    scope.user_clicks_branch = function (branch) {
                        if (branch !== selected_branch) {
                            return select_branch(branch);
                        }
                    };

                    scope.is_node_selectable = function (branch) {
                        return scope.isSelectable({
                            branch: branch
                        });
                    };

//                    scope.get_icon_type = function (branch) {
//                        var connType = branch['testingType'];
//                        return  connType === 'TA_MANUAL' || connType === 'SUT_MANUAL' ? 'fa fa-check-square-o' : connType === 'TA_INITIATOR' || connType === 'SUT_INITIATOR' ? 'fa fa-arrow-right' : connType === 'TA_RESPONDER' || connType === 'SUT_RESPONDER' ? 'fa fa-arrow-left' : null;
//                    };

                    scope.toggle_expand = function (branch) {
                        scope.set_expand(branch, !branch.expanded);
                        on_treeData_change();
                    };

                    scope.set_expand = function (branch, value) {
                        branch.expanded = value;
                    };

                    get_parent = function (child) {
                        var parent;
                        parent = void 0;
                        if (child.parent_uid) {
                            for_each_branch(function (b) {
                                if (b.uid === child.parent_uid) {
                                    return parent = b;
                                }
                            });
                        }
                        return parent;
                    };
                    for_all_ancestors = function (child, fn) {
                        var parent;
                        parent = get_parent(child);
                        if (parent != null) {
                            fn(parent);
                            return for_all_ancestors(parent, fn);
                        }
                    };
                    expand_all_parents = function (child) {
                        return for_all_ancestors(child, function (b) {
                            return b.expanded = true;
                        });
                    };
                    scope.tree_rows = [];
                    on_treeData_change = function () {
                        var add_branch_to_list, root_branch, _i, _len, _ref, _results;
                        for_each_branch(function (b, level) {
                            if (!b.uid) {
                                return b.uid = "" + Math.random();
                            }
                        });
//                        console.log('UIDs are set.');
                        for_each_branch(function (b) {
                            var child, _i, _len, _ref, _results;
                            if (angular.isArray(b.children)) {
                                _ref = b.children;
                                _results = [];
                                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                    child = _ref[_i];
                                    _results.push(child.parent_uid = b.uid);
                                }
                                return _results;
                            }
                        });
                        scope.tree_rows = [];
                        for_each_branch(function (branch) {
                            var child, f;
                            if (branch.children) {
                                if (branch.children.length > 0) {
                                    f = function (e) {
                                        if (typeof e === 'string') {
                                            return {
                                                label: e,
                                                children: []
                                            };
                                        } else {
                                            return e;
                                        }
                                    };
                                    return branch.children = (function () {
                                        var _i, _len, _ref, _results;
                                        _ref = branch.children;
                                        _results = [];
                                        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                            child = _ref[_i];
                                            _results.push(f(child));
                                        }
                                        return _results;
                                    })();
                                }
                            } else {
                                return branch.children = [];
                            }
                        });
                        add_branch_to_list = function (level, branch, visible) {
                            var child, child_visible, tree_icon, _i, _len, _ref, _results;
                            if (branch.expanded == null) {
                                branch.expanded = false;
                            }
                            if (!branch.children || branch.children.length === 0) {
                                tree_icon = attrs.iconLeaf;
                            } else {
                                if (branch.expanded) {
                                    tree_icon = attrs.iconCollapse;
                                } else {
                                    tree_icon = attrs.iconExpand;
                                }
                            }
                            scope.tree_rows.push({
                                level: level,
                                branch: branch,
                                title: branch.title,
                                mcPath: branch.mcPath,
                                tdsPath: branch.tdsPath,
                                tpPath: branch.tpPath,
                                jdPath: branch.jdPath,
                                tsPath: branch.tsPath,
                                csPath: branch.csPath,
                                exMsgPresent: branch.exMsgPresent,
                                xmlConfProfilePresent: branch.xmlConfProfilePresent,
                                xmlValueSetLibraryPresent: branch.xmlValueSetLibraryPresent,
                                tree_icon: tree_icon,
                                visible: visible
                            });
                            if (branch.children != null) {
                                _ref = branch.children;
                                _results = [];
                                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                    child = _ref[_i];
                                    child_visible = visible && branch.expanded;
                                    _results.push(add_branch_to_list(level + 1, child, child_visible));
                                }
                                return _results;
                            }
                        };
                        _ref = scope.treeData;
                        _results = [];
                        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                            root_branch = _ref[_i];
                            _results.push(add_branch_to_list(1, root_branch, true));
                        }
                        return _results;
                    };

                    if (attrs.initialSelection != null) {
                        for_each_branch(function (b) {
                            if (b.title === attrs.initialSelection) {
                                return $timeout(function () {
                                    return select_branch(b);
                                });
                            }
                        });
                    }
                    n = scope.treeData.length;
//                    console.log('num root branches = ' + n);
                    for_each_branch(function (b, level) {
                        b.level = level;
                        return b.expanded = b.level < expand_level;
                    });
                    if (scope.treeControl != null) {
                        if (angular.isObject(scope.treeControl)) {
                            tree = scope.treeControl;

                            tree.build_all = function (treeData) {
                                scope.treeData = treeData;
                                on_treeData_change();
                            };

                            tree.expand_all = function () {
                                return for_each_branch(function (b, level) {
                                    return b.expanded = true;
                                });
                            };
                            tree.collapse_all = function () {
                                return for_each_branch(function (b, level) {
                                    return b.expanded = false;
                                });
                            };
                            tree.get_first_branch = function () {
                                n = scope.treeData.length;
                                if (n > 0) {
                                    return scope.treeData[0];
                                }
                            };
                            tree.select_first_branch = function () {
                                var b;
                                b = tree.get_first_branch();
                                return tree.select_branch(b);
                            };
                            tree.get_selected_branch = function () {
                                return selected_branch;
                            };
                            tree.get_parent_branch = function (b) {
                                return get_parent(b);
                            };
                            tree.select_branch = function (b) {
                                select_branch(b);
                                return b;
                            };
                            tree.get_children = function (b) {
                                return b.children;
                            };
                            tree.select_parent_branch = function (b) {
                                var p;
                                if (b == null) {
                                    b = tree.get_selected_branch();
                                }
                                if (b != null) {
                                    p = tree.get_parent_branch(b);
                                    if (p != null) {
                                        tree.select_branch(p);
                                        return p;
                                    }
                                }
                            };
                            tree.add_branch = function (parent, new_branch) {
                                if (parent != null) {
                                    parent.children.push(new_branch);
                                    parent.expanded = true;
                                } else {
                                    scope.treeData.push(new_branch);
                                }
                                return new_branch;
                            };
                            tree.add_root_branch = function (new_branch) {
                                tree.add_branch(null, new_branch);
                                return new_branch;
                            };
                            tree.expand_branch = function (b) {
                                if (b == null) {
                                    b = tree.get_selected_branch();
                                }
                                if (b != null) {
                                    b.expanded = true;
                                    on_treeData_change();
                                    return b;
                                }
                            };
                            tree.collapse_branch = function (b) {
                                if (b == null) {
                                    b = selected_branch;
                                }
                                if (b != null) {
                                    b.expanded = false;
                                    on_treeData_change();
                                    return b;
                                }
                            };
                            tree.get_siblings = function (b) {
                                var p, siblings;
                                if (b == null) {
                                    b = selected_branch;
                                }
                                if (b != null) {
                                    p = tree.get_parent_branch(b);
                                    if (p) {
                                        siblings = p.children;
                                    } else {
                                        siblings = scope.treeData;
                                    }
                                    return siblings;
                                }
                            };
                            tree.get_next_sibling = function (b) {
                                var i, siblings;
                                if (b == null) {
                                    b = selected_branch;
                                }
                                if (b != null) {
                                    siblings = tree.get_siblings(b);
                                    n = siblings.length;
                                    i = siblings.indexOf(b);
                                    if (i < n) {
                                        return siblings[i + 1];
                                    }
                                }
                            };
                            tree.get_prev_sibling = function (b) {
                                var i, siblings;
                                if (b == null) {
                                    b = selected_branch;
                                }
                                siblings = tree.get_siblings(b);
                                n = siblings.length;
                                i = siblings.indexOf(b);
                                if (i > 0) {
                                    return siblings[i - 1];
                                }
                            };
                            tree.select_next_sibling = function (b) {
                                var next;
                                if (b == null) {
                                    b = selected_branch;
                                }
                                if (b != null) {
                                    next = tree.get_next_sibling(b);
                                    if (next != null) {
                                        return tree.select_branch(next);
                                    }
                                }
                            };
                            tree.select_prev_sibling = function (b) {
                                var prev;
                                if (b == null) {
                                    b = selected_branch;
                                }
                                if (b != null) {
                                    prev = tree.get_prev_sibling(b);
                                    if (prev != null) {
                                        return tree.select_branch(prev);
                                    }
                                }
                            };
                            tree.get_first_child = function (b) {
                                var _ref;
                                if (b == null) {
                                    b = selected_branch;
                                }
                                if (b != null) {
                                    if (((_ref = b.children) != null ? _ref.length : void 0) > 0) {
                                        return b.children[0];
                                    }
                                }
                            };
                            tree.get_closest_ancestor_next_sibling = function (b) {
                                var next, parent;
                                next = tree.get_next_sibling(b);
                                if (next != null) {
                                    return next;
                                } else {
                                    parent = tree.get_parent_branch(b);
                                    return tree.get_closest_ancestor_next_sibling(parent);
                                }
                            };
                            tree.get_next_branch = function (b) {
                                var next;
                                if (b == null) {
                                    b = selected_branch;
                                }
                                if (b != null) {
                                    next = tree.get_first_child(b);
                                    if (next != null) {
                                        return next;
                                    } else {
                                        next = tree.get_closest_ancestor_next_sibling(b);
                                        return next;
                                    }
                                }
                            };
                            tree.select_next_branch = function (b) {
                                var next;
                                if (b == null) {
                                    b = selected_branch;
                                }
                                if (b != null) {
                                    next = tree.get_next_branch(b);
                                    if (next != null) {
                                        tree.select_branch(next);
                                        return next;
                                    }
                                }
                            };
                            tree.last_descendant = function (b) {
                                var last_child;
                                if (b == null) {
                                    debugger;
                                }
                                n = b.children.length;
                                if (n === 0) {
                                    return b;
                                } else {
                                    last_child = b.children[n - 1];
                                    return tree.last_descendant(last_child);
                                }
                            };
                            tree.get_prev_branch = function (b) {
                                var parent, prev_sibling;
                                if (b == null) {
                                    b = selected_branch;
                                }
                                if (b != null) {
                                    prev_sibling = tree.get_prev_sibling(b);
                                    if (prev_sibling != null) {
                                        return tree.last_descendant(prev_sibling);
                                    } else {
                                        parent = tree.get_parent_branch(b);
                                        return parent;
                                    }
                                }
                            };
                            return tree.select_prev_branch = function (b) {
                                var prev;
                                if (b == null) {
                                    b = selected_branch;
                                }
                                if (b != null) {
                                    prev = tree.get_prev_branch(b);
                                    if (prev != null) {
                                        tree.select_branch(prev);
                                        return prev;
                                    }
                                }
                            };
                        }
                    }
                }
            };
        }
    ]);

    mod.factory('KnownIssueListLoader', ['$q', '$http', 'StorageService', '$timeout',
        function ($q, $http, StorageService, $timeout) {
            return function () {
                var delay = $q.defer();
                $http.get("api/documentation/knownissues").then(
                    function (object) {
                        delay.resolve(angular.fromJson(object.data));
                    },
                    function (response) {
                        delay.reject(response.data);
                    }
                );
//                $http.get('../../resources/documentation/docs.json').then(
//                    function (object) {
//                        delay.resolve(angular.fromJson(object.data));
//                    },
//                    function (response) {
//                        delay.reject(response.data);
//                    }
//                );

                return delay.promise;
            };
        }
    ]);


    mod.factory('ReleaseNoteListLoader', ['$q', '$http', 'StorageService', '$timeout',
        function ($q, $http, StorageService, $timeout) {
            return function () {
                var delay = $q.defer();
                $http.get("api/documentation/releasenotes").then(
                    function (object) {
                        delay.resolve(angular.fromJson(object.data));
                    },
                    function (response) {
                        delay.reject(response.data);
                    }
                );
//
//                $http.get('../../resources/documentation/docs.json').then(
//                    function (object) {
//                        delay.resolve(angular.fromJson(object.data));
//                    },
//                    function (response) {
//                        delay.reject(response.data);
//                    }
//                );

                return delay.promise;
            };
        }
    ]);

    mod.factory('UserDocListLoader', ['$q', '$http', 'StorageService', '$timeout',
        function ($q, $http, StorageService, $timeout) {
            return function () {
                var delay = $q.defer();
                $http.get("api/documentation/userdocs").then(
                    function (object) {
                        delay.resolve(angular.fromJson(object.data));
                    },
                    function (response) {
                        delay.reject(response.data);
                    }
                );
//
//                $http.get('../../resources/documentation/docs.json').then(
//                    function (object) {
//                        delay.resolve(angular.fromJson(object.data));
//                    },
//                    function (response) {
//                        delay.reject(response.data);
//                    }
//                );

                return delay.promise;
            };
        }
    ]);


    mod.factory('ResourceDocListLoader', ['$q', '$http', 'StorageService', '$timeout',
        function ($q, $http, StorageService, $timeout) {
            return function (type) {
                var delay = $q.defer();
                $http.get('api/documentation/resourcedocs', {params: {"type": type}, timeout: 60000}).then(
                    function (object) {
                        delay.resolve(angular.fromJson(object.data));
                    },
                    function (response) {
                        delay.reject(response.data);
                    }
                );
                return delay.promise;
            };
        }
    ]);


    mod.factory('DeliverableListLoader', ['$q', '$http', 'StorageService', '$timeout',
        function ($q, $http, StorageService, $timeout, $rootScope) {
            return function () {
                var delay = $q.defer();
                $http.get('api/documentation/deliverables', {timeout: 60000}).then(
                    function (object) {
                        delay.resolve(angular.fromJson(object.data));
                    },
                    function (response) {
                        delay.reject(response.data);
                    }
                );
                return delay.promise;
            };
        }
    ]);

    mod.factory('InstallationGuideLoader', ['$q', '$http', '$timeout',
        function ($q, $http, $timeout, $rootScope) {
            return function () {
                var delay = $q.defer();
                $http.get('api/documentation/installationguide', {timeout: 60000}).then(
                    function (object) {
                        if(object.data != null && object.data != "") {
                            delay.resolve(angular.fromJson(object.data));
                        }else{
                            delay.resolve(null);
                        }
                    },
                    function (response) {
                        delay.reject(response.data);
                    }
                );
                return delay.promise;
            };
        }
    ]);



}).call(this);
