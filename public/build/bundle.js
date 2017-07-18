(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const addCompetition = (competitionService, socketService) => {
    return {
        templateUrl: 'components/add_competition/add-competition.html',
        restrict: 'E',
        link: scope => {

            // General properties
            scope.competition = {
                name: '',
                players: []
            };

            // Adds a new player
            scope.addCompetition = () => {
                if (scope.competition.name && scope.competition.players) {
                    competitionService.addCompetition(scope.competition).then(() => {
                        competitionService.getCompetition().then(resp => {

                            // Update competitions data
                            scope.contCtrl.competitions = resp.data;

                            // General properties
                            scope.competition = {
                                name: '',
                                players: []
                            };

                            // Reset the form after success
                            scope.formModel.$setPristine();
                            scope.formModel.$setUntouched();

                            // Send to server an impulse that we've added the competition
                            socketService.socketEmit('newCompetition', 1);
                        });
                    });
                }
            };
        }
    };
};

addCompetition.$inject = ['competitionService', 'socketService'];

angular.module('berger').directive('addCompetition', addCompetition);

},{}],2:[function(require,module,exports){
const addUsers = playerService => {
    return {
        templateUrl: 'components/add_users/add-users.html',
        restrict: 'E',
        link: scope => {

            // General properties
            scope.player = {
                name: '',
                email: '',
                club: ''
            };

            // Adds a new player
            scope.addPlayer = () => {
                if (scope.player.name && scope.player.email) {

                    // What is a promise Pava? a a a?
                    playerService.addPlayer(scope.player).then(() => {
                        playerService.getPlayers().then(resp => {

                            // Update players data
                            scope.contCtrl.players = resp.data;

                            // Reset player model
                            scope.player = {
                                name: '',
                                email: '',
                                club: ''
                            };

                            // Reset the form after success
                            scope.formModel.$setPristine();
                            scope.formModel.$setUntouched();
                        });
                    });
                }
            };
        }
    };
};

addUsers.$inject = ['playerService'];

angular.module('berger').directive('addUsers', addUsers);

},{}],3:[function(require,module,exports){
class chatController {
        constructor($location, $rootScope, localStorageService, socketService, accService) {
                // Register socket
                socketService.registerSocket();

                if (!$rootScope.account) {
                        $rootScope.account = localStorageService.get('account');
                }

                if (!$rootScope.account) {
                        $location.path('/login');
                }

                $rootScope.actives = [];
                accService.getActive().then(rsp => {
                        $rootScope.actives = rsp.data;
                });

                // Watch for socket incoming data
                socketService.socketOn('account', () => {
                        accService.getActive().then(rsp => {
                                $rootScope.actives = rsp.data;
                        });
                });

                $rootScope.messages = [{
                        sender: 'robo',
                        message: 'Salut! Bine ai venit!'
                }];
        }
}

chatController.$inject = ['$location', '$rootScope', 'localStorageService', 'socketService', 'accService'];
angular.module('berger').controller('chatController', chatController);

},{}],4:[function(require,module,exports){
const chatDirective = ($rootScope, socketService, $window, accService, localStorageService) => {
    return {
        templateUrl: 'components/chat/chat.html',
        restrict: 'E',
        link: scope => {
            scope.messages = [{
                sender: 'master',
                message: 'The game is on!'
            }];

            scope.account = $rootScope.account;
            scope.message = {
                sender: $rootScope.account.username,
                message: ''
            };
            var scrollChat = () => {
                var chat = document.getElementById('chat');
                $('#chat').animate({
                    scrollTop: chat.scrollHeight
                }, 300);
            };

            scope.onExit = () => {
                scope.message = {
                    sender: $rootScope.account.username,
                    message: $rootScope.account.username + ' left..'
                };
                scope.send();
                scope.account.status = 0;
                localStorageService.set('account', scope.account);
                socketService.socketEmit('account', scope.account);
            };

            $window.onbeforeunload = scope.onExit;

            scope.changeTitle = () => {
                document.title = 'Chess Heaven';
            };
            scope.send = () => {
                if (scope.message.message != '') {
                    scope.messages.push(scope.message);
                    scrollChat();
                    socketService.socketEmit('newMessage', scope.message);

                    scope.message = {
                        sender: $rootScope.account.username,
                        message: ''
                    };
                }
            };

            // Watch for socket incoming messages
            socketService.socketOn('newMessage', rsp => {
                if (rsp.source.sender != $rootScope.account.username) {
                    scope.messages.push(rsp.source);
                    scope.$apply();
                    scrollChat();
                }
            });
        }
    };
};

chatDirective.$inject = ['$rootScope', 'socketService', '$window', 'accService', 'localStorageService'];

angular.module('berger').directive('chatDirective', chatDirective);

},{}],5:[function(require,module,exports){
/*!
 * chessboard.js v0.3.0
 *
 * Copyright 2013 Chris Oakman
 * Released under the MIT license
 * http://chessboardjs.com/license
 *
 * Date: 10 Aug 2013
 */

// start anonymous scope
;(function () {
  'use strict';

  //------------------------------------------------------------------------------
  // Chess Util Functions
  //------------------------------------------------------------------------------

  var COLUMNS = 'abcdefgh'.split('');

  function validMove(move) {
    // move should be a string
    if (typeof move !== 'string') return false;

    // move should be in the form of "e2-e4", "f6-d5"
    var tmp = move.split('-');
    if (tmp.length !== 2) return false;

    return validSquare(tmp[0]) === true && validSquare(tmp[1]) === true;
  }

  function validSquare(square) {
    if (typeof square !== 'string') return false;
    return square.search(/^[a-h][1-8]$/) !== -1;
  }

  function validPieceCode(code) {
    if (typeof code !== 'string') return false;
    return code.search(/^[bw][KQRNBP]$/) !== -1;
  }

  // TODO: this whole function could probably be replaced with a single regex
  function validFen(fen) {
    if (typeof fen !== 'string') return false;

    // cut off any move, castling, etc info from the end
    // we're only interested in position information
    fen = fen.replace(/ .+$/, '');

    // FEN should be 8 sections separated by slashes
    var chunks = fen.split('/');
    if (chunks.length !== 8) return false;

    // check the piece sections
    for (var i = 0; i < 8; i++) {
      if (chunks[i] === '' || chunks[i].length > 8 || chunks[i].search(/[^kqrbnpKQRNBP1-8]/) !== -1) {
        return false;
      }
    }

    return true;
  }

  function validPositionObject(pos) {
    if (typeof pos !== 'object') return false;

    for (var i in pos) {
      if (pos.hasOwnProperty(i) !== true) continue;

      if (validSquare(i) !== true || validPieceCode(pos[i]) !== true) {
        return false;
      }
    }

    return true;
  }

  // convert FEN piece code to bP, wK, etc
  function fenToPieceCode(piece) {
    // black piece
    if (piece.toLowerCase() === piece) {
      return 'b' + piece.toUpperCase();
    }

    // white piece
    return 'w' + piece.toUpperCase();
  }

  // convert bP, wK, etc code to FEN structure
  function pieceCodeToFen(piece) {
    var tmp = piece.split('');

    // white piece
    if (tmp[0] === 'w') {
      return tmp[1].toUpperCase();
    }

    // black piece
    return tmp[1].toLowerCase();
  }

  // convert FEN string to position object
  // returns false if the FEN string is invalid
  function fenToObj(fen) {
    if (validFen(fen) !== true) {
      return false;
    }

    // cut off any move, castling, etc info from the end
    // we're only interested in position information
    fen = fen.replace(/ .+$/, '');

    var rows = fen.split('/');
    var position = {};

    var currentRow = 8;
    for (var i = 0; i < 8; i++) {
      var row = rows[i].split('');
      var colIndex = 0;

      // loop through each character in the FEN section
      for (var j = 0; j < row.length; j++) {
        // number / empty squares
        if (row[j].search(/[1-8]/) !== -1) {
          var emptySquares = parseInt(row[j], 10);
          colIndex += emptySquares;
        }
        // piece
        else {
            var square = COLUMNS[colIndex] + currentRow;
            position[square] = fenToPieceCode(row[j]);
            colIndex++;
          }
      }

      currentRow--;
    }

    return position;
  }

  // position object to FEN string
  // returns false if the obj is not a valid position object
  function objToFen(obj) {
    if (validPositionObject(obj) !== true) {
      return false;
    }

    var fen = '';

    var currentRow = 8;
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        var square = COLUMNS[j] + currentRow;

        // piece exists
        if (obj.hasOwnProperty(square) === true) {
          fen += pieceCodeToFen(obj[square]);
        }

        // empty space
        else {
            fen += '1';
          }
      }

      if (i !== 7) {
        fen += '/';
      }

      currentRow--;
    }

    // squeeze the numbers together
    // haha, I love this solution...
    fen = fen.replace(/11111111/g, '8');
    fen = fen.replace(/1111111/g, '7');
    fen = fen.replace(/111111/g, '6');
    fen = fen.replace(/11111/g, '5');
    fen = fen.replace(/1111/g, '4');
    fen = fen.replace(/111/g, '3');
    fen = fen.replace(/11/g, '2');

    return fen;
  }

  window['ChessBoard'] = window['ChessBoard'] || function (containerElOrId, cfg) {
    'use strict';

    cfg = cfg || {};

    //------------------------------------------------------------------------------
    // Constants
    //------------------------------------------------------------------------------

    var MINIMUM_JQUERY_VERSION = '1.7.0',
        START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
        START_POSITION = fenToObj(START_FEN);

    // use unique class names to prevent clashing with anything else on the page
    // and simplify selectors
    var CSS = {
      alpha: 'alpha-d2270',
      black: 'black-3c85d',
      board: 'board-b72b1',
      chessboard: 'chessboard-63f37',
      clearfix: 'clearfix-7da63',
      highlight1: 'highlight1-32417',
      highlight2: 'highlight2-9c5d2',
      notation: 'notation-322f9',
      numeric: 'numeric-fc462',
      piece: 'piece-417db',
      row: 'row-5277c',
      sparePieces: 'spare-pieces-7492f',
      sparePiecesBottom: 'spare-pieces-bottom-ae20f',
      sparePiecesTop: 'spare-pieces-top-4028b',
      square: 'square-55d63',
      white: 'white-1e1d7'
    };

    //------------------------------------------------------------------------------
    // Module Scope Variables
    //------------------------------------------------------------------------------

    // DOM elements
    var containerEl, boardEl, draggedPieceEl, sparePiecesTopEl, sparePiecesBottomEl;

    // constructor return object
    var widget = {};

    //------------------------------------------------------------------------------
    // Stateful
    //------------------------------------------------------------------------------

    var ANIMATION_HAPPENING = false,
        BOARD_BORDER_SIZE = 2,
        CURRENT_ORIENTATION = 'white',
        CURRENT_POSITION = {},
        SQUARE_SIZE,
        DRAGGED_PIECE,
        DRAGGED_PIECE_LOCATION,
        DRAGGED_PIECE_SOURCE,
        DRAGGING_A_PIECE = false,
        SPARE_PIECE_ELS_IDS = {},
        SQUARE_ELS_IDS = {},
        SQUARE_ELS_OFFSETS;

    //------------------------------------------------------------------------------
    // JS Util Functions
    //------------------------------------------------------------------------------

    // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
    function createId() {
      return 'xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx'.replace(/x/g, function (c) {
        var r = Math.random() * 16 | 0;
        return r.toString(16);
      });
    }

    function deepCopy(thing) {
      return JSON.parse(JSON.stringify(thing));
    }

    function parseSemVer(version) {
      var tmp = version.split('.');
      return {
        major: parseInt(tmp[0], 10),
        minor: parseInt(tmp[1], 10),
        patch: parseInt(tmp[2], 10)
      };
    }

    // returns true if version is >= minimum
    function compareSemVer(version, minimum) {
      version = parseSemVer(version);
      minimum = parseSemVer(minimum);

      var versionNum = version.major * 10000 * 10000 + version.minor * 10000 + version.patch;
      var minimumNum = minimum.major * 10000 * 10000 + minimum.minor * 10000 + minimum.patch;

      return versionNum >= minimumNum;
    }

    //------------------------------------------------------------------------------
    // Validation / Errors
    //------------------------------------------------------------------------------

    function error(code, msg, obj) {
      // do nothing if showErrors is not set
      if (cfg.hasOwnProperty('showErrors') !== true || cfg.showErrors === false) {
        return;
      }

      var errorText = 'ChessBoard Error ' + code + ': ' + msg;

      // print to console
      if (cfg.showErrors === 'console' && typeof console === 'object' && typeof console.log === 'function') {
        console.log(errorText);
        if (arguments.length >= 2) {
          console.log(obj);
        }
        return;
      }

      // alert errors
      if (cfg.showErrors === 'alert') {
        if (obj) {
          errorText += '\n\n' + JSON.stringify(obj);
        }
        window.alert(errorText);
        return;
      }

      // custom function
      if (typeof cfg.showErrors === 'function') {
        cfg.showErrors(code, msg, obj);
      }
    }

    // check dependencies
    function checkDeps() {
      // if containerId is a string, it must be the ID of a DOM node
      if (typeof containerElOrId === 'string') {
        // cannot be empty
        if (containerElOrId === '') {
          window.alert('ChessBoard Error 1001: ' + 'The first argument to ChessBoard() cannot be an empty string.' + '\n\nExiting...');
          return false;
        }

        // make sure the container element exists in the DOM
        var el = $(containerElOrId);
        if (!el) {
          window.alert('ChessBoard Error 1002: Element with id "' + containerElOrId + '" does not exist in the DOM.' + '\n\nExiting...');
          return false;
        }

        // set the containerEl
        containerEl = $(el);
      }

      // else it must be something that becomes a jQuery collection
      // with size 1
      // ie: a single DOM node or jQuery object
      else {
          containerEl = $(containerElOrId);

          if (containerEl.length !== 1) {
            window.alert('ChessBoard Error 1003: The first argument to ' + 'ChessBoard() must be an ID or a single DOM node.' + '\n\nExiting...');
            return false;
          }
        }

      // JSON must exist
      if (!window.JSON || typeof JSON.stringify !== 'function' || typeof JSON.parse !== 'function') {
        window.alert('ChessBoard Error 1004: JSON does not exist. ' + 'Please include a JSON polyfill.\n\nExiting...');
        return false;
      }

      // check for a compatible version of jQuery
      if (!(typeof window.$ && $.fn && $.fn.jquery && compareSemVer($.fn.jquery, MINIMUM_JQUERY_VERSION) === true)) {
        window.alert('ChessBoard Error 1005: Unable to find a valid version ' + 'of jQuery. Please include jQuery ' + MINIMUM_JQUERY_VERSION + ' or ' + 'higher on the page.\n\nExiting...');
        return false;
      }

      return true;
    }

    function validAnimationSpeed(speed) {
      if (speed === 'fast' || speed === 'slow') {
        return true;
      }

      if (parseInt(speed, 10) + '' !== speed + '') {
        return false;
      }

      return speed >= 0;
    }

    // validate config / set default options
    function expandConfig() {
      if (typeof cfg === 'string' || validPositionObject(cfg) === true) {
        cfg = {
          position: cfg
        };
      }

      // default for orientation is white
      if (cfg.orientation !== 'black') {
        cfg.orientation = 'white';
      }
      CURRENT_ORIENTATION = cfg.orientation;

      // default for showNotation is true
      if (cfg.showNotation !== false) {
        cfg.showNotation = true;
      }

      // default for draggable is false
      if (cfg.draggable !== true) {
        cfg.draggable = false;
      }

      // default for dropOffBoard is 'snapback'
      if (cfg.dropOffBoard !== 'trash') {
        cfg.dropOffBoard = 'snapback';
      }

      // default for sparePieces is false
      if (cfg.sparePieces !== true) {
        cfg.sparePieces = false;
      }

      // draggable must be true if sparePieces is enabled
      if (cfg.sparePieces === true) {
        cfg.draggable = true;
      }

      // default piece theme is wikipedia
      if (cfg.hasOwnProperty('pieceTheme') !== true || typeof cfg.pieceTheme !== 'string' && typeof cfg.pieceTheme !== 'function') {
        cfg.pieceTheme = '../images/chesspieces/wikipedia/{piece}.png';
      }

      // animation speeds
      if (cfg.hasOwnProperty('appearSpeed') !== true || validAnimationSpeed(cfg.appearSpeed) !== true) {
        cfg.appearSpeed = 200;
      }
      if (cfg.hasOwnProperty('moveSpeed') !== true || validAnimationSpeed(cfg.moveSpeed) !== true) {
        cfg.moveSpeed = 200;
      }
      if (cfg.hasOwnProperty('snapbackSpeed') !== true || validAnimationSpeed(cfg.snapbackSpeed) !== true) {
        cfg.snapbackSpeed = 50;
      }
      if (cfg.hasOwnProperty('snapSpeed') !== true || validAnimationSpeed(cfg.snapSpeed) !== true) {
        cfg.snapSpeed = 25;
      }
      if (cfg.hasOwnProperty('trashSpeed') !== true || validAnimationSpeed(cfg.trashSpeed) !== true) {
        cfg.trashSpeed = 100;
      }

      // make sure position is valid
      if (cfg.hasOwnProperty('position') === true) {
        if (cfg.position === 'start') {
          CURRENT_POSITION = deepCopy(START_POSITION);
        } else if (validFen(cfg.position) === true) {
          CURRENT_POSITION = fenToObj(cfg.position);
        } else if (validPositionObject(cfg.position) === true) {
          CURRENT_POSITION = deepCopy(cfg.position);
        } else {
          error(7263, 'Invalid value passed to config.position.', cfg.position);
        }
      }

      return true;
    }

    //------------------------------------------------------------------------------
    // DOM Misc
    //------------------------------------------------------------------------------

    // calculates square size based on the width of the container
    // got a little CSS black magic here, so let me explain:
    // get the width of the container element (could be anything), reduce by 1 for
    // fudge factor, and then keep reducing until we find an exact mod 8 for
    // our square size
    function calculateSquareSize() {
      var containerWidth = parseInt(containerEl.css('width'), 10);

      // defensive, prevent infinite loop
      if (!containerWidth || containerWidth <= 0) {
        return 0;
      }

      var boardWidth = containerWidth;

      while (boardWidth % 8 !== 0 && boardWidth > 0) {
        boardWidth--;
      }

      return boardWidth / 8;
    }

    // create random IDs for elements
    function createElIds() {
      // squares on the board
      for (var i = 0; i < COLUMNS.length; i++) {
        for (var j = 1; j <= 8; j++) {
          var square = COLUMNS[i] + j;
          SQUARE_ELS_IDS[square] = square + '-' + createId();
        }
      }

      // spare pieces
      var pieces = 'KQRBNP'.split('');
      for (var i = 0; i < pieces.length; i++) {
        var whitePiece = 'w' + pieces[i];
        var blackPiece = 'b' + pieces[i];
        SPARE_PIECE_ELS_IDS[whitePiece] = whitePiece + '-' + createId();
        SPARE_PIECE_ELS_IDS[blackPiece] = blackPiece + '-' + createId();
      }
    }

    //------------------------------------------------------------------------------
    // Markup Building
    //------------------------------------------------------------------------------

    function buildBoardContainer() {
      var html = '<div class="' + CSS.chessboard + '">';

      if (cfg.sparePieces === true) {
        html += '<div class="' + CSS.sparePieces + ' ' + CSS.sparePiecesTop + '"></div>';
      }

      html += '<div class="' + CSS.board + '"></div>';

      if (cfg.sparePieces === true) {
        html += '<div class="' + CSS.sparePieces + ' ' + CSS.sparePiecesBottom + '"></div>';
      }

      html += '</div>';

      return html;
    }

    /*
    var buildSquare = function(color, size, id) {
      var html = '<div class="' + CSS.square + ' ' + CSS[color] + '" ' +
      'style="width: ' + size + 'px; height: ' + size + 'px" ' +
      'id="' + id + '">';
    
      if (cfg.showNotation === true) {
    
      }
    
      html += '</div>';
    
      return html;
    };
    */

    function buildBoard(orientation) {
      if (orientation !== 'black') {
        orientation = 'white';
      }

      var html = '';

      // algebraic notation / orientation
      var alpha = deepCopy(COLUMNS);
      var row = 8;
      if (orientation === 'black') {
        alpha.reverse();
        row = 1;
      }

      var squareColor = 'white';
      for (var i = 0; i < 8; i++) {
        html += '<div class="' + CSS.row + '">';
        for (var j = 0; j < 8; j++) {
          var square = alpha[j] + row;

          html += '<div class="' + CSS.square + ' ' + CSS[squareColor] + ' ' + 'square-' + square + '" ' + 'style="width: ' + SQUARE_SIZE + 'px; height: ' + SQUARE_SIZE + 'px" ' + 'id="' + SQUARE_ELS_IDS[square] + '" ' + 'data-square="' + square + '">';

          html += '</div>'; // end .square

          squareColor = squareColor === 'white' ? 'black' : 'white';
        }
        html += '<div class="' + CSS.clearfix + '"></div></div>';

        squareColor = squareColor === 'white' ? 'black' : 'white';

        if (orientation === 'white') {
          row--;
        } else {
          row++;
        }
      }

      return html;
    }

    function buildPieceImgSrc(piece) {
      if (typeof cfg.pieceTheme === 'function') {
        return cfg.pieceTheme(piece);
      }

      if (typeof cfg.pieceTheme === 'string') {
        return cfg.pieceTheme.replace(/{piece}/g, piece);
      }

      // NOTE: this should never happen
      error(8272, 'Unable to build image source for cfg.pieceTheme.');
      return '';
    }

    function buildPiece(piece, hidden, id) {
      var html = '<img src="' + buildPieceImgSrc(piece) + '" ';
      if (id && typeof id === 'string') {
        html += 'id="' + id + '" ';
      }
      html += 'alt="" ' + 'class="' + CSS.piece + '" ' + 'data-piece="' + piece + '" ' + 'style="width: ' + SQUARE_SIZE + 'px;' + 'height: ' + SQUARE_SIZE + 'px;';
      if (hidden === true) {
        html += 'display:none;';
      }
      html += '" />';

      return html;
    }

    function buildSparePieces(color) {
      var pieces = ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'];
      if (color === 'black') {
        pieces = ['bK', 'bQ', 'bR', 'bB', 'bN', 'bP'];
      }

      var html = '';
      for (var i = 0; i < pieces.length; i++) {
        html += buildPiece(pieces[i], false, SPARE_PIECE_ELS_IDS[pieces[i]]);
      }

      return html;
    }

    //------------------------------------------------------------------------------
    // Animations
    //------------------------------------------------------------------------------

    function animateSquareToSquare(src, dest, piece, completeFn) {
      // get information about the source and destination squares
      var srcSquareEl = $('#' + SQUARE_ELS_IDS[src]);
      var srcSquarePosition = srcSquareEl.offset();
      var destSquareEl = $('#' + SQUARE_ELS_IDS[dest]);
      var destSquarePosition = destSquareEl.offset();

      // create the animated piece and absolutely position it
      // over the source square
      var animatedPieceId = createId();
      $('body').append(buildPiece(piece, true, animatedPieceId));
      var animatedPieceEl = $('#' + animatedPieceId);
      animatedPieceEl.css({
        display: '',
        position: 'absolute',
        top: srcSquarePosition.top,
        left: srcSquarePosition.left
      });

      // remove original piece from source square
      srcSquareEl.find('.' + CSS.piece).remove();

      // on complete
      var complete = function () {
        // add the "real" piece to the destination square
        destSquareEl.append(buildPiece(piece));

        // remove the animated piece
        animatedPieceEl.remove();

        // run complete function
        if (typeof completeFn === 'function') {
          completeFn();
        }
      };

      // animate the piece to the destination square
      var opts = {
        duration: cfg.moveSpeed,
        complete: complete
      };
      animatedPieceEl.animate(destSquarePosition, opts);
    }

    function animateSparePieceToSquare(piece, dest, completeFn) {
      var srcOffset = $('#' + SPARE_PIECE_ELS_IDS[piece]).offset();
      var destSquareEl = $('#' + SQUARE_ELS_IDS[dest]);
      var destOffset = destSquareEl.offset();

      // create the animate piece
      var pieceId = createId();
      $('body').append(buildPiece(piece, true, pieceId));
      var animatedPieceEl = $('#' + pieceId);
      animatedPieceEl.css({
        display: '',
        position: 'absolute',
        left: srcOffset.left,
        top: srcOffset.top
      });

      // on complete
      var complete = function () {
        // add the "real" piece to the destination square
        destSquareEl.find('.' + CSS.piece).remove();
        destSquareEl.append(buildPiece(piece));

        // remove the animated piece
        animatedPieceEl.remove();

        // run complete function
        if (typeof completeFn === 'function') {
          completeFn();
        }
      };

      // animate the piece to the destination square
      var opts = {
        duration: cfg.moveSpeed,
        complete: complete
      };
      animatedPieceEl.animate(destOffset, opts);
    }

    // execute an array of animations
    function doAnimations(a, oldPos, newPos) {
      ANIMATION_HAPPENING = true;

      var numFinished = 0;
      function onFinish() {
        numFinished++;

        // exit if all the animations aren't finished
        if (numFinished !== a.length) return;

        drawPositionInstant();
        ANIMATION_HAPPENING = false;

        // run their onMoveEnd function
        if (cfg.hasOwnProperty('onMoveEnd') === true && typeof cfg.onMoveEnd === 'function') {
          cfg.onMoveEnd(deepCopy(oldPos), deepCopy(newPos));
        }
      }

      for (var i = 0; i < a.length; i++) {
        // clear a piece
        if (a[i].type === 'clear') {
          $('#' + SQUARE_ELS_IDS[a[i].square] + ' .' + CSS.piece).fadeOut(cfg.trashSpeed, onFinish);
        }

        // add a piece (no spare pieces)
        if (a[i].type === 'add' && cfg.sparePieces !== true) {
          $('#' + SQUARE_ELS_IDS[a[i].square]).append(buildPiece(a[i].piece, true)).find('.' + CSS.piece).fadeIn(cfg.appearSpeed, onFinish);
        }

        // add a piece from a spare piece
        if (a[i].type === 'add' && cfg.sparePieces === true) {
          animateSparePieceToSquare(a[i].piece, a[i].square, onFinish);
        }

        // move a piece
        if (a[i].type === 'move') {
          animateSquareToSquare(a[i].source, a[i].destination, a[i].piece, onFinish);
        }
      }
    }

    // returns the distance between two squares
    function squareDistance(s1, s2) {
      s1 = s1.split('');
      var s1x = COLUMNS.indexOf(s1[0]) + 1;
      var s1y = parseInt(s1[1], 10);

      s2 = s2.split('');
      var s2x = COLUMNS.indexOf(s2[0]) + 1;
      var s2y = parseInt(s2[1], 10);

      var xDelta = Math.abs(s1x - s2x);
      var yDelta = Math.abs(s1y - s2y);

      if (xDelta >= yDelta) return xDelta;
      return yDelta;
    }

    // returns an array of closest squares from square
    function createRadius(square) {
      var squares = [];

      // calculate distance of all squares
      for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
          var s = COLUMNS[i] + (j + 1);

          // skip the square we're starting from
          if (square === s) continue;

          squares.push({
            square: s,
            distance: squareDistance(square, s)
          });
        }
      }

      // sort by distance
      squares.sort(function (a, b) {
        return a.distance - b.distance;
      });

      // just return the square code
      var squares2 = [];
      for (var i = 0; i < squares.length; i++) {
        squares2.push(squares[i].square);
      }

      return squares2;
    }

    // returns the square of the closest instance of piece
    // returns false if no instance of piece is found in position
    function findClosestPiece(position, piece, square) {
      // create array of closest squares from square
      var closestSquares = createRadius(square);

      // search through the position in order of distance for the piece
      for (var i = 0; i < closestSquares.length; i++) {
        var s = closestSquares[i];

        if (position.hasOwnProperty(s) === true && position[s] === piece) {
          return s;
        }
      }

      return false;
    }

    // calculate an array of animations that need to happen in order to get
    // from pos1 to pos2
    function calculateAnimations(pos1, pos2) {
      // make copies of both
      pos1 = deepCopy(pos1);
      pos2 = deepCopy(pos2);

      var animations = [];
      var squaresMovedTo = {};

      // remove pieces that are the same in both positions
      for (var i in pos2) {
        if (pos2.hasOwnProperty(i) !== true) continue;

        if (pos1.hasOwnProperty(i) === true && pos1[i] === pos2[i]) {
          delete pos1[i];
          delete pos2[i];
        }
      }

      // find all the "move" animations
      for (var i in pos2) {
        if (pos2.hasOwnProperty(i) !== true) continue;

        var closestPiece = findClosestPiece(pos1, pos2[i], i);
        if (closestPiece !== false) {
          animations.push({
            type: 'move',
            source: closestPiece,
            destination: i,
            piece: pos2[i]
          });

          delete pos1[closestPiece];
          delete pos2[i];
          squaresMovedTo[i] = true;
        }
      }

      // add pieces to pos2
      for (var i in pos2) {
        if (pos2.hasOwnProperty(i) !== true) continue;

        animations.push({
          type: 'add',
          square: i,
          piece: pos2[i]
        });

        delete pos2[i];
      }

      // clear pieces from pos1
      for (var i in pos1) {
        if (pos1.hasOwnProperty(i) !== true) continue;

        // do not clear a piece if it is on a square that is the result
        // of a "move", ie: a piece capture
        if (squaresMovedTo.hasOwnProperty(i) === true) continue;

        animations.push({
          type: 'clear',
          square: i,
          piece: pos1[i]
        });

        delete pos1[i];
      }

      return animations;
    }

    //------------------------------------------------------------------------------
    // Control Flow
    //------------------------------------------------------------------------------

    function drawPositionInstant() {
      // add the pieces
      for (var i in CURRENT_POSITION) {
        if (CURRENT_POSITION.hasOwnProperty(i) !== true) continue;
        if (DRAGGING_A_PIECE && DRAGGED_PIECE_SOURCE === i) continue;

        $('#' + SQUARE_ELS_IDS[i]).html(buildPiece(CURRENT_POSITION[i]));
      }
    }

    function drawBoard() {
      boardEl.html(buildBoard(CURRENT_ORIENTATION));
      drawPositionInstant();

      if (cfg.sparePieces === true) {
        if (CURRENT_ORIENTATION === 'white') {
          sparePiecesTopEl.html(buildSparePieces('black'));
          sparePiecesBottomEl.html(buildSparePieces('white'));
        } else {
          sparePiecesTopEl.html(buildSparePieces('white'));
          sparePiecesBottomEl.html(buildSparePieces('black'));
        }
      }
    }

    // given a position and a set of moves, return a new position
    // with the moves executed
    function calculatePositionFromMoves(position, moves) {
      position = deepCopy(position);

      for (var i in moves) {
        if (moves.hasOwnProperty(i) !== true) continue;

        // skip the move if the position doesn't have a piece on the source square
        if (position.hasOwnProperty(i) !== true) continue;

        var piece = position[i];
        delete position[i];
        position[moves[i]] = piece;
      }

      return position;
    }

    function setCurrentPosition(position) {
      var oldPos = deepCopy(CURRENT_POSITION);
      var newPos = deepCopy(position);
      var oldFen = objToFen(oldPos);
      var newFen = objToFen(newPos);

      // do nothing if no change in position
      if (oldFen === newFen) return;

      // run their onChange function
      if (cfg.hasOwnProperty('onChange') === true && typeof cfg.onChange === 'function') {
        cfg.onChange(oldPos, newPos);
      }

      // update state
      CURRENT_POSITION = position;
    }

    function isXYOnSquare(x, y) {
      for (var i in SQUARE_ELS_OFFSETS) {
        if (SQUARE_ELS_OFFSETS.hasOwnProperty(i) !== true) continue;

        var s = SQUARE_ELS_OFFSETS[i];
        if (x >= s.left && x < s.left + SQUARE_SIZE && y >= s.top && y < s.top + SQUARE_SIZE) {
          return i;
        }
      }

      return 'offboard';
    }

    // records the XY coords of every square into memory
    function captureSquareOffsets() {
      SQUARE_ELS_OFFSETS = {};

      for (var i in SQUARE_ELS_IDS) {
        if (SQUARE_ELS_IDS.hasOwnProperty(i) !== true) continue;

        SQUARE_ELS_OFFSETS[i] = $('#' + SQUARE_ELS_IDS[i]).offset();
      }
    }

    function removeSquareHighlights() {
      boardEl.find('.' + CSS.square).removeClass(CSS.highlight1 + ' ' + CSS.highlight2);
    }

    function snapbackDraggedPiece() {
      // there is no "snapback" for spare pieces
      if (DRAGGED_PIECE_SOURCE === 'spare') {
        trashDraggedPiece();
        return;
      }

      removeSquareHighlights();

      // animation complete
      function complete() {
        drawPositionInstant();
        draggedPieceEl.css('display', 'none');

        // run their onSnapbackEnd function
        if (cfg.hasOwnProperty('onSnapbackEnd') === true && typeof cfg.onSnapbackEnd === 'function') {
          cfg.onSnapbackEnd(DRAGGED_PIECE, DRAGGED_PIECE_SOURCE, deepCopy(CURRENT_POSITION), CURRENT_ORIENTATION);
        }
      }

      // get source square position
      var sourceSquarePosition = $('#' + SQUARE_ELS_IDS[DRAGGED_PIECE_SOURCE]).offset();

      // animate the piece to the target square
      var opts = {
        duration: cfg.snapbackSpeed,
        complete: complete
      };
      draggedPieceEl.animate(sourceSquarePosition, opts);

      // set state
      DRAGGING_A_PIECE = false;
    }

    function trashDraggedPiece() {
      removeSquareHighlights();

      // remove the source piece
      var newPosition = deepCopy(CURRENT_POSITION);
      delete newPosition[DRAGGED_PIECE_SOURCE];
      setCurrentPosition(newPosition);

      // redraw the position
      drawPositionInstant();

      // hide the dragged piece
      draggedPieceEl.fadeOut(cfg.trashSpeed);

      // set state
      DRAGGING_A_PIECE = false;
    }

    function dropDraggedPieceOnSquare(square) {
      removeSquareHighlights();

      // update position
      var newPosition = deepCopy(CURRENT_POSITION);
      delete newPosition[DRAGGED_PIECE_SOURCE];
      newPosition[square] = DRAGGED_PIECE;
      setCurrentPosition(newPosition);

      // get target square information
      var targetSquarePosition = $('#' + SQUARE_ELS_IDS[square]).offset();

      // animation complete
      var complete = function () {
        drawPositionInstant();
        draggedPieceEl.css('display', 'none');

        // execute their onSnapEnd function
        if (cfg.hasOwnProperty('onSnapEnd') === true && typeof cfg.onSnapEnd === 'function') {
          cfg.onSnapEnd(DRAGGED_PIECE_SOURCE, square, DRAGGED_PIECE);
        }
      };

      // snap the piece to the target square
      var opts = {
        duration: cfg.snapSpeed,
        complete: complete
      };
      draggedPieceEl.animate(targetSquarePosition, opts);

      // set state
      DRAGGING_A_PIECE = false;
    }

    function beginDraggingPiece(source, piece, x, y) {
      // run their custom onDragStart function
      // their custom onDragStart function can cancel drag start
      if (typeof cfg.onDragStart === 'function' && cfg.onDragStart(source, piece, deepCopy(CURRENT_POSITION), CURRENT_ORIENTATION) === false) {
        return;
      }

      // set state
      DRAGGING_A_PIECE = true;
      DRAGGED_PIECE = piece;
      DRAGGED_PIECE_SOURCE = source;

      // if the piece came from spare pieces, location is offboard
      if (source === 'spare') {
        DRAGGED_PIECE_LOCATION = 'offboard';
      } else {
        DRAGGED_PIECE_LOCATION = source;
      }

      // capture the x, y coords of all squares in memory
      captureSquareOffsets();

      // create the dragged piece
      draggedPieceEl.attr('src', buildPieceImgSrc(piece)).css({
        display: '',
        position: 'absolute',
        left: x - SQUARE_SIZE / 2,
        top: y - SQUARE_SIZE / 2
      });

      if (source !== 'spare') {
        // highlight the source square and hide the piece
        $('#' + SQUARE_ELS_IDS[source]).addClass(CSS.highlight1).find('.' + CSS.piece).css('display', 'none');
      }
    }

    function updateDraggedPiece(x, y) {
      // put the dragged piece over the mouse cursor
      draggedPieceEl.css({
        left: x - SQUARE_SIZE / 2,
        top: y - SQUARE_SIZE / 2
      });

      // get location
      var location = isXYOnSquare(x, y);

      // do nothing if the location has not changed
      if (location === DRAGGED_PIECE_LOCATION) return;

      // remove highlight from previous square
      if (validSquare(DRAGGED_PIECE_LOCATION) === true) {
        $('#' + SQUARE_ELS_IDS[DRAGGED_PIECE_LOCATION]).removeClass(CSS.highlight2);
      }

      // add highlight to new square
      if (validSquare(location) === true) {
        $('#' + SQUARE_ELS_IDS[location]).addClass(CSS.highlight2);
      }

      // run onDragMove
      if (typeof cfg.onDragMove === 'function') {
        cfg.onDragMove(location, DRAGGED_PIECE_LOCATION, DRAGGED_PIECE_SOURCE, DRAGGED_PIECE, deepCopy(CURRENT_POSITION), CURRENT_ORIENTATION);
      }

      // update state
      DRAGGED_PIECE_LOCATION = location;
    }

    function stopDraggedPiece(location) {
      // determine what the action should be
      var action = 'drop';
      if (location === 'offboard' && cfg.dropOffBoard === 'snapback') {
        action = 'snapback';
      }
      if (location === 'offboard' && cfg.dropOffBoard === 'trash') {
        action = 'trash';
      }

      // run their onDrop function, which can potentially change the drop action
      if (cfg.hasOwnProperty('onDrop') === true && typeof cfg.onDrop === 'function') {
        var newPosition = deepCopy(CURRENT_POSITION);

        // source piece is a spare piece and position is off the board
        //if (DRAGGED_PIECE_SOURCE === 'spare' && location === 'offboard') {...}
        // position has not changed; do nothing

        // source piece is a spare piece and position is on the board
        if (DRAGGED_PIECE_SOURCE === 'spare' && validSquare(location) === true) {
          // add the piece to the board
          newPosition[location] = DRAGGED_PIECE;
        }

        // source piece was on the board and position is off the board
        if (validSquare(DRAGGED_PIECE_SOURCE) === true && location === 'offboard') {
          // remove the piece from the board
          delete newPosition[DRAGGED_PIECE_SOURCE];
        }

        // source piece was on the board and position is on the board
        if (validSquare(DRAGGED_PIECE_SOURCE) === true && validSquare(location) === true) {
          // move the piece
          delete newPosition[DRAGGED_PIECE_SOURCE];
          newPosition[location] = DRAGGED_PIECE;
        }

        var oldPosition = deepCopy(CURRENT_POSITION);

        var result = cfg.onDrop(DRAGGED_PIECE_SOURCE, location, DRAGGED_PIECE, newPosition, oldPosition, CURRENT_ORIENTATION);
        if (result === 'snapback' || result === 'trash') {
          action = result;
        }
      }

      // do it!
      if (action === 'snapback') {
        snapbackDraggedPiece();
      } else if (action === 'trash') {
        trashDraggedPiece();
      } else if (action === 'drop') {
        dropDraggedPieceOnSquare(location);
      }
    }

    //------------------------------------------------------------------------------
    // Public Methods
    //------------------------------------------------------------------------------

    // clear the board
    widget.clear = function (useAnimation) {
      widget.position({}, useAnimation);
    };

    /*
    // get or set config properties
    // TODO: write this, GitHub Issue #1
    widget.config = function(arg1, arg2) {
      // get the current config
      if (arguments.length === 0) {
        return deepCopy(cfg);
      }
    };
    */

    widget.set = function (key, value) {
      if (cfg.hasOwnProperty(key)) {
        cfg[key] = value;
      } else {
        error(1000, 'Invalid config key.', key);
      }
    };

    // remove the widget from the page
    widget.destroy = function () {
      // remove markup
      containerEl.html('');
      draggedPieceEl.remove();

      // remove event handlers
      containerEl.unbind();
    };

    // shorthand method to get the current FEN
    widget.fen = function () {
      return widget.position('fen');
    };

    // flip orientation
    widget.flip = function () {
      widget.orientation('flip');
    };

    /*
    // TODO: write this, GitHub Issue #5
    widget.highlight = function() {
    
    };
    */

    // move pieces
    widget.move = function () {
      // no need to throw an error here; just do nothing
      if (arguments.length === 0) return;

      var useAnimation = true;

      // collect the moves into an object
      var moves = {};
      for (var i = 0; i < arguments.length; i++) {
        // any "false" to this function means no animations
        if (arguments[i] === false) {
          useAnimation = false;
          continue;
        }

        // skip invalid arguments
        if (validMove(arguments[i]) !== true) {
          error(2826, 'Invalid move passed to the move method.', arguments[i]);
          continue;
        }

        var tmp = arguments[i].split('-');
        moves[tmp[0]] = tmp[1];
      }

      // calculate position from moves
      var newPos = calculatePositionFromMoves(CURRENT_POSITION, moves);

      // update the board
      widget.position(newPos, useAnimation);

      // return the new position object
      return newPos;
    };

    widget.orientation = function (arg) {
      // no arguments, return the current orientation
      if (arguments.length === 0) {
        return CURRENT_ORIENTATION;
      }

      // set to white or black
      if (arg === 'white' || arg === 'black') {
        CURRENT_ORIENTATION = arg;
        drawBoard();
        return;
      }

      // flip orientation
      if (arg === 'flip') {
        CURRENT_ORIENTATION = CURRENT_ORIENTATION === 'white' ? 'black' : 'white';
        drawBoard();
        return;
      }

      error(5482, 'Invalid value passed to the orientation method.', arg);
    };

    widget.position = function (position, useAnimation) {
      // no arguments, return the current position
      if (arguments.length === 0) {
        return deepCopy(CURRENT_POSITION);
      }

      // get position as FEN
      if (typeof position === 'string' && position.toLowerCase() === 'fen') {
        return objToFen(CURRENT_POSITION);
      }

      // default for useAnimations is true
      if (useAnimation !== false) {
        useAnimation = true;
      }

      // start position
      if (typeof position === 'string' && position.toLowerCase() === 'start') {
        position = deepCopy(START_POSITION);
      }

      // convert FEN to position object
      if (validFen(position) === true) {
        position = fenToObj(position);
      }

      // validate position object
      if (validPositionObject(position) !== true) {
        error(6482, 'Invalid value passed to the position method.', position);
        return;
      }

      if (useAnimation === true) {
        // start the animations
        doAnimations(calculateAnimations(CURRENT_POSITION, position), CURRENT_POSITION, position);

        // set the new position
        setCurrentPosition(position);
      }
      // instant update
      else {
          setCurrentPosition(position);
          drawPositionInstant();
        }
    };

    widget.resize = function () {
      // calulate the new square size
      SQUARE_SIZE = calculateSquareSize();

      // set board width
      boardEl.css('width', SQUARE_SIZE * 8 + 'px');

      // set drag piece size
      draggedPieceEl.css({
        height: SQUARE_SIZE,
        width: SQUARE_SIZE
      });

      // spare pieces
      if (cfg.sparePieces === true) {
        containerEl.find('.' + CSS.sparePieces).css('paddingLeft', SQUARE_SIZE + BOARD_BORDER_SIZE + 'px');
      }

      // redraw the board
      drawBoard();
    };

    // set the starting position
    widget.start = function (useAnimation) {
      widget.position('start', useAnimation);
    };

    //------------------------------------------------------------------------------
    // Browser Events
    //------------------------------------------------------------------------------

    function isTouchDevice() {
      return 'ontouchstart' in document.documentElement;
    }

    // reference: http://www.quirksmode.org/js/detect.html
    function isMSIE() {
      return navigator && navigator.userAgent && navigator.userAgent.search(/MSIE/) !== -1;
    }

    function stopDefault(e) {
      e.preventDefault();
    }

    function mousedownSquare(e) {
      // do nothing if we're not draggable
      if (cfg.draggable !== true) return;

      var square = $(this).attr('data-square');

      // no piece on this square
      if (validSquare(square) !== true || CURRENT_POSITION.hasOwnProperty(square) !== true) {
        return;
      }

      beginDraggingPiece(square, CURRENT_POSITION[square], e.pageX, e.pageY);
    }

    function touchstartSquare(e) {
      // do nothing if we're not draggable
      if (cfg.draggable !== true) return;

      var square = $(this).attr('data-square');

      // no piece on this square
      if (validSquare(square) !== true || CURRENT_POSITION.hasOwnProperty(square) !== true) {
        return;
      }

      e = e.originalEvent;
      beginDraggingPiece(square, CURRENT_POSITION[square], e.changedTouches[0].pageX, e.changedTouches[0].pageY);
    }

    function mousedownSparePiece(e) {
      // do nothing if sparePieces is not enabled
      if (cfg.sparePieces !== true) return;

      var piece = $(this).attr('data-piece');

      beginDraggingPiece('spare', piece, e.pageX, e.pageY);
    }

    function touchstartSparePiece(e) {
      // do nothing if sparePieces is not enabled
      if (cfg.sparePieces !== true) return;

      var piece = $(this).attr('data-piece');

      e = e.originalEvent;
      beginDraggingPiece('spare', piece, e.changedTouches[0].pageX, e.changedTouches[0].pageY);
    }

    function mousemoveWindow(e) {
      // do nothing if we are not dragging a piece
      if (DRAGGING_A_PIECE !== true) return;

      updateDraggedPiece(e.pageX, e.pageY);
    }

    function touchmoveWindow(e) {
      // do nothing if we are not dragging a piece
      if (DRAGGING_A_PIECE !== true) return;

      // prevent screen from scrolling
      e.preventDefault();

      updateDraggedPiece(e.originalEvent.changedTouches[0].pageX, e.originalEvent.changedTouches[0].pageY);
    }

    function mouseupWindow(e) {
      // do nothing if we are not dragging a piece
      if (DRAGGING_A_PIECE !== true) return;

      // get the location
      var location = isXYOnSquare(e.pageX, e.pageY);

      stopDraggedPiece(location);
    }

    function touchendWindow(e) {
      // do nothing if we are not dragging a piece
      if (DRAGGING_A_PIECE !== true) return;

      // get the location
      var location = isXYOnSquare(e.originalEvent.changedTouches[0].pageX, e.originalEvent.changedTouches[0].pageY);

      stopDraggedPiece(location);
    }

    function mouseenterSquare(e) {
      // do not fire this event if we are dragging a piece
      // NOTE: this should never happen, but it's a safeguard
      if (DRAGGING_A_PIECE !== false) return;

      if (cfg.hasOwnProperty('onMouseoverSquare') !== true || typeof cfg.onMouseoverSquare !== 'function') return;

      // get the square
      var square = $(e.currentTarget).attr('data-square');

      // NOTE: this should never happen; defensive
      if (validSquare(square) !== true) return;

      // get the piece on this square
      var piece = false;
      if (CURRENT_POSITION.hasOwnProperty(square) === true) {
        piece = CURRENT_POSITION[square];
      }

      // execute their function
      cfg.onMouseoverSquare(square, piece, deepCopy(CURRENT_POSITION), CURRENT_ORIENTATION);
    }

    function mouseleaveSquare(e) {
      // do not fire this event if we are dragging a piece
      // NOTE: this should never happen, but it's a safeguard
      if (DRAGGING_A_PIECE !== false) return;

      if (cfg.hasOwnProperty('onMouseoutSquare') !== true || typeof cfg.onMouseoutSquare !== 'function') return;

      // get the square
      var square = $(e.currentTarget).attr('data-square');

      // NOTE: this should never happen; defensive
      if (validSquare(square) !== true) return;

      // get the piece on this square
      var piece = false;
      if (CURRENT_POSITION.hasOwnProperty(square) === true) {
        piece = CURRENT_POSITION[square];
      }

      // execute their function
      cfg.onMouseoutSquare(square, piece, deepCopy(CURRENT_POSITION), CURRENT_ORIENTATION);
    }

    //------------------------------------------------------------------------------
    // Initialization
    //------------------------------------------------------------------------------

    function addEvents() {
      // prevent browser "image drag"
      $('body').on('mousedown mousemove', '.' + CSS.piece, stopDefault);

      // mouse drag pieces
      boardEl.on('mousedown', '.' + CSS.square, mousedownSquare);
      containerEl.on('mousedown', '.' + CSS.sparePieces + ' .' + CSS.piece, mousedownSparePiece);

      // mouse enter / leave square
      boardEl.on('mouseenter', '.' + CSS.square, mouseenterSquare);
      boardEl.on('mouseleave', '.' + CSS.square, mouseleaveSquare);

      // IE doesn't like the events on the window object, but other browsers
      // perform better that way
      if (isMSIE() === true) {
        // IE-specific prevent browser "image drag"
        document.ondragstart = function () {
          return false;
        };

        $('body').on('mousemove', mousemoveWindow);
        $('body').on('mouseup', mouseupWindow);
      } else {
        $(window).on('mousemove', mousemoveWindow);
        $(window).on('mouseup', mouseupWindow);
      }

      // touch drag pieces
      if (isTouchDevice() === true) {
        boardEl.on('touchstart', '.' + CSS.square, touchstartSquare);
        containerEl.on('touchstart', '.' + CSS.sparePieces + ' .' + CSS.piece, touchstartSparePiece);
        $(window).on('touchmove', touchmoveWindow);
        $(window).on('touchend', touchendWindow);
      }
    }

    function initDom() {
      // build board and save it in memory
      containerEl.html(buildBoardContainer());
      boardEl = containerEl.find('.' + CSS.board);

      if (cfg.sparePieces === true) {
        sparePiecesTopEl = containerEl.find('.' + CSS.sparePiecesTop);
        sparePiecesBottomEl = containerEl.find('.' + CSS.sparePiecesBottom);
      }

      // create the drag piece
      var draggedPieceId = createId();
      $('body').append(buildPiece('wP', true, draggedPieceId));
      draggedPieceEl = $('#' + draggedPieceId);

      // get the border size
      BOARD_BORDER_SIZE = parseInt(boardEl.css('borderLeftWidth'), 10);

      // set the size and draw the board
      widget.resize();
    }

    function init() {
      if (checkDeps() !== true || expandConfig() !== true) return;

      // create unique IDs for all the elements we will create
      createElIds();

      initDom();
      addEvents();
    }

    // go time
    init();

    // return the widget object
    return widget;
  }; // end window.ChessBoard

  // expose util functions
  window.ChessBoard.fenToObj = fenToObj;
  window.ChessBoard.objToFen = objToFen;
})(); // end anonymous wrapper

},{}],6:[function(require,module,exports){
const communityDirective = ($rootScope, socketService, accService, $timeout) => {
		return {
				templateUrl: 'components/community/community.html',
				restrict: 'E',
				link: scope => {
						var getPlayers = () => {
								scope.playerLoading = true;
								accService.getPlayers({ username: $rootScope.account.username }).then(rsp => {
										scope.players = rsp.data;
										scope.playerLoading = false;
								});
						};
						getPlayers();

						socketService.socketOn('updateList', from => {
								var newPlayer = true;
								for (i = 0; i < scope.players.length; i++) {
										if (scope.players[i].username == from.source.user) {
												newPlayer = false;
												scope.players[i].status = from.source.status;
												if (from.source.status == 1 || from.source.status == 2) {
														scope.players[i].sockId = from.source.sockId;
												} else {
														scope.players[i].sockId = null;
												}
										}
								}
								if (newPlayer) {
										getPlayers();
								} else {
										scope.$apply();
								}
						});

						scope.challengePlayer = sockId => {
								socketService.socketEmit('challenge', {
										p1: $rootScope.account.username,
										p1_id: $rootScope.account._id,
										sockId: sockId
								});
						};

						scope.$on('refreshPlayers', () => {
								getPlayers();
						});
				}
		};
};

communityDirective.$inject = ['$rootScope', 'socketService', 'accService', '$timeout'];
angular.module('berger').directive('communityDirective', communityDirective);

},{}],7:[function(require,module,exports){
const competitionDirective = () => {
    return {
        templateUrl: 'components/competition/competition.html',
        restrict: 'E',
        link: scope => {}
    };
};

competitionDirective.$inject = [];

angular.module('berger').directive('competitionDirective', competitionDirective);

},{}],8:[function(require,module,exports){
class containerController {
    constructor($state, playerRsp, competitionRsp, gamesRsp, socketService, competitionService, $location, localStorageService, $rootScope, accService) {
        if (!$rootScope.account) $rootScope.account = localStorageService.get('account');

        if (!$rootScope.account) $location.path('/login');

        // Shared properties throughout the application
        this.players = playerRsp.data;
        this.userHeaders = ['Name', 'Email', 'Club', 'Date'];
        this.userKeys = ['name', 'email', 'club', 'date'];

        this.competitions = competitionRsp.data;
        this.competitionHeaders = ['Name', 'Current Round', 'Total Rounds', 'Status', 'Date'];
        this.competitionKeys = ['name', 'current_round', 'rounds', 'status', 'date'];

        this.games = gamesRsp.data;
        this.gamesFilter = gamesRsp.data;

        // Set the current view based on what we loaded
        this.viewValue = $state.current.name;
        if ($rootScope.account.type == 0) {
            this.subViewValue = 'player';
        } else {
            this.subViewValue = 'myacc';
        }

        if ($state.params && $state.params.compId) {
            this.currentCompId = $state.params.compId;
        }

        // Register socket
        socketService.registerSocket();

        // Send message to update players list if connected account is a player
        if ($rootScope.account.type == 2) {
            accService.getPlayerById({ id: $rootScope.account._id }).then(rsp => {

                if (rsp.data[0].status == 2) {
                    $rootScope.account = rsp.data[0];
                    socketService.socketEmit('I was in a game', {
                        id: $rootScope.account._id
                    });
                    this.ingame = true;
                    this.viewValue = 'game';
                    socketService.socketEmit('updateList', { user: $rootScope.account.username, status: 2 });
                } else {
                    socketService.socketEmit('updateList', { user: $rootScope.account.username, status: 1 });
                }
            });
        }

        // Watch for socket incoming data
        socketService.socketOn('newCompetition', resp => {
            competitionService.getCompetition().then(resp => {
                this.competitions = resp.data;
            });
        });
    }

}

containerController.$inject = ['$state', 'playerRsp', 'competitionRsp', 'gamesRsp', 'socketService', 'competitionService', '$location', 'localStorageService', '$rootScope', 'accService'];

angular.module('berger').controller('containerController', containerController);

},{}],9:[function(require,module,exports){
const containerDirective = ($rootScope, accService, localStorageService, betService, socketService) => {
    return {
        templateUrl: 'components/container/container.html',
        restrict: 'E',
        link: scope => {
            scope.userMoney = {
                user: '',
                ammount: 0
            };

            // Changes the view betweeen panels
            scope.changeSubView = view => {
                scope.contCtrl.subViewValue = view;
            };

            // Changes the view betweeen panels
            scope.changeView = view => {
                scope.contCtrl.viewValue = view;
            };

            scope.updateMoney = () => {
                scope.userMoney.user = $rootScope.account._id;
                accService.updateMoney(scope.userMoney).then(rsp => {
                    $rootScope.account.money = rsp.data.money;
                    localStorageService.set('account', $rootScope.account);
                    socketService.socketEmit('updateMoney', 1);
                });
            };

            scope.getMyBets = () => {
                betService.getBetsForUser($rootScope.account._id).then(rsp => {
                    scope.myBets = rsp.data;
                });
            };

            scope.getMyBets();
            socketService.socketOn('newBet', resp => {
                scope.getMyBets();
            });
        }
    };
};

containerDirective.$inject = ['$rootScope', 'accService', 'localStorageService', 'betService', 'socketService'];

angular.module('berger').directive('containerDirective', containerDirective);

},{}],10:[function(require,module,exports){
const gameComponent = ($rootScope, gameService, accService, betService, localStorageService, socketService) => {
    return {
        templateUrl: 'components/game/game.html',
        restrict: 'E',
        scope: {
            competitions: '=',
            allGames: '=',
            gameData: '=', //{p1_id : '', p2_id: ''}
            players: '=', //[player]
            account: '=' //[acc type]
        },
        link: scope => {
            scope.onlineGame = false;
            scope.game = {
                status: '2' //draw
            };
            scope.canBet = true;
            if (scope.players.filter(obj => obj._id === scope.gameData.p1_id)[0]) {
                scope.playerOne = scope.players.filter(obj => obj._id === scope.gameData.p1_id)[0];
                scope.playerTwo = scope.players.filter(obj => obj._id === scope.gameData.p2_id)[0];
            } else {
                scope.onlineGame = true;
                scope.playerOne = {
                    name: '',
                    club: '',
                    email: ''
                };
                scope.playerTwo = {
                    name: '',
                    club: '',
                    email: ''
                };
                accService.getPlayerById({ id: scope.gameData.p1_id }).then(rsp => {
                    scope.playerOne.name = rsp.data[0].username;
                    scope.playerOne.club = rsp.data[0].club;
                    scope.playerOne.email = rsp.data[0].email;
                });
                accService.getPlayerById({ id: scope.gameData.p2_id }).then(rsp => {
                    scope.playerTwo.name = rsp.data[0].username;
                    scope.playerTwo.club = rsp.data[0].club;
                    scope.playerTwo.email = rsp.data[0].email;
                });
            }

            scope.bet = {
                gameId: '',
                userId: '',
                option: 0,
                money: null
            };

            scope.getBets = () => {
                var currGame = {
                    userId: scope.account._id,
                    gameId: scope.gameData._id
                };

                betService.getBetsForGame(currGame).then(rsp => {
                    scope.bets = rsp.data;
                    if (rsp.data.length > 0) scope.canBet = false;
                });
            };
            scope.getBets();

            betService.getAllBetsForGame(scope.gameData._id).then(rsp => {});

            scope.switch = value => {
                scope.canBet = value;
                if (!value) {
                    scope.bet = {
                        gameId: '',
                        userId: '',
                        option: 0,
                        money: null
                    };
                }
            };

            scope.endGame = () => {
                if (scope.game.status) {
                    const gameData = angular.copy(scope.gameData);
                    gameData.status = scope.game.status;
                    gameData.id = gameData._id;

                    delete gameData._id;
                    gameService.endGame(gameData).then(rsp => {
                        scope.gameData = rsp.data;
                        scope.allGames.forEach(obj => {
                            if (obj._id === scope.gameData._id) {
                                obj.status = scope.gameData.status;
                            }
                        });
                        $rootScope.$broadcast('gameFinished', 1);
                    });
                    var result = {
                        gameId: scope.gameData._id,
                        status: scope.game.status
                    };
                    betService.updateAllBetsForGame(result).then(rsp => {
                        var bets = rsp.data;
                        if (bets.length > 0) {
                            for (i = 0; i < bets.length; i++) {
                                var userMoney = {
                                    user: bets[i].userId,
                                    ammount: 2 * bets[i].money
                                };
                                accService.updateMoney(userMoney).then(rsp => {
                                    socketService.socketEmit('updateMoney', 1);
                                    socketService.socketEmit('newBet', 1);
                                });
                            }
                        }
                    });
                }
            };

            scope.placeBet = game => {
                scope.bet.gameId = game._id;
                scope.bet.userId = scope.account._id;
                var userMoney = {
                    user: scope.bet.userId,
                    ammount: -scope.bet.money
                };
                accService.updateMoney(userMoney).then(rsp => {
                    $rootScope.account.money = rsp.data.money;
                    localStorageService.set('account', $rootScope.account);
                });
                betService.placeBet(scope.bet).then(rsp => {
                    scope.getBets();
                    // Send to server an impulse that I placed a bet
                    socketService.socketEmit('newBet', 1);
                });
            };

            socketService.socketOn('newBet', resp => {
                scope.getBets();
            });
        }
    };
};

gameComponent.$inject = ['$rootScope', 'gameService', 'accService', 'betService', 'localStorageService', 'socketService'];

angular.module('berger').directive('game', gameComponent);

},{}],11:[function(require,module,exports){
const gamePlatform = ($rootScope, socketService, $mdDialog, accService, gameService, competitionService, betService, $timeout) => {
    return {
        templateUrl: 'components/game_platform/game-platform.html',
        restrict: 'E',
        link: scope => {
            var myColor = null;
            var game = new Chess();
            var currGame = null;
            var board = null;
            var gameIsSet = false;
            var dropPiece = new Audio('../../sounds/dropPiece.mp3');
            var onMovePiece = new Audio('../../sounds/movePiece.mp3');
            var check = new Audio('../../sounds/check.mp3');

            // do not pick up pieces if the game is over
            // only pick up pieces for certain round
            var onDragStart = function (source, piece, position, orientation) {
                if (game.game_over() === true || game.turn() === 'w' && piece.search(/^b/) !== -1 || game.turn() === 'b' && piece.search(/^w/) !== -1) {
                    return false;
                }
                if (myColor != game.turn()) {
                    return false;
                }
            };
            var onDrop = function (source, target) {

                // see if the move is legal
                var move = game.move({
                    from: source,
                    to: target,
                    promotion: 'q' // promote to a queen
                });

                // illegal move
                if (move === null) return 'snapback';
                updateStatus();
                dropPiece.play();
                socketService.socketEmit('move', { source: source, target: target });
            };

            // update the board position after the piece snap
            // for castling, pawn promotion
            var onSnapEnd = function () {
                board.position(game.fen(), true);
            };

            var updateStatus = function () {

                var moveColor = 'White';
                if (game.turn() === 'b') {
                    moveColor = 'Black';
                }

                // checkmate?
                if (game.in_checkmate() === true) {
                    check.play();
                    scope.time = 10;
                    scope.status = 'Game over, ' + moveColor + ' is in checkmate. Exiting in ' + scope.time + '...';
                    var loseColor = null;
                    var result = 0;

                    var timeTick = time => {

                        scope.time = time;
                        scope.status = 'Game over, ' + moveColor + ' is in checkmate. Exiting in ' + scope.time + '...';

                        if (scope.time == 0) {
                            if (myColor == loseColor) {
                                endGame(result);
                                accService.updatePlayerStatus({
                                    id: $rootScope.account._id,
                                    status: 1
                                }).then(rsp => {
                                    socketService.socketEmit('endGame', $rootScope.account.username);
                                    $mdDialog.show({
                                        scope: scope.$new(),
                                        templateUrl: 'components/end_game_modal/responseLost.html',
                                        parent: angular.element(document.body),
                                        clickOutsideToClose: true,
                                        fullscreen: scope.customFullscreen
                                    });
                                });
                            } else {
                                accService.updatePlayerStatus({
                                    id: $rootScope.account._id,
                                    status: 1
                                }).then(rsp => {
                                    $rootScope.account.status = 1;
                                    scope.contCtrl.ingame = false;
                                    scope.contCtrl.viewValue = 'players';

                                    socketService.socketEmit('endGame', $rootScope.account.username);

                                    $mdDialog.show({
                                        scope: scope.$new(),
                                        templateUrl: 'components/end_game_modal/responseWin.html',
                                        parent: angular.element(document.body),
                                        clickOutsideToClose: true,
                                        fullscreen: scope.customFullscreen
                                    });
                                });
                            }
                        } else {
                            $timeout(() => {
                                timeTick(scope.time - 1);
                            }, 1000);
                        }
                    };

                    if (moveColor == 'White') {
                        loseColor = 'w';
                        result = 3;
                    } else {
                        loseColor = 'b';
                        result = 1;
                    }
                    timeTick(scope.time);
                }

                // draw?
                else if (game.in_draw() === true) {
                        scope.time = 10;
                        scope.status = 'Game over, drawn position. Exiting in ' + scope.time + '...';
                        var lastColor = null;
                        var result = 2;

                        var timeTick = time => {

                            scope.time = time;
                            scope.status = 'Game over, drawn position. Exiting in ' + scope.time + '...';

                            if (scope.time == 0) {
                                if ($rootScope.account._id == currGame.p1_id) {
                                    endGame(result);
                                    accService.updatePlayerStatus({
                                        id: $rootScope.account._id,
                                        status: 1
                                    }).then(rsp => {
                                        socketService.socketEmit('endGame', $rootScope.account.username);
                                        $mdDialog.show({
                                            scope: scope.$new(),
                                            templateUrl: 'components/end_game_modal/responseDraw.html',
                                            parent: angular.element(document.body),
                                            clickOutsideToClose: true,
                                            fullscreen: scope.customFullscreen
                                        });
                                    });
                                } else {
                                    accService.updatePlayerStatus({
                                        id: $rootScope.account._id,
                                        status: 1
                                    }).then(rsp => {
                                        $rootScope.account.status = 1;
                                        scope.contCtrl.ingame = false;
                                        scope.contCtrl.viewValue = 'players';

                                        socketService.socketEmit('endGame', $rootScope.account.username);

                                        $mdDialog.show({
                                            scope: scope.$new(),
                                            templateUrl: 'components/end_game_modal/responseDraw.html',
                                            parent: angular.element(document.body),
                                            clickOutsideToClose: true,
                                            fullscreen: scope.customFullscreen
                                        });
                                    });
                                }
                            } else {
                                $timeout(() => {
                                    timeTick(scope.time - 1);
                                }, 1000);
                            }
                        };

                        if (moveColor == 'White') {
                            lastColor = 'w';
                        } else {
                            loseColor = 'b';
                        }
                        timeTick(scope.time);
                    }

                    // game still on
                    else {
                            scope.status = moveColor + ' to move';

                            // check?
                            if (game.in_check() === true) {
                                scope.status += ', ' + moveColor + ' is in check';
                                check.play();
                            }
                        }
                if (!scope.$$phase) scope.$apply();
            };

            // configuration for board initialization
            var cfg = {
                draggable: true,
                position: 'start',
                orientation: 'white',
                onDragStart: onDragStart,
                onDrop: onDrop,
                onSnapEnd: onSnapEnd,
                showNotation: true
            };

            // count down if player has left
            var countDownLeft = time => {
                if (!scope.playerLeft) {
                    return false;
                }
                scope.leftTime = time;

                if (scope.leftTime == 0) {
                    // end game and win
                    var result = 0;
                    if ($rootScope.account._id == currGame.p1_id) {
                        result = 1;
                        otherPlayerId = currGame.p2_id;
                    } else {
                        result = 3;
                        otherPlayerId = currGame.p1_id;
                    }

                    endGame(result);
                    accService.updatePlayerStatus({
                        id: otherPlayerId,
                        status: 0
                    }).then(rsp => {
                        accService.updatePlayerStatus({
                            id: $rootScope.account._id,
                            status: 1
                        }).then(rsp => {
                            socketService.socketEmit('updateList', { user: $rootScope.account.username, status: 1 });
                            socketService.socketEmit('updateList', { user: scope.contCtrl.enemy, status: 0 });
                            $mdDialog.show({
                                scope: scope.$new(),
                                templateUrl: 'components/leave_game_modal/responseWinByLeave.html',
                                parent: angular.element(document.body),
                                clickOutsideToClose: true,
                                fullscreen: scope.customFullscreen
                            });
                            $rootScope.$broadcast('refreshPlayers');
                        });
                    });
                } else {
                    $timeout(() => {
                        countDownLeft(scope.leftTime - 1);
                    }, 1000);
                }
            };

            // set up game board
            var setUpGame = (position = null, fen = null) => {
                gameService.getGameById(scope.contCtrl.currGameId).then(rsp => {
                    currGame = rsp.data;
                    if ($rootScope.account._id == currGame.p1_id) {
                        cfg.orientation = 'white';
                        myColor = 'w';
                    } else if ($rootScope.account._id == currGame.p2_id) {
                        cfg.orientation = 'black';
                        myColor = 'b';
                    }
                    if (position) {
                        board = ChessBoard('#board', cfg);
                        game.load(fen);
                        board.position(game.fen(), true);
                    } else {
                        board = ChessBoard('#board', cfg);
                    }

                    scope.gameLoad = false;
                    updateStatus();
                });
            };

            $(window).resize(() => {
                if (board) {
                    board.resize();
                }
            });

            scope.gameLoad = true;
            socketService.socketOn('gameId', from => {
                scope.contCtrl.currGameId = from;
            });

            socketService.socketOn('gameData', from => {
                setUpGame(from.position, from.fen);
                gameIsSet = true;
            });

            socketService.socketOn('needData', from => {
                socketService.socketEmit('gameData', {
                    position: board.fen(),
                    fen: game.fen()
                });
                scope.playerLeft = false;
            });

            socketService.socketOn('player left', from => {
                scope.playerLeft = true;
                countDownLeft(30);
                scope.$apply;
            });

            if (!gameIsSet) {
                setUpGame();
            }

            scope.joinRoom = () => {
                socketService.socketEmit('joinGame', { user: $rootScope.account.username, room: 'game' });
            };

            scope.leaveGameAsk = () => {
                $mdDialog.show({
                    scope: scope.$new(),
                    templateUrl: 'components/leave_game_modal/leaveGameAsk.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true,
                    fullscreen: scope.customFullscreen
                });
            };

            scope.closeAskDialog = () => {
                $mdDialog.hide();
            };

            scope.leaveGame = () => {
                var result = null;
                if ($rootScope.account._id == currGame.p1_id) {
                    result = 3;
                } else if ($rootScope.account._id == currGame.p2_id) {
                    result = 1;
                }
                endGame(result);

                accService.updatePlayerStatus({
                    id: $rootScope.account._id,
                    status: 1
                }).then(rsp => {
                    socketService.socketEmit('leftGame', $rootScope.account.username);
                });

                $mdDialog.destroy();

                $mdDialog.show({
                    scope: scope.$new(),
                    templateUrl: 'components/leave_game_modal/responseLost.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true,
                    fullscreen: scope.customFullscreen
                });
            };

            var endGame = result => {

                const gameData = {
                    id: currGame._id,
                    comp_id: currGame.comp_id,
                    round: 1,
                    status: result,
                    p1_id: currGame.p1_id,
                    p1_color: currGame.p1_color,
                    p2_id: currGame.p2_id,
                    p2_color: currGame.p2_color,
                    date: currGame.date,
                    room: currGame.room
                };

                gameService.endGame(gameData).then(rsp => {

                    $rootScope.$broadcast('gameFinished', 1);
                    var betResult = {
                        gameId: currGame._id,
                        status: result
                    };
                    betService.updateAllBetsForGame(betResult).then(response => {
                        var bets = response.data;
                        if (bets.length > 0) {
                            for (i = 0; i < bets.length; i++) {
                                var userMoney = {
                                    user: bets[i].userId,
                                    ammount: 2 * bets[i].money
                                };
                                accService.updateMoney(userMoney).then(success => {
                                    socketService.socketEmit('updateMoney', 1);
                                    socketService.socketEmit('newBet', 1);
                                });
                            }
                        }
                    });
                });

                $rootScope.account.status = 1;
                scope.contCtrl.ingame = false;
                scope.contCtrl.viewValue = 'players';
            };

            socketService.socketOn('leftGame', from => {
                accService.updatePlayerStatus({
                    id: $rootScope.account._id,
                    status: 1
                }).then(rsp => {
                    $rootScope.account.status = 1;
                    scope.contCtrl.ingame = false;
                    scope.contCtrl.viewValue = 'players';
                    $mdDialog.hide();

                    $mdDialog.show({
                        scope: scope.$new(),
                        templateUrl: 'components/leave_game_modal/responseWinByLeave.html',
                        parent: angular.element(document.body),
                        clickOutsideToClose: true,
                        fullscreen: scope.customFullscreen
                    });

                    socketService.socketEmit('leaveRoom', $rootScope.account.username);
                });
            });

            socketService.socketOn('move', from => {
                board.move(from.source + '-' + from.target);
                var move = game.move({
                    from: from.source,
                    to: from.target,
                    promotion: 'q' // promote to a queen
                });
                onMovePiece.play();
                board.draggable = true;
                updateStatus();
            });
        }
    };
};

gamePlatform.$inject = ['$rootScope', 'socketService', '$mdDialog', 'accService', 'gameService', 'competitionService', 'betService', '$timeout'];

angular.module('berger').directive('gamePlatform', gamePlatform);

},{}],12:[function(require,module,exports){
class loginController {
    constructor($location, localStorageService) {
        // Shared properties throughout the application
        if (localStorageService.get('account')) $location.path('/manager');
    }
}

loginController.$inject = ['$location', 'localStorageService'];

angular.module('berger').controller('loginController', loginController);

},{}],13:[function(require,module,exports){
const loginDirective = (accService, $rootScope, $location, localStorageService, $mdDialog) => {
    return {
        templateUrl: 'components/login/login.html',
        restrict: 'E',
        link: scope => {

            // Initiate variables
            scope.userSign = {
                username: '',
                password: '',
                type: 0,
                status: 1
            };
            scope.userLogin = {
                username: '',
                password: '',
                status: 1
            };
            scope.insertedCode = null;
            var code = 0;
            scope.codeReceived = false;
            scope.accounts = [];

            // END variables

            // Refresh latest accounts list
            scope.refreshAccs = () => {
                scope.accLoading = true;
                accService.getLatestAccs().then(rsp => {
                    scope.accounts = rsp.data;
                    scope.accLoading = false;
                }, err => {
                    return err;
                });
            };

            // Get latest accounts
            scope.refreshAccs();

            // Login while checking if account is activated
            scope.login = () => {
                scope.loginLoading = true;
                accService.login(scope.userLogin).then(rsp => {
                    scope.loginLoading = false;
                    if (rsp.data) {
                        if (rsp.data.usable == 0) {
                            scope.notActivated = true;
                            scope.account = rsp.data;
                        } else {
                            $rootScope.account = rsp.data;
                            scope.bad = false;
                            localStorageService.set('account', $rootScope.account);
                            localStorageService.set('loggedIn', true);
                            $location.path('/manager');
                        }
                    } else {
                        scope.bad = true;
                        return 0;
                    }
                });
            };

            //Send 4-digit code
            scope.sendCode = () => {
                scope.sendLoading = true;
                accService.sendCode(scope.account).then(rsp => {
                    scope.sendLoading = false;
                    scope.resent = true;
                    if (rsp.data) {
                        code = rsp.data;
                    }
                });
            };

            // Proceed to dashboard
            scope.proceed = () => {
                scope.procLoading = true;
                if (scope.userSign.username) {
                    accService.login(scope.userSign).then(rsp => {
                        scope.procLoading = false;
                        if (rsp.data) {
                            $rootScope.account = rsp.data;
                            scope.bad = false;
                            localStorageService.set('account', $rootScope.account);
                            localStorageService.set('loggedIn', true);
                            $location.path('/manager');
                        } else {
                            scope.bad = true;
                        }
                    });
                } else {
                    accService.login(scope.userLogin).then(rsp => {
                        scope.procLoading = false;
                        if (rsp.data) {
                            $rootScope.account = rsp.data;
                            scope.bad = false;
                            localStorageService.set('account', rsp.data);
                            localStorageService.set('loggedIn', true);
                            $location.path('/manager');
                        } else {
                            scope.bad = true;
                        }
                    });
                }
            };

            // Go back to login
            scope.revertLogin = () => {
                scope.notActivated = false;
                scope.account = null;
                scope.resent = false;
            };

            // Check 4-digit code
            scope.checkCode = insCode => {
                if (scope.notActivated) {
                    scope.userSign = scope.userLogin;
                }
                scope.checkLoading = true;
                if (insCode == code) {
                    accService.activateAcc(scope.userSign).then(rsp => {
                        scope.activated = true;
                        scope.checkLoading = false;
                    });
                } else {
                    scope.wrongCode = true;
                    scope.checkLoading = false;
                }
            };

            // Sign up and check verification 4-digit code
            scope.signup = () => {
                scope.signLoading = true;
                accService.createAcc(scope.userSign).then(rsp => {
                    scope.signLoading = false;
                    scope.refreshAccs();
                    if (rsp.data == "bad") {
                        scope.badUser = true;
                    } else {
                        code = rsp.data;
                        scope.codeReceived = true;
                    }
                });
            };

            scope.showForgot = function (ev) {
                $mdDialog.show($mdDialog.alert().clickOutsideToClose(true).title('Forgot your password?').textContent('Asta ete!').ok('Bine :(').targetEvent(ev));
            };
        }
    };
};

loginDirective.$inject = ['accService', '$rootScope', '$location', 'localStorageService', '$mdDialog'];

angular.module('berger').directive('loginDirective', loginDirective);

},{}],14:[function(require,module,exports){
const myaccNavbar = ($mdDialog, $window, $rootScope, accService, localStorageService, $location, socketService, $timeout) => {
    return {
        templateUrl: 'components/myacc_navbar/myacc-navbar.html',
        restrict: 'E',
        link: scope => {
            var newChallengeSound = new Audio('../../sounds/newChallenge.mp3');
            scope.account = $rootScope.account;
            var challengerUserId = null;
            var challengeDeclined = false;
            scope.logout = () => {
                scope.logoutLoading = true;
                scope.account.status = 0;
                accService.login(scope.account).then(rsp => {
                    scope.logoutLoading = false;
                    if (rsp.data) {
                        if ($rootScope.account.type == 2) socketService.socketEmit('updateList', { user: $rootScope.account.username, status: 0 });
                        $rootScope.account = null;
                        localStorageService.clearAll();
                        $location.path('/login');
                    } else {
                        //something..
                    }
                });
            };

            // on new bet refresh user data
            socketService.socketOn('newBet', resp => {
                scope.userRefresh = {
                    username: scope.account.username,
                    password: scope.account.password,
                    status: 1
                };
                accService.login(scope.userRefresh).then(resp => {
                    $rootScope.account = resp.data;
                    localStorageService.set('account', $rootScope.account);
                    scope.account = $rootScope.account;
                });
            });

            // update money event
            socketService.socketOn('updateMoney', resp => {
                scope.userRefresh = {
                    username: scope.account.username,
                    password: scope.account.password,
                    status: 1
                };
                accService.login(scope.userRefresh).then(resp => {
                    $rootScope.account = resp.data;
                    localStorageService.set('account', $rootScope.account);
                    scope.account = $rootScope.account;
                });
            });

            // show challenge modal 
            scope.showChallenge = () => {
                $mdDialog.show({
                    scope: scope.$new(),
                    templateUrl: 'components/challenge_modal/challenge.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: false,
                    fullscreen: scope.customFullscreen
                });
            };

            // receive challenge and open modal
            socketService.socketOn('challenge', from => {
                challengeAction = false;
                scope.challengerName = from.source.p1;
                scope.challengerId = from.source.p1_sockId;
                challengerUserId = from.source.p1_id;
                scope.showChallenge();
                timeTick(100);
                newChallengeSound.play();
                document.title = from.source.p1 + ' challenged you!';
            });

            // receive challenge response
            socketService.socketOn('challengeResponse', from => {
                if (from.source.response == 0) {
                    scope.challengedName = from.source.p2;
                    $mdDialog.show({
                        scope: scope.$new(),
                        templateUrl: 'components/challenge_modal/response.html',
                        parent: angular.element(document.body),
                        clickOutsideToClose: true,
                        fullscreen: scope.customFullscreen
                    });
                } else {
                    scope.contCtrl.enemy = from.source.p2;
                    socketService.socketEmit('joinGame', {
                        room: from.source.p2 + 'vs' + from.source.p1,
                        game_Id: from.source.game_Id
                    });
                    scope.contCtrl.ingame = true;
                    scope.contCtrl.viewValue = 'game';
                    scope.$apply();
                    scope.contCtrl.currGameId = from.source.game_Id;
                }
            });

            var timeTick = time => {
                if (challengeAction) {
                    return false;
                }
                scope.time = time;

                if (scope.time == 0) {
                    scope.declineChallenge();
                } else {
                    $timeout(() => {
                        timeTick(scope.time - 1);
                    }, 100);
                }
            };

            scope.closeResp = () => {
                $mdDialog.hide();
            };

            // decline challenge
            scope.declineChallenge = () => {
                document.title = 'Chess Heaven';
                challengeAction = true;
                $mdDialog.hide();
                socketService.socketEmit('challengeResponse', {
                    p2: $rootScope.account.username,
                    response: 0,
                    sockId: scope.challengerId
                });
            };

            scope.acceptChallenge = () => {
                document.title = 'Chess Heaven';
                challengeAction = true;
                scope.contCtrl.enemy = scope.challengerName;
                $mdDialog.hide();
                socketService.socketEmit('challengeResponse', {
                    p2: $rootScope.account.username,
                    p1: scope.challengerName,
                    response: 1,
                    sockId: scope.challengerId,
                    p2_id: $rootScope.account._id,
                    p1_id: challengerUserId
                });
            };

            socketService.socketOn('enterGame', from => {
                scope.contCtrl.ingame = true;
                scope.contCtrl.viewValue = 'game';
                scope.contCtrl.currGameId = from.source;
            });
        }
    };
};

myaccNavbar.$inject = ['$mdDialog', '$window', '$rootScope', 'accService', 'localStorageService', '$location', 'socketService', '$timeout'];

angular.module('berger').directive('myaccNavbar', myaccNavbar);

},{}],15:[function(require,module,exports){
const paginationComponent = ($rootScope, competitionService) => {
    return {
        templateUrl: 'components/pagination/pagination.html',
        restrict: 'E',
        scope: {
            competitions: '=',
            competitionId: '=',
            allGames: '=',
            filteredGames: '='
        },
        link: scope => {
            // Get the current competition
            scope.competition = scope.competitions.filter(obj => {
                return obj._id === scope.competitionId;
            })[0];

            // Create array for listing the rounds in the header of the stadings table
            if (scope.competition) scope.competitionRounds = new Array(scope.competition.rounds);

            // Returns another result set of games
            scope.getNewGameSet = round => {
                scope.filteredGames = scope.allGames.filter(obj => {
                    return obj.round === round;
                });
            };
            if (scope.competition) scope.getNewGameSet(scope.competition.current_round);

            $rootScope.$on('gameFinished', () => {
                competitionService.getCompetition().then(rsp => {
                    scope.competitions = rsp.data;
                    // Get the current competition
                    scope.competition = scope.competitions.filter(obj => {
                        return obj._id === scope.competitionId;
                    })[0];
                    if (scope.competition) scope.getNewGameSet(scope.competition.current_round);
                });
            });
        }
    };
};

paginationComponent.$inject = ['$rootScope', 'competitionService'];

angular.module('berger').directive('pagination', paginationComponent);

},{}],16:[function(require,module,exports){
const rainWithIcons = $timeout => {
	return {
		restrict: 'A',
		scope: true,
		link: (scope, element) => {

			// Generates a random int between two numbers
			scope.getRandomInt = (min, max) => {
				min = Math.ceil(min);
				max = Math.floor(max);
				return Math.floor(Math.random() * (max - min)) + min;
			};

			// Generates a random int between two numbers
			scope.getRandomArbitrary = (min, max) => {
				return Math.random() * (max - min) + min;
			};

			// Set timeout so we have the element data
			$timeout(() => {

				// Constants here 
				const listOfIcons = ['glyphicon-asterisk', 'glyphicon-plus', 'glyphicon-euro', 'glyphicon-minus', 'glyphicon-cloud', 'glyphicon-envelope', 'glyphicon-pencil', 'glyphicon-glass', 'glyphicon-music', 'glyphicon-search', 'glyphicon-heart', 'glyphicon-star'];
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
						const random = scope.getRandomInt(0, listOfIcons.length);
						const iconElm = angular.element(`<span class="glyphicon ${listOfIcons[random]}"></span>`);
						const leftMargin = i * 20;
						const animationDelay = scope.getRandomArbitrary(h, h + 3);
						const color = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
						iconElm.css('left', `${leftMargin}px`);
						iconElm.css('color', `${color}`);
						iconElm.css('animation-delay', `${animationDelay}s`);
						iconElm.css('animation-duration', `${parseInt(elementHeight / 50) * 2}s`);
						backElem.append(iconElm);
					}
				}

				// Insert the rain-emoji div into the target element
				// MAKE IT RAIN!!! :D
				attachElem.append(backElem);
			}, 1000);
		}
	};
};

