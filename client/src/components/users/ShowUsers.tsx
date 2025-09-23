import React, { createContext, useEffect, useState } from "react";
import {
  DefaultShowUserType,
  DefaultUserInterface,
  ShowUserType,
  UserInterface,
} from "./types";
import AddUser from "./AddUser";
import TableUsers from "./TableUsers";
import { useSelector } from "react-redux";
import { State } from "../../redux/store";
import { useDispatch } from "react-redux";
import { ShowUserApi } from "../../redux/users/UserApiCalls";
import SuccessMsg from "../../Messages/SuccessMsg";
import EditUser from "./EditUser";
import DeleteUser from "./DeleteUser";
import { showRolesApi } from "../../redux/roles/roleApiCalls";
import ToolbarUsers from "./ToolbarUsers";

export const ShowUserContext = createContext<ShowUserType>(DefaultShowUserType);

const ShowUsers: React.FC = () => {
  const { users, page, pages, total, limit, hasNext, hasPrev } = useSelector(
    (state: State) => state.users
  );

  const [view, setView] = useState<"all" | "users" | "doctors">("users");
  const [q, setQ] = useState<string>("");

  const [successMsg, setSuccessMsg] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] =
    useState<UserInterface>(DefaultUserInterface);

  const dispatch: any = useDispatch();

  // initial load + roles
  useEffect(() => {
    const boot = async () => {
      await dispatch(
        ShowUserApi({ q, page: 1, limit: limit || 10, only: view })
      );
      await dispatch(showRolesApi());
    };
    boot();
    // eslint-disable-next-line
  }, []);

  // reload when q/view changes (page=1)
  useEffect(() => {
    dispatch(ShowUserApi({ q, page: 1, limit: limit || 10, only: view }));
    // eslint-disable-next-line
  }, [q, view]);

  const goPrev = () => {
    if (!hasPrev) return;
    dispatch(
      ShowUserApi({ q, page: (page || 1) - 1, limit: limit || 10, only: view })
    );
  };
  const goNext = () => {
    if (!hasNext) return;
    dispatch(
      ShowUserApi({ q, page: (page || 1) + 1, limit: limit || 10, only: view })
    );
  };
  const changeLimit = (n: number) => {
    dispatch(ShowUserApi({ q, page: 1, limit: n, only: view }));
  };

  const usersFiltered = users.filter((u: UserInterface) =>
    view === "all"
      ? true
      : view === "doctors"
      ? u?.doctor?.isDoctor
      : !u?.doctor?.isDoctor
  );

  return (
    <ShowUserContext.Provider
      value={{
        successMsg,
        setSuccessMsg,
        showAddModal,
        setShowAddModal,
        showEditModal,
        setShowEditModal,
        showDeleteModal,
        setShowDeleteModal,
        selectedUser,
        setSelectedUser,
      }}
    >
      {successMsg && (
        <SuccessMsg
          modal={successMsg}
          toggle={() => setSuccessMsg(!successMsg)}
        />
      )}

      <ToolbarUsers
        q={q}
        setQ={setQ}
        total={total}
        page={page}
        pages={pages}
        hasPrev={hasPrev}
        hasNext={hasNext}
        goPrev={goPrev}
        goNext={goNext}
        limit={limit}
        onChangeLimit={changeLimit} // reset page
        view={view}
        onChangeView={(v) => {
          setView(v);
          dispatch(ShowUserApi({ q, page: 1, limit: limit || 10, only: v }));
        }}
        onAddUser={() => setShowAddModal(!showAddModal)} // ou ton toggle/modal existant
        onRefresh={() =>
          dispatch(ShowUserApi({ q, page, limit: limit || 10, only: view }))
        }
      />

      {/* Modal d’ajout contrôlé */}
      <AddUser open={showAddModal} setOpen={setShowAddModal} />

      {showEditModal && selectedUser && (
        <EditUser
          modal={showEditModal}
          toggle={() => setShowEditModal(!showEditModal)}
          user={selectedUser}
        />
      )}
      {showDeleteModal && selectedUser && (
        <DeleteUser
          modal={showDeleteModal}
          toggle={() => setShowDeleteModal(!showDeleteModal)}
          user={selectedUser}
        />
      )}

      {/* <TableUsers users={usersFiltered} /> */}
      <TableUsers users={usersFiltered} canManage={true} view={view} />
    </ShowUserContext.Provider>
  );
};

export default ShowUsers;
