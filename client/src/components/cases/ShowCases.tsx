// src/components/cases/ShowCases.tsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../../redux/store";
import ToolbarCases, { DeliveryView } from "./ToolbarCases";
import CreateCase from "./CreateCase";
import CasesCards from "./CasesCards";
import DeliveryModal from "./DeliveryModal";
import EditCaseModal from "./EditCaseModal";
import DeleteCaseModal from "./DeleteCaseModal";
import {
  deleteCase,
  updateCase,
  updateCaseApproval,
  updateCaseStage,
  fetchCases,
} from "../../redux/cases/thunks"; // ← thunks (pas "thunk")

import { fetchMeasurementTypes } from "../../redux/measurementTypes/thunks";
import { ShowPatientApi } from "../../redux/patients/PatientApiCalls";
import { ShowUserApi } from "../../redux/users/UserApiCalls";

import type { Option } from "../../components/common/SearchSelect";

const ShowCases: React.FC = () => {
  const dispatch: any = useDispatch();

  // --- Sélecteurs Redux ---
  const { items, meta } = useSelector((s: State) => (s as any).cases);
  const { patients } = useSelector((s: State) => (s as any).patients);
  const { users } = useSelector((s: State) => (s as any).users);
  const { items: typesItems } = useSelector(
    (s: State) => (s as any).measurementTypes
  );

  // --- State filtres / recherche ---
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(meta?.limit || 10);
  const [delivery, setDelivery] = useState<DeliveryView>("all");
  const [dateFrom, setDateFrom] = useState<string>(""); // YYYY-MM-DD
  const [dateTo, setDateTo] = useState<string>(""); // YYYY-MM-DD

  // --- Selects enchaînés ---
  const [patientOpt, setPatientOpt] = React.useState<Option | null>(null);
  const [doctorOpt, setDoctorOpt] = React.useState<Option | null>(null);

  // --- Modales ---
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any>(null);

  // --- Effet: reset patient quand le docteur change ---
  useEffect(() => {
    setPatientOpt(null);
  }, [doctorOpt?.id]);

  // --- Fetchers locaux pour les selects ---
  const fetchDoctors = React.useCallback(
    async (text: string): Promise<Option[]> => {
      const q = (text || "").trim().toLowerCase();
      const pool = (Array.isArray(users) ? users : []).filter(
        (u: any) => u?.doctor?.isDoctor
      );
      return pool
        .filter((u: any) => {
          const name = (u?.fullName || u?.username || "").toLowerCase();
          return !q || name.includes(q);
        })
        .slice(0, 10)
        .map((u: any) => ({
          id: u.id || u._id,
          label: u.fullName || u.username,
          subLabel: u.username || "",
          meta: u,
        }));
    },
    [users]
  );

  const fetchPatients = React.useCallback(
    async (text: string): Promise<Option[]> => {
      const q = (text || "").trim().toLowerCase();
      const poolAll = Array.isArray(patients) ? patients : [];
      const pool = doctorOpt
        ? poolAll.filter((p: any) => {
            const did = p?.doctor?._id ?? p?.doctor;
            return did === doctorOpt.id;
          })
        : []; // pas de docteur ⇒ pas d’options
      return pool
        .filter(
          (p: any) =>
            !q ||
            (p?.name && String(p.name).toLowerCase().includes(q)) ||
            (p?.phone && String(p.phone).toLowerCase().includes(q))
        )
        .slice(0, 10)
        .map((p: any) => ({
          id: p.id || p._id,
          label: p.name || "(Sans nom)",
          subLabel: p.phone || "",
          meta: p,
        }));
    },
    [patients, doctorOpt]
  );

  // --- Chargements init des listes (pour CreateCase & filtres locaux) ---
  useEffect(() => {
    dispatch(ShowPatientApi({ page: 1, limit: 1000 }));
    dispatch(ShowUserApi({ page: 1, limit: 1000, only: "all" }));
    dispatch(fetchMeasurementTypes({ page: 1, limit: 1000 }));
  }, [dispatch]);

  // --- Requête dossiers (back) : inclure doctorId/patientId ; "received" géré côté UI ---
  useEffect(() => {
    const apiDelivery = delivery === "received" ? "all" : delivery;
    dispatch(
      fetchCases({
        q,
        page: 1,
        limit,
        delivery: apiDelivery as any,
        patientId: patientOpt?.id || undefined,
        doctorId: doctorOpt?.id || undefined,
      })
    );
  }, [q, limit, delivery, patientOpt, doctorOpt, dispatch]);

  const reload = (page = meta?.page || 1) =>
    dispatch(
      fetchCases({
        q,
        page,
        limit,
        delivery: (delivery === "received" ? "all" : delivery) as any,
        patientId: patientOpt?.id || undefined,
        doctorId: doctorOpt?.id || undefined,
      })
    );

  // --- Listes pour Create/Edit Case ---
  const doctors = (users || [])
    .filter((u: any) => u?.doctor?.isDoctor)
    .map((u: any) => ({ _id: u._id, label: u.fullName || u.username }));

  const approvers = (users || []).map((u: any) => ({
    _id: u._id,
    label: u.fullName || u.username,
  }));

  const patientsOptions = (patients || []).map((p: any) => ({
    _id: p._id,
    label: p.name,
    doctor: p?.doctor?._id || p?.doctor || null,
  }));

  const types = (typesItems || []).map((t: any) => ({
    _id: t._id,
    label: t.name,
  }));

  // --- Filtrage client (received + dates + docteur + patient) ---
  const filteredItems = (items || [])
    .filter((it: any) => {
      const status = it?.delivery?.status ?? "pending";
      switch (delivery) {
        case "pending":
          return status === "pending";
        case "scheduled":
          return status === "scheduled";
        case "delivered":
          return status === "delivered";
        case "received":
          return !!it?.caseApproval?.approved;
        case "all":
        default:
          return true;
      }
    })
    .filter((it: any) => {
      if (!dateFrom && !dateTo) return true;
      const created = it?.createdAt ? new Date(it.createdAt) : null;
      if (!created || Number.isNaN(created.getTime())) return false;
      const fromOk = dateFrom
        ? created >= new Date(`${dateFrom}T00:00:00`)
        : true;
      const toOk = dateTo
        ? created <= new Date(`${dateTo}T23:59:59.999`)
        : true;
      return fromOk && toOk;
    })
    .filter((it: any) => {
      if (!doctorOpt) return true;
      const did = it?.doctor?._id ?? it?.doctor;
      return did === doctorOpt.id;
    })
    .filter((it: any) => {
      if (!patientOpt) return true;
      const pid = it?.patient?._id ?? it?.patient;
      return pid === patientOpt.id;
    });

  const clientFiltered =
    !!dateFrom ||
    !!dateTo ||
    delivery === "received" ||
    !!patientOpt ||
    !!doctorOpt;

  // --- Handlers modales ---
  const openDelivery = (row: any) => {
    setSelectedCase(row);
    setDeliveryOpen(true);
  };
  const closeDelivery = () => {
    setDeliveryOpen(false);
    setSelectedCase(null);
  };

  const openEdit = (row: any) => {
    setSelectedCase(row);
    setEditOpen(true);
  };
  const closeEdit = () => {
    setEditOpen(false);
    setSelectedCase(null);
  };

  const openDelete = (row: any) => {
    setSelectedCase(row);
    setDeleteOpen(true);
  };
  const closeDelete = () => {
    setDeleteOpen(false);
    setSelectedCase(null);
  };

  return (
    <div className="p-5 space-y-4">
      <ToolbarCases
        q={q}
        setQ={setQ}
        total={meta?.total || 0}
        page={meta?.page || 1}
        pages={meta?.pages || 1}
        hasPrev={!!meta?.hasPrev}
        hasNext={!!meta?.hasNext}
        goPrev={() => meta?.hasPrev && reload((meta?.page || 1) - 1)}
        goNext={() => meta?.hasNext && reload((meta?.page || 1) + 1)}
        limit={limit}
        onChangeLimit={(n) => setLimit(n)}
        delivery={delivery}
        onChangeDelivery={(v) => setDelivery(v)}
        onAddCase={() => setCreateOpen(true)}
        onRefresh={() => reload(meta?.page || 1)}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onChangeDateFrom={setDateFrom}
        onChangeDateTo={setDateTo}
        clientFiltered={clientFiltered}
        visibleCount={filteredItems.length}
        // Selects enchaînés
        doctorValue={doctorOpt}
        onDoctorChange={setDoctorOpt}
        fetchDoctors={fetchDoctors}
        patientValue={patientOpt}
        onPatientChange={setPatientOpt}
        fetchPatients={fetchPatients}
        patientDisabled={!doctorOpt}
      />

      <CasesCards
        items={filteredItems}
        onEdit={openEdit}
        onDelete={openDelete}
        onOpenDelivery={openDelivery}
        onAdvanceStage={(row: any) => {
          const cur = Number(row?.currentStageOrder || 0);
          const total = Number(row?.stages?.length || 0);
          const id = row?.id ?? row?._id;
          if (!id || total === 0) return;
          if (cur >= total) return;
          const next = Math.min(cur + 1, total);
          dispatch(
            updateCaseStage(id, { toOrder: next, status: "in_progress" })
          );
        }}
        onRewindStage={(row: any) => {
          const cur = Number(row?.currentStageOrder || 0);
          const id = row?.id ?? row?._id;
          if (!id) return;
          if (cur <= 1) return;
          const prev = Math.max(cur - 1, 1);
          dispatch(
            updateCaseStage(id, { toOrder: prev, status: "in_progress" })
          );
        }}
      />

      <CreateCase
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        doctors={doctors}
        patients={patientsOptions}
        types={types}
      />

      <EditCaseModal
        open={editOpen}
        onClose={closeEdit}
        doctors={doctors}
        patients={patientsOptions}
        types={types}
        initial={
          selectedCase
            ? {
                code: selectedCase.code,
                doctor: selectedCase?.doctor?._id || selectedCase?.doctor,
                patient: selectedCase?.patient?._id || selectedCase?.patient,
                type: selectedCase?.type?._id || selectedCase?.type,
                note: selectedCase?.note || "",
              }
            : undefined
        }
        onSubmit={async (patch) => {
          const id = selectedCase?._id ?? selectedCase?.id;
          if (!id) return;
          await dispatch(updateCase(id, patch as any));
          await reload();
        }}
      />

      <DeleteCaseModal
        open={deleteOpen}
        onClose={closeDelete}
        label={selectedCase?.code}
        onConfirm={async () => {
          const id = selectedCase?._id ?? selectedCase?.id;
          if (!id) return;
          await dispatch(deleteCase(id));
          await reload();
        }}
      />

      <DeliveryModal
        open={deliveryOpen}
        onClose={closeDelivery}
        approvers={approvers}
        initial={{ approvedBy: selectedCase?.caseApproval?.by || "" }}
        onSubmit={async ({ approvedBy }) => {
          const id = selectedCase?._id ?? selectedCase?.id;
          if (!id) return;
          const total = Number(selectedCase?.stages?.length ?? 0);
          if (total > 0) {
            await dispatch(
              updateCaseStage(id, { toOrder: total, status: "done" })
            );
          }
          if (approvedBy) {
            await dispatch(
              updateCaseApproval(id, { approved: true, by: approvedBy } as any)
            );
          }
        }}
      />
    </div>
  );
};

export default ShowCases;
