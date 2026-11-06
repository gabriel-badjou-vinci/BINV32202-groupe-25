import type { Db } from "../db/database.ts";
import type { ApplicationDbo, ApplicationListDbo } from "../models/application.ts";

export const createApplicationsRepository = (db: Db) => {
  const findById = db.prepare<{ id: number }, ApplicationDbo>(
    `SELECT id, offer_id, student_id, message, status, applied_at
     FROM applications WHERE id = @id`,
  );
  const findActive = db.prepare<{ offerId: number; studentId: number }, ApplicationDbo>(
    `SELECT id, offer_id, student_id, message, status, applied_at
     FROM applications
     WHERE offer_id = @offerId AND student_id = @studentId AND status = 'IN_PROGRESS'`,
  );
  const findByStudent = db.prepare<{ studentId: number }, ApplicationListDbo>(
    `SELECT a.id, a.offer_id, a.student_id, a.message, a.status, a.applied_at,
            o.title AS offer_title, c.short_name AS company_short_name,
            ay.label AS academic_year_label, p.code AS period_code
     FROM applications a
     JOIN offers o ON o.id = a.offer_id
     JOIN companies c ON c.id = o.company_id
     JOIN academic_years ay ON ay.id = o.academic_year_id
     JOIN periods p ON p.id = o.period_id
     WHERE a.student_id = @studentId
     ORDER BY ay.start_date DESC, a.applied_at DESC, a.id DESC`,
  );
  const insert = db.prepare<
    { offerId: number; studentId: number; message: string | null },
    ApplicationDbo
  >(
    `INSERT INTO applications (offer_id, student_id, message)
     VALUES (@offerId, @studentId, @message)
     RETURNING id, offer_id, student_id, message, status, applied_at`,
  );
  const withdraw = db.prepare<{ id: number }, ApplicationDbo>(
    `UPDATE applications SET status = 'WITHDRAWN'
     WHERE id = @id AND status = 'IN_PROGRESS'
     RETURNING id, offer_id, student_id, message, status, applied_at`,
  );

  return {
    findById: (id: number): ApplicationDbo | undefined => findById.get({ id }),
    findByStudent: (studentId: number): ApplicationListDbo[] => findByStudent.all({ studentId }),
    findActive: (offerId: number, studentId: number): ApplicationDbo | undefined =>
      findActive.get({ offerId, studentId }),
    insert: (offerId: number, studentId: number, message: string | null): ApplicationDbo =>
      insert.get({ offerId, studentId, message }) as ApplicationDbo,
    withdraw: (id: number): ApplicationDbo | undefined => withdraw.get({ id }),
  };
};

export type ApplicationsRepository = ReturnType<typeof createApplicationsRepository>;
