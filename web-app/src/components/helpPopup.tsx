import { useState } from "react";
import { Info } from "lucide-react";

export default function HelpPopup({ message }: { message: string }) {
    const [isVisible, setIsVisible] = useState(false);
  
    return (
      <div className="relative inline-block">
        <div
          className="flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full cursor-pointer"
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
        >
          <Info size={16} className="text-gray-600" />
        </div>
        {isVisible && (
          <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 p-2 bg-black text-white text-sm rounded-lg shadow-lg">
            {message.split("\\n").map((line, index) => (
              <span key={index}>
                {line}
                <br />
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }