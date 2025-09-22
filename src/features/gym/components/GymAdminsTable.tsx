import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGymAdmins, useAssignGymAdmin } from "@/hooks/useGymAdmins";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface GymAdminsTableProps {
  gymId: string;
}

export function GymAdminsTable({ gymId }: GymAdminsTableProps) {
  const [newAdminUserId, setNewAdminUserId] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<string>("staff");

  const { data: admins, isLoading } = useGymAdmins(gymId);
  const assignAdminMutation = useAssignGymAdmin();

  const handleAssignAdmin = async () => {
    if (!newAdminUserId.trim()) return;

    await assignAdminMutation.mutateAsync({
      gymId,
      userId: newAdminUserId.trim(),
      role: newAdminRole,
    });

    setNewAdminUserId("");
    setNewAdminRole("staff");
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default";
      case "admin":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return <div>Loading administrators...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Administrator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="user-id">User ID</Label>
              <Input
                id="user-id"
                placeholder="Enter user UUID"
                value={newAdminUserId}
                onChange={(e) => setNewAdminUserId(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={newAdminRole} onValueChange={setNewAdminRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleAssignAdmin}
                disabled={!newAdminUserId.trim() || assignAdminMutation.isPending}
                className="w-full"
              >
                {assignAdminMutation.isPending ? "Adding..." : "Add Admin"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {admins && admins.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((admin) => (
              <TableRow key={`${admin.gym_id}-${admin.user_id}`}>
                <TableCell className="font-mono text-xs">
                  {admin.user_id.slice(0, 8)}...
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(admin.role)}>
                    {admin.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(admin.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {(!admins || admins.length === 0) && (
        <div className="text-center py-6 text-muted-foreground">
          No administrators found
        </div>
      )}
    </div>
  );
}