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
      // Crear nueva referencia de posición para evitar compartir objetos
      piece.position = { row: row, col: col };
    }
  }
  
  movePiece(fromRow, fromCol, toRow, toCol, promotionPiece = null) {
    const piece = this.getPiece(fromRow, fromCol);
    if (!piece) return null;
    
    const captured = this.getPiece(toRow, toCol);
    
    // Crear copia profunda para el historial (con datos simples, no referencias)
    const move = {
      piece: {
        type: piece.type,
        color: piece.color,
        hasMoved: piece.hasMoved,
        position: { row: fromRow, col: fromCol }
      },
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol },
      captured: captured ? {
        type: captured.type,
        color: captured.color,
        hasMoved: captured.hasMoved,
        position: { row: toRow, col: toCol }
      } : null,
      enPassant: false,
      castling: null,
      promotion: null,
      halfMoveClock: this.halfMoveClock
    };
    
    // Capturar pieza (guardar como objeto simple)
    if (captured) {
      this.capturedPieces[piece.color].push({
        type: captured.type,
        color: captured.color,
        hasMoved: captured.hasMoved,
        position: { row: toRow, col: toCol }
      });
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
          this.capturedPieces[piece.color].push({
            type: capturedPawn.type,
            color: capturedPawn.color,
            hasMoved: capturedPawn.hasMoved,
            position: { row: capturedPawnRow, col: toCol }
          });
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
    
    // Reconstruir pieza movida desde datos simples
    let restoredPiece;
    const pieceData = move.piece;
    const pos = { row: move.from.row, col: move.from.col };
    
    switch (pieceData.type) {
      case 'pawn': restoredPiece = new Pawn(pieceData.color, pos); break;
      case 'knight': restoredPiece = new Knight(pieceData.color, pos); break;
      case 'bishop': restoredPiece = new Bishop(pieceData.color, pos); break;
      case 'rook': restoredPiece = new Rook(pieceData.color, pos); break;
      case 'queen': restoredPiece = new Queen(pieceData.color, pos); break;
      case 'king': restoredPiece = new King(pieceData.color, pos); break;
      default: return null;
    }
    
    restoredPiece.hasMoved = pieceData.hasMoved && 
      !(pieceData.type === 'pawn' && move.from.row === (pieceData.color === 'white' ? 6 : 1)) &&
      !(pieceData.type === 'king' && move.from.col === 4) &&
      !(pieceData.type === 'rook' && (move.from.col === 0 || move.from.col === 7));
    
    // Restaurar pieza movida
    this.setPiece(move.from.row, move.from.col, restoredPiece);
    
    // Restaurar pieza capturada (reconstruir desde datos simples)
    if (move.captured) {
      const capturedData = move.captured;
      let restoredCaptured;
      const capturedPos = { row: move.to.row, col: move.to.col };
      
      switch (capturedData.type) {
        case 'pawn': restoredCaptured = new Pawn(capturedData.color, capturedPos); break;
        case 'knight': restoredCaptured = new Knight(capturedData.color, capturedPos); break;
        case 'bishop': restoredCaptured = new Bishop(capturedData.color, capturedPos); break;
        case 'rook': restoredCaptured = new Rook(capturedData.color, capturedPos); break;
        case 'queen': restoredCaptured = new Queen(capturedData.color, capturedPos); break;
        case 'king': restoredCaptured = new King(capturedData.color, capturedPos); break;
        default: restoredCaptured = null;
      }
      
      if (restoredCaptured) {
        restoredCaptured.hasMoved = capturedData.hasMoved;
        this.setPiece(move.to.row, move.to.col, restoredCaptured);
        const capturedList = this.capturedPieces[restoredPiece.color];
        // Buscar y remover de capturadas por tipo y color
        const index = capturedList.findIndex(p => 
          p.type === capturedData.type && 
          p.color === capturedData.color
        );
        if (index > -1) capturedList.splice(index, 1);
      }
    } else {
      this.setPiece(move.to.row, move.to.col, null);
    }
    
    // Restaurar captura al paso
    if (move.enPassant) {
      const pawn = new Pawn(
        restoredPiece.color === 'white' ? 'black' : 'white',
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
        const restoredRook = new Rook(rook.color, { row: move.from.row, col: rookToCol });
        this.setPiece(move.from.row, rookToCol, restoredRook);
        this.setPiece(move.from.row, rookFromCol, null);
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
          // Crear pieza temporal según su tipo
          let tempPiece;
          const pos = { row: r, col: c };
          
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
            moves = tempPiece.getPossibleMoves(this.grid, {
              kingside: false,
              queenside: false
            });
          } else {
            moves = tempPiece.getPossibleMoves(this.grid, this.enPassantTarget);
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
    console.log(`isInCheck: Rey ${color} está en posición:`, kingPos);
    if (!kingPos) return false;
    const enemyColor = color === 'white' ? 'black' : 'white';
    const attacked = this.isSquareAttacked(kingPos.row, kingPos.col, enemyColor);
    console.log(`isSquareAttacked(${kingPos.row},${kingPos.col}, ${enemyColor}) = ${attacked}`);
    return attacked;
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
    // Crear tablero vacío sin llamar al constructor
    const newBoard = Object.create(ChessBoard.prototype);
    newBoard.grid = Array(8).fill(null).map(() => Array(8).fill(null));
    newBoard.moveHistory = [];
    newBoard.capturedPieces = { white: [], black: [] };
    newBoard.enPassantTarget = null;
    newBoard.halfMoveClock = 0;
    newBoard.fullMoveNumber = 1;
    
    // Copiar piezas clonadas - USAR setPiece para actualizar posiciones
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.getPiece(row, col);
        if (piece) {
          const clonedPiece = piece.clone();
          newBoard.setPiece(row, col, clonedPiece);
        }
      }
    }
    
    // Copiar historial (ahora son objetos simples, no necesitan clone)
    newBoard.moveHistory = this.moveHistory.map(m => ({ 
      ...m,
      piece: m.piece ? { ...m.piece } : null,
      captured: m.captured ? { ...m.captured } : null
    }));
    // Reconstruir piezas capturadas desde datos simples
    newBoard.capturedPieces = {
      white: this.capturedPieces.white.map(p => {
        const pos = { ...p.position };
        switch(p.type) {
          case 'pawn': return new Pawn(p.color, pos);
          case 'knight': return new Knight(p.color, pos);
          case 'bishop': return new Bishop(p.color, pos);
          case 'rook': return new Rook(p.color, pos);
          case 'queen': return new Queen(p.color, pos);
          case 'king': return new King(p.color, pos);
          default: return null;
        }
      }).filter(Boolean),
      black: this.capturedPieces.black.map(p => {
        const pos = { ...p.position };
        switch(p.type) {
          case 'pawn': return new Pawn(p.color, pos);
          case 'knight': return new Knight(p.color, pos);
          case 'bishop': return new Bishop(p.color, pos);
          case 'rook': return new Rook(p.color, pos);
          case 'queen': return new Queen(p.color, pos);
          case 'king': return new King(p.color, pos);
          default: return null;
        }
      }).filter(Boolean)
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
