// src/scripts/chess/AI.js - Inteligencia Artificial con Minimax
import { ChessBoard } from './Board.js';
import { Pawn } from './pieces/Pawn.js';
import { Knight } from './pieces/Knight.js';
import { Bishop } from './pieces/Bishop.js';
import { Rook } from './pieces/Rook.js';
import { Queen } from './pieces/Queen.js';
import { King } from './pieces/King.js';

export class ChessAI {
  constructor(level = 2) {
    this.level = level;
    this.maxDepth = level === 1 ? 2 : level === 2 ? 3 : 4;
    this.nodesEvaluated = 0;
  }
  
  setLevel(level) {
    this.level = level;
    this.maxDepth = level === 1 ? 2 : level === 2 ? 3 : 4;
  }
  
  getBestMove(board, color) {
    this.nodesEvaluated = 0;
    const startTime = Date.now();
    
    const moves = this.getAllValidMoves(board, color);
    if (moves.length === 0) return null;
    
    let bestMove = null;
    let bestValue = color === 'white' ? -Infinity : Infinity;
    
    // Ordenar movimientos para mejor poda (capturas primero)
    moves.sort((a, b) => {
      const pieceA = board.getPiece(a.to.row, a.to.col);
      const pieceB = board.getPiece(b.to.row, b.to.col);
      return (pieceB?.value || 0) - (pieceA?.value || 0);
    });
    
    for (const move of moves) {
      const boardCopy = board.clone();
      boardCopy.movePiece(move.from.row, move.from.col, move.to.row, move.to.col);
      
      const value = this.minimax(
        boardCopy,
        this.maxDepth - 1,
        -Infinity,
        Infinity,
        color === 'black'
      );
      
      if (color === 'white' && value > bestValue) {
        bestValue = value;
        bestMove = move;
      } else if (color === 'black' && value < bestValue) {
        bestValue = value;
        bestMove = move;
      }
    }
    
    const endTime = Date.now();
    console.log(`AI (${color}) evaluated ${this.nodesEvaluated} nodes in ${endTime - startTime}ms`);
    
    return bestMove;
  }
  
  minimax(board, depth, alpha, beta, isMaximizing) {
    this.nodesEvaluated++;
    
    // Condiciones de terminación
    if (depth === 0) {
      return this.evaluateBoard(board);
    }
    
    const color = isMaximizing ? 'white' : 'black';
    const moves = this.getAllValidMoves(board, color);
    
    // Jaque mate o tablas
    if (moves.length === 0) {
      if (board.isInCheck(color)) {
        // Jaque mate
        return isMaximizing ? -100000 + (this.maxDepth - depth) : 100000 - (this.maxDepth - depth);
      }
      // Tablas (stalemate)
      return 0;
    }
    
    // Empate por repetición o regla de 50 movimientos
    if (board.halfMoveClock >= 50) {
      return 0;
    }
    
    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        const boardCopy = board.clone();
        boardCopy.movePiece(move.from.row, move.from.col, move.to.row, move.to.col);
        
        const eval_ = this.minimax(boardCopy, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, eval_);
        alpha = Math.max(alpha, eval_);
        
        if (beta <= alpha) break; // Poda alfa-beta
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        const boardCopy = board.clone();
        boardCopy.movePiece(move.from.row, move.from.col, move.to.row, move.to.col);
        
        const eval_ = this.minimax(boardCopy, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, eval_);
        beta = Math.min(beta, eval_);
        
        if (beta <= alpha) break; // Poda alfa-beta
      }
      return minEval;
    }
  }
  
  getAllValidMoves(board, color) {
    const validMoves = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board.getPiece(row, col);
        if (piece && piece.color === color) {
          // Crear pieza temporal con posición correcta
          let tempPiece;
          const pos = { row, col };
          
          switch (piece.type) {
            case 'pawn':
              tempPiece = new Pawn(piece.color, pos);
              break;
            case 'knight':
              tempPiece = new Knight(piece.color, pos);
              break;
            case 'bishop':
              tempPiece = new Bishop(piece.color, pos);
              break;
            case 'rook':
              tempPiece = new Rook(piece.color, pos);
              break;
            case 'queen':
              tempPiece = new Queen(piece.color, pos);
              break;
            case 'king':
              tempPiece = new King(piece.color, pos);
              break;
            default:
              continue;
          }
          
          tempPiece.hasMoved = piece.hasMoved;
          
          let moves;
          if (piece.type === 'king') {
            moves = tempPiece.getPossibleMoves(board.grid, {
              kingside: board.canCastle(color, 'kingside'),
              queenside: board.canCastle(color, 'queenside')
            });
          } else {
            moves = tempPiece.getPossibleMoves(board.grid, board.enPassantTarget);
          }
          
          // Filtrar movimientos que dejan al rey en jaque
          for (const move of moves) {
            const boardCopy = board.clone();
            boardCopy.movePiece(row, col, move.row, move.col);
            
            if (!boardCopy.isInCheck(color)) {
              validMoves.push({
                from: { row, col },
                to: { row: move.row, col: move.col },
                piece: piece,
                capture: move.capture,
                enPassant: move.enPassant,
                castling: move.castling
              });
            }
          }
        }
      }
    }
    
    return validMoves;
  }
  
  evaluateBoard(board) {
    let score = 0;
    
    // Material y posición
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board.getPiece(row, col);
        if (piece) {
          let value = piece.value + piece.getPositionValue();
          if (piece.color === 'white') {
            score += value;
          } else {
            score -= value;
          }
        }
      }
    }
    
    // Penalización por jaque
    if (board.isInCheck('white')) score -= 50;
    if (board.isInCheck('black')) score += 50;
    
    // Bonus por control del centro
    const centerSquares = [[3, 3], [3, 4], [4, 3], [4, 4]];
    for (const [row, col] of centerSquares) {
      const piece = board.getPiece(row, col);
      if (piece) {
        if (piece.color === 'white') score += 10;
        else score -= 10;
      }
    }
    
    // Bonus por desarrollo de piezas menores
    const minorPiecesDeveloped = { white: 0, black: 0 };
    for (let col = 0; col < 8; col++) {
      // Caballos
      if (board.getPiece(5, col)?.type === 'knight' && board.getPiece(5, col)?.color === 'white') {
        minorPiecesDeveloped.white++;
      }
      if (board.getPiece(2, col)?.type === 'knight' && board.getPiece(2, col)?.color === 'black') {
        minorPiecesDeveloped.black++;
      }
      // Alfiles
      if (board.getPiece(5, col)?.type === 'bishop' && board.getPiece(5, col)?.color === 'white') {
        minorPiecesDeveloped.white++;
      }
      if (board.getPiece(2, col)?.type === 'bishop' && board.getPiece(2, col)?.color === 'black') {
        minorPiecesDeveloped.black++;
      }
    }
    score += minorPiecesDeveloped.white * 5;
    score -= minorPiecesDeveloped.black * 5;
    
    return score;
  }
}
