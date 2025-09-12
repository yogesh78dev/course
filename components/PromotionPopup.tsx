
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { CloseIcon } from './icons';

const PromotionPopup: React.FC = () => {
    const { promotion, setPromotion } = useAppContext();

    const handleClose = () => {
        setPromotion(prev => ({...prev, show: false}));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 opacity-100">
                <div className="p-8 text-center relative">
                    <button onClick={handleClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                        <CloseIcon className="w-6 h-6"/>
                    </button>
                    <div className="text-5xl mb-4">🎉</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{promotion.title}</h2>
                    <p className="text-gray-600 mb-6">{promotion.description}</p>
                    <div className="flex flex-col space-y-3">
                         <button className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary-700 transition-transform transform hover:scale-105">
                            Claim Offer
                        </button>
                         <button onClick={handleClose} className="w-full text-gray-500 font-medium py-2 rounded-lg hover:bg-gray-100">
                            Maybe later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromotionPopup;
