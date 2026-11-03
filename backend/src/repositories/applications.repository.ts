import type { Db } from "../db/database.ts";
import type { ApplicationDbo } from "../models/application.ts";

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
  const insert = db.prepare<{ offerId: number; studentId: number; message: string }, ApplicationDbo>(
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
    findActive: (offerId: number, studentId: number): ApplicationDbo | undefined =>
      findActive.get({ offerId, studentId }),
    insert: (offerId: number, studentId: number, message: string): ApplicationDbo =>
      insert.get({ offerId, studentId, message }) as ApplicationDbo,
    withdraw: (id: number): ApplicationDbo | undefined => withdraw.get({ id }),
  };
};

export type ApplicationsRepository = ReturnType<typeof createApplicationsRepository>;
