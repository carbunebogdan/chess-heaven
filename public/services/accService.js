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

    getAccData(accData){
        const configObject = {
            method: 'GET',
            url:'/acc/'+accData
        }
        return _$http(configObject);
    }

    activateAcc(accData){
        const configObject = {
            method: 'PUT',
            url: '/activate',
            data: JSON.stringify(accData)
        };
        return _$http(configObject);
    }

    sendCode(accData){
        const configObject = {
            method: 'POST',
            url: '/activate',
            data: JSON.stringify(accData)
        };
        return _$http(configObject);
    }

    getPlayerById(data){
        const configObject = {
            method: 'GET',
            url: '/players/'+data.id
        };
        return _$http(configObject);
    }

    updatePlayerStatus(data){
        const configObject = {
            method:'PUT',
            url: '/players/',
            data: JSON.stringify(data)
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

    getPlayers(){
        const configObject = {
            method: 'POST',
            url: '/players'
        };
        return _$http(configObject);
    }

    updateMoney(data){
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
