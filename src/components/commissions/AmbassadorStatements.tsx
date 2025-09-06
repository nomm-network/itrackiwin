import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Calendar } from 'lucide-react';
import { useAmbassadorStatements, useAmbassadorStatementSummary, exportCommissionsCSV, downloadCSV } from '@/hooks/useCommissions';
import { toast } from 'sonner';

export function AmbassadorStatements() {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

  const { data: statements, isLoading } = useAmbassadorStatements(selectedYear, selectedMonth);
  const { data: summary } = useAmbassadorStatementSummary();

  const handleExportCSV = async () => {
    try {
      const csvData = await exportCommissionsCSV(selectedYear, selectedMonth);
      downloadCSV(csvData, `commissions_${selectedYear}_${selectedMonth.toString().padStart(2, '0')}.csv`);
      toast.success('Commission statement exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export commission statement');
    }
  };

  const totalCommission = statements?.reduce((sum, statement) => sum + statement.commission_due, 0) || 0;

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Commission Statements</h1>
          <p className="text-muted-foreground">View and export your commission earnings</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger className="w-32">
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
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Commission Summary - {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
          </CardTitle>
          <CardDescription>
            Total commission earned this month: <span className="font-semibold">${totalCommission.toFixed(2)}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading statements...</div>
          ) : !statements || statements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No commission statements found for the selected period
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gym</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Commission %</TableHead>
                  <TableHead>Gross Revenue</TableHead>
                  <TableHead>Commission Due</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statements.map((statement) => (
                  <TableRow key={statement.agreement_id}>
                    <TableCell className="font-medium">{statement.gym_name}</TableCell>
                    <TableCell>
                      <span className="capitalize">{statement.tier}</span>
                    </TableCell>
                    <TableCell>{statement.percent}%</TableCell>
                    <TableCell>${statement.gross_revenue.toFixed(2)}</TableCell>
                    <TableCell className="font-semibold">${statement.commission_due.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                        statement.in_window 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {statement.in_window ? 'Active' : 'Expired'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {summary && summary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historical Summary</CardTitle>
            <CardDescription>Commission earnings by month</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Total Commission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.slice(0, 12).map((item) => (
                  <TableRow key={`${item.year}-${item.month}`}>
                    <TableCell>{months.find(m => m.value === item.month)?.label}</TableCell>
                    <TableCell>{item.year}</TableCell>
                    <TableCell className="font-semibold">${item.commission_total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}