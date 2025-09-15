import React, { useState, useRef, DragEvent, ChangeEvent, useEffect } from 'react';
import { UploadIcon, DeleteIcon } from '../icons/index';

interface ImageUploadProps {
    label: string;
    currentImageUrl: string;
    onFileChange: (dataUrl: string) => void;
    aspectRatio?: string; // e.g., '16/9'
}

const ImageUpload: React.FC<ImageUploadProps> = ({ label, currentImageUrl, onFileChange, aspectRatio = '16/9' }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setPreviewUrl(currentImageUrl);
    }, [currentImageUrl]);

    const handleFileSelect = (file: File | null) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                setPreviewUrl(dataUrl);
                onFileChange(dataUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        handleFileSelect(e.target.files ? e.target.files[0] : null);
    };

    const onDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files ? e.dataTransfer.files[0] : null);
    };

    const onDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };
    
    const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const onRemoveImage = () => {
        setPreviewUrl(null);
        onFileChange('');
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div
                className={`
                    relative w-full border-2 border-dashed rounded-lg p-2 transition-colors duration-200
                    ${isDragging ? 'border-primary bg-primary-50' : 'border-gray-300'}
                `}
                style={{ aspectRatio }}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
            >
                {previewUrl ? (
                    <>
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-md" />
                         <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 flex items-center justify-center transition-opacity duration-300 opacity-0 hover:opacity-100 rounded-md">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-white text-gray-800 text-sm font-semibold py-1 px-3 rounded-md shadow-md hover:bg-gray-100"
                            >
                                Change
                            </button>
                             <button
                                type="button"
                                onClick={onRemoveImage}
                                className="ml-2 p-2 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700"
                                aria-label="Remove image"
                            >
                                <DeleteIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </>
                ) : (
                    <div
                        className="w-full h-full flex flex-col items-center justify-center text-center text-gray-500 cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <UploadIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="font-semibold">Click to upload or drag & drop</p>
                        <p className="text-xs">PNG, JPG, GIF up to 10MB</p>
                    </div>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onFileInputChange}
                    className="hidden"
                    accept="image/png, image/jpeg, image/gif"
                />
            </div>
        </div>
    );
};

export default ImageUpload;