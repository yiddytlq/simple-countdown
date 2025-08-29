interface Logger {
  log: (..._args: unknown[]) => void;
  error: (..._args: unknown[]) => void;
}

const logger: Logger = {
  log: (...args: unknown[]): void => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(...args); // eslint-disable-line no-console
    }
  },
  error: (...args: unknown[]): void => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(...args); // eslint-disable-line no-console
    }
  },
};

export default logger;
