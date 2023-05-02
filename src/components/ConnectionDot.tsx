export function ConnectionDot({ isConnected }: { isConnected: boolean }) {
  return (
    <div className="flex items-center space-x-2">
      <div className="relative h-4 w-4">
        <div className={`absolute h-4 w-4 rounded-full ${isConnected ? "bg-green-500 " : "bg-gray-300"}`} />
      </div>
      <div className={`${isConnected ? "text-black" : "text-gray-500"}`}>
        {isConnected ? "Connected" : "Offline"}
      </div>
    </div>
  );
}
