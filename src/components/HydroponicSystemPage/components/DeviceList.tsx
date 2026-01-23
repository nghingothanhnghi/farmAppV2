import React, { useState, useMemo, useEffect, useRef } from "react";
import { IconAlertCircle, IconMoodEmpty } from '@tabler/icons-react';
import { useHydroDevices } from "../../../hooks/useHydroDevices";
import { useAlert } from "../../../contexts/alertContext";
import { STUCK_TIMEOUT } from "../../../config/constants";
import type { HydroDevice } from "../../../models/interfaces/HydroSystem";
import DataGrid from '../../common/dataGrid/dataGrid';
import ActionButtons from '../../common/dataGrid/actionButton';
import Modal from '../../common/Modal';
import Button from "../../common/Button";
import ModeToggle from "../../common/ModeToggle";
import LinearProgress from '../../common/LinearProgress';
import EmptyState from '../../common/EmptyState';

type Props = {
  onSelect?: (device: HydroDevice) => void;
  showStatus?: boolean;
};

const DeviceList: React.FC<Props> = ({ onSelect, showStatus = true }) => {
  const { setAlert } = useAlert();
  // -----------------------------
  // ⭐ Use hook instead of service
  // -----------------------------
  const {
    devices,
    loading,
    fetchDevices,
    deleteDevice,
    toggleActive,
  } = useHydroDevices();

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<HydroDevice | null>(null);

  
  // 🆕 onboarding states
  const [waitingForNewDevice, setWaitingForNewDevice] =
    useState(false);
  const [isStuck, setIsStuck] = useState(false);

  const prevDeviceCount = useRef(0);
  const stuckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

const hasEverHadDevices = useRef(false);

  // --------------------------------
  // Track device history
  // --------------------------------
  useEffect(() => {
    if (devices.length > 0) {
      hasEverHadDevices.current = true;
    }
  }, [devices.length]);
  // --------------------------------
  // 🧠 Detect device ready → toast
  // --------------------------------
  useEffect(() => {
    if (
      waitingForNewDevice &&
      devices.length > prevDeviceCount.current
    ) {
      setAlert({
        type: "success",
        message: "🎉 Your device is ready and connected!",
      });

      setWaitingForNewDevice(false);
      setIsStuck(false);

      if (stuckTimer.current) {
        clearTimeout(stuckTimer.current);
        stuckTimer.current = null;
      }
    }

    prevDeviceCount.current = devices.length;
  }, [devices.length, waitingForNewDevice, setAlert]);

  // --------------------------------
  // ⏱ Detect stuck onboarding
  // --------------------------------
  useEffect(() => {
    if (waitingForNewDevice) {
      stuckTimer.current = setTimeout(() => {
        setIsStuck(true);
      }, STUCK_TIMEOUT);
    }

    return () => {
      if (stuckTimer.current) {
        clearTimeout(stuckTimer.current);
        stuckTimer.current = null;
      }
    };
  }, [waitingForNewDevice]);

  // --------------------------------
  // Trigger onboarding modal (FIXED)
  // --------------------------------
  useEffect(() => {
    if (
      loading &&
      devices.length === 0 &&
      hasEverHadDevices.current // ✅ KEY FIX
    ) {
      setWaitingForNewDevice(true);
    }
  }, [loading, devices.length]);



  // -----------------------------
  // Delete Device (via hook)
  // -----------------------------
  const handleRequestDelete = (device: HydroDevice) => {
    setSelectedDevice(device);
    setConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDevice) return;

    try {
      await deleteDevice(selectedDevice.id);

      await fetchDevices(); // 🔁 refresh after deletion

      setAlert({
        message: `Device "${selectedDevice?.name}" deleted successfully.`,
        type: "success",
      });
    } catch (err) {
      console.error("Delete error:", err);
      setAlert({
        message: "Failed to delete device. Please try again.",
        type: "error",
      });
    } finally {
      setConfirmModalOpen(false);
      setSelectedDevice(null);
    }
  };

  const columnDefs = useMemo(() => {
    return [
      { headerName: 'ID', field: 'id', width: 80, filter: false, cellStyle: { textAlign: "center" } },
      { headerName: 'Name', field: 'name', flex: 1, filter: false },
      { headerName: 'Device ID', field: 'device_id', flex: 1, filter: false },
      { headerName: 'Type', field: 'type', flex: 1, filter: false, resizable: false },
      showStatus && {
        headerName: 'Status',
        field: 'is_active',
        flex: 1,
        filter: false,
        resizable: false,
        cellStyle: { textAlign: "center", display: 'flex', alignItems: 'center', gap: '8px' },
        cellRenderer: ({ data }: any) => (
          <ModeToggle
            isActive={data.is_active}
            onToggle={() => toggleActive(data)}
            size="small"
            currentLabel="Inactive"
            nextLabel="Active"
          />
        ),

      },
      onSelect && {
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
            onEdit={() => onSelect(data)}
            onDelete={() => handleRequestDelete(data)}
          />
        ),
      },
    ].filter(Boolean); // remove falsey values like 'undefined' if showStatus or onSelect is false
  }, [showStatus, onSelect]);

  //   if (loading) {
  //     return (
  //       <LinearProgress
  //         position="relative"
  //         thickness="h-1"
  //         duration={1000}
  //       />
  //     );
  //   }

  //   useEffect(() => {
  //   if (loading && devices.length === 0) {
  //     setWaitingForNewDevice(true);
  //   } else {
  //     setWaitingForNewDevice(false);
  //   }
  // }, [loading, devices.length]);


  //   if (!devices.length) {
  //     return <EmptyState
  //       icon={<IconMoodEmpty size={48} />}
  //       message="No devices found."
  //     />
  //   }


  // --------------------------------
  // UI states
  // --------------------------------
  if (loading && !waitingForNewDevice) {
    return <LinearProgress />;
  }

  if (!devices.length && !waitingForNewDevice) {
    return (
      <EmptyState
        icon={<IconMoodEmpty size={48} />}
        message="No devices found."
      />
    );
  }

  return (
    <>
      <DataGrid
        rowData={devices}
        columnDefs={columnDefs}
        pagination
        paginationPageSize={10}
        height="500px"
      />
      {/* 🧠 Device onboarding modal */}
      <Modal
        isOpen={waitingForNewDevice}
        onClose={() => setWaitingForNewDevice(false)}
        showCloseButton={false}
        size="small"
        content={
          !isStuck ? (
            <div className="flex flex-col items-center text-center px-6 py-8 space-y-4">
              <LinearProgress />
              <div className="text-lg font-semibold">
                Setting up your device…
              </div>
              <p className="text-sm text-gray-500">
                Please wait while we connect your device.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center px-6 py-8 space-y-4">
              <IconAlertCircle
                size={48}
                className="text-yellow-500"
              />
              <div className="text-lg font-semibold">
                Taking longer than expected
              </div>
              <p className="text-sm text-gray-500">
                We couldn’t finish setting up your
                device.
              </p>
              <div className="flex gap-3 mt-4">
                <Button
                  label="Retry"
                  onClick={() => {
                    setIsStuck(false);
                    fetchDevices();
                  }}
                />
                <Button
                  label="Troubleshoot"
                  variant="secondary"
                  onClick={() =>
                    setAlert({
                      type: "info",
                      message:
                        "Check power, Wi-Fi, and try restarting the device.",
                    })
                  }
                />
              </div>
            </div>
          )
        }
      />
      <Modal
        showCloseButton={false}
        size="xsmall"
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setSelectedDevice(null);
        }}
        content={
          <div className="text-sm px-10 pt-6 pb-10 text-center">
            <IconAlertCircle size={64} className="text-red-500 mb-4 mx-auto" />
            Are you sure you want to delete device{" "}
            <strong>{selectedDevice?.name}</strong>?
          </div>
        }
        actions={
          <div className="flex gap-4">
            <Button
              label="Yes, Delete"
              variant="danger"
              onClick={handleConfirmDelete}
              className="min-w-[150px]"
            />
            <Button
              label="Cancel"
              variant="secondary"
              onClick={() => setConfirmModalOpen(false)}
              className="min-w-[150px]"
            />
          </div>
        }
      />
    </>
  );
};

export default DeviceList;
