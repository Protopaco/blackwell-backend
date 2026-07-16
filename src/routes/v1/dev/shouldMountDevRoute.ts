const shouldMountDevRoute = (nodeEnv: string | undefined = process.env.NODE_ENV): boolean => {
  return nodeEnv === 'development' || nodeEnv === 'qa';
};

export default shouldMountDevRoute;
