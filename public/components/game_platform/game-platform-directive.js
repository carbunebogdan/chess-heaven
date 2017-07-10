const gamePlatform = ($rootScope, socketService, $mdDialog, accService, gameService, competitionService, betService) => {
    return {
        templateUrl: 'components/game_platform/game-platform.html',
        restrict: 'E',
        link: (scope) => {

            var game = new Chess();

            // do not pick up pieces if the game is over
            // only pick up pieces for White
            var onDragStart = function(source, piece, position, orientation) {
                if (game.in_checkmate() === true || game.in_draw() === true ||
                    piece.search(/^b/) !== -1) {
                    return false;
                }
            };
            var onDrop = function(source, target) {
                console.log(source);
                console.log(target);

                // see if the move is legal
                var move = game.move({
                    from: source,
                    to: target,
                    promotion: 'q' // NOTE: always promote to a queen for example simplicity
                });

                // illegal move
                if (move === null) return 'snapback';

                console.log('success');
            };

            scope.source = '';
            scope.target = '';
            scope.setpos = (source, target) => {
                console.log('begin move');
                console.log(source);
                console.log(target);
                board.move(source + '-' + target);
                scope.source = scope.target;
                scope.target = '';
                console.log('end move');
            }

            // update the board position after the piece snap
            // for castling, en passant, pawn promotion
            var onSnapEnd = function() {
                board.position(game.fen(), true);
                console.log(game.fen());
            };

            var cfg = {
                draggable: true,
                position: 'start',
                onDragStart: onDragStart,
                onDrop: onDrop,
                onSnapEnd: onSnapEnd,
                showNotation: true
            };


            var board = ChessBoard('#board', cfg);

            scope.joinRoom = () => {
                socketService.socketEmit('joinGame', { user: $rootScope.account.username, room: 'game' });
            }

            scope.leaveGameAsk = () => {
                $mdDialog.show({
                    scope: scope.$new(),
                    templateUrl: 'components/leave_game_modal/leaveGameAsk.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true,
                    fullscreen: scope.customFullscreen
                });
            }

            scope.closeAskDialog = () => {
                $mdDialog.hide();
            }

            scope.leaveGame = () => {
                var result = null;
                gameService.getGameById(scope.contCtrl.currGameId).then((rsp) => {
                    if ($rootScope.account._id == rsp.data.p1_id) {
                        result = 3;
                    } else if ($rootScope.account._id == rsp.data.p2_id) {
                        result = 1;
                    }

                    const gameData = {
                    	id:rsp.data._id,
                        comp_id: rsp.data.comp_id,
                        round: 1,
                        status: result,
                        p1_id: rsp.data.p1_id,
                        p1_color: rsp.data.p1_color,
                        p2_id: rsp.data.p2_id,
                        p2_color: rsp.data.p2_color,
                        date: rsp.data.date,
                        room: rsp.data.room
                    }

                    gameService.endGame(gameData).then((rsp) => {

                        $rootScope.$broadcast('gameFinished', 1);
                        var betResult={
	                        gameId:scope.currGameId,
	                        status:result
                    	}
                        betService.updateAllBetsForGame(betResult).then((response) => {
                            var bets = response.data;
                            if (bets.length > 0) {
                                for (i = 0; i < bets.length; i++) {
                                    var userMoney = {
                                        user: bets[i].userId,
                                        ammount: 2 * bets[i].money
                                    };
                                    accService.updateMoney(userMoney).then((success) => {
                                        socketService.socketEmit('updateMoney', 1);
                                        socketService.socketEmit('newBet', 1);
                                    });

                                }
                            }
                        });
                    });

                    accService.updatePlayerStatus({
                        id: $rootScope.account._id,
                        status: 1
                    }).then((rsp)=>{
                    	console.log('should emit');
                    	socketService.socketEmit('leftGame',$rootScope.account.username)
                    });

                    $rootScope.account.status=1;
                    scope.contCtrl.ingame=false;
                    scope.contCtrl.viewValue='players';
                    $mdDialog.destroy();

                    $mdDialog.show({
                    	scope: scope.$new(),
                        templateUrl: 'components/leave_game_modal/responseLost.html',
                        parent: angular.element(document.body),
                        clickOutsideToClose: true,
                        fullscreen: scope.customFullscreen
                    });



                })
            }


            socketService.socketOn('leftGame',(from)=>{
            	accService.updatePlayerStatus({
                        id: $rootScope.account._id,
                        status: 1
                    }).then((rsp)=>{
                    	$rootScope.account.status=1;
	                    scope.contCtrl.ingame=false;
	                    scope.contCtrl.viewValue='players';
	                    $mdDialog.hide();

	                    $mdDialog.show({
	                    	scope: scope.$new(),
	                        templateUrl: 'components/leave_game_modal/responseWinByLeave.html',
	                        parent: angular.element(document.body),
	                        clickOutsideToClose: true,
	                        fullscreen: scope.customFullscreen
	                    });

	                    socketService.socketEmit('leaveRoom',$rootScope.account.username);
                    });

                    
            });




        }
    }
}

gamePlatform.$inject = ['$rootScope', 'socketService', '$mdDialog', 'accService', 'gameService', 'competitionService', 'betService'];

angular.module('berger').directive('gamePlatform', gamePlatform);
