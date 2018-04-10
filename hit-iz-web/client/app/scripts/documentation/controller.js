angular.module('doc')
  .controller('DocumentationCtrl', function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, userInfoService,StorageService) {
    $scope.status = {userDoc: true};
    $scope.scrollbarWidth = $rootScope.getScrollbarWidth();

    $scope.selectedScope = {key: 'USER'};
    $scope.documentsScopes = [];
    $scope.allDocumentsScopes = [{key: 'USER', name: 'Private'}, {
      key: 'GLOBAL',
      name: 'Public'
    }];

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

    $scope.initDocumentation = function () {
      if ($rootScope.isDocumentationManagementSupported() && userInfoService.isAuthenticated()) {
        if (userInfoService.isAdmin() || userInfoService.isSupervisor()) {
          $scope.documentsScopes = $scope.allDocumentsScopes;
        } else {
          $scope.documentsScopes = [$scope.allDocumentsScopes[1]];
        }
      }else{
        $scope.documentsScopes = [$scope.allDocumentsScopes[1]];
      }
      $scope.selectedScope.key = $scope.documentsScopes[0].key;
      $scope.selectScope();
    };

    $scope.selectScope = function () {
      $scope.error = null;
      if ($scope.selectedScope.key && $scope.selectedScope.key !== null && $scope.selectedScope.key !== "" && $rootScope.domain != null && $rootScope.domain.value != null) {
        StorageService.set("DOC_MANAGE_SELECTED_SCOPE_KEY", $scope.selectedScope.key);
        $scope.$broadcast('event:doc:scopeChangedEvent', $scope.selectedScope.key);
      }
    };


  });


angular.module('doc')
  .controller('UserDocsCtrl', function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, UserDocListLoader,StorageService) {
    $scope.docs = [];
    $scope.loading = true;
    $scope.error = null;
    $scope.scrollbarWidth = $rootScope.getScrollbarWidth();


    $scope.initUserDocs = function (scope, wait) {
      $scope.loading = true;
      $timeout(function () {
        if (scope === null || scope === undefined) {
          scope = StorageService.get('DOC_MANAGE_SELECTED_SCOPE_KEY');
          scope = scope && scope != null ? scope : 'GLOBAL';
        }
        var loader = new UserDocListLoader($rootScope.domain.value, scope);
        loader.then(function (result) {
          $scope.loading = false;
          $scope.docs = result;
        }, function (error) {
          $scope.loading = false;
          $scope.error = null;
          $scope.docs = [];
        });
      }, wait);
    };


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
    };

    $scope.initUserDocs(null, 3000);

    $scope.$on('event:doc:scopeChangedEvent', function (scope) {
      $scope.initUserDocs(scope, 500);
    });


  });


angular.module('doc')
  .controller('ReleaseNotesCtrl',function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, ReleaseNoteListLoader,StorageService) {
    $scope.docs = [];
    $scope.loading = false;
    $scope.error = null;
    $scope.scrollbarWidth = $rootScope.getScrollbarWidth();


    $scope.initReleaseNotes = function (wait) {
      $scope.loading = true;
      $timeout(function () {
        var loader = new ReleaseNoteListLoader();
        loader.then(function (result) {
          $scope.loading = false;
          $scope.docs = result;
        }, function (error) {
          $scope.loading = false;
          $scope.error = null;
          $scope.docs = [];
        });

      }, wait);

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


    $scope.initReleaseNotes(3000);

  });


angular.module('doc')
  .controller('KnownIssuesCtrl', function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, KnownIssueListLoader,StorageService) {
    $scope.docs = [];
    $scope.loading = false;
    $scope.error = null;
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
    };

    $scope.initKnownIssues = function (wait) {
      $scope.loading = true;
      $timeout(function () {
        var loader = new KnownIssueListLoader();
        loader.then(function (result) {
          $scope.loading = false;
          $scope.docs = result;
        }, function (error) {
          $scope.loading = false;
          $scope.error = null;
          $scope.docs = [];
        });

      }, wait);

    };

    $scope.initKnownIssues(3000);

    // $scope.$on('event:doc:scopeChangedEvent', function (scope) {
    //   $scope.initKnownIssues(scope, 500);
    // });


  });

