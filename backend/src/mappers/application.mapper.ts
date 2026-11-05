import type {
  Application,
  ApplicationDbo,
  ApplicationDto,
  ApplicationListDto,
  ApplicationListDbo,
} from "../models/application.ts";

export const toApplication = (row: ApplicationDbo): Application => ({
  id: row.id,
  offerId: row.offer_id,
  studentId: row.student_id,
  message: row.message,
  status: row.status,
  appliedAt: row.applied_at,
});

export const toApplicationDto = (application: Application): ApplicationDto => application;

export const toApplicationListDto = (row: ApplicationListDbo): ApplicationListDto => ({
  id: row.id,
  offerId: row.offer_id,
  studentId: row.student_id,
  message: row.message,
  offerTitle: row.offer_title,
  companyShortName: row.company_short_name,
  academicYear: row.academic_year_label,
  period: row.period_code,
  status: row.status,
  appliedAt: row.applied_at,
});
