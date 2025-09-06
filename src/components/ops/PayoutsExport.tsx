import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Calendar, Shield } from 'lucide-react';
import { exportPayoutsCSV, downloadCSV } from '@/hooks/useCommissions';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';

export function PayoutsExport() {
  const { isSuperAdmin, isLoading: roleLoading } = useUserRole();
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const csvData = await exportPayoutsCSV(selectedYear, selectedMonth);
      downloadCSV(csvData, `payouts_${selectedYear}_${selectedMonth.toString().padStart(2, '0')}.csv`);
      toast.success('Payouts export completed successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export payouts. Check your permissions.');
    } finally {
      setIsExporting(false);
    }
  };

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-96">
          <CardContent className="text-center py-8">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">
              You need superadmin privileges to access payout exports.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payout Management</h1>
        <p className="text-muted-foreground">Export commission payouts for processing</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Ambassador Payouts Export
          </CardTitle>
          <CardDescription>
            Export commission payouts for all ambassadors for a specific month
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">Select Period:</span>
            </div>
            <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Export Details</h4>
            <p className="text-sm text-muted-foreground mb-3">
              This will export a CSV file containing:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• User ID and email for each ambassador</li>
              <li>• Ambassador profile ID</li>
              <li>• Total commission due for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}</li>
            </ul>
          </div>

          <Button 
            onClick={handleExportCSV} 
            disabled={isExporting}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : `Export Payouts for ${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">
            <h4 className="font-medium text-orange-600 mb-1">⚠️ Privacy & Security</h4>
            <p className="text-muted-foreground">
              This export contains sensitive financial data. Handle with appropriate security measures.
            </p>
          </div>
          <div className="text-sm">
            <h4 className="font-medium text-blue-600 mb-1">📋 Processing Guidelines</h4>
            <p className="text-muted-foreground">
              Use the User ID and email to process payments through your payment system.
            </p>
          </div>
          <div className="text-sm">
            <h4 className="font-medium text-green-600 mb-1">✅ Verification</h4>
            <p className="text-muted-foreground">
              Cross-reference with individual ambassador statements for accuracy.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}