import React from "react";

export default function DoctorHome() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Bienvenue 👋</h1>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Utilisez le menu à gauche pour accéder à vos <strong>Dossiers</strong> et à vos <strong>Patients</strong>.
      </p>
      <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 p-4 bg-white dark:bg-[#111827]">
        <div className="text-sm text-gray-700 dark:text-gray-200">
          Astuce : filtrez vos dossiers par statut de livraison (<em>En attente</em>, <em>Prêt</em>, <em>Livré</em>) et marquez la réception depuis la liste.
        </div>
      </div>
    </div>
  );
}
