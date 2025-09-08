import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Users, 
  UserPlus, 
  Edit, 
  MapPin, 
  DollarSign, 
  MoreHorizontal,
  Eye
} from 'lucide-react';
import { useAdminAmbassadors, AmbassadorSummary } from './hooks/useAdminAmbassadors';
import { CreateAmbassadorDialog } from './components/CreateAmbassadorDialog';
import { EditAmbassadorDialog } from './components/EditAmbassadorDialog';
import { AssignGymDialog } from './components/AssignGymDialog';
import { CommissionRatesDialog } from './components/CommissionRatesDialog';

export default function AdminAmbassadorsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignGymDialogOpen, setAssignGymDialogOpen] = useState(false);
  const [commissionDialogOpen, setCommissionDialogOpen] = useState(false);
  const [selectedAmbassador, setSelectedAmbassador] = useState<AmbassadorSummary | null>(null);

  const { data: ambassadors, isLoading, error } = useAdminAmbassadors();

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'eligible': return 'secondary';
      case 'suspended': return 'destructive';
      case 'terminated': return 'outline';
      default: return 'secondary';
    }
  };

  const handleEdit = (ambassador: AmbassadorSummary) => {
    setSelectedAmbassador(ambassador);
    setEditDialogOpen(true);
  };

  const handleAssignGym = (ambassador: AmbassadorSummary) => {
    setSelectedAmbassador(ambassador);
    setAssignGymDialogOpen(true);
  };

  const handleCommissionRates = (ambassador: AmbassadorSummary) => {
    setSelectedAmbassador(ambassador);
    setCommissionDialogOpen(true);
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              Error loading ambassadors: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ambassador Management</h1>
          <p className="text-muted-foreground">
            Manage ambassador profiles, assignments, and commission structures
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Create Ambassador
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ambassadors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ambassadors?.length ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Ambassadors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ambassadors?.filter(a => a.status === 'active').length ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Verified Deals</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ambassadors?.reduce((sum, a) => sum + (a.verified_deals_total ?? 0), 0) ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gym Visits</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ambassadors?.reduce((sum, a) => sum + (a.total_gym_visits ?? 0), 0) ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ambassadors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ambassador Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading ambassadors...</p>
              </div>
            </div>
          ) : ambassadors && ambassadors.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ambassador</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verified Deals</TableHead>
                  <TableHead>Gym Visits</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Bio</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ambassadors.map((ambassador) => (
                  <TableRow key={ambassador.ambassador_id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {ambassador.user_email}
                        </div>
                        {ambassador.user_name && (
                          <div className="text-sm text-muted-foreground">
                            {ambassador.user_name}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(ambassador.status)}>
                        {ambassador.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{ambassador.verified_deals_total ?? 0}</TableCell>
                    <TableCell>{ambassador.total_gym_visits ?? 0}</TableCell>
                    <TableCell>
                      {ambassador.last_visit_at 
                        ? new Date(ambassador.last_visit_at).toLocaleDateString()
                        : '—'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate text-sm text-muted-foreground">
                        {ambassador.bio || 'No bio provided'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(ambassador)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAssignGym(ambassador)}>
                            <MapPin className="mr-2 h-4 w-4" />
                            Assign to Gym
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleCommissionRates(ambassador)}>
                            <DollarSign className="mr-2 h-4 w-4" />
                            Commission Rates
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No ambassadors</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get started by creating your first ambassador profile.
              </p>
              <div className="mt-6">
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Ambassador
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateAmbassadorDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
      
      <EditAmbassadorDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        ambassador={selectedAmbassador}
      />
      
      <AssignGymDialog
        open={assignGymDialogOpen}
        onOpenChange={setAssignGymDialogOpen}
        ambassador={selectedAmbassador}
      />
      
      <CommissionRatesDialog
        open={commissionDialogOpen}
        onOpenChange={setCommissionDialogOpen}
        ambassador={selectedAmbassador}
      />
    </div>
  );
}