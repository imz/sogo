/* -*- Mode: javascript; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

(function() {
  'use strict';

  /**
   * @name Message
   * @constructor
   * @param {string} accountId - the account ID
   * @param {string} mailboxPath - an array of the mailbox path components
   * @param {object} futureAddressBookData - either an object literal or a promise
   * @param {bool} lazy - do "lazy loading" so we are very quick at initializing message instances
   */
  function Message(accountId, mailbox, futureMessageData, lazy) {
    this.accountId = accountId;
    this.$mailbox = mailbox;
    this.$hasUnsafeContent = false;
    this.$loadUnsafeContent = false;
    this.editable = {to: [], cc: [], bcc: []};
    this.selected = false;

    // Data is immediately available
    if (typeof futureMessageData.then !== 'function') {
      //console.debug(JSON.stringify(futureMessageData, undefined, 2));
      if (angular.isUndefined(lazy) || !lazy) {
        angular.extend(this, futureMessageData);
        this.$formatFullAddresses();
      }
      this.uid = parseInt(futureMessageData.uid);
    }
    else {
      // The promise will be unwrapped first
      this.$unwrap(futureMessageData);
    }
  }

  /**
   * @memberof Message
   * @desc The factory we'll use to register with Angular
   * @returns the Message constructor
   */
  Message.$factory = ['$q', '$timeout', '$log', 'sgSettings', 'Gravatar', 'Resource', 'Preferences', function($q, $timeout, $log, Settings, Gravatar, Resource, Preferences) {
    angular.extend(Message, {
      $q: $q,
      $timeout: $timeout,
      $log: $log,
      $gravatar: Gravatar,
      $$resource: new Resource(Settings.activeUser('folderURL') + 'Mail', Settings.activeUser())
    });
    // Initialize tags form user's defaults
    Preferences.ready().then(function() {
      if (Preferences.defaults.SOGoMailLabelsColors) {
        Message.$tags = Preferences.defaults.SOGoMailLabelsColors;
      }
      if (Preferences.defaults.SOGoMailDisplayRemoteInlineImages &&
          Preferences.defaults.SOGoMailDisplayRemoteInlineImages == 'always') {
        Message.$displayRemoteInlineImages = true;
      }
    });

    return Message; // return constructor
  }];

  /**
   * @module SOGo.MailerUI
   * @desc Factory registration of Message in Angular module.
   */
  try {
    angular.module('SOGo.MailerUI');
  }
  catch(e) {
    angular.module('SOGo.MailerUI', ['SOGo.Common']);
  }
  angular.module('SOGo.MailerUI')
    .factory('Message', Message.$factory);

  /**
   * @function filterTags
   * @memberof Message.prototype
   * @desc Search for tags (ie., mail labels) matching some criterias
   * @param {string} search - the search string to match
   * @returns a collection of strings
   */
  Message.filterTags = function(query) {
    var re = new RegExp(query, 'i'),
        results = [];

    _.forEach(_.keys(Message.$tags), function(tag) {
      var pair = Message.$tags[tag];
      if (pair[0].search(re) != -1) {
        results.push({ name: tag, description: pair[0], color: pair[1] });
      }
    });
    return results;
  };

  /**
   * @function $absolutePath
   * @memberof Message.prototype
   * @desc Build the path of the message
   * @returns a string representing the path relative to the mail module
   */
  Message.prototype.$absolutePath = function(options) {
    if (angular.isUndefined(this.id) || options) {
      var path;
      path = _.map(this.$mailbox.path.split('/'), function(component) {
        return 'folder' + component.asCSSIdentifier();
      });
      path.splice(0, 0, this.accountId); // insert account ID
      if (options && options.asDraft && this.draftId) {
        path.push(this.draftId); // add draft ID
      }
      else {
        path.push(this.uid); // add message UID
      }

      this.id = path.join('/');
    }

    return this.id;
  };

  /**
   * @function $setUID
   * @memberof Message.prototype
   * @desc Change the UID of the message. This happens when saving a draft.
   * @param {number} uid - the new message UID
   */
  Message.prototype.$setUID = function(uid) {
    var oldUID = (this.uid || -1);

    if (oldUID != parseInt(uid)) {
      this.uid = parseInt(uid);
      if (oldUID > -1) {
        oldUID = oldUID.toString();
        if (angular.isDefined(this.$mailbox.uidsMap[oldUID])) {
          this.$mailbox.uidsMap[uid] = this.$mailbox.uidsMap[oldUID];
          delete this.$mailbox.uidsMap[oldUID];
        }
      }
      else {
        // Refresh selected folder if it's the drafts mailbox
        if (this.$mailbox.constructor.selectedFolder &&
            this.$mailbox.constructor.selectedFolder.type == 'draft') {
          this.$mailbox.constructor.selectedFolder.$filter();
        }
      }
    }
  };

  /**
   * @function $formatFullAddresses
   * @memberof Message.prototype
   * @desc Format all sender and recipients addresses with a complete description (name <email>).
   *       This function also generates a gravatar for each email address, and a short name
   */
  Message.prototype.$formatFullAddresses = function() {
    var _this = this;
    var identities = _.pluck(_this.$mailbox.$account.identities, 'email');

    // Build long representation of email addresses
    _.each(['from', 'to', 'cc', 'bcc', 'reply-to'], function(type) {
      _.each(_this[type], function(data, i) {
        if (data.name && data.name != data.email) {
          data.full = data.name + ' <' + data.email + '>';

          // If we have "Alice Foo" as name, we grab "Alice"
          if (data.name.split(' ').length)
            data.shortname = data.name.split(' ')[0].replace('\'','');
        }
        else if (data.email) {
          data.full = '<' + data.email + '>';
          data.shortname = data.email.split('@')[0];
        }

        // Generate the gravatar
        data.image = Message.$gravatar(data.email, 32);

        // If the current user is the recepient, overwrite
        // the short name with 'me'
        if (_.indexOf(identities, data.email) >= 0)
          data.shortname = l('me');
      });
    });
  };

  /**
   * @function $shortRecipients
   * @memberof Message.prototype
   * @desc Format all recipients into a very compact string
   * @returns a compacted string of all recipients
   */
  Message.prototype.$shortRecipients = function() {
    var _this = this;
    var result = [];

    // Build long representation of email addresses
    _.each(['to', 'cc', 'bcc'], function(type) {
      _.each(_this[type], function(data, i) {
        result.push(data.shortname);
      });
    });

    return result.join(', ');
  };

  /**
   * @function $shortAddress
   * @memberof Message.prototype
   * @desc Format the first address of a specific type with a short description.
   * @returns a string of the name or the email of the envelope address type
   */
  Message.prototype.$shortAddress = function(type) {
    var address = '';
    if (this[type] && this[type].length > 0) {
      address = this[type][0].name || this[type][0].email || '';
    }

    return address;
  };

  /**
   * @function allowReplyAll
   * @memberof Message.prototype
   * @desc Check if 'Reply to All' is an appropriate action on the message.
   * @returns true if the message is not a draft and has more than one recipient
   */
  Message.prototype.allowReplyAll = function() {
    var recipientsCount = 0;
    recipientsCount = _.reduce(['to', 'cc'], function(count, type) {
      if (this[type])
        return count + this[type].length;
      else
        return count;
    }, recipientsCount, this);

    return !this.isDraft && recipientsCount > 1;
  };

  /**
   * @function loadUnsafeContent
   * @memberof Message.prototype
   * @desc Mark the message to load unsafe resources when calling $content().
   */
  Message.prototype.loadUnsafeContent = function() {
    this.$loadUnsafeContent = true;
  };

  /**
   * @function $content
   * @memberof Message.prototype
   * @desc Get the message body as accepted by SCE (Angular Strict Contextual Escaping).
   * @returns the HTML representation of the body
   */
  Message.prototype.$content = function() {
    var _this = this,
        parts = [],
        _visit = function(part) {
          part.msgclass = 'msg-attachment-other';
          if (part.type == 'UIxMailPartAlternativeViewer') {
            _visit(_.find(part.content, function(alternatePart) {
              return part.preferredPart == alternatePart.contentType;
            }));
          }
          // Can be used for UIxMailPartMixedViewer, UIxMailPartMessageViewer, and UIxMailPartSignedViewer
          else if (angular.isArray(part.content)) {
            if (part.type == 'UIxMailPartSignedViewer' && part['supports-smime'] === 1) {
              // First line in a h1, others each in a p
              var formattedMessage = "<p>" + part.error.replace(/\n/, "</p><p class=\"md-caption\">");
              formattedMessage = formattedMessage.replace(/\n/g, "</p><p class=\"md-caption\">") + "</p>";
              _this.$smime = {
                validSignature: part.valid,
                message: formattedMessage
              };
            }
            _.each(part.content, function(mixedPart) {
              _visit(mixedPart);
            });
          }
          else {
            if (angular.isUndefined(part.safeContent)) {
              // Keep a copy of the original content
              part.safeContent = part.content;
              _this.$hasUnsafeContent |= (part.safeContent.indexOf(' unsafe-') > -1);
            }
            if (part.type == 'UIxMailPartHTMLViewer') {
              part.html = true;
              if (_this.$loadUnsafeContent || Message.$displayRemoteInlineImages) {
                if (angular.isUndefined(part.unsafeContent)) {
                  part.unsafeContent = document.createElement('div');
                  part.unsafeContent.innerHTML = part.safeContent;
                  angular.forEach(['src', 'data', 'classid', 'background', 'style'], function(suffix) {
                    var elements = part.unsafeContent.querySelectorAll('[unsafe-' + suffix + ']'),
                        element,
                        value,
                        i;
                    for (i = 0; i < elements.length; i++) {
                      element = angular.element(elements[i]);
                      value = element.attr('unsafe-' + suffix);
                      element.attr(suffix, value);
                      element.removeAttr('unsafe-' + suffix);
                    }
                  });
                  _this.$hasUnsafeContent = false;
                }
                part.content = part.unsafeContent.innerHTML;
              }
              else {
                part.content = part.safeContent;
              }
              parts.push(part);
            }
            else if (part.type == 'UIxMailPartICalViewer' ||
                     part.type == 'UIxMailPartImageViewer' ||
                     part.type == 'UIxMailPartLinkViewer') {

              // UIxMailPartICalViewer injects 'participants'
              if (part.participants) {
                _.each(part.participants, function(participant) {
                  participant.image = Message.$gravatar(participant.email, 32);
                });
              }

              if (part.type == 'UIxMailPartImageViewer')
                part.msgclass = 'msg-attachment-image';
              else if (part.type == 'UIxMailPartLinkViewer')
                part.msgclass = 'msg-attachment-link';

              // Trusted content that can be compiled (Angularly-speaking)
              part.compile = true;
              parts.push(part);
            }
            else {
              part.html = true;
              part.content = part.safeContent;
              parts.push(part);
            }
          }
        };
    _visit(this.parts);

    return parts;
  };

  /**
   * @function $editableContent
   * @memberof Message.prototype
   * @desc First, fetch the draft ID that corresponds to the temporary draft object on the SOGo server.
   * Secondly, fetch the editable message body along with other metadata such as the recipients.
   * @returns the HTML representation of the body
   */
  Message.prototype.$editableContent = function() {
    var _this = this;

    return Message.$$resource.fetch(this.$absolutePath(), 'edit').then(function(data) {
      angular.extend(_this, data);
      return Message.$$resource.fetch(_this.$absolutePath({asDraft: true}), 'edit').then(function(data) {
        Message.$log.debug('editable = ' + JSON.stringify(data, undefined, 2));
        angular.extend(_this.editable, data);
        return data.text;
      });
    });
  };

  /**
   * @function addTag
   * @memberof Message.prototype
   * @desc Add a mail tag on the current message.
   * @param {string} tag - the tag name
   * @returns a promise of the HTTP operation
   */
  Message.prototype.addTag = function(tag) {
    return this.$addOrRemoveTag('add', tag);
  };

  /**
   * @function removeTag
   * @memberof Message.prototype
   * @desc Remove a mail tag from the current message.
   * @param {string} tag - the tag name
   * @returns a promise of the HTTP operation
   */
  Message.prototype.removeTag = function(tag) {
    return this.$addOrRemoveTag('remove', tag);
  };

  /**
   * @function $addOrRemoveTag
   * @memberof Message.prototype
   * @desc Add or remove a mail tag on the current message.
   * @param {string} operation - the operation name to perform
   * @param {string} tag - the tag name
   * @returns a promise of the HTTP operation
   */
  Message.prototype.$addOrRemoveTag = function(operation, tag) {
    var data = {
      operation: operation,
      msgUIDs: [this.uid],
      flags: tag
    };

    if (tag)
      return Message.$$resource.post(this.$mailbox.$id(), 'addOrRemoveLabel', data);
  };

  /**
   * @function $imipAction
   * @memberof Message.prototype
   * @desc Perform IMIP actions on the current message.
   * @param {string} path - the path of the IMIP calendar part 
   * @param {string} action - the the IMIP action to perform
   * @param {object} data - the delegation info 
   */
  Message.prototype.$imipAction = function(path, action, data) {
    var _this = this;
    Message.$$resource.post([this.$absolutePath(), path].join('/'), action, data).then(function(data) {
      Message.$timeout(function() {
        _this.$reload();
      });
    });
  };

  /**
   * @function $sendMDN
   * @memberof Message.prototype
   * @desc Send MDN response for current email message
   */
  Message.prototype.$sendMDN = function() {
    this.shouldAskReceipt = 0;
    return Message.$$resource.post(this.$absolutePath(), 'sendMDN');
  };

  /**
   * @function $deleteAttachment
   * @memberof Message.prototype
   * @desc Delete an attachment from a message being composed
   * @param {string} filename - the filename of the attachment to delete
   */
  Message.prototype.$deleteAttachment = function(filename) {
    var action = 'deleteAttachment?filename=' + filename;
    var _this = this;
    Message.$$resource.post(this.$absolutePath({asDraft: true}), action).then(function(data) {
      Message.$timeout(function() {
        _this.editable.attachmentAttrs = _.filter(_this.editable.attachmentAttrs, function(attachment) {
          return attachment.filename != filename;
        });
      }, function() {
        // TODO: show toast
      });
    });
  };

  /**
   * @function $markAsFlaggedOrUnflagged
   * @memberof Message.prototype
   * @desc Add or remove a the \\Flagged flag on the current message.
   * @returns a promise of the HTTP operation
   */
  Message.prototype.toggleFlag = function() {
    var _this = this,
        action = 'markMessageFlagged';

    if (this.isflagged)
      action = 'markMessageUnflagged';

    return Message.$$resource.post(this.$absolutePath(), action).then(function(data) {
      Message.$timeout(function() {
        _this.isflagged = !_this.isflagged;
      });
    });
  };

  /**
   * @function $reload
   * @memberof Message.prototype
   * @desc Fetch the viewable message body along with other metadata such as the list of attachments.
   * @returns a promise of the HTTP operation
   */
  Message.prototype.$reload = function(options) {
    var futureMessageData;

    futureMessageData = Message.$$resource.fetch(this.$absolutePath(options), 'view');

    return this.$unwrap(futureMessageData);
  };

  /**
   * @function $reply
   * @memberof Message.prototype
   * @desc Prepare a new Message object as a reply to the sender.
   * @returns a promise of the HTTP operations
   */
  Message.prototype.$reply = function() {
    return this.$newDraft('reply');
  };

  /**
   * @function $replyAll
   * @memberof Message.prototype
   * @desc Prepare a new Message object as a reply to the sender and all recipients.
   * @returns a promise of the HTTP operations
   */
  Message.prototype.$replyAll = function() {
    return this.$newDraft('replyall');
  };

  /**
   * @function $forward
   * @memberof Message.prototype
   * @desc Prepare a new Message object as a forward.
   * @returns a promise of the HTTP operations
   */
  Message.prototype.$forward = function() {
    return this.$newDraft('forward');
  };

  /**
   * @function $newDraft
   * @memberof Message.prototype
   * @desc Prepare a new Message object as a reply or a forward of the current message and associated
   * to the draft mailbox.
   * @see {@link Account.$newMessage}
   * @see {@link Message.$editableContent}
   * @see {@link Message.$reply}
   * @see {@link Message.$replyAll}
   * @see {@link Message.$forwad}
   * @param {string} action - the HTTP action to perform on the message
   * @returns a promise of the HTTP operations
   */
  Message.prototype.$newDraft = function(action) {
    var _this = this;

    // Query server for draft folder and draft UID
    return Message.$$resource.fetch(this.$absolutePath(), action).then(function(data) {
      var mailbox, message;
      Message.$log.debug('New ' + action + ': ' + JSON.stringify(data, undefined, 2));
      mailbox = _this.$mailbox.$account.$getMailboxByPath(data.mailboxPath);
      message = new Message(data.accountId, mailbox, data);
      // Fetch draft initial data
      return Message.$$resource.fetch(message.$absolutePath({asDraft: true}), 'edit').then(function(data) {
        Message.$log.debug('New ' + action + ': ' + JSON.stringify(data, undefined, 2) + ' original UID: ' + _this.uid);
        angular.extend(message.editable, data);

        // We keep a reference to our original message in order to update the flags
        message.origin = {message: _this, action: action};
        return message;
      });
    });
  };

  /**
   * @function $save
   * @memberof Message.prototype
   * @desc Save the message to the server.
   * @returns a promise of the HTTP operation
   */
  Message.prototype.$save = function() {
    var _this = this,
        data = this.editable;

    Message.$log.debug('save = ' + JSON.stringify(data, undefined, 2));

    return Message.$$resource.save(this.$absolutePath({asDraft: true}), data).then(function(response) {
      Message.$log.debug('save = ' + JSON.stringify(response, undefined, 2));
      _this.$setUID(response.uid);
      _this.$reload({asDraft: false}); // fetch a new viewable version of the message
      _this.isNew = false;
    });
  };

  /**
   * @function $send
   * @memberof Message.prototype
   * @desc Send the message.
   * @returns a promise of the HTTP operation
   */
  Message.prototype.$send = function() {
    var _this = this,
        data = angular.copy(this.editable),
        deferred = Message.$q.defer();

    Message.$log.debug('send = ' + JSON.stringify(data, undefined, 2));

    Message.$$resource.post(this.$absolutePath({asDraft: true}), 'send', data).then(function(data) {
      if (data.status == 'success') {
        deferred.resolve(data);
        if (angular.isDefined(_this.origin)) {
          if (_this.origin.action.startsWith('reply'))
            _this.origin.message.isanswered = true;
          else if (_this.origin.action == 'forward')
            _this.origin.message.isforwarded = true;
        }
      }
      else {
        deferred.reject(data);
      }
    });

    return deferred.promise;
  };

  /**
   * @function $unwrap
   * @memberof Message.prototype
   * @desc Unwrap a promise. 
   * @param {promise} futureMessageData - a promise of some of the Message's data
   */
  Message.prototype.$unwrap = function(futureMessageData) {
    var _this = this;

    // Resolve and expose the promise
    this.$futureMessageData = futureMessageData.then(function(data) {
      // Calling $timeout will force Angular to refresh the view
      if (_this.isread === 0) {
        Message.$$resource.fetch(_this.$absolutePath(), 'markMessageRead').then(function() {
          Message.$timeout(function() {
            _this.isread = true;
            _this.$mailbox.unseenCount--;
          });
        });
      }
      return Message.$timeout(function() {
        angular.extend(_this, data);
        _this.$formatFullAddresses();
        _this.$loadUnsafeContent = false;
        return _this;
      });
    });

    return this.$futureMessageData;
  };

  /**
   * @function $omit
   * @memberof Message.prototype
   * @desc Return a sanitized object used to send to the server.
   * @return an object literal copy of the Message instance
   */
  Message.prototype.$omit = function() {
    var message = {};
    angular.forEach(this, function(value, key) {
      if (key != 'constructor' && key[0] != '$') {
        message[key] = value;
      }
    });

    return message;
  };

})();
