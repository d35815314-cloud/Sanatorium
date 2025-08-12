import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building2, LogOut, User, Settings } from "lucide-react";

export default function Header() {
  const { user, logout } = useAuth();

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "administrator":
        return "destructive";
      case "manager":
        return "default";
      case "reception":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "administrator":
        return "Администратор";
      case "manager":
        return "Менеджер";
      case "reception":
        return "Ресепшен";
      default:
        return role;
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Санаторий &quot;Днестр&quot;
            </h1>
            <p className="text-sm text-gray-600">Система управления</p>
          </div>
        </div>

        {/* User Menu */}
        {user && (
          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={getRoleBadgeVariant(user.role)}
                  className="text-xs"
                >
                  {getRoleText(user.role)}
                </Badge>
              </div>
            </div>

            {/* Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative h-8 w-8 rounded-full"
                >
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Настройки</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Выйти</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}
