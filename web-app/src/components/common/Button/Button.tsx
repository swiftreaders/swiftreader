"use client";

import Link from "next/link";

interface ButtonProps {
  href: string;
  displayText: string;
  className?: string; // Add className property
}

const Button: React.FC<ButtonProps> = ({ href, displayText, className }) => {
  return (
    <div>
      <Link
        className={`inline-block uppercase px-10 py-5 font-extrabold not-italic text-white bg-purple-800 hover:text-black transition duration-200 rounded-xl ${className}`}
        href={href}
      >
        {displayText}
      </Link>
    </div>
  );
};

export default Button;
