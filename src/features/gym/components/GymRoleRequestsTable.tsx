import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface GymRoleRequestsTableProps {
  gymId: string;
}

interface RoleRequest {
  id: string;
  user_id: string;
  role: string;
  status: string;
  message?: string;
  created_at: string;
  decided_by?: string;
  decided_at?: string;
}

export function GymRoleRequestsTable({ gymId }: GymRoleRequestsTableProps) {
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ["gym-role-requests", gymId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gym_role_requests")
        .select("*")
        .eq("gym_id", gymId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as RoleRequest[];
    },
  });

  const decisionMutation = useMutation({
    mutationFn: async ({ requestId, action }: { requestId: string; action: "approve" | "reject" }) => {
      const { error } = await supabase.rpc("decide_gym_role_request", {
        p_req: requestId,
        p_action: action,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-role-requests", gymId] });
      queryClient.invalidateQueries({ queryKey: ["gym-admins", gymId] });
      toast.success("Request processed successfully");
    },
    onError: (error) => {
      console.error("Error processing request:", error);
      toast.error("Failed to process request");
    },
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return <div>Loading role requests...</div>;
  }

  if (!requests?.length) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No role requests found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Role Requests</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User ID</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-mono text-xs">
                {request.user_id.slice(0, 8)}...
              </TableCell>
              <TableCell>
                <Badge variant="outline">{request.role}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(request.status)}>
                  {request.status}
                </Badge>
              </TableCell>
              <TableCell>{request.message || "-"}</TableCell>
              <TableCell>
                {new Date(request.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {request.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        decisionMutation.mutate({
                          requestId: request.id,
                          action: "approve",
                        })
                      }
                      disabled={decisionMutation.isPending}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        decisionMutation.mutate({
                          requestId: request.id,
                          action: "reject",
                        })
                      }
                      disabled={decisionMutation.isPending}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}