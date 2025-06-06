import React from "react";
import { SparklesIcon } from "../constants";

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#A41E22] via-[#8C1A1F] to-[#751016] flex items-center justify-center z-[100]">
      <div className="text-center">
        <div className="relative mb-8">
          <SparklesIcon className="h-20 w-20 text-white mx-auto anim-float" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4 anim-fadeInUp">
          NovaBank
        </h1>
        <p
          className="text-white/80 text-lg anim-fadeInUp"
          style={{ animationDelay: "0.2s" }}
        >
          Preparing your banking experience...
        </p>
        <div className="mt-8 flex justify-center space-x-2">
          <div
            className="w-3 h-3 bg-white rounded-full anim-bounce"
            style={{ animationDelay: "0s" }}
          ></div>
          <div
            className="w-3 h-3 bg-white rounded-full anim-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-3 h-3 bg-white rounded-full anim-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
