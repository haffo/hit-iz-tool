'use strict';

angular.module('account').directive('checkEmail', [ '$resource',
    function ($resource) {
        return {
            restrict: 'AC',
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                var Email = $resource('api/sooa/emails/:email', {email: '@email'});

                var EMAIL_REGEXP = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;

                element.on('keyup', function() {
                    if ( element.val().length !== 0 && EMAIL_REGEXP.test(element.val()) ) {
                        var emailToCheck = new Email({email:element.val()});
                        emailToCheck.$get(function() {
                            scope.emailUnique  = ((emailToCheck.text === 'emailNotFound') ? 'valid' : undefined);
                            scope.emailValid = (EMAIL_REGEXP.test(element.val()) ? 'valid' : undefined);
                            if(scope.emailUnique && scope.emailValid) {
                                ctrl.$setValidity('email', true);
                            } else {
                                ctrl.$setValidity('email', false);
                            }

                        }, function() {
//                            console.log('FAILURE to check email address');
                        });
                    }
                    else {
                        scope.emailUnique  = undefined;
                        scope.emailValid = undefined;
                        ctrl.$setValidity('email', false);
                    }
                });
            }
        };
    }
]);

'use strict';

//This directive is used to make sure both passwords match
angular.module('account').directive('checkEmployer', [
    function () {
        return {
            require: 'ngModel',
            link: function (scope, elem, attrs, ctrl) {
                var employer = '#' + attrs.checkEmployer;
                elem.add(employer).on('keyup', function () {
                    scope.$apply(function () {
//                        console.log('Pass1=', elem.val(), ' Pass2=', $(firstPassword).val());
                        var v = elem.val()===$(firstPassword).val();
                        ctrl.$setValidity('noMatch', v);
                    });
                });
            }
        };
    }
]);

'use strict';

//This directive is used to make sure both passwords match
angular.module('account').directive('checkPassword', [
    function () {
        return {
            require: 'ngModel',
            link: function (scope, elem, attrs, ctrl) {
                var firstPassword = '#' + attrs.checkPassword;
                elem.add(firstPassword).on('keyup', function () {
                    scope.$apply(function () {
//                        console.log('Pass1=', elem.val(), ' Pass2=', $(firstPassword).val());
                        var v = elem.val()===$(firstPassword).val();
                        ctrl.$setValidity('noMatch', v);
                    });
                });
            }
        };
    }
]);

'use strict';

angular.module('account').directive('checkPhone', [
    function () {
        return {
            restrict: 'AC',
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                var NUMBER_REGEXP = /[0-9]*/;
                element.on('keyup', function() {
                    if ( element.val() &&  element.val() != null && element.val() != "") {
                        scope.phoneIsNumber  =  (NUMBER_REGEXP.test(element.val()))   && element.val() > 0 ? 'valid' : undefined;
                        scope.phoneValidLength  = element.val().length >= 7 ? 'valid' : undefined;
                        if(scope.phoneIsNumber && scope.phoneValidLength ) {
                            ctrl.$setValidity('phone', true);
                        } else {
                            ctrl.$setValidity('phone', false);
                        }
                    }
                    else {
                        scope.phoneIsNumber = undefined;
                        scope.phoneValidLength = undefined;
                        ctrl.$setValidity('phone', true);
                    }
                });
            }
        };
    }
]);


'use strict';

angular.module('account').directive('checkPoaDate', [
    function () {
        return {
            replace: true,
            link: function (scope, elem, attrs, ctrl) {
                var startElem = elem.find('#inputStartDate');
                var endElem = elem.find('#inputEndDate');

                var ctrlStart = startElem.inheritedData().$ngModelController;
                var ctrlEnd = endElem.inheritedData().$ngModelController;

                var checkDates = function() {
                    var sDate = new Date(startElem.val());
                    var eDate = new Date(endElem.val());
                    if ( sDate < eDate ) {
                        //console.log("Good!");
                        ctrlStart.$setValidity('datesOK', true);
                        ctrlEnd.$setValidity('datesOK', true);
                    }
                    else {
                        //console.log(":(");
                        ctrlStart.$setValidity('datesOK', false);
                        ctrlEnd.$setValidity('datesOK', false);
                    }
                };

                startElem.on('change', checkDates);
                endElem.on('change', checkDates);
            }
        };
    }
]);

'use strict';

