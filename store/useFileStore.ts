import { create } from 'zustand';

export type ProjectFile = {
  name: string;
  content: string;
  language: string;
  // Metadata for the Logic Map
  position?: { x: number; y: number };
  linksTo?: string[]; // Array of file names this page connects to
};

interface FileState {
  files: ProjectFile[];
  activeFile: string | null;
  updateFile: (name: string, content: string) => void;
  deleteFile: (name: string) => void;
  setActiveFile: (name: string) => void;
  setInitialFiles: (files: ProjectFile[]) => void;
  // NEW: Architect actions
  updateFilePosition: (name: string, x: number, y: number) => void;
  addConnection: (from: string, to: string) => void;
}

export const useFileStore = create<FileState>((set) => ({
  files: [
    {
      name: 'app/page.tsx',
      language: 'typescript',
      content: `export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4">
      <h1 className="text-3xl font-bold text-white">Project Alpha</h1>
      <p className="text-zinc-400">Describe what you want to build in the AI tab!</p>
    </div>
  );
}`,
      position: { x: 50, y: 50 },
      linksTo: []
    }
  ],
  activeFile: 'app/page.tsx',

  updateFile: (name, content) => set((state) => {
    const exists = state.files.find(f => f.name === name);
    if (exists) {
      // Preserve existing metadata (position/links) when updating content
      return {
        files: state.files.map(f => f.name === name ? { ...f, content } : f)
      };
    }
    // Set default meta for new AI-generated files
    return {
      files: [...state.files, { 
        name, 
        content, 
        language: 'typescript',
        position: { x: 100, y: 100 },
        linksTo: []
      }]
    };
  }),

  deleteFile: (name) => set((state) => ({
    files: state.files.filter(f => f.name !== name)
  })),

  setActiveFile: (name) => set({ activeFile: name }),

  setInitialFiles: (files) => set({ files }),

  // Updates the 2D coordinates for a file's node on the Logic Map
  updateFilePosition: (name, x, y) => set((state) => ({
    files: state.files.map(f => f.name === name ? { ...f, position: { x, y } } : f)
  })),

  // Connects one file to another (e.g., Home page has a button to About page)
  addConnection: (from, to) => set((state) => ({
    files: state.files.map(f => f.name === from 
      ? { ...f, linksTo: Array.from(new Set([...(f.linksTo || []), to])) } 
      : f)
  })),
}));
