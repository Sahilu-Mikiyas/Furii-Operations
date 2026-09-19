import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7F7F5] flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="max-w-md w-full p-8 rounded-2xl bg-white border border-neutral-200 shadow-xl space-y-4">
            <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto text-xl font-bold font-mono">
              !
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-neutral-900">Application Error</h2>
              <p className="text-xs text-neutral-500">
                A component runtime exception occurred. Details below:
              </p>
            </div>
            <div className="p-3 rounded-lg bg-neutral-100 text-left overflow-x-auto text-[11px] font-mono text-neutral-800 max-h-48 whitespace-pre-wrap border border-neutral-200">
              {this.state.error?.message || "Unknown error"}
              {"\n"}
              {this.state.error?.stack}
            </div>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
