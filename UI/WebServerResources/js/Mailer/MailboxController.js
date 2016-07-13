/* -*- Mode: javascript; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

(function() {
  'use strict';

  /**
   * @ngInject
   */
  MailboxController.$inject = ['$window', '$timeout', '$q', '$state', '$mdDialog', 'stateAccounts', 'stateAccount', 'stateMailbox', 'encodeUriFilter', 'sgFocus', 'Dialog', 'Account', 'Mailbox'];
  function MailboxController($window, $timeout, $q, $state, $mdDialog, stateAccounts, stateAccount, stateMailbox, encodeUriFilter, focus, Dialog, Account, Mailbox) {
    var vm = this, messageDialog = null;

    // Expose controller
    $window.$mailboxController = vm;

    stateMailbox.selectFolder();

    vm.service = Mailbox;
    vm.accounts = stateAccounts;
    vm.account = stateAccount;
    vm.selectedFolder = stateMailbox;
    vm.selectMessage = selectMessage;
    vm.toggleMessageSelection = toggleMessageSelection;
    vm.sort = sort;
    vm.sortedBy = sortedBy;
    vm.searchMode = searchMode;
    vm.cancelSearch = cancelSearch;
    vm.newMessage = newMessage;
    vm.mode = { search: false, multiple: 0 };
    vm.confirmDeleteSelectedMessages = confirmDeleteSelectedMessages;
    vm.markOrUnMarkMessagesAsJunk = markOrUnMarkMessagesAsJunk;
    vm.copySelectedMessages = copySelectedMessages;
    vm.moveSelectedMessages = moveSelectedMessages;
    vm.markSelectedMessagesAsFlagged = markSelectedMessagesAsFlagged;
    vm.markSelectedMessagesAsUnread = markSelectedMessagesAsUnread;
    vm.selectAll = selectAll;
    vm.unselectMessages = unselectMessages;

    function sort(field) {
      vm.selectedFolder.$filter({ sort: field });
    }

    function sortedBy(field) {
      return Mailbox.$query.sort == field;
    }

    function searchMode() {
      vm.mode.search = true;
      focus('search');
    }

    function cancelSearch() {
      vm.mode.search = false;
      vm.selectedFolder.$filter().then(function() {
        if (vm.selectedFolder.selectedMessage) {
          $timeout(function() {
            vm.selectedFolder.$topIndex = vm.selectedFolder.uidsMap[vm.selectedFolder.selectedMessage];
          });
        }
      });
    }

    function newMessage($event) {
      var message;

      if (messageDialog === null) {
        message = vm.account.$newMessage();
        messageDialog = $mdDialog
          .show({
            parent: angular.element(document.body),
            targetEvent: $event,
            clickOutsideToClose: false,
            escapeToClose: false,
            templateUrl: 'UIxMailEditor',
            controller: 'MessageEditorController',
            controllerAs: 'editor',
            locals: {
              stateAccount: vm.account,
              stateMessage: message,
              stateRecipients: []
            }
          })
          .finally(function() {
            messageDialog = null;
          });
      }
    }

    function selectMessage(message) {
      if (Mailbox.$virtualMode)
        $state.go('mail.account.virtualMailbox.message', {mailboxId: encodeUriFilter(message.$mailbox.path), messageId: message.uid});
      else
        $state.go('mail.account.mailbox.message', {messageId: message.uid});
    }

    function toggleMessageSelection($event, message) {
      message.selected = !message.selected;
      vm.mode.multiple += message.selected? 1 : -1;
      $event.preventDefault();
      $event.stopPropagation();
    }

    /**
     * Batch operations
     */

    function _currentMailboxes() {
      if (Mailbox.$virtualMode)
        return vm.selectedFolder.$mailboxes;
      else
        return [vm.selectedFolder];
    }

    function _unselectMessage(message, index) {
      // Unselect current message and cleverly load the next message.
      // This function must not be called in virtual mode.
      var nextMessage, previousMessage, nextIndex = index;
      vm.mode.multiple = vm.selectedFolder.$selectedCount();
      if (message) {
        // Select either the next or previous message
        if (index > 0) {
          nextIndex -= 1;
          nextMessage = vm.selectedFolder.$messages[nextIndex];
        }
        if (index < vm.selectedFolder.$messages.length)
          previousMessage = vm.selectedFolder.$messages[index];
        if (nextMessage) {
          if (nextMessage.isread && previousMessage && !previousMessage.isread) {
            nextIndex = index;
            nextMessage = previousMessage;
          }
        }
        else if (previousMessage) {
          nextIndex = index;
          nextMessage = previousMessage;
        }
        if (nextMessage) {
          vm.selectedFolder.$topIndex = nextIndex;
          $state.go('mail.account.mailbox.message', { messageId: nextMessage.uid });
        }
        else {
          $state.go('mail.account.mailbox');
        }
      }
      else {
        $timeout(function() {
          console.warn('go to mailbox');
          $state.go('mail.account.mailbox');
        });
      }
    }

    function confirmDeleteSelectedMessages() {
      Dialog.confirm(l('Warning'),
                     l('Are you sure you want to delete the selected messages?'),
                     { ok: l('Delete') })
        .then(function() {
          var deleteSelectedMessage = vm.selectedFolder.hasSelectedMessage();
          var selectedMessages = vm.selectedFolder.$selectedMessages();
          if (_.size(selectedMessages) > 0)
            vm.selectedFolder.$deleteMessages(selectedMessages).then(function(index) {
              if (Mailbox.$virtualMode) {
                // When performing an advanced search, we refresh the view if the selected message
                // was deleted, but only once all promises have completed.
                if (deleteSelectedMessage)
                  $state.go('mail.account.virtualMailbox');
              }
              else {
                // In normal mode, we immediately unselect the selected message.
                _unselectMessage(deleteSelectedMessage, index);
              }
            });
        });
    }

    function markOrUnMarkMessagesAsJunk() {
      var moveSelectedMessage = vm.selectedFolder.hasSelectedMessage();
      var selectedMessages = vm.selectedFolder.$selectedMessages();
      if (_.size(selectedMessages) > 0)
        vm.selectedFolder.$markOrUnMarkMessagesAsJunk(selectedMessages).then(function() {
          var dstFolder = '/' + vm.account.id + '/folderINBOX';
          if (vm.selectedFolder.type != 'junk') {
            dstFolder = '/' + vm.account.$getMailboxByType('junk').id;
          }
          vm.selectedFolder.$moveMessages(selectedMessages, dstFolder).then(function(index) {
            if (Mailbox.$virtualMode) {
              // When performing an advanced search, we refresh the view if the selected message
              // was deleted, but only once all promises have completed.
              if (moveSelectedMessage)
                $state.go('mail.account.virtualMailbox');
            }
            else {
              // In normal mode, we immediately unselect the selected message.
              _unselectMessage(moveSelectedMessage, index);
            }
          });
        });
    }

    function copySelectedMessages(dstFolder) {
      var selectedMessages = vm.selectedFolder.$selectedMessages();
      if (_.size(selectedMessages) > 0)
        vm.selectedFolder.$copyMessages(selectedMessages, '/' + dstFolder);
    }

    function moveSelectedMessages(dstFolder) {
      var moveSelectedMessage = vm.selectedFolder.hasSelectedMessage();
      var selectedMessages = vm.selectedFolder.$selectedMessages();
      if (_.size(selectedMessages) > 0)
        vm.selectedFolder.$moveMessages(selectedMessages, '/' + dstFolder).then(function(index) {
          if (Mailbox.$virtualMode) {
            // When performing an advanced search, we refresh the view if the selected message
            // was moved, but only once all promises have completed.
            if (moveSelectedMessage)
              $state.go('mail.account.virtualMailbox');
          }
          else {
            // In normal mode, we immediately unselect the selected message.
            _unselectMessage(moveSelectedMessage, index);
          }
        });
    }

    function selectAll() {
      var count = 0;
      _.forEach(_currentMailboxes(), function(folder) {
        var i = 0, length = folder.$messages.length;
        for (; i < length; i++)
          folder.$messages[i].selected = true;
        count += length;
      });
      vm.mode.multiple = count;
    }

    function unselectMessages() {
      _.forEach(_currentMailboxes(), function(folder) {
        _.forEach(folder.$messages, function(message) {
          message.selected = false;
        });
      });
      vm.mode.multiple = 0;
    }

    function markSelectedMessagesAsFlagged() {
      var selectedMessages = vm.selectedFolder.$selectedMessages();
      if (_.size(selectedMessages) > 0)
        vm.selectedFolder.$flagMessages(selectedMessages, '\\Flagged', 'add').then(function(messages) {
          _.forEach(messages, function(message) {
            message.isflagged = true;
          });
        });
    }

    function markSelectedMessagesAsUnread() {
      var selectedMessages = vm.selectedFolder.$selectedMessages();
      if (_.size(selectedMessages) > 0)
        vm.selectedFolder.$flagMessages(selectedMessages, 'seen', 'remove').then(function(messages) {
          _.forEach(messages, function(message) {
            message.isread = false;
            message.$mailbox.unseenCount++;
          });
        });
    }

  }

  angular
    .module('material.components.virtualRepeat')
    .decorator('mdVirtualRepeatContainerDirective', mdVirtualRepeatContainerDirectiveDecorator);

  /**
   * @ngInject
   */
  mdVirtualRepeatContainerDirectiveDecorator.$inject = ['$delegate'];
  function mdVirtualRepeatContainerDirectiveDecorator($delegate) {
    $delegate[0].controller.prototype.resetScroll = function() {
      // Don't scroll to top if current virtual repeater is the messages list
      // but do update the container size
      if (this.$element.parent().attr('id') == 'messagesList')
        this.updateSize();
      else
        this.scrollTo(0);
    };
    return $delegate;
  }

  angular
    .module('SOGo.MailerUI')
    .controller('MailboxController', MailboxController);
})();