angular.module('doc')
  .controller('ResourceDocsCtrl', function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, ResourceDocListLoader,StorageService) {
    $scope.data = null;
    $scope.loading = false;
    $scope.error = null;
    $scope.scrollbarWidth = $rootScope.getScrollbarWidth();


    $scope.initResourceDocs = function (scope, wait) {
      if ($scope.type != null && $scope.type != "" && $scope.name != null && $scope.name != "") {
        $scope.loading = true;
        $timeout(function () {
          if (scope === null || scope === undefined) {
            scope = StorageService.get('DOC_MANAGE_SELECTED_SCOPE_KEY');
            scope = scope && scope != null ? scope : 'GLOBAL';
          }
          var listLoader = new ResourceDocListLoader($scope.type, scope, $rootScope.domain.value);
          listLoader.then(function (result) {
            $scope.error = null;
            $scope.data = result;
            $scope.loading = false;
          }, function (error) {
            $scope.loading = false;
            $scope.error = "Sorry, failed to load the " + $scope.name;
          });
        }, wait);
      }
    };


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
    };


    $scope.initResourceDocs(null, 3000);

    $scope.$on('event:doc:scopeChangedEvent', function (scope) {
      $scope.initResourceDocs(scope, 500);
    });


  });

angular.module('doc')
  .controller('ToolDownloadListCtrl', function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, DeliverableListLoader,StorageService) {
    $scope.data = [];
    $scope.loading = false;
    $scope.error = null;
    $scope.scrollbarWidth = $rootScope.getScrollbarWidth();
    $scope.loading = true;

    $scope.initToolDownloadList = function (wait) {
      $scope.loading = true;
      $timeout(function () {
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
      }, wait);
    };

    $scope.initToolDownloadList(3000);

  });

angular.module('doc')
  .controller('ApiDocsCtrl', function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, $window,StorageService) {
    $scope.data = [];
    $scope.loading = false;
    $scope.error = null;
    $scope.scrollbarWidth = $rootScope.getScrollbarWidth();

    $scope.apiLink = function () {
      return $rootScope.apiLink;
    };
  });


angular.module('doc')
  .controller('InstallationGuideCtrl', function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, InstallationGuideLoader,StorageService) {
    $scope.doc = null;
    $scope.loading = false;
    $scope.error = null;
    $scope.scrollbarWidth = $rootScope.getScrollbarWidth();
    $scope.loading = true;


    $timeout(function () {
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

    }, 5000);


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
  });


angular.module('doc')
  .controller('TestCaseDocumentationCtrl', function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, TestCaseDocumentationLoader, ngTreetableParams,StorageService) {
    $scope.context = null;
    $scope.data = null;
    $scope.loading = false;
    $scope.scrollbarWidth = $rootScope.getScrollbarWidth();
    $scope.error = null;
    var testCaseLoader = new TestCaseDocumentationLoader();
    $scope.error = null;
    $scope.tree = {};


    $scope.initTestCaseDocumentation = function (scope, wait) {
      if ($scope.stage != null && $scope.stage != '') {
        $scope.loading = true;
        $timeout(function () {
          if (scope === null || scope === undefined) {
            scope = StorageService.get('DOC_MANAGE_SELECTED_SCOPE_KEY');
            scope = scope && scope != null ? scope : 'GLOBAL';
          }
          var tcLoader = testCaseLoader.getOneByDomainAndScope($rootScope.domain.value, scope);
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

        }, wait);
      }
    };

    $scope.initTestCaseDocumentation(null, 3000);

    $scope.$on('event:doc:scopeChangedEvent', function (scope) {
      $scope.initTestCaseDocumentation(scope, 500);
    });


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


    $scope.downloadConstraints = function (row) {
      $scope.downloadContextFile(row.id, row.type, $scope.formatUrl(row.format) + "constraints", row.title);
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

  });
