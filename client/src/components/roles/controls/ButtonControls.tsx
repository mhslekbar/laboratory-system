import React, { useContext, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { CiCircleRemove } from "react-icons/ci";
import { RoleType } from "../types";
import EditRole from "../EditRole";
import DeleteRole from "../DeleteRole";
import { ShowRoleContext } from "../ShowRoles";


interface ButtonControlsInterface {
  role: RoleType,
}

const ButtonControls: React.FC<ButtonControlsInterface> = ({ role }) => {
  const [showEditModal, setShowEditModal] = useState<boolean>(false)
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const { setSelectedRole, selectedRole } = useContext(ShowRoleContext)

  const ToggleEditModal = (role: RoleType) => {
    setShowEditModal(true)
    setSelectedRole(role)
  }

  const ToggleDeleteModal = (role: RoleType) => {
    setShowDeleteModal(true)
    setSelectedRole(role)
  }

  return (
    <div className="flex justify-between mr-2">
      {showEditModal && selectedRole._id === role._id && <EditRole roleData={role} modal={showEditModal} toggle={() => setShowEditModal(!showEditModal)} />}
      {showDeleteModal && selectedRole._id === role._id && <DeleteRole roleData={role} modal={showDeleteModal} toggle={() => setShowDeleteModal(!showDeleteModal)} />}

      <FaEdit
        style={{
          fontSize: "22px",
        }}
        className="text-blue-500"
        onClick={() => ToggleEditModal(role)}
      />
      <CiCircleRemove className="text-red-400" style={{ fontSize: "24px" }} onClick={() => ToggleDeleteModal(role)} />
    </div>
  );
};

export default ButtonControls;
