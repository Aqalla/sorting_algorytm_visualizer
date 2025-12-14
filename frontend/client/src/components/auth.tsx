import { useState } from "react";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createUser, loginUser } from "@/lib/api";

interface AuthProps {
  onLogin: (userId: number) => void;
}

type AuthMode = "login" | "register";

export function Auth({ onLogin }: AuthProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<AuthMode>("login");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let response;
      if (mode === "login") {
        response = await loginUser(email.trim());
      } else {
        response = await createUser(email.trim());
      }
      localStorage.setItem("user_id", String(response.user_id));
      localStorage.setItem("user_email", email.trim());
      onLogin(response.user_id);
    } catch {
      if (mode === "login") {
        setError("User not found. Try registering first.");
      } else {
        setError("Failed to create account. Email may already exist.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <div className="w-6 h-6 bg-primary rounded-sm" />
          </div>
          <CardTitle className="text-2xl font-semibold">Algorithm Visualizer</CardTitle>
          <CardDescription className="text-muted-foreground">
            {mode === "login" 
              ? "Enter your email to log in" 
              : "Enter your email to create an account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={isLoading}
                data-testid="input-email"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive" data-testid="text-error">
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="w-full gap-2"
              disabled={isLoading}
              data-testid="button-submit"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {mode === "login" ? "Logging in..." : "Creating account..."}
                </>
              ) : (
                <>
                  {mode === "login" ? "Log In" : "Register"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
            <div className="text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-sm text-muted-foreground hover:text-primary underline"
              >
                {mode === "login" 
                  ? "Don't have an account? Register" 
                  : "Already have an account? Log In"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
