import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/useAuth';
import { apiService } from '@/services/api';
import { User } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import { Check, X, Mail } from 'lucide-react';

const AdminApproval: React.FC = () => {
  const { token } = useAuth();
  const [pendingAdmins, setPendingAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPendingAdmins();
  }, []);

  const fetchPendingAdmins = async () => {
    try {
      const pending = await apiService.getPendingAdmins(token!);
      setPendingAdmins(pending);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch pending admin requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (admin: User) => {
    setProcessingIds(prev => new Set([...prev, admin._id]));
    
    try {
      await apiService.approveAdmin(admin._id, token!);
      setPendingAdmins(prev => prev.filter(a => a._id !== admin._id));
      
      toast({
        title: "Success",
        description: `Admin approved successfully. Approval email sent to ${admin.email}`,
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve admin or send email",
        variant: "destructive",
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(admin._id);
        return newSet;
      });
    }
  };

  const handleReject = async (admin: User) => {
    setProcessingIds(prev => new Set([...prev, admin._id]));
    
    try {
      await apiService.rejectAdmin(admin._id, token!);
      setPendingAdmins(prev => prev.filter(a => a._id !== admin._id));
      
      toast({
        title: "Request Rejected",
        description: `Admin request rejected. User converted to regular user and rejection email sent to ${admin.email}`,
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject admin request or send email",
        variant: "destructive",
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(admin._id);
        return newSet;
      });
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading pending approvals...</div>;
  }

  if (pendingAdmins.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Pending Admin Approvals</h3>
        <p className="text-gray-500">No pending admin requests</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Pending Admin Approvals ({pendingAdmins.length})
        </h3>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Requested Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingAdmins.map((admin) => (
              <TableRow key={admin._id}>
                <TableCell>{admin.name}</TableCell>
                <TableCell>{admin.email}</TableCell>
                <TableCell>{admin.address}</TableCell>
                <TableCell>{new Date(admin.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApprove(admin)}
                      disabled={processingIds.has(admin._id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      {processingIds.has(admin._id) ? (
                        <>
                          <Mail className="h-4 w-4 mr-1 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(admin)}
                      disabled={processingIds.has(admin._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      {processingIds.has(admin._id) ? (
                        <>
                          <Mail className="h-4 w-4 mr-1 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </>
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <div className="flex items-start">
            <Mail className="h-5 w-5 text-blue-400 mt-0.5 mr-2" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">Email Notifications</p>
              <p>• Approved admins will receive an email with login instructions and privileges.</p>
              <p>• Rejected users will be converted to regular users and receive a rejection email.</p>
              <p>• All existing admins are notified when a new admin request is submitted.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminApproval;