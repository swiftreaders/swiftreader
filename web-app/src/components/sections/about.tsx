import Link from "next/link";

interface AboutProps {
  loggedIn: boolean;
  user: {
    isAdmin: boolean;
  } | null;
}

function About({ loggedIn, user }: AboutProps) {
  return (
    <section className="h-sr-screen bg-gradient-to-l from-indigo-600 to-blue-600 rounded-2xl mx-5 md:mx-20 my-10 p-6 shadow-lg text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-6">
          Why Choose SwiftReader?
        </h2>
        <p className="text-center mb-6 max-w-2xl mx-auto">
          Our platform offers personalized training, detailed progress tracking,
          and a community of fellow learners dedicated to mastering speed
          reading techniques. Whether you&apos;re looking to gain an edge in
          your career or simply enjoy reading more books, SwiftReader has you
          covered.
        </p>
        <div className="text-center">
          {loggedIn ? (
            <Link
              href={user?.isAdmin ? "/adminDashboard" : "/userDashboard"}
              className="bg-blue-600 text-white py-3 px-6 rounded shadow-lg hover:bg-blue-700 transition duration-200"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="bg-blue-600 text-white py-3 px-6 rounded shadow-lg hover:bg-blue-700 transition duration-200"
            >
              Join Now
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export default About;
