'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getAllRoles, getAllPermissions } from '@/lib/queries/roles';
import { PERMISSIONS } from '@/config/permissions';
import { toggleRolePermission, createRole, createPermission, updateRole, deleteRole } from './actions';
import { useToast } from '@/components/ui/toast-provider';

// Components
import RolesHeader from '@/components/roles/roles-header';
import RoleCard from '@/components/roles/role-card';
import PermissionsModal from '@/components/roles/permissions-modal';
import CreateRoleModal from '@/components/roles/create-role-modal';
import EditRoleModal from '@/components/roles/edit-role-modal';
import DeleteRoleModal from '@/components/roles/delete-role-modal';
import CreatePermissionModal from '@/components/roles/create-permission-modal';

export default function RolesPage() {
    const [roles, setRoles] = useState<any[]>([]);
    const [allPermissions, setAllPermissions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal Visibility State
    const [isPermModalOpen, setIsPermModalOpen] = useState(false);
    const [isNewRoleModalOpen, setIsNewRoleModalOpen] = useState(false);
    const [isNewPermissionModalOpen, setIsNewPermissionModalOpen] = useState(false);

    // Edit/Delete state
    const [editingRole, setEditingRole] = useState<any>(null);
    const [deletingRole, setDeletingRole] = useState<any>(null);

    const [selectedRole, setSelectedRole] = useState<any>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const supabase = createClient();
    const { showToast } = useToast();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [rolesData, dbPerms] = await Promise.all([
                getAllRoles(supabase),
                getAllPermissions(supabase)
            ]);

            setRoles(rolesData);

            const staticPerms = Object.values(PERMISSIONS);
            const combinedPerms = Array.from(new Set([...dbPerms, ...staticPerms]));
            setAllPermissions(combinedPerms);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleManagePermissions = (role: any) => {
        setSelectedRole(role);
        setIsPermModalOpen(true);
    };

    const handleTogglePermission = async (perm: string) => {
        if (!selectedRole) return;

        const isCurrentlyEnabled = selectedRole.role_permissions.some((rp: any) => rp.permission_name === perm);
        setIsUpdating(true);

        const result = await toggleRolePermission(selectedRole.id, perm, !isCurrentlyEnabled);

        if (result.success) {
            const newRolePermissions = isCurrentlyEnabled
                ? selectedRole.role_permissions.filter((rp: any) => rp.permission_name !== perm)
                : [...selectedRole.role_permissions, { permission_name: perm }];

            setSelectedRole({ ...selectedRole, role_permissions: newRolePermissions });
            setRoles(prevRoles => prevRoles.map(r =>
                r.id === selectedRole.id ? { ...r, role_permissions: newRolePermissions } : r
            ));
            showToast('success', `Dozvola ${isCurrentlyEnabled ? 'uklonjena' : 'dodana'}!`);
        } else {
            showToast('error', 'Greška pri izmjeni dozvole: ' + result.error);
        }
        setIsUpdating(false);
    };

    const handleCreateRole = async (data: { name: string, description: string, hierarchy: number }) => {
        setIsUpdating(true);
        const result = await createRole(data.name, data.description, data.hierarchy);
        if (result.success) {
            await fetchData();
            setIsNewRoleModalOpen(false);
            showToast('success', 'Uloga uspješno kreirana!');
        } else {
            showToast('error', 'Greška pri kreiranju uloge: ' + result.error);
        }
        setIsUpdating(false);
    };

    const handleCreatePermission = async (name: string) => {
        setIsUpdating(true);
        const result = await createPermission(name);
        if (result.success) {
            await fetchData();
            setIsNewPermissionModalOpen(false);
            showToast('success', 'Dozvola uspješno kreirana!');
        } else {
            showToast('error', 'Greška pri kreiranju dozvole: ' + result.error);
        }
        setIsUpdating(false);
    };

    const handleUpdateRole = async (id: number, data: { name: string, description: string, hierarchy: number }) => {
        setIsUpdating(true);
        const result = await updateRole(id, data.name, data.description, data.hierarchy);
        if (result.success) {
            await fetchData();
            setEditingRole(null);
            showToast('success', 'Uloga uspješno ažurirana!');
        } else {
            showToast('error', 'Greška pri ažuriranju uloge: ' + result.error);
        }
        setIsUpdating(false);
    };

    const handleDeleteRole = async (roleId: number) => {
        setIsUpdating(true);
        const result = await deleteRole(roleId);
        if (result.success) {
            await fetchData();
            setDeletingRole(null);
            showToast('success', 'Uloga uspješno obrisana!');
        } else {
            showToast('error', 'Greška pri brisanju uloge: ' + result.error);
        }
        setIsUpdating(false);
    };

    if (isLoading && roles.length === 0) {
        return (
            <div className="p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                <p className="text-gray-400 dark:text-gray-500 font-medium text-xs">Učitavanje uloga...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <RolesHeader
                onNewRole={() => setIsNewRoleModalOpen(true)}
                onNewPermission={() => setIsNewPermissionModalOpen(true)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role) => (
                    <RoleCard
                        key={role.id}
                        role={role}
                        onManagePermissions={handleManagePermissions}
                        onEdit={(role) => setEditingRole(role)}
                        onDelete={() => setDeletingRole(role)}
                    />
                ))}
            </div>

            <PermissionsModal
                isOpen={isPermModalOpen}
                onClose={() => setIsPermModalOpen(false)}
                role={selectedRole}
                allPermissions={allPermissions}
                onTogglePermission={handleTogglePermission}
                isUpdating={isUpdating}
            />

            <CreateRoleModal
                isOpen={isNewRoleModalOpen}
                onClose={() => setIsNewRoleModalOpen(false)}
                onCreate={handleCreateRole}
                isUpdating={isUpdating}
            />

            <EditRoleModal
                isOpen={!!editingRole}
                onClose={() => setEditingRole(null)}
                role={editingRole}
                onUpdate={handleUpdateRole}
                isUpdating={isUpdating}
            />

            <DeleteRoleModal
                isOpen={!!deletingRole}
                onClose={() => setDeletingRole(null)}
                role={deletingRole}
                onDelete={handleDeleteRole}
                isUpdating={isUpdating}
            />

            <CreatePermissionModal
                isOpen={isNewPermissionModalOpen}
                onClose={() => setIsNewPermissionModalOpen(false)}
                onCreate={handleCreatePermission}
                isUpdating={isUpdating}
            />
        </div>
    );
}
