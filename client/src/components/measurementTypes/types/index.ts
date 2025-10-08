// Types partagés dans tout le module "MeasurementType"
// components/measurementTypes/types/index.ts
export type StageTemplate = {
  _id?: string;             // present when loaded from DB
  name: string;
  order?: number;
  color?: string;
  allowedRoles?: string[];  // Role ObjectIds
};

export type MeasurementTypeDto = {
  _id?: string;
  key: string;              // measurement type key (still exists on type)
  name: string;
  stages: StageTemplate[];
};


export type Meta = {
  total: number;
  page: number;
  pages: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
};
