import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

const headingClasses = 'mb-4 text-center text-3xl text-white sm:mb-6 sm:text-4xl lg:text-5xl';

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary caught an error', error, info);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const background = window.background;
    const hasBackground = background && background.length > 0 && background !== '__BACKGROUND__';
    const style = hasBackground ? { backgroundImage: `url('${background}')` } : undefined;

    return (
      <div
        className="flex h-dvh items-center justify-center bg-cover bg-center bg-no-repeat"
        style={style}
      >
        <div className="flex flex-col items-center px-4">
          {window.title && window.title.length > 0 && (
            <div className={headingClasses}>{window.title}</div>
          )}
          <div className={headingClasses}>Something went wrong</div>
          <div className="text-center text-base text-white opacity-80">
            The countdown ran into an unexpected error.
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
