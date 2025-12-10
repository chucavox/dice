import React, { useState, useEffect, useCallback } from 'react';
import { Player, GameStatus, GameState } from './types';
import Die from './components/Die';
import PlayerPanel from './components/PlayerPanel';
import { getAIDecision } from './services/geminiService';

// Winning Score Constant
const WINNING_SCORE = 100;

const App: React.FC = () => {
  // Game State
  const [gameState, setGameState] = useState<GameState>({
    scores: { [Player.USER]: 0, [Player.AI]: 0 },
    currentTurnScore: 0,
    activePlayer: Player.USER,
    status: GameStatus.IDLE,
    winner: null,
    lastRoll: 1
  });

  const [isRolling, setIsRolling] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [gameLog, setGameLog] = useState<string>("Welcome to Neon Pig! Roll to start.");
  const [aiReasoning, setAiReasoning] = useState<string>("");

  // Helpers
  const switchPlayer = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      currentTurnScore: 0,
      activePlayer: prev.activePlayer === Player.USER ? Player.AI : Player.USER
    }));
    setAiReasoning("");
  }, []);

  const checkForWin = useCallback((score: number): boolean => {
    return score >= WINNING_SCORE;
  }, []);

  const handleHold = useCallback(() => {
    setGameState(prev => {
      const newScore = prev.scores[prev.activePlayer] + prev.currentTurnScore;
      const isWin = checkForWin(newScore);
      
      let newLog = `${prev.activePlayer === Player.USER ? 'You' : 'Gemini'} held and banked ${prev.currentTurnScore} points.`;
      
      if (isWin) {
        newLog = `GAME OVER! ${prev.activePlayer === Player.USER ? 'You win!' : 'Gemini wins!'}`;
        return {
          ...prev,
          scores: { ...prev.scores, [prev.activePlayer]: newScore },
          status: GameStatus.FINISHED,
          winner: prev.activePlayer,
        };
      }

      setGameLog(newLog);
      return {
        ...prev,
        scores: { ...prev.scores, [prev.activePlayer]: newScore },
        currentTurnScore: 0,
        activePlayer: prev.activePlayer === Player.USER ? Player.AI : Player.USER
      };
    });
    setAiReasoning("");
  }, [checkForWin]);

  const handleRoll = useCallback(() => {
    if (gameState.status === GameStatus.FINISHED) return;

    setIsRolling(true);
    setGameLog("");
    
    // Simulate roll duration
    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setIsRolling(false);
      
      setGameState(prev => {
        if (roll === 1) {
          // Rolled a 1 - Lost turn
          setGameLog(`${prev.activePlayer === Player.USER ? 'You' : 'Gemini'} rolled a 1! Turn lost.`);
          return {
            ...prev,
            lastRoll: roll,
            currentTurnScore: 0,
            activePlayer: prev.activePlayer === Player.USER ? Player.AI : Player.USER
          };
        } else {
          // Rolled > 1 - Add to current turn
          return {
            ...prev,
            status: GameStatus.PLAYING,
            lastRoll: roll,
            currentTurnScore: prev.currentTurnScore + roll
          };
        }
      });
    }, 600); // Animation duration
  }, [gameState.status]);

  const startNewGame = () => {
    setGameState({
      scores: { [Player.USER]: 0, [Player.AI]: 0 },
      currentTurnScore: 0,
      activePlayer: Player.USER,
      status: GameStatus.IDLE,
      winner: null,
      lastRoll: 1
    });
    setGameLog("New Game Started. Good Luck!");
    setAiReasoning("");
  };

  // AI Logic Effect
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (gameState.activePlayer === Player.AI && gameState.status !== GameStatus.FINISHED && !isRolling) {
      const playAI = async () => {
        setAiThinking(true);
        
        // Slight delay for realism before "Thinking" starts or decision made
        await new Promise(r => setTimeout(r, 800));
        
        // If AI just started turn (score 0), almost always roll unless near winning (logic handled by Gemini generally, but let's force a roll to start turn usually)
        // Actually, let's just let Gemini decide everything.
        
        const decision = await getAIDecision(gameState);
        
        setAiThinking(false);
        setAiReasoning(decision.reasoning);
        
        // Execute decision after showing reasoning briefly
        timeoutId = setTimeout(() => {
          if (decision.action === 'roll') {
            handleRoll();
          } else {
            handleHold();
          }
        }, 1500); 
      };
      
      playAI();
    }

    return () => clearTimeout(timeoutId);
  }, [gameState.activePlayer, gameState.status, gameState.currentTurnScore, isRolling, handleRoll, handleHold, gameState]); // Added gameState to deps to ensure fresh state

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans selection:bg-pink-500 selection:text-white">
      {/* Header */}
      <header className="w-full p-6 flex justify-between items-center border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-pink-500 to-cyan-500 rounded-lg flex items-center justify-center font-bold text-lg">P</div>
            <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                Neon Pig <span className="text-xs text-gray-500 ml-2 border border-gray-700 rounded px-2 py-0.5">AI EDITION</span>
            </h1>
        </div>
        <button 
          onClick={startNewGame}
          className="text-xs font-semibold text-gray-400 hover:text-white transition-colors uppercase tracking-wider border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-full"
        >
          New Game
        </button>
      </header>

      {/* Main Game Area */}
      <main className="flex-grow flex flex-col md:flex-row items-stretch justify-center p-4 md:p-8 gap-4 max-w-7xl mx-auto w-full">
        
        {/* Player Panel */}
        <PlayerPanel 
          player={Player.USER}
          score={gameState.scores[Player.USER]}
          currentTurnScore={gameState.currentTurnScore}
          isActive={gameState.activePlayer === Player.USER}
          isWinner={gameState.winner === Player.USER}
        />

        {/* Center Control Area */}
        <div className="flex-none w-full md:w-80 flex flex-col items-center justify-center gap-8 py-8 relative">
          
          {/* Status Message */}
          <div className="text-center h-16 flex items-center justify-center">
             <p className={`text-sm md:text-base font-medium px-4 py-2 rounded-lg bg-gray-900/80 border border-gray-800 transition-all ${gameState.winner ? 'text-yellow-400 border-yellow-500/50' : 'text-gray-300'}`}>
               {gameState.winner 
                 ? (gameState.winner === Player.USER ? "🎉 You crushed the AI!" : "💀 The AI dominated.") 
                 : (aiThinking ? "Gemini is thinking..." : gameLog)
               }
             </p>
          </div>

          {/* Die */}
          <div className="relative group">
            <div className={`absolute inset-0 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${isRolling ? 'scale-110 opacity-60' : ''}`} />
            <Die 
              value={gameState.lastRoll} 
              isRolling={isRolling} 
              className={gameState.activePlayer === Player.USER ? "text-pink-600" : "text-cyan-600"}
            />
          </div>

          {/* AI Reasoning Bubble */}
          <div className={`
             w-full min-h-[60px] flex items-center justify-center text-center px-4
             transition-opacity duration-300
             ${aiReasoning ? 'opacity-100' : 'opacity-0'}
          `}>
             {aiReasoning && (
               <div className="bg-cyan-900/20 border border-cyan-500/30 text-cyan-300 text-sm px-4 py-3 rounded-xl relative">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-cyan-500/30"></div>
                  <span className="opacity-70 text-xs mr-2 uppercase font-bold">Gemini:</span>
                  "{aiReasoning}"
               </div>
             )}
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={handleRoll}
              disabled={gameState.activePlayer !== Player.USER || isRolling || gameState.status === GameStatus.FINISHED}
              className={`
                w-full py-4 rounded-xl font-bold text-lg tracking-wider transition-all transform active:scale-95
                flex items-center justify-center gap-2
                ${gameState.activePlayer === Player.USER && gameState.status !== GameStatus.FINISHED
                  ? 'bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-900/50 cursor-pointer'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50'
                }
              `}
            >
              🎲 ROLL
            </button>
            
            <button
              onClick={handleHold}
              disabled={gameState.activePlayer !== Player.USER || isRolling || gameState.currentTurnScore === 0 || gameState.status === GameStatus.FINISHED}
              className={`
                w-full py-4 rounded-xl font-bold text-lg tracking-wider transition-all transform active:scale-95
                flex items-center justify-center gap-2
                ${gameState.activePlayer === Player.USER && gameState.currentTurnScore > 0 && gameState.status !== GameStatus.FINISHED
                  ? 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 shadow-lg cursor-pointer'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50 border border-transparent'
                }
              `}
            >
              📥 HOLD
            </button>
          </div>
        </div>

        {/* AI Panel */}
        <PlayerPanel 
          player={Player.AI}
          score={gameState.scores[Player.AI]}
          currentTurnScore={gameState.currentTurnScore}
          isActive={gameState.activePlayer === Player.AI}
          isWinner={gameState.winner === Player.AI}
        />
        
      </main>
      
      {/* Footer / Rules */}
      <footer className="p-6 text-center text-gray-600 text-sm border-t border-gray-900">
        <p>Goal: {WINNING_SCORE} points. Roll 1 and lose your turn score. Hold to bank.</p>
        <p className="mt-2 text-xs opacity-50">Powered by Google Gemini 2.5 Flash</p>
      </footer>
    </div>
  );
};

export default App;