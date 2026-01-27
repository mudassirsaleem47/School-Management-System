import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Users, BookOpen, Calendar, DollarSign, BarChart3, Shield, ArrowRight, CheckCircle2, Play, Monitor, Smartphone, Cloud, Sparkles, Zap, FileText, UserCheck, Bell, Settings, Mail, Phone, MessageCircle, HelpCircle, Book, Video } from 'lucide-react';
import { useState } from 'react';

function Home() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Student Management",
      description: "Complete student records and enrollment tracking"
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Fee Collection",
      description: "Automated fee management and tracking"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Exam Management",
      description: "Schedule exams and generate results"
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Class Management",
      description: "Organize classes and subjects"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Reports & Analytics",
      description: "Comprehensive insights and reporting"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Reliable",
      description: "Bank-grade security"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Students" },
    { number: "500+", label: "Schools" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" }
  ];

  const benefits = [
    "Easy to use interface",
    "Real-time reporting",
    "Cloud-based access",
    "Mobile responsive",
    "Customizable workflows",
    "Dedicated support team"
  ];

  const featureCategories = [
    {
      category: "Student Management",
      icon: <Users className="w-8 h-8" />,
      features: [
        "Student admission and enrollment",
        "Student profiles with photos",
        "Attendance tracking",
        "Parent and guardian information",
        "Student promotion and transfer"
      ]
    },
    {
      category: "Fee Management",
      icon: <DollarSign className="w-8 h-8" />,
      features: [
        "Fee structure creation",
        "Online fee collection",
        "Payment receipts generation",
        "Fee defaulter reports",
        "Multiple payment methods"
      ]
    },
    {
      category: "Exam Management",
      icon: <Calendar className="w-8 h-8" />,
      features: [
        "Exam schedule creation",
        "Grade management",
        "Result card generation",
        "Mark sheets printing",
        "Performance analytics"
      ]
    },
    {
      category: "Class Management",
      icon: <BookOpen className="w-8 h-8" />,
      features: [
        "Class and section creation",
        "Subject assignment",
        "Teacher allocation",
        "Timetable management",
        "Classroom resources"
      ]
    },
    {
      category: "Reports & Analytics",
      icon: <BarChart3 className="w-8 h-8" />,
      features: [
        "Student performance reports",
        "Financial reports",
        "Attendance reports",
        "Custom report builder",
        "Data export options"
      ]
    },
    {
      category: "Security & Access",
      icon: <Shield className="w-8 h-8" />,
      features: [
        "Role-based access control",
        "Data encryption",
        "Secure authentication",
        "Activity logs",
        "Backup and recovery"
      ]
    }
  ];

  const additionalFeatures = [
    { icon: <FileText className="w-6 h-6" />, title: "Document Management", desc: "Store and manage all school documents" },
    { icon: <UserCheck className="w-6 h-6" />, title: "Staff Management", desc: "Complete employee records and payroll" },
    { icon: <Bell className="w-6 h-6" />, title: "Notifications", desc: "SMS and email notifications" },
    { icon: <Settings className="w-6 h-6" />, title: "Customizable", desc: "Adapt the system to your needs" }
  ];

  const releases = [
    {
      version: "v2.1.0",
      date: "December 2025",
      type: "Latest",
      changes: [
        { type: "new", text: "Added monthly recurring fee system" },
        { type: "new", text: "Improved exam result analytics" },
        { type: "improvement", text: "Enhanced mobile responsiveness" },
        { type: "fix", text: "Fixed data isolation issues between schools" }
      ]
    },
    {
      version: "v2.0.0",
      date: "November 2025",
      type: "Major",
      changes: [
        { type: "new", text: "Complete UI redesign" },
        { type: "new", text: "Added expense management module" },
        { type: "new", text: "Introduced role-based access control" },
        { type: "improvement", text: "Performance optimizations" }
      ]
    },
    {
      version: "v1.5.0",
      date: "October 2025",
      type: "Update",
      changes: [
        { type: "new", text: "Fee collection reports" },
        { type: "new", text: "Student admission workflow" },
        { type: "improvement", text: "Improved search functionality" },
        { type: "fix", text: "Various bug fixes and improvements" }
      ]
    }
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case "new": return "bg-blue-100 text-blue-700";
      case "improvement": return "bg-green-100 text-green-700";
      case "fix": return "bg-orange-100 text-orange-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "new": return <Sparkles className="w-4 h-4" />;
      case "improvement": return <Zap className="w-4 h-4" />;
      case "fix": return <CheckCircle2 className="w-4 h-4" />;
      default: return null;
    }
  };

  const getVersionBadgeColor = (type) => {
    switch (type) {
      case "Latest": return "bg-blue-600 text-white";
      case "Major": return "bg-purple-600 text-white";
      default: return "bg-gray-600 text-white";
    }
  };

  const supportOptions = [
    {
      icon: <Mail className="w-8 h-8" />,
      title: "Email Support",
      description: "Get help via email",
      contact: "support@schoolms.com",
      action: "Send Email"
    },
    {
      icon: <Phone className="w-8 h-8" />,
      title: "Phone Support",
      description: "Call us directly",
      contact: "+92 300 1234567",
      action: "Call Now"
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Live Chat",
      description: "Chat with our team",
      contact: "Available 9 AM - 6 PM",
      action: "Start Chat"
    }
  ];

  const resources = [
    { icon: <Book className="w-6 h-6" />, title: "Documentation", desc: "Comprehensive guides and tutorials" },
    { icon: <Video className="w-6 h-6" />, title: "Video Tutorials", desc: "Step-by-step video guides" },
    { icon: <HelpCircle className="w-6 h-6" />, title: "FAQ", desc: "Frequently asked questions" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <Header />

      {/* Hero Section */}
      <section id="home" className="relative py-16 md:py-32 px-4 md:px-6 overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-purple-600/10"></div>
        <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 md:w-96 h-64 md:h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-blue-100/80   border border-blue-200 rounded-full mb-4 md:mb-6 text-xs md:text-sm">
              <Sparkles className="w-3 md:w-4 h-3 md:h-4 text-blue-600" />
              <span className="font-medium text-blue-700">Modern School Management Platform</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 md:mb-6 leading-tight px-2">
              <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent">
                Transform Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                School Management
              </span>
            </h1>
            <p className="text-base md:text-xl text-gray-600 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
              Streamline operations, boost efficiency, and empower education with our comprehensive platform built for modern institutions.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center mb-12 md:mb-16 px-4">
              <button
                onClick={() => document.getElementById('demo').scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto group px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold text-base md:text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105"
              >
                View Demo
                <ArrowRight className="w-4 md:w-5 h-4 md:h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <Link
                to="/AdminRegister"
                className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-white/80   border-2 border-gray-200 text-gray-900 rounded-full font-semibold text-base md:text-lg hover:bg-white hover:border-blue-300 hover:shadow-xl transition-all duration-300 hover:scale-105 text-center"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto px-4">
{stats.map((stat, index) => (
                <div key={index} className="group p-4 md:p-6 bg-white/60 backdrop-blur-lg rounded-xl md:rounded-2xl border border-white shadow-lg hover:shadow-2xl hover:bg-white/80 transition-all duration-300">
                  <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1 md:mb-2">
                    {stat.number}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Powerful features to manage your institution efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 md:w-14 h-12 md:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg md:rounded-xl flex items-center justify-center text-white mb-4 md:mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/30">
                  {feature.icon}
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">{feature.title}</h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8 md:mb-12 px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              Why Choose Us?
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 md:gap-4 px-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="group flex items-center gap-3 md:gap-4 bg-white/80   p-4 md:p-5 rounded-lg md:rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
                <div className="w-7 md:w-8 h-7 md:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-4 md:w-5 h-4 md:h-5 text-white" />
                </div>
                <span className="text-sm md:text-base text-gray-700 font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-12 md:py-20 px-4 md:px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 md:mb-12 px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              See It In Action
            </h2>
            <p className="text-gray-600 text-base md:text-lg">
              Experience our platform with a live demo
            </p>
          </div>

          {/* Demo Video */}
          <div className="max-w-5xl mx-auto mb-12 md:mb-16 px-4">
            <div className="bg-gray-900 rounded-xl md:rounded-2xl overflow-hidden shadow-2xl aspect-video flex items-center justify-center">
              <div className="text-center px-4">
                <Play className="w-12 md:w-20 h-12 md:h-20 text-white mx-auto mb-3 md:mb-4 opacity-80" />
                <p className="text-white text-sm md:text-lg">Demo Video Coming Soon</p>
              </div>
            </div>
          </div>

          {/* Platforms */}
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 md:mb-8 text-center px-4">
            Available Platforms
          </h3>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 px-4">
            <div className="group p-6 md:p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl md:rounded-2xl text-center border border-blue-100 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 md:w-16 h-12 md:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 md:mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/30">
                <Monitor className="w-6 md:w-8 h-6 md:h-8 text-white" />
              </div>
              <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Web Dashboard</h4>
              <p className="text-sm md:text-base text-gray-600">
                Access from any browser with full features
              </p>
            </div>

            <div className="group p-6 md:p-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl md:rounded-2xl text-center border border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 md:w-16 h-12 md:h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 md:mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/30">
                <Smartphone className="w-6 md:w-8 h-6 md:h-8 text-white" />
              </div>
              <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Mobile App</h4>
              <p className="text-sm md:text-base text-gray-600">
                iOS and Android apps for on-the-go access
              </p>
            </div>

            <div className="group p-6 md:p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl md:rounded-2xl text-center border border-purple-100 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1 sm:col-span-2 md:col-span-1">
              <div className="w-12 md:w-16 h-12 md:h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4 md:mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/30">
                <Cloud className="w-6 md:w-8 h-6 md:h-8 text-white" />
              </div>
              <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Cloud Sync</h4>
              <p className="text-sm md:text-base text-gray-600">
                Real-time synchronization across all devices
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Features Section */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-gray-600 text-lg">
              Everything you need to manage your school efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {featureCategories.map((category, index) => (
              <div key={index} className="bg-white p-8 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    {category.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{category.category}</h3>
                </div>
                <ul className="space-y-3">
                  {category.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-600">
                      <span className="text-blue-600 mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Additional Features */}
          <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            And Much More...
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm text-center hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mx-auto mb-4">
                  {feature.icon}
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Changelog Section */}
      <section id="changelog" className="py-12 md:py-20 px-4 md:px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-10 md:mb-16 px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              Changelog
            </h2>
            <p className="text-gray-600 text-base md:text-lg">
              Track our product updates and improvements
            </p>
          </div>

          {/* Vertical Timeline */}
          <div className="relative px-4">
            {/* Timeline Line */}
            <div className="absolute left-4 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-indigo-200 to-purple-200"></div>

            <div className="space-y-8 md:space-y-12">
              {releases.map((release, index) => (
                <div key={index} className="relative pl-12 md:pl-20">
                  {/* Timeline Dot */}
                  <div className="absolute left-0 top-2 w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 border-2 md:border-4 border-white">
                    <span className="text-white font-bold text-xs md:text-sm">v{release.version.slice(1)}</span>
                  </div>

                  {/* Card */}
                  <div className="group bg-white border-2 border-gray-100 rounded-xl md:rounded-2xl p-5 md:p-8 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
                    <div className="flex flex-col sm:flex-row items-start justify-between mb-4 md:mb-6 gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                          <h3 className="text-xl md:text-2xl font-bold text-gray-900">{release.version}</h3>
                          <span className={`px-3 md:px-4 py-1 md:py-1.5 rounded-full text-xs font-bold ${getVersionBadgeColor(release.type)} shadow-sm`}>
                            {release.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <Calendar className="w-3 md:w-4 h-3 md:h-4" />
                          <span className="text-xs md:text-sm font-medium">{release.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 md:space-y-3">
                      {release.changes.map((change, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row items-start gap-2 md:gap-3 p-2 md:p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <span className={`px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 md:gap-1.5 ${getTypeColor(change.type)} shadow-sm shrink-0`}>
                            {getTypeIcon(change.type)}
                            {change.type}
                          </span>
                          <p className="text-sm md:text-base text-gray-700 flex-1 leading-relaxed">{change.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section id="support" className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How Can We Help?
            </h2>
            <p className="text-gray-600 text-lg">
              We're here to support you every step of the way
            </p>
          </div>

          {/* Contact Options */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {supportOptions.map((option, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-8 text-center hover:border-blue-300 hover:shadow-lg transition-all">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-6">
                  {option.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{option.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{option.description}</p>
                <p className="text-blue-600 font-medium mb-4">{option.contact}</p>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                  {option.action}
                </button>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Send Us a Message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="What is this about?"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Your message..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Resources */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Self-Service Resources
            </h3>

            <div className="grid md:grid-cols-3 gap-8">
              {resources.map((resource, index) => (
                <div key={index} className="bg-white p-8 rounded-xl shadow-sm text-center hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mx-auto mb-4">
                    {resource.icon}
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{resource.title}</h4>
                  <p className="text-sm text-gray-600">{resource.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-16 md:py-24 px-4 md:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 md:w-96 h-64 md:h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto max-w-4xl text-center relative z-10 px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 md:mb-6">Ready to Transform Your School?</h2>
          <p className="text-blue-100 text-base md:text-xl mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
            Join hundreds of schools using our platform to streamline their operations and enhance education quality
          </p>
          <Link
            to="/AdminLogin"
            className="inline-flex items-center gap-2 md:gap-3 px-8 md:px-12 py-4 md:py-5 bg-white text-blue-600 rounded-full font-bold text-base md:text-lg hover:bg-gray-50 hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-2xl shadow-black/20"
          >
            Access Your Portal
            <ArrowRight className="w-4 md:w-5 h-4 md:h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;
