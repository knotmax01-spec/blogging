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
    <div className="border-2 border-gray-300 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
      {/* Toolbar */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-gray-200 p-3 flex flex-wrap items-center gap-2">
        {formatButtons.map((button, index) => {
          if (button.type === 'separator') {
            return <div key={index} className="w-px h-7 bg-gray-300 mx-1" />;
          }

          const Icon = button.icon;
          return (
            <button
              key={index}
              onClick={button.action}
              title={button.title}
              className="p-2.5 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-all duration-150 flex items-center justify-center text-gray-700 hover:shadow-sm"
              aria-label={button.title}
            >
              <Icon size={18} />
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
        className="w-full h-[400px] p-5 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-inset bg-white"
        placeholder="Start writing your post... Use the toolbar above for formatting or keyboard shortcuts."
        spellCheck="true"
      />

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
            <h3 className="text-2xl font-bold mb-6 text-gray-900 flex items-center space-x-2">
              <span>🔗</span>
              <span>Insert Link</span>
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Link Text
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 font-medium transition"
                  placeholder="Enter link text"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  URL
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 font-medium transition"
                  placeholder="https://example.com"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowLinkDialog(false);
                    setLinkText('');
                    setLinkUrl('');
                  }}
                  className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={insertLink}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                >
                  Insert Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-t-2 border-gray-200 p-4 text-xs text-gray-700">
        <details className="cursor-pointer">
          <summary className="font-bold text-gray-800 hover:text-blue-600 transition flex items-center space-x-2">
            <span>⌨️ Keyboard Shortcuts</span>
          </summary>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2"><kbd className="bg-white border border-gray-300 px-2 py-1 rounded font-mono text-xs font-semibold">Ctrl+B</kbd> <span>Bold</span></div>
            <div className="flex items-center space-x-2"><kbd className="bg-white border border-gray-300 px-2 py-1 rounded font-mono text-xs font-semibold">Ctrl+I</kbd> <span>Italic</span></div>
            <div className="flex items-center space-x-2"><kbd className="bg-white border border-gray-300 px-2 py-1 rounded font-mono text-xs font-semibold">Ctrl+U</kbd> <span>Underline</span></div>
            <div className="flex items-center space-x-2"><kbd className="bg-white border border-gray-300 px-2 py-1 rounded font-mono text-xs font-semibold">Ctrl+K</kbd> <span>Link</span></div>
            <div className="flex items-center space-x-2"><kbd className="bg-white border border-gray-300 px-2 py-1 rounded font-mono text-xs font-semibold">Ctrl+1</kbd> <span>Heading 1</span></div>
            <div className="flex items-center space-x-2"><kbd className="bg-white border border-gray-300 px-2 py-1 rounded font-mono text-xs font-semibold">Ctrl+2</kbd> <span>Heading 2</span></div>
            <div className="flex items-center space-x-2"><kbd className="bg-white border border-gray-300 px-2 py-1 rounded font-mono text-xs font-semibold">Tab</kbd> <span>Indent</span></div>
            <div className="flex items-center space-x-2"><kbd className="bg-white border border-gray-300 px-2 py-1 rounded font-mono text-xs font-semibold">Shift+Tab</kbd> <span>Unindent</span></div>
          </div>
        </details>
      </div>
    </div>
  );
}

export default RichTextEditor;
