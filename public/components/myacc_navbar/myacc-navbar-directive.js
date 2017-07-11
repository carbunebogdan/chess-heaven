const myaccNavbar = ($mdDialog, $window, $rootScope, accService, localStorageService, $location, socketService, $timeout) => {
    return {
        templateUrl: 'components/myacc_navbar/myacc-navbar.html',
        restrict: 'E',
        link: (scope) => {
            var newChallengeSound = new Audio('../../sounds/newChallenge.mp3');
            scope.account = $rootScope.account;
            var challengerUserId=null;
            var challengeDeclined = false;
            scope.logout = () => {
                scope.logoutLoading = true;
                scope.account.status = 0;
                accService.login(scope.account).then((rsp) => {
                    scope.logoutLoading = false;
                    if (rsp.data) {
                        if ($rootScope.account.type == 2)
                            socketService.socketEmit('updateList', { user: $rootScope.account.username, status: 0 });
                        $rootScope.account = null;
                        localStorageService.clearAll();
                        $location.path('/login');
                    } else {
                        //something..
                    }
                });
            }


            // on new bet refresh user data
            socketService.socketOn('newBet', (resp) => {
                scope.userRefresh = {
                    username: scope.account.username,
                    password: scope.account.password,
                    status: 1
                }
                accService.login(scope.userRefresh).then((resp) => {
                    $rootScope.account = resp.data;
                    localStorageService.set('account', $rootScope.account);
                    scope.account = $rootScope.account;
                });
            });

            // update money event
            socketService.socketOn('updateMoney', (resp) => {
                scope.userRefresh = {
                    username: scope.account.username,
                    password: scope.account.password,
                    status: 1
                }
                accService.login(scope.userRefresh).then((resp) => {
                    $rootScope.account = resp.data;
                    localStorageService.set('account', $rootScope.account);
                    scope.account = $rootScope.account;
                });
            });

            // show challenge modal 
            scope.showChallenge = () => {
                $mdDialog.show({
                    scope: scope.$new(),
                    templateUrl: 'components/challenge_modal/challenge.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: false,
                    fullscreen: scope.customFullscreen
                });
            };

            // receive challenge and open modal
            socketService.socketOn('challenge', (from) => {
                challengeAction = false;
                scope.challengerName = from.source.p1;
                scope.challengerId = from.source.p1_sockId;
                challengerUserId = from.source.p1_id;
                scope.showChallenge();
                timeTick(100);
                newChallengeSound.play();
                document.title = from.source.p1 +' challenged you!'; 
            });

            

            // receive challenge response
            socketService.socketOn('challengeResponse', (from) => {
                if (from.source.response == 0) {
                    scope.challengedName = from.source.p2;
                    $mdDialog.show({
                        scope: scope.$new(),
                        templateUrl: 'components/challenge_modal/response.html',
                        parent: angular.element(document.body),
                        clickOutsideToClose: true,
                        fullscreen: scope.customFullscreen
                    });
                }else{
                    scope.contCtrl.enemy = from.source.p2;
                    socketService.socketEmit('joinGame',{
                        room:from.source.p2+'vs'+from.source.p1,
                        game_Id:from.source.game_Id
                    });
                    scope.contCtrl.ingame=true;
                    scope.contCtrl.viewValue = 'game';
                    scope.$apply();
                    scope.contCtrl.currGameId=from.source.game_Id;
                }

            })

            var timeTick = (time) => {
                if (challengeAction) {
                    return false;
                }
                scope.time = time;

                if (scope.time == 0) {
                    scope.declineChallenge();
                } else {
                    $timeout(() => { timeTick(scope.time - 1) }, 100);
                }


            }

            scope.closeResp = () => {
                $mdDialog.hide();
            }

            // decline challenge
            scope.declineChallenge = () => {
                document.title = 'Chess Heaven';
                challengeAction = true;
                $mdDialog.hide();
                socketService.socketEmit('challengeResponse', {
                    p2: $rootScope.account.username,
                    response: 0,
                    sockId: scope.challengerId
                })
            }

            scope.acceptChallenge = () => {
                document.title = 'Chess Heaven';
                challengeAction = true;
                scope.contCtrl.enemy=scope.challengerName;
                $mdDialog.hide();
                socketService.socketEmit('challengeResponse', {
                    p2: $rootScope.account.username,
                    p1: scope.challengerName,
                    response: 1,
                    sockId: scope.challengerId,
                    p2_id:$rootScope.account._id,
                    p1_id:challengerUserId
                })
            }

            socketService.socketOn('enterGame',(from)=>{
                scope.contCtrl.ingame=true;
                scope.contCtrl.viewValue = 'game';
                scope.contCtrl.currGameId=from.source;
            })



        }
    }
};

myaccNavbar.$inject = ['$mdDialog', '$window', '$rootScope', 'accService', 'localStorageService', '$location', 'socketService', '$timeout'];

angular.module('berger').directive('myaccNavbar', myaccNavbar);
