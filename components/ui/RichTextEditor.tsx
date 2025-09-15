import React, { useRef, useEffect } from 'react';
import { BoldIcon, ItalicIcon, UnderlineIcon, ListIcon } from '../icons/index';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
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
            className="p-2 rounded hover:bg-gray-200"
        >
            {children}
        </button>
    );

    return (
        <div className="border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-primary-300">
            <div className="flex items-center p-1 border-b border-gray-200 space-x-1 bg-gray-50 rounded-t-lg">
                <ToolbarButton command="bold"><BoldIcon className="w-4 h-4 text-gray-600" /></ToolbarButton>
                <ToolbarButton command="italic"><ItalicIcon className="w-4 h-4 text-gray-600" /></ToolbarButton>
                <ToolbarButton command="underline"><UnderlineIcon className="w-4 h-4 text-gray-600" /></ToolbarButton>
                <ToolbarButton command="insertUnorderedList"><ListIcon className="w-4 h-4 text-gray-600" /></ToolbarButton>
            </div>
            <div
                ref={editorRef}
                onInput={handleInput}
                contentEditable
                className="w-full px-3 py-2 min-h-[120px] focus:outline-none prose max-w-none"
                dangerouslySetInnerHTML={{ __html: value }}
            />
        </div>
    );
};

export default RichTextEditor;