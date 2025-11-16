import { useState, useRef } from 'react';
import { Bold, Italic, Underline, Link, List, ListOrdered, Quote, Code, Heading1, Heading2, Heading3, Image, Strikethrough, ChevronLeft as AlignLeft, TextAlignCenter as AlignCenter, Highlighter as AlignRight, Undo, Redo } from 'lucide-react';

function RichTextEditor({ content, onChange }) {
  const textareaRef = useRef(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const insertText = (before, after = '', placeholder = '') => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    const newContent = 
      content.substring(0, start) + 
      before + textToInsert + after + 
      content.substring(end);
    
    onChange(newContent);
    
    // Set cursor position after insertion
    setTimeout(() => {
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const insertAtNewLine = (text) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const beforeCursor = content.substring(0, start);
    const afterCursor = content.substring(start);
    
    // Check if we're at the beginning of a line
    const lastNewlineIndex = beforeCursor.lastIndexOf('\n');
    const isAtLineStart = lastNewlineIndex === start - 1 || start === 0;
    
    const prefix = isAtLineStart ? '' : '\n';
    const suffix = afterCursor.startsWith('\n') ? '' : '\n';
    
    const newContent = beforeCursor + prefix + text + suffix + afterCursor;
    onChange(newContent);
    
    setTimeout(() => {
      const newCursorPos = start + prefix.length + text.length + suffix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const handleBold = () => insertText('**', '**', 'bold text');
  const handleItalic = () => insertText('*', '*', 'italic text');
  const handleUnderline = () => insertText('<u>', '</u>', 'underlined text');
  const handleStrikethrough = () => insertText('~~', '~~', 'strikethrough text');
  const handleCode = () => insertText('`', '`', 'code');
  const handleH1 = () => insertAtNewLine('# Heading 1');
  const handleH2 = () => insertAtNewLine('## Heading 2');
  const handleH3 = () => insertAtNewLine('### Heading 3');
  const handleQuote = () => insertAtNewLine('> Quote text');
  const handleUnorderedList = () => insertAtNewLine('- List item');
  const handleOrderedList = () => insertAtNewLine('1. List item');

  const handleLink = () => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    if (selectedText) {
      setLinkText(selectedText);
    }
    setShowLinkDialog(true);
  };

  const insertLink = () => {
    if (linkUrl) {
      const linkMarkdown = `[${linkText || 'link text'}](${linkUrl})`;
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const newContent = 
        content.substring(0, start) + 
        linkMarkdown + 
        content.substring(end);
      
      onChange(newContent);
      
      setTimeout(() => {
        const newCursorPos = start + linkMarkdown.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 0);
    }
    
    setShowLinkDialog(false);
    setLinkText('');
    setLinkUrl('');
  };

  const handleImage = () => {
    const url = prompt('Enter image URL:');
    const alt = prompt('Enter image alt text (optional):') || 'image';
    if (url) {
      insertText(`![${alt}](${url})`);
    }
  };

  const formatButtons = [
    { icon: Bold, action: handleBold, title: 'Bold (Ctrl+B)', shortcut: 'Ctrl+B' },
    { icon: Italic, action: handleItalic, title: 'Italic (Ctrl+I)', shortcut: 'Ctrl+I' },
    { icon: Underline, action: handleUnderline, title: 'Underline', shortcut: 'Ctrl+U' },
    { icon: Strikethrough, action: handleStrikethrough, title: 'Strikethrough', shortcut: null },
    { type: 'separator' },
    { icon: Heading1, action: handleH1, title: 'Heading 1', shortcut: 'Ctrl+1' },
    { icon: Heading2, action: handleH2, title: 'Heading 2', shortcut: 'Ctrl+2' },
    { icon: Heading3, action: handleH3, title: 'Heading 3', shortcut: 'Ctrl+3' },
    { type: 'separator' },
    { icon: Link, action: handleLink, title: 'Insert Link', shortcut: 'Ctrl+K' },
    { icon: Image, action: handleImage, title: 'Insert Image', shortcut: null },
    { type: 'separator' },
    { icon: List, action: handleUnorderedList, title: 'Bullet List', shortcut: null },
    { icon: ListOrdered, action: handleOrderedList, title: 'Numbered List', shortcut: null },
    { icon: Quote, action: handleQuote, title: 'Quote', shortcut: null },
    { icon: Code, action: handleCode, title: 'Inline Code', shortcut: 'Ctrl+`' },
  ];

  const handleKeyDown = (e) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          handleBold();
          break;
        case 'i':
          e.preventDefault();
          handleItalic();
          break;
        case 'u':
          e.preventDefault();
          handleUnderline();
          break;
        case 'k':
          e.preventDefault();
          handleLink();
          break;
        case '1':
          e.preventDefault();
          handleH1();
          break;
        case '2':
          e.preventDefault();
          handleH2();
          break;
        case '3':
          e.preventDefault();
          handleH3();
          break;
        case '`':
          e.preventDefault();
          handleCode();
          break;
      }
    }

    // Handle tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      if (e.shiftKey) {
        // Remove indentation
        const beforeCursor = content.substring(0, start);
        const lineStart = beforeCursor.lastIndexOf('\n') + 1;
        const line = content.substring(lineStart, end);
        
        if (line.startsWith('  ')) {
          const newContent = 
            content.substring(0, lineStart) + 
            line.substring(2) + 
            content.substring(end);
          onChange(newContent);
          
          setTimeout(() => {
            textarea.setSelectionRange(start - 2, end - 2);
          }, 0);
        }
      } else {
        // Add indentation
        const newContent = 
          content.substring(0, start) + 
          '  ' + 
          content.substring(start);
        onChange(newContent);
        
        setTimeout(() => {
          textarea.setSelectionRange(start + 2, end + 2);
        }, 0);
      }
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b p-2 flex flex-wrap items-center gap-1">
        {formatButtons.map((button, index) => {
          if (button.type === 'separator') {
            return <div key={index} className="w-px h-6 bg-gray-300 mx-1" />;
          }
          
          const Icon = button.icon;
          return (
            <button
              key={index}
              onClick={button.action}
              title={button.title}
              className="p-2 rounded hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <Icon size={16} />
            </button>
          );
        })}
      </div>

      {/* Text Area */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full h-[400px] p-4 font-mono text-sm resize-none focus:outline-none"
        placeholder="Start writing your post... Use the toolbar above for formatting or keyboard shortcuts."
      />

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">Insert Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Text
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter link text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="https://example.com"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowLinkDialog(false);
                    setLinkText('');
                    setLinkUrl('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={insertLink}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Insert Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="bg-gray-50 border-t p-2 text-xs text-gray-600">
        <details>
          <summary className="cursor-pointer hover:text-gray-800">Keyboard Shortcuts</summary>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div><kbd className="bg-gray-200 px-1 rounded">Ctrl+B</kbd> Bold</div>
            <div><kbd className="bg-gray-200 px-1 rounded">Ctrl+I</kbd> Italic</div>
            <div><kbd className="bg-gray-200 px-1 rounded">Ctrl+U</kbd> Underline</div>
            <div><kbd className="bg-gray-200 px-1 rounded">Ctrl+K</kbd> Link</div>
            <div><kbd className="bg-gray-200 px-1 rounded">Ctrl+1</kbd> Heading 1</div>
            <div><kbd className="bg-gray-200 px-1 rounded">Ctrl+2</kbd> Heading 2</div>
            <div><kbd className="bg-gray-200 px-1 rounded">Tab</kbd> Indent</div>
            <div><kbd className="bg-gray-200 px-1 rounded">Shift+Tab</kbd> Unindent</div>
          </div>
        </details>
      </div>
    </div>
  );
}

export default RichTextEditor;