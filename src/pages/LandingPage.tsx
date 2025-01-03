import { Menu } from "lucide-react";

const LandingPage: React.FC = () => {
  return (
    <main>
      <header className="p-4 pb-2 md:p-8">
        <nav>
          <div className="avatar flex items-center justify-between pb-4">
            <div className="w-24">
              <img
                className="rounded-full shadow-md hover:cursor-pointer w-3/5 md:w-full"
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
            <div>
              <Menu
                size={45}
                style={{
                  boxShadow: "3px 3px red .5rem 0 .4em olive",
                  cursor: "pointer",
                }}
              />
            </div>
          </div>
          <hr className="w-screen md:hidden" />
        </nav>
      </header>
      <section>
        <h2 className="text-2xl font-bold px-2">Feeds</h2>
      </section>
    </main>
  );
};

export default LandingPage;
