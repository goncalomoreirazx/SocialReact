import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import SuccessDialog from '../dialogs/SucessDialog';

function Register() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  // Animation on page load
  useEffect(() => {
    setIsAnimating(true);
  }, []);

  const handleRegistrationSuccess = () => {
    console.log("Registration successful, showing dialog");
    setShowSuccess(true);
    
    // Navigate after delay
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  return (
    <div className="relative">
      {/* Success Dialog */}
      {showSuccess && (
        <SuccessDialog
          message="Account registered successfully!"
          onClose={() => setShowSuccess(false)}
        />
      )}

      {/* Registration Form */}
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center py-4 px-4 sm:py-8 sm:px-6 md:py-12">
        <div className={`w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl transition-all duration-500 ease-out transform ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} space-y-6 md:space-y-8`}>
          <div className="bg-white rounded-xl shadow-lg px-6 py-8 md:px-8 md:py-10">
            <div className="mb-6 md:mb-8">
              <h2 className="text-2xl sm:text-3xl text-center font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent transition-opacity">
                Create your account
              </h2>
              <p className="mt-2 text-center text-sm sm:text-base text-gray-600">
                Join our community and start sharing
              </p>
            </div>
            
            <RegisterForm onSuccess={handleRegistrationSuccess} />
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Already have an account? 
              <a href="/" className="ml-1 text-blue-500 hover:text-blue-700 font-medium">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;