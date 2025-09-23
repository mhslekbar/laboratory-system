// Types partagés dans tout le module "MeasurementType"
export type StageTemplate = {
  key: string;
  name: string;
  order?: number;
  color?: string;
};

export type MeasurementTypeDto = {
  _id?: string;
  key: string;
  name: string;
  stages: StageTemplate[];
  createdAt?: string;
  updatedAt?: string;
};

export type Meta = {
  total: number;
  page: number;
  pages: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
};
