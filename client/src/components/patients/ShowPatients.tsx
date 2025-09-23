// src/components/patients/ShowPatients.tsx
import React, { createContext, useEffect, useState } from "react";
import {
  DefaultShowPatientType,
  DefaultPatientInterface,
  ShowPatientType,
  PatientInterface,
} from "./types";
import AddPatient from "./AddPatient";
import TablePatients from "./TablePatients";
import { useSelector } from "react-redux";
import { State } from "../../redux/store";
import { useDispatch } from "react-redux";
import SuccessMsg from "../../Messages/SuccessMsg";
import EditPatient from "./EditPatient";
import DeletePatient from "./DeletePatient";
import { ShowPatientApi } from "../../redux/patients/PatientApiCalls";
import { UserData } from "../../requestMethods";
import PatientsToolbar from "./ToolbarPatient";

export const ShowPatientContext = createContext<ShowPatientType>(
  DefaultShowPatientType
);

const ShowPatients: React.FC = () => {
  const { patients, meta } = useSelector((state: State) => state.patients);
  const userFromStore =
    (useSelector((state: any) => state?.login?.userData) as any) || null;
  const user = userFromStore || UserData() || {};
  const isDoctor = !!user?.doctor?.isDoctor;
  const canManage = !isDoctor; // admin/gerant

  const [successMsg, setSuccessMsg] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientInterface>(
    DefaultPatientInterface
  );
  const dispatch: any = useDispatch();

  useEffect(() => {
    const callAPis = async () => {
      try {
        await dispatch(ShowPatientApi()); // le backend filtre déjà selon le rôle
      } catch {}
    };
    callAPis();
  }, [dispatch]);

  return (
    <ShowPatientContext.Provider
      value={{
        successMsg,
        setSuccessMsg,
        showEditModal,
        setShowEditModal,
        showDeleteModal,
        setShowDeleteModal,
        selectedPatient,
        setSelectedPatient,
      }}
    >
      {successMsg && (
        <SuccessMsg
          modal={successMsg}
          toggle={() => setSuccessMsg(!successMsg)}
        />
      )}

      <div className="p-4 sm:p-5 space-y-4 pb-24 sm:pb-0">
        {/* Admin/Gérant uniquement */}
        {canManage && (
          <AddPatient open={showAddModal} setOpen={setShowAddModal} />
        )}

        {/* Toolbar (intègre pagination desktop + sticky mobile) */}
        <PatientsToolbar
          canManage={canManage}
          meta={meta}
          initial={{ limit: meta?.limit || 10 }}
          onAddPatient={() => setShowAddModal(true)}
        />

        {/* Modals seulement si admin/gerant */}
        {canManage && showEditModal && selectedPatient && (
          <EditPatient
            modal={showEditModal}
            toggle={() => setShowEditModal(!showEditModal)}
            patient={selectedPatient}
          />
        )}
        {canManage && showDeleteModal && selectedPatient && (
          <DeletePatient
            modal={showDeleteModal}
            toggle={() => setShowDeleteModal(!showDeleteModal)}
            patient={selectedPatient}
          />
        )}

        {/* Table / Mobile cards */}
        <TablePatients patients={patients} canManage={canManage} />
      </div>
    </ShowPatientContext.Provider>
  );
};

export default ShowPatients;
