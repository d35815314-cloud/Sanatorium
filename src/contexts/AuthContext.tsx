import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "administrator" | "manager" | "reception";
  isActive: boolean;
  lastLogin?: Date;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, database?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Mock users for demo purposes
const MOCK_USERS = {
  "admin@sanatorium.com": {
    id: "1",
    email: "admin@sanatorium.com",
    firstName: "Админ",
    lastName: "Администратор",
    role: "administrator" as const,
    isActive: true,
    password: "password123",
  },
  "manager@sanatorium.com": {
    id: "2",
    email: "manager@sanatorium.com",
    firstName: "Менеджер",
    lastName: "Системы",
    role: "manager" as const,
    isActive: true,
    password: "password123",
  },
  "reception1@sanatorium.com": {
    id: "3",
    email: "reception1@sanatorium.com",
    firstName: "Ресепшен",
    lastName: "Первый",
    role: "reception" as const,
    isActive: true,
    password: "password123",
  },
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  useEffect(() => {
    const initAuth = () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setToken(storedToken);
        } catch (error) {
          console.error("Auth initialization error:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, database?: string) => {
    try {
      setIsLoading(true);
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // If test database is selected (database === "2"), allow any credentials
      if (database === "2") {
        const testUser = {
          id: "test_user",
          email: `${username}@test.com`,
          firstName: "Тест",
          lastName: "Пользователь",
          role: "administrator" as const,
          isActive: true,
          lastLogin: new Date(),
        };

        const mockToken = `test_token_${Date.now()}`;
        localStorage.setItem("token", mockToken);
        localStorage.setItem("user", JSON.stringify(testUser));
        setToken(mockToken);
        setUser(testUser);
        return;
      }

      // For main database, create a demo user
      const demoUser = {
        id: "demo_user",
        email: `${username}@sanatorium.com`,
        firstName: username,
        lastName: "Демо",
        role: "administrator" as const,
        isActive: true,
        lastLogin: new Date(),
      };

      const mockToken = `demo_token_${Date.now()}`;
      localStorage.setItem("token", mockToken);
      localStorage.setItem("user", JSON.stringify(demoUser));
      setToken(mockToken);
      setUser(demoUser);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
