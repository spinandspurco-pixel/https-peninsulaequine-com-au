import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn, Shield, Users, Loader2, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type AuthMode = "signin" | "signup";

export default function HQ() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<"admin" | "employee">("admin");
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Check role and redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      checkRoleAndRedirect(user.id);
    }
  }, [user, loading]);

  const checkRoleAndRedirect = async (userId: string) => {
    const { data: adminRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (adminRole) {
      navigate("/admin");
      return;
    }

    const { data: employeeRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "employee")
      .maybeSingle();

    if (employeeRole) {
      navigate("/employee");
      return;
    }

    // User has no HQ access - sign them out
    toast.error("You don't have access to HQ. Contact an administrator.");
    await supabase.auth.signOut();
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    if (data.user) {
      // Check if user has the appropriate role
      const expectedRole = activeRole;
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", expectedRole)
        .maybeSingle();

      if (!roleData) {
        // Check if they have any HQ role
        const { data: anyRole } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .in("role", ["admin", "employee"])
          .maybeSingle();

        if (anyRole) {
          toast.info(`Signed in as ${anyRole.role}. Redirecting...`);
          navigate(anyRole.role === "admin" ? "/admin" : "/employee");
        } else {
          toast.error("You don't have access to HQ. Contact an administrator.");
          await supabase.auth.signOut();
        }
        setIsLoading(false);
        return;
      }

      toast.success(`Welcome back, ${expectedRole}!`);
      navigate(expectedRole === "admin" ? "/admin" : "/employee");
    }

    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/hq`,
      },
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    if (data.user) {
      toast.success("Account created! Check your email to verify, then sign in.");
      setAuthMode("signin");
      setPassword("");
      setConfirmPassword("");
    }

    setIsLoading(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="font-serif text-2xl">Peninsula Equine HQ</CardTitle>
            <CardDescription>
              {authMode === "signin" ? "Sign in to access your dashboard" : "Create a new account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Auth Mode Toggle */}
            <div className="flex gap-2 mb-6">
              <Button
                variant={authMode === "signin" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setAuthMode("signin")}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
              <Button
                variant={authMode === "signup" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setAuthMode("signup")}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Sign Up
              </Button>
            </div>

            {authMode === "signin" && (
              <Tabs value={activeRole} onValueChange={(v) => setActiveRole(v as "admin" | "employee")} className="mb-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="admin" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin
                  </TabsTrigger>
                  <TabsTrigger value="employee" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Employee
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="admin" className="mt-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Access inquiry management, analytics, and system settings.
                  </p>
                </TabsContent>
                
                <TabsContent value="employee" className="mt-4">
                  <p className="text-sm text-muted-foreground text-center">
                    View schedules, tasks, and team communications.
                  </p>
                </TabsContent>
              </Tabs>
            )}

            {authMode === "signup" && (
              <p className="text-sm text-muted-foreground text-center mb-6">
                Create an account to request HQ access. An admin will assign your role.
              </p>
            )}

            <form onSubmit={authMode === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {authMode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                  />
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {authMode === "signin" ? "Signing in..." : "Creating account..."}
                  </>
                ) : authMode === "signin" ? (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In as {activeRole === "admin" ? "Admin" : "Employee"}
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
