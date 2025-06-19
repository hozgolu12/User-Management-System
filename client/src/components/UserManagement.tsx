import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { User } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Edit, Trash2, Search } from 'lucide-react';

const UserManagement: React.FC = () => {
  const { user: currentUser, token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'user' as 'user' | 'admin'
  });

  const isAdmin = currentUser?.role === 'admin';
  const isSuperAdmin = currentUser?.isSuperAdmin;

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    try {
      const usersData = await apiService.getUsers(token!);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchTerm) {
      if (isAdmin && !isSuperAdmin) {
        setFilteredUsers(users.filter(user => !user.isSuperAdmin));
      } else {
        setFilteredUsers(users);
      }
      return;
    }

    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isAdmin && !isSuperAdmin) {
      setFilteredUsers(filtered.filter(user => !user.isSuperAdmin));
    } else {
      setFilteredUsers(filtered);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.address) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!editingUser && !formData.password) {
      toast({
        title: "Error",
        description: "Password is required for new users",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingUser) {
        // For editing, don't include password in the update unless it's changed
        const updateData = {
          name: formData.name,
          email: formData.email,
          address: formData.address,
          role: formData.role
        };
        
        const updatedUser = await apiService.updateUser(editingUser._id, updateData, token!);
        setUsers(prev => prev.map(u => u._id === updatedUser._id ? updatedUser : u));
        toast({
          title: "Success",
          description: "User updated successfully",
        });
      } 
      
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Error",
        description: error?.message || "Operation failed",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (user: User) => {
    // Check permissions
    if (!canEditUser(user)) {
      toast({
        title: "Error",
        description: "You don't have permission to edit this user",
        variant: "destructive",
      });
      return;
    }

    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't show existing password
      address: user.address,
      role: user.role
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (userToDelete: User) => {
  if (!canDeleteUser(userToDelete)) {
    toast({
      title: "Error",
      description: "You don't have permission to delete this user",
      variant: "destructive",
    });
    return;
  }

  // Prevent users from deleting themselves
  if (currentUser?._id === userToDelete._id) {
    toast({
      title: "Error",
      description: "You cannot delete your own account",
      variant: "destructive",
    });
    return;
  }

  if (!confirm(`Are you sure you want to delete ${userToDelete.name}?`)) return;

  try {
    await apiService.deleteUser(userToDelete._id, token!);
    const updatedUsers = await apiService.getUsers(token!);
    setUsers(updatedUsers);
    toast({
      title: "Success",
      description: "User deleted successfully",
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    toast({
      title: "Error",
      description: error?.message || "Failed to delete user",
      variant: "destructive",
    });
  }
};

  const resetForm = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', address: '', role: 'user' });
  };

  const canEditUser = (user: User) => {
    if (isSuperAdmin) {
    return true; // Super admin can edit anyone
    }
    if (isAdmin && user.role === 'user') {
      return true; // Admin can edit users
    }
    if (user._id === currentUser?._id && isAdmin) {
      return true; // User can edit themselves
    }
    return false;
  };

  const canDeleteUser = (user: User) => {
    if (isSuperAdmin) {
    return true; // Super admin can delete anyone
    }
    if (isAdmin && user.role === 'user') {
      return true; // Admin can delete users
    }
    if (user._id === currentUser?._id && isAdmin) {
      return true; // User can delete themselves
    }
    return false;
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Users {isSuperAdmin && <span className="text-sm text-gray-500">(Super Admin View)</span>}
          </h3>
          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingUser ? 'Edit User' : 'Add New User'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      className="mt-1"
                    />
                  </div>
                  {!editingUser && (
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        required
                        className="mt-1"
                        minLength={6}
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select 
                      value={formData.role} 
                      onValueChange={(value: 'user' | 'admin') => setFormData(prev => ({ ...prev, role: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        {isSuperAdmin && <SelectItem value="admin">Admin</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">
                    {editingUser ? 'Update User' : 'Create User'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users by name, email, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Address</TableHead>
              {isAdmin && <TableHead>Role</TableHead>}
              {isAdmin && <TableHead>Status</TableHead>}
              {isAdmin && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user._id}>
                <TableCell>
                  {user.name}
                  {user.isSuperAdmin && (
                    <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Super Admin
                    </span>
                  )}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.address}</TableCell>
                {isAdmin && (
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </TableCell>
                )}
                {isAdmin && (
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.isApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </TableCell>
                )}
                {isAdmin && (
                  <TableCell>
                    <div className="flex space-x-2">
                      {canEditUser(user) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canDeleteUser(user) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(user)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserManagement;