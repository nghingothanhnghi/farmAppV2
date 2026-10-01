// src/components/HydroponicSystemPage/components/GrowthPlanList.tsx
import React, { useMemo, useState } from "react";
import { IconPlus, IconStar, IconStarFilled, IconMoodEmpty, IconAlertCircle, IconTimeline, IconCopy } from "@tabler/icons-react";
import type { GrowthPlan } from "../../../../models/interfaces/GrowthPlan";
import {
  useGrowthPlansByPlant,
  useCreateGrowthPlan,
  useUpdateGrowthPlan,
  useDeleteGrowthPlan,
  GrowthPlanInUseError,
} from "../../../../hooks/useGrowthPlans";
import { useTranslation } from 'react-i18next';
import { useAlert } from "../../../../contexts/alertContext";
import DataGrid from "../../../common/dataGrid/dataGrid";
import ActionButtons from "../../../common/dataGrid/actionButton";
import LinearProgress from "../../../common/LinearProgress";
import EmptyState from "../../../common/EmptyState";
import Button from "../../../common/Button";
import Badge from "../../../common/Badge";
import Modal from "../../../common/Modal";
import GrowthPlanFormModal, { type GrowthPlanFormValues } from "./GrowthPlanFormModal";
import StageRecipeWizardModal from "./StageRecipeWizardModal";
import { useDuplicateGrowthPlan } from "../../../../hooks/useGrowthPlans";
import { parseApiErrors } from "../../../../utils/errorUtils";

type Props = {
  plantId: number | null | undefined;
};

const GrowthPlanList: React.FC<Props> = ({ plantId }) => {
  const { t } = useTranslation();
  const { setAlert } = useAlert();
  const { plans, loading } = useGrowthPlansByPlant(plantId);
  const { createGrowthPlan } = useCreateGrowthPlan();
  const { updateGrowthPlan } = useUpdateGrowthPlan();
  const { deleteGrowthPlan } = useDeleteGrowthPlan();
  const { duplicateGrowthPlan } = useDuplicateGrowthPlan();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<GrowthPlan | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState<GrowthPlan | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ✅ plan whose stages are being edited in the wizard
  const [stagesPlan, setStagesPlan] = useState<GrowthPlan | null>(null);

  const handleDuplicate = async (plan: GrowthPlan) => {
    try {
      const copy = await duplicateGrowthPlan(plan.id); // server names it "<name> (copy)"
      setAlert({ type: "success", message: `Created "${copy.name}".` });
    } catch (err) {
      setAlert({ type: "error", message: parseApiErrors(err).message });
    }
  };

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
        message: parseApiErrors(err).message,
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
        message: parseApiErrors(err).message,
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
      {
        headerName: t("dataGrid.headerName.plan_name"),
        field: "name",
        flex: 1,
        cellRenderer: ({ data }: { data: GrowthPlan }) => (
          <div className="flex items-center gap-2 h-full">
            <span>{data.name}</span>
            {data.is_default && (
              <Badge label="Default" variant="success" />
            )}
          </div>
        ),
      },
      {
        headerName: t("dataGrid.headerName.description"),
        field: "description",
        flex: 1.5,
        filter: false,
        valueFormatter: (p: any) => p.value || "-",
      },
      {
        headerName: t("dataGrid.headerName.used_by"),
        field: "batch_count",
        width: 120,
        filter: false,
        valueFormatter: (p: any) => `${p.value ?? 0} ${t("dataGrid.headerName.batch")}`,
      },
      {
        headerName: "",
        field: "actions",
        width: 160,
        filter: false,
        sortable: false,
        resizable: false,
        pinned: "right",
        cellRenderer: ({ data }: { data: GrowthPlan }) => {
          const inUse = (data.batch_count ?? 0) > 0;
          return (
            <div className="flex items-center justify-center gap-2 h-full">
              {/* ✅ NEW: edit this plan's stages + recipes */}
              <Button
                icon={<IconTimeline size={16} stroke={1.5} />}
                iconOnly
                variant="secondary"
                label="Edit stages"
                size="xs"
                rounded="full"
                className="bg-transparent"
                onClick={() => setStagesPlan(data)}
              />
              <Button icon={<IconCopy size={16} stroke={1.5} />} iconOnly variant="secondary"
                label="Duplicate plan" size="xs" rounded="full" className="bg-transparent"
                onClick={() => handleDuplicate(data)} />
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
                deleteLabel={inUse ? `Used by ${data.batch_count} batch(es), cannot delete` : "Delete"}
                disableDelete={inUse}
              />
            </div>
          );
        },
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
        <EmptyState
          icon={<IconMoodEmpty size={48} />}
          message="This plant has no growth plans yet."
        />
      ) : (
        <DataGrid
          rowData={plans}
          columnDefs={columnDefs}
          pagination paginationPageSize={10}
          height="320px" />
      )}

      <GrowthPlanFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        mode={formMode}
        initialData={editing}
        onSubmit={handleFormSubmit}
      />

      {/* ✅ NEW: stage wizard opened from a plan row (no batch / device needed) */}
      <StageRecipeWizardModal
        isOpen={!!stagesPlan}
        plantId={stagesPlan?.plant_id ?? plantId ?? null}
        planId={stagesPlan?.id ?? null}
        zoneId={null}
        onClose={() => setStagesPlan(null)}
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
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Plans that are still used by batches cannot be deleted.
            </p>
          </div>
        }
        actions={
          <div className="flex gap-4">
            <Button
              label={deleting ? "Deleting..." : t("btn.yes_delete")}
              variant="danger"
              onClick={handleConfirmDelete}
              className="min-w-[150px]"
              rounded="lg"
              disabled={deleting}
            />
            <Button
              label={t("btn.cancel")}
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