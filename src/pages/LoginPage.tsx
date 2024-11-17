const LoginPage: React.FC = () => {
  return (
    <section className="bg-[#E500A4] min-h-screen flex items-center justify-center">
      {/* login container */}
      <div className="bg-cyan-100 flex rounded-2xl shadow-lg max-w-3xl p-5 h-svh md:h-full">
        {/* form */}
        <div className="sm:w-1/2 px-16">
          <h2 className="font-bold text-2xl text-[#002D74]">Login</h2>
          <p className="text-sm mt-4 text-[#002D74]">
            If you're already a member, easily log in
          </p>

          <form action="" className="flex flex-col gap-4">
            <input
              className="p-2 mt-8 rounded-xl border"
              type="email"
              name="email"
              placeholder="Email"
            />
            <div className="relative">
              <input
                className="p-2 rounded-xl border w-full"
                type="password"
                name=""
                placeholder="Password"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="gray"
                className="absolute top-1/2 right-3 -translate-y-1/2 bi bi-eye"
                viewBox="0 0 16 16"
              >
                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
              </svg>
            </div>
            <button className="bg-[#FEC5D8] rounded-xl py-2">Log in</button>
          </form>

          <div className="mt-10 grid grid-cols-3 items-center text-gray-500">
            <hr className="border-gray-500" />
            <p className="text-center text-sm">OR</p>
            <hr className="border-gray-500" />
          </div>

          <button className="bg-white border py-2 w-full rounded-xl mt-5 flex justify-center items-center text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="21"
              height="21"
              fill="currentColor"
              className="mr-3 bi bi-google"
              viewBox="0 0 16 16"
            >
              <path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z" />
            </svg>
            Login with Google
          </button>

          <div className="mt-10 text-xs border-b py-4">
            <a href="#">Forgot your password?</a>
          </div>
          <div className="mt-3 text-xs flex justify-between items-center">
            <p>If you don't have an account...</p>
            <button className="py-2 px-5 bg-white border rounded-xl">Register</button>
          </div>
        </div>
        {/* image */}
        <div className="sm:block hidden w-1/2">
          <img className="rounded-2xl" src="gnice-login.jpg" alt="" />
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
