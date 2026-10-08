const LoadingState = ({ message }) => (
  <div className="flex min-h-64 items-center justify-center" role="status">
    <div className="flex items-center gap-3 text-sm text-slate-600">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      {message}
    </div>
  </div>
);

export default LoadingState;
