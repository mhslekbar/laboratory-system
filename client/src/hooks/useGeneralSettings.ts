import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { State } from "../redux/store";
import { fetchGeneralSettings } from "../redux/settings/settingsApiCalls";

export function useGeneralSettings() {
  const dispatch: any = useDispatch();
  const data = useSelector((s: State) => (s as any).generalSettings?.data);
  const loading = useSelector((s: State) => (s as any).generalSettings?.isFetching);

  useEffect(() => {
    if (!data && !loading) {
      dispatch(fetchGeneralSettings());
    }
  }, [data, loading, dispatch]);

  return data;
}
