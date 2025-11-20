import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockUsers } from "@/contexts/AuthContext";
import { UserCard } from "@/components/UserCard";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function TeamManagement() {
  const [teamMembers, setTeamMembers] = useState(mockUsers.filter(u => u.role !== "superadmin"));
  const [newUsername, setNewUsername] = useState("");
  const [newRole, setNewRole] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddMember = () => {
    if (!newUsername || !newRole) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!["manager", "user"].includes(newRole)) {
      toast.error("Role must be 'manager' or 'user'");
      return;
    }

    const newMember = {
      id: String(teamMembers.length + 10),
      username: newUsername,
      email: `${newUsername}@company.com`,
      role: newRole as any,
      name: newUsername.charAt(0).toUpperCase() + newUsername.slice(1),
    };

    setTeamMembers([...teamMembers, newMember]);
    setNewUsername("");
    setNewRole("");
    setDialogOpen(false);
    toast.success("Team member added successfully");
  };

  const handleRemoveMember = (id: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id));
    toast.success("Team member removed");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground mt-1">Manage your team members</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>
                Add a new member to your team
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="johndoe"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role (manager or user)</Label>
                <Input
                  id="role"
                  placeholder="user"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                />
              </div>
              <Button onClick={handleAddMember} className="w-full">
                Add Member
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members ({teamMembers.length})
          </CardTitle>
          <CardDescription>Current team members and their roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map((member) => (
              <UserCard
                key={member.id}
                user={member}
                onRemove={() => handleRemoveMember(member.id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
