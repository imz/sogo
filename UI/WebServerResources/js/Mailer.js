!function(){"use strict";function a(a,l){a.state("mail",{url:"/Mail",views:{mailboxes:{templateUrl:"UIxMailMainFrame",controller:"MailboxesController",controllerAs:"app"}},resolve:{stateAccounts:b}}).state("mail.account",{url:"/:accountId","abstract":!0,views:{mailbox:{template:"<ui-view/>"}},resolve:{stateAccount:c}}).state("mail.account.virtualMailbox",{url:"/virtual",views:{"mailbox@mail":{templateUrl:"UIxMailFolderTemplate",controller:"MailboxController",controllerAs:"mailbox"}},resolve:{stateMailbox:g}}).state("mail.account.virtualMailbox.message",{url:"/:mailboxId/:messageId",views:{message:{templateUrl:"UIxMailViewTemplate",controller:"MessageController",controllerAs:"viewer"}},resolve:{stateMailbox:h,stateMessages:f,stateMessage:i}}).state("mail.account.inbox",{url:"/inbox",views:{"mailbox@mail":{templateUrl:"UIxMailFolderTemplate",controller:"MailboxController",controllerAs:"mailbox"}},resolve:{stateMailbox:e,stateMessages:f}}).state("mail.account.mailbox",{url:"/:mailboxId",views:{"mailbox@mail":{templateUrl:"UIxMailFolderTemplate",controller:"MailboxController",controllerAs:"mailbox"}},resolve:{stateMailbox:d,stateMessages:f}}).state("mail.account.mailbox.message",{url:"/:messageId",views:{message:{templateUrl:"UIxMailViewTemplate",controller:"MessageController",controllerAs:"viewer"}},onEnter:j,onExit:k,resolve:{stateMessage:i}}),l.otherwise("/Mail/0/inbox")}function b(a,b){var c=b.$findAll(window.mailAccounts),d=[];return angular.forEach(c,function(a,b){var c=a.$getMailboxes();d.push(c.then(function(b){return a}))}),a.all(d)}function c(a,b){return _.find(b,function(b){return b.id==a.accountId})}function d(a,b,c,d,e,f){var g,h,i=e(c.mailboxId);return h=function(a){var b=_.find(a,function(a){return a.path==i});return b||angular.forEach(a,function(a){!b&&a.children&&a.children.length>0&&(b=h(a.children))}),b},f.selectedFolder&&(f.selectedFolder.$isLoading=!0),g=h(d.$mailboxes),g?g:b.go("mail.account.inbox")}function e(a,b){return b.selectedFolder&&(b.selectedFolder.$isLoading=!0),a.$mailboxes[0]}function f(a,b){return a.$virtualMode?[]:b.$filter()}function g(a,b){return b.$virtualMode?b.selectedFolder:a.reject("No virtual mailbox defined")}function h(a,b,c,d){var e=c(d.mailboxId);return b.$virtualMode?(b.selectedFolder.resetSelectedMessage(),_.find(b.selectedFolder.$mailboxes,function(a){return a.path==e})):a.reject("No virtual mailbox defined for message")}function i(a,b,c,d,e,f){var g;return(g=_.find(e.$messages,function(a){return a.uid==parseInt(c.messageId)}))?g.$reload():void d.go("mail.account.mailbox",{accountId:e.$account.id,mailboxId:b(e.path)})}function j(a,b){b.selectedMessage=parseInt(a.messageId)}function k(a){a.selectedMessage=-1}function l(a,b,c){a.$on("$stateChangeError",function(a,d,e,f,g,h){b.error(h),a.preventDefault(),"mail.account.inbox"!=d.name?c.go("mail.account.inbox"):c.go("mail")}),a.$on("$routeChangeError",function(a,c,d,e){b.error(a,c,d,e)})}angular.module("SOGo.MailerUI",["ui.router","ck","angularFileUpload","SOGo.Common","SOGo.ContactsUI","ngAnimate","SOGo.PreferencesUI"]).config(a).run(l),a.$inject=["$stateProvider","$urlRouterProvider"],b.$inject=["$q","Account"],c.$inject=["$stateParams","stateAccounts"],d.$inject=["$q","$state","$stateParams","stateAccount","decodeUriFilter","Mailbox"],e.$inject=["stateAccount","Mailbox"],f.$inject=["Mailbox","stateMailbox"],g.$inject=["$q","Mailbox"],h.$inject=["$q","Mailbox","decodeUriFilter","$stateParams"],i.$inject=["Mailbox","encodeUriFilter","$stateParams","$state","stateMailbox","stateMessages"],j.$inject=["$stateParams","stateMailbox"],k.$inject=["stateMailbox"],l.$inject=["$rootScope","$log","$state"]}();
//# sourceMappingURL=Mailer.js.map