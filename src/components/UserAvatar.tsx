import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuItem } from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { User, Settings, LogOut, Trash2 } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DeleteAccountDialog } from './DeleteAccountDialog';

const UserAvatar = () => {
    const { user, logout, deleteAccount } = useUser();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteAccount();
            if (result.success) {
                toast.success('Account deleted successfully');
                router.push('/login');
            } else 
                toast.error('Failed to delete account', {
                    description: result.error || 'Please try again'
                });
            
        } catch (error) {
            console.error('Error deleting account:', error);
            toast.error('Failed to delete account', {
                description: 'An unexpected error occurred'
            });
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Avatar className="h-16 w-16 cursor-pointer hover:ring-4 hover:ring-blue-100 transition-all duration-200">
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xl font-semibold hover:bg-blue-200 transition-colors">
                            {user?.firstName?.charAt(0) || 'U'}{user?.lastName?.charAt(0) || ''}
                        </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                            <p className="font-medium text-sm">{user?.firstName} {user?.lastName}</p>
                            <p className="text-xs text-muted-foreground">@{user?.username}</p>
                        </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                        onClick={() => setIsDeleteDialogOpen(true)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete Account</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        className="cursor-pointer text-gray-600 focus:text-gray-600 focus:bg-gray-50"
                        onClick={logout}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            
            <DeleteAccountDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteAccount}
                isDeleting={isDeleting}
            />
        </>
    );
};

export default UserAvatar;
