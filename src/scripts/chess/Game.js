// src/scripts/chess/Game.js - Controlador principal del juego
import { ChessBoard } from './Board.js';
import { ChessAI } from './AI.js';

export class ChessGame {
  constructor(options = {}) {
    this.board = new ChessBoard();
    this.ai = new ChessAI(options.aiLevel || 2);
    this.mode = options.mode || 'pvp'; // 'pvp' o 'pvc'
    this.playerColor = options.playerColor || 'white';
    this.currentTurn = 'white';
    this.selectedPiece = null;
    this.validMoves = [];
    this.gameOver = false;
    this.winner = null;
    this.moveHistory = [];
    this.lastMove = null;
    this.isAIThinking = false;
    this.listeners = {};
  }
  
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }
  
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
    // También emitir eventos del DOM para UI
    window.dispatchEvent(new CustomEvent(event, { detail: data }));
  }
  
  selectPiece(row, col) {
    if (this.gameOver || this.isAIThinking) return false;
    
    const piece = this.board.getPiece(row, col);
    
    // Si ya hay pieza seleccionada, intentar mover
    if (this.selectedPiece) {
      const validMove = this.validMoves.find(m => m.row === row && m.col === col);
      if (validMove) {
        return this.makeMove(this.selectedPiece.position, { row, col });
      }
      // Cancelar selección si se hace click en otra casilla
      this.deselectPiece();
      if (piece && piece.color === this.currentTurn) {
        this.selectPiece(row, col);
      }
      return false;
    }
    
    // Seleccionar nueva pieza
    if (piece && piece.color === this.currentTurn) {
      // En modo PVC, verificar que sea el turno del jugador
      if (this.mode === 'pvc' && piece.color !== this.playerColor) {
        return false;
      }
      
      this.selectedPiece = piece;
      this.validMoves = this.getValidMovesForPiece(piece);
      this.emit('pieceSelected', { piece, validMoves: this.validMoves });
      return true;
    }
    
    return false;
  }
  
  deselectPiece() {
    this.selectedPiece = null;
    this.validMoves = [];
    this.emit('pieceDeselected');
  }
  
  getValidMovesForPiece(piece) {
    let moves;
    if (piece.type === 'king') {
      moves = piece.getPossibleMoves(this.board.grid, {
        kingside: this.board.canCastle(piece.color, 'kingside'),
        queenside: this.board.canCastle(piece.color, 'queenside')
      });
    } else {
      moves = piece.getPossibleMoves(this.board.grid, this.board.enPassantTarget);
    }
    
    // Filtrar movimientos que dejan al rey en jaque
    return moves.filter(move => {
      const boardCopy = this.board.clone();
      boardCopy.movePiece(piece.position.row, piece.position.col, move.row, move.col);
      return !boardCopy.isInCheck(piece.color);
    });
  }
  
  async makeMove(from, to, promotionPiece = null) {
    if (this.gameOver) return false;
    
    const piece = this.board.getPiece(from.row, from.col);
    if (!piece) return false;
    
    // Verificar si es promoción
    let promo = promotionPiece;
    if (piece.type === 'pawn' && (to.row === 0 || to.row === 7)) {
      if (!promo) {
        // Mostrar modal y esperar selección
        promo = await window.showPromotionModal?.() || 'queen';
      }
    }
    
    // Ejecutar movimiento
    const move = this.board.movePiece(from.row, from.col, to.row, to.col, promo);
    if (!move) return false;
    
    this.lastMove = { from, to };
    this.deselectPiece();
    
    // Generar notación algebraica
    const notation = this.getMoveNotation(move);
    
    // Calcular número de movimiento
    const moveNumber = Math.floor(this.board.moveHistory.length / 2) + (piece.color === 'white' ? 0 : 1);
    
    // Emitir eventos
    this.emit('pieceMove', { from, to, piece, notation });
    this.emit('moveMade', {
      moveNumber,
      notation,
      whiteMove: piece.color === 'white' ? notation : null,
      blackMove: piece.color === 'black' ? notation : null
    });
    
    if (move.captured) {
      this.emit('pieceCapture', { 
        piece: move.captured, 
        color: piece.color,
        notation: this.getPieceSymbol(move.captured.type)
      });
    }
    
    // Verificar estado del juego
    this.checkGameState();
    
    if (!this.gameOver) {
      this.switchTurn();
      
      // Si es turno de la IA
      if (this.mode === 'pvc' && this.currentTurn !== this.playerColor) {
        this.makeAIMove();
      }
    }
    
    return true;
  }
  
  async makeAIMove() {
    this.isAIThinking = true;
    this.emit('aiThinking', { thinking: true });
    
    // Pequeña pausa para simular "pensamiento"
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const move = this.ai.getBestMove(this.board, this.currentTurn);
    
    this.isAIThinking = false;
    this.emit('aiThinking', { thinking: false });
    
    if (move) {
      await this.makeMove(move.from, move.to);
    }
  }
  
  switchTurn() {
    this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
    this.emit('turnChange', { color: this.currentTurn });
  }
  
  checkGameState() {
    const opponentColor = this.currentTurn === 'white' ? 'black' : 'white';
    const ai = new ChessAI(1);
    const validMoves = ai.getAllValidMoves(this.board, opponentColor);
    
    if (validMoves.length === 0) {
      this.gameOver = true;
      
      if (this.board.isInCheck(opponentColor)) {
        // Jaque mate
        this.winner = this.currentTurn;
        this.emit('gameWin', { winner: this.winner, color: this.currentTurn });
      } else {
        // Tablas por ahogado
        this.emit('gameDraw', { reason: 'stalemate' });
      }
      return;
    }
    
    // Verificar jaque
    if (this.board.isInCheck(opponentColor)) {
      this.emit('check', { color: opponentColor });
    }
    
    // Verificar regla de 50 movimientos
    if (this.board.halfMoveClock >= 50) {
      this.gameOver = true;
      this.emit('gameDraw', { reason: 'fifty-move rule' });
    }
    
    // Verificar material insuficiente (simplificado)
    if (this.isInsufficientMaterial()) {
      this.gameOver = true;
      this.emit('gameDraw', { reason: 'insufficient material' });
    }
  }
  
  isInsufficientMaterial() {
    const pieces = { white: [], black: [] };
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board.getPiece(row, col);
        if (piece) {
          pieces[piece.color].push(piece);
        }
      }
    }
    
    // Rey vs Rey
    if (pieces.white.length === 1 && pieces.black.length === 1) {
      return true;
    }
    
    // Rey y caballo vs Rey, o Rey y alfil vs Rey
    if ((pieces.white.length === 2 && pieces.black.length === 1) ||
        (pieces.white.length === 1 && pieces.black.length === 2)) {
      const twoPieces = pieces.white.length === 2 ? pieces.white : pieces.black;
      const minorPiece = twoPieces.find(p => p.type === 'knight' || p.type === 'bishop');
      if (minorPiece) return true;
    }
    
    return false;
  }
  
  undo() {
    if (this.gameOver || this.isAIThinking) return false;
    
    // En modo PVC, deshacer tanto el movimiento del jugador como el de la IA
    const movesToUndo = this.mode === 'pvc' && this.currentTurn !== this.playerColor ? 2 : 1;
    
    for (let i = 0; i < movesToUndo; i++) {
      const move = this.board.undoMove();
      if (!move) break;
      
      this.switchTurn();
    }
    
    this.deselectPiece();
    this.emit('undo');
    return true;
  }
  
  resign() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.winner = this.currentTurn === 'white' ? 'black' : 'white';
    this.emit('gameWin', { winner: this.winner, resigned: true });
  }
  
  getPieceAt(row, col) {
    return this.board.getPiece(row, col);
  }
  
  isValidMove(row, col) {
    return this.validMoves.some(m => m.row === row && m.col === col);
  }
  
  reset() {
    this.board = new ChessBoard();
    this.currentTurn = 'white';
    this.selectedPiece = null;
    this.validMoves = [];
    this.gameOver = false;
    this.winner = null;
    this.moveHistory = [];
    this.lastMove = null;
    this.isAIThinking = false;
  }
  
  // Obtener símbolo de pieza
  getPieceSymbol(type) {
    const symbols = {
      king: '♔',
      queen: '♕',
      rook: '♖',
      bishop: '♗',
      knight: '♘',
      pawn: '♙'
    };
    return symbols[type] || type;
  }

  // Generar notación algebraica del movimiento
  getMoveNotation(move) {
    const pieceSymbols = {
      king: '♔',
      queen: '♕',
      rook: '♖',
      bishop: '♗',
      knight: '♘',
      pawn: ''
    };
    
    const files = 'abcdefgh';
    const ranks = '87654321';
    
    let notation = '';
    
    // Símbolo de pieza
    notation += pieceSymbols[move.piece.type] || '';
    
    // Captura
    if (move.captured) {
      if (move.piece.type === 'pawn') {
        notation += files[move.from.col];
      }
      notation += '×';
    }
    
    // Casilla destino
    notation += files[move.to.col] + ranks[move.to.row];
    
    // Promoción
    if (move.promotion) {
      const promoSymbols = {
        queen: '♕',
        rook: '♖',
        bishop: '♗',
        knight: '♘'
      };
      notation += '=' + (promoSymbols[move.promotion] || move.promotion);
    }
    
    // Enroque
    if (move.castling) {
      notation = move.castling === 'kingside' ? 'O-O' : 'O-O-O';
    }
    
    // Jaque o jaque mate
    const boardCopy = this.board.clone();
    const opponentColor = move.piece.color === 'white' ? 'black' : 'white';
    if (boardCopy.isInCheck(opponentColor)) {
      const ai = new ChessAI(1);
      const validMoves = ai.getAllValidMoves(boardCopy, opponentColor);
      notation += validMoves.length === 0 ? '#' : '+';
    }
    
    return notation;
  }
}
