
angular.module('doc').directive('apiDocs', [
  function () {
    return {
      restrict: 'A',
      templateUrl: 'ApiDocs.html',
      replace: false,
      controller: 'ApiDocsCtrl'
    };
  }
]);


angular.module('doc').directive('testcaseDoc', [
  function () {
    return {
      restrict: 'A',
      templateUrl: 'TestCaseDoc.html',
      replace: false,
      controller: 'TestCaseDocumentationCtrl'
    };
  }
]);


angular.module('doc').directive('knownIssues', [
  function () {
    return {
      restrict: 'A',
      templateUrl: 'KnownIssues.html',
      replace: false,
      controller: 'KnownIssuesCtrl'
    };
  }
]);

angular.module('doc').directive('releaseNotes', [
  function () {
    return {
      restrict: 'A',
      templateUrl: 'ReleaseNotes.html',
      replace: false,
      controller: 'ReleaseNotesCtrl'
    };
  }
]);


angular.module('doc').directive('userDocs', [
  function () {
    return {
      restrict: 'A',
      templateUrl: 'UserDocs.html',
      replace: false,
      controller: 'UserDocsCtrl'
    };
  }
]);


// angular.module('doc').directive('resourceDoc', [
//   function () {
//     return {
//       restrict: 'A',
//       scope: {
//         type: '@',
//         name: '@'
//       },
//       templateUrl: 'ResourceDoc.html',
//       replace: false,
//       controller: 'ResourceDocsCtrl'
//     };
//   }
// ]);

angular.module('doc').directive('installationGuide', [
  function () {
    return {
      restrict: 'A',
      templateUrl: 'InstallationGuide.html',
      replace: false,
      controller: 'InstallationGuideCtrl'
    };
  }
]);


angular.module('doc').directive('toolDownloads', [
  function () {
    return {
      restrict: 'A',
      templateUrl: 'ToolDownloadList.html',
      replace: false,
      controller: 'ToolDownloadListCtrl'
    };
  }
]);
