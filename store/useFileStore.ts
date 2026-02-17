import { create } from 'zustand';

export type ProjectFile = {
  name: string;
  content: string;
  language: string;
};

interface FileState {
  files: ProjectFile[];
  activeFile: string | null;
  updateFile: (name: string, content: string) => void;
  deleteFile: (name: string) => void;
  setActiveFile: (name: string) => void;
  setInitialFiles: (files: ProjectFile[]) => void;
}

export const useFileStore = create<FileState>((set) => ({
  // We start with a default page.tsx so the "View" isn't empty
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
}`
    }
  ],
  activeFile: 'app/page.tsx',
  
  updateFile: (name, content) => set((state) => {
    const exists = state.files.find(f => f.name === name);
    if (exists) {
      return {
        files: state.files.map(f => f.name === name ? { ...f, content } : f)
      };
    }
    return {
      files: [...state.files, { name, content, language: 'typescript' }]
    };
  }),

  deleteFile: (name) => set((state) => ({
    files: state.files.filter(f => f.name !== name)
  })),

  setActiveFile: (name) => set({ activeFile: name }),
  
  setInitialFiles: (files) => set({ files })
}));
