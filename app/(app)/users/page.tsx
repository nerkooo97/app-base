'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getAllUsers } from '@/lib/queries/users';
import { getAllRoles } from '@/lib/queries/roles';
import { updateUserRole, createNewUser } from './actions';
import { useToast } from '@/components/ui/toast-provider';

// Components
import UsersHeader from '@/components/users/users-header';
import UsersTable from '@/components/users/users-table';
import CreateUserSlideOver from '@/components/users/create-user-slideover';
import EditRoleModal from '@/components/users/edit-role-modal';
import ResetPasswordModal from '@/components/users/reset-password-modal';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filter Logic State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Visibility States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
    const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);

    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const supabase = createClient();
    const { showToast } = useToast();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [usersData, rolesData] = await Promise.all([
                getAllUsers(supabase),
                getAllRoles(supabase)
            ]);

            setUsers(usersData);
            setRoles(rolesData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Computed filtered users
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.user_id?.toLowerCase().includes(searchQuery.toLowerCase());

            // Note: Since we don't have a 'status' field in DB yet, all are 'active' for now
            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'active'); // All current users are active

            return matchesSearch && matchesStatus;
        });
    }, [users, searchQuery, statusFilter]);

    const handleEditClick = (user: any) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleResetPasswordClick = (user: any) => {
        setSelectedUser(user);
        setIsResetPasswordModalOpen(true);
    };

    const handleCreateUser = async (data: { email: string, fullName: string, roleId: number }) => {
        setIsUpdating(true);
        const result = await createNewUser(data.email, data.fullName, data.roleId);
        if (result.success) {
            await fetchData();
            setIsSlideOverOpen(false);
            showToast('success', 'Korisnik uspješno kreiran!');
        } else {
            showToast('error', 'Greška pri kreiranju korisnika: ' + result.error);
        }
        setIsUpdating(false);
    };

    const handleSaveRole = async (userId: string, roleId: number) => {
        setIsUpdating(true);
        const result = await updateUserRole(userId, roleId);
        if (result.success) {
            await fetchData();
            setIsEditModalOpen(false);
            showToast('success', 'Uloga uspješno izmijenjena!');
        } else {
            showToast('error', 'Greška pri izmjeni uloge: ' + result.error);
        }
        setIsUpdating(false);
    };

    if (isLoading && users.length === 0) {
        return (
            <div className="p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                <p className="text-gray-400 font-medium text-xs">Učitavanje korisnika...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <UsersHeader onAddUser={() => setIsSlideOverOpen(true)} />

            <UsersTable
                users={filteredUsers}
                onEditUser={handleEditClick}
                onResetPassword={handleResetPasswordClick}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
            />

            <CreateUserSlideOver
                isOpen={isSlideOverOpen}
                onClose={() => setIsSlideOverOpen(false)}
                roles={roles}
                onCreate={handleCreateUser}
                isUpdating={isUpdating}
            />

            <EditRoleModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={selectedUser}
                roles={roles}
                onSave={handleSaveRole}
                isUpdating={isUpdating}
            />

            <ResetPasswordModal
                isOpen={isResetPasswordModalOpen}
                onClose={() => setIsResetPasswordModalOpen(false)}
                user={selectedUser}
            />
        </div>
    );
}
