import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usersApi, authApi, teamsApi } from "@/lib/api";
import { UserCard } from "@/components/UserCard";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function TeamManagement() {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, teamsData] = await Promise.all([
          usersApi.getAll(),
          teamsApi.getAll()
        ]);
        
        // Get all member IDs from all teams
        const allTeamMemberIds = new Set<string>();
        teamsData.forEach((team: any) => {
          team.members.forEach((member: any) => {
            allTeamMemberIds.add(member.id || member._id || member);
          });
        });
        
        // Filter users who are in teams and not superadmin
        const membersInTeams = usersData.filter((u: any) => 
          u.role !== "superadmin" && allTeamMemberIds.has(u.id || u._id)
        );
        
        setTeamMembers(membersInTeams);
        setTeams(teamsData);
      } catch (error) {
        toast.error("Failed to load team members");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddMember = async () => {
    if (!newUsername || !newEmail || !newName || !newRole) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!["manager", "developer", "tester"].includes(newRole)) {
      toast.error("Role must be 'manager', 'developer', or 'tester'");
      return;
    }

    try {
      const response = await authApi.register(newName, newUsername, newEmail, "password123", newRole);
      const newMember = response.user;
      setTeamMembers([...teamMembers, newMember]);
      setNewUsername("");
      setNewEmail("");
      setNewName("");
      setNewRole("");
      setDialogOpen(false);
      toast.success("Team member added successfully");
    } catch (error) {
      toast.error("Failed to add team member");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleRemoveMember = async (userId: string) => {
    try {
      // Find the team that contains this user
      const userTeam = teams.find(team => 
        team.members.some((member: any) => member.id === userId || member._id === userId)
      );

      if (!userTeam) {
        toast.error("User is not part of any team");
        return;
      }

      // Remove member from team
      await teamsApi.removeMember(userTeam.id, userId);
      
      // Reload data from backend to ensure consistency
      const [usersData, teamsData] = await Promise.all([
        usersApi.getAll(),
        teamsApi.getAll()
      ]);
      
      // Get all member IDs from all teams
      const allTeamMemberIds = new Set<string>();
      teamsData.forEach((team: any) => {
        team.members.forEach((member: any) => {
          allTeamMemberIds.add(member.id || member._id || member);
        });
      });
      
      // Filter users who are in teams and not superadmin
      const membersInTeams = usersData.filter((u: any) => 
        u.role !== "superadmin" && allTeamMemberIds.has(u.id || u._id)
      );
      
      setTeamMembers(membersInTeams);
      setTeams(teamsData);
      
      toast.success("Team member removed from team");
    } catch (error) {
      toast.error("Failed to remove member from team");
    }
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
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@company.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role (manager, developer, or tester)</Label>
                <Input
                  id="role"
                  placeholder="developer"
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
