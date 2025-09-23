import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useSelector } from "react-redux";
import { State } from "./redux/store";
import AdminRoutes from "./routes/AdminRoutes";
import Login from "./pages/Login";
// import NotFound from "./pages/NotFound";
import useDynamicHead from "./hooks/useDynamicHead";

/** يرفع الصفحة للأعلى عند تغيّر المسار */
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  const { userData } = useSelector((state: State) => state.login);

  useDynamicHead();

  if (userData._id) {
    return (
      <Router>
        <ScrollToTop />
        {/* AdminRoutes يتكفّل بجميع المسارات:
          - /login (عامة)
          - باقي الصفحات داخل ProtectedRoutes + AppLayout (Header + Navbar + Outlet)
      */}
        <AdminRoutes />
      </Router>
    );
  } else {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/*" element={<Login />} />
        </Routes>
      </Router>
    );
  }
};

export default App;
