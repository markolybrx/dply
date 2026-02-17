export default function ProjectPage({ params }: { params: { projectId: string } }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-zinc-500">
      <p className="text-xs tracking-widest uppercase mb-2">Project ID</p>
      <h1 className="text-2xl font-bold text-white">{params.projectId}</h1>
      <p className="mt-4 text-sm">Waiting for AI input...</p>
    </div>
  );
}
