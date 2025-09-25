import React, { useEffect, useState } from "react";
import CircularImage from "../components/specific/CircularImage";

type Person = {
  id: string;
  src: string;
  style: {
    top: string;
    left: string;
  };
  size: string;
};

const Homepage: React.FC = () => {
  const [people, setPeople] = useState<Person[]>([]);

  useEffect(() => {
    const emojis = [
      "/smiling-face-with-halo.svg",
      "/reshot-icon-rolling-on-the-floor-laughing.svg",
      "/reshot-icon-cute.svg",
      "/money-face.svg",
      "/icon-glasses-smirk.svg",
      "/icon-glasses-kiss.svg",
      "/face-laughing.svg",
      "/face-haha.svg",
      "/feeling.svg",
      "/disbelief.svg",
      "/rolling-eyes.svg",
      "/winking.svg"
    ];

    // Moved positions higher up (reduced top percentages)
    const positions = [
      { top: "5%", left: "10%" },
      { top: "15%", left: "80%" },
      { top: "25%", left: "20%" },
      { top: "35%", left: "75%" },
      { top: "45%", left: "15%" },
      { top: "55%", left: "60%" },
      { top: "20%", left: "50%" },
      { top: "40%", left: "40%" },
      { top: "10%", left: "65%" },
      { top: "50%", left: "30%" },
      { top: "30%", left: "85%" },
      { top: "60%", left: "25%" },
    ];

    // Reduced emoji sizes
    const sizes = ["w-8 h-8", "w-10 h-10", "w-12 h-12", "w-16 h-16"];

    const newPeople = emojis.map((emoji, index) => ({
      id: `emoji-${index}`,
      src: emoji,
      style: positions[index],
      size: sizes[index % sizes.length],
    }));

    setPeople(newPeople);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#E500A4] p-4">
      <div className="relative w-full max-w-2xl">
        <h1 className="text-6xl font-bold text-[#002D74] text-center sm:mb-4 absolute -top-36 left-20 sm:relative sm:-top-0 sm:left-0 font-akronim">
          G-nyce
        </h1>
        <div className="relative aspect-square">
          {people.map((person) => (
            <CircularImage
              key={person.id}
              src={person.src}
              size={person.size}
              style={{
                position: "absolute",
                top: person.style.top,
                left: person.style.left,
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center z-10 bg-[#E500A4]/50 rounded-lg p-4">
            <div className="mb-52">
              <h2 className="text-2xl md:text-3xl font-bold mb-8">
                The Social site brimming with fun and laughter!
              </h2>
            </div>
            <div className="flex flex-col gap-4 w-full max-w-xs mt-8">
              <button
                onClick={() => (window.location.href = "/signup")} // Redirects to the signup page
                className={`
                relative flex items-center justify-between
                px-8 py-4 text-white font-bold text-lg rounded-full bg-gradient-to-r from-purple-500 to-pink-500
              hover:from-pink-500 hover:to-purple-500
                shadow-lg hover:shadow-xl active:scale-95
                focus:ring-4 focus:ring-purple-300 focus:outline-none
                transition duration-300 ease-in-out group
              `}
              >
                <span className="tracking-wide text-sm">Let's Get Started</span>
                <svg
                  className="w-6 h-6 transform transition-transform duration-200 group-hover:translate-x-2 group-hover:scale-110"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 6L15 12L9 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;