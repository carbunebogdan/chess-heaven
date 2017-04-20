class loginController{
    constructor($location,localStorageService) {
    	// Shared properties throughout the application
        if(localStorageService.get('account')) 
        $location.path('/manager');
        

       
    }
}

loginController.$inject = ['$location','localStorageService'];

angular.module('berger').controller('loginController', loginController);
