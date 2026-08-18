import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { getAllUsers, deleteUser } from '../../services/userService';
import { useAlert } from '../../contexts/alertContext';
import { toggleRoleActive, assignRoleToUser, getAllRoles, removeRoleFromUser } from '../../services/roleService';
import type { User } from '../../models/interfaces/User';
import type { Role } from '../../models/interfaces/Role';
import useHasAnyRole from '../../hooks/useHasAnyRole';
import ModeToggle from '../common/ModeToggle';
import PageTitle from '../common/PageTitle';
import LinearProgress from '../common/LinearProgress';
import DataGrid from '../common/dataGrid/dataGrid';
import ActionButtons from '../common/dataGrid/actionButton';
import Button from '../common/Button';
import DropdownButton from '../common/DropdownButton';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';
import UserPermissionList from './components/UserPermissionList';
import { IconMinus, IconAlertCircle } from '@tabler/icons-react';

const UserManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAlert } = useAlert();
  const isRoles = useHasAnyRole(['admin', 'super_admin']);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [deleteMode, setDeleteMode] = useState(false); // distinguish between remove role & delete user


  const [roles, setRoles] = useState<Role[]>([]);

  const handleToggle = useCallback(async (roleId: number) => {
    try {
      const updatedRole = await toggleRoleActive(roleId);
      setUsers((prevUsers) =>
        prevUsers.map((user) => ({
          ...user,
          roles: user.roles?.map((role) =>
            role.id === roleId ? { ...role, is_active: updatedRole.is_active } : role
          ),
        }))
      );
    } catch (err: any) {
      console.error('Failed to toggle role:', err);

      // Try to extract backend error message
      const message =
        err?.response?.data?.detail || // FastAPI "detail" message
        err?.message ||                // generic JS error
        'Failed to toggle role status. Please try again.';

      setAlert({
        type: 'error',
        message,
      });
    }
  }, [setAlert]);

  const handleAssignRole = async (userId: number, roleId: number) => {
    try {
      await assignRoleToUser({ userId, roleId });

      const assignedRole = roles.find((r) => r.id === roleId);
      if (!assignedRole) return;

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? {
              ...user,
              roles: user.roles.some((r) => r.id === roleId)
                ? user.roles // already has this role
                : [...user.roles, assignedRole], // add new role
            }
            : user
        )
      );
      setAlert({
        message: `Role "${assignedRole.display_name}" assigned successfully.`,
        type: 'success',
      });
    } catch (err) {
      console.error('Failed to assign role:', err);
      setAlert({
        message: 'Failed to assign role. Please try again.',
        type: 'error',
      });
    }
  };

  const handleConfirmRemove = async () => {
    if (!selectedUser) return;

    if (deleteMode) {
      // Confirm delete user
      try {
        await deleteUser(selectedUser.id);
        setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));

        setAlert({
          message: `User "${selectedUser.username}" deleted successfully.`,
          type: 'success',
        });
      } catch (err) {
        console.error('Failed to delete user:', err);
        setAlert({
          message: 'Failed to delete user. Please try again.',
          type: 'error',
        });
      }
    } else if (selectedRole) {
      // Confirm remove role
      try {
        await removeRoleFromUser(selectedUser.id, selectedRole.id);
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === selectedUser.id
              ? {
                ...user,
                roles: user.roles.filter((r) => r.id !== selectedRole.id),
              }
              : user
          )
        );

        setAlert({
          message: `Role "${selectedRole.display_name}" removed successfully.`,
          type: 'success',
        });
      } catch (err) {
        console.error('Failed to remove role:', err);
        setAlert({
          message: 'Failed to remove role. Please try again.',
          type: 'error',
        });
      }
    }

    // Cleanup
    setConfirmModalOpen(false);
    setSelectedUser(null);
    setSelectedRole(null);
    setDeleteMode(false);
  };

  const columnDefs = useMemo(() => [
    { headerName: 'ID', field: 'id', width: 80, resizable: false, filter: false },
    {
      headerName: '',
      field: 'image_url',
      width: 30,
      resizable: false,
      filter: false,
      cellStyle: { display: "flex", justifyContent: "center", alignItems: "center", padding: 0 },
      cellRenderer: ({ data }: any) => (
        <Avatar
          imageUrl={data?.image_url}   // ✅ assuming your User model has `imageUrl` (adjust if different)
          alt={data?.username}
          size={24}                   // slightly smaller for table display
          rounded="full"
        />
      ),
    },
    { headerName: 'Username', field: 'username', width: 150, resizable: false, filter: false, },
    { headerName: 'Email', field: 'email', flex: 1, resizable: false, filter: false },
    {
      headerName: 'Roles',
      field: 'roles',
      filter: false,
      resizable: false,
      pinned: "right",
      width: 230, // allow it to grow to fit
      cellRenderer: ({ data }: any) => {
        if (!data?.roles?.length) return <Badge label="No roles" variant="secondary" />;
        return data.roles.map((role: Role) => (
          <div key={role.id} className="flex items-center gap-2">
            <ModeToggle
              isActive={role.is_active ?? false}
              onToggle={() => handleToggle(role.id)}
              currentLabel={role.display_name}
              nextLabel={role.is_active ? 'Deactivate' : 'Activate'}
              disabled={!isRoles}
            />
            <Button
              onClick={() => {
                setSelectedUser(data);
                setSelectedRole(role); // ✅ use the scoped 'role' from the current map iteration
                setConfirmModalOpen(true);
              }}
              variant="link"
              className='text-red-500'
              icon={<IconMinus size={18} />}
              iconOnly
              disabled={!isRoles}
            />
          </div>
        ));
      },
      autoHeight: true,
    },
    {
      headerName: 'Permissions',
      field: 'permissions',
      filter: false,
      resizable: false,
      pinned: 'right',
      width: 250,
      autoHeight: true,
      cellRenderer: ({ data }: any) => {
        if (!data?.roles?.length) {
          return <Badge label="No permissions" variant="secondary" />;
        }

        return (
          <div className="flex flex-col gap-2">
            {data.roles.map((role: Role) => (
              <UserPermissionList
                key={role.id}
                permissions={role.permissions || []}
                isActive={role.is_active}
              />
            ))}
          </div>
        );
      },
    },
    {
      headerName: 'Assign Role',
      field: 'assignRole',
      filter: false,
      sortable: false,
      resizable: false,
      pinned: "right",
      width: 200,
      cellRenderer: ({ data }: any) => {
        const dropdownItems = roles.map((role) => ({
          label: role.display_name,
          value: String(role.id),
        }));

        return (
          <div className="flex flex-col gap-2">
            <DropdownButton
              label="Assign Role"
              items={dropdownItems}
              disabled={!isRoles}
              onSelect={(item) => handleAssignRole(data.id, parseInt(item.value))}
              variant="secondary"
              size="xs"
            />
          </div>

        );
      },
    },
    {
      headerName: '',
      field: 'actions',
      width: 100,
      filter: false,
      sortable: false,
      resizable: false,
      pinned: "right",
      cellStyle: { textAlign: "center" },
      cellRenderer: ({ data }: any) => (
        <ActionButtons
          row={data}
          onEdit={(row) => navigate(`/users/${row.id}/edit`)}
          onDelete={(row) => {
            setSelectedUser(row);
            setDeleteMode(true); // switch to delete user mode
            setConfirmModalOpen(true);
          }}
        />
      ),
    },
  ], [isRoles, roles, handleToggle]);



  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getAllUsers();
        setUsers(res);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await getAllRoles();
        setRoles(res);
      } catch (err) {
        console.error('Failed to fetch roles:', err);
      }
    };
    fetchRoles();
  }, []);

  if (loading) return <LinearProgress
    position='absolute'
    thickness="h-1"
    duration={3000}
  />;

  if (!isRoles) {
    return <div className="text-red-500 font-semibold text-center mt-10">Unauthorized: You do not have access to view this page.</div>;
  }

  return (
    <div className="">
      <PageTitle
        title="User Management"
        subtitle="Manage user accounts, assign roles, control role status, and review permissions to ensure each user has the appropriate level of access.  
"
      />
      <DataGrid
        rowData={users}
        columnDefs={columnDefs}
        pagination
        paginationPageSize={10}
        height="500px"
      />
      <Modal
        showCloseButton={false}
        size='xsmall'
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setSelectedUser(null);
          setSelectedRole(null);
          setDeleteMode(false);
        }}
        content={
          <div className="text-sm px-10 pt-6 pb-10 text-center">
            <IconAlertCircle size={64} className="text-red-500 mb-4 mx-auto" />
            {deleteMode ? (
              <>
                Are you sure you want to delete user{' '}
                <strong>{selectedUser?.username}</strong>?
              </>
            ) : (
              <>
                Are you sure you want to remove role{' '}
                <strong>{selectedRole?.display_name}</strong> from user{' '}
                <strong>{selectedUser?.username}</strong>?
              </>
            )}
          </div>
        }
        actions={
          <div className="flex gap-4">
            <Button
              label='Yes, Remove'
              variant="danger"
              onClick={handleConfirmRemove}
              className='min-w-[150px]'
              rounded='lg'
            />
            <Button
              label="Cancel"
              variant="secondary"
              onClick={() => setConfirmModalOpen(false)}
              className='min-w-[150px]'
              rounded='lg'
            />
          </div>
        }
      />
    </div>
  );
};

export default UserManagementPage;
