// src/scripts/chess/pieces/Rook.js - Clase Torre
import { Piece } from '../Piece.js';

export class Rook extends Piece {
  constructor(color, position) {
    super('rook', color, position);
  }
  
  getPossibleMoves(board) {
    const moves = [];
    const directions = [
      [-1, 0], [1, 0],   // Vertical
      [0, -1], [0, 1]    // Horizontal
    ];
    
    for (const [dRow, dCol] of directions) {
      this.addMovesInDirection(board, moves, dRow, dCol);
    }
    
    return moves;
  }
  
  addMovesInDirection(board, moves, dRow, dCol) {
    const { row, col } = this.position;
    let currentRow = row + dRow;
    let currentCol = col + dCol;
    
    while (this.isValidPosition(currentRow, currentCol)) {
      const targetPiece = board[currentRow][currentCol];
      
      if (!targetPiece) {
        moves.push({ row: currentRow, col: currentCol });
      } else {
        if (targetPiece.color !== this.color) {
          moves.push({ row: currentRow, col: currentCol, capture: true });
        }
        break;
      }
      
      currentRow += dRow;
      currentCol += dCol;
    }
  }
  
  isValidPosition(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }
}
