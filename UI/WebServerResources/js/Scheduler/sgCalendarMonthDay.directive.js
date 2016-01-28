/* -*- Mode: javascript; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

(function() {
  'use strict';

  /*
   * sgCalendarMonthDay - Build list of blocks for a specific day in a month
   * @memberof SOGo.Common
   * @restrict element
   * @param {object} sgBlocks - the events blocks definitions for the current view
   * @param {string} sgDay - the day of the events to display
   * @ngInject
   * @example:

   <sg-calendar-monh-day
      sg-blocks="calendar.blocks"
      sg-day="20150408"
       sg-click="open({ event: clickEvent, component: clickComponent })"/>
  */
  function sgCalendarMonthDay() {
    return {
      restrict: 'E',
      scope: {
        blocks: '=sgBlocks',
        day: '@sgDay',
        clickBlock: '&sgClick'
      },
      template: [
        '<sg-calendar-month-event',
        '  class="sg-draggable-calendar-block"',
        '  ng-repeat="block in blocks[day]"',
        '  sg-block="block"',
        '  sg-click="clickBlock({event: clickEvent, component: clickComponent})"/>'
      ].join('')
    };
  }

  angular
    .module('SOGo.SchedulerUI')
    .directive('sgCalendarMonthDay', sgCalendarMonthDay);
})();
