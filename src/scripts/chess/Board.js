// src/scripts/chess/Board.js - Clase del tablero
import { Pawn } from './pieces/Pawn.js';
import { Knight } from './pieces/Knight.js';
import { Bishop } from './pieces/Bishop.js';
import { Rook } from './pieces/Rook.js';
import { Queen } from './pieces/Queen.js';
import { King } from './pieces/King.js';

export class ChessBoard {
  constructor() {
    this.grid = Array(8).fill(null).map(() => Array(8).fill(null));
    this.moveHistory = [];
    this.capturedPieces = { white: [], black: [] };
    this.enPassantTarget = null;
    this.halfMoveClock = 0;
    this.fullMoveNumber = 1;
    this.setupInitialPosition();
  }
  
  setupInitialPosition() {
    // Piezas negras (fila 0 y 1)
    this.grid[0][0] = new Rook('black', { row: 0, col: 0 });
    this.grid[0][1] = new Knight('black', { row: 0, col: 1 });
    this.grid[0][2] = new Bishop('black', { row: 0, col: 2 });
    this.grid[0][3] = new Queen('black', { row: 0, col: 3 });
    this.grid[0][4] = new King('black', { row: 0, col: 4 });
    this.grid[0][5] = new Bishop('black', { row: 0, col: 5 });
    this.grid[0][6] = new Knight('black', { row: 0, col: 6 });
    this.grid[0][7] = new Rook('black', { row: 0, col: 7 });
    
    for (let col = 0; col < 8; col++) {
      this.grid[1][col] = new Pawn('black', { row: 1, col });
    }
    
    // Piezas blancas (fila 6 y 7)
    for (let col = 0; col < 8; col++) {
      this.grid[6][col] = new Pawn('white', { row: 6, col });
    }
    
    this.grid[7][0] = new Rook('white', { row: 7, col: 0 });
    this.grid[7][1] = new Knight('white', { row: 7, col: 1 });
    this.grid[7][2] = new Bishop('white', { row: 7, col: 2 });
    this.grid[7][3] = new Queen('white', { row: 7, col: 3 });
    this.grid[7][4] = new King('white', { row: 7, col: 4 });
    this.grid[7][5] = new Bishop('white', { row: 7, col: 5 });
    this.grid[7][6] = new Knight('white', { row: 7, col: 6 });
    this.grid[7][7] = new Rook('white', { row: 7, col: 7 });
  }
  
  getPiece(row, col) {
    if (row < 0 || row > 7 || col < 0 || col > 7) return null;
    return this.grid[row][col];
  }
  
  setPiece(row, col, piece) {
    this.grid[row][col] = piece;
    if (piece) {
      piece.position = { row, col };
    }
  }
  
  movePiece(fromRow, fromCol, toRow, toCol, promotionPiece = null) {
    const piece = this.getPiece(fromRow, fromCol);
    if (!piece) return null;
    
    const captured = this.getPiece(toRow, toCol);
    const move = {
      piece: piece.clone(),
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol },
      captured: captured?.clone() || null,
      enPassant: false,
      castling: null,
      promotion: null,
      halfMoveClock: this.halfMoveClock
    };
    
    // Capturar pieza
    if (captured) {
      this.capturedPieces[piece.color].push(captured);
      this.halfMoveClock = 0;
    } else if (piece.type === 'pawn') {
      this.halfMoveClock = 0;
    } else {
      this.halfMoveClock++;
    }
    
    // Mover pieza
    this.setPiece(toRow, toCol, piece);
    this.setPiece(fromRow, fromCol, null);
    piece.hasMoved = true;
    
    // Captura al paso
    if (piece.type === 'pawn' && this.enPassantTarget) {
      if (toRow === this.enPassantTarget.row && toCol === this.enPassantTarget.col) {
        const capturedPawnRow = piece.color === 'white' ? toRow + 1 : toRow - 1;
        const capturedPawn = this.getPiece(capturedPawnRow, toCol);
        if (capturedPawn) {
          this.capturedPieces[piece.color].push(capturedPawn);
          this.setPiece(capturedPawnRow, toCol, null);
          move.enPassant = true;
          move.enPassantCapture = { row: capturedPawnRow, col: toCol };
        }
      }
    }
    
    // Actualizar objetivo de captura al paso
    this.enPassantTarget = null;
    if (piece.type === 'pawn' && Math.abs(toRow - fromRow) === 2) {
      this.enPassantTarget = {
        row: (fromRow + toRow) / 2,
        col: fromCol
      };
    }
    
    // Enroque
    if (piece.type === 'king' && Math.abs(toCol - fromCol) === 2) {
      const isKingside = toCol > fromCol;
      const rookFromCol = isKingside ? 7 : 0;
      const rookToCol = isKingside ? toCol - 1 : toCol + 1;
      
      const rook = this.getPiece(fromRow, rookFromCol);
      if (rook) {
        this.setPiece(fromRow, rookToCol, rook);
        this.setPiece(fromRow, rookFromCol, null);
        rook.hasMoved = true;
        move.castling = isKingside ? 'kingside' : 'queenside';
      }
    }
    
