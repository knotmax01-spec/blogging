import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Log to error tracking service in production
    if (process.env.NODE_ENV === 'production' && window.__reportError) {
      window.__reportError({ error, errorInfo, timestamp: new Date().toISOString() });
    } else if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full border-l-4 border-red-600">
            <h1 className="text-2xl font-bold text-red-600 mb-2">⚠️ Oops! Something went wrong</h1>
            <p className="text-gray-700 mb-4">
              An unexpected error occurred. We've logged the details to help us improve.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 bg-gray-100 p-3 rounded text-sm font-mono text-red-700 overflow-auto max-h-48">
                <summary className="cursor-pointer font-bold mb-2">Error Details (Dev Only)</summary>
                <pre className="whitespace-pre-wrap break-words">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold transition"
                aria-label="Try again after error"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-semibold transition"
                aria-label="Go back to home page"
              >
                Go Home
              </button>
            </div>

            {this.state.errorCount > 3 && (
              <p className="text-sm text-gray-600 mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                💡 If errors persist, try clearing your browser cache or restarting the application.
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
