/**
 * Created by haffo on 3/28/14.
 */

angular.module( 'my.resource', [ 'ngResource' ] ).factory( 'Resource', [ '$resource', function( $resource ) {
   return function( url, params, methods ) {
         var defaults = {
              update: { method: 'put', isArray: false },
              create: { method: 'post' }
         };

     methods = angular.extend( defaults, methods );

     var resource = $resource( url, params, methods );

     resource.prototype.$save = function(successHandler,errorHandler) {
           if ( !this.id ) {
                return this.$create(successHandler,errorHandler);
              }
          else {
               return this.$update(successHandler,errorHandler);
              }
       };

   return resource;
  };
}]);