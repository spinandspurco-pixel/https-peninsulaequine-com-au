import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  UserPlus,
  Shield,
  Mail,
  Trash2,
  RefreshCw,
  Users,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Loader2,
  UserCog,
  Send,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import {
  PE_AVATARS,
  PEAvatarIcon,
  PEBossHat,
  PEHorseHead,
  PERider,
  PEHorseshoe,
} from "@/components/icons/PEIcons";

const ROLE_LABELS: Record<string, { label: string; color: string; desc: string }> = {
  admin: { label: "Admin", color: "bg-red-500 text-white", desc: "Full access to all features and staff management" },
  employee: { label: "Employee", color: "bg-blue-500 text-white", desc: "Task management, bookings view, and daily ops" },
  trainer: { label: "Trainer", color: "bg-emerald-500 text-white", desc: "Lesson bookings, clinic inquiries, and student management" },
  moderator: { label: "Moderator", color: "bg-amber-500 text-white", desc: "Content moderation and limited admin access" },
  preview: { label: "Client Preview", color: "bg-accent/60 text-accent-foreground", desc: "View-only demo access. Sees seeded demo data across HQ. Cannot edit, delete, or touch real client records." },
  user: { label: "User", color: "bg-muted text-muted-foreground", desc: "Basic authenticated user" },
};

interface StaffMember {
  user_id: string;
  role: string;
  created_at: string;
  email?: string;
  display_name?: string;
}

