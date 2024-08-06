import { useEffect, useMemo, useRef, useState } from "react";

import CircularImage from "../components/specific/CircularImage";
import HomeButton from "../components/specific/HomeButton";
import LoginButton from "../components/specific/LoginButton";

type fetchedData = {
  id: string;
  email: string;
  src: string;
  style: {
    top: string;
    left: string;
    transform?: string;
  };
  size: string;
  mobileSize: string;
};

const Homepage: React.FC = () => {
  const [people, setPeople] = useState<fetchedData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const hasFetched = useRef(false);
  const styles = useMemo(() => {
    return [
      { top: "15%", left: "20%" },
      { top: "90%", left: "60%" },
      { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
      { top: "70%", left: "20%" },
      { top: "60%", left: "80%" },
    ];
  }, []);
  
  useEffect(() => {
    if (hasFetched.current) {
      return;
    }

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

    const fetchedPeople = emojis.map((emoji, index) => ({
      id: `emoji-${index}`,
      email: `emoji${index}@example.com`,
      src: emoji,
      style: getRandomPosition(),
      size: getRandomSize(),
      mobileSize: getMobileSize(),
    }));

    setPeople(fetchedPeople);
    setLoading(false);
    hasFetched.current = true;
  }, [hasFetched, styles]);

  const getRandomSize = () => {
    const sizes = ["w-20 h-20", "w-24 h-24", "w-32 h-32", "w-36 h-36"];
    return sizes[Math.floor(Math.random() * sizes.length)];
  };
  const getMobileSize = () => {
    const sizes = ["w-20 h-20", "w-24 h-24", "w-32 h-32", "w-36 h-36"];
    return sizes[Math.floor(Math.random() * sizes.length)];
  };
  const getRandomPosition = () => {
    const top = Math.floor(Math.random() * 90) + 5 + "%";
    const left = Math.floor(Math.random() * 90) + 5 + "%";
    return { top, left, transform: "translate(-50%, -50%)" };
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#E500A4]">
        Loading...
      </div>
    );

  return (
    <div className="relative min-h-screen bg-[#E500A4] flex flex-col items-center gap-4">
      <div className="relative h-3/4 py-16 flex items-baseline justify-center gap-2 min-h-3.5 w-4/6">
        {people.map((person) => (
          <CircularImage
            key={person.id}
            src={person.src}
            size={person.size}
            style={person.style}
            mobileSize={person.mobileSize}
          />
        ))}
      </div>
      <div className="relative text-center text-white md:p-4">
        <h1 className="text-2xl font-bold md:text-3xl">
          The Social site brimming with fun and laughter!
        </h1>
        <p className="md:text-2xl">
          Join and discover endless humour to light up every moment of life.
        </p>
      </div>
      <div className="flex flex-col gap-6">
        <HomeButton
          color={`text-[#290628]`}
          border={`border`}
          text="Sign Up"
          bgColor={`bg-white`}
        />
        <LoginButton />
      </div>
    </div>
  );
};

export default Homepage;
