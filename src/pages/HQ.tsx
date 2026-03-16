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
import { lovable } from "@/integrations/lovable/index";
import logoPeMark from "@/assets/logo-pe-mark.png";

export default function HQ() { // Staff login portal — v2
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<"admin" | "employee">("admin");
  const { user, isAdmin, isEmployee, isTrainer, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (isAdmin) navigate("/admin");
      else if (isEmployee || isTrainer) navigate("/employee");
    }
  }, [user, isAdmin, isEmployee, isTrainer, loading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message === "Invalid login credentials"
        ? "Invalid credentials. Staff accounts are created by admin."
        : error.message
      );
      setIsLoading(false);
      return;
    }

    if (data.user) {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .in("role", ["admin", "employee", "trainer"])
        .maybeSingle();

      if (!roleData) {
        toast.error("No staff access. Contact your administrator.");
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      toast.success(`Welcome back!`);
      navigate(roleData.role === "admin" ? "/admin" : "/employee");
    }
    setIsLoading(false);
  };

  // Don't block the login form — show it immediately even while auth loads
  // If user is already logged in, the useEffect above will redirect them

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md border-border/50">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <img src={logoPeMark} alt="P.E" className="h-10 w-10 object-contain" />
            </div>
            <div>
              <CardTitle className="font-serif text-2xl">Peninsula Equine HQ</CardTitle>
              <CardDescription>Staff portal — sign in to access your dashboard</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
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
              <TabsContent value="admin" className="mt-3">
                <p className="text-xs text-muted-foreground text-center">
                  Full access: inquiries, bookings, employees, analytics & settings.
                </p>
              </TabsContent>
              <TabsContent value="employee" className="mt-3">
                <p className="text-xs text-muted-foreground text-center">
                  Your schedule, tasks, announcements & team comms.
                </p>
              </TabsContent>
            </Tabs>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hq-email">Email</Label>
                <Input
                  id="hq-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@peninsulaequine.com.au"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hq-password">Password</Label>
                <div className="relative">
                  <Input
                    id="hq-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In as {activeRole === "admin" ? "Admin" : "Employee"}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-border/50">
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5 shrink-0 mt-0.5 text-accent/60" />
                <p>
                  Staff accounts are managed by your administrator. Need access? Contact{" "}
                  <a href="mailto:info@peninsulaequine.com.au" className="text-accent hover:underline">
                    info@peninsulaequine.com.au
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
