"use client";

import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-background py-4 not-italic font-bold uppercase">
      <div className="container mx-auto px-4 text-center">
        <p>
          &copy; {new Date().getFullYear()} SwiftReader. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
