import Button from "../common/Button";

interface AboutProps {
  loggedIn: boolean;
  user: {
    isAdmin: boolean;
  } | null;
}

function About({ loggedIn, user }: AboutProps) {
  return (
    <section className="h-screen flex items-center justify-center py-[5%]">
      <div className="h-1/2 w-3/5 bg-background rounded-2xl shadow-lg py-[3%] flex flex-col items-center justify-center">


        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-6">
            Why Choose SwiftReader?
          </h2>
          <p className="text-lg md:text-xl text-center mb-6 max-w-2xl mx-auto">
            Our platform offers personalized training, detailed progress
            tracking, and a community of fellow learners dedicated to mastering
            speed reading techniques. Whether you&apos;re looking to gain an
            edge in your career or simply enjoy reading more books, SwiftReader
            has you covered.
          </p>
          <div className="text-center">
            {loggedIn ? (
              <Button
                href={user?.isAdmin ? "/adminDashboard" : "/userDashboard"}
                displayText="Go to Dashboard"
              />
            ) : (
              <Button href="/auth/login" displayText="Join Now" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
