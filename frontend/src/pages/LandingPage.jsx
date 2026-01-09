import { Link } from 'react-router-dom';
import { GraduationCap, Users, BookOpen, Calendar, DollarSign, BarChart3, Shield, ArrowRight } from 'lucide-react';

function LandingPage() {
  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Student Management",
      description: "Complete student records, admission, and enrollment tracking"
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Fee Collection",
      description: "Automated fee management with payment tracking"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Exam Management",
      description: "Schedule exams, manage grades, and generate results"
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Class Management",
      description: "Organize classes and subject assignments"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Reports & Analytics",
      description: "Comprehensive insights and reporting"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Reliable",
      description: "Bank-grade security with role-based access"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Students" },
    { number: "500+", label: "Schools" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" }
  ];

  return (
    <div className="landing-page bg-white min-h-screen">
      {/* Header/Navigation */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-gray-800" />
              <span className="text-xl font-semibold text-gray-900">School Management System</span>
            </div>
            <div className="flex gap-3">
              <Link
                to="/teacher/login"
                className="px-4 py-2 text-emerald-700 font-medium hover:text-emerald-800 transition border border-emerald-600 rounded-lg hover:bg-emerald-50"
              >
                Teacher Login
              </Link>
              <Link
                to="/AdminLogin"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
              >
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section bg-gray-50 py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Modern School Management
              <span className="block text-gray-700 mt-2">Made Simple</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Streamline your school operations with our comprehensive management platform. 
              Built for efficiency and ease of use.
            </p>

            {/* CTA Buttons - Admin & Teacher Login */}
            <div className="flex flex-col gap-6 justify-center items-center max-w-4xl mx-auto">
              <h3 className="text-lg font-600 text-gray-700">Choose Your Portal</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {/* Admin Login Card */}
                <Link
                  to="/AdminLogin"
                  className="group p-8 bg-white border-2 border-indigo-600 rounded-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
                      <Shield className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">Admin Portal</h4>
                    <p className="text-gray-600 mb-4">Manage your school operations</p>
                    <div className="flex items-center gap-2 text-indigo-600 font-600">
                      Login as Admin
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>

                {/* Teacher Login Card */}
                <Link
                  to="/teacher/login"
                  className="group p-8 bg-white border-2 border-emerald-600 rounded-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-600 transition-colors">
                      <GraduationCap className="w-8 h-8 text-emerald-600 group-hover:text-white transition-colors" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">Teacher Portal</h4>
                    <p className="text-gray-600 mb-4">Access your teaching dashboard</p>
                    <div className="flex items-center gap-2 text-emerald-600 font-600">
                      Login as Teacher
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </div>

              {/* Register Link */}
              <div className="mt-4 text-center">
                <p className="text-gray-600">
                  New school?
                  <Link to="/AdminRegister" className="ml-2 text-indigo-600 hover:text-indigo-700 font-600 underline">
                    Register here
                  </Link>
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section py-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Powerful features to manage your institution efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-20 px-6 bg-gray-900 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Join hundreds of schools using our platform to streamline their operations
          </p>
          <Link
            to="/AdminLogin"
            className="inline-flex items-center gap-2 px-10 py-4 bg-white text-gray-900 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-200"
          >
            Access Your Portal
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-white border-t border-gray-200">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center mb-3">
            <GraduationCap className="w-6 h-6 text-gray-700 mr-2" />
            <span className="text-sm font-medium text-gray-900">School Management System</span>
          </div>
          <p className="text-sm text-gray-600">
            © 2025 School Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
