// src/components/Quiz.js
import React, { useEffect, useState, useCallback } from "react";

function Quiz({ topic, user, onBackToTutor, onLogout }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [userAnswers, setUserAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [quizAttempt, setQuizAttempt] = useState(1);

  const generateQuiz = useCallback(async () => {
    setLoading(true);
    setError("");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setShowResults(false);
    setScore(0);
    setFeedback("");
    setSelectedAnswer("");

    try {
      const timestamp = Date.now();
      const randomSeed = Math.floor(Math.random() * 1000000);
      const difficultyLevels = ["easy", "medium", "hard", "mixed"];
      const randomDifficulty = difficultyLevels[Math.floor(Math.random() * difficultyLevels.length)];
      
      const variationPrompts = [
        "Generate unique and different questions",
        "Create fresh quiz questions with new examples",
        "Design original questions not asked before",
        "Make creative and varied quiz items",
        "Provide diverse questions from different angles"
      ];
      const randomPrompt = variationPrompts[Math.floor(Math.random() * variationPrompts.length)];
      
      const requestBody = { 
        topic, 
        num_questions: 5,
        timestamp,
        seed: randomSeed,
        attempt: quizAttempt,
        difficulty: randomDifficulty,
        variation_prompt: randomPrompt,
        request_id: `${topic}-${timestamp}-${randomSeed}`,
        force_new: true
      };
      
      const response = await fetch("http://localhost:8000/ai-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok && data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
      } else {
        setError(data.error || data.detail || "Failed to generate quiz. Please try again.");
      }
    } catch (err) {
      setError("Connection error. Make sure backend is running on http://localhost:8000");
    } finally {
      setLoading(false);
    }
  }, [topic, quizAttempt]);

  useEffect(() => {
    if (topic) {
      generateQuiz();
    }
  }, [topic, generateQuiz]);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = selectedAnswer;
    setUserAnswers(newAnswers);
    setSelectedAnswer("");

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateScore(newAnswers);
    }
  };

  const calculateScore = async (answers) => {
    let correctCount = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.correct_answer) {
        correctCount++;
      }
    });
    setScore(correctCount);

    try {
      const response = await fetch("http://localhost:8000/quiz-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: correctCount,
          total: questions.length,
          topic,
        }),
      });
      const data = await response.json();
      if (data.feedback) {
        setFeedback(data.feedback);
      }
    } catch (error) {
      setFeedback("Great effort! Keep practicing to improve your understanding.");
    }
    setShowResults(true);
  };

  const handleRetry = () => {
    setQuizAttempt(prev => prev + 1);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md border-2 border-gray-200">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-indigo-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Generating Quiz <span className="text-indigo-600">{quizAttempt}</span></h2>
          <p className="text-lg text-gray-600 mb-2">Topic: <span className="font-semibold text-indigo-600">{topic}</span></p>
          <p className="text-sm text-gray-500 mt-4">Creating fresh questions just for you! ✨</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md border-2 border-gray-200">
          <svg className="w-20 h-20 text-red-500 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Oops!</h2>
          <p className="text-gray-600 mb-8 text-lg">{error}</p>
          <div className="flex gap-4 justify-center">
            <button onClick={handleRetry} className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg transform hover:scale-105">Try Again</button>
            <button onClick={onBackToTutor} className="px-8 py-3 bg-gray-100 text-gray-700 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-200 transition-all transform hover:scale-105">Back</button>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-white shadow-md border-b-2 border-gray-200">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Quiz Results - Attempt <span className="text-indigo-600">{quizAttempt}</span></h1>
              <p className="text-sm text-gray-600">Topic: {topic}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={onBackToTutor} className="px-6 py-2.5 bg-indigo-50 text-indigo-600 border-2 border-indigo-200 rounded-xl font-semibold hover:bg-indigo-100 transition-all transform hover:scale-105">Back to Tutor</button>
              <button onClick={onLogout} className="px-6 py-2.5 bg-gray-100 text-gray-700 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-200 transition-all transform hover:scale-105">Logout</button>
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto p-6 bg-white">
          <div className="bg-white rounded-3xl shadow-2xl p-10 border-2 border-gray-200">
            <div className="text-center mb-12">
              <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full mb-6 ${percentage >= 80 ? "bg-green-100" : percentage >= 60 ? "bg-amber-100" : "bg-red-100"}`}>
                <span className={`text-5xl font-bold ${percentage >= 80 ? "text-green-600" : percentage >= 60 ? "text-amber-600" : "text-red-600"}`}>{percentage}%</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-3">You scored {score} out of {questions.length}</h2>
              {feedback && <div className="bg-indigo-50 border-l-4 border-indigo-500 p-5 rounded-xl mt-6 max-w-2xl mx-auto"><p className="text-gray-700 text-lg leading-relaxed">{feedback}</p></div>}
            </div>
            <div className="space-y-6 mb-10">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                Review Your Answers
              </h3>
              {questions.map((question, index) => {
                const userAnswer = userAnswers[index];
                const isCorrect = userAnswer === question.correct_answer;
                return (
                  <div key={index} className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shadow-md ${isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                        {isCorrect ? <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> : <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>}
                      </div>
                      <p className="text-lg font-semibold text-gray-800 flex-1">{index + 1}. {question.question}</p>
                    </div>
                    <div className="ml-16 space-y-3">
                      <div className="flex items-center gap-2"><span className="font-semibold text-gray-700">Your answer:</span><span className={`font-medium ${isCorrect ? "text-green-600" : "text-red-600"}`}>{userAnswer || "Not answered"}</span></div>
                      {!isCorrect && <div className="flex items-center gap-2"><span className="font-semibold text-gray-700">Correct answer:</span><span className="font-medium text-green-600">{question.correct_answer}</span></div>}
                      {question.explanation && <div className="bg-white border-2 border-indigo-200 p-4 rounded-xl mt-3"><p className="text-gray-700"><span className="font-semibold text-indigo-600">💡 Explanation:</span> {question.explanation}</p></div>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 justify-center flex-wrap">
              <button onClick={handleRetry} className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                <span>Try Quiz #{quizAttempt + 1}</span>
              </button>
              <button onClick={onBackToTutor} className="px-10 py-4 bg-amber-500 text-white rounded-xl font-bold text-lg hover:bg-amber-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">Back to Tutor</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz taking screen
  const currentQuestion = questions[currentQuestionIndex];
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white shadow-md border-b-2 border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quiz Time! - Attempt <span className="text-indigo-600">{quizAttempt}</span></h1>
            <p className="text-sm text-gray-600">Topic: {topic}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onBackToTutor} className="px-6 py-2.5 bg-indigo-50 text-indigo-600 border-2 border-indigo-200 rounded-xl font-semibold hover:bg-indigo-100 transition-all transform hover:scale-105">Back</button>
            <button onClick={onLogout} className="px-6 py-2.5 bg-gray-100 text-gray-700 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-200 transition-all transform hover:scale-105">Logout</button>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto p-6 bg-white">
        <div className="bg-white rounded-3xl shadow-2xl p-10 border-2 border-gray-200">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-5">
              <span className="text-lg font-bold text-gray-800">Question {currentQuestionIndex + 1} of {questions.length}</span>
              <div className="bg-indigo-100 px-5 py-2 rounded-full border-2 border-indigo-200"><span className="text-indigo-700 font-bold">Progress: {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span></div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden border-2 border-gray-300"><div className="h-full bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-full transition-all duration-500" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-8 leading-relaxed">{currentQuestion.question}</h2>
          <div className="space-y-4 mb-10">
            {currentQuestion.options.map((option, index) => (
              <button key={index} onClick={() => handleAnswerSelect(option)} className={`w-full p-5 rounded-xl text-left font-semibold transition-all transform text-base ${selectedAnswer === option ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-xl scale-[1.02] border-2 border-indigo-700" : "bg-gray-50 text-gray-800 hover:bg-gray-100 hover:shadow-lg hover:scale-[1.01] border-2 border-gray-300"}`}>
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 text-sm font-bold mr-4">{String.fromCharCode(65 + index)}</span>
                {option}
              </button>
            ))}
          </div>
          <button onClick={handleNextQuestion} disabled={!selectedAnswer} className="w-full py-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-bold text-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3">
            <span>{currentQuestionIndex < questions.length - 1 ? "Next Question" : "Submit Quiz"}</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Quiz;