// src/scripts/chess/pieces/Pawn.js - Clase Peón
import { Piece } from '../Piece.js';

export class Pawn extends Piece {
  constructor(color, position) {
    super('pawn', color, position);
    this.direction = color === 'white' ? -1 : 1; // Blancas suben, negras bajan
    this.startRow = color === 'white' ? 6 : 1;
  }
  
  getPossibleMoves(board, enPassantTarget = null) {
    const moves = [];
    const { row, col } = this.position;
    const nextRow = row + this.direction;
    
    // Movimiento hacia adelante 1 casilla
    if (this.isValidPosition(nextRow, col) && !board[nextRow][col]) {
      moves.push({ row: nextRow, col });
      
      // Movimiento doble desde posición inicial
      const doubleRow = row + (this.direction * 2);
      if (row === this.startRow && !board[doubleRow][col]) {
        moves.push({ row: doubleRow, col });
      }
    }
    
    // Capturas diagonales
    const captures = [col - 1, col + 1];
    for (const captureCol of captures) {
      if (this.isValidPosition(nextRow, captureCol)) {
        const targetPiece = board[nextRow][captureCol];
        if (targetPiece && targetPiece.color !== this.color) {
          moves.push({ row: nextRow, col: captureCol, capture: true });
        }
        
        // Captura al paso
        if (enPassantTarget && 
            enPassantTarget.row === nextRow && 
            enPassantTarget.col === captureCol) {
          moves.push({ 
            row: nextRow, 
            col: captureCol, 
            capture: true, 
            enPassant: true 
          });
        }
      }
    }
    
    return moves;
  }
  
  isValidPosition(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }
  
  // Verificar si puede promocionar
  canPromote() {
    const promotionRow = this.color === 'white' ? 0 : 7;
    return this.position.row === promotionRow;
  }
}
