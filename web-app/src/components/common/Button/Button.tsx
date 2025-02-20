"use client";

import Link from "next/link";

interface ButtonProps {
  href: string;
  displayText: string;
}

const Button: React.FC<ButtonProps> = ({ href, displayText }) => {
  return (
    <div>
      <Link
        className="inline-block uppercase px-10 py-5 font-extrabold not-italic text-white bg-secondary hover:text-primary transition duration-200 rounded-xl"
        href={href}
      >
        {displayText}
      </Link>
    </div>
  );
};

export default Button;
