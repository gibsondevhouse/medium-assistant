import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    public handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-screen w-screen bg-zinc-950 text-white p-8">
                    <div className="bg-zinc-900 border border-red-900/50 rounded-xl p-8 max-w-lg w-full shadow-2xl">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>

                            <h1 className="text-xl font-bold mb-2 text-red-500">Something went wrong</h1>
                            <p className="text-zinc-400 mb-6 text-sm">
                                The application encountered an unexpected error.
                            </p>

                            {this.state.error && (
                                <div className="w-full bg-black/50 rounded-lg p-4 mb-6 overflow-x-auto text-left">
                                    <p className="text-red-400 font-mono text-xs break-all">
                                        {this.state.error.toString()}
                                    </p>
                                    {import.meta.env.DEV && this.state.errorInfo && (
                                        <pre className="text-zinc-600 font-mono text-[10px] mt-2 whitespace-pre-wrap">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={this.handleReset}
                                className="flex items-center gap-2 px-6 py-2 bg-white text-black hover:bg-zinc-200 rounded-lg font-medium transition-colors"
                            >
                                <RotateCw className="w-4 h-4" />
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
