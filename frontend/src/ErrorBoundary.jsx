import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught an error", error, info);
  }

  render() {
    if (this.state.hasError) {
      const errorText = this.state.error ? String(this.state.error) : null;
      const stackText =
        this.state.error && this.state.error.stack
          ? this.state.error.stack
          : null;
      return (
        <div className="p-4 text-center text-red-600">
          Something went wrong while rendering this page.
          {errorText && (
            <pre className="mt-2 text-xs text-red-100 bg-red-800 p-2 rounded">
              {errorText}
            </pre>
          )}
          {stackText && (
            <pre
              className="mt-2 text-xs text-white bg-red-700 p-2 rounded"
              style={{ whiteSpace: "pre-wrap" }}
            >
              {stackText}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
