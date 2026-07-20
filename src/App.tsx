import ErrorBoundary from './components/ErrorBoundary';
import Home from './scenes/Home';

function App() {
  return (
    <div className="text-center">
      <ErrorBoundary>
        <Home />
      </ErrorBoundary>
    </div>
  );
}

export default App;
