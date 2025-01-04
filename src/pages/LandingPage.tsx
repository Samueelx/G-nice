import SocialPost from "@/components/common/SocialPost";

import data from '@/data.json'
import PostFilter from "@/components/common/PostFilter";
import HamburgerSwap from "@/components/specific/HamburgerSwap";

const LandingPage: React.FC = () => {
  return (
    <main className="relative">
      <header className="p-2 mb-2 md:p-8 static top-0 z-10 shadow-sm">
        <nav>
          <div className="avatar flex items-center justify-between pb-4">
            <div className="w-24">
              <img
                className="rounded-full shadow-md hover:cursor-pointer w-3/5 md:w-full object-cover"
                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
              />
            </div>
            <div className="w-24 ">
              <img
                className="rounded-full shadow-md hover:cursor-pointer w-3/5 md:w-full"
                src="/g-icon.svg"
                alt="G Icon"
              />
            </div>
            <div className="">
              <HamburgerSwap />
            </div>
          </div>
        </nav>
      </header>
      <section>
        <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold px-2">Feeds</h2>
        <PostFilter />
        </div>
        <div>
          {data.map((post, index) => (
            <SocialPost key={index} {...post}/>
          ))}
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
