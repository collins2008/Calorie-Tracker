import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMsg: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMsg: ''
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center bg-zinc-950">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 flex items-center justify-center rounded-full mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-zinc-100 mb-2">Something went wrong</h2>
          <p className="text-sm text-zinc-400 mb-6 max-w-sm">
            {this.state.errorMsg || 'An unexpected error occurred in the application.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 py-3 font-medium transition-colors"
          >
            <RefreshCw size={18} />
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
