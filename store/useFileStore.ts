import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export type ProjectFile = {
  id?: string; // Optional because new local files might not have one yet
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
  
  // Actions
  fetchFiles: (projectId: string) => Promise<void>;
  updateFile: (projectId: string, name: string, content: string) => void;
  updateFilePosition: (projectId: string, name: string, x: number, y: number) => void;
  setActiveFile: (name: string) => void;
}

export const useFileStore = create<FileState>((set, get) => ({
  files: [],
  activeFile: null,
  isLoading: false,

  // 1. FETCH: Load files from Supabase on startup
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

    // Map DB format to App format
    const loadedFiles: ProjectFile[] = data.map((f) => ({
      id: f.id,
      name: f.name,
      content: f.content,
      language: f.language,
      position: { x: Number(f.position_x), y: Number(f.position_y) },
      linksTo: f.links_to || []
    }));

    // If empty, set a default page but DON'T save it yet (wait for user action)
    if (loadedFiles.length === 0) {
      set({ 
        files: [{
          name: 'app/page.tsx',
          content: '// Start building...',
          language: 'typescript',
          position: { x: 100, y: 100 }
        }],
        activeFile: 'app/page.tsx',
        isLoading: false 
      });
    } else {
      set({ 
        files: loadedFiles, 
        activeFile: loadedFiles[0].name,
        isLoading: false 
      });
    }
  },

  // 2. UPDATE CONTENT: Save code changes
  updateFile: async (projectId, name, content) => {
    // Optimistic Update (Show changes instantly)
    set((state) => ({
      files: state.files.map((f) => f.name === name ? { ...f, content } : f)
    }));

    // Database Update (Upsert = Update if exists, Insert if new)
    const { error } = await supabase
      .from('files')
      .upsert({ 
        project_id: projectId, 
        name, 
        content,
        updated_at: new Date().toISOString() 
      }, { onConflict: 'project_id, name' });

    if (error) console.error('Failed to save file:', error);
  },

  // 3. UPDATE POSITION: Save Logic Map movement
  updateFilePosition: async (projectId, name, x, y) => {
    // Optimistic Update
    set((state) => ({
      files: state.files.map((f) => 
        f.name === name ? { ...f, position: { x, y } } : f
      )
    }));

    // Database Update
    const { error } = await supabase
      .from('files')
      .upsert({ 
        project_id: projectId, 
        name, 
        position_x: x, 
        position_y: y 
      }, { onConflict: 'project_id, name' });

    if (error) console.error('Failed to save position:', error);
  },

  setActiveFile: (name) => set({ activeFile: name }),
}));
