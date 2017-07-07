const gamePlatform = () => {
	return {
		templateUrl: 'components/game_platform/game-platform.html',
		restrict: 'E',
		link: (scope) => {

			var game= new Chess();

			// do not pick up pieces if the game is over
			// only pick up pieces for White
			var onDragStart = function(source, piece, position, orientation) {
			  if (game.in_checkmate() === true || game.in_draw() === true ||
			    piece.search(/^b/) !== -1) {
			    return false;
			  }
			};
			var onDrop = function(source, target) {
				console.log(source);
				console.log(target);
			  // see if the move is legal
			  var move = game.move({
			    from: source,
			    to: target,
			    promotion: 'q' // NOTE: always promote to a queen for example simplicity
			  });

			  // illegal move
			  if (move === null) return 'snapback';


			};

			scope.source='';
			scope.target='';
			scope.setpos=(source,target)=>{
				console.log('begin move');
				console.log(source);
				console.log(target);
				board.move(source+'-'+target);
				scope.source=scope.target;
				scope.target='';
				console.log('end move');
			}

			// update the board position after the piece snap
			// for castling, en passant, pawn promotion
			var onSnapEnd = function() {
			  board.position(game.fen(),true);
			  console.log(game.fen());
			};

			var cfg = {
			  draggable: true,
			  position: 'start',
			  onDragStart: onDragStart,
			  onDrop: onDrop,
			  onSnapEnd: onSnapEnd,
			  showNotation: true
			};

			
			var board = ChessBoard('#board',cfg);
		
		}
	}
}

gamePlatform.$inject = [];

angular.module('berger').directive('gamePlatform', gamePlatform);