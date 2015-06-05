/**
 * Created by haffo on 10/20/14.
 */


angular.module('soap').factory('SoapValidationReportGenerator', ['$http', '$q', function ($http, $q) {
    return function (xmlReport, format) {
        var delay = $q.defer();
        $http({
            url: 'api/soap/report/generate/' + format,
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
}]);


angular.module('soap').factory('SoapValidationReportDownloader', ['$http', '$q', function ($http, $q) {
    return {
        downloadAs: function (xmlReport, format) {
            var form = document.createElement("form");
            form.action = "api/soap/report/download/" + format;
            form.method = "POST";
            form.target = "_target";
            var input = document.createElement("textarea");
            input.name = "xmlReport";
            input.value = xmlReport;
            form.appendChild(input);
            form.style.display = 'none';
            document.body.appendChild(form);
            form.submit();

        }
    };
}]);

