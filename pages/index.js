// pages/index.js
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Your Ultimate Productivity Platform
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-lg mx-auto">
            Organize tasks, save notes, and showcase your work—all in one place.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/register">
              <button className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition duration-300">
                Get Started
              </button>
            </Link>
            <Link href="/login">
              <button className="border-2 border-white text-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition duration-300">
                Login
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Explore Our Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Feature 1: Notes */}
            <div className="p-6 bg-gray-50 rounded-lg shadow-lg text-center hover:shadow-xl transition">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-semibold mb-2">Notes</h3>
              <p className="text-gray-600 text-sm">
                Jot down ideas and keep your notes organized effortlessly.
              </p>
            </div>
            {/* Feature 2: Tasks */}
            <div className="p-6 bg-gray-50 rounded-lg shadow-lg text-center hover:shadow-xl transition">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-lg font-semibold mb-2">Tasks</h3>
              <p className="text-gray-600 text-sm">
                Track and manage your to-do list with ease.
              </p>
            </div>
            {/* Feature 3: Portfolio */}
            <div className="p-6 bg-gray-50 rounded-lg shadow-lg text-center hover:shadow-xl transition">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-lg font-semibold mb-2">Portfolio</h3>
              <p className="text-gray-600 text-sm">
                Showcase your projects to the world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Start Your Journey Today
          </h2>
          <p className="text-lg mb-6 max-w-md mx-auto">
            Sign up now to unlock powerful tools for productivity and creativity.
          </p>
          <Link href="/register">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition duration-300">
              Join Now
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-4">© 2025 YourAppName. All rights reserved.</p>
          <div className="flex justify-center gap-6">
            <Link href="/about" className="hover:text-gray-300">
              About
            </Link>
            <Link href="/contact" className="hover:text-gray-300">
              Contact
            </Link>
            <Link href="/privacy" className="hover:text-gray-300">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
