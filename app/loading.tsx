
export default function Loading() {
    return (
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-neutral-950 to-neutral-950 pointer-events-none" />
            <div className="z-10 flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
                <p className="text-blue-200/80 font-medium animate-pulse">Initializing Agent...</p>
            </div>
        </div>
    );
}
