import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import {
  Loader2,
  LogIn,
  Building2,
  Shield,
  Users,
  Calendar,
  Settings,
  Database,
} from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedDatabase, setSelectedDatabase] = useState("main");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [dbHost, setDbHost] = useState("localhost");
  const [dbPort, setDbPort] = useState("5432");
  const [dbName, setDbName] = useState("sanatorium");
  const [dbUser, setDbUser] = useState("postgres");
  const [dbPassword, setDbPassword] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Произошла ошибка при входе в систему");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = [
    {
      role: "Администратор",
      email: "admin@sanatorium.com",
      password: "password123",
    },
    {
      role: "Менеджер",
      email: "manager@sanatorium.com",
      password: "password123",
    },
    {
      role: "Ресепшен",
      email: "reception1@sanatorium.com",
      password: "password123",
    },
  ];

  const availableDatabases = [
    { value: "main", label: "Основная база данных" },
    { value: "backup", label: "Резервная база данных" },
    { value: "test", label: "Тестовая база данных" },
  ];

  const handleDatabaseSettings = () => {
    // Save database settings to localStorage or context
    localStorage.setItem(
      "dbSettings",
      JSON.stringify({
        host: dbHost,
        port: dbPort,
        database: dbName,
        username: dbUser,
        password: dbPassword,
      }),
    );
    setIsSettingsOpen(false);
  };

  const fillCredentials = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding & Features */}
        <div className="hidden lg:block space-y-8">
          <div className="text-center lg:text-left">
            <div className="flex justify-center lg:justify-start mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-lg">
                <Building2 className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Санаторий &quot;Днестр&quot;
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Современная система управления санаторием
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Управление бронированием
                </h3>
                <p className="text-gray-600 text-sm">
                  Календарь, схема номеров, автоматическое выселение
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  База гостей
                </h3>
                <p className="text-gray-600 text-sm">
                  Поиск по данным, история проживания, архив
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Отчетность</h3>
                <p className="text-gray-600 text-sm">
                  Статистика по этажам, корпусам, периодам
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Санаторий &quot;Днестр&quot;
          </h1>
          <p className="text-gray-600">Система управления санаторием</p>
        </div>

        {/* Login Form */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <LogIn className="w-6 h-6" />
              Вход в систему
            </CardTitle>
            <CardDescription className="text-base">
              Введите ваши учетные данные для доступа к системе
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-gray-700"
                >
                  Email адрес
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={isLoading}
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-700"
                >
                  Пароль
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  <Database className="w-4 h-4" />
                  База данных
                </label>
                <Select
                  value={selectedDatabase}
                  onValueChange={setSelectedDatabase}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Выберите базу данных" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDatabases.map((db) => (
                      <SelectItem key={db.value} value={db.value}>
                        {db.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <Alert
                  variant="destructive"
                  className="border-red-200 bg-red-50"
                >
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Вход в систему...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Войти в систему
                    </>
                  )}
                </Button>

                <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 border-2"
                      disabled={isLoading}
                    >
                      <Settings className="w-5 h-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        Настройки подключения к базе данных
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Хост</label>
                          <Input
                            value={dbHost}
                            onChange={(e) => setDbHost(e.target.value)}
                            placeholder="localhost"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Порт</label>
                          <Input
                            value={dbPort}
                            onChange={(e) => setDbPort(e.target.value)}
                            placeholder="5432"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">
                          База данных
                        </label>
                        <Input
                          value={dbName}
                          onChange={(e) => setDbName(e.target.value)}
                          placeholder="sanatorium"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">
                          Пользователь
                        </label>
                        <Input
                          value={dbUser}
                          onChange={(e) => setDbUser(e.target.value)}
                          placeholder="postgres"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Пароль</label>
                        <Input
                          type="password"
                          value={dbPassword}
                          onChange={(e) => setDbPassword(e.target.value)}
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={handleDatabaseSettings}
                          className="flex-1"
                        >
                          Сохранить
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsSettingsOpen(false)}
                          className="flex-1"
                        >
                          Отмена
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-base text-blue-800 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Демо-аккаунты для тестирования
            </CardTitle>
            <CardDescription className="text-blue-600">
              Выберите роль для быстрого входа
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {demoCredentials.map((cred, index) => {
              const roleColors = {
                Администратор: "bg-red-100 text-red-800 border-red-200",
                Менеджер: "bg-blue-100 text-blue-800 border-blue-200",
                Ресепшен: "bg-green-100 text-green-800 border-green-200",
              };

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-white/50 hover:bg-white/90 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      className={`${roleColors[cred.role as keyof typeof roleColors]} font-medium`}
                      variant="outline"
                    >
                      {cred.role}
                    </Badge>
                    <div className="text-sm">
                      <div className="text-gray-600">{cred.email}</div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fillCredentials(cred.email, cred.password)}
                    disabled={isLoading}
                    className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    Использовать
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 lg:col-span-2">
          <p>© 2024 Санаторий &quot;Днестр&quot;. Все права защищены.</p>
          <p className="mt-1 text-xs">Система управления санаторием v2.0</p>
        </div>
      </div>
    </div>
  );
}
