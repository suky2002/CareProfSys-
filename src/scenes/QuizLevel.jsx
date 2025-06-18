import { quizQuestions } from "../data/questions";
import { useNavigate } from "react-router-dom";
import { useState } from "react";


const getBadge = (score, total) => {
    if (score === total) {
        return {
            label: "Expert",
            image: "/Imagini/badge3.png"
        };
    } else if (score >= 3) {
        return {
            label: "Intermediate",
            image: "/Imagini/badge2.png"
        };
    } else if (score >= 1) {
        return {
            label: "Beginner",
            image: "/Imagini/badge1.png"
        };
    } else {
        return null;
    }
};

export default function QuizLevel() {


    const navigate = useNavigate();
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [score, setScore] = useState(0);
    const [showLevel2Btn, setShowLevel2Btn] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const badge = getBadge(score, quizQuestions.length);

    const question = quizQuestions[current];
    const finished = current + 1 === quizQuestions.length;

    function handleAnswer(option) {
        setSelected(option);
        setShowAnswer(true);
        if (option === question.answer) {
            setScore((prev) => prev + 1);
        }
    }

    function handleNext() {
        if (finished) {
            setShowLevel2Btn(true);
        } else {
            setSelected(null);
            setShowAnswer(false);
            setCurrent(current + 1);
        }
    }

    function handleGoToLevel2() {
        if (score >= 3) {
            navigate("/level2");
        } else {
            setShowWarning(true);
        }
    }

    function handleSeeResults() {
        navigate("/quiz-results", {
            state: { score, total: quizQuestions.length },
        });
    }

    return (
        <div className="w-full h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center px-4">
            <div className="w-full max-w-5xl bg-gray-900 rounded-xl shadow-xl p-6 md:p-10 flex flex-col md:flex-row items-stretch space-y-6 md:space-y-0 md:space-x-8">
                <div className="flex-shrink-0">
                    <img
                        src={question.image}
                        alt="Quiz visual"
                        className="rounded-lg w-[400px] h-[400px] object-cover border-2 border-gray-700 shadow-lg"
                    />
                </div>

                <div className="flex flex-col justify-between w-full">
                    {!showLevel2Btn ? (
                        <>
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">
                                    Question {current + 1}
                                </h2>
                                <p className="mb-4 text-lg">{question.question}</p>
                                <div className="space-y-2">
                                    {question.type === "multiple" &&
                                        question.options.map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => handleAnswer(option)}
                                                disabled={showAnswer}
                                                className={`block w-full text-left py-2 px-4 rounded-lg transition-all duration-300 ${showAnswer
                                                    ? option === question.answer
                                                        ? "bg-green-600"
                                                        : option === selected
                                                            ? "bg-red-600"
                                                            : "bg-gray-700"
                                                    : "bg-indigo-600 hover:bg-indigo-700"
                                                    }`}
                                            >
                                                {option}
                                            </button>
                                        ))}

                                    {question.type === "truefalse" &&
                                        ["True", "False"].map((option) => {
                                            const value = option === "True";
                                            return (
                                                <button
                                                    key={option}
                                                    onClick={() => handleAnswer(value)}
                                                    disabled={showAnswer}
                                                    className={`block w-full text-left py-2 px-4 rounded-lg transition-all duration-300 ${showAnswer
                                                        ? value === question.answer
                                                            ? "bg-green-600"
                                                            : value === selected
                                                                ? "bg-red-600"
                                                                : "bg-gray-700"
                                                        : "bg-indigo-600 hover:bg-indigo-700"
                                                        }`}
                                                >
                                                    {option}
                                                </button>
                                            );
                                        })}
                                </div>
                            </div>

                            {showAnswer && (
                                <div className="mt-6 text-sm">
                                    <p className="mb-3 text-gray-300">{question.explanation}</p>
                                    <button
                                        onClick={handleNext}
                                        className="bg-purple-600 hover:bg-purple-700 transition px-4 py-2 rounded shadow mt-2"
                                    >
                                        {finished ? "Continue" : "Next Question →"}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full w-full">
                            <h2 className="text-2xl font-bold mb-4">
                                Quiz finished! Your score: {score} / {quizQuestions.length}
                            </h2>
                            {badge && (
                                <div className="flex flex-col items-center mb-4">
                                    <img
                                        src={badge.image}
                                        alt={badge.label}
                                        style={{ width: 160, height: 160 }} // mărește dimensiunea aici
                                    />
                                    <span className="mt-2 text-lg font-semibold">{badge.label} Badge</span>
                                </div>
                            )}
                            <button
                                onClick={handleGoToLevel2}
                                className="bg-green-600 hover:bg-green-700 transition px-4 py-2 rounded shadow mt-2"
                            >
                                Go to Level 2
                            </button>
                            <button
                                onClick={handleSeeResults}
                                className="bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded shadow mt-2 ml-2"
                            >
                                See Detailed Results
                            </button>
                            {showWarning && (
                                <p className="text-red-400 mt-4">
                                    You need at least 3 correct answers to proceed to Level 2. Please
                                    study more and try again!
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
