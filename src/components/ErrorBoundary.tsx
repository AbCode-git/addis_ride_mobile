import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import tw from 'twrnc';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react-native';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    state: State = {
        hasError: false,
        error: null
    };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    resetError = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default Error UI
            return (
                <View style={tw`flex-1 bg-black justify-center items-center px-6`}>
                    <View style={tw`bg-zinc-900 p-8 rounded-2xl w-full items-center border border-zinc-800`}>
                        <View style={tw`bg-rose-500/10 p-4 rounded-full mb-6`}>
                            <AlertTriangle size={48} color="#F43F5E" />
                        </View>

                        <Text style={tw`text-white text-xl font-bold mb-2 text-center`}>
                            Something went wrong
                        </Text>

                        <Text style={tw`text-zinc-400 text-center mb-8 leading-6`}>
                            We encountered an unexpected error. Please try again or return to the home screen.
                        </Text>

                        <View style={tw`w-full gap-3`}>
                            <TouchableOpacity
                                onPress={this.resetError}
                                style={tw`bg-indigo-600 py-3.5 rounded-xl flex-row justify-center items-center`}
                            >
                                <RefreshCw size={18} color="white" style={tw`mr-2`} />
                                <Text style={tw`text-white font-bold`}>Try Again</Text>
                            </TouchableOpacity>

                            {/* Note: This is a robust fallback, direct navigation would require proper context injection which might be broken here */}
                            <TouchableOpacity
                                onPress={() => {
                                    // Hard reload for web, or just try to render children which usually resets app state in simple nav structures
                                    if (typeof window !== 'undefined') {
                                        window.location.reload();
                                    } else {
                                        this.resetError();
                                    }
                                }}
                                style={tw`bg-zinc-800 py-3.5 rounded-xl flex-row justify-center items-center`}
                            >
                                <Home size={18} color="#A1A1AA" style={tw`mr-2`} />
                                <Text style={tw`text-zinc-300 font-bold`}>Reload App</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Dev Only Error Details */}
                        {__DEV__ && (
                            <ScrollView style={tw`mt-8 max-h-40 w-full bg-black/50 p-4 rounded-lg`}>
                                <Text style={tw`text-rose-400 text-xs font-mono`}>
                                    {this.state.error?.toString()}
                                </Text>
                            </ScrollView>
                        )}
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
}
