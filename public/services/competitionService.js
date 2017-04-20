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
''