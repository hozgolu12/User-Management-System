import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Edit, Trash2 } from 'lucide-react';

const UserProfile: React.FC = () => {
  const { user, token, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    address: user?.address || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await apiService.updateOwnProfile(formData, token!);
      const updatedUser = await apiService.getUser(user!._id, token!);
      setFormData({
        name: updatedUser.name,
        address: updatedUser.address
    });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    
    try {
      await apiService.deleteOwnAccount(token!);
      
      toast({
        title: "Account Deleted",
        description: "Your account has been deleted successfully",
      });
      logout();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          My Profile
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteAccount}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                required
              />
            </div>
            <div className="flex space-x-2">
              <Button type="submit" size="sm">Save</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-2">
            <div>
              <Label>Name</Label>
              <p className="text-sm text-gray-600">{user?.name}</p>
            </div>
            <div>
              <Label>Email</Label>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
            <div>
              <Label>Address</Label>
              <p className="text-sm text-gray-600">{user?.address}</p>
            </div>
            <div>
              <Label>Role</Label>
              <span className={`px-2 py-1 rounded-full text-xs ${
                user?.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
              }`}>
                {user?.role}
                {user?.isSuperAdmin && ' (Super Admin)'}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserProfile;