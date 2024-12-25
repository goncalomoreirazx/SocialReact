import RegisterForm from '../components/auth/RegisterForm';

function Register() {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {/* Changed max-w-md to max-w-4xl for a much wider container */}
        <div className="max-w-4xl w-full space-y-8">
          <div>
            <h2 className="text-3xl text-center font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent transition-opacity">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Join our community and start sharing
            </p>
          </div>
          
          <RegisterForm />
        </div>
      </div>
    );
  }
  
  export default Register;