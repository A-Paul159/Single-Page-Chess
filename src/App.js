import React, { useState, useEffect, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const App = () => {
  const [game, setGame] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [boardOrientation, setBoardOrientation] = useState('white');
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [theme, setTheme] = useState({
    lightSquare: '#f0d9b5',
    darkSquare: '#b58863'
  });
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [showMoveList, setShowMoveList] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showCheckmateModal, setShowCheckmateModal] = useState(false);

  const [panelPos] = useState({
    x: window.innerHeight / 1 + 280,
    y: window.innerHeight / 4 - 175
  });

  const [playerNames, setPlayerNames] = useState({
    white: 'Player1',
    black: 'Player2'
  });

  const [editingName, setEditingName] = useState({
    white: false,
    black: false
  });

  const chessboardRef = useRef(null);

  useEffect(() => {
    if (chessboardRef.current) {
      const squares = chessboardRef.current.querySelectorAll(
        '[data-square-color="black"], [data-square-color="white"]'
      );
      squares.forEach(square => {
        const color = square.getAttribute('data-square-color');
        square.style.backgroundColor = color === 'black' ? theme.darkSquare : theme.lightSquare;
      });
    }
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        const gameCopy = new Chess();
        gameCopy.load_pgn(game.pgn());

        if (gameCopy.history().length > 0) {
          const undoneMove = gameCopy.undo();
          setGame(gameCopy);
          setMoveHistory(prev => prev.slice(0, -1));
          setRedoStack(prev => [...prev, undoneMove]);
          setSelectedSquare(null);
        }
      }

      if (e.key === 'ArrowRight') {
        if (redoStack.length > 0) {
          const lastRedo = redoStack[redoStack.length - 1];
          const gameCopy = new Chess();
          gameCopy.load_pgn(game.pgn());
          const redone = gameCopy.move(lastRedo);
          if (redone) {
            setGame(gameCopy);
            setMoveHistory(prev => [...prev, redone.san]);
            setRedoStack(prev => prev.slice(0, -1));
            setSelectedSquare(null);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [game, redoStack]);

  const handleSquareClick = (square) => {
    if (selectedSquare) {
      const gameCopy = new Chess();
      gameCopy.load_pgn(game.pgn());
      const move = gameCopy.move({
        from: selectedSquare,
        to: square,
        promotion: 'q'
      });
      setSelectedSquare(null);
      if (move) {
        setGame(gameCopy);
        setMoveHistory(prev => [...prev, move.san]);
        setRedoStack([]);
        if (move.san.includes('#')) {
          setShowCheckmateModal(true);
        }
      }
    } else {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
      }
    }
  };

  const selectedSquareStyles = selectedSquare
    ? { [selectedSquare]: { background: 'rgba(0,255,0,0.4)' } }
    : {};

  const possibleMovesStyles = {};
  if (selectedSquare) {
    const possibleMoves = game.moves({ square: selectedSquare, verbose: true });
    possibleMoves.forEach(move => {
      possibleMovesStyles[move.to] = { background: 'rgba(255,255,0,0.4)' };
    });
  }

  const combinedSquareStyles = { ...possibleMovesStyles, ...selectedSquareStyles };

  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setSelectedSquare(null);
    setMoveHistory([]);
    setRedoStack([]);
  };

  const flipBoard = () => {
    setBoardOrientation(prev => (prev === 'white' ? 'black' : 'white'));
  };

  const updateColor = (type, value) => {
    setTheme(prev => ({ ...prev, [type]: value }));
  };

  const toggleThemePanel = () => {
    setShowThemePanel(prev => !prev);
  };

  const toggleMoveList = () => {
    setShowMoveList(prev => !prev);
  };

  const handleNameClick = (color) => {
    setEditingName(prev => ({ ...prev, [color]: true }));
  };

  const handleNameChange = (color, value) => {
    setPlayerNames(prev => ({ ...prev, [color]: value }));
  };

  const handleNameBlur = (color) => {
    setEditingName(prev => ({ ...prev, [color]: false }));
  };

  const handleNameKeyDown = (e, color) => {
    if (e.key === 'Enter') {
      setEditingName(prev => ({ ...prev, [color]: false }));
    }
  };

  const movePairs = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    movePairs.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: moveHistory[i],
      black: moveHistory[i + 1] || ''
    });
  }

  return (
    <div className="container-fluid py-4 bg-dark min-vh-100 position-relative">
      <style>{`
        body {
          margin: 0;
          padding: 0;
          background-color: #212529;
        }
        .card {
          transition: transform 0.2s ease-in-out;
          background-color: #343a40;
          color: white;
          margin-bottom: 20px;
        }
        .card:hover {
          transform: translateY(-2px);
        }
        .form-control-color {
          height: 40px;
          padding: 4px;
          border-radius: 4px;
          border: 2px solid #ced4da;
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
        }
        .form-select {
          height: 40px;
          border-radius: 4px;
          border: 2px solid #ced4da;
          padding: 6px;
        }
        .btn:hover {
          background-color: #0056b3;
        }
        .card-header {
          background-color: #007bff;
          color: #f8f9fa;
        }
        .form-label, .btn, .card-header {
          color: #f8f9fa;
        }
        .player-tag {
          font-size: 1rem;
          font-weight: bold;
          padding: 6px 10px;
          border: 1px solid white;
          background-color: #212529;
          color: #f8f9fa;
          border-radius: 4px;
          position: absolute;
          z-index: 10;
          cursor: pointer;
        }
      `}</style>

      <div className="row justify-content-center">
        <div className="col-auto">
          <div className="position-relative" style={{ width: '560px' }}>
          <div className="player-tag" style={{ top: '0', right: '590px' }} onClick={() => handleNameClick('black')}>
            {editingName.black ? (
              <input
                type="text"
                value={playerNames.black}
                onChange={(e) => handleNameChange('black', e.target.value)}
                onBlur={() => handleNameBlur('black')}
                onKeyDown={(e) => handleNameKeyDown(e, 'black')}
                autoFocus
                style={{
                  backgroundColor: '#212529',
                  border: '1px solid #f8f9fa',
                  color: '#f8f9fa',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  width: '-100%'
                }}
              />
            ) : (
              playerNames.black
            )}
            {game.turn() === 'b' && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '-15px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '10px',
                  height: '10px',
                  backgroundColor: 'limegreen',
                  borderRadius: '50%'
                }}
              ></div>
            )}
          </div>
          <div className="player-tag" style={{ bottom: '0', left: '590px' }} onClick={() => handleNameClick('white')}>
            {editingName.white ? (
              <input
                type="text"
                value={playerNames.white}
                onChange={(e) => handleNameChange('white', e.target.value)}
                onBlur={() => handleNameBlur('white')}
                onKeyDown={(e) => handleNameKeyDown(e, 'white')}
                autoFocus
                style={{
                  backgroundColor: '#212529',
                  border: '1px solid #f8f9fa',
                  color: '#f8f9fa',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  width: '-100%'
                }}
              />
            ) : (
              playerNames.white
            )}
            {game.turn() === 'w' && (
              <div
                style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '10px',
                  height: '10px',
                  backgroundColor: 'limegreen',
                  borderRadius: '50%'
                }}
              ></div>
            )}
          </div>
            <div className="card shadow mb-4">
              <div className="card-body p-0" ref={chessboardRef}>
                <Chessboard
                  position={game.fen()}
                  onSquareClick={handleSquareClick}
                  customSquareStyles={combinedSquareStyles}
                  boardOrientation={boardOrientation}
                  customPieces={{}}
                  animationDuration={300}
                  arePiecesDraggable={false}
                  boardWidth={560}
                />
              </div>
            </div>

            <div className="d-flex flex-column position-absolute" style={{ top: '10px', right: '-75px' }}>
              <button className="btn btn-light mb-2" style={{ backgroundColor: '#212529' }} onClick={() => setShowInfoPanel(prev => !prev)}>
                <i className="fas fa-info-circle"></i>
              </button>
              <button className="btn btn-light mb-2" style={{ backgroundColor: '#212529' }} onClick={toggleThemePanel}>
                <i className="fas fa-paint-brush"></i>
              </button>
              <button className="btn btn-light mb-2" style={{ backgroundColor: '#212529' }} onClick={toggleMoveList}>
                <i className="fas fa-list"></i>
              </button>
              <button className="btn btn-light mb-2" style={{ backgroundColor: '#212529' }} onClick={resetGame}>
                <i className="fas fa-redo"></i>
              </button>
              <button className="btn btn-light" style={{ backgroundColor: '#212529' }} onClick={flipBoard}>
                <i className="fas fa-sync-alt"></i>
              </button>
            </div>
          </div>

          {showMoveList && (
            <div className="card shadow mb-4" style={{ width: '560px', border: '1px solid white' }}>
              <div className="card-header bg-dark text-white" style={{ borderBottom: '1px solid white' }}>
                Move List
              </div>
              <div className="card-body" style={{ maxHeight: '130px', overflowY: 'auto', padding: 0 }}>
                <table className="table table-sm table-striped mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>White</th>
                      <th>Black</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movePairs.map(pair => (
                      <tr key={pair.moveNumber}>
                        <td>{pair.moveNumber}</td>
                        <td>{pair.white}</td>
                        <td>{pair.black}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {showInfoPanel && (
            <div className="card shadow mb-4" style={{ width: '560px', border: '1px solid white' }}>
              <div className="card-header bg-dark text-white" style={{ borderBottom: '1px solid white' }}>
                Welcome
              </div>
              <div className="card-body text-white">
                <p><strong>Chess Game Instructions:</strong></p>
                <ul className="list-unstyled">
                  <li><i className="fas fa-paint-brush me-2"></i> Use the paintbrush icon to change board colors or choose from predefined themes.</li>
                  <li><i className="fas fa-list me-2"></i> Click the list icon to view your move history in traditional chess notation.</li>
                  <li><i className="fas fa-redo me-2"></i> The replay icon starts a fresh new game from the beginning.</li>
                  <li><i className="fas fa-sync-alt me-2"></i> The switch icon flips the board between white's and black's views.</li>
                </ul>
                  <p><strong>Bonus:</strong></p>
                  <p>
                    Use the <strong>left arrow key</strong> (<kbd>←</kbd>) to undo moves, and the <strong>right arrow key</strong> (<kbd>→</kbd>) to redo them. 
                    If you make a new move after undoing, the old line of moves will be cleared and redo will no longer follow that line.
                  </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showThemePanel && (
        <div
          className="card shadow bg-light"
          style={{
            position: 'fixed',
            left: panelPos.x,
            top: panelPos.y,
            width: '250px',
            zIndex: 1050,
            border: '1px solid white'
          }}
        >
          <div
            className="card-header bg-dark text-white d-flex justify-content-between align-items-center theme-header"
            style={{ borderBottom: '1px solid white' }}
          >
            <span>Customize Theme</span>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">Light Squares</label>
              <input
                type="color"
                className="form-control form-control-color w-100"
                value={theme.lightSquare}
                onChange={(e) => updateColor('lightSquare', e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Dark Squares</label>
              <input
                type="color"
                className="form-control form-control-color w-100"
                value={theme.darkSquare}
                onChange={(e) => updateColor('darkSquare', e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Predefined Themes</label>
              <select
                className="form-select"
                onChange={(e) => {
                  const selected = e.target.value;
                  const themes = {
                    classic: { lightSquare: '#f0d9b5', darkSquare: '#b58863' },
                    blueOcean: { lightSquare: '#aadff0', darkSquare: '#31708e' },
                    darkMode: { lightSquare: '#666', darkSquare: '#222' },
                    greenGarden: { lightSquare: '#e0f8d8', darkSquare: '#4c6b43' }
                  };
                  if (themes[selected]) {
                    setTheme(themes[selected]);
                  }
                }}
                defaultValue=""
              >
                <option value="" disabled>Select a theme</option>
                <option value="classic">Classic</option>
                <option value="blueOcean">Blue Ocean</option>
                <option value="darkMode">Dark Mode</option>
                <option value="greenGarden">Green Garden</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {showCheckmateModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header">
                <h5 className="modal-title">Checkmate!</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowCheckmateModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Checkmate! Would you like to play again?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowCheckmateModal(false)}>
                  Close
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    resetGame();
                    setShowCheckmateModal(false);
                  }}
                >
                  Play Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
