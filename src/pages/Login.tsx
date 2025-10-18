import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, Shield, Users, Activity } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    await login({ email: 'dev@bluequee2.com', password: 'dev' });
    navigate('/Dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              Bluequee2
            </CardTitle>
            <p className="text-gray-600 text-sm">
              Clinical Workspace Management System
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                Sign in to access your clinical workspace
              </p>
            </div>

            <Button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Shield className="w-5 h-5 mr-2" />
              Sign In
            </Button>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-blue-700 font-medium">Patient Management</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <Activity className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-xs text-green-700 font-medium">Clinical Workflow</p>
              </div>
            </div>

            <div className="text-center pt-4">
              <p className="text-xs text-gray-500">
                Secure clinical workspace management
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}