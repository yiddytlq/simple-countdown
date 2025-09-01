interface Logger {
  log: (..._args: unknown[]) => void; // eslint-disable-line no-unused-vars
  error: (..._args: unknown[]) => void; // eslint-disable-line no-unused-vars
}

const logger: Logger = {
  log: (...args: unknown[]): void => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(...args);
    }
  },
  error: (...args: unknown[]): void => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(...args);
    }
  },
};

export default logger;
