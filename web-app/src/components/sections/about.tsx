import Link from "next/link";
import Button from "../common/Button";

interface AboutProps {
  loggedIn: boolean;
  user: {
    isAdmin: boolean;
  } | null;
}

function About({ loggedIn, user }: AboutProps) {
  return (
    <section className="h-sr-screen py-[10%]">
      <div className="h-full bg-background rounded-2xl mx-5 md:mx-20 shadow-lg text-white py-[5%]">
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
