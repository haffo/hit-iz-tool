angular.module('doc')
  .controller('DocumentationCtrl', function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, userInfoService, StorageService) {
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
      } else {
        $scope.documentsScopes = [$scope.allDocumentsScopes[1]];
      }
      $scope.selectedScope.key = $scope.documentsScopes[0].key;
      $scope.selectScope();
    };

    $scope.selectScope = function () {
      $scope.error = null;
      if ($scope.selectedScope.key && $scope.selectedScope.key !== null && $scope.selectedScope.key !== "" && $rootScope.domain != null && $rootScope.domain.domain != null) {
        StorageService.set("DOC_MANAGE_SELECTED_SCOPE_KEY", $scope.selectedScope.key);
        $scope.$broadcast('event:doc:scopeChangedEvent', $scope.selectedScope.key);
      }
    };


  });


angular.module('doc')
  .controller('UserDocsCtrl', function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, DocumentationManager, StorageService, $modal, Notification,userInfoService) {
    $scope.docs = [];
    $scope.loading = true;
    $scope.error = null;
    $scope.scrollbarWidth = $rootScope.getScrollbarWidth();
    $scope.scope = null;
    $scope.actionError = null;
    $scope.type = "USERDOC";

    $scope.canEdit = false;



    $scope.initUserDocs = function (scope, wait) {
        $scope.loading = true;
        $timeout(function () {
          if($rootScope.domain != null) {
            if (scope === null || scope === undefined) {
              scope = StorageService.get('DOC_MANAGE_SELECTED_SCOPE_KEY');
              scope = scope && scope != null ? scope : 'GLOBAL';
            }
            $scope.scope = scope;
            DocumentationManager.getDocuments($rootScope.domain.domain, scope, $scope.type).then(function (result) {
              $scope.loading = false;
              $scope.docs = result;
            }, function (error) {
              $scope.loading = false;
              $scope.error = null;
              $scope.docs = [];
            });
          }
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

    $scope.$on('event:doc:scopeChangedEvent', function (scope){
      $scope.canEdit = canEdit;
      $scope.initUserDocs(scope, 500);
    });


    $scope.addDocument = function () {
      $scope.actionError = null;
      var modalInstance = $modal.open({
        templateUrl: 'views/documentation/edit-document.html',
        controller: 'CreateOrEditDocumentCtrl',
        windowClass: 'documentation-upload-modal',
        backdrop: 'static',
        keyboard: false,
        backdropClick: false,
        resolve: {
          totalNumber: function () {
            return $scope.docs.length + 1;
          },
          document: function () {
            var document = {};
            document.position = $scope.docs.length + 1;
            document.type = $scope.type;
            document.scope = $scope.scope;
            document.domain = $rootScope.domain.domain;
            return document;
          }
        }
      });
      modalInstance.result.then(
        function (document) {
          if (document && document != null) {
            Notification.success({
              message: "Document added successfully !",
              templateUrl: "NotificationSuccessTemplate.html",
              scope: $rootScope,
              delay: 5000
            });
            $scope.initUserDocs($scope.scope, 100);
          }
        });
    };

    $scope.editDocument = function (document) {
      $scope.actionError = null;
      var modalInstance = $modal.open({
        templateUrl: 'views/documentation/edit-document.html',
        controller: 'CreateOrEditDocumentCtrl',
        windowClass: 'documentation-upload-modal',
        backdrop: 'static',
        keyboard: false,
        backdropClick: false,
        resolve: {
          totalNumber: function () {
            return $scope.docs.length + 1;
          },
          document: function () {
            return angular.copy(document);
          }
        }
      });
      modalInstance.result.then(
        function (document) {
          if (document && document != null) {
            Notification.success({
              message: "Document saved successfully !",
              templateUrl: "NotificationSuccessTemplate.html",
              scope: $rootScope,
              delay: 5000
            });
            $scope.initUserDocs($scope.scope, 100);
          }
        });
    };


    $scope.deleteDocument = function (document) {

      $scope.actionError = null;
      var modalInstance = $modal.open({
        templateUrl: 'views/documentation/confirm-delete.html',
        controller: 'ConfirmDialogCtrl',
        size: 'md',
        backdrop: 'static',
        keyboard: false
      });
      modalInstance.result.then(
        function (result) {
          if (result) {
            DocumentationManager.deleteDocument(document.id).then(function (result) {
              Notification.success({
                message: "Document deleted successfully !",
                templateUrl: "NotificationSuccessTemplate.html",
                scope: $rootScope,
                delay: 5000
              });
              $scope.initUserDocs($scope.scope, 100);
            }, function (error) {
              $scope.actionError = "Sorry, Cannot delete the document. Please try again. \n DEBUG:" + error;
            });
          }
        });
    };


    $scope.publishDocument = function (document) {

      $scope.actionError = null;
      var modalInstance = $modal.open({
        templateUrl: 'views/documentation/confirm-publish.html',
        controller: 'ConfirmDialogCtrl',
        size: 'md',
        backdrop: 'static',
        keyboard: false
      });
      modalInstance.result.then(
        function (result) {
          if (result) {
            DocumentationManager.publishDocument(document.id).then(function (result) {
              Notification.success({
                message: "Document published successfully !",
                templateUrl: "NotificationSuccessTemplate.html",
                scope: $rootScope,
                delay: 5000
              });
              $scope.initUserDocs($scope.scope, 100);
            }, function (error) {
              $scope.actionError = "Sorry, Cannot delete the document. Please try again. \n DEBUG:" + error;
            });
          }
        });
    };


  });


angular.module('doc').controller('CreateOrEditDocumentCtrl', function ($scope, $modalInstance, DocumentationManager, FileUploader, totalNumber, document) {


  $scope.error = null;
  $scope.loading = false;
  $scope.hasUrl = false;
  $scope.totalNumber = totalNumber;
  $scope.document = document;
  $scope.uploadedPath = null;


  if ($scope.document.path && $scope.document.path.startsWith("http")) {
    $scope.hasUrl = true;
  } else {
    $scope.uploadedPath = $scope.document.path;
    $scope.document.path = "";
  }

  $scope.positions = function () {
    var array = new Array($scope.totalNumber);
    for (var index = 0; index < array.length; index++) {
      array[index] = index + 1;
    }
    return array;
  };


  FileUploader.FileSelect.prototype.isEmptyAfterSelection = function () {
    return true;
  };

  var documentUploader = $scope.documentUploader = new FileUploader({
    url: 'api/documentation/uploadDocument',
    autoUpload: true,
    filters: [{
      name: 'fileFilter',
      fn: function (item) {
        // return /\/(pdf,html,doc,docx,pptx,ppt)$/.test(item.type);
        return /\/(pdf)$/.test(item.type)
          || /\/(html)$/.test(item.type)
          || /\/(doc)$/.test(item.type)
          || /\/(docx)$/.test(item.type)
          || /\/(ppt)$/.test(item.type)
          || /\/(pptx)$/.test(item.type);
      }
    }]
  });


  documentUploader.onBeforeUploadItem = function (fileItem) {
    $scope.error = null;
    $scope.uploadedUrl = null;
    $scope.loading = true;
    fileItem.formData.push({domain: $scope.document.domain, type: $scope.document.type});
  };

  documentUploader.onCompleteItem = function (fileItem, response, status, headers) {
    $scope.loading = false;
    $scope.error = null;
    if (response.success == false) {
      $scope.error = "Could not upload and process your file.<br>" + response.message;
    } else {
      $scope.uploadedPath = response.path;
    }
  };


  $scope.noFileFound = function(){
    return !$scope.hasUrl && ($scope.uploadedPath === null || $scope.uploadedPath == '');
  };



  $scope.submit = function () {
    if ($scope.document.title != null && $scope.document.title != "") {
      $scope.error = null;
      $scope.loading = true;
      if(!$scope.hasUrl && $scope.uploadedPath !== null && $scope.uploadedPath !== ''){
        $scope.document.path = $scope.uploadedPath;
        $scope.document.name = $scope.uploadedPath.split('\\').pop().split('/').pop();
      }
      DocumentationManager.saveDocument($scope.document).then(function (result) {
        $scope.loading = false;
        $modalInstance.close(result);
      }, function (error) {
        $scope.loading = false;
        $scope.error = error;
      });
    }
  };
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});


angular.module('doc')
  .controller('ReleaseNotesCtrl', function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, DocumentationManager, StorageService, $modal,Notification) {
    $scope.docs = [];
    $scope.loading = false;
    $scope.error = null;
    $scope.scrollbarWidth = $rootScope.getScrollbarWidth();
    $scope.type = "RELEASENOTE";

    $scope.scope = null;

    $scope.initReleaseNotes = function (scope, wait) {
        $scope.loading = true;
        $timeout(function () {
          if($rootScope.domain != null) {
            if (scope === null || scope === undefined) {
              scope = StorageService.get('DOC_MANAGE_SELECTED_SCOPE_KEY');
              scope = scope && scope != null ? scope : 'GLOBAL';
            }
            $scope.scope = scope;
            DocumentationManager.getDocuments($rootScope.domain.domain, scope, $scope.type).then(function (result) {
              $scope.loading = false;
              $scope.docs = result;
            }, function (error) {
              $scope.loading = false;
              $scope.error = null;
              $scope.docs = [];
            });
          }
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


    $scope.initReleaseNotes(null, 3000);

    $scope.$on('event:doc:scopeChangedEvent', function (scope) {
      $scope.initReleaseNotes(scope, 500);
    });


    $scope.addDocument = function () {
      $scope.actionError = null;
      var modalInstance = $modal.open({
        templateUrl: 'views/documentation/edit-document.html',
        controller: 'CreateOrEditDocumentCtrl',
        windowClass: 'documentation-upload-modal',
        backdrop: 'static',
        keyboard: false,
        backdropClick: false,
        resolve: {
          totalNumber: function () {
            return $scope.docs.length + 1;
          },
          document: function () {
            var document = {};
            document.position = $scope.docs.length + 1;
            document.type = $scope.type;
            document.scope = $scope.scope;
            document.domain = $rootScope.domain.domain;
            return document;
          }
        }
      });
      modalInstance.result.then(
        function (document) {
          if (document && document != null) {
            Notification.success({
              message: "Document added successfully !",
              templateUrl: "NotificationSuccessTemplate.html",
              scope: $rootScope,
              delay: 5000
            });
            $scope.initReleaseNotes($scope.scope, 100);
          }
        });
    };

    $scope.editDocument = function (document) {
      $scope.actionError = null;
      var modalInstance = $modal.open({
        templateUrl: 'views/documentation/edit-document.html',
        controller: 'CreateOrEditDocumentCtrl',
        windowClass: 'documentation-upload-modal',
        backdrop: 'static',
        keyboard: false,
        backdropClick: false,
        resolve: {
          totalNumber: function () {
            return $scope.docs.length + 1;
          },
          document: function () {
            return angular.copy(document);
          }
        }
      });
      modalInstance.result.then(
        function (document) {
          if (document && document != null) {
            Notification.success({
              message: "Document saved successfully !",
              templateUrl: "NotificationSuccessTemplate.html",
              scope: $rootScope,
              delay: 5000
            });
            $scope.initReleaseNotes($scope.scope, 100);
          }
        });
    };


    $scope.deleteDocument = function (document) {

      $scope.actionError = null;
      var modalInstance = $modal.open({
        templateUrl: 'views/documentation/confirm-delete.html',
        controller: 'ConfirmDialogCtrl',
        size: 'md',
        backdrop: 'static',
        keyboard: false
      });
      modalInstance.result.then(
        function (result) {
          if (result) {
            DocumentationManager.deleteDocument(document.id).then(function (result) {
              Notification.success({
                message: "Document deleted successfully !",
                templateUrl: "NotificationSuccessTemplate.html",
                scope: $rootScope,
                delay: 5000
              });
              $scope.initReleaseNotes($scope.scope, 100);
            }, function (error) {
              $scope.actionError = "Sorry, Cannot delete the document. Please try again. \n DEBUG:" + error;
            });
          }
        });
    };


    $scope.publishDocument = function (document) {

      $scope.actionError = null;
      var modalInstance = $modal.open({
        templateUrl: 'views/documentation/confirm-publish.html',
        controller: 'ConfirmDialogCtrl',
        size: 'md',
        backdrop: 'static',
        keyboard: false
      });
      modalInstance.result.then(
        function (result) {
          if (result) {
            DocumentationManager.publishDocument(document.id).then(function (result) {
              Notification.success({
                message: "Document published successfully !",
                templateUrl: "NotificationSuccessTemplate.html",
                scope: $rootScope,
                delay: 5000
              });
              $scope.initReleaseNotes($scope.scope, 100);
            }, function (error) {
              $scope.actionError = "Sorry, Cannot delete the document. Please try again. \n DEBUG:" + error;
            });
          }
        });
    };


  });


angular.module('doc')
  .controller('KnownIssuesCtrl', function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, DocumentationManager, StorageService, $modal,Notification) {
    $scope.docs = [];
    $scope.loading = false;
    $scope.error = null;
    $scope.type = 'KNOWNISSUE';
    $scope.scope = null;

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

    $scope.initKnownIssues = function (scope, wait) {
        $scope.loading = true;
        $timeout(function () {
          if($rootScope.domain != null) {
            if (scope === null || scope === undefined) {
              scope = StorageService.get('DOC_MANAGE_SELECTED_SCOPE_KEY');
              scope = scope && scope != null ? scope : 'GLOBAL';
            }
            $scope.scope = scope;
            DocumentationManager.getDocuments($rootScope.domain.domain, scope, $scope.type).then(function (result) {
              $scope.loading = false;
              $scope.docs = result;
            }, function (error) {
              $scope.loading = false;
              $scope.error = null;
              $scope.docs = [];
            });
          }
        }, wait);
    };

    $scope.initKnownIssues(null, 3000);

    $scope.$on('event:doc:scopeChangedEvent', function (scope) {
      $scope.initKnownIssues(scope, 500);
    });


    $scope.addDocument = function () {
      $scope.actionError = null;
      var modalInstance = $modal.open({
        templateUrl: 'views/documentation/edit-document.html',
        controller: 'CreateOrEditDocumentCtrl',
        windowClass: 'documentation-upload-modal',
        backdrop: 'static',
        keyboard: false,
        backdropClick: false,
        resolve: {
          totalNumber: function () {
            return $scope.docs.length + 1;
          },
          document: function () {
            var document = {};
            document.position = $scope.docs.length + 1;
            document.type = $scope.type;
            document.scope = $scope.scope;
            document.domain = $rootScope.domain.domain;
            return document;
          }
        }
      });
      modalInstance.result.then(
        function (document) {
          if (document && document != null) {
            Notification.success({
              message: "Document added successfully !",
              templateUrl: "NotificationSuccessTemplate.html",
              scope: $rootScope,
              delay: 5000
            });
            $scope.initKnownIssues($scope.scope, 100);
          }
        });
    };

    $scope.editDocument = function (document) {
      $scope.actionError = null;
      var modalInstance = $modal.open({
        templateUrl: 'views/documentation/edit-document.html',
        controller: 'CreateOrEditDocumentCtrl',
        windowClass: 'documentation-upload-modal',
        backdrop: 'static',
        keyboard: false,
        backdropClick: false,
        resolve: {
          totalNumber: function () {
            return $scope.docs.length + 1;
          },
          document: function () {
            return angular.copy(document);
          }
        }
      });
      modalInstance.result.then(
        function (document) {
          if (document && document != null) {
            Notification.success({
              message: "Document saved successfully !",
              templateUrl: "NotificationSuccessTemplate.html",
              scope: $rootScope,
              delay: 5000
            });
            $scope.initKnownIssues($scope.scope, 100);
          }
        });
    };


    $scope.deleteDocument = function (document) {

      $scope.actionError = null;
      var modalInstance = $modal.open({
        templateUrl: 'views/documentation/confirm-delete.html',
        controller: 'ConfirmDialogCtrl',
        size: 'md',
        backdrop: 'static',
        keyboard: false
      });
      modalInstance.result.then(
        function (result) {
          if (result) {
            DocumentationManager.deleteDocument(document.id).then(function (result) {
              Notification.success({
                message: "Document deleted successfully !",
                templateUrl: "NotificationSuccessTemplate.html",
                scope: $rootScope,
                delay: 5000
              });
              $scope.initKnownIssues($scope.scope, 100);
            }, function (error) {
              $scope.actionError = "Sorry, Cannot delete the document. Please try again. \n DEBUG:" + error;
            });
          }
        });
    };


    $scope.publishDocument = function (document) {

      $scope.actionError = null;
      var modalInstance = $modal.open({
        templateUrl: 'views/documentation/confirm-publish.html',
        controller: 'ConfirmDialogCtrl',
        size: 'md',
        backdrop: 'static',
        keyboard: false
      });
      modalInstance.result.then(
        function (result) {
          if (result) {
            DocumentationManager.publishDocument(document.id).then(function (result) {
              Notification.success({
                message: "Document published successfully !",
                templateUrl: "NotificationSuccessTemplate.html",
                scope: $rootScope,
                delay: 5000
              });
              $scope.initKnownIssues($scope.scope, 100);
            }, function (error) {
              $scope.actionError = "Sorry, Cannot delete the document. Please try again. \n DEBUG:" + error;
            });
          }
        });
    };


  });

angular.module('doc')
  .controller('ResourceDocsCtrl', function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, DocumentationManager, StorageService, $modal,Notification) {
    $scope.docs = [];
    $scope.loading = false;
    $scope.error = null;
    $scope.scrollbarWidth = $rootScope.getScrollbarWidth();
    $scope.scope = null;

    $scope.initResourceDocs = function (scope, wait) {
      if ($scope.type != null && $scope.type != "" && $scope.name != null && $scope.name != "") {
        $scope.loading = true;
        $timeout(function () {
          if($rootScope.domain != null) {
            if (scope === null || scope === undefined) {
              scope = StorageService.get('DOC_MANAGE_SELECTED_SCOPE_KEY');
              scope = scope && scope != null ? scope : 'GLOBAL';
            }
            $scope.scope = scope;
            DocumentationManager.getDocuments($rootScope.domain.domain, scope, $scope.type).then(function (result) {
              $scope.error = null;
              $scope.docs = result;
              $scope.loading = false;
            }, function (error) {
              $scope.loading = false;
              $scope.error = "Sorry, failed to load the " + $scope.name;
            });
          }
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


    $scope.addDocument = function () {
      $scope.actionError = null;
      var modalInstance = $modal.open({
        templateUrl: 'views/documentation/edit-document.html',
        controller: 'CreateOrEditDocumentCtrl',
        windowClass: 'documentation-upload-modal',
        backdrop: 'static',
        keyboard: false,
        backdropClick: false,
        resolve: {
          totalNumber: function () {
            return $scope.docs.length + 1;
          },
          document: function () {
            var document = {};
            document.position = $scope.docs.length + 1;
            document.type = $scope.type;
            document.scope = $scope.scope;
            document.domain = $rootScope.domain.domain;
            return document;
          }
        }
      });
      modalInstance.result.then(
        function (document) {
          if (document && document != null) {
            Notification.success({
              message: "Document added successfully !",
              templateUrl: "NotificationSuccessTemplate.html",
              scope: $rootScope,
              delay: 5000
            });
            $scope.initResourceDocs($scope.scope, 100);
          }
        });
    };

    $scope.editDocument = function (document) {
      $scope.actionError = null;
      var modalInstance = $modal.open({
        templateUrl: 'views/documentation/edit-document.html',
        controller: 'CreateOrEditDocumentCtrl',
        windowClass: 'documentation-upload-modal',
        backdrop: 'static',
        keyboard: false,
        backdropClick: false,
        resolve: {
          totalNumber: function () {
            return $scope.data.length + 1;
          },
          document: function () {
            return angular.copy(document);
          }
        }
      });
      modalInstance.result.then(
        function (document) {
          if (document && document != null) {
            Notification.success({
              message: "Document saved successfully !",
              templateUrl: "NotificationSuccessTemplate.html",
              scope: $rootScope,
              delay: 5000
            });
            $scope.initResourceDocs($scope.scope, 100);
          }
        });
    };


    $scope.deleteDocument = function (document) {

      $scope.actionError = null;
      var modalInstance = $modal.open({
        templateUrl: 'views/documentation/confirm-delete.html',
        controller: 'ConfirmDialogCtrl',
        size: 'md',
        backdrop: 'static',
        keyboard: false
      });
      modalInstance.result.then(
        function (result) {
          if (result) {
            DocumentationManager.deleteDocument(document.id).then(function (result) {
              Notification.success({
                message: "Document deleted successfully !",
                templateUrl: "NotificationSuccessTemplate.html",
                scope: $rootScope,
                delay: 5000
              });
              $scope.initResourceDocs($scope.scope, 100);
            }, function (error) {
              $scope.actionError = "Sorry, Cannot delete the document. Please try again. \n DEBUG:" + error;
            });
          }
        });
    };


    $scope.publishDocument = function (document) {

      $scope.actionError = null;
      var modalInstance = $modal.open({
        templateUrl: 'views/documentation/confirm-publish.html',
        controller: 'ConfirmDialogCtrl',
        size: 'md',
        backdrop: 'static',
        keyboard: false
      });
      modalInstance.result.then(
        function (result) {
          if (result) {
            DocumentationManager.publishDocument(document.id).then(function (result) {
              Notification.success({
                message: "Document published successfully !",
                templateUrl: "NotificationSuccessTemplate.html",
                scope: $rootScope,
                delay: 5000
              });
              $scope.initResourceDocs($scope.scope, 100);
            }, function (error) {
              $scope.actionError = "Sorry, Cannot delete the document. Please try again. \n DEBUG:" + error;
            });
          }
        });
    };


  });

angular.module('doc')
  .controller('ToolDownloadListCtrl', function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, DocumentationManager, StorageService, $modal,Notification) {
    $scope.loading = false;
    $scope.error = null;
    $scope.scrollbarWidth = $rootScope.getScrollbarWidth();
    $scope.loading = true;
    $scope.type = "DELIVERABLE";
    $scope.scope = null;
    $scope.actionError = null;
    $scope.docs = [];
    $scope.canEdit = false;


    $scope.initToolDownloadList = function (scope, wait) {
      $scope.loading = true;
      $timeout(function () {
        if($rootScope.domain != null) {
          if (scope === null || scope === undefined) {
            scope = StorageService.get('DOC_MANAGE_SELECTED_SCOPE_KEY');
            scope = scope && scope != null ? scope : 'GLOBAL';
          }
          $scope.scope = scope;
          DocumentationManager.getDocuments($rootScope.domain.domain, scope, $scope.type).then(function (result) {
            $scope.error = null;
            $scope.docs = result;
            $scope.loading = false;
          }, function (error) {
            $scope.loading = false;
            $scope.error = "Sorry, failed to load the files";
            $scope.data = [];
          });
        }
      }, wait);
    };

    $scope.$on('event:doc:scopeChangedEvent', function (scope) {
      $scope.initToolDownloadList(scope, 500);
    });


    $scope.initToolDownloadList(null, 3000);

    $scope.addDocument = function () {
      $scope.actionError = null;
      var modalInstance = $modal.open({
        templateUrl: 'views/documentation/edit-document.html',
        controller: 'CreateOrEditDocumentCtrl',
        windowClass: 'documentation-upload-modal',
        backdrop: 'static',
        keyboard: false,
        backdropClick: false,
        resolve: {
          totalNumber: function () {
            return $scope.docs.length + 1;
          },
          document: function () {
            var document = {};
            document.position = $scope.docs.length + 1;
            document.type = $scope.type;
            document.scope = $scope.scope;
            document.domain = $rootScope.domain.domain;
            return document;
          }
        }
      });
      modalInstance.result.then(
        function (document) {
          if (document && document != null) {
            Notification.success({
              message: "Document added successfully !",
              templateUrl: "NotificationSuccessTemplate.html",
              scope: $rootScope,
              delay: 5000
            });
            $scope.initToolDownloadList($scope.scope, 100);
          }
        });
    };

    $scope.editDocument = function (document) {
      $scope.actionError = null;
      var modalInstance = $modal.open({
        templateUrl: 'views/documentation/edit-document.html',
        controller: 'CreateOrEditDocumentCtrl',
        windowClass: 'documentation-upload-modal',
        backdrop: 'static',
        keyboard: false,
        backdropClick: false,
        resolve: {
          totalNumber: function () {
            return $scope.docs.length + 1;
          },
          document: function () {
            return angular.copy(document);
          }
        }
      });
      modalInstance.result.then(
        function (document) {
          if (document && document != null) {
            Notification.success({
              message: "Document saved successfully !",
              templateUrl: "NotificationSuccessTemplate.html",
              scope: $rootScope,
              delay: 5000
            });
            $scope.initToolDownloadList($scope.scope, 100);
          }
        });
    };


    $scope.deleteDocument = function (document) {

      $scope.actionError = null;
      var modalInstance = $modal.open({
        templateUrl: 'views/documentation/confirm-delete.html',
        controller: 'ConfirmDialogCtrl',
        size: 'md',
        backdrop: 'static',
        keyboard: false
      });
      modalInstance.result.then(
        function (result) {
          if (result) {
            DocumentationManager.deleteDocument(document.id).then(function (result) {
              Notification.success({
                message: "Document deleted successfully !",
                templateUrl: "NotificationSuccessTemplate.html",
                scope: $rootScope,
                delay: 5000
              });
              $scope.initToolDownloadList($scope.scope, 100);
            }, function (error) {
              $scope.actionError = "Sorry, Cannot delete the document. Please try again. \n DEBUG:" + error;
            });
          }
        });
    };


    $scope.publishDocument = function (document) {

      $scope.actionError = null;
      var modalInstance = $modal.open({
        templateUrl: 'views/documentation/confirm-publish.html',
        controller: 'ConfirmDialogCtrl',
        size: 'md',
        backdrop: 'static',
        keyboard: false
      });
      modalInstance.result.then(
        function (result) {
          if (result) {
            DocumentationManager.publishDocument(document.id).then(function (result) {
              Notification.success({
                message: "Document published successfully !",
                templateUrl: "NotificationSuccessTemplate.html",
                scope: $rootScope,
                delay: 5000
              });
              $scope.initToolDownloadList($scope.scope, 100);
            }, function (error) {
              $scope.actionError = "Sorry, Cannot delete the document. Please try again. \n DEBUG:" + error;
            });
          }
        });
    };


  });

angular.module('doc')
  .controller('ApiDocsCtrl', function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, $window, StorageService) {
    $scope.data = [];
    $scope.loading = false;
    $scope.error = null;
    $scope.scrollbarWidth = $rootScope.getScrollbarWidth();

    $scope.apiLink = function () {
      return $rootScope.apiLink;
    };
  });


angular.module('doc')
  .controller('InstallationGuideCtrl', function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, DocumentationManager, StorageService, $modal,Notification) {
    $scope.docs = [];
    $scope.loading = false;
    $scope.error = null;
    $scope.scope = null;
    $scope.loading = false;
    $scope.scope = null;
    $scope.type = "INSTALLATION";


    $scope.initInstallationGuideList = function (scope, wait) {
      $scope.loading = true;
      $timeout(function () {
        if($rootScope.domain != null) {
          if (scope === null || scope === undefined) {
            scope = StorageService.get('DOC_MANAGE_SELECTED_SCOPE_KEY');
            scope = scope && scope != null ? scope : 'GLOBAL';
          }
          $scope.scope = scope;
          DocumentationManager.getDocuments($rootScope.domain.domain, scope, $scope.type).then(function (result) {
            $scope.error = null;
            $scope.docs = result;
            $scope.loading = false;
          }, function (error) {
            $scope.loading = false;
            $scope.error = "Sorry, failed to load the files";
            $scope.data = [];
          });
        }
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


    $scope.$on('event:doc:scopeChangedEvent', function (scope) {
      $scope.initInstallationGuideList(scope, 500);
    });


    $scope.initInstallationGuideList(null, 3000);


    $scope.addDocument = function () {
      $scope.actionError = null;
      var modalInstance = $modal.open({
        templateUrl: 'views/documentation/edit-document.html',
        controller: 'CreateOrEditDocumentCtrl',
        windowClass: 'documentation-upload-modal',
        backdrop: 'static',
        keyboard: false,
        backdropClick: false,
        resolve: {
          totalNumber: function () {
            return $scope.docs.length + 1;
          },
          document: function () {
            var document = {};
            document.position = $scope.docs.length + 1;
            document.type = $scope.type;
            document.scope = $scope.scope;
            document.domain = $rootScope.domain.domain;
            return document;
          }
        }
      });
      modalInstance.result.then(
        function (document) {
          if (document && document != null) {
            Notification.success({
              message: "Document added successfully !",
              templateUrl: "NotificationSuccessTemplate.html",
              scope: $rootScope,
              delay: 5000
            });
            $scope.initInstallationGuideList($scope.scope, 100);
          }
        });
    };

    $scope.editDocument = function (document) {
      $scope.actionError = null;
      var modalInstance = $modal.open({
        templateUrl: 'views/documentation/edit-document.html',
        controller: 'CreateOrEditDocumentCtrl',
        windowClass: 'documentation-upload-modal',
        backdrop: 'static',
        keyboard: false,
        backdropClick: false,
        resolve: {
          totalNumber: function () {
            return $scope.docs.length + 1;
          },
          document: function () {
            return angular.copy(document);
          }
        }
      });
      modalInstance.result.then(
        function (document) {
          if (document && document != null) {
            Notification.success({
              message: "Document saved successfully !",
              templateUrl: "NotificationSuccessTemplate.html",
              scope: $rootScope,
              delay: 5000
            });
            $scope.initInstallationGuideList($scope.scope, 100);
          }
        });
    };


    $scope.deleteDocument = function (document) {

      $scope.actionError = null;
      var modalInstance = $modal.open({
        templateUrl: 'views/documentation/confirm-delete.html',
        controller: 'ConfirmDialogCtrl',
        size: 'md',
        backdrop: 'static',
        keyboard: false
      });
      modalInstance.result.then(
        function (result) {
          if (result) {
            DocumentationManager.deleteDocument(document.id).then(function (result) {
              Notification.success({
                message: "Document deleted successfully !",
                templateUrl: "NotificationSuccessTemplate.html",
                scope: $rootScope,
                delay: 5000
              });
              $scope.initInstallationGuideList($scope.scope, 100);
            }, function (error) {
              $scope.actionError = "Sorry, Cannot delete the document. Please try again. \n DEBUG:" + error;
            });
          }
        });
    };


    $scope.publishDocument = function (document) {

      $scope.actionError = null;
      var modalInstance = $modal.open({
        templateUrl: 'views/documentation/confirm-publish.html',
        controller: 'ConfirmDialogCtrl',
        size: 'md',
        backdrop: 'static',
        keyboard: false
      });
      modalInstance.result.then(
        function (result) {
          if (result) {
            DocumentationManager.publishDocument(document.id).then(function (result) {
              Notification.success({
                message: "Document published successfully !",
                templateUrl: "NotificationSuccessTemplate.html",
                scope: $rootScope,
                delay: 5000
              });
              $scope.initInstallationGuideList($scope.scope, 100);
            }, function (error) {
              $scope.actionError = "Sorry, Cannot public the document. Please try again. \n DEBUG:" + error;
            });
          }
        });
    };


  });


angular.module('doc')
  .controller('TestCaseDocumentationCtrl', function ($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, DocumentationManager, ngTreetableParams, StorageService,Notification) {
    $scope.context = null;
    $scope.data = null;
    $scope.loading = false;
    $scope.scrollbarWidth = $rootScope.getScrollbarWidth();
    $scope.error = null;
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
          DocumentationManager.getTestCaseDocument($rootScope.domain.domain, scope).then(function (data) {
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
