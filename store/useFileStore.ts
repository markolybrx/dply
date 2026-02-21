import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export type ProjectFile = {
  id?: string;
  name: string;
  content: string;
  language: string;
  position?: { x: number; y: number };
  linksTo?: string[];
};

interface FileState {
  files: ProjectFile[];
  activeFile: string | null;
  isLoading: boolean;
  isCompiling: boolean;
  fetchFiles: (projectId: string) => Promise<void>;
  updateFile: (projectId: string, name: string, content: string) => void;
  updateFilePosition: (projectId: string, name: string, x: number, y: number) => void;
  setActiveFile: (name: string) => void;
}

export const useFileStore = create<FileState>((set, get) => ({
  files: [],
  activeFile: null,
  isLoading: false,
  isCompiling: false,

  fetchFiles: async (projectId) => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('project_id', projectId);

    if (error) {
      console.error('Error loading files:', error);
      set({ isLoading: false });
      return;
    }

    const loadedFiles: ProjectFile[] = data.map((f) => ({
      id: f.id,
      name: f.name,
      content: f.content,
      language: f.language,
      position: { x: Number(f.position_x), y: Number(f.position_y) },
      linksTo: f.links_to || []
    }));

    if (loadedFiles.length === 0) {
      const defaultFile = {
        name: 'app/page.tsx',
        content: '// Start building...',
        language: 'typescript',
        position: { x: 100, y: 100 }
      };
      set({ files: [defaultFile], activeFile: defaultFile.name, isLoading: false });
    } else {
      set({ files: loadedFiles, activeFile: loadedFiles[0].name, isLoading: false });
    }
  },

  updateFile: async (projectId, name, content) => {
    set({ isCompiling: true });
    
    const currentState = get();
    const fileExists = currentState.files.some((f) => f.name === name);

    // 1. UPDATE STATE (Handle both Edit and Create)
    if (fileExists) {
      set((state) => ({
        files: state.files.map((f) => f.name === name ? { ...f, content } : f),
        // Force preview to refresh if the updated file is the active one
        activeFile: name 
      }));
    } else {
      // Create new file locally if AI introduces a new one
      const newFile: ProjectFile = {
        name,
        content,
        language: name.endsWith('.ts') || name.endsWith('.tsx') ? 'typescript' : 'css',
        position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 }
      };
      set((state) => ({
        files: [...state.files, newFile],
        activeFile: name
      }));
    }

    // 2. DATABASE PERSISTENCE
    const { error } = await supabase
      .from('files')
      .upsert({ 
        project_id: projectId, 
        name, 
        content,
        language: name.endsWith('.tsx') ? 'typescript' : 'css',
        updated_at: new Date().toISOString() 
      }, { onConflict: 'project_id, name' });

    if (error) console.error('Database Save Error:', error);

    // 3. REMOVE COMPILING STATE
    // 800ms delay ensures Sandpack has time to process the local state update
    setTimeout(() => {
      set({ isCompiling: false });
    }, 800);
  },

  updateFilePosition: async (projectId, name, x, y) => {
    set((state) => ({
      files: state.files.map((f) => f.name === name ? { ...f, position: { x, y } } : f)
    }));

    const { error } = await supabase
      .from('files')
      .upsert({ 
        project_id: projectId, 
        name, 
        position_x: x, 
        position_y: y 
      }, { onConflict: 'project_id, name' });

    if (error) console.error('Position Save Error:', error);
  },

  setActiveFile: (name) => set({ activeFile: name }),
}));