export function AdminStaffOnboarding() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [showInviteWizard, setShowInviteWizard] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);
  const [isDeletingRole, setIsDeletingRole] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Invite wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteDisplayName, setInviteDisplayName] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("employee");
  const [invitePassword, setInvitePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [inviteAvatar, setInviteAvatar] = useState("mustang");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoadingStaff(true);
    const { data, error } = await supabase
      .from("user_roles")
      .select("user_id, role, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load staff");
      setLoadingStaff(false);
      return;
    }

    // We don't have direct access to auth.users, so we'll display user_id
    // The edge function sets display_name in user_metadata
    setStaff(data || []);
    setLoadingStaff(false);
  };

  const handleInvite = async () => {
    if (!inviteEmail || !invitePassword || !inviteRole) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsCreating(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const response = await supabase.functions.invoke("create-staff-account", {
        body: {
          email: inviteEmail,
          password: invitePassword,
          role: inviteRole,
          display_name: inviteDisplayName || inviteEmail.split("@")[0],
        },
      });

      if (response.error || !response.data?.success) {
        throw new Error(response.data?.error || response.error?.message || "Failed to create account");
      }

      toast.success(`Welcome aboard! ${inviteDisplayName || inviteEmail} has been saddled up as ${ROLE_LABELS[inviteRole]?.label}`);
      resetWizard();
      fetchStaff();
    } catch (err: any) {
      toast.error(err.message || "Failed to create staff account");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!deleteTarget) return;
    setIsDeletingRole(true);

    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", deleteTarget.user_id)
      .eq("role", deleteTarget.role as any);

    if (error) {
      toast.error("Failed to remove role");
    } else {
      toast.success("Role removed successfully");
      fetchStaff();
    }
    setDeleteTarget(null);
    setIsDeletingRole(false);
  };

  const resetWizard = () => {
    setShowInviteWizard(false);
    setWizardStep(1);
    setInviteEmail("");
    setInviteDisplayName("");
    setInviteRole("employee");
    setInvitePassword("");
    setInviteAvatar("mustang");
    setShowPassword(false);
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
    let pw = "";
    for (let i = 0; i < 14; i++) pw += chars.charAt(Math.floor(Math.random() * chars.length));
    setInvitePassword(pw);
    setShowPassword(true);
  };

  const roleInfo = ROLE_LABELS[inviteRole] || ROLE_LABELS.user;
  const selectedAvatarData = PE_AVATARS.find((a) => a.id === inviteAvatar) || PE_AVATARS[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold flex items-center gap-2">
            <UserCog className="h-5 w-5 text-accent" />
            Staff & Onboarding
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage team members, permissions, and onboard new staff
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchStaff} disabled={loadingStaff}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loadingStaff ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowInviteWizard(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Staff
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {(["admin", "employee", "trainer", "moderator", "preview"] as const).map((role) => {
          const count = staff.filter((s) => s.role === role).length;
          const info = ROLE_LABELS[role];
          return (
            <Card key={role} className="group hover:border-accent/30 transition-colors">
              <CardHeader className="pb-2">
                <CardDescription className="capitalize">{info.label}s</CardDescription>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Shield className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                  {count}
                </CardTitle>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Staff Directory Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" />
                Staff Directory
              </CardTitle>
              <CardDescription>All team members and their assigned roles</CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search staff…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-9 w-[130px]">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {Object.entries(ROLE_LABELS)
                    .filter(([key]) => key !== "user")
                    .map(([key, info]) => (
                      <SelectItem key={key} value={key}>{info.label}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingStaff ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : (() => {
                const filtered = staff.filter((m) => {
                  const matchesRole = roleFilter === "all" || m.role === roleFilter;
                  const matchesSearch = !searchQuery || 
                    m.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (ROLE_LABELS[m.role]?.label || "").toLowerCase().includes(searchQuery.toLowerCase());
                  return matchesRole && matchesSearch;
                });
                if (filtered.length === 0) return (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      <PEHorseHead size={40} className="mx-auto mb-2 text-muted-foreground/50" />
                      {staff.length === 0 ? "No staff members yet. Invite your first team member!" : "No staff match your search."}
                    </TableCell>
                  </TableRow>
                );
                return filtered.map((member) => {
                  const info = ROLE_LABELS[member.role] || ROLE_LABELS.user;
                  const daysSinceAdded = Math.floor((Date.now() - new Date(member.created_at).getTime()) / (1000 * 60 * 60 * 24));
                  const onboardingStatus = daysSinceAdded < 7 ? "new" : daysSinceAdded < 30 ? "onboarding" : "active";
                  const statusConfig = {
                    new: { label: "New", className: "bg-accent/15 text-accent border-accent/30" },
                    onboarding: { label: "Onboarding", className: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30" },
                    active: { label: "Active", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" },
                  };
                  const status = statusConfig[onboardingStatus];
                  return (
                    <TableRow key={`${member.user_id}-${member.role}`} className="group/row">
                      <TableCell className="font-mono text-xs max-w-[200px] truncate">
                        {member.user_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <Badge className={info.color}>{info.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={status.className}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[250px]">
                        {info.desc}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {format(new Date(member.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(member)}
                          className="text-destructive hover:text-destructive opacity-0 group-hover/row:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                });
              })()}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Email Routing Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="h-5 w-5 text-accent" />
            Email Routing & Notifications
          </CardTitle>
          <CardDescription>How alerts are distributed to your team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <PEBossHat size={16} className="text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Admin Inbox</p>
                    <p className="text-xs text-muted-foreground">All inquiries & bookings</p>
                  </div>
                </div>
                <p className="text-sm font-mono bg-background px-2 py-1 rounded">NOTIFICATION_EMAIL (secret)</p>
                <p className="text-xs text-muted-foreground mt-1">Receives every new inquiry, booking confirmation, and system alert</p>
              </div>

              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <PEHorseshoe size={16} className="text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Employee (Sander)</p>
                    <p className="text-xs text-muted-foreground">All inquiries & bookings</p>
                  </div>
                </div>
                <p className="text-sm font-mono bg-background px-2 py-1 rounded">sander@peninsulaequine.org</p>
                <p className="text-xs text-muted-foreground mt-1">CC'd on every inquiry and booking notification</p>
              </div>

              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center">
                    <PERider size={16} className="text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Trainer (Glenn)</p>
                    <p className="text-xs text-muted-foreground">Lessons & clinics only</p>
                  </div>
                </div>
                <p className="text-sm font-mono bg-background px-2 py-1 rounded">glenn@peninsulaequine.org</p>
                <p className="text-xs text-muted-foreground mt-1">CC'd on lesson bookings and clinic-related inquiries</p>
              </div>
            </div>

            <div className="p-3 rounded-lg border-2 border-dashed border-muted-foreground/20">
              <p className="text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 inline mr-1 text-accent" />
                <strong>Routing rules:</strong> All inquiries & bookings notify Admin + Sander.
                Lesson & clinic submissions additionally CC the trainer (Glenn). Email notifications are powered by Resend.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Invite Wizard Dialog ── */}
      <Dialog open={showInviteWizard} onOpenChange={(open) => { if (!open) resetWizard(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-accent" />
              Onboard New Staff
            </DialogTitle>
            <DialogDescription>
              Step {wizardStep} of 3 — {wizardStep === 1 ? "Account Details" : wizardStep === 2 ? "Role & Permissions" : "Review & Create"}
            </DialogDescription>
          </DialogHeader>

          {/* Progress bar */}
          <div className="flex gap-1 mb-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  step <= wizardStep ? "bg-accent" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Step 1: Account Details */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="invite-email">Email Address *</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="staff@peninsulaequine.org"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="invite-name">Display Name</Label>
                <Input
                  id="invite-name"
                  placeholder="e.g. Glenn, Sander"
                  value={inviteDisplayName}
                  onChange={(e) => setInviteDisplayName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="invite-password">Temporary Password *</Label>
                  <Button variant="ghost" size="sm" onClick={generatePassword} className="text-xs text-accent">
                    Generate
                  </Button>
                </div>
                <div className="relative mt-1">
                  <Input
                    id="invite-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 characters"
                    value={invitePassword}
                    onChange={(e) => setInvitePassword(e.target.value)}
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
            </div>
          )}

          {/* Step 2: Role & Avatar */}
          {wizardStep === 2 && (
            <div className="space-y-5">
              <div>
                <Label>Role *</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_LABELS)
                      .filter(([key]) => key !== "user")
                      .map(([key, info]) => (
                        <SelectItem key={key} value={key}>
                          <span className="flex items-center gap-2">
                            <Shield className="h-3.5 w-3.5" />
                            {info.label}
                          </span>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1.5">{roleInfo.desc}</p>
              </div>

              <div>
                <Label className="mb-2 block">Choose an Avatar</Label>
                <div className="grid grid-cols-4 gap-3">
                  {PE_AVATARS.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => setInviteAvatar(avatar.id)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all hover:scale-105 ${
                        inviteAvatar === avatar.id
                          ? "border-accent ring-2 ring-accent/30 scale-105"
                          : "border-muted hover:border-accent/40"
                      }`}
                    >
                      <PEAvatarIcon avatarId={avatar.id} size={20} className="w-10 h-10" />
                      <span className="text-xs text-muted-foreground">{avatar.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl border bg-muted/30">
                <PEAvatarIcon avatarId={selectedAvatarData.id} size={28} className="w-14 h-14" />
                <div>
                  <p className="font-serif font-bold text-lg">{inviteDisplayName || inviteEmail.split("@")[0]}</p>
                  <p className="text-sm text-muted-foreground">{inviteEmail}</p>
                  <Badge className={`mt-1 ${roleInfo.color}`}>{roleInfo.label}</Badge>
                </div>
              </div>

              <div className="text-sm space-y-2 p-3 rounded-lg bg-muted/20 border">
                <p><strong>What happens next:</strong></p>
                <ul className="space-y-1 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    Account created with email confirmation
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <strong>{roleInfo.label}</strong> role assigned automatically
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    Staff member can log in at <span className="font-mono text-xs">/login</span> with the provided credentials
                  </li>
                  {inviteRole === "trainer" && (
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                      Will receive lesson & clinic email notifications
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between sm:justify-between">
            {wizardStep > 1 ? (
              <Button variant="outline" onClick={() => setWizardStep(wizardStep - 1)}>
                Back
              </Button>
            ) : (
              <Button variant="outline" onClick={resetWizard}>Cancel</Button>
            )}

            {wizardStep < 3 ? (
              <Button
                onClick={() => setWizardStep(wizardStep + 1)}
                disabled={wizardStep === 1 && (!inviteEmail || !invitePassword || invitePassword.length < 8)}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleInvite} disabled={isCreating}>
                {isCreating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Create Account
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Role</AlertDialogTitle>
            <AlertDialogDescription>
              Remove the <strong>{deleteTarget?.role}</strong> role from user{" "}
              <span className="font-mono text-xs">{deleteTarget?.user_id.slice(0, 8)}...</span>?
              This will revoke their access to the associated dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRole} disabled={isDeletingRole} className="bg-destructive text-destructive-foreground">
              {isDeletingRole ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Remove Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
