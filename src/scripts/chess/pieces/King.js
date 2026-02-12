// src/scripts/chess/pieces/King.js - Clase Rey
import { Piece } from '../Piece.js';

export class King extends Piece {
  constructor(color, position) {
    super('king', color, position);
    this.inCheck = false;
  }
  
  getPossibleMoves(board, canCastle = { kingside: false, queenside: false }) {
    const moves = [];
    const { row, col } = this.position;
    
    // Movimientos adyacentes (8 direcciones)
    for (let dRow = -1; dRow <= 1; dRow++) {
      for (let dCol = -1; dCol <= 1; dCol++) {
        if (dRow === 0 && dCol === 0) continue;
        
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
    }
    
    // Enroque
    if (!this.hasMoved && !this.inCheck) {
      // Enroque corto (kingside)
      if (canCastle.kingside) {
        moves.push({ row, col: col + 2, castling: 'kingside' });
      }
      // Enroque largo (queenside)
      if (canCastle.queenside) {
        moves.push({ row, col: col - 2, castling: 'queenside' });
      }
    }
    
    return moves;
  }
  
  isValidPosition(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }
}
