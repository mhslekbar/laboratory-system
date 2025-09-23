import React, { useContext } from "react";
import { DataPermissionContext } from "../types";
import { InputElement } from "../../../HtmlComponents/InputElement";

interface Props {
  idPrefix?: string; // optional for unique ids per modal
}

const InputsPermission: React.FC<Props> = ({ idPrefix }) => {
  const { name, setName, collectionName, setCollectionName } = useContext(DataPermissionContext);

  return (
    <>
      <InputElement
        id={idPrefix ? `${idPrefix}-name-input` : "perm-name-input"}
        name="Name"
        value={name}
        setValue={setName}
        placeholder="ex: user.read"
      />
      <InputElement
        id={idPrefix ? `${idPrefix}-collection-input` : "perm-collection-input"}
        name="Collection Name"
        value={collectionName}
        setValue={setCollectionName}
        placeholder="ex: users"
      />
    </>
  );
};

export default InputsPermission;
