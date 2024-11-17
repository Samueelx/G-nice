import React, { useEffect, useState } from 'react';
import CircularImage from "../components/specific/CircularImage";
import HomeButton from "../components/specific/HomeButton";
import LoginButton from "../components/specific/LoginButton";

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
      "/face-haha.svg"
    ];

    const positions = [
      { top: '10%', left: '10%' },
      { top: '20%', left: '80%' },
      { top: '40%', left: '20%' },
      { top: '60%', left: '75%' },
      { top: '80%', left: '15%' },
      { top: '85%', left: '60%' },
      { top: '30%', left: '50%' },
      { top: '70%', left: '40%' },
    ];

    const sizes = ["w-12 h-12", "w-16 h-16", "w-20 h-20", "w-24 h-24"];

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
        <h1 className="text-6xl font-bold text-[#002D74] text-center mb-8 font-akronim">G-nyce</h1>
        <div className="relative aspect-square">
          {people.map((person) => (
            <CircularImage
              key={person.id}
              src={person.src}
              size={person.size}
              style={{
                position: 'absolute',
                top: person.style.top,
                left: person.style.left,
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center z-10 bg-[#E500A4]/50 rounded-lg p-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              The Social site brimming with fun and laughter!
            </h2>
            <p className="text-lg md:text-xl mb-8">
              Join and discover endless humour to light up every moment of life.
            </p>
            <div className="flex flex-col gap-4 w-full max-w-xs">
              <HomeButton
                color="text-[#290628]"
                border="border"
                text="Sign Up"
                bgColor="bg-white"
              />
              <LoginButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;