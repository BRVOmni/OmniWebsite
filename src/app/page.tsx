export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-6 p-8">
        <div className="flex items-center justify-center mb-4">
          <img
            src="/logo.png"
            alt="Grupo Omniprise"
            className="w-24 h-24 object-contain"
          />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Grupo Omniprise
          </h1>
          <p className="text-lg text-slate-600">
            Multi-Brand Food Service Chain Management Platform
          </p>
        </div>

        <div className="flex items-center gap-4 justify-center pt-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium text-slate-700">Project Initialized</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-slate-200">
            <span className="text-sm text-slate-600">Version 0.1.0</span>
          </div>
        </div>

        <div className="pt-8 space-y-4">
          <p className="text-sm text-slate-500">
            Next steps: Install dependencies and start development
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <code className="px-4 py-2 bg-slate-900 text-slate-100 rounded-lg text-sm font-mono">
              npm install
            </code>
            <code className="px-4 py-2 bg-slate-900 text-slate-100 rounded-lg text-sm font-mono">
              npm run dev
            </code>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200">
          <p className="text-xs text-slate-400">
            🍽️ Premium corporate dashboard for expanding food chains
          </p>
        </div>
      </div>
    </div>
  );
}
