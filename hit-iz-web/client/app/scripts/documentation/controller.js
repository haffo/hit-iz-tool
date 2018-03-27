angular.module('doc')
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
    };

    $scope.initDocumentation = function () {

    };


  }]);


angular.module('doc')
  .controller('UserDocsCtrl', ['$scope', '$rootScope', '$http', '$filter', '$cookies', '$sce', '$timeout', 'UserDocListLoader', function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, UserDocListLoader) {
    $scope.docs = [];
    $scope.loading = true;
    $scope.error = null;
    $scope.scrollbarWidth = $rootScope.getScrollbarWidth();

    $timeout(function () {
      var loader = new UserDocListLoader();
      loader.then(function (result) {
        $scope.loading = false;
        $scope.docs = result;
      }, function (error) {
        $scope.loading = false;
        $scope.error = null;
        $scope.docs = [];
      });

    }, 5000);

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


angular.module('doc')
  .controller('ReleaseNotesCtrl', ['$scope', '$rootScope', '$http', '$filter', '$cookies', '$sce', '$timeout', 'ReleaseNoteListLoader', function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, ReleaseNoteListLoader) {
    $scope.docs = [];
    $scope.loading = false;
    $scope.error = null;
    $scope.scrollbarWidth = $rootScope.getScrollbarWidth();



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


  }]);


angular.module('doc')
  .controller('KnownIssuesCtrl', ['$scope', '$rootScope', '$http', '$filter', '$cookies', '$sce', '$timeout', 'KnownIssueListLoader', function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, KnownIssueListLoader) {
    $scope.docs = [];
    $scope.loading = false;
    $scope.error = null;
    $scope.scrollbarWidth = $rootScope.getScrollbarWidth();


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

  }]);

angular.module('doc')
  .controller('ResourceDocsCtrl', ['$scope', '$rootScope', '$http', '$filter', '$cookies', '$sce', '$timeout', 'ResourceDocListLoader', function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, ResourceDocListLoader) {
    $scope.data = null;
    $scope.loading = false;
    $scope.error = null;
    $scope.scrollbarWidth = $rootScope.getScrollbarWidth();
    if ($scope.type != null && $scope.type != "" && $scope.name != null && $scope.name != "") {
      $scope.loading = true;


      $timeout(function () {

        var listLoader = new ResourceDocListLoader($scope.type);
        listLoader.then(function (result) {
          $scope.error = null;
          $scope.data = result;
          $scope.loading = false;
        }, function (error) {
          $scope.loading = false;
          $scope.error = "Sorry, failed to load the " + $scope.name;
        });


      }, 5000);



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

angular.module('doc')
  .controller('ToolDownloadListCtrl', ['$scope', '$rootScope', '$http', '$filter', '$cookies', '$sce', '$timeout', 'DeliverableListLoader', function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, DeliverableListLoader) {
    $scope.data = [];
    $scope.loading = false;
    $scope.error = null;
    $scope.scrollbarWidth = $rootScope.getScrollbarWidth();
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


    }, 5000);


  }]);

angular.module('doc')
  .controller('ApiDocsCtrl', ['$scope', '$rootScope', '$http', '$filter', '$cookies', '$sce', '$timeout','$window', function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout,$window) {
    $scope.data = [];
    $scope.loading = false;
    $scope.error = null;
    $scope.scrollbarWidth = $rootScope.getScrollbarWidth();

    $scope.apiLink = function(){
      return $rootScope.apiLink;
    };
//            var listLoader = new DeliverableListLoader();
//            listLoader.then(function (result) {
//                $scope.error = null;
//                $scope.data = result;
//                $scope.loading = false;
//            }, function (error) {
//                $scope.loading = false;
//                $scope.error = "Sorry, failed to load the files";
//                $scope.data = [];
//            });
  }]);


angular.module('doc')
  .controller('InstallationGuideCtrl', ['$scope', '$rootScope', '$http', '$filter', '$cookies', '$sce', '$timeout', 'InstallationGuideLoader', function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, InstallationGuideLoader) {
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
  }]);


angular.module('doc')
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


      $timeout(function () {

        var tcLoader = testCaseLoader.getOneByStageAndDomain($scope.stage, $rootScope.domain.value);
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

      }, 5000);


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


  }]);
