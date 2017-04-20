const rainWithIcons = ($timeout) => {
	return {
		restrict: 'A',
		scope: true,
		link: (scope, element) => {

			// Generates a random int between two numbers
			scope.getRandomInt = (min, max) => {
				min = Math.ceil(min);
				max = Math.floor(max);
				return Math.floor(Math.random() * (max - min)) + min;
			}

			// Generates a random int between two numbers
			scope.getRandomArbitrary = (min, max) => {
		  		return Math.random() * (max - min) + min;
			}

			// Set timeout so we have the element data
			$timeout(() => {

				// Constants here 
				const listOfIcons = [
					'glyphicon-asterisk',
					'glyphicon-plus',
					'glyphicon-euro',
					'glyphicon-minus',
					'glyphicon-cloud',
					'glyphicon-envelope',
					'glyphicon-pencil',
					'glyphicon-glass',
					'glyphicon-music',
					'glyphicon-search',
					'glyphicon-heart',
					'glyphicon-star',
				];
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
						const random  = scope.getRandomInt(0, listOfIcons.length);
						const iconElm = angular.element(`<span class="glyphicon ${listOfIcons[random]}"></span>`);
						const leftMargin = i * 20;
						const animationDelay = scope.getRandomArbitrary(h, h+3);
						const color = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
						iconElm.css('left', `${leftMargin}px`);
						iconElm.css('color', `${color}`);
						iconElm.css('animation-delay', `${animationDelay}s`);
						iconElm.css('animation-duration', `${parseInt(elementHeight/50) * 2}s`);
						backElem.append(iconElm);
					}
				}

				// Insert the rain-emoji div into the target element
				// MAKE IT RAIN!!! :D
				attachElem.append(backElem);
			}, 1000);
		}
	}
}

rainWithIcons.$inject = ['$timeout'];

angular.module('berger').directive('rainWithIcons', rainWithIcons);