rainWithIcons.$inject = ['$timeout'];

angular.module('berger').directive('rainWithIcons', rainWithIcons);

},{}],17:[function(require,module,exports){
const standingsComponent = $uibModal => {
    return {
        templateUrl: 'components/standings/standings.html',
        restrict: 'E',
        scope: {
            games: '=',
            players: '=',
            competitions: '=',
            competitionId: '='
        },
        link: scope => {
            // Returns the current competition based on the current tab
            scope.returnCompetition = () => {
                return scope.competitions.filter(obj => {
                    return obj._id === scope.competitionId;
                })[0];
            };

            // Make the calculation here
            scope.calculateStandings = () => {
                let stdObj = {};
                for (let i = 0; i < scope.games.length; i++) {
                    const obj = scope.games[i];
                    if (typeof stdObj[obj.p1_id] === 'undefined') {
                        stdObj[obj.p1_id] = {};
                        stdObj[obj.p1_id].rounds = {};
                        stdObj[obj.p1_id].score = 0;
                    }
                    if (typeof stdObj[obj.p2_id] === 'undefined') {
                        stdObj[obj.p2_id] = {};
                        stdObj[obj.p2_id].rounds = {};
                        stdObj[obj.p2_id].score = 0;
                    }

                    if (obj.status !== 0) {
                        let p1GameScore = 0;
                        let p2GameScore = 0;
                        if (obj.status === 2) {
                            stdObj[obj.p1_id].score += .5;
                            stdObj[obj.p2_id].score += .5;
                            p1GameScore = .5;
                            p2GameScore = .5;
                        } else if (obj.status === 1) {
                            stdObj[obj.p1_id].score += 1;
                            p1GameScore = 1;
                        } else {
                            stdObj[obj.p2_id].score += 1;
                            p2GameScore = 1;
                        }
                        stdObj[obj.p1_id].rounds[obj.round] = p1GameScore + '' + (obj.p1_color == 0 ? 'w' : 'b');
                        stdObj[obj.p2_id].rounds[obj.round] = p2GameScore + '' + (obj.p2_color == 0 ? 'w' : 'b');
                    } else {
                        stdObj[obj.p1_id].rounds[obj.round] = '-';
                        stdObj[obj.p2_id].rounds[obj.round] = '-';
                    }
                }

                const sorted = Object.keys(stdObj).sort((a, b) => {
                    return stdObj[b].score - stdObj[a].score;
                });

                const finalStats = {};
                for (let i = 0; i < sorted.length; i++) {
                    finalStats[sorted[i]] = stdObj[sorted[i]];
                }

                return finalStats;
            };

            // Open the modal that contains the stading table here
            scope.open = () => {
                const modalInstance = $uibModal.open({
                    templateUrl: 'standingsModal.html',
                    controller: ($scope, $uibModalInstance) => {
                        // Calculate standings when we open modal
                        $scope.standings = scope.calculateStandings();

                        // Get the current competition details
                        $scope.competition = scope.returnCompetition();

                        // Create array for listing the rounds in the header of the stadings table
                        $scope.competitionRounds = new Array($scope.competition.rounds);

                        // Returns the player by a specific id
                        $scope.getPlayerById = id => {
                            return scope.players.filter(obj => {
                                return obj._id === id;
                            })[0];
                        };

                        // When we hit the ok button
                        $scope.ok = () => {
                            $uibModalInstance.close();
                        };

                        // When we hit the cancel button
                        $scope.cancel = () => {
                            $uibModalInstance.dismiss('cancel');
                        };
                    }
                });

                modalInstance.result.then(() => {
                    // Manage when we hit the ok button
                    console.log('oki doki');
                }, () => {
                    // Manage when we hit the cancel button
                    console.log('oki doki cancel doki');
                });
            };
        }
    };
};

standingsComponent.$inject = ['$uibModal'];

angular.module('berger').directive('standings', standingsComponent);

},{}],18:[function(require,module,exports){
const tableComponent = () => {
    return {
        templateUrl: 'components/table/table-component.html',
        restrict: 'E',
        scope: {
            tableTitle: '@',
            tableHeaders: '=',
            tableKeys: '=',
            tableBody: '='
        },
        link: scope => {}
    };
};

tableComponent.$inject = [];

angular.module('berger').directive('tableComponent', tableComponent);

},{}],19:[function(require,module,exports){
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

    activateAcc(accData) {
        const configObject = {
            method: 'PUT',
            url: '/activate',
            data: JSON.stringify(accData)
        };
        return _$http(configObject);
    }

    sendCode(accData) {
        const configObject = {
            method: 'POST',
            url: '/activate',
            data: JSON.stringify(accData)
        };
        return _$http(configObject);
    }

    getPlayerById(data) {
        const configObject = {
            method: 'GET',
            url: '/players/' + data.id
        };
        return _$http(configObject);
    }

    updatePlayerStatus(data) {
        const configObject = {
            method: 'PUT',
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

    getPlayers(accData) {
        const configObject = {
            method: 'POST',
            url: '/players',
            data: JSON.stringify(accData)
        };
        return _$http(configObject);
    }

    updateMoney(data) {
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

},{}],20:[function(require,module,exports){
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
            url: '/bet/user/' + userid
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

    getAllBetsForGame(gameId) {
        const configObject = {
            method: 'GET',
            url: '/bet/' + gameId
        };
        return _$http(configObject);
    }

    updateAllBetsForGame(result) {
        const configObject = {
            method: 'PUT',
            url: '/bet/' + result.gameId,
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

},{}],21:[function(require,module,exports){
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
'';

},{}],22:[function(require,module,exports){
let _$http;
let _games;

class gameService {
    constructor($http) {
        _$http = $http;
        _games = [];
    }

    getGames(compId) {
        const configObject = {
            method: 'GET',
            url: `/game/` + compId
        };
        return _$http(configObject);
    }

    getGameById(id) {
        const configObject = {
            method: 'GET',
            url: '/gameById/' + id
        };
        return _$http(configObject);
    }

    endGame(data) {
        const configObject = {
            method: 'PUT',
            url: '/game',
            data: JSON.stringify(data)
        };
        return _$http(configObject);
    }

}

gameService.$inject = ['$http'];

angular.module('berger').service('gameService', gameService);

},{}],23:[function(require,module,exports){
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

},{}],24:[function(require,module,exports){
angular.module('berger').service('socketService', function () {

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

},{}]},{},[1,2,3,4,5,6,7,8,9,11,10,12,13,14,15,16,17,18,19,20,21,22,23,24]);
