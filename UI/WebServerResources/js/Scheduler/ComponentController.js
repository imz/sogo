/* -*- Mode: javascript; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

(function() {
  'use strict';

  /**
   * @ngInject
   */
  ComponentController.$inject = ['$rootScope', '$mdDialog', 'Calendar', 'AddressBook', 'Alarm', 'stateComponent'];
  function ComponentController($rootScope, $mdDialog, Calendar, AddressBook, Alarm, stateComponent) {
    var vm = this, component;

    vm.component = stateComponent;
    vm.close = close;
    vm.cardFilter = cardFilter;
    vm.edit = edit;
    vm.editAllOccurrences = editAllOccurrences;
    vm.reply = reply;
    vm.replyAllOccurrences = replyAllOccurrences;
    vm.deleteOccurrence = deleteOccurrence;
    vm.deleteAllOccurrences = deleteAllOccurrences;
    vm.toggleRawSource = toggleRawSource;

    // Load all attributes of component
    if (angular.isUndefined(vm.component.$futureComponentData)) {
      component = Calendar.$get(vm.component.pid).$getComponent(vm.component.id, vm.component.occurrenceId);
      component.$futureComponentData.then(function() {
        vm.component = component;
        vm.organizer = [vm.component.organizer];
      });
    }

    function close() {
      $mdDialog.hide();
    }

    // Autocomplete cards for attendees
    function cardFilter($query) {
      AddressBook.$filterAll($query);
      return AddressBook.$cards;
    }

    function edit() {
      var type = (vm.component.component == 'vevent')? 'Appointment':'Task';
      $mdDialog.hide().then(function() {
        // UI/Templates/SchedulerUI/UIxAppointmentEditorTemplate.wox or
        // UI/Templates/SchedulerUI/UIxTaskEditorTemplate.wox
        var templateUrl = 'UIx' + type + 'EditorTemplate';
        $mdDialog.show({
          parent: angular.element(document.body),
          clickOutsideToClose: true,
          escapeToClose: true,
          templateUrl: templateUrl,
          controller: 'ComponentEditorController',
          controllerAs: 'editor',
          locals: {
            stateComponent: vm.component
          }
        });
      });
    }

    function editAllOccurrences() {
      component = Calendar.$get(vm.component.pid).$getComponent(vm.component.id);
      component.$futureComponentData.then(function() {
        vm.component = component;
        edit();
      });
    }

    function reply(component) {
      var c = component || vm.component;

      c.$reply().then(function() {
        $rootScope.$emit('calendars:list');
        $mdDialog.hide();
        Alarm.getAlarms();
      });
    }

    function replyAllOccurrences() {
      // Retrieve master event
      component = Calendar.$get(vm.component.pid).$getComponent(vm.component.id);
      component.$futureComponentData.then(function() {
        // Propagate the participant status and alarm to the master event
        component.reply = vm.component.reply;
        component.delegatedTo = vm.component.delegatedTo;
        component.$hasAlarm = vm.component.$hasAlarm;
        component.alarm = vm.component.alarm;
        // Send reply to the server
        reply(component);
      });
    }

    function deleteOccurrence() {
      vm.component.remove(true).then(function() {
        $rootScope.$emit('calendars:list');
        $mdDialog.hide();
      });
    }

    function deleteAllOccurrences() {
      vm.component.remove().then(function() {
        $rootScope.$emit('calendars:list');
        $mdDialog.hide();
      });
    }

    function toggleRawSource($event) {
      Calendar.$$resource.post(vm.component.pid + '/' + vm.component.id, "raw").then(function(data) {
        $mdDialog.hide();
        $mdDialog.show({
          parent: angular.element(document.body),
          targetEvent: $event,
          clickOutsideToClose: true,
          escapeToClose: true,
          template: [
            '<md-dialog flex="80" flex-xs="100" aria-label="' + l('View Raw Source') + '">',
            '  <md-dialog-content class="md-dialog-content">',
            '    <pre>',
            data,
            '    </pre>',
            '  </md-dialog-content>',
            '  <md-dialog-actions>',
            '    <md-button ng-click="close()">' + l('Close') + '</md-button>',
            '  </md-dialog-actions>',
            '</md-dialog>'
          ].join(''),
          controller: ComponentRawSourceDialogController
        });

        /**
         * @ngInject
         */
        ComponentRawSourceDialogController.$inject = ['scope', '$mdDialog'];
        function ComponentRawSourceDialogController(scope, $mdDialog) {
          scope.close = function() {
            $mdDialog.hide();
          };
        }
      });
    }
  }

  /**
   * @ngInject
   */
  ComponentEditorController.$inject = ['$rootScope', '$scope', '$log', '$timeout', '$mdDialog', 'User', 'Calendar', 'Component', 'AddressBook', 'Card', 'Alarm', 'stateComponent'];
  function ComponentEditorController($rootScope, $scope, $log, $timeout, $mdDialog, User, Calendar, Component, AddressBook, Card, Alarm, stateComponent) {
    var vm = this, component, oldStartDate, oldEndDate, oldDueDate;

    vm.service = Calendar;
    vm.component = stateComponent;
    vm.categories = {};
    vm.showRecurrenceEditor = vm.component.$hasCustomRepeat;
    vm.toggleRecurrenceEditor = toggleRecurrenceEditor;
    vm.showAttendeesEditor = angular.isDefined(vm.component.attendees);
    vm.toggleAttendeesEditor = toggleAttendeesEditor;
    //vm.searchText = null;
    vm.cardFilter = cardFilter;
    vm.addAttendee = addAttendee;
    vm.addAttachUrl = addAttachUrl;
    vm.cancel = cancel;
    vm.save = save;
    vm.attendeesEditor = {
      days: getDays(),
      hours: getHours()
    };
    vm.addStartDate = addStartDate;
    vm.addDueDate = addDueDate;

    // Synchronize start and end dates
    vm.updateStartTime = updateStartTime;
    vm.adjustStartTime = adjustStartTime;
    vm.updateEndTime = updateEndTime;
    vm.adjustEndTime = adjustEndTime;
    vm.updateDueTime = updateDueTime;
    vm.adjustDueTime = adjustDueTime;

    if (vm.component.start)
      oldStartDate = new Date(vm.component.start.getTime());
    if (vm.component.end)
      oldEndDate = new Date(vm.component.end.getTime());
    if (vm.component.due)
      oldDueDate = new Date(vm.component.due.getTime());

    function addAttachUrl() {
      var i = vm.component.addAttachUrl('');
      focus('attachUrl_' + i);
    }

    function toggleRecurrenceEditor() {
      vm.showRecurrenceEditor = !vm.showRecurrenceEditor;
      vm.component.$hasCustomRepeat = vm.showRecurrenceEditor;
    }

    function toggleAttendeesEditor() {
      vm.showAttendeesEditor = !vm.showAttendeesEditor;
    }

    // Autocomplete cards for attendees
    function cardFilter($query) {
      AddressBook.$filterAll($query);
      return AddressBook.$cards;
    }

    function addAttendee(card) {
      if (angular.isString(card)) {
        // User pressed "Enter" in search field, adding a non-matching card
        if (card.isValidEmail()) {
          vm.component.addAttendee(new Card({ emails: [{ value: card }] }));
          vm.searchText = '';
        }
      }
      else {
        vm.component.addAttendee(card);
      }
    }

    function save(form) {
      if (form.$valid) {
        vm.component.$save()
          .then(function(data) {
            $rootScope.$emit('calendars:list');
            $mdDialog.hide();
            Alarm.getAlarms();
          }, function(data, status) {
            $log.debug('failed');
          });
      }
    }

    function cancel() {
      vm.component.$reset();
      if (vm.component.isNew) {
        // Cancelling the creation of a component
        vm.component = null;
      }
      $mdDialog.cancel();
    }

    function getDays() {
      var days = [];

      if (vm.component.start && vm.component.end)
        days = vm.component.start.daysUpTo(vm.component.end);

      return _.map(days, function(date) {
        return { stringWithSeparator: date.stringWithSeparator(),
                 getDayString: date.getDayString() };
      });
    }

    function getHours() {
      var hours = [];
      for (var i = 0; i <= 23; i++) {
        //hours.push(Component.timeFormat.formatTime(i, 0));
        hours.push(i.toString());
      }
      return hours;
    }

    function addStartDate() {
      vm.component.$addStartDate();
      oldStartDate = new Date(vm.component.start.getTime());
    }

    function addDueDate() {
      vm.component.$addDueDate();
      oldDueDate = new Date(vm.component.due.getTime());
    }

    function updateStartTime() {
      // When using the datepicker, the time is reset to 00:00; restore it
      vm.component.start.addMinutes(oldStartDate.getHours() * 60 + oldStartDate.getMinutes());
      adjustStartTime();
    }

    function adjustStartTime() {
      // Preserve the delta between the start and end dates
      var delta;
      delta = oldStartDate.valueOf() - vm.component.start.valueOf();
      if (delta !== 0) {
        oldStartDate = new Date(vm.component.start.getTime());
        if (vm.component.type === 'appointment') {
          vm.component.end = new Date(vm.component.start.getTime());
          vm.component.end.addMinutes(vm.component.delta);
          oldEndDate = new Date(vm.component.end.getTime());
        }
        updateFreeBusy();
      }
    }

    function updateEndTime() {
      // When using the datepicker, the time is reset to 00:00; restore it
      vm.component.end.addMinutes(oldEndDate.getHours() * 60 + oldEndDate.getMinutes());
      adjustEndTime();
    }

    function adjustEndTime() {
      // The end date must be after the start date
      var delta = oldEndDate.valueOf() - vm.component.end.valueOf();
      if (delta !== 0) {
          delta = vm.component.start.minutesTo(vm.component.end);
        if (delta < 0)
          vm.component.end = new Date(oldEndDate.getTime());
        else {
          vm.component.delta = delta;
          oldEndDate = new Date(vm.component.end.getTime());
        }
        updateFreeBusy();
      }
    }

    function updateDueTime() {
      // When using the datepicker, the time is reset to 00:00; restore it
      vm.component.due.addMinutes(oldDueDate.getHours() * 60 + oldDueDate.getMinutes());
      adjustDueTime();
    }

    function adjustDueTime() {
      oldDueDate = new Date(vm.component.due.getTime());
    }

    function updateFreeBusy() {
      vm.attendeesEditor.days = getDays();
      vm.component.updateFreeBusy();
    }
  }

  angular
    .module('SOGo.SchedulerUI')
    .controller('ComponentController', ComponentController)
    .controller('ComponentEditorController', ComponentEditorController);
})();
