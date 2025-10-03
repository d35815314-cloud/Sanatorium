import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User } from "lucide-react";

export default function Header() {
  const { user, logout } = useAuth();

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
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Санаторий "Днестр"
            </h1>
            <p className="text-sm text-gray-600">
              Система управления санаторием
            </p>
          </div>

          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4" />
                <div>
                  <div className="font-medium">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-gray-600">{getRoleText(user.role)}</div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Выйти
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
