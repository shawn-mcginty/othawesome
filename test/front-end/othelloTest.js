var assert = chai.assert;

describe('othello', function(){

	describe('newGame()', function(){
		it('should create a new game board with beginning peices on it when no game has been loaded', function(){
			var expectedGameBoard = [ 
				[Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE],
				[Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE],
				[Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.BLACK_POSSIBLE_MOVE, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE],
				[Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.BLACK_POSSIBLE_MOVE, Othello.WHITE_PLAYER_TOKEN, Othello.BLACK_PLAYER_TOKEN, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE],
				[Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.BLACK_PLAYER_TOKEN, Othello.WHITE_PLAYER_TOKEN, Othello.BLACK_POSSIBLE_MOVE, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE],
				[Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.BLACK_POSSIBLE_MOVE, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE],
				[Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE],
				[Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE, Othello.EMPTY_GAME_SPACE] 
			];

			Othello.newGame();
			var actualGameBoard = Othello.getGameBoard();

			assert.isArray(actualGameBoard);
			actualGameBoard.forEach(function(column, rowIndex, actualArray){
				column.forEach(function(value, colIndex, columnArray){
					assert.equal(actualGameBoard[rowIndex][colIndex], expectedGameBoard[rowIndex][colIndex]);
				});
			});
		});

		it('should start black player with 2 score and 30 discs', function(){
			var expectedScore = 2;
			var expectedDiscs = 30;

			Othello.newGame();
			var actualBlackPlayer = Othello.getBlackPlayer();

			assert.equal(actualBlackPlayer.score, expectedScore);
			assert.equal(actualBlackPlayer.discs, expectedDiscs);
		});

		it('should start white player with 2 score and 30 discs', function(){
			var expectedScore = 2;
			var expectedDiscs = 30;

			Othello.newGame();
			var actualWhitePlayer = Othello.getWhitePlayer();

			assert.equal(actualWhitePlayer.score, expectedScore);
			assert.equal(actualWhitePlayer.discs, expectedDiscs);
		});
	});

	describe('makeMove()', function(){
		it('should advance game turn', function(){
			var expectedIsBlackPlayersTurn = false;

			Othello.newGame();
			Othello.makeMove(3, 2);
			var actualIsBlackPlayersTurn = Othello.isBlackPlayersTurn();

			assert.equal(actualIsBlackPlayersTurn, expectedIsBlackPlayersTurn);
		});

		it('should place black players peice', function(){
			var column = 3;
			var row = 2;
			var expectedPeice = Othello.BLACK_PLAYER_TOKEN;

			Othello.newGame();
			Othello.makeMove(row, column);
			var actualPeice = Othello.getGameBoard()[row][column];

			assert.equal(actualPeice, expectedPeice);
		});

		it('should decrement black players discs', function(){
			var expectedDiscCount = 29;

			Othello.newGame();
			Othello.makeMove(2,3);
			var actualDiscCount = Othello.getBlackPlayer().discs;

			assert.equal(actualDiscCount, expectedDiscCount);
		});

		it('should add white players possible moves to the board', function(){
			var expectedBoardSpace = Othello.WHITE_POSSIBLE_MOVE;

			Othello.newGame();
			Othello.makeMove(2,3);
			var actualBoardSpace = Othello.getGameBoard()[2][2];

			assert.equal(actualBoardSpace, expectedBoardSpace);
		});

		it('should capture enemy disc', function(){
			var expectedGameBoardPeice = Othello.BLACK_PLAYER_TOKEN;

			Othello.newGame();
			Othello.makeMove(2,3);
			var actualBoardSpace = Othello.getGameBoard()[3][3];

			assert.equal(actualBoardSpace, expectedGameBoardPeice);
		});

		it('should increment black player points', function(){
			var expectedPoints = 4;

			Othello.newGame();
			Othello.makeMove(2,3);
			var actualPoints = Othello.getBlackPlayer().score;

			assert.equal(actualPoints, expectedPoints);
		});

		it('should act as expected after several moves', function(){
			var expectedPeice = Othello.BLACK_PLAYER_TOKEN;

			Othello.newGame();
			Othello.makeMove(2,3);
			Othello.makeMove(4,2);
			Othello.makeMove(5,4);
			var actualPeice = Othello.getGameBoard()[2][3];

			assert.equal(actualPeice, expectedPeice);
		});

		it('should show possible diagnal moves correctly', function(){
			var expectedPeice = Othello.BLACK_POSSIBLE_MOVE;

			Othello.newGame();
			Othello.makeMove(2,3);
			Othello.makeMove(4,2);
			var actualPeice = Othello.getGameBoard()[5][5];

			assert.equal(actualPeice, expectedPeice);
		});
	});

	describe('isBlackPlayerWinning()', function(){
		it('should be true when black player has more points', function(){
			Othello.newGame();
			Othello.makeMove(2,3);

			assert.equal(Othello.isBlackPlayerWinning(), true);
		});
	});

	describe('newGameWithCPU()', function(){
		it('should make a move by itself on white players turn', function(){
			Othello.newGameWithCPU();
			Othello.makeMove(2,3);
				
			assert.equal(Othello.isBlackPlayersTurn(), true);
		});
	});

	describe('isGameOver()', function(){
		it('should return true when game board is full', function(){
			var fullBoard = [1,1,1,1,1,1,1,1];
			fullBoard.forEach(function(row, rowIndex){
				var fullRow = [Othello.BLACK_PLAYER_TOKEN,Othello.BLACK_PLAYER_TOKEN,Othello.BLACK_PLAYER_TOKEN,Othello.BLACK_PLAYER_TOKEN,Othello.BLACK_PLAYER_TOKEN,
				Othello.BLACK_PLAYER_TOKEN,Othello.BLACK_PLAYER_TOKEN,Othello.BLACK_PLAYER_TOKEN];

				fullBoard[rowIndex] = fullRow;
			});
			var gameToLoad = {
				whitePlayerDiscs: 1,
				blackPlayerDiscs: 1,
				whitePlayerPoints: 1,
				blackPlayerPoints: 1,
				gameBoard: fullBoard,
				isBlackPlayersTurn: true,
				isCPU: false,
				id: 0
			}

			Othello.loadGame(gameToLoad);
			Othello.startGame();

			assert.equal(Othello.isGameOver(), true);
		});
	});
});