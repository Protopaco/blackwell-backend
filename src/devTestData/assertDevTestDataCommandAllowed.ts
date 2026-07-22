const ALLOWED_NODE_ENVS = new Set(['development', 'qa']);

const assertDevTestDataCommandAllowed = (
  nodeEnv: string | undefined = process.env.NODE_ENV,
): void => {
  if (nodeEnv && ALLOWED_NODE_ENVS.has(nodeEnv)) return;

  throw new Error(
    `Dev test-data commands only run when NODE_ENV is development or qa. Current NODE_ENV: ${nodeEnv ?? '<unset>'}`,
  );
};

export default assertDevTestDataCommandAllowed;
