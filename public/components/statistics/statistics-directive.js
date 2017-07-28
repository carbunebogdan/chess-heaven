const statisticsDirective = () => {
    return {
        templateUrl: 'components/statistics/statistics.html',
        restrict: 'E',
        link: (scope) => {
            
        }
    };
};

statisticsDirective.$inject = [];

angular.module('berger').directive('statisticsDirective', statisticsDirective);

