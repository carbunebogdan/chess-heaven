angular.module('berger').service('socketService', function(){

	this._socket = null;
	var obj = {
		registerSocket() {
	        // this._socket = io('http://localhost:3000');
	        this._socket = io.connect();
	    },

	    unregisterSocket() {
	        if (this._socket) {
	            this._socket.disconnect();
	            this._socket = null;
	        }
	    },

	    socketOn(eventName, cb) {
	        if (!eventName) {
	            throw new Error('Must provide an event to emit for');
	        }

	        if (!cb || typeof cb !== 'function') {
	            throw new Error('Must provide a callback for the socket event listener');
	        }
	        this._socket.on(eventName, cb);
	    },

	    socketEmit(eventName, data) {
	        if (!eventName) {
	            throw new Error('Must provide an event to emit for');
	        }
	        this._socket.emit(eventName, data);

	    }
	};
	return obj;
});
