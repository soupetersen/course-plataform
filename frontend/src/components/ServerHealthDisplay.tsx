import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/api";


interface ServerHealthData {
  status: string;
  timestamp: string;
  uptime: string;
  memory: {
    used: string;
    total: string;
  };
  environment: string;
}


const useServerHealth = () => {
  return useQuery({
    queryKey: ["server-health"],
    queryFn: async (): Promise<ServerHealthData> => {
      const response = await apiRequest({
        method: "GET",
        url: "/health",
      });
      return response;
    },
    refetchInterval: 30000, 
    staleTime: 10000, 
  });
};


const ServerHealthDisplay = () => {
  const healthQuery = useServerHealth();

  
  if (healthQuery.isPending) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (healthQuery.isError) {
    return (
      <div className="text-red-600 p-4 border border-red-200 rounded-lg">
        <p className="font-semibold">Server Error</p>
        <p className="text-sm">
          {healthQuery.error?.message || "Failed to fetch server status"}
        </p>
      </div>
    );
  }

  
  const data = healthQuery.data;

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-fade-in">
      <div className="flex items-center mb-2">
        <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
        <h3 className="font-semibold text-green-800">
          Server Status: {data?.status}
        </h3>
      </div>

      <div className="text-sm text-green-700 space-y-1">
        <p>
          <span className="font-medium">Uptime:</span> {data?.uptime}
        </p>
        <p>
          <span className="font-medium">Memory:</span> {data?.memory.used} /{" "}
          {data?.memory.total}
        </p>
        <p>
          <span className="font-medium">Environment:</span> {data?.environment}
        </p>
        <p>
          <span className="font-medium">Last Updated:</span>{" "}
          {data?.timestamp
            ? new Date(data.timestamp).toLocaleTimeString()
            : "N/A"}
        </p>
      </div>
    </div>
  );
};

export default ServerHealthDisplay;

