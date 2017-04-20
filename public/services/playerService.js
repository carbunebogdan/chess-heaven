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
