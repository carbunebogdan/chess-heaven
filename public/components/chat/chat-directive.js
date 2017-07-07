const chatDirective = ($rootScope, socketService, $window, accService,localStorageService) => {
    return {
        templateUrl: 'components/chat/chat.html',
        restrict: 'E',
        link: (scope) => {
            scope.messages=[{
                sender:'robo',
                message:'Salut! Bine ai venit!'
            }]
            var msgSound = new Audio('../../sounds/msg.mp3');
            scope.account = $rootScope.account;
            scope.message = {
                sender: $rootScope.account.username,
                message: ''
            };
            var scrollChat = () => {
                var chat = document.getElementById('chat');
                $('#chat').animate({
                    scrollTop: chat.scrollHeight
                }, 300);
            }
            scope.onEnter = () => {
                scope.message = {
                    sender: $rootScope.account.username,
                    message: $rootScope.account.username + ' joined !'
                };
                scope.send();

                scope.account.status = 1;
                localStorageService.set('account', scope.account);
                $rootScope.account = scope.account;
                socketService.socketEmit('account', scope.account);
            }


            scope.onExit = () => {
                scope.message = {
                    sender: $rootScope.account.username,
                    message: $rootScope.account.username + ' left..'
                };
                // scope.send();
                scope.account.status = 0;
                localStorageService.set('account', scope.account)
                socketService.socketEmit('account', scope.account);
            };

             $window.onbeforeunload = scope.onExit;

            scope.changeTitle = () => {
                document.title = 'Bogodan Chatroom';
            }
            scope.send = () => {
                if (scope.message.message != '') {
                    scope.messages.push(scope.message);
                    scrollChat();
                    socketService.socketEmit('newMessage', scope.message);

                    scope.message = {
                        sender: $rootScope.account.username,
                        message: ''
                    };
                }
            }


            scope.onEnter();
            // Watch for socket incoming data
            socketService.socketOn('newMessage', (rsp) => {
                if(rsp.source.sender!=$rootScope.account.username){
                    scope.messages.push(rsp.source);
                    scope.$apply();
                    scrollChat();
                    msgSound.play();
                    document.title = 'Message from '+rsp.source.sender; 
                }

            });
        }
    };
};

chatDirective.$inject = ['$rootScope', 'socketService', '$window', 'accService','localStorageService'];

angular.module('berger').directive('chatDirective', chatDirective);
