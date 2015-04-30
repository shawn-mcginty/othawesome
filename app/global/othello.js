'use strict';

(function (root, factory) {
	if(typeof module === "object" && module.exports) {
		module.exports = factory();
	} else if(typeof define === "function" && define.amd) {
		define([], factory);
	} else {
		root.Othello = factory(root.Rx);
	}
}(this, function(Rx){
	var othello = {}
	othello.BLACK_PLAYER_TOKEN = 'BLACK_PLAYER_TOKEN';
	othello.WHITE_PLAYER_TOKEN = 'WHITE_PLAYER_TOKEN';
	othello.WHITE_POSSIBLE_MOVE = 'WHITE_POSSIBLE_MOVE';
	othello.BLACK_POSSIBLE_MOVE = 'BLACK_POSSIBLE_MOVE';
	othello.EMPTY_GAME_SPACE = 'EMPTY_SPACE';

	var game = {
		whitePlayerDiscs: 0,
		blackPlayerDiscs: 0,
		whitePlayerPoints: 0,
		blackPlayerPoints: 0,
		gameBoard: [],
		isBlackPlayersTurn: true,
		isCPU: false
	}

	othello.getWhitePlayer = function(){
		var whitePlayer = { score: game.whitePlayerPoints,
			discs: game.whitePlayerDiscs}
		return whitePlayer;
	}

	othello.getBlackPlayer = function(){
		var blackPlayer = { score: game.blackPlayerPoints,
			discs: game.blackPlayerDiscs}
		return blackPlayer;
	}

	othello.loadGame = function(gameToLoad){
		game = gameToLoad;
	}

	othello.getGame = function(){
		return game;
	}

	othello.getGameBoard = function(){
		return game.gameBoard;
	}

	othello.isBlackPlayersTurn = function(){
		return game.isBlackPlayersTurn;
	}

	othello.isBlackPlayerWinning = function(){
		return game.blackPlayerPoints > game.whitePlayerPoints;
	}

	othello.isTie = function(){
		return game.blackPlayerPoints == game.whitePlayerPoints;
	}

	othello.hasNoAvailableMoves = function(){
		if(game.isBlackPlayersTurn && game.blackPlayerDiscs <= 0){
			return true;
		} else if(game.isBlackPlayersTurn == false && game.whitePlayerDiscs <= 0){
			return true;
		}

		var availableMoves = game.gameBoard.filter(function(row){
			return row.filter(function(value){
				if(game.isBlackPlayersTurn){
					return value == othello.BLACK_POSSIBLE_MOVE;
				} else{
					return value == othello.WHITE_POSSIBLE_MOVE;
				}
			}).length > 0;
		});

		return availableMoves.length <= 0;
	}

	othello.isGameOver = function(){
		if(bothPlayersHaveNoPossibleMoves()){
			return true;
		} else {
			return false;
		}
	}

	othello.newGame = function(id){
		game.gameBoard = [];
		game.isCPU = false;
		game._id = id;
		othello.startGame(id);
	}

	othello.newGameWithCPU = function(id){
		game.gameBoard = [];
		game.isCPU = true;
		game._id = id;
		othello.startGame(id);
	}

	othello.startGame = function(id){
		if(gameBoardIsEmpty()){
			game.gameBoard = createNewGameBoard();
			game.whitePlayerPoints = 2;
			game.whitePlayerDiscs = 30;
			game.blackPlayerPoints = 2;
			game.blackPlayerDiscs = 30;
			game.isBlackPlayersTurn = true;
			if(id){
				game._id = id;
			}
			putPossibleMovesOnTheGameBoard();
		}
	}

	othello.getObservableGame = function(){
		var MILLIS_TO_WAIT = 100;
		return Rx.Observable.ofObjectChanges(game)
			.throttleWithTimeout(MILLIS_TO_WAIT);
	}

	othello.makeMove = function(rowIndex, colIndex){
		var moveCoords = { row: rowIndex, column: colIndex }
		if(game.isBlackPlayersTurn){
			modifyBlackPlayerDiscs(-1);
			game.gameBoard[rowIndex][colIndex] = othello.BLACK_PLAYER_TOKEN;
		} else {
			modifyWhitePlayerDiscs(-1);
			game.gameBoard[rowIndex][colIndex] = othello.WHITE_PLAYER_TOKEN;
		}

		captureAllFlankedEnemyDiscs(moveCoords);
		calculatePlayerPoints();
		advanceTurn();
		putPossibleMovesOnTheGameBoard();

		if(game.isBlackPlayersTurn == false && game.isCPU){
			makeRandomAvailableMove();
		}
	}

	var bothPlayersHaveNoPossibleMoves = function(){
		var hasNoPossibleMoves;

		if(othello.hasNoAvailableMoves()){
			advanceTurn();
			putPossibleMovesOnTheGameBoard();
			if(othello.hasNoAvailableMoves()){
				hasNoPossibleMoves = true;
			} else {
				hasNoPossibleMoves = false;
			}
			advanceTurn();
		} else {
			hasNoPossibleMoves = false;
		}

		return hasNoPossibleMoves;
	}

	var makeRandomAvailableMove = function(){
		var randomAvailableCoords = ArrayUtils.shuffle(getAllAvailableMoves())[0];
		if(randomAvailableCoords){
			othello.makeMove(randomAvailableCoords.row, randomAvailableCoords.column);
		} else {
			advanceTurn();
		}
	}

	var getAllAvailableMoves = function(){
		var availableMoves = [];
		game.gameBoard.forEach(function(row, rowIndex){
			row.forEach(function(value, colIndex){
				if(game.isBlackPlayersTurn && value == othello.BLACK_POSSIBLE_MOVE){
					availableMoves.push({row: rowIndex, column: colIndex});
				} else if(game.isBlackPlayersTurn == false && value == othello.WHITE_POSSIBLE_MOVE){
					availableMoves.push({row: rowIndex, column: colIndex});
				}
			});
		});

		return availableMoves;
	}

	var captureAllFlankedEnemyDiscs = function(flankedBy){
		var capturedCoords = [];

		while(hasFlanked(getAllAdjacentEnemyCoordinates(flankedBy), flankedBy)){
			getAllAdjacentEnemyCoordinates(flankedBy).forEach(function(coords){
				if(isFlanked(coords, flankedBy)){
					getAllFlankedEenemiesInDirection(coords, flankedBy).forEach(function(enemy){
						if(game.isBlackPlayersTurn){
							game.gameBoard[enemy.row][enemy.column] = othello.BLACK_PLAYER_TOKEN;
						} else{
							game.gameBoard[enemy.row][enemy.column] = othello.WHITE_PLAYER_TOKEN;
						}
					});
				}
			});
		}
	}

	var getAllAdjacentEnemyCoordinates = function(coords){
		var adjacentSpaces = [
			getNorth(coords),
			getNorthEast(coords),
			getEast(coords),
			getSouthEast(coords),
			getSouth(coords),
			getSouthWest(coords),
			getWest(coords),
			getNorthWest(coords)
		];

		return adjacentSpaces.filter(function(space){
			return isOccupiedByEnemy(space.row, space.column);
		});
	}

	var hasFlanked = function(coordsArray, flankedBy) {
		var flankedEnemies = coordsArray.filter(function(coords){
			return isFlanked(coords, flankedBy);
		});

		return flankedEnemies.length > 0;
	}

	var isFlanked = function(coords, flankedBy){
		if(areSamePlace(getNorth(coords), flankedBy) || areSamePlace(getSouth(coords), flankedBy)){
			if(hasEnemyToTheNorth(coords) && hasEnemyToTheSouth(coords)){
				return true;
			} else {
				return false;
			}
		} else if(areSamePlace(getEast(coords), flankedBy) || areSamePlace(getWest(coords),flankedBy)){
			if(hasEnemyToTheEast(coords) && hasEnemyToTheWest(coords)){
				return true;
			} else {
				return false;
			}
		} else if(areSamePlace(getNorthWest(coords), flankedBy) || areSamePlace(getSouthEast(coords), flankedBy)){
			if(hasEnemyToTheNorthWest(coords) && hasEnemyToTheSouthEast(coords)){
				return true;
			} else {
				return false;
			}
		} else if(areSamePlace(getNorthEast(coords), flankedBy) || areSamePlace(getSouthWest(coords),flankedBy)){ 
			if(hasEnemyToTheNorthEast(coords) && hasEnemyToTheSouthWest(coords)){
				return true;
			} else {
				return false;
			}
		} else return false;
	}

	var areSamePlace = function(coords1, coords2){
		return coords1.row == coords2.row && coords1.column == coords2.column;
	}

	var hasEnemyToTheWest = function(coords){
		return hasEnemyToTheDirection(coords, getWest);
	}

	var hasEnemyToTheEast = function(coords){
		return hasEnemyToTheDirection(coords, getEast);
	}	

	var hasEnemyToTheNorth = function(coords){
		return hasEnemyToTheDirection(coords, getNorth);
	}

	var hasEnemyToTheSouth = function(coords){
		return hasEnemyToTheDirection(coords, getSouth);
	}

	var hasEnemyToTheNorthWest = function(coords){
		return hasEnemyToTheDirection(coords, getNorthWest);
	}

	var hasEnemyToTheSouthWest = function(coords){
		return hasEnemyToTheDirection(coords, getSouthWest);
	}

	var hasEnemyToTheSouthEast = function(coords){
		return hasEnemyToTheDirection(coords, getSouthEast);
	}

	var hasEnemyToTheNorthEast = function(coords){
		return hasEnemyToTheDirection(coords, getNorthEast);
	}

	var hasEnemyToTheDirection = function(coords, getDirection){
		var friendly = game.gameBoard[coords.row][coords.column];
		var enemy;
		
		if(friendly == othello.BLACK_PLAYER_TOKEN){
			enemy = othello.WHITE_PLAYER_TOKEN;
		} else {
			enemy = othello.BLACK_PLAYER_TOKEN;
		}

		var nextCoords = getDirection(coords);
		var hasEnemyToDirection = false;

		while(coordinatesOutOfBounds(nextCoords) == false){
			var token = game.gameBoard[nextCoords.row][nextCoords.column];
			if(token == enemy){
				hasEnemyToDirection = true;
				break;
			} else if(token == friendly){
				nextCoords = getDirection(nextCoords);
				continue;
			} else {
				break;
			}
		}

		return hasEnemyToDirection;
	}

	var getAllFlankedEenemiesInDirection = function(coords, flankedBy){
		if(areSamePlace(getNorth(flankedBy), coords)){
			return getAllEnemiesInDirection(flankedBy, getNorth);
		} else if(areSamePlace(getNorthEast(flankedBy), coords)){
			return getAllEnemiesInDirection(flankedBy, getNorthEast);
		} else if(areSamePlace(getEast(flankedBy), coords)){
			return getAllEnemiesInDirection(flankedBy, getEast);
		} else if(areSamePlace(getSouthEast(flankedBy), coords)){
			return getAllEnemiesInDirection(flankedBy, getSouthEast);
		} else if(areSamePlace(getSouth(flankedBy), coords)){
			return getAllEnemiesInDirection(flankedBy, getSouth);
		} else if(areSamePlace(getSouthWest(flankedBy), coords)){
			return getAllEnemiesInDirection(flankedBy, getSouthWest);
		} else if(areSamePlace(getWest(flankedBy), coords)){
			return getAllEnemiesInDirection(flankedBy, getWest);
		} else if(areSamePlace(getNorthWest(flankedBy), coords)){
			return getAllEnemiesInDirection(flankedBy, getNorthWest);
		} else {
			return [];
		}
	}

	var getAllEnemiesInDirection = function(coords, getDirection){
		var enemies = [];

		var nextCoords = getDirection(coords);

		while(isOccupiedByEnemy(nextCoords.row, nextCoords.column)){
			enemies.push(nextCoords);
			nextCoords = getDirection(nextCoords);
		}

		return enemies;
	}

	var calculatePlayerPoints = function(){
		var blackPlayerPoints = 0;
		var whitePlayerPoints = 0;

		game.gameBoard.forEach(function(row, rowIndex){
			row.forEach(function(value, columnIndex){
				if(value == othello.WHITE_PLAYER_TOKEN){
					whitePlayerPoints++;
				} else if (value == othello.BLACK_PLAYER_TOKEN){
					blackPlayerPoints++;
				}
			});
		});

		game.blackPlayerPoints = blackPlayerPoints;
		game.whitePlayerPoints = whitePlayerPoints;
	}

	var advanceTurn = function(){
		game.isBlackPlayersTurn = !game.isBlackPlayersTurn;
	}

	var gameBoardIsEmpty = function(){
		if(game === undefined || game === null){
			game = {}
		}

		if(game.gameBoard === undefined){
			return true;
		}

		return game.gameBoard.length === 0;
	}

	var createNewGameBoard = function(){
		var numOfColumns = 8;
		var numOfRows = 8;
		var grid = [];

		for(var row = 0; row < numOfRows; row++){
			var newRow = [];

			for(var column = 0; column < numOfColumns; column++){
				if(row == 3){
					if(column == 3){
						newRow.push(othello.WHITE_PLAYER_TOKEN);
					} else if(column == 4){
						newRow.push(othello.BLACK_PLAYER_TOKEN);
					} else {
						newRow.push(othello.EMPTY_GAME_SPACE);
					}
				} else if(row == 4){
					if(column == 3){
						newRow.push(othello.BLACK_PLAYER_TOKEN);
					} else if(column == 4){
						newRow.push(othello.WHITE_PLAYER_TOKEN);
					} else {
						newRow.push(othello.EMPTY_GAME_SPACE);
					}
				} else {
					newRow.push(othello.EMPTY_GAME_SPACE);
				}
			}

			grid.push(newRow);
		}

		return grid;
	}

	var modifyWhitePlayerPoints = function(points){
		game.whitePlayerPoints = game.whitePlayerPoints + points;
	}

	var modifyBlackPlayerPoints = function(points){
		game.blackPlayerPoints = game.blackPlayerPoints + points;
	}

	var modifyWhitePlayerDiscs = function(discs){
		game.whitePlayerDiscs = game.whitePlayerDiscs + discs;

		if(game.whitePLayerDiscs < 0){
			game.blackPlayerDiscs = game.blackPlayerDiscs + game.whitePlayerDiscs;
			game.whitePlayerDiscs = 0;
		}
	}
	
	var modifyBlackPlayerDiscs = function(discs){
		game.blackPlayerDiscs = game.blackPlayerDiscs + discs;

		if(game.blackPlayerDiscs < 0){
			game.whitePlayerDiscs = game.whitePlayerDiscs + game.blackPlayerDiscs;
			game.blackPlayerDiscs = 0;
		}
	}

	var putPossibleMovesOnTheGameBoard = function(){
		removeOldPossibleMoves();
		getAllEnemyCoordinates().forEach(function(coords){
			var northCoords = getNorth(coords);
			var eastCoords = getEast(coords);
			var southCoords = getSouth(coords);
			var westCoords = getWest(coords);
			var northWest = getNorthWest(coords);
			var northEast = getNorthEast(coords);
			var southWest = getSouthWest(coords);
			var southEast = getSouthEast(coords);

			if(isPossibleMove(northCoords)){
				pushPossibleMoveToBoard(northCoords);
			}

			if(isPossibleMove(eastCoords)){
				pushPossibleMoveToBoard(eastCoords);
			}

			if(isPossibleMove(southCoords)){
				pushPossibleMoveToBoard(southCoords);
			}

			if(isPossibleMove(westCoords)){
				pushPossibleMoveToBoard(westCoords);
			}

			if(isPossibleMove(northWest)){
				pushPossibleMoveToBoard(northWest);
			}

			if(isPossibleMove(northEast)){
				pushPossibleMoveToBoard(northEast)
			}

			if(isPossibleMove(southWest)){
				pushPossibleMoveToBoard(southWest);
			}

			if(isPossibleMove(southEast)){
				pushPossibleMoveToBoard(southEast);
			}
		});
	}

	var removeOldPossibleMoves = function(){
		game.gameBoard.forEach(function(row, rowIndex){
			row.forEach(function(value, columnIndex){
				if(game.isBlackPlayersTurn && value == othello.WHITE_POSSIBLE_MOVE){
					game.gameBoard[rowIndex][columnIndex] = othello.EMPTY_GAME_SPACE;
				} else if(game.isBlackPlayersTurn == false && value == othello.BLACK_POSSIBLE_MOVE){
					game.gameBoard[rowIndex][columnIndex] = othello.EMPTY_GAME_SPACE;
				}
			});
		});
	}

	var getAllEnemyCoordinates = function(){
		var enemyCoordinates = [];

		game.gameBoard.forEach(function(row, rowIndex){
			row.forEach(function(value, columnIndex){
				if(game.isBlackPlayersTurn && value == othello.WHITE_PLAYER_TOKEN){
					var coords = {
						row: rowIndex,
						column: columnIndex
					}

					enemyCoordinates.push(coords);
				} else if(game.isBlackPlayersTurn == false && value == othello.BLACK_PLAYER_TOKEN){
					var coords = {
						row: rowIndex,
						column: columnIndex
						
					}

					enemyCoordinates.push(coords);
				}
			});
		});

		return enemyCoordinates;
	}

	var getNorth = function(coords){
		var northCoords = {
			row: coords.row - 1,
			column: coords.column}

		return northCoords;
	}

	var getNorthEast = function(coords){
		return getEast(getNorth(coords));
	}

	var getSouth = function(coords){
		var southCoords = {
			row: coords.row + 1,
			column: coords.column}

		return southCoords;
	}

	var getSouthEast = function(coords){
		return getEast(getSouth(coords));
	}

	var getEast = function(coords){
		var eastCoords = {
			row: coords.row,
			column: coords.column + 1}

		return eastCoords;
	}

	var getSouthWest = function(coords){
		return getWest(getSouth(coords));
	}

	var getWest = function(coords){
		var westCoords = {
			row: coords.row,
			column: coords.column -1}

		return westCoords;
	}

	var getNorthWest = function(coords){
		return getWest(getNorth(coords));
	}

	var isPossibleMove = function(coords){
		if(isUnoccupied(coords.row, coords.column) == false){
			return false;
		} else if(testNorth(coords)){
			return true;
		} else if(testNorthEast(coords)){
			return true;
		} else if(testEast(coords)){
			return true;
		} else if (testSouthEast(coords)){
			return true;
		} else if(testSouth(coords)){
			return true;
		} else if(testSouthWest(coords)){
			return true;
		} else if(testWest(coords)){
			return true;
		} else if(testNorthWest(coords)){
			return true;
		} else {
			return false;
		}
	}

	var testNorth = function(coords){
		return testDirection(coords, getNorth);
	}

	var testNorthEast = function(coords){
		return testDirection(coords, getNorthEast);
	}

	var testNorthWest = function(coords){
		return testDirection(coords, getNorthWest);		
	}

	var testSouth = function(coords){
		return testDirection(coords, getSouth);
	}

	var testEast = function(coords){
		return testDirection(coords, getEast);
	}

	var testWest = function(coords){
		return testDirection(coords, getWest);
	}

	var testSouthEast = function(coords){
		return testDirection(coords, getSouthEast);
	}

	var testSouthWest = function(coords){
		return testDirection(coords, getSouthWest);
	}

	var testDirection = function(coords, getDirection){
		var nextInDirection = getDirection(coords);
		var atLestOneEnemyFound = false;

		while(isOccupiedByEnemy(nextInDirection.row, nextInDirection.column)){
			atLestOneEnemyFound = true;
			nextInDirection = getDirection(nextInDirection);
		}

		if(atLestOneEnemyFound && isOccupiedByFriendly(nextInDirection.row, nextInDirection.column)){
			return true;
		} else {
			return false;
		}
	}

	var pushPossibleMoveToBoard = function(coords){
		if(coordinatesOutOfBounds(coords.row, coords.column)){
			return null;
		}

		if(game.isBlackPlayersTurn){
			game.gameBoard[coords.row][coords.column] = othello.BLACK_POSSIBLE_MOVE;
		} else {
			game.gameBoard[coords.row][coords.column] = othello.WHITE_POSSIBLE_MOVE;
		}
	}

	var isUnoccupied = function(rowIndex, colIndex){
		if(coordinatesOutOfBounds(rowIndex, colIndex)){
			return false;
		}

		return game.gameBoard[rowIndex][colIndex] == othello.EMPTY_GAME_SPACE;
	}

	var coordinatesOutOfBounds = function(rowIndex, colIndex){
		if(colIndex == undefined){
			colIndex = rowIndex.column;
			rowIndex = rowIndex.row;
		}
		return rowIndex < 0 || rowIndex > 7 || colIndex < 0 || colIndex > 7;
	}

	var isOccupiedByEnemy = function(rowIndex, colIndex){
		if(coordinatesOutOfBounds(rowIndex, colIndex)){
			return false;
		}

		if(game.isBlackPlayersTurn){
			return game.gameBoard[rowIndex][colIndex] == othello.WHITE_PLAYER_TOKEN;
		} else {
			return game.gameBoard[rowIndex][colIndex] == othello.BLACK_PLAYER_TOKEN;
		}
	}

	var isOccupiedByFriendly = function(rowIndex, colIndex){
		if(coordinatesOutOfBounds(rowIndex, colIndex)){
			return false;
		}

		if(game.isBlackPlayersTurn){
			return game.gameBoard[rowIndex][colIndex] == othello.BLACK_PLAYER_TOKEN;
		} else {
			return game.gameBoard[rowIndex][colIndex] == othello.WHITE_PLAYER_TOKEN;
		}
	}

	return othello;
}));