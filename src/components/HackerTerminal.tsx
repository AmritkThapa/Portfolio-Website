import { useState, useRef, useEffect } from 'react';

type FileNode = { type: 'file', content: string };
type DirNode = { type: 'dir', children: Record<string, VFSNode> };
type VFSNode = FileNode | DirNode;

const VFS: DirNode = {
  type: 'dir',
  children: {
    'home': {
      type: 'dir',
      children: {
        'guest': {
          type: 'dir',
          children: {
            'resume.txt': { type: 'file', content: 'CLASSIFIED DOSSIER - AMRIT\nRole: Full-Stack Developer\nSkills: React, Astro, Node.js\nStatus: Looking for new quests.' },
            'hints.md': { type: 'file', content: 'Tip: You can read files with the "cat" command. Try looking in the /etc directory for more files.' },
            'projects': {
              type: 'dir',
              children: {
                'arcadia.md': { type: 'file', content: '# Arcadia Core\nA simulated environment for learning and fun.' }
              }
            }
          }
        }
      }
    },
    'etc': {
      type: 'dir',
      children: {
        'hostname': { type: 'file', content: 'arcadia-terminal' },
        'passwords.txt': { type: 'file', content: 'admin: hunter2\nguest: guest' }
      }
    }
  }
};

export default function HackerTerminal() {
  const [history, setHistory] = useState<string[]>([
    'Welcome to ARCADIA OS v1.0.0',
    'Type "help" for a list of available commands.',
    ''
  ]);
  const [input, setInput] = useState('');
  const [cwd, setCwd] = useState<string[]>(['home', 'guest']);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const getDir = (pathArray: string[]): DirNode | null => {
    let current: VFSNode = VFS;
    for (const part of pathArray) {
      if (current.type !== 'dir' || !current.children[part]) return null;
      current = current.children[part];
    }
    return current.type === 'dir' ? current : null;
  };

  const getFile = (pathArray: string[]): FileNode | null => {
    if (pathArray.length === 0) return null;
    const parentDir = getDir(pathArray.slice(0, -1));
    if (!parentDir) return null;
    const fileName = pathArray[pathArray.length - 1];
    const node = parentDir.children[fileName];
    return node && node.type === 'file' ? node : null;
  };

  const resolvePath = (pathStr: string): string[] => {
    if (pathStr === '/') return [];
    const parts = pathStr.startsWith('/') ? pathStr.split('/').filter(Boolean) : [...cwd, ...pathStr.split('/').filter(Boolean)];
    const resolved: string[] = [];
    for (const part of parts) {
      if (part === '..') {
         resolved.pop();
       } else if (part !== '.') {
         resolved.push(part);
       }
    }
    return resolved;
  };

  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input) {
      const args = input.trim().split(/\s+/);
      const cmd = args[0].toLowerCase();
      let response: string | string[] = '';
      
      const promptStr = `guest@arcadia:/${cwd.join('/')}$`;
      const promptLine = `${promptStr} ${input}`;

      try {
        if (cmd === 'help') {
          response = [
            'Available commands:',
            '  ls [dir]     - List directory contents',
            '  cd [dir]     - Change working directory',
            '  cat [file]   - Read file contents',
            '  pwd          - Print working directory',
            '  whoami       - Print current user',
            '  echo [text]  - Print text to terminal',
            '  clear        - Clear terminal output',
            '  home         - Return to Main Portfolio',
            '  arcadia      - Return to Arcadia HUB'
          ];
        } else if (cmd === 'pwd') {
          response = `/${cwd.join('/')}`;
        } else if (cmd === 'whoami') {
          response = 'guest';
        } else if (cmd === 'echo') {
          response = args.slice(1).join(' ');
        } else if (cmd === 'ls') {
          const targetPath = args[1] ? resolvePath(args[1]) : cwd;
          const dir = getDir(targetPath);
          if (dir) {
            response = Object.keys(dir.children).map(k => dir.children[k].type === 'dir' ? `${k}/` : k).join('  ');
          } else {
            response = `ls: cannot access '${args[1]}': No such file or directory`;
          }
        } else if (cmd === 'cd') {
          if (!args[1]) {
            setCwd(['home', 'guest']);
          } else {
            const targetPath = resolvePath(args[1]);
            const dir = getDir(targetPath);
            if (dir) {
              setCwd(targetPath);
            } else {
              response = `cd: ${args[1]}: No such file or directory`;
            }
          }
        } else if (cmd === 'cat') {
          if (!args[1]) {
            response = 'cat: missing operand';
          } else {
            const targetPath = resolvePath(args[1]);
            const file = getFile(targetPath);
            if (file) {
              response = file.content;
            } else {
              const dir = getDir(targetPath);
              if (dir) response = `cat: ${args[1]}: Is a directory`;
              else response = `cat: ${args[1]}: No such file or directory`;
            }
          }
        } else if (cmd === 'clear') {
          setHistory([]);
          setInput('');
          return;
        } else if (cmd === 'home') {
          window.location.href = '/';
          return;
        } else if (cmd === 'arcadia') {
          window.location.href = '/arcadia';
          return;
        } else if (cmd === '') {
          response = '';
        } else {
          response = `${cmd}: command not found`;
        }
      } catch (err) {
        response = `Error processing command.`;
      }

      setHistory((prev) => {
        const newHistory = [...prev, promptLine];
        if (Array.isArray(response)) {
          return [...newHistory, ...response];
        } else if (response) {
          return [...newHistory, ...response.split('\n')];
        }
        return newHistory;
      });
      setInput('');
    }
  };

  return (
    <div 
      className="flex flex-col w-full h-full bg-zinc-950 font-mono text-emerald-400 p-4 text-sm overflow-hidden rounded-xl border border-zinc-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex-1 overflow-y-auto flex flex-col justify-start space-y-1 mb-4 custom-scrollbar whitespace-pre-wrap">
        {history.map((line, i) => {
          const isPrompt = line.startsWith('guest@arcadia:');
          return (
            <div key={i} className={isPrompt ? "text-cyan-300 font-bold" : "text-emerald-400 break-words"}>
              {line}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center gap-2 pt-2 shrink-0">
        <span className="text-cyan-300 font-bold shrink-0">guest@arcadia:/{cwd.join('/')}$</span>
        <input 
          ref={inputRef}
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleCommand}
          className="bg-transparent outline-none flex-1 text-emerald-300 w-full"
          spellCheck={false}
          autoFocus={true}
        />
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.8);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.4);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.6);
        }
      `}</style>
    </div>
  );
}
