import React from "react";

type State = { hasError: boolean; message?: string };

export class SimpleErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };
  
  static getDerivedStateFromError(error: any): State {
    return { hasError: true, message: error?.message ?? "Unknown error" };
  }
  
  componentDidCatch(error: any, info: any) {
    // Log to console for debugging
    console.error("Component crashed:", error, info);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-12">
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Something went wrong</h2>
            <pre className="text-sm bg-red-50 p-4 rounded text-left whitespace-pre-wrap">
              {this.state.message}
            </pre>
            <div className="mt-4">
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}