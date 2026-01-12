
import React, { useRef, useEffect } from 'react';
import { BoldIcon, ItalicIcon, UnderlineIcon, ListIcon } from '../icons/index';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const lastValueRef = useRef(value);

    // Only update innerHTML when the value prop changes from the OUTSIDE
    useEffect(() => {
        if (editorRef.current && value !== lastValueRef.current) {
            editorRef.current.innerHTML = value || '';
            lastValueRef.current = value;
        }
    }, [value]);

    const handleInput = () => {
        if (editorRef.current) {
            const newValue = editorRef.current.innerHTML;
            lastValueRef.current = newValue;
            onChange(newValue);
        }
    };

    const execCmd = (command: string) => {
        document.execCommand(command, false);
        editorRef.current?.focus();
    };

    const ToolbarButton = ({ command, children }: { command: string, children: React.ReactNode }) => (
        <button
            type="button"
            onMouseDown={(e) => e.preventDefault()} // Prevent editor from losing focus
            onClick={() => execCmd(command)}
            className="p-2 rounded hover:bg-gray-200 transition-colors"
        >
            {children}
        </button>
    );

    return (
        <div className="border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-primary-300 bg-white">
            <div className="flex items-center p-1 border-b border-gray-200 space-x-1 bg-gray-50 rounded-t-lg">
                <ToolbarButton command="bold"><BoldIcon className="w-4 h-4 text-gray-600" /></ToolbarButton>
                <ToolbarButton command="italic"><ItalicIcon className="w-4 h-4 text-gray-600" /></ToolbarButton>
                <ToolbarButton command="underline"><UnderlineIcon className="w-4 h-4 text-gray-600" /></ToolbarButton>
                <ToolbarButton command="insertUnorderedList"><ListIcon className="w-4 h-4 text-gray-600" /></ToolbarButton>
            </div>
            {/* FIX: Changed invalid 'placeholder' attribute to 'data-placeholder' on a div element, which does not support placeholder in TypeScript. */}
            <div
                ref={editorRef}
                onInput={handleInput}
                contentEditable
                className="w-full px-3 py-3 min-h-[150px] focus:outline-none prose prose-sm max-w-none text-gray-800"
                data-placeholder="Enter description here..."
            />
        </div>
    );
};

export default RichTextEditor;