//This directive is used to make sure the start hour of a timerange is < of the end hour
angular.module('account').directive('checkTimerange', [
    function () {
        return {
            replace: true,
            link: function (scope, elem, attrs, ctrl) {
                //elem is a div element containing all the select input
                //each one of them has a class for easy selection
                var myElem = elem.children();
                var sh = myElem.find('.shour');
                var sm = myElem.find('.sminute');
                var eh = myElem.find('.ehour');
                var em = myElem.find('.eminute');

                var ctrlSH, ctrlSM, ctrlEH, ctrlEM;
                ctrlSH = sh.inheritedData().$ngModelController;
                ctrlSM = sm.inheritedData().$ngModelController;
                ctrlEH = eh.inheritedData().$ngModelController;
                ctrlEM = em.inheritedData().$ngModelController;

                var newnew = true;

                var checkTimeRange = function() {
                    if ( newnew ) {
                        //We only do that once to set the $pristine field to false
                        //Because if $pristine==true, and $valid=false, the visual feedback
                        //are not displayed
                        ctrlSH.$setViewValue(ctrlSH.$modelValue);
                        ctrlSM.$setViewValue(ctrlSM.$modelValue);
                        ctrlEH.$setViewValue(ctrlEH.$modelValue);
                        ctrlEM.$setViewValue(ctrlEM.$modelValue);
                        newnew = false;
                    }
                    //Getting a date object
                    var tmpDate = new Date();
                    //init the start time with the dummy date
                    var startTime = angular.copy(tmpDate);
                    //init the end time with the same dummy date
                    var endTime =  angular.copy(tmpDate);

                    startTime.setHours(sh.val());
                    startTime.setMinutes(sm.val());
                    endTime.setHours(eh.val());
                    endTime.setMinutes(em.val());

                    if ( startTime < endTime ) {
                        //console.log("Excellent!");
                        ctrlSH.$setValidity('poaOK', true);
                        ctrlSM.$setValidity('poaOK', true);
                        ctrlEH.$setValidity('poaOK', true);
                        ctrlEM.$setValidity('poaOK', true);
                    }
                    else {
                        //console.log("Bad... :(");
                        ctrlSH.$setValidity('poaOK', false);
                        ctrlSM.$setValidity('poaOK', false);
                        ctrlEH.$setValidity('poaOK', false);
                        ctrlEM.$setValidity('poaOK', false);
                    }
                };

                sh.on('change', checkTimeRange);
                sm.on('change', checkTimeRange);
                eh.on('change', checkTimeRange);
                em.on('change', checkTimeRange);
            }
        };
    }
]);


'use strict';

angular.module('account').directive('checkUsername', [ '$resource',
    function ($resource) {
        return {
            restrict: 'AC',
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                var Username = $resource('api/sooa/usernames/:username', {username: '@username'});

                element.on('keyup', function() {
                    if ( element.val().length >= 4 ) {
                        var usernameToCheck = new Username({username:element.val()});
                        //var delay = $q.defer();
                        usernameToCheck.$get(function() {
                            scope.usernameValidLength  = (element.val() && element.val().length >= 4 && element.val().length <= 20 ? 'valid' : undefined);
                            scope.usernameUnique  = ((usernameToCheck.text === 'usernameNotFound') ? 'valid' : undefined);

                            if(scope.usernameValidLength && scope.usernameUnique ) {
                                ctrl.$setValidity('username', true);
                            } else {
                                ctrl.$setValidity('username', false);
                            }

                        }, function() {
                            //console.log("FAILURE", usernameToCheck);
                        });
                    }
                    else {
                        scope.usernameValidLength = undefined;
                        scope.usernameUnique = undefined;
                        ctrl.$setValidity('username', false);
                    }
                });
            }
        };
    }
]);


'use strict';

//This directive is used to check password to make sure they meet the minimum requirements
angular.module('account').directive('passwordValidate', [
    function () {
        return {
            require: 'ngModel',
            link: function(scope, elm, attrs, ctrl) {
                ctrl.$parsers.unshift(function(viewValue) {

                    scope.pwdValidLength = (viewValue && viewValue.length >= 7 ? 'valid' : undefined);
                    scope.pwdHasLowerCaseLetter = (viewValue && /[a-z]/.test(viewValue)) ? 'valid' : undefined;
                    scope.pwdHasUpperCaseLetter = (viewValue && /[A-Z]/.test(viewValue)) ? 'valid' : undefined;
                    scope.pwdHasNumber = (viewValue && /\d/.test(viewValue)) ? 'valid' : undefined;

                    if(scope.pwdValidLength && scope.pwdHasLowerCaseLetter && scope.pwdHasUpperCaseLetter && scope.pwdHasNumber) {
                        ctrl.$setValidity('pwd', true);
                        return viewValue;
                    } else {
                        ctrl.$setValidity('pwd', false);
                        return undefined;
                    }
                });
            }
        };
    }
]);
