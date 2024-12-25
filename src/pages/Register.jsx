import RegisterForm from '../components/auth/RegisterForm';

function Register() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Changed max-w-md to max-w-4xl for a much wider container */}
      <div className="max-w-4xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
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