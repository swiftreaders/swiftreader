import { User } from "@/types/user";
import Link from "next/link";

interface LandingPageProps {
  loggedIn: boolean;

  user: User | null;
}

const LandingPage: React.FC<LandingPageProps> = ({ loggedIn, user }) => {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-primary text-white py-20">
        <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Read Faster, Learn More
            </h1>
          <p className="text-xl md:text-2xl mb-8">
            Unlock the secrets of speed reading and boost your productivity.
          </p>
          {loggedIn ? (
            <Link
              href={user?.isAdmin ? "/adminDashboard" : "/userDashboard"}
              className="bg-background text-primary py-3 px-6 rounded shadow hover:bg-gray-100 transition duration-200"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="bg-background text-primary py-3 px-6 rounded shadow hover:bg-gray-100 transition duration-200"
            >
              Get Started
            </Link>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-6">
            The Benefits of Speed Reading
          </h2>
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="flex-1 text-center mb-8 md:mb-0">
              <h3 className="text-xl font-semibold mb-2">Improve Focus</h3>
              <p>
                Learn techniques that help you concentrate better and filter out
                distractions.
              </p>
            </div>
            <div className="flex-1 text-center mb-8 md:mb-0">
              <h3 className="text-xl font-semibold mb-2">Save Time</h3>
              <p>
                Absorb more information in less time so you can focus on what
                really matters.
              </p>
            </div>
            <div className="flex-1 text-center">
              <h3 className="text-xl font-semibold mb-2">
                Expand Your Knowledge
              </h3>
              <p>
                Speed reading opens up new worlds of learning by letting you
                explore more content quickly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About SwiftReader Section */}
      <section className="bg-background py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-6">
            Why Choose SwiftReader?
          </h2>
          <p className="text-center mb-6 max-w-2xl mx-auto">
            Our platform offers personalized training, detailed progress
            tracking, and a community of fellow learners dedicated to mastering
            speed reading techniques. Whether you&apos;re looking to gain an
            edge in your career or simply enjoy reading more books, SwiftReader
            has you covered.
          </p>
          <div className="text-center">
            {loggedIn ? (
              <Link
                href={user?.isAdmin ? "/adminDashboard" : "/userDashboard"}
                className="bg-blue-600 text-white py-3 px-6 rounded shadow hover:bg-blue-700 transition duration-200"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="bg-blue-600 text-white py-3 px-6 rounded shadow hover:bg-blue-700 transition duration-200"
              >
                Join Now
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingPage;
