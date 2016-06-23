/* -*- Mode: javascript; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

(function() {
  /* jshint validthis: true, newcap: false */
  'use strict';

  /**
   * sgAvatarImage - An avatar directive that returns un img element with either a local URL (if sg-src is specified)
   * or a Gravatar URL built from the Gravatar factory (using sg-email).
   * Based on http://blog.lingohub.com/2014/08/better-ux-with-angularjs-directives/.
   * @memberof SOGo.Common
   * @example:
     <sg-avatar-image sg-email="test@email.com" size="50"></sg-avatar-image>
  */
  function sgAvatarImage() {
    return {
      restrict: 'AE',
      scope: {},
      bindToController: {
        size: '@',
        email: '=sgEmail',
        src: '=sgSrc'
      },
      template: [
        '<md-icon>person</md-icon>',                     // the generic icon
        '<img class="ng-hide" ng-src="{{vm.url}}" />'    // the gravatar or local image
      ].join(''),
      link: link,
      controller: 'sgAvatarImageController',
      controllerAs: 'vm'
    };
  }

  function link(scope, element, attrs, controller) {
    var imgElement = element.find('img'),
        mdIconElement = element.find('md-icon');

    if (attrs.size) {
      imgElement.attr('width', attrs.size);
      imgElement.attr('height', attrs.size);
      mdIconElement.css('font-size', attrs.size + 'px');
    }

    controller.img = imgElement;
    controller.genericImg = mdIconElement;
  }

  /**
   * @ngInject
   */
  sgAvatarImageController.$inject = ['$scope', '$element', '$http', '$q', 'Preferences', 'Gravatar'];
  function sgAvatarImageController($scope, $element, $http, $q, Preferences, Gravatar) {
    var vm;

    vm = this;

    // Wait on user's defaults
    Preferences.ready().then(function() {
      $scope.$watch(function() { return vm.email; }, function(email, old) {
        if (email && vm.urlEmail != email) {
          // Email has changed or doesn't match the current URL (this happens when using md-virtual-repeat)
          showGenericAvatar();
          if (Preferences.defaults.SOGoGravatarEnabled)
            getGravatar(email);
        }
        else if (!email)
          showGenericAvatar();
      });
    });

    // If sg-src is defined, watch the expression for the URL of a local image
    if ('sg-src' in $element[0].attributes) {
      $scope.$watch(function() { return vm.src; }, function(src) {
        if (src) {
          // Set image URL and save the associated email address
          vm.url = src;
          vm.urlEmail = '' + vm.email;
          hideGenericAvatar();
        }
      });
    }

    function getGravatar(email) {
      var url = Gravatar(email, vm.size, Preferences.defaults.SOGoAlternateAvatar);
      $http({
        method: 'GET',
        url: url,
        cache: true,
        headers: { Accept: 'image/*' }
      }).then(function successCallback() {
        if (!vm.url) {
          // Set image URL and save the associated email address
          vm.url = url;
          vm.urlEmail = email;
          hideGenericAvatar();
        }
      }, function errorCallback() {
        showGenericAvatar();
      });
    }

    function showGenericAvatar() {
      vm.url = null;
      vm.urlEmail = null;
      vm.img.addClass('ng-hide');
      vm.genericImg.removeClass('ng-hide');
    }

    function hideGenericAvatar() {
      vm.genericImg.addClass('ng-hide');
      vm.img.removeClass('ng-hide');
    }
  }

  angular
    .module('SOGo.Common')
    .directive('sgAvatarImage', sgAvatarImage)
    .controller('sgAvatarImageController', sgAvatarImageController);
})();
