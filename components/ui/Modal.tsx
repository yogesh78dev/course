import React from 'react';
// FIX: Corrected the import path for icons from '../icons' to '../icons/index' to resolve module loading error.
import { CloseIcon } from '../icons/index';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = '2xl' }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        'md': 'max-w-md',
        'lg': 'max-w-lg',
        'xl': 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col`}>
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;