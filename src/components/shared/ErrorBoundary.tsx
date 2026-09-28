import React from "react";
import { Copy, Check, RotateCw } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  copied: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, copied: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleCopyError = () => {
    const errorText = [
      `URL: ${window.location.href}`,
      `Time: ${new Date().toISOString()}`,
      `Error Message: ${this.state.error?.message || "Unknown error"}`,
      `Stack Trace:`,
      this.state.error?.stack || "No stack trace available",
    ].join("\n\n");

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(errorText);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = errorText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    this.setState({ copied: true });
    setTimeout(() => {
      this.setState({ copied: false });
    }, 2500);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7F7F5] flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none font-sans">
          <div className="max-w-lg w-full p-6 sm:p-8 rounded-2xl bg-white border border-neutral-200 shadow-xl space-y-4">
            <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto text-xl font-bold font-mono">
              !
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-neutral-900">Application Error</h2>
              <p className="text-xs text-neutral-500">
                A component runtime exception occurred. Details below:
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-900 text-left overflow-x-auto text-[11px] font-mono text-emerald-400 max-h-56 whitespace-pre-wrap border border-neutral-800 leading-relaxed shadow-inner">
              <span className="text-rose-400 font-bold block mb-1">
                {this.state.error?.name || "Error"}: {this.state.error?.message || "Unknown error"}
              </span>
              <span className="text-neutral-400 block text-[10px]">
                {this.state.error?.stack}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                onClick={this.handleCopyError}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                  this.state.copied
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 shadow-2xs"
                }`}
              >
                {this.state.copied ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-neutral-600" />
                    Copy Error Details
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <RotateCw className="w-3.5 h-3.5" />
                Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
