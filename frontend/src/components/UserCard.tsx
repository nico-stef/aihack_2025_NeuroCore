import { User } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Trash2 } from "lucide-react";

interface UserCardProps {
  user: User;
  onRemove?: () => void;
}

export const UserCard = ({ user, onRemove }: UserCardProps) => {
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "manager": return "default";
      default: return "secondary";
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium">{user.name}</h4>
              <p className="text-xs text-muted-foreground">@{user.username}</p>
            </div>
          </div>
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span className="truncate">{user.email}</span>
          </div>
          <Badge variant={getRoleBadgeVariant(user.role)}>
            {user.role}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
