import { useEffect, useMemo, useRef, useState } from "react";

import CircularImage from "../components/specific/CircularImage";
import HomeButton from "../components/specific/HomeButton";
import LoginButton from "../components/specific/LoginButton";
import { fetchPersons } from "../data/persons";
import { Person } from "../data/persons";

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
};

const Homepage: React.FC = () => {
  const [people, setPeople] = useState<fetchedData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);
  const styles = useMemo(() => {
    const styles = [
      { top: "15%", left: "20%" },
      { top: "90%", left: "60%" },
      { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
      { top: "70%", left: "20%" },
      { top: "60%", left: "80%" },
    ];
    return styles;
  }, []);
  useEffect(() => {
    if (hasFetched.current) {
      return;
    }
    const fetchData = async () => {
      try {
        const response = await fetchPersons();
        const fetchedPeople = response!.data.results.map(
          (user: Person, index: number) => ({
            id: user.id.value,
            email: user.email,
            src: user.picture.large,
            style: styles[index],
            size: getRandomSize(),
          })
        );
        console.log("Response: ", response!.data.results);
        setPeople(fetchedPeople);
      } catch (error) {
        setError("Error Fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hasFetched, styles]);
  const getRandomSize = () => {
    const sizes = ["w-16 h-16", "w-20 h-20", "w-24 h-24 w-32 h-32"];
    return sizes[Math.floor(Math.random() * sizes.length)];
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#EA7AF4]">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#EA7AF4]">
        {error}
      </div>
    );
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#EA7AF4] to-[#8A2BE2] flex flex-col items-center gap-4">
      <div className="relative h-3/4 py-16 flex items-start justify-center gap-2 min-h-3.5 w-4/6">
        {people.map((person) => (
          <CircularImage
            key={person.email}
            src={person.src}
            size={person.size}
            style={person.style}
          />
        ))}
      </div>
      <div className="relative text-center text-white md:p-4">
        <h1 className="text-2xl font-bold md:text-3xl">
          The Best Social App To Make New Friends!
        </h1>
        <p className="md:text-2xl">
          Find people with the same interests as you
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
