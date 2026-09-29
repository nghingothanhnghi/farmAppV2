// src/components/HydroponicSystemPage/components/GrowthPlanList.tsx
import React, { useMemo, useState } from "react";
import { IconPlus, IconStar, IconStarFilled, IconMoodEmpty, IconAlertCircle } from "@tabler/icons-react";
import type { GrowthPlan } from "../../../../models/interfaces/GrowthPlan";
import {
  useGrowthPlansByPlant,
  useCreateGrowthPlan,
  useUpdateGrowthPlan,
  useDeleteGrowthPlan,
  GrowthPlanInUseError,
} from "../../../../hooks/useGrowthPlans";
import { useAlert } from "../../../../contexts/alertContext";
import DataGrid from "../../../common/dataGrid/dataGrid";
import ActionButtons from "../../../common/dataGrid/actionButton";
import LinearProgress from "../../../common/LinearProgress";
import EmptyState from "../../../common/EmptyState";
import Button from "../../../common/Button";
import Badge from "../../../common/Badge";
import Modal from "../../../common/Modal";
import GrowthPlanFormModal, { type GrowthPlanFormValues } from "./GrowthPlanFormModal";

type Props = {
  plantId: number | null | undefined;
};

const GrowthPlanList: React.FC<Props> = ({ plantId }) => {
  const { setAlert } = useAlert();
  const { plans, loading } = useGrowthPlansByPlant(plantId);
  const { createGrowthPlan } = useCreateGrowthPlan();
  const { updateGrowthPlan } = useUpdateGrowthPlan();
  const { deleteGrowthPlan } = useDeleteGrowthPlan();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<GrowthPlan | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState<GrowthPlan | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleFormSubmit = async (values: GrowthPlanFormValues) => {
    if (!plantId) return;
    try {
      if (formMode === "edit" && editing) {
        await updateGrowthPlan(editing.id, values);
        setAlert({ type: "success", message: `Plan "${values.name}" updated.` });
      } else {
        await createGrowthPlan({
          plant_id: plantId,
          name: values.name,
          description: values.description || undefined,
          is_default: values.is_default,
        });
        setAlert({ type: "success", message: `Plan "${values.name}" created.` });
      }
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err?.response?.data?.detail ?? "Failed to save growth plan.",
      });
      throw err; // keep the modal open
    }
  };

  const handleSetDefault = async (plan: GrowthPlan) => {
    try {
      // Backend clears the previous default; list refetches after success.
      await updateGrowthPlan(plan.id, { is_default: true });
      setAlert({ type: "success", message: `"${plan.name}" is now the default plan.` });
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err?.response?.data?.detail ?? "Failed to set default plan.",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!selected) return;
    try {
      setDeleting(true);
      await deleteGrowthPlan(selected.id, selected.plant_id);
      setAlert({ type: "success", message: `Plan "${selected.name}" deleted.` });
    } catch (err: any) {
      if (err instanceof GrowthPlanInUseError) {
        // distinct message for the 409 case
        setAlert({ type: "warning", message: err.message });
      } else {
        setAlert({
          type: "error",
          message: err?.response?.data?.detail ?? "Failed to delete growth plan.",
        });
      }
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setSelected(null);
    }
  };

  const columnDefs = useMemo(
    () => [
      { headerName: "Name", field: "name", flex: 1 },
      {
        headerName: "Description",
        field: "description",
        flex: 1.5,
        filter: false,
        valueFormatter: (p: any) => p.value || "-",
      },
      {
        headerName: "",
        field: "is_default",
        width: 110,
        filter: false,
        sortable: false,
        resizable: false,
        cellRenderer: ({ data }: { data: GrowthPlan }) =>
          data.is_default ? (
            <div className="flex items-center h-full">
              <Badge label="Default" variant="success" />
            </div>
          ) : null,
      },
      {
        headerName: "",
        field: "actions",
        width: 150,
        filter: false,
        sortable: false,
        resizable: false,
        pinned: "right",
        cellRenderer: ({ data }: { data: GrowthPlan }) => (
          <div className="flex items-center justify-center h-full">
            <Button
              icon={data.is_default ? <IconStarFilled size={16} className="text-amber-500" /> : <IconStar size={16} stroke={1.5} />}
              iconOnly
              variant="secondary"
              label={data.is_default ? "Default plan" : "Set as default"}
              size="xs"
              rounded="full"
              className="bg-transparent"
              disabled={data.is_default}
              onClick={() => handleSetDefault(data)}
            />
            <ActionButtons
              row={data}
              onEdit={() => {
                setEditing(data);
                setFormMode("edit");
                setFormOpen(true);
              }}
              onDelete={() => {
                setSelected(data);
                setConfirmOpen(true);
              }}
            />
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateGrowthPlan]
  );

  if (!plantId) {
    return <EmptyState icon={<IconMoodEmpty size={48} />} message="Select a plant to manage its growth plans." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          type="button"
          label="New Plan"
          variant="secondary"
          icon={<IconPlus size={16} className="text-gray-500" />}
          iconPosition="left"
          rounded="lg"
          onClick={() => {
            setEditing(null);
            setFormMode("create");
            setFormOpen(true);
          }}
        />
      </div>

      {loading && plans.length === 0 ? (
        <LinearProgress />
      ) : plans.length === 0 ? (
        <EmptyState icon={<IconMoodEmpty size={48} />} message="This plant has no growth plans yet." />
      ) : (
        <DataGrid rowData={plans} columnDefs={columnDefs} pagination paginationPageSize={10} height="320px" />
      )}

      <GrowthPlanFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        mode={formMode}
        initialData={editing}
        onSubmit={handleFormSubmit}
      />

      <Modal
        showCloseButton={false}
        size="xsmall"
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setSelected(null);
        }}
        content={
          <div className="text-sm px-10 pt-6 pb-10 text-center">
            <IconAlertCircle size={64} className="text-red-500 mb-4 mx-auto" />
            Are you sure you want to delete plan <strong>{selected?.name}</strong>?
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Plans that are still used by batches cannot be deleted.
            </p>
          </div>
        }
        actions={
          <div className="flex gap-4">
            <Button
              label={deleting ? "Deleting..." : "Yes, Delete"}
              variant="danger"
              onClick={handleConfirmDelete}
              className="min-w-[150px]"
              rounded="lg"
              disabled={deleting}
            />
            <Button
              label="Cancel"
              variant="secondary"
              onClick={() => setConfirmOpen(false)}
              className="min-w-[150px]"
              rounded="lg"
            />
          </div>
        }
      />
    </div>
  );
};

export default GrowthPlanList;