"use client";
import { Button } from "@/components/ui/button";
import { HelpCircle, LifeBuoy, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import QUESTIONS_DATA from "../questions.json";
import millionaireIcon from "./millionaire.png";
const PRIZE_TIERS = [
  { amount: "$100", safe: false },
  { amount: "$200", safe: false },
  { amount: "$300", safe: false },
  { amount: "$500", safe: false },
  { amount: "$1,000", safe: true },
  { amount: "$2,000", safe: false },
  { amount: "$4,000", safe: false },
  { amount: "$8,000", safe: false },
  { amount: "$16,000", safe: false },
  { amount: "$32,000", safe: true },
  { amount: "$64,000", safe: false },
  { amount: "$125,000", safe: false },
  { amount: "$250,000", safe: false },
  { amount: "$500,000", safe: false },
  { amount: "$1,000,000", safe: true },
].reverse();

const MillionaireGame = () => {
  const selectedQuestions = useRef();
  const emptyArr = new Array(Math.floor(QUESTIONS_DATA.length / 15)).fill(0);
  console.log(QUESTIONS_DATA.length);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameState, setGameState] = useState("start"); // start, playing, won, lost
  const [currentPrize, setCurrentPrize] = useState("$0");
  const [safetyNetPrize, setSafetyNetPrize] = useState("$0");
  const [lifelines, setLifelines] = useState({
    fiftyFifty: true,
    phoneAFriend: true,
    askTheAudience: true,
  });
  const [remainingOptions, setRemainingOptions] = useState([]);

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const initializeGame = useCallback(() => {
    const allQuestions = QUESTIONS_DATA;
    let randomQuestions = null;
    if (selectedQuestions.current.value == "Random") {
      randomQuestions = shuffleArray(allQuestions).slice(0, 15);
    }
    if (Number(selectedQuestions.current.value) > emptyArr.length) {
      return;
    }
    if (!randomQuestions) {
      const end = emptyArr.length * Number(selectedQuestions.current.value);
      randomQuestions = allQuestions.slice(end - emptyArr.length, end);
    }

    setQuestions(randomQuestions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setGameState("playing");
    setCurrentPrize("$0");
    setSafetyNetPrize("$0");
    setLifelines({
      fiftyFifty: true,
      phoneAFriend: true,
      askTheAudience: true,
    });
  }, []);

  const handleAnswerSelect = (index) => {
    setSelectedAnswer(index);
  };

  const confirmAnswer = () => {
    if (selectedAnswer === null) return;

    const currentQuestion = questions[currentQuestionIndex];
    if (selectedAnswer === currentQuestion.correct) {
      // Correct answer
      const newPrizeIndex = PRIZE_TIERS.length - currentQuestionIndex - 1;
      const newPrize = PRIZE_TIERS[newPrizeIndex].amount;

      if (PRIZE_TIERS[newPrizeIndex].safe) {
        setSafetyNetPrize(newPrize);
      }

      setCurrentPrize(newPrize);

      if (currentQuestionIndex === questions.length - 1) {
        // Won the game
        setGameState("won");
      } else {
        // Move to next question
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setRemainingOptions([]);
      }
    } else {
      // Incorrect answer
      setGameState("lost");
    }
  };

  const useFiftyFifty = () => {
    if (!lifelines.fiftyFifty) return;

    const currentQuestion = questions[currentQuestionIndex];
    const correctIndex = currentQuestion.correct;
    const incorrectIndices = [0, 1, 2, 3].filter((i) => i !== correctIndex);

    const optionsToRemove = shuffleArray(incorrectIndices).slice(0, 2);
    const remainingOptions = [0, 1, 2, 3].filter(
      (i) => !optionsToRemove.includes(i)
    );

    setRemainingOptions(remainingOptions);
    setLifelines((prev) => ({ ...prev, fiftyFifty: false }));
  };

  const phoneAFriend = () => {
    if (!lifelines.phoneAFriend) return;

    const currentQuestion = questions[currentQuestionIndex];
    const correctIndex = currentQuestion.correct;

    setLifelines((prev) => ({ ...prev, phoneAFriend: false }));

    alert(`Your friend suggests: "${currentQuestion.content[correctIndex]}"`);
  };

  const askTheAudience = () => {
    if (!lifelines.askTheAudience) return;

    const currentQuestion = questions[currentQuestionIndex];
    const correctIndex = currentQuestion.correct;

    const audiencePoll = [0, 0, 0, 0].map((_, index) => {
      if (index === correctIndex) return 50 + Math.floor(Math.random() * 20);
      return Math.floor(Math.random() * 25);
    });

    setLifelines((prev) => ({ ...prev, askTheAudience: false }));

    alert(
      `Audience Poll:\nA: ${audiencePoll[0]}%\nB: ${audiencePoll[1]}%\nC: ${audiencePoll[2]}%\nD: ${audiencePoll[3]}%`
    );
  };

  const getCurrentQuestion = () => {
    return questions[currentQuestionIndex];
  };

  const renderAnswerOptions = () => {
    const currentQuestion = getCurrentQuestion();
    return currentQuestion.content.map((option, index) => {
      // Only show options that are not removed by fifty-fifty
      if (remainingOptions.length === 0 || remainingOptions.includes(index)) {
        return (
          <Button
            key={index}
            onClick={() => handleAnswerSelect(index)}
            variant={selectedAnswer === index ? "secondary" : "outline"}
            className="w-full mb-2 text-black text-wrap py-2 h-full"
          >
            {String.fromCharCode(65 + index)}. {option}
          </Button>
        );
      }
      return null;
    });
  };

  if (gameState === "start") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
        <Image
          src={millionaireIcon}
          width={450}
          height={450}
          alt="Who wants to be a millionaire logo"
        />
        <label htmlFor="Questions">
          Select question set or Get random questions
        </label>
        <select
          className="text-black mb-3"
          id="Questions"
          ref={selectedQuestions}
        >
          <option value={"Random"}>Random</option>;
          {emptyArr.map((val, i) => (
            <option key={i} value={`${i + 1}`}>
              {i + 1}
            </option>
          ))}
        </select>
        <Button onClick={initializeGame} size="lg" className="text-xl">
          Start Game
        </Button>
      </div>
    );
  }

  if (gameState === "won") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-600 text-white p-4">
        <h1 className="text-5xl font-bold mb-8">CONGRATULATIONS!</h1>
        <p className="text-3xl mb-4">You`&apos`ve Won $1,000,000!</p>
        <Button onClick={initializeGame} size="lg" className="text-xl">
          Play Again
        </Button>
      </div>
    );
  }

  if (gameState === "lost") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-600 text-white p-4">
        <h1 className="text-5xl font-bold mb-8">Game Over</h1>
        <p className="text-3xl mb-4">You won {safetyNetPrize}!</p>
        <Button onClick={initializeGame} size="lg" className="text-xl">
          Play Again
        </Button>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();

  return (
    <div className="flex min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 text-white min-w-[750px]">
      <div className="w-3/4 p-8">
        <div className="bg-black/50 p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-bold mb-4">
            Question {currentQuestionIndex + 1}
          </h2>
          <p className="text-xl">{currentQuestion.question}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">{renderAnswerOptions()}</div>
        <div className="mt-6 flex space-x-4">
          <Button
            onClick={confirmAnswer}
            disabled={selectedAnswer === null}
            className="flex-1"
          >
            Confirm Answer
          </Button>
        </div>
      </div>
      <div className="w-1/4 bg-black/30 p-4">
        <div className="mb-4">
          <h3 className="text-xl font-bold">Current Prize</h3>
          <p className="text-2xl">{currentPrize}</p>
        </div>
        <div className="mb-4">
          <h3 className="text-xl font-bold">Safety Net</h3>
          <p className="text-xl">{safetyNetPrize}</p>
        </div>
        <div className="space-y-4">
          <Button
            onClick={useFiftyFifty}
            disabled={!lifelines.fiftyFifty}
            variant={lifelines.fiftyFifty ? "default" : "ghost"}
            className="w-full"
          >
            <HelpCircle className="mr-2" /> 50:50
          </Button>
          <Button
            onClick={phoneAFriend}
            disabled={!lifelines.phoneAFriend}
            variant={lifelines.phoneAFriend ? "default" : "ghost"}
            className="w-full"
          >
            <LifeBuoy className="mr-2" /> Phone a Friend
          </Button>
          <Button
            onClick={askTheAudience}
            disabled={!lifelines.askTheAudience}
            variant={lifelines.askTheAudience ? "default" : "ghost"}
            className="w-full"
          >
            <X className="mr-2" /> Ask the Audience
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MillionaireGame;
