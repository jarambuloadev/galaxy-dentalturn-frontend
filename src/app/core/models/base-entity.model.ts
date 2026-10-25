export interface BaseEntity {
  id: number;
  createdAt: Date;
  createdBy?: string;
  updatedAt: Date;
}