    // Promoción
    if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
      if (promotionPiece) {
        let newPiece;
        switch (promotionPiece) {
          case 'queen': newPiece = new Queen(piece.color, { row: toRow, col: toCol }); break;
          case 'rook': newPiece = new Rook(piece.color, { row: toRow, col: toCol }); break;
          case 'bishop': newPiece = new Bishop(piece.color, { row: toRow, col: toCol }); break;
          case 'knight': newPiece = new Knight(piece.color, { row: toRow, col: toCol }); break;
          default: newPiece = new Queen(piece.color, { row: toRow, col: toCol });
        }
        this.setPiece(toRow, toCol, newPiece);
        move.promotion = promotionPiece;
      }
    }
    
    this.moveHistory.push(move);
    return move;
  }
  
  undoMove() {
    if (this.moveHistory.length === 0) return null;
    
    const move = this.moveHistory.pop();
    
    // Restaurar pieza movida
    this.setPiece(move.from.row, move.from.col, move.piece);
    move.piece.hasMoved = move.piece.hasMoved && 
      !(move.piece.type === 'pawn' && move.from.row === (move.piece.color === 'white' ? 6 : 1)) &&
      !(move.piece.type === 'king' && move.from.col === 4) &&
      !(move.piece.type === 'rook' && (move.from.col === 0 || move.from.col === 7));
    
    // Restaurar pieza capturada
    this.setPiece(move.to.row, move.to.col, move.captured);
    if (move.captured) {
      const capturedList = this.capturedPieces[move.piece.color];
      const index = capturedList.findIndex(p => p.id === move.captured.id);
      if (index > -1) capturedList.splice(index, 1);
    }
    
    // Restaurar captura al paso
    if (move.enPassant) {
      const pawn = new Pawn(
        move.piece.color === 'white' ? 'black' : 'white',
        move.enPassantCapture
      );
      this.setPiece(move.enPassantCapture.row, move.enPassantCapture.col, pawn);
    }
    
    // Restaurar enroque
    if (move.castling) {
      const isKingside = move.castling === 'kingside';
      const rookFromCol = isKingside ? move.to.col - 1 : move.to.col + 1;
      const rookToCol = isKingside ? 7 : 0;
      const rook = this.getPiece(move.from.row, rookFromCol);
      if (rook) {
        this.setPiece(move.from.row, rookToCol, rook);
        this.setPiece(move.from.row, rookFromCol, null);
        rook.hasMoved = false;
      }
    }
    
    this.halfMoveClock = move.halfMoveClock;
    
    return move;
  }
  
  getKingPosition(color) {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.getPiece(row, col);
        if (piece && piece.type === 'king' && piece.color === color) {
          return { row, col };
        }
      }
    }
    return null;
  }
  
  isSquareAttacked(row, col, byColor) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.getPiece(r, c);
        if (piece && piece.color === byColor) {
          let moves;
          if (piece.type === 'king') {
            moves = piece.getPossibleMoves(this.grid, {
              kingside: false,
              queenside: false
            });
          } else {
            moves = piece.getPossibleMoves(this.grid, this.enPassantTarget);
          }
          if (moves.some(m => m.row === row && m.col === col)) {
            return true;
          }
        }
      }
    }
    return false;
  }
  
  isInCheck(color) {
    const kingPos = this.getKingPosition(color);
    if (!kingPos) return false;
    return this.isSquareAttacked(kingPos.row, kingPos.col, color === 'white' ? 'black' : 'white');
  }
  
  canCastle(color, side) {
    const row = color === 'white' ? 7 : 0;
    const king = this.getPiece(row, 4);
    if (!king || king.hasMoved || king.type !== 'king') return false;
    
    const rookCol = side === 'kingside' ? 7 : 0;
    const rook = this.getPiece(row, rookCol);
    if (!rook || rook.hasMoved || rook.type !== 'rook') return false;
    
    // Verificar casillas vacías entre rey y torre
    const startCol = side === 'kingside' ? 5 : 1;
    const endCol = side === 'kingside' ? 6 : 3;
    for (let col = startCol; col <= endCol; col++) {
      if (this.getPiece(row, col)) return false;
    }
    
    // Verificar que el rey no esté en jaque y no pase por jaque
    const enemyColor = color === 'white' ? 'black' : 'white';
    const kingCols = side === 'kingside' ? [4, 5, 6] : [4, 3, 2];
    for (const col of kingCols) {
      if (this.isSquareAttacked(row, col, enemyColor)) return false;
    }
    
    return true;
  }
  
  clone() {
    const newBoard = new ChessBoard();
    newBoard.grid = Array(8).fill(null).map((_, row) => 
      Array(8).fill(null).map((_, col) => {
        const piece = this.getPiece(row, col);
        return piece ? piece.clone() : null;
      })
    );
    newBoard.moveHistory = this.moveHistory.map(m => ({ ...m }));
    newBoard.capturedPieces = {
      white: [...this.capturedPieces.white],
      black: [...this.capturedPieces.black]
    };
    newBoard.enPassantTarget = this.enPassantTarget ? { ...this.enPassantTarget } : null;
    newBoard.halfMoveClock = this.halfMoveClock;
    newBoard.fullMoveNumber = this.fullMoveNumber;
    return newBoard;
  }
  
  getFEN() {
    // Implementación básica de FEN (para debugging)
    let fen = '';
    for (let row = 0; row < 8; row++) {
      let empty = 0;
      for (let col = 0; col < 8; col++) {
        const piece = this.getPiece(row, col);
        if (piece) {
          if (empty > 0) {
            fen += empty;
            empty = 0;
          }
          const pieceChar = {
            king: 'k', queen: 'q', rook: 'r', bishop: 'b', knight: 'n', pawn: 'p'
          }[piece.type];
          fen += piece.color === 'white' ? pieceChar.toUpperCase() : pieceChar;
        } else {
          empty++;
        }
      }
      if (empty > 0) fen += empty;
      if (row < 7) fen += '/';
    }
    return fen;
  }
}
