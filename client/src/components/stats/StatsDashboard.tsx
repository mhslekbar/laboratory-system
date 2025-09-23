import React, { useMemo, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { State } from "../../redux/store";
import CasesStats from "./CasesStats";
import DoctorsStats from "./DoctorsStats";
import PatientsStats from "./PatientsStats";
import { PeriodMode, toYMD } from "./utils";
import HeaderFilterStats from "./HeaderFilterStats";
import { ShowUserApi } from "../../redux/users/UserApiCalls";
import { ShowPatientApi } from "../../redux/patients/PatientApiCalls";
import { fetchMeasurementTypes } from "../../redux/measurementTypes/thunks";
import { fetchCases } from "../../redux/cases/thunks";

const StatsDashboard: React.FC = () => {
  const cases    = useSelector((s: State) => (s as any).cases?.items || []);
  const users    = useSelector((s: State) => (s as any).users?.users || []);
  const patients = useSelector((s: State) => (s as any).patients?.patients || (s as any).patients?.items || []);

  const [mode, setMode] = useState<PeriodMode>("monthly");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo]     = useState<string>("");

  useEffect(() => {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    setDateFrom((prev) => prev || toYMD(first));
    setDateTo((prev)   => prev   || toYMD(now));
  }, []);

  const dispatch: any = useDispatch();

  useEffect(() => {
    dispatch(ShowUserApi({ only: "doctors", page: 1, limit: 1000 }));
    dispatch(ShowPatientApi({ page: 1, limit: 1000 }));
    dispatch(fetchMeasurementTypes({ page: 1, limit: 1000 }));
    dispatch(fetchCases({ delivery: "all", page: 1, limit: 1000 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalCases   = useMemo(() => cases?.length ?? 0, [cases]);
  const doctorsCount = useMemo(() => (users || []).filter((u: any) => u?.doctor?.isDoctor).length, [users]);
  const patientsCount= useMemo(() => (patients || []).length ?? 0, [patients]);

  return (
    <div className="p-5 space-y-5">
      <HeaderFilterStats
        mode={mode}
        setMode={setMode}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        totalCases={totalCases}
        doctorsCount={doctorsCount}
        patientsCount={patientsCount}
      />

      <CasesStats
        cases={cases}
        mode={mode === "range" ? "monthly" : mode}
        dateFrom={dateFrom}
        dateTo={dateTo}
      />

      <DoctorsStats cases={cases} users={users} dateFrom={dateFrom} dateTo={dateTo} />

      <PatientsStats cases={cases} patients={patients} dateFrom={dateFrom} dateTo={dateTo} />
    </div>
  );
};

export default StatsDashboard;
