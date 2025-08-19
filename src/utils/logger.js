const logger = {
  log: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(...args); // eslint-disable-line no-console
    }
  },
  error: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(...args); // eslint-disable-line no-console
    }
  },
};

export default logger;
