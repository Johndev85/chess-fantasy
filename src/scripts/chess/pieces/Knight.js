// src/scripts/chess/pieces/Knight.js - Clase Caballo
import { Piece } from '../Piece.js';

export class Knight extends Piece {
  constructor(color, position) {
    super('knight', color, position);
  }
  
  getPossibleMoves(board) {
    const moves = [];
    const { row, col } = this.position;
    
    // Los 8 movimientos posibles del caballo
    const offsets = [
      [-2, -1], [-2, 1],
      [-1, -2], [-1, 2],
      [1, -2], [1, 2],
      [2, -1], [2, 1]
    ];
    
    for (const [dRow, dCol] of offsets) {
      const newRow = row + dRow;
      const newCol = col + dCol;
      
      if (this.isValidPosition(newRow, newCol)) {
        const targetPiece = board[newRow][newCol];
        if (!targetPiece || targetPiece.color !== this.color) {
          moves.push({
            row: newRow,
            col: newCol,
            capture: !!targetPiece
          });
        }
      }
    }
    
    return moves;
  }
  
  isValidPosition(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }
}
