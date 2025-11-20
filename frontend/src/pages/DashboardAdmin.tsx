import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { usersApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, UserCog } from "lucide-react";
import { toast } from "sonner";

export default function DashboardAdmin() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await usersApi.getAll();
        setUsers(usersData);
      } catch (error) {
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string) => {
    if (!newRole || !["superadmin", "manager", "developer", "tester"].includes(newRole)) {
      toast.error("Invalid role. Use: superadmin, manager, developer, or tester");
      return;
    }

    try {
      await usersApi.update(userId, { role: newRole });
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole as any } : u
      ));
      setEditingUserId(null);
      setNewRole("");
      toast.success("Role updated successfully");
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "superadmin": return "destructive";
      case "manager": return "default";
      default: return "secondary";
    }
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === "superadmin").length,
    managers: users.filter(u => u.role === "manager").length,
    users: users.filter(u => u.role === "user").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage users and their roles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Admins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              Managers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.managers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View and manage user roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                  <div className="text-xs text-muted-foreground mt-1">@{user.username}</div>
                </div>

                {editingUserId === user.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Enter role"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-32"
                    />
                    <Button size="sm" onClick={() => handleRoleChange(user.id)}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      setEditingUserId(null);
                      setNewRole("");
                    }}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingUserId(user.id);
                        setNewRole(user.role);
                      }}
                    >
                      Change Role
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
