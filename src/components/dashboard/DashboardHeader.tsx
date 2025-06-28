import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import UserAvatar from "@/components/UserAvatar";

interface User {
  firstName?: string;
}

interface DashboardHeaderProps {
  user: User | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const DashboardHeader = ({ user, searchQuery, onSearchChange }: DashboardHeaderProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || 'Developer'}!
          </h1>
          <p className="text-gray-600 text-lg">Explore and manage your development tools</p>
        </div>
        <UserAvatar />
      </div>
      <div className="relative w-full max-w-3xl mx-auto">
        <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6 z-10" />
        <Input
          type="text"
          placeholder="Search for development tools..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-16 pr-6 py-6 text-xl border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-neutral-800 rounded-2xl shadow-lg bg-white transition-all duration-200"
        />
      </div>
    </div>
  );
};
