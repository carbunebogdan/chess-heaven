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
            url: '/bet/user/'+userid
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

    getAllBetsForGame(gameId){
        const configObject = {
            method: 'GET',
            url: '/bet/'+gameId
        };
        return _$http(configObject);
    }

    updateAllBetsForGame(result){
        const configObject = {
            method: 'PUT',
            url: '/bet/'+result.gameId,
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
