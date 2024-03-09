interface Runtime {
  Quit: () => void;
}

interface Window {
  runtime: Runtime;
}

declare let window: Window;
