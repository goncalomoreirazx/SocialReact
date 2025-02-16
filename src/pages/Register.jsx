import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import SuccessDialog from '../dialogs/SucessDialog';

function Register() {
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

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
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full space-y-8">
          <div>
            <h2 className="text-3xl text-center font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent transition-opacity">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Join our community and start sharing
            </p>
          </div>
          
          <RegisterForm onSuccess={handleRegistrationSuccess} />
        </div>
      </div>
    </div>
  );
}

export default Register;