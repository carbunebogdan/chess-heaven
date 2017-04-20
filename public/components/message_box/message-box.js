const messageBox = () => {
	return {
		restrict: 'A',
		templateUrl: 'components/message_box/message-box.html',
		scope: true,
		link: (scope) => {

			// Initialize the default properties
			scope.messages = [];
			scope.text = 'init value';
			scope.type = 'danger';

			// Populates the message list
			scope.addMessage = () => {
				if (scope.text && scope.type) {
					const msg = {
						text: scope.text,
						type: scope.type,
					}
					scope.messages.push(msg);
					scope.text = '';
					scope.type = '';
				}
			}

			// Removes a message by index
			scope.removeMessage = (index) => {
				scope.messages.splice(index, 1);
			}
		}
	}
}

angular.module('berger').directive('messageBox', messageBox);