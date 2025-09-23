import { useEffect } from "react";
import { useSelector } from "react-redux";
import { State } from "../redux/store";
import { useNavigate } from "react-router-dom";

export default function SmartLanding() {
  const { userData } = useSelector((s: State) => s.login);
  const navigate = useNavigate();

  useEffect(() => {
    const goTo = userData?.doctor?.isDoctor ? "/doctor" : "/dashboard";
    navigate(goTo, { replace: true });
  }, [navigate, userData]);

  return null;
}
