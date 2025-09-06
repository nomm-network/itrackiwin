import React from "react";

type State = { hasError: boolean; message?: string; stack?: string };

export class AdminErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: any): State {
    return { 
      hasError: true, 
      message: error?.message ?? "Unknown error",
      stack: error?.stack
    };
  }

  componentDidCatch(error: any, info: any) {
    // Optional: send to telemetry
    console.error("[ADMIN] Uncaught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-12">
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Admin crashed</h2>
            <p className="text-red-700 mb-4">{this.state.message}</p>
            <details className="mb-4">
              <summary className="cursor-pointer text-red-600 hover:text-red-700">Technical details</summary>
              <pre className="text-sm bg-red-50 p-4 rounded mt-2 whitespace-pre-wrap overflow-auto">
                {this.state.stack}
              </pre>
            </details>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}