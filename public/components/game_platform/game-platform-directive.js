const gamePlatform = ($rootScope, socketService, $mdDialog, accService, gameService, competitionService, betService, $timeout) => {
    return {
        templateUrl: 'components/game_platform/game-platform.html',
        restrict: 'E',
        link: (scope) => {
            var myColor = null;
            var game = new Chess();
            var currGame = null;
            var board = null;
            var gameIsSet = false;

            // do not pick up pieces if the game is over
            // only pick up pieces for certain round
            var onDragStart = function(source, piece, position, orientation) {
                if (game.game_over() === true ||
                    (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
                    (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
                    return false;
                }
                if (myColor != game.turn()) {
                    return false;
                }
            };
            var onDrop = function(source, target) {

                // see if the move is legal
                var move = game.move({
                    from: source,
                    to: target,
                    promotion: 'q' // NOTE: always promote to a queen for example simplicity
                });

                // illegal move
                if (move === null) return 'snapback';
                updateStatus();
                socketService.socketEmit('move', { source: source, target: target });
            };

            // update the board position after the piece snap
            // for castling, en passant, pawn promotion
            var onSnapEnd = function() {
                board.position(game.fen(), true);
            };

            var updateStatus = function() {


                var moveColor = 'White';
                if (game.turn() === 'b') {
                    moveColor = 'Black';
                }

                // checkmate?
                if (game.in_checkmate() === true) {

                    scope.time = 10;
                    scope.status = 'Game over, ' + moveColor + ' is in checkmate. Exiting in ' + scope.time + '...';
                    var loseColor = null;
                    var result = 0;


                    var timeTick = (time) => {

                        scope.time = time;
                        scope.status = 'Game over, ' + moveColor + ' is in checkmate. Exiting in ' + scope.time + '...';

                        if (scope.time == 0) {
                            if (myColor == loseColor) {
                                endGame(result);
                                accService.updatePlayerStatus({
                                    id: $rootScope.account._id,
                                    status: 1
                                }).then((rsp) => {
                                    socketService.socketEmit('endGame', $rootScope.account.username)
                                    $mdDialog.show({
                                        scope: scope.$new(),
                                        templateUrl: 'components/end_game_modal/responseLost.html',
                                        parent: angular.element(document.body),
                                        clickOutsideToClose: true,
                                        fullscreen: scope.customFullscreen
                                    });
                                });



                            } else {
                                accService.updatePlayerStatus({
                                    id: $rootScope.account._id,
                                    status: 1
                                }).then((rsp) => {
                                    $rootScope.account.status = 1;
                                    scope.contCtrl.ingame = false;
                                    scope.contCtrl.viewValue = 'players';

                                    socketService.socketEmit('endGame', $rootScope.account.username);

                                    $mdDialog.show({
                                        scope: scope.$new(),
                                        templateUrl: 'components/end_game_modal/responseWin.html',
                                        parent: angular.element(document.body),
                                        clickOutsideToClose: true,
                                        fullscreen: scope.customFullscreen
                                    });
                                });

                            }
                        } else {
                            $timeout(() => { timeTick(scope.time - 1) }, 1000);
                        }


                    }

                    if (moveColor == 'White') {
                        loseColor = 'w';
                        result = 3;
                    } else {
                        loseColor = 'b';
                        result = 1;
                    }
                    timeTick(scope.time);



                }

                // draw?
                else if (game.in_draw() === true) {
                    scope.time = 10;
                    scope.status = 'Game over, drawn position. Exiting in ' + scope.time + '...';
                    var lastColor = null;
                    var result = 2;


                    var timeTick = (time) => {

                        scope.time = time;
                        scope.status = 'Game over, drawn position. Exiting in ' + scope.time + '...';

                        if (scope.time == 0) {
                            if ($rootScope.account._id == currGame.p1_id) {
                                endGame(result);
                                accService.updatePlayerStatus({
                                    id: $rootScope.account._id,
                                    status: 1
                                }).then((rsp) => {
                                    socketService.socketEmit('endGame', $rootScope.account.username)
                                    $mdDialog.show({
                                        scope: scope.$new(),
                                        templateUrl: 'components/end_game_modal/responseDraw.html',
                                        parent: angular.element(document.body),
                                        clickOutsideToClose: true,
                                        fullscreen: scope.customFullscreen
                                    });
                                });



                            } else {
                                accService.updatePlayerStatus({
                                    id: $rootScope.account._id,
                                    status: 1
                                }).then((rsp) => {
                                    $rootScope.account.status = 1;
                                    scope.contCtrl.ingame = false;
                                    scope.contCtrl.viewValue = 'players';

                                    socketService.socketEmit('endGame', $rootScope.account.username);

                                    $mdDialog.show({
                                        scope: scope.$new(),
                                        templateUrl: 'components/end_game_modal/responseDraw.html',
                                        parent: angular.element(document.body),
                                        clickOutsideToClose: true,
                                        fullscreen: scope.customFullscreen
                                    });
                                });

                            }
                        } else {
                            $timeout(() => { timeTick(scope.time - 1) }, 1000);
                        }


                    }

                    if (moveColor == 'White') {
                        lastColor = 'w';
                    } else {
                        loseColor = 'b';
                    }
                    timeTick(scope.time);
                }

                // game still on
                else {
                    scope.status = moveColor + ' to move';

                    // check?
                    if (game.in_check() === true) {
                        scope.status += ', ' + moveColor + ' is in check';
                    }
                }
                if (!scope.$$phase)
                    scope.$apply();


            };

            // configuration for board initialization
            var cfg = {
                draggable: true,
                position: 'start',
                orientation: 'white',
                onDragStart: onDragStart,
                onDrop: onDrop,
                onSnapEnd: onSnapEnd,
                showNotation: true
            };

            // count down if player has left
            var countDownLeft = (time) => {
                if (!scope.playerLeft) {
                    return false;
                }
                scope.leftTime = time;

                if (scope.leftTime == 0) {
                    // end game and win
                    var result = 0;
                    if ($rootScope.account._id == currGame.p1_id) {
                        result = 1;
                        otherPlayerId = currGame.p2_id;
                    } else {
                        result = 3;
                        otherPlayerId = currGame.p1_id;
                    }

                    endGame(result);
                    accService.updatePlayerStatus({
                        id: otherPlayerId,
                        status: 0
                    }).then((rsp) => {                       
                        accService.updatePlayerStatus({
                            id: $rootScope.account._id,
                            status: 1
                        }).then((rsp) => {
                            socketService.socketEmit('updateList', { user: $rootScope.account.username, status: 1 });
                            socketService.socketEmit('updateList', { user: scope.contCtrl.enemy, status: 0 });
                            $mdDialog.show({
                                scope: scope.$new(),
                                templateUrl: 'components/leave_game_modal/responseWinByLeave.html',
                                parent: angular.element(document.body),
                                clickOutsideToClose: true,
                                fullscreen: scope.customFullscreen
                            });
                            $rootScope.$broadcast('refreshPlayers');
                        });
                    });

                } else {
                    $timeout(() => { countDownLeft(scope.leftTime - 1) }, 1000);
                }


            }

            // set up game board
            var setUpGame = (position = null, fen = null) => {
                gameService.getGameById(scope.contCtrl.currGameId).then((rsp) => {
                    currGame = rsp.data;
                    if ($rootScope.account._id == currGame.p1_id) {
                        cfg.orientation = 'white';
                        myColor = 'w';
                    } else if ($rootScope.account._id == currGame.p2_id) {
                        cfg.orientation = 'black';
                        myColor = 'b';
                    }
                    if (position) {
                        board = ChessBoard('#board', cfg);
                        game.load(fen);
                        board.position(game.fen(), true);
                    } else {
                        board = ChessBoard('#board', cfg);
                    }

                    scope.gameLoad = false;
                    updateStatus();
                });
            }



            scope.gameLoad = true;
            socketService.socketOn('gameId', (from) => {
                scope.contCtrl.currGameId = from;

            });

            socketService.socketOn('gameData', (from) => {
                setUpGame(from.position, from.fen);
                gameIsSet = true;
            });

            socketService.socketOn('needData', (from) => {
                socketService.socketEmit('gameData', {
                    position: board.fen(),
                    fen: game.fen()
                });
                scope.playerLeft = false;
            });

            socketService.socketOn('player left', (from) => {
                scope.playerLeft = true;
                countDownLeft(5);
                scope.$apply;

            })


            if (!gameIsSet) {
                setUpGame();
            }






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
                if ($rootScope.account._id == currGame.p1_id) {
                    result = 3;
                } else if ($rootScope.account._id == currGame.p2_id) {
                    result = 1;
                }
                endGame(result);

                accService.updatePlayerStatus({
                    id: $rootScope.account._id,
                    status: 1
                }).then((rsp) => {
                    socketService.socketEmit('leftGame', $rootScope.account.username)
                });

                $mdDialog.destroy();

                $mdDialog.show({
                    scope: scope.$new(),
                    templateUrl: 'components/leave_game_modal/responseLost.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true,
                    fullscreen: scope.customFullscreen
                });

            }

            var endGame = (result) => {


                const gameData = {
                    id: currGame._id,
                    comp_id: currGame.comp_id,
                    round: 1,
                    status: result,
                    p1_id: currGame.p1_id,
                    p1_color: currGame.p1_color,
                    p2_id: currGame.p2_id,
                    p2_color: currGame.p2_color,
                    date: currGame.date,
                    room: currGame.room
                }

                gameService.endGame(gameData).then((rsp) => {

                    $rootScope.$broadcast('gameFinished', 1);
                    var betResult = {
                        gameId: currGame._id,
                        status: result
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

                $rootScope.account.status = 1;
                scope.contCtrl.ingame = false;
                scope.contCtrl.viewValue = 'players';

            }



            socketService.socketOn('leftGame', (from) => {
                accService.updatePlayerStatus({
                    id: $rootScope.account._id,
                    status: 1
                }).then((rsp) => {
                    $rootScope.account.status = 1;
                    scope.contCtrl.ingame = false;
                    scope.contCtrl.viewValue = 'players';
                    $mdDialog.hide();

                    $mdDialog.show({
                        scope: scope.$new(),
                        templateUrl: 'components/leave_game_modal/responseWinByLeave.html',
                        parent: angular.element(document.body),
                        clickOutsideToClose: true,
                        fullscreen: scope.customFullscreen
                    });

                    socketService.socketEmit('leaveRoom', $rootScope.account.username);
                });


            });

            socketService.socketOn('move', (from) => {
                board.move(from.source + '-' + from.target);
                var move = game.move({
                    from: from.source,
                    to: from.target,
                    promotion: 'q' // NOTE: always promote to a queen for example simplicity
                });
                board.draggable = true;
                updateStatus();
            })


        }
    }
}

gamePlatform.$inject = ['$rootScope', 'socketService', '$mdDialog', 'accService', 'gameService', 'competitionService', 'betService', '$timeout'];

angular.module('berger').directive('gamePlatform', gamePlatform);
