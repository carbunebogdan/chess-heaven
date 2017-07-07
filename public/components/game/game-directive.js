const gameComponent = ($rootScope, gameService, accService, betService, localStorageService,socketService) => {
    return {
        templateUrl: 'components/game/game.html',
        restrict: 'E',
        scope: {
            competitions: '=',
            allGames: '=',
            gameData: '=', //{p1_id : '', p2_id: ''}
            players: '=', //[player]
            account: '=' //[acc type]
        },
        link: (scope) => {
            scope.game = {
                status: '2' //draw
            }
            scope.canBet=true;
            scope.playerOne = scope.players.filter((obj) => obj._id === scope.gameData.p1_id)[0];
            scope.playerTwo = scope.players.filter((obj) => obj._id === scope.gameData.p2_id)[0];

            scope.bet = {
                gameId: '',
                userId: '',
                option: 0,
                money: null
            }

            scope.getBets= ()=>{
                var currGame={
                        userId: scope.account._id,
                        gameId: scope.gameData._id
                    };

                betService.getBetsForGame(currGame).then((rsp)=>{
                    scope.bets=rsp.data;
                    if(rsp.data.length>0)
                        scope.canBet=false;
                })
            }
            scope.getBets();

            betService.getAllBetsForGame(scope.gameData._id).then((rsp)=>{
                
            })

            scope.switch=(value)=>{
                scope.canBet=value;
                if(!value){
                    scope.bet = {
                        gameId: '',
                        userId: '',
                        option: 0,
                        money: null
                    }
                }
            }

            scope.endGame = () => {
                if (scope.game.status) {
                    const gameData = angular.copy(scope.gameData);
                    gameData.status = scope.game.status;
                    gameData.id = gameData._id;

                    delete gameData._id;
                    gameService.endGame(gameData).then((rsp) => {
                        scope.gameData = rsp.data;
                        scope.allGames.forEach((obj) => {
                            if (obj._id === scope.gameData._id) {
                                obj.status = scope.gameData.status;
                            }
                        });
                        $rootScope.$broadcast('gameFinished', 1);
                    });
                    var result={
                        gameId:scope.gameData._id,
                        status:scope.game.status
                    }
                    betService.updateAllBetsForGame(result).then((rsp)=>{
                        var bets=rsp.data;
                        if(bets.length>0){
                            for(i=0;i<bets.length;i++){
                                    var userMoney = {
                                        user: bets[i].userId,
                                        ammount: 2 * bets[i].money
                                    };
                                    accService.updateMoney(userMoney).then((rsp) => {
                                        socketService.socketEmit('updateMoney', 1);
                                        socketService.socketEmit('newBet', 1);
                                    });
                                
                            }
                        }
                    });

                }
            }

            scope.placeBet = (game) => {
                scope.bet.gameId = game._id;
                scope.bet.userId = scope.account._id;
                var userMoney = {
                    user: scope.bet.userId,
                    ammount: -scope.bet.money
                }
                accService.updateMoney(userMoney).then((rsp) => {
                    $rootScope.account.money = rsp.data.money;
                    localStorageService.set('account', $rootScope.account);

                });
                betService.placeBet(scope.bet).then((rsp)=>{
                    scope.getBets();
                    // Send to server an impulse that I placed a bet
                    socketService.socketEmit('newBet', 1);
                });
                

            }

            socketService.socketOn('newBet', (resp) => {
                scope.getBets();
            });
        }
    }
}

gameComponent.$inject = ['$rootScope', 'gameService', 'accService', 'betService', 'localStorageService','socketService'];

angular.module('berger').directive('game', gameComponent);
