import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings, Database, User, Lock } from "lucide-react";
import { DatabaseConnection } from "@/types/booking";

interface LoginScreenProps {
  onLogin: (username: string, database: string) => Promise<void>;
}

export default function LoginScreen({ onLogin = () => {} }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedDatabase, setSelectedDatabase] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [dbConnections, setDbConnections] = useState<DatabaseConnection[]>([
    {
      id: "1",
      name: "Основная база",
      host: "localhost",
      port: 5432,
      database: "sanatorium_main",
      username: "admin",
      password: "",
    },
    {
      id: "2",
      name: "Тестовая база",
      host: "localhost",
      port: 5432,
      database: "sanatorium_test",
      username: "test",
      password: "",
    },
  ]);
  const [newConnection, setNewConnection] = useState<
    Partial<DatabaseConnection>
  >({
    name: "",
    host: "localhost",
    port: 5432,
    database: "",
    username: "",
    password: "",
  });

  const handleLogin = async () => {
    if (username && selectedDatabase) {
      try {
        await onLogin(username, selectedDatabase);
      } catch (error) {
        console.error("Login failed:", error);
        // You could show an error message here
      }
    }
  };

  const handleAddConnection = () => {
    if (newConnection.name && newConnection.host && newConnection.database) {
      const connection: DatabaseConnection = {
        id: Date.now().toString(),
        name: newConnection.name,
        host: newConnection.host || "localhost",
        port: newConnection.port || 5432,
        database: newConnection.database,
        username: newConnection.username || "",
        password: newConnection.password || "",
      };
      setDbConnections([...dbConnections, connection]);
      setNewConnection({
        name: "",
        host: "localhost",
        port: 5432,
        database: "",
        username: "",
        password: "",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
            <Database className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Санаторий "Днестр"
          </CardTitle>
          <p className="text-gray-600 text-sm mt-2">
            Система управления санаторием
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Пользователь
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Введите имя пользователя"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Пароль
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="database" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                База данных
              </Label>
              <Select
                value={selectedDatabase}
                onValueChange={setSelectedDatabase}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите базу данных" />
                </SelectTrigger>
                <SelectContent>
                  {dbConnections.map((db) => (
                    <SelectItem key={db.id} value={db.id}>
                      {db.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleLogin}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              disabled={!username || !selectedDatabase}
            >
              Войти в систему
            </Button>

            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Настройки подключения
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Настройки подключения к серверу</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="conn-name">Название подключения</Label>
                    <Input
                      id="conn-name"
                      placeholder="Название"
                      value={newConnection.name || ""}
                      onChange={(e) =>
                        setNewConnection({
                          ...newConnection,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="conn-host">Хост</Label>
                    <Input
                      id="conn-host"
                      placeholder="localhost"
                      value={newConnection.host || ""}
                      onChange={(e) =>
                        setNewConnection({
                          ...newConnection,
                          host: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="conn-port">Порт</Label>
                    <Input
                      id="conn-port"
                      type="number"
                      placeholder="5432"
                      value={newConnection.port || ""}
                      onChange={(e) =>
                        setNewConnection({
                          ...newConnection,
                          port: parseInt(e.target.value) || 5432,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="conn-database">База данных</Label>
                    <Input
                      id="conn-database"
                      placeholder="Название базы данных"
                      value={newConnection.database || ""}
                      onChange={(e) =>
                        setNewConnection({
                          ...newConnection,
                          database: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="conn-username">Пользователь БД</Label>
                    <Input
                      id="conn-username"
                      placeholder="Пользователь"
                      value={newConnection.username || ""}
                      onChange={(e) =>
                        setNewConnection({
                          ...newConnection,
                          username: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="conn-password">Пароль БД</Label>
                    <Input
                      id="conn-password"
                      type="password"
                      placeholder="Пароль"
                      value={newConnection.password || ""}
                      onChange={(e) =>
                        setNewConnection({
                          ...newConnection,
                          password: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button onClick={handleAddConnection} className="w-full">
                    Добавить подключение
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
