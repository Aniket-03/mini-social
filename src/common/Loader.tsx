import React from "react";

const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background Blur */}
      <div className="absolute inset-0 backdrop-blur-[1px] pointer-events-none"></div>

      {/* Loader Spinner */}
      <div className="relative z-10">
        <div className="w-12 h-12 border-4 border-t-4 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default Loader;
