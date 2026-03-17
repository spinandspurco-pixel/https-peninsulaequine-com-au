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
import { Eye, EyeOff, LogIn, Shield, Users, Loader2, Fingerprint, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import logoPeMark from "@/assets/logo-pe-mark.png";
import { StaffPortalFrame } from "@/components/StaffPortalFrame";

export default function HQ() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<"admin" | "employee">("admin");
  const [focusedField, setFocusedField] = useState<string | null>(null);
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

      toast.success("Welcome back!");
      navigate(roleData.role === "admin" ? "/admin" : "/employee");
    }
    setIsLoading(false);
  };

  return (
    <Layout>
      <StaffPortalFrame
        title="Peninsula Equine HQ"
        subtitle="Command centre for administrators and workers. Blueprint-grade access control with role-based routing."
      >
        <Card className="w-full max-w-md border-accent/20 bg-card/95 backdrop-blur-lg shadow-2xl shadow-primary/20">
          <CardHeader className="text-center space-y-4 pb-2">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 flex items-center justify-center shadow-lg shadow-accent/10">
              <img src={logoPeMark} alt="P.E" className="h-12 w-12 object-contain" />
            </div>
            <div>
              <CardTitle className="font-serif text-2xl">HQ Access</CardTitle>
              <CardDescription className="text-muted-foreground/80">Sign in to access your dashboard</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <Tabs value={activeRole} onValueChange={(v) => setActiveRole(v as "admin" | "employee")}>
              <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                <TabsTrigger value="admin" className="flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                  <Crown className="h-3.5 w-3.5" />
                  <span className="text-xs uppercase tracking-[0.08em]">Admin</span>
                </TabsTrigger>
                <TabsTrigger value="employee" className="flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span className="text-xs uppercase tracking-[0.08em]">Employee</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="admin" className="mt-3">
                <p className="text-[11px] text-muted-foreground text-center tracking-wide">
                  Full access — inquiries, bookings, employees, analytics & settings.
                </p>
              </TabsContent>
              <TabsContent value="employee" className="mt-3">
                <p className="text-[11px] text-muted-foreground text-center tracking-wide">
                  Your schedule, tasks, announcements & team communications.
                </p>
              </TabsContent>
            </Tabs>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hq-email" className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Email</Label>
                <div className={`relative rounded-md transition-all duration-300 ${focusedField === "email" ? "ring-2 ring-accent/50" : ""}`}>
                  <Input
                    id="hq-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="you@peninsulaequine.com.au"
                    required
                    autoComplete="email"
                    className="bg-background/50 border-border/60 focus:border-accent"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hq-password" className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Password</Label>
                <div className={`relative rounded-md transition-all duration-300 ${focusedField === "password" ? "ring-2 ring-accent/50" : ""}`}>
                  <Input
                    id="hq-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="pr-10 bg-background/50 border-border/60 focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-[0.1em] text-xs h-11 shadow-lg shadow-accent/20"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating…
                  </>
                ) : (
                  <>
                    <Fingerprint className="mr-2 h-4 w-4" />
                    Sign In as {activeRole === "admin" ? "Admin" : "Employee"}
                  </>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/40" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-[0.15em]">
                <span className="bg-card px-3 text-muted-foreground">or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-border/60 hover:border-accent/40 hover:bg-accent/5 transition-all"
              onClick={async () => {
                const { error } = await lovable.auth.signInWithOAuth("google", {
                  redirect_uri: window.location.origin,
                });
                if (error) toast.error("Google sign-in failed. Please try again.");
              }}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Sign in with Google
            </Button>

            <div className="pt-4 border-t border-border/30">
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
      </StaffPortalFrame>
    </Layout>
  );
}
