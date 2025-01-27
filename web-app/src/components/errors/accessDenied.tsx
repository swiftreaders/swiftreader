const AccessDenied = () => {
  return (
    <div className="min-h-screen flex items-center justify-center flex-col">
      <h1 className="text-2xl font-bold">Not so swift, reader!</h1>
      <p className="text-l font-semibold">
        You do not have permission to access this page
      </p>
    </div>
  );
};

export default AccessDenied;
