(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const addCompetition = (competitionService, socketService) => {
    return {
        templateUrl: 'components/add_competition/add-competition.html',
        restrict: 'E',
        link: scope => {

            // General properties
            scope.competition = {
                name: '',
                players: []
            };

            // Adds a new player
            scope.addCompetition = () => {
                if (scope.competition.name && scope.competition.players) {
                    competitionService.addCompetition(scope.competition).then(() => {
                        competitionService.getCompetition().then(resp => {

                            // Update competitions data
                            scope.contCtrl.competitions = resp.data;

                            // General properties
                            scope.competition = {
                                name: '',
                                players: []
                            };

                            // Reset the form after success
                            scope.formModel.$setPristine();
                            scope.formModel.$setUntouched();

                            // Send to server an impulse that we've added the competition
                            socketService.socketEmit('newCompetition', 1);
                        });
                    });
                }
            };
        }
    };
};

addCompetition.$inject = ['competitionService', 'socketService'];

angular.module('berger').directive('addCompetition', addCompetition);

},{}],2:[function(require,module,exports){
const addUsers = playerService => {
    return {
        templateUrl: 'components/add_users/add-users.html',
        restrict: 'E',
        link: scope => {

            // General properties
            scope.player = {
                name: '',
                email: '',
                club: ''
            };

            // Adds a new player
            scope.addPlayer = () => {
                if (scope.player.name && scope.player.email) {

                    // What is a promise Pava? a a a?
                    playerService.addPlayer(scope.player).then(() => {
                        playerService.getPlayers().then(resp => {

                            // Update players data
                            scope.contCtrl.players = resp.data;

                            // Reset player model
                            scope.player = {
                                name: '',
                                email: '',
                                club: ''
                            };

                            // Reset the form after success
                            scope.formModel.$setPristine();
                            scope.formModel.$setUntouched();
                        });
                    });
                }
            };
        }
    };
};

addUsers.$inject = ['playerService'];

angular.module('berger').directive('addUsers', addUsers);

},{}],3:[function(require,module,exports){
const competitionDirective = () => {
    return {
        templateUrl: 'components/competition/competition.html',
        restrict: 'E',
        link: scope => {}
    };
};

competitionDirective.$inject = [];

angular.module('berger').directive('competitionDirective', competitionDirective);

},{}],4:[function(require,module,exports){
class containerController {
    constructor($state, playerRsp, competitionRsp, gamesRsp, socketService, competitionService, $location, localStorageService, $rootScope, accService) {
        if (!$rootScope.account) $rootScope.account = localStorageService.get('account');

        if (!$rootScope.account) $location.path('/login');

        // Shared properties throughout the application
        this.players = playerRsp.data;
        this.userHeaders = ['Name', 'Email', 'Club', 'Date'];
        this.userKeys = ['name', 'email', 'club', 'date'];

        this.competitions = competitionRsp.data;
        this.competitionHeaders = ['Name', 'Current Round', 'Total Rounds', 'Status', 'Date'];
        this.competitionKeys = ['name', 'current_round', 'rounds', 'status', 'date'];

        this.games = gamesRsp.data;
        this.gamesFilter = gamesRsp.data;

        // Set the current view based on what we loaded
        this.viewValue = $state.current.name;
        if ($rootScope.account.type == 0) {
            this.subViewValue = 'player';
        } else {
            this.subViewValue = 'myacc';
        }

        if ($state.params && $state.params.compId) {
            this.currentCompId = $state.params.compId;
        }

        // Register socket
        socketService.registerSocket();

        // Watch for socket incoming data
        socketService.socketOn('newCompetition', resp => {
            competitionService.getCompetition().then(resp => {
                this.competitions = resp.data;
            });
        });
    }
}

containerController.$inject = ['$state', 'playerRsp', 'competitionRsp', 'gamesRsp', 'socketService', 'competitionService', '$location', 'localStorageService', '$rootScope', 'accService'];

angular.module('berger').controller('containerController', containerController);

},{}],5:[function(require,module,exports){
const containerDirective = ($rootScope, accService, localStorageService, betService, socketService) => {
    return {
        templateUrl: 'components/container/container.html',
        restrict: 'E',
        link: scope => {
            scope.userMoney = {
                user: '',
                ammount: 0
            };

            // Changes the view betweeen panels
            scope.changeSubView = view => {
                scope.contCtrl.subViewValue = view;
            };

            // Changes the view betweeen panels
            scope.changeView = view => {
                scope.contCtrl.viewValue = view;
            };

            scope.updateMoney = () => {
                scope.userMoney.user = $rootScope.account._id;
                accService.updateMoney(scope.userMoney).then(rsp => {
                    $rootScope.account.money = rsp.data.money;
                    localStorageService.set('account', $rootScope.account);
                    socketService.socketEmit('updateMoney', 1);
                });
            };

            scope.getMyBets = () => {
                betService.getBetsForUser($rootScope.account._id).then(rsp => {
                    scope.myBets = rsp.data;
                });
            };

            scope.getMyBets();
            socketService.socketOn('newBet', resp => {
                scope.getMyBets();
            });
        }
    };
};

containerDirective.$inject = ['$rootScope', 'accService', 'localStorageService', 'betService', 'socketService'];

angular.module('berger').directive('containerDirective', containerDirective);

},{}],6:[function(require,module,exports){
const gameComponent = ($rootScope, gameService, accService, betService, localStorageService, socketService) => {
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
        link: scope => {
            scope.game = {
                status: '2' //draw
            };
            scope.canBet = true;
            scope.playerOne = scope.players.filter(obj => obj._id === scope.gameData.p1_id)[0];
            scope.playerTwo = scope.players.filter(obj => obj._id === scope.gameData.p2_id)[0];

            scope.bet = {
                gameId: '',
                userId: '',
                option: 0,
                money: null
            };

            scope.getBets = () => {
                var currGame = {
                    userId: scope.account._id,
                    gameId: scope.gameData._id
                };

                betService.getBetsForGame(currGame).then(rsp => {
                    scope.bets = rsp.data;
                    if (rsp.data.length > 0) scope.canBet = false;
                });
            };
            scope.getBets();

            betService.getAllBetsForGame(scope.gameData._id).then(rsp => {});

            scope.switch = value => {
                scope.canBet = value;
                if (!value) {
                    scope.bet = {
                        gameId: '',
                        userId: '',
                        option: 0,
                        money: null
                    };
                }
            };

            scope.endGame = () => {
                if (scope.game.status) {
                    const gameData = angular.copy(scope.gameData);
                    gameData.status = scope.game.status;
                    gameData.id = gameData._id;

                    delete gameData._id;
                    gameService.endGame(gameData).then(rsp => {
                        scope.gameData = rsp.data;
                        scope.allGames.forEach(obj => {
                            if (obj._id === scope.gameData._id) {
                                obj.status = scope.gameData.status;
                            }
                        });
                        $rootScope.$broadcast('gameFinished', 1);
                    });
                    var result = {
                        gameId: scope.gameData._id,
                        status: scope.game.status
                    };
                    betService.updateAllBetsForGame(result).then(rsp => {
                        var bets = rsp.data;
                        if (bets.length > 0) {
                            for (i = 0; i < bets.length; i++) {
                                if (bets[i].result == bets[i].option) {
                                    var userMoney = {
                                        user: bets[i].userId,
                                        ammount: 2 * bets[i].money
                                    };
                                    accService.updateMoney(userMoney).then(rsp => {});
                                }
                            }
                        }
                    });
                }
            };

            scope.placeBet = game => {
                scope.bet.gameId = game._id;
                scope.bet.userId = scope.account._id;
                var userMoney = {
                    user: scope.bet.userId,
                    ammount: -scope.bet.money
                };
                accService.updateMoney(userMoney).then(rsp => {
                    $rootScope.account.money = rsp.data.money;
                    localStorageService.set('account', $rootScope.account);
                });
                betService.placeBet(scope.bet).then(rsp => {
                    scope.getBets();
                    // Send to server an impulse that I placed a bet
                    socketService.socketEmit('newBet', 1);
                });
            };

            socketService.socketOn('newBet', resp => {
                scope.getBets();
            });
        }
    };
};

gameComponent.$inject = ['$rootScope', 'gameService', 'accService', 'betService', 'localStorageService', 'socketService'];

angular.module('berger').directive('game', gameComponent);

},{}],7:[function(require,module,exports){
class loginController {
    constructor($location, localStorageService) {
        // Shared properties throughout the application
        if (localStorageService.get('account')) $location.path('/manager');
    }
}

loginController.$inject = ['$location', 'localStorageService'];

angular.module('berger').controller('loginController', loginController);

},{}],8:[function(require,module,exports){
const loginDirective = (accService, $rootScope, $location, localStorageService, $mdDialog) => {
    return {
        templateUrl: 'components/login/login.html',
        restrict: 'E',
        link: scope => {
            scope.userSign = {
                username: '',
                password: '',
                type: 0
            };
            scope.userLogin = {
                username: '',
                password: '',
                status: 1
            };
            scope.accounts = [];
            scope.refreshAccs = () => {
                accService.getLatestAccs().then(rsp => {
                    scope.accounts = rsp.data;
                }, err => {
                    return err;
                });
            };

            scope.refreshAccs();
            scope.login = () => {
                scope.loginLoading = true;
                accService.login(scope.userLogin).then(rsp => {
                    scope.loginLoading = false;
                    if (rsp.data) {
                        $rootScope.account = rsp.data;
                        scope.bad = false;
                        localStorageService.set('account', $rootScope.account);
                        localStorageService.set('loggedIn', true);
                        $location.path('/manager');
                    } else {
                        scope.bad = true;
                    }
                });
            };

            scope.signup = () => {
                scope.signLoading = true;
                accService.createAcc(scope.userSign).then(() => {
                    scope.signLoading = false;
                    scope.refreshAccs();
                });
            };

            scope.showForgot = function (ev) {
                $mdDialog.show($mdDialog.alert().clickOutsideToClose(true).title('Forgot your password?').textContent('Asta ete!').ok('Bine :(').targetEvent(ev));
            };
        }
    };
};

loginDirective.$inject = ['accService', '$rootScope', '$location', 'localStorageService', '$mdDialog'];

angular.module('berger').directive('loginDirective', loginDirective);

},{}],9:[function(require,module,exports){
const messageBox = () => {
	return {
		restrict: 'A',
		templateUrl: 'components/message_box/message-box.html',
		scope: true,
		link: scope => {

			// Initialize the default properties
			scope.messages = [];
			scope.text = 'init value';
			scope.type = 'danger';

			// Populates the message list
			scope.addMessage = () => {
				if (scope.text && scope.type) {
					const msg = {
						text: scope.text,
						type: scope.type
					};
					scope.messages.push(msg);
					scope.text = '';
					scope.type = '';
				}
			};

			// Removes a message by index
			scope.removeMessage = index => {
				scope.messages.splice(index, 1);
			};
		}
	};
};

angular.module('berger').directive('messageBox', messageBox);

},{}],10:[function(require,module,exports){
const myaccNavbar = ($rootScope, accService, localStorageService, $location, socketService) => {
    return {
        templateUrl: 'components/myacc_navbar/myacc-navbar.html',
        restrict: 'E',
        link: scope => {

            scope.account = $rootScope.account;

            scope.logout = () => {
                scope.logoutLoading = true;
                scope.account.status = 0;
                accService.login(scope.account).then(rsp => {
                    scope.logoutLoading = false;
                    if (rsp.data) {
                        $rootScope.account = null;
                        localStorageService.clearAll();
                        $location.path('/login');
                    } else {
                        //something..
                    }
                });
            };

            socketService.socketOn('newBet', resp => {
                scope.userRefresh = {
                    username: scope.account.username,
                    password: scope.account.password,
                    status: 1
                };
                accService.login(scope.userRefresh).then(resp => {
                    $rootScope.account = resp.data;
                    localStorageService.set('account', $rootScope.account);
                    scope.account = $rootScope.account;
                });
            });

            socketService.socketOn('updateMoney', resp => {
                scope.userRefresh = {
                    username: scope.account.username,
                    password: scope.account.password,
                    status: 1
                };
                accService.login(scope.userRefresh).then(resp => {
                    $rootScope.account = resp.data;
                    localStorageService.set('account', $rootScope.account);
                    scope.account = $rootScope.account;
                });
            });
        }
    };
};

myaccNavbar.$inject = ['$rootScope', 'accService', 'localStorageService', '$location', 'socketService'];

angular.module('berger').directive('myaccNavbar', myaccNavbar);

},{}],11:[function(require,module,exports){
const paginationComponent = ($rootScope, competitionService) => {
    return {
        templateUrl: 'components/pagination/pagination.html',
        restrict: 'E',
        scope: {
            competitions: '=',
            competitionId: '=',
            allGames: '=',
            filteredGames: '='
        },
        link: scope => {
            // Get the current competition
            scope.competition = scope.competitions.filter(obj => {
                return obj._id === scope.competitionId;
            })[0];

            // Create array for listing the rounds in the header of the stadings table
            if (scope.competition) scope.competitionRounds = new Array(scope.competition.rounds);

            // Returns another result set of games
            scope.getNewGameSet = round => {
                scope.filteredGames = scope.allGames.filter(obj => {
                    return obj.round === round;
                });
            };
            if (scope.competition) scope.getNewGameSet(scope.competition.current_round);

            $rootScope.$on('gameFinished', () => {
                competitionService.getCompetition().then(rsp => {
                    scope.competitions = rsp.data;
                    // Get the current competition
                    scope.competition = scope.competitions.filter(obj => {
                        return obj._id === scope.competitionId;
                    })[0];
                    if (scope.competition) scope.getNewGameSet(scope.competition.current_round);
                });
            });
        }
    };
};

paginationComponent.$inject = ['$rootScope', 'competitionService'];

angular.module('berger').directive('pagination', paginationComponent);

},{}],12:[function(require,module,exports){
const rainWithIcons = $timeout => {
	return {
		restrict: 'A',
		scope: true,
		link: (scope, element) => {

			// Generates a random int between two numbers
			scope.getRandomInt = (min, max) => {
				min = Math.ceil(min);
				max = Math.floor(max);
				return Math.floor(Math.random() * (max - min)) + min;
			};

			// Generates a random int between two numbers
			scope.getRandomArbitrary = (min, max) => {
				return Math.random() * (max - min) + min;
			};

			// Set timeout so we have the element data
			$timeout(() => {

				// Constants here 
				const listOfIcons = ['glyphicon-asterisk', 'glyphicon-plus', 'glyphicon-euro', 'glyphicon-minus', 'glyphicon-cloud', 'glyphicon-envelope', 'glyphicon-pencil', 'glyphicon-glass', 'glyphicon-music', 'glyphicon-search', 'glyphicon-heart', 'glyphicon-star'];
				const attachElem = angular.element(element);
				const elementWidth = attachElem[0].clientWidth;
				const elementHeight = attachElem[0].clientHeight;

				// Check how many element fit in one line
				let numberOfElementsWidth = parseInt(elementWidth / 20);
				let numberOfElementsHeight = parseInt(elementHeight / 20);

				attachElem.addClass('rain-emoji-block');
				const backElem = angular.element('<div class="rain-emoji-block__background"></div>');

				// Iterate through the list of icons and add them to the rain-emoji div
				for (let h = 0; h < numberOfElementsHeight; h++) {
					for (let i = 0; i < numberOfElementsWidth; i++) {
						const random = scope.getRandomInt(0, listOfIcons.length);
						const iconElm = angular.element(`<span class="glyphicon ${listOfIcons[random]}"></span>`);
						const leftMargin = i * 20;
						const animationDelay = scope.getRandomArbitrary(h, h + 3);
						const color = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
						iconElm.css('left', `${leftMargin}px`);
						iconElm.css('color', `${color}`);
						iconElm.css('animation-delay', `${animationDelay}s`);
						iconElm.css('animation-duration', `${parseInt(elementHeight / 50) * 2}s`);
						backElem.append(iconElm);
					}
				}

				// Insert the rain-emoji div into the target element
				// MAKE IT RAIN!!! :D
				attachElem.append(backElem);
			}, 1000);
		}
	};
};

rainWithIcons.$inject = ['$timeout'];

angular.module('berger').directive('rainWithIcons', rainWithIcons);

},{}],13:[function(require,module,exports){
const standingsComponent = $uibModal => {
    return {
        templateUrl: 'components/standings/standings.html',
        restrict: 'E',
        scope: {
            games: '=',
            players: '=',
            competitions: '=',
            competitionId: '='
        },
        link: scope => {
            // Returns the current competition based on the current tab
            scope.returnCompetition = () => {
                return scope.competitions.filter(obj => {
                    return obj._id === scope.competitionId;
                })[0];
            };

            // Make the calculation here
            scope.calculateStandings = () => {
                let stdObj = {};
                for (let i = 0; i < scope.games.length; i++) {
                    const obj = scope.games[i];
                    if (typeof stdObj[obj.p1_id] === 'undefined') {
                        stdObj[obj.p1_id] = {};
                        stdObj[obj.p1_id].rounds = {};
                        stdObj[obj.p1_id].score = 0;
                    }
                    if (typeof stdObj[obj.p2_id] === 'undefined') {
                        stdObj[obj.p2_id] = {};
                        stdObj[obj.p2_id].rounds = {};
                        stdObj[obj.p2_id].score = 0;
                    }

                    if (obj.status !== 0) {
                        let p1GameScore = 0;
                        let p2GameScore = 0;
                        if (obj.status === 2) {
                            stdObj[obj.p1_id].score += .5;
                            stdObj[obj.p2_id].score += .5;
                            p1GameScore = .5;
                            p2GameScore = .5;
                        } else if (obj.status === 1) {
                            stdObj[obj.p1_id].score += 1;
                            p1GameScore = 1;
                        } else {
                            stdObj[obj.p2_id].score += 1;
                            p2GameScore = 1;
                        }
                        stdObj[obj.p1_id].rounds[obj.round] = p1GameScore + '' + (obj.p1_color == 0 ? 'w' : 'b');
                        stdObj[obj.p2_id].rounds[obj.round] = p2GameScore + '' + (obj.p2_color == 0 ? 'w' : 'b');
                    } else {
                        stdObj[obj.p1_id].rounds[obj.round] = '-';
                        stdObj[obj.p2_id].rounds[obj.round] = '-';
                    }
                }

                const sorted = Object.keys(stdObj).sort((a, b) => {
                    return stdObj[b].score - stdObj[a].score;
                });

                const finalStats = {};
                for (let i = 0; i < sorted.length; i++) {
                    finalStats[sorted[i]] = stdObj[sorted[i]];
                }

                return finalStats;
            };

            // Open the modal that contains the stading table here
            scope.open = () => {
                const modalInstance = $uibModal.open({
                    templateUrl: 'standingsModal.html',
                    controller: ($scope, $uibModalInstance) => {
                        // Calculate standings when we open modal
                        $scope.standings = scope.calculateStandings();

                        // Get the current competition details
                        $scope.competition = scope.returnCompetition();

                        // Create array for listing the rounds in the header of the stadings table
                        $scope.competitionRounds = new Array($scope.competition.rounds);

                        // Returns the player by a specific id
                        $scope.getPlayerById = id => {
                            return scope.players.filter(obj => {
                                return obj._id === id;
                            })[0];
                        };

                        // When we hit the ok button
                        $scope.ok = () => {
                            $uibModalInstance.close();
                        };

                        // When we hit the cancel button
                        $scope.cancel = () => {
                            $uibModalInstance.dismiss('cancel');
                        };
                    }
                });

                modalInstance.result.then(() => {
                    // Manage when we hit the ok button
                    console.log('oki doki');
                }, () => {
                    // Manage when we hit the cancel button
                    console.log('oki doki cancel doki');
                });
            };
        }
    };
};

standingsComponent.$inject = ['$uibModal'];

angular.module('berger').directive('standings', standingsComponent);

},{}],14:[function(require,module,exports){
const tableComponent = () => {
    return {
        templateUrl: 'components/table/table-component.html',
        restrict: 'E',
        scope: {
            tableTitle: '@',
            tableHeaders: '=',
            tableKeys: '=',
            tableBody: '='
        },
        link: scope => {}
    };
};

tableComponent.$inject = [];

angular.module('berger').directive('tableComponent', tableComponent);

},{}],15:[function(require,module,exports){
let _$http;

class accService {
    constructor($http) {
        _$http = $http;
    }

    createAcc(accData) {
        const configObject = {
            method: 'POST',
            url: '/acc',
            data: JSON.stringify(accData)
        };
        return _$http(configObject);
    }

    getLatestAccs() {
        const configObject = {
            method: 'GET',
            url: '/acc'
        };
        return _$http(configObject);
    }

    updateMoney(data) {
        const configObject = {
            method: 'PUT',
            url: '/accmoney',
            data: JSON.stringify(data)
        };
        return _$http(configObject);
    }

    login(data) {
        const configObject = {
            method: 'PUT',
            url: '/acc',
            data: JSON.stringify(data)
        };
        return _$http(configObject);
    }

    deleteAcc(id) {
        const promise = _$http({
            method: 'DELETE',
            url: '/acc',
            data: { _id: id },
            headers: { 'Content-Type': 'application/json;charset=utf-8' }
        });
        // Return the promise to the controller
        return promise;
    }
}

accService.$inject = ['$http'];

angular.module('berger').service('accService', accService);

},{}],16:[function(require,module,exports){
let _$http;

class betService {
    constructor($http) {
        _$http = $http;
    }

    placeBet(betData) {
        const configObject = {
            method: 'POST',
            url: '/bet',
            data: JSON.stringify(betData)
        };
        return _$http(configObject);
    }

    getBetsForUser(userid) {
        const configObject = {
            method: 'GET',
            url: '/bet/user/' + userid
        };
        return _$http(configObject);
    }

    getBetsForGame(data) {
        const configObject = {
            method: 'PUT',
            url: '/bet',
            data: JSON.stringify(data)
        };
        return _$http(configObject);
    }

    getAllBetsForGame(gameId) {
        const configObject = {
            method: 'GET',
            url: '/bet/' + gameId
        };
        return _$http(configObject);
    }

    updateAllBetsForGame(result) {
        const configObject = {
            method: 'PUT',
            url: '/bet/' + result.gameId,
            data: JSON.stringify(result)
        };
        return _$http(configObject);
    }

    // updateMoney(data){
    //     const configObject = {
    //         method: 'PUT',
    //         url: '/accmoney',
    //         data: JSON.stringify(data)
    //     };
    //     return _$http(configObject);
    // }

    // login(data) {
    //     const configObject = {
    //         method: 'PUT',
    //         url: '/acc',
    //         data: JSON.stringify(data)
    //     };
    //     return _$http(configObject);
    // }

    // deleteBet(id) {
    //     const promise = _$http({
    //             method: 'DELETE',
    //             url: '/bet',
    //             data: { _id: id },
    //             headers: { 'Content-Type': 'application/json;charset=utf-8' }
    //         });
    //     // Return the promise to the controller
    //     return promise;
    // }
}

betService.$inject = ['$http'];

angular.module('berger').service('betService', betService);

},{}],17:[function(require,module,exports){
let _$http;

class competitionService {
    constructor($http) {
        _$http = $http;
    }

    addCompetition(competitionSettings) {
        // Make a default configuration object for 'POST' request
        // in order to create a step for a specific case
        const configObject = {
            method: 'POST',
            url: '/competition',
            data: competitionSettings
        };

        // Make the request using $http service
        // Return promise
        return _$http(configObject);
    }

    getCompetition() {
        const configObject = {
            method: 'GET',
            url: '/competition'
        };
        return _$http(configObject);
    }

    deleteCompetition(id) {
        const promise = _$http({
            method: 'DELETE',
            url: '/competition',
            data: { _id: id },
            headers: { 'Content-Type': 'application/json;charset=utf-8' }
        });
        // Return the promise to the controller
        return promise;
    }
}

competitionService.$inject = ['$http'];

angular.module('berger').service('competitionService', competitionService);
'';

},{}],18:[function(require,module,exports){
let _$http;
let _games;

class gameService {
    constructor($http) {
        _$http = $http;
        _games = [];
    }

    getGames(compId) {
        const configObject = {
            method: 'GET',
            url: `/game/${compId}`
        };
        return _$http(configObject);
    }

    endGame(data) {
        const configObject = {
            method: 'PUT',
            url: '/game',
            data: JSON.stringify(data)
        };
        return _$http(configObject);
    }

}

gameService.$inject = ['$http'];

angular.module('berger').service('gameService', gameService);

},{}],19:[function(require,module,exports){
let _$http;
let _players;

class playerService {
    constructor($http) {
        _$http = $http;
        _players = [];
    }

    addPlayer(playerData) {
        const configObject = {
            method: 'POST',
            url: '/player',
            data: JSON.stringify(playerData)
        };
        return _$http(configObject);
    }

    getPlayers() {
        const configObject = {
            method: 'GET',
            url: '/player'
        };
        return _$http(configObject);
    }

    deletePlayer(id) {
        const promise = _$http({
            method: 'DELETE',
            url: '/player',
            data: { _id: id },
            headers: { 'Content-Type': 'application/json;charset=utf-8' }
        });
        // Return the promise to the controller
        return promise;
    }
}

playerService.$inject = ['$http'];

angular.module('berger').service('playerService', playerService);

},{}],20:[function(require,module,exports){
angular.module('berger').service('socketService', function () {

	this._socket = null;
	var obj = {
		registerSocket: function () {
			// this._socket = io('http://localhost:3000');
			this._socket = io.connect();
		},

		unregisterSocket: function () {
			if (this._socket) {
				this._socket.disconnect();
				this._socket = null;
			}
		},

		socketOn: function (eventName, cb) {
			if (!eventName) {
				throw new Error('Must provide an event to emit for');
			}

			if (!cb || typeof cb !== 'function') {
				throw new Error('Must provide a callback for the socket event listener');
			}
			this._socket.on(eventName, cb);
		},

		socketEmit: function (eventName, data) {
			if (!eventName) {
				throw new Error('Must provide an event to emit for');
			}
			this._socket.emit(eventName, data);
		}
	};
	return obj;
});

},{}]},{},[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]);