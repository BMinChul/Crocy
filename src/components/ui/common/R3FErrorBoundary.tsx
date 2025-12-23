import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * R3F Error Boundary
 * Catches errors in the 3D scene to prevent the entire Canvas from crashing (black screen).
 */
export class R3FErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CRITICAL: 3D Scene Component Crashed:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default fallback: A simple visible mesh to indicate error without crashing WebGL
      return (
        <group>
            <mesh position={[0, 0, 0]} scale={2}>
                <boxGeometry />
                <meshStandardMaterial color="red" />
            </mesh>
            <mesh position={[0, 2, 0]}>
                <sphereGeometry args={[0.5]} />
                <meshStandardMaterial color="yellow" emissive="yellow" />
            </mesh>
        </group>
      );
    }

    return this.props.children;
  }
}

export default R3FErrorBoundary;
