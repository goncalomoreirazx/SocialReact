import React from 'react';
import { CheckCircle } from 'lucide-react';

const SuccessDialog = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 mx-4 max-w-sm w-full transform transition-all animate-fade-scale">
        <div className="flex items-center space-x-4">
          <div className="bg-green-100 rounded-full p-2">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <div className="flex-1">
            <p className="text-gray-800 font-semibold text-lg">{message}</p>
            <p className="text-gray-500 text-sm mt-1">Redirecting to home page...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessDialog;