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
import { Eye, EyeOff, LogIn, Shield, Users, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type UserRole = "admin" | "employee" | null;

export default function HQ() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"admin" | "employee">("admin");
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

    // User has no HQ access
    toast.error("You don't have access to HQ. Contact an administrator.");
    await supabase.auth.signOut();
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      const expectedRole = activeTab;
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
              Sign in to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "admin" | "employee")} className="mb-6">
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
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Access inquiry management, analytics, and system settings.
                </p>
              </TabsContent>
              
              <TabsContent value="employee" className="mt-4">
                <p className="text-sm text-muted-foreground text-center mb-4">
                  View schedules, tasks, and team communications.
                </p>
              </TabsContent>
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-4">
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
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In as {activeTab === "admin" ? "Admin" : "Employee"}
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
