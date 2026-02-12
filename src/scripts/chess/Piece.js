// src/scripts/chess/Piece.js - Clase base para piezas
export class Piece {
  constructor(type, color, position) {
    this.type = type;
    this.color = color;
    this.position = position;
    this.hasMoved = false;
    this.id = `${color}_${type}_${position}`;
  }
  
  // Obtener movimientos posibles (debe ser implementado por subclases)
  getPossibleMoves(board) {
    throw new Error('Must be implemented by subclass');
  }
  
  // Verificar si un movimiento es válido
  isValidMove(board, toPosition) {
    const moves = this.getPossibleMoves(board);
    return moves.some(move => move.row === toPosition.row && move.col === toPosition.col);
  }
  
  // Clonar la pieza
  clone() {
    const PieceClass = this.constructor;
    const cloned = new PieceClass(this.color, this.position);
    cloned.hasMoved = this.hasMoved;
    return cloned;
  }
  
  // Posición en notación algebraica
  get algebraicPosition() {
    const files = 'abcdefgh';
    const ranks = '87654321';
    return files[this.position.col] + ranks[this.position.row];
  }
  
  // Valor de la pieza para la evaluación
  get value() {
    const values = {
      pawn: 100,
      knight: 320,
      bishop: 330,
      rook: 500,
      queen: 900,
      king: 20000
    };
    return values[this.type] || 0;
  }
  
  // Tabla de posición para evaluación
  getPositionTable() {
    // Tablas de posición simplificadas (valores positivos para blancas)
    const tables = {
      pawn: [
        [0,  0,  0,  0,  0,  0,  0,  0],
        [50, 50, 50, 50, 50, 50, 50, 50],
        [10, 10, 20, 30, 30, 20, 10, 10],
        [5,  5, 10, 25, 25, 10,  5,  5],
        [0,  0,  0, 20, 20,  0,  0,  0],
        [5, -5,-10,  0,  0,-10, -5,  5],
        [5, 10, 10,-20,-20, 10, 10,  5],
        [0,  0,  0,  0,  0,  0,  0,  0]
      ],
      knight: [
        [-50,-40,-30,-30,-30,-30,-40,-50],
        [-40,-20,  0,  0,  0,  0,-20,-40],
        [-30,  0, 10, 15, 15, 10,  0,-30],
        [-30,  5, 15, 20, 20, 15,  5,-30],
        [-30,  0, 15, 20, 20, 15,  0,-30],
        [-30,  5, 10, 15, 15, 10,  5,-30],
        [-40,-20,  0,  5,  5,  0,-20,-40],
        [-50,-40,-30,-30,-30,-30,-40,-50]
      ],
      bishop: [
        [-20,-10,-10,-10,-10,-10,-10,-20],
        [-10,  0,  0,  0,  0,  0,  0,-10],
        [-10,  0,  5, 10, 10,  5,  0,-10],
        [-10,  5,  5, 10, 10,  5,  5,-10],
        [-10,  0, 10, 10, 10, 10,  0,-10],
        [-10, 10, 10, 10, 10, 10, 10,-10],
        [-10,  5,  0,  0,  0,  0,  5,-10],
        [-20,-10,-10,-10,-10,-10,-10,-20]
      ],
      rook: [
        [0,  0,  0,  0,  0,  0,  0,  0],
        [5, 10, 10, 10, 10, 10, 10,  5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [0,  0,  0,  5,  5,  0,  0,  0]
      ],
      queen: [
        [-20,-10,-10, -5, -5,-10,-10,-20],
        [-10,  0,  0,  0,  0,  0,  0,-10],
        [-10,  0,  5,  5,  5,  5,  0,-10],
        [-5,  0,  5,  5,  5,  5,  0, -5],
        [0,  0,  5,  5,  5,  5,  0, -5],
        [-10,  5,  5,  5,  5,  5,  0,-10],
        [-10,  0,  5,  0,  0,  0,  0,-10],
        [-20,-10,-10, -5, -5,-10,-10,-20]
      ],
      king: [
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-20,-30,-30,-40,-40,-30,-30,-20],
        [-10,-20,-20,-20,-20,-20,-20,-10],
        [20, 20,  0,  0,  0,  0, 20, 20],
        [20, 30, 10,  0,  0, 10, 30, 20]
      ]
    };
    
    return tables[this.type] || Array(8).fill(Array(8).fill(0));
  }
  
  // Obtener valor de posición
  getPositionValue() {
    const table = this.getPositionTable();
    const row = this.color === 'white' ? this.position.row : 7 - this.position.row;
    return table[row][this.position.col];
  }
}
