// src/pages/Quiz.jsx
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import QuizMap from "../components/QuizMap";
import countriesGeo from "../assets/countries.json";
import EndGamePopUp from "../components/EndGamePopUp";

// Helpers to read common Natural Earth props
function featureIso2(f) {
  return (f?.properties?.ISO_A2 || f?.properties?.iso_a2 || "").toUpperCase();
}
function featureName(f) {
  return f?.properties?.NAME || f?.properties?.ADMIN || f?.properties?.name || "Unknown";
}
function featureContinent(f) {
  return f?.properties?.CONTINENT || "Unknown";
}

// Continent definitions
const CONTINENTS = [
  { id: "all", name: "Open World", emoji: "🌍" },
  { id: "Africa", name: "Africa", emoji: "🌍" },
  { id: "Asia", name: "Asia", emoji: "🌏" },
  { id: "Europe", name: "Europe", emoji: "🇪🇺" },
  { id: "North America", name: "North America", emoji: "🌎" },
  { id: "South America", name: "South America", emoji: "🌎" },
  { id: "Oceania", name: "Oceania", emoji: "🌏" }
];

const MODES = [
  { id: "learning", name: "Learning Mode", description: "Practice without pressure" },
  { id: "quiz", name: "Quiz Mode", description: "5 questions with time-based scoring" }
];

