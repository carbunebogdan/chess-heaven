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
            url: `/game/`+compId
        };
        return _$http(configObject);
    }

    getGameById(id){
        const configObject = {
            method: 'GET',
            url: '/gameById/'+id
        };
        return _$http(configObject);
    }

    endGame(data) {
        const configObject = {
            method: 'PUT',
            url: '/game',
            data: JSON.stringify(data),
        };
        return _$http(configObject);
    }

}

gameService.$inject = ['$http'];

angular.module('berger').service('gameService', gameService);
