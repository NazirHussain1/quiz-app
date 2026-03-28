"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../components/AdminLayout";
import { Settings, Save, Database, Mail, Shield, Bell, Globe } from "lucide-react";
import { toast } from "react-toastify";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    siteName: "Quiz App",
    siteDescription: "Pakistan Textbook Based Quiz Platform",
    adminEmail: "admin@quizapp.com",
    questionsPerQuiz: 10,
    timePerQuestion: 30,
    passingScore: 60,
    enableSignup: true,
    enableLeaderboard: true,
    enableSounds: true,
    maintenanceMode: false,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      
      if (!data.success || data.user.role !== "admin") {
        toast.error("Admin access required");
        router.push("/");
      }
    } catch (error) {
      router.push("/login");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate save (you can implement actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Settings className="w-8 h-8 text-blue-600" />
              Settings
            </h1>
            <p className="text-gray-600 mt-1">Configure your quiz platform</p>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>

        <div className="space-y-6">
          {/* General Settings */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">General Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Site Description
                </label>
                <textarea
                  name="siteDescription"
                  value={settings.siteDescription}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Admin Email
                </label>
                <input
                  type="email"
                  name="adminEmail"
                  value={settings.adminEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Quiz Settings */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">Quiz Settings</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Questions Per Quiz
                </label>
                <input
                  type="number"
                  name="questionsPerQuiz"
                  value={settings.questionsPerQuiz}
                  onChange={handleChange}
                  min="5"
                  max="50"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Time Per Question (seconds)
                </label>
                <input
                  type="number"
                  name="timePerQuestion"
                  value={settings.timePerQuestion}
                  onChange={handleChange}
                  min="10"
                  max="120"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  name="passingScore"
                  value={settings.passingScore}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">Features</h2>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Enable User Signup</p>
                    <p className="text-sm text-gray-600">Allow new users to register</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  name="enableSignup"
                  checked={settings.enableSignup}
                  onChange={handleChange}
                  className="w-6 h-6 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Enable Leaderboard</p>
                    <p className="text-sm text-gray-600">Show global leaderboard</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  name="enableLeaderboard"
                  checked={settings.enableLeaderboard}
                  onChange={handleChange}
                  className="w-6 h-6 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Enable Sound Effects</p>
                    <p className="text-sm text-gray-600">Play sounds for correct/wrong answers</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  name="enableSounds"
                  checked={settings.enableSounds}
                  onChange={handleChange}
                  className="w-6 h-6 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-red-50 rounded-xl cursor-pointer hover:bg-red-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Maintenance Mode</p>
                    <p className="text-sm text-gray-600">Disable site for maintenance</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  name="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={handleChange}
                  className="w-6 h-6 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                />
              </label>
            </div>
          </div>

          {/* Database Info */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-md p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6" />
              <h2 className="text-xl font-bold">Database Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-blue-100 text-sm">Total Questions</p>
                <p className="text-3xl font-bold mt-1">70</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-blue-100 text-sm">Total Users</p>
                <p className="text-3xl font-bold mt-1">3</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-blue-100 text-sm">Categories</p>
                <p className="text-3xl font-bold mt-1">7</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
