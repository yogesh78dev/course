import React from 'react';
import { EmailIcon, KeyIcon } from '../icons';

interface LoginViewProps {
    onLogin: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin();
    };
    
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-primary">CourseAdmin Pro</h1>
                    <p className="text-gray-600 mt-2">Welcome back! Please sign in to the admin panel.</p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <EmailIcon className="w-5 h-5 text-gray-400" />
                                </span>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    defaultValue="admin@example.com"
                                    required
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                 <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <KeyIcon className="w-5 h-5 text-gray-400" />
                                </span>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    defaultValue="password"
                                    required
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-primary focus:ring-primary-400 border-gray-300 rounded" />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                    Remember me
                                </label>
                            </div>
                            <div className="text-sm">
                                <a href="#" className="font-medium text-primary hover:text-primary-600">
                                    Forgot your password?
                                </a>
                            </div>
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-primary hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                            >
                                Sign In
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginView;