
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { VideoIcon, PlusIcon, DeleteIcon, KeyIcon } from '../../components/icons/index';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import Tooltip from '../../components/ui/Tooltip';

const Vimeo: React.FC = () => {
    const { vimeoAccounts, vimeoVideos, addVimeoAccount, removeVimeoAccount, syncVimeoVideos } = useAppContext();
    const [isAddMode, setIsAddMode] = useState(false);
    const [newAccount, setNewAccount] = useState({ name: '', apiKey: '' });
    const [accountToDelete, setAccountToDelete] = useState<number | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    // Check if we are seeing dummy data (testing purpose)
    const isTestingData = vimeoAccounts.some(acc => acc.id === 999);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        await addVimeoAccount(newAccount.name, newAccount.apiKey);
        setNewAccount({ name: '', apiKey: '' });
        setIsAddMode(false);
    };

    const handleSync = async () => {
        if (isSyncing) return;
        setIsSyncing(true);
        try {
            await syncVimeoVideos();
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold text-gray-800">Vimeo Integration</h2>
                    {isTestingData && (
                        <span className="bg-amber-100 text-amber-700 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border border-amber-200 shadow-sm">
                            Test Data Mode
                        </span>
                    )}
                </div>
                <div className="flex space-x-3">
                    <button 
                        onClick={handleSync} 
                        disabled={isSyncing || vimeoAccounts.length === 0}
                        className="flex items-center bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className={`w-5 h-5 mr-2 ${isSyncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
                        {isSyncing ? 'Syncing...' : 'Sync Videos'}
                    </button>
                    <button onClick={() => setIsAddMode(true)} className="flex items-center bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-all shadow-md active:scale-95">
                        <PlusIcon className="w-5 h-5 mr-2"/>
                        Connect Account
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Accounts List */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-lg font-bold text-gray-700">Connected Accounts</h3>
                    {isAddMode && (
                        <div className="bg-white p-4 rounded-xl border-2 border-primary shadow-lg animate-in slide-in-from-top-2">
                            <form onSubmit={handleAdd} className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Account Label</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="e.g. Main Production" 
                                        value={newAccount.name}
                                        onChange={e => setNewAccount(prev => ({...prev, name: e.target.value}))}
                                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-300 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Personal Access Token</label>
                                    <input 
                                        type="password" 
                                        required 
                                        placeholder="Paste Vimeo API Key" 
                                        value={newAccount.apiKey}
                                        onChange={e => setNewAccount(prev => ({...prev, apiKey: e.target.value}))}
                                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-300 transition-all"
                                    />
                                </div>
                                <div className="flex space-x-2 pt-2">
                                    <button type="submit" className="flex-1 bg-primary text-white text-sm font-bold py-2 rounded-lg hover:bg-primary-700 shadow-md">Add Account</button>
                                    <button type="button" onClick={() => setIsAddMode(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}
                    
                    <div className="space-y-3">
                        {vimeoAccounts.map(acc => (
                            <div key={acc.id} className={`bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between group transition-all hover:border-primary-200 ${acc.id === 999 ? 'border-dashed' : ''}`}>
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-lg ${acc.id === 999 ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                                        <KeyIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 leading-none">{acc.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">{acc.api_key_identifier}</p>
                                    </div>
                                </div>
                                {acc.id !== 999 && (
                                    <button onClick={() => setAccountToDelete(acc.id)} className="p-2 text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all">
                                        <DeleteIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                        {vimeoAccounts.length === 0 && !isAddMode && (
                            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                                <KeyIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-400 font-medium">No accounts connected yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Videos List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-700">Video Library ({vimeoVideos.length})</h3>
                        <div className="relative group">
                            <input 
                                type="text" 
                                placeholder="Search synced videos..." 
                                className="text-sm border border-gray-300 rounded-lg pl-9 pr-3 py-1.5 focus:ring-2 focus:ring-primary-300 transition-all w-full sm:w-64" 
                            />
                            <svg className="absolute left-3 top-2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {vimeoVideos.map(vid => (
                            <div key={vid.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group border-opacity-60 hover:border-primary-100">
                                <div className="aspect-video relative bg-gray-900 overflow-hidden">
                                    {vid.thumbnail_url ? (
                                        <img src={vid.thumbnail_url} alt={vid.title} className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                                            <VideoIcon className="w-12 h-12 text-gray-700" />
                                        </div>
                                    )}
                                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-md border border-white border-opacity-10">
                                        {Math.floor(vid.duration / 60)}:{String(vid.duration % 60).padStart(2, '0')}
                                    </div>
                                    <a href={vid.link} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black bg-opacity-30 backdrop-blur-[2px]">
                                        <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-all duration-300 ring-4 ring-white ring-opacity-20">
                                            <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
                                        </div>
                                    </a>
                                </div>
                                <div className="p-4">
                                    <p className="font-bold text-gray-900 text-sm truncate" title={vid.title}>{vid.title}</p>
                                    <p className="text-[11px] text-gray-500 mt-1 line-clamp-1 h-4">{vid.description || 'No description available.'}</p>
                                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-50">
                                        <span className="text-[9px] text-gray-400 font-mono tracking-tighter bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{vid.video_id}</span>
                                        <span className="text-[10px] text-gray-400 font-medium">{new Date(vid.upload_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {vimeoVideos.length === 0 && (
                            <div className="col-span-full py-24 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl">
                                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                                    <VideoIcon className="w-10 h-10 text-gray-200" />
                                </div>
                                <p className="text-gray-600 font-bold text-lg">No Videos Synced</p>
                                <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto">Connect your Vimeo account and click the "Sync Videos" button to import your course content.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmationModal 
                isOpen={accountToDelete !== null}
                onClose={() => setAccountToDelete(null)}
                onConfirm={() => {
                    if (accountToDelete) removeVimeoAccount(accountToDelete);
                    setAccountToDelete(null);
                }}
                title="Disconnect Account"
                message="Are you sure you want to disconnect this Vimeo account? This will not delete any videos already synced, but you won't be able to sync new content from this account."
                confirmText="Disconnect"
            />
        </div>
    );
};

export default Vimeo;