export default function Quiz() {
  const mapRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Game state
  const [gameState, setGameState] = useState("setup"); // "setup", "playing", "finished"
  const [selectedContinent, setSelectedContinent] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  
  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [feedback, setFeedback] = useState(""); // "", "correct", "wrong"
  const [clickedCountryName, setClickedCountryName] = useState("");
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [showEndGame, setShowEndGame] = useState(false);
  
  // Filter countries by continent
  const availableCountries = useMemo(() => {
    const list = (countriesGeo?.features || []).filter(f => {
      const iso = featureIso2(f);
      if (!iso || iso === "AQ") return false;
      
      if (selectedContinent === "all") return true;
      return featureContinent(f) === selectedContinent;
    });
    return list;
  }, [selectedContinent]);
  
  // Quiz questions (5 random countries for quiz mode)
  const [quizQuestions, setQuizQuestions] = useState([]);
  
  // Learning mode target country (separate state so it can change)
  const [learningTarget, setLearningTarget] = useState(null);
  
  // Current target country
  const target = useMemo(() => {
    if (selectedMode === "quiz" && quizQuestions.length > 0) {
      return quizQuestions[currentQuestion];
    }
    if (selectedMode === "learning") {
      return learningTarget;
    }
    return null;
  }, [selectedMode, quizQuestions, currentQuestion, learningTarget]);
  
  const targetName = target ? featureName(target) : "…";
  
  // Start game
  const startGame = (continent, mode) => {
    setSelectedContinent(continent);
    setSelectedMode(mode);
    setGameState("playing");
    setScore(0);
    setCurrentQuestion(0);
    setFeedback("");
    setSelectedCountry(null);
    
    if (mode === "quiz") {
      // Pick 5 random countries for quiz mode
      const shuffled = [...availableCountries].sort(() => Math.random() - 0.5);
      setQuizQuestions(shuffled.slice(0, 5));
    } else {
      // Pick first random country for learning mode
      const randomIndex = Math.floor(Math.random() * availableCountries.length);
      setLearningTarget(availableCountries[randomIndex]);
    }
    
    setQuestionStartTime(Date.now());
  };
  
  // Calculate time-based multiplier (1x to 10x based on speed)
  // Full 10x for first 5 seconds, then drops off
  const calculateMultiplier = (timeInSeconds) => {
    if (timeInSeconds <= 5) return 1.0;  // 100% of base score
    if (timeInSeconds <= 8) return 0.8;  // 80%
    if (timeInSeconds <= 12) return 0.6; // 60%
    if (timeInSeconds <= 17) return 0.4; // 40%
    if (timeInSeconds <= 25) return 0.2; // 20%
    return 0.1; // 10%
  };
  
  // Handle country click on map
  const handleCountryClick = (feature) => {
    if (feedback || !target) return; // Don't allow clicking during feedback
    setSelectedCountry(feature);
  };
  
  // Handle guess button
  const handleGuess = () => {
    if (!selectedCountry || !target || feedback) return;
    
    const isoClicked = featureIso2(selectedCountry);
    const isoTarget = featureIso2(target);
    const clickedName = featureName(selectedCountry);
    const timeElapsed = (Date.now() - questionStartTime) / 1000;
    
    setClickedCountryName(clickedName);
    
    if (isoClicked === isoTarget) {
      // Correct answer
      const multiplier = selectedMode === "quiz" ? calculateMultiplier(timeElapsed) : 1;
      const points = 100 * multiplier; // Base 100 points per question (max 500 for 5 questions)
      const newScore = score + points;
      setScore(newScore);
      setFeedback("correct");
      
      // Auto-advance after delay
      setTimeout(() => {
        nextQuestion(newScore);
      }, 1500);
    } else {
      // Wrong answer - show feedback briefly then move to next
      setFeedback("wrong");
      
      // Auto-advance after showing wrong message (0 points added)
      setTimeout(() => {
        nextQuestion(score);
      }, 1500);
    }
  };
  
  // Next question
  const nextQuestion = (finalScore = score) => {
    setFeedback("");
    setSelectedCountry(null);
    setClickedCountryName("");
    
    if (selectedMode === "quiz") {
      if (currentQuestion < 4) {
        setCurrentQuestion(q => q + 1);
        setQuestionStartTime(Date.now());
      } else {
        // End quiz - submit score to leaderboard
        setGameState("finished");
        submitScoreToLeaderboard(finalScore);
        setShowEndGame(true);
      }
    } else {
      // Learning mode - pick a new random country
      const randomIndex = Math.floor(Math.random() * availableCountries.length);
      setLearningTarget(availableCountries[randomIndex]);
      setQuestionStartTime(Date.now());
      mapRef.current?.recenter();
    }
  };

  // Submit score to leaderboard
  const submitScoreToLeaderboard = async (finalScore = score) => {
    try {
      if (!user || !user._id || !user.username) {
        console.log('Not logged in, score not submitted');
        return;
      }

      const maxScore = 500; // 5 questions × 100 points
      const percentage = Math.round((finalScore / maxScore) * 100);
      
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5050";

      const response = await fetch(`${apiBase}api/leaderboard/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Send cookies
        body: JSON.stringify({
          userId: user._id,
          username: user.username,
          gameType: 'countries',
          continent: selectedContinent,
          score: Math.round(finalScore),
          maxScore: 500,
          percentage
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Score submitted:', data);
        if (data.isNewRecord) {
          console.log('🎉 New high score!');
        }
      } else {
        console.error('Failed to submit score:', await response.text());
      }
    } catch (error) {
      console.error('Failed to submit score:', error);
    }
  };
  

  
  // Reset game
  const resetGame = () => {
    setGameState("setup");
    setSelectedContinent(null);
    setSelectedMode(null);
    setScore(0);
    setCurrentQuestion(0);
    setFeedback("");
    setSelectedCountry(null);
    setQuizQuestions([]);
    setShowEndGame(false);
  };
  
  // Setup screen
  if (gameState === "setup") {
    return (
      <div className="main-wrap">
        <div className="setup-container" style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          maxWidth: "800px",
          margin: "0 auto"
        }}>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "40px", textAlign: "center" }}>
            🌍 Country Quiz
          </h1>
          
          {!selectedContinent && (
            <div style={{ width: "100%" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "20px" }}>Choose a Region:</h2>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                marginBottom: "40px"
              }}>
                {CONTINENTS.map(continent => (
                  <button
                    key={continent.id}
                    onClick={() => setSelectedContinent(continent.id)}
                    style={{
                      padding: "24px",
                      fontSize: "1.1rem",
                      background: "#fff",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px"
                    }}
                    className="continent-btn"
                  >
                    <span style={{ fontSize: "2rem" }}>{continent.emoji}</span>
                    <span style={{ fontWeight: "600" }}>{continent.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {selectedContinent && !selectedMode && (
            <div style={{ width: "100%" }}>
              <button
                onClick={() => setSelectedContinent(null)}
                style={{
                  marginBottom: "20px",
                  padding: "8px 16px",
                  background: "#f3f4f6",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                ← Back
              </button>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "20px" }}>Choose a Mode:</h2>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "16px"
              }}>
                {MODES.map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => startGame(selectedContinent, mode.id)}
                    style={{
                      padding: "32px",
                      fontSize: "1.1rem",
                      background: "#fff",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      textAlign: "left"
                    }}
                    className="mode-btn"
                  >
                    <div style={{ fontWeight: "600", marginBottom: "8px", fontSize: "1.3rem" }}>
                      {mode.name}
                    </div>
                    <div style={{ color: "#6b7280", fontSize: "0.95rem" }}>
                      {mode.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Playing state
  return (
    <div className="main-wrap">
      <div className="map-card">
        {/* Quiz HUD */}
        <div className="map-toolbar" style={{ borderBottom: "1px solid #eef0f3" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span className="toolbar-title">
              {selectedMode === "quiz" 
                ? `Question ${currentQuestion + 1}/5` 
                : "Find this country:"}
            </span>
            <span style={{ fontWeight: 700, fontSize: "1.2rem" }}>{targetName}</span>
          </div>
          <div className="toolbar-spacer" />
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ fontSize: "1.1rem" }}>
              Score: <strong>{Math.round(score)}</strong>
            </div>
            {selectedCountry && !feedback && (
              <button 
                className="tool" 
                onClick={handleGuess}
                style={{
                  background: "#10b981",
                  color: "white",
                  fontWeight: "600",
                  padding: "8px 20px"
                }}
              >
                ✓ Guess
              </button>
            )}
          </div>
          <button className="tool" onClick={() => mapRef.current?.recenter()}>Recenter</button>
          <button className="tool" onClick={resetGame}>Exit</button>
        </div>

        {/* Feedback strip */}
        {feedback && (
          <div style={{
            padding: "12px 16px",
            background: feedback === "correct" ? "#ecfdf5" : "#fee2e2",
            color: feedback === "correct" ? "#065f46" : "#991b1b",
            borderBottom: "1px solid #eef0f3",
            fontSize: "1.1rem",
            fontWeight: "600"
          }}>
            {feedback === "correct" 
              ? `✅ Correct! You clicked ${clickedCountryName}${selectedMode === "quiz" ? ` +${Math.round(score - (currentQuestion > 0 ? 0 : score))} points` : ""}` 
              : `❌ Wrong! You clicked ${clickedCountryName}, but the answer was ${targetName}`}
          </div>
        )}
        
        {/* Selected country indicator */}
        {selectedCountry && !feedback && (
          <div style={{
            padding: "8px 16px",
            background: "#f3f4f6",
            borderBottom: "1px solid #eef0f3",
            fontSize: "0.95rem"
          }}>
            Country selected - Press "Guess" to confirm
          </div>
        )}

        {/* Map */}
        <div className="map-viewport">
          <QuizMap
            ref={mapRef}
            zoom={2}
            countriesData={countriesGeo}
            onCountryClick={handleCountryClick}
            selectedCountry={selectedCountry}
          />
        </div>

        {/* Footer controls */}
        <div style={{ 
          display: "flex", 
          gap: 8, 
          padding: "12px 16px", 
          borderTop: "1px solid #eef0f3", 
          background: "#fff",
          justifyContent: "flex-end"
        }}>
          <button className="tool" onClick={() => mapRef.current?.recenter()}>Reset View</button>
        </div>
      </div>
      
      {showEndGame && (
        <EndGamePopUp
          score={Math.round(score)}
          totalQuestions={5}
          onRestart={resetGame}
          onExit={() => navigate('/')}
        />
      )}
    </div>
  );
}