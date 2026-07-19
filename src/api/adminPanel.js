import axiosInstance from './axiosInstance';

// ── Stats ────────────────────────────────────────────────────────────────────

/** GET /api/admin-panel/stats/ */
export const getStats = () =>
  axiosInstance.get('/api/admin-panel/stats/');

// ── Plans ────────────────────────────────────────────────────────────────────

/** GET /api/admin-panel/plans/ */
export const listAdminPlans = () =>
  axiosInstance.get('/api/admin-panel/plans/');

/** POST /api/admin-panel/plans/ */
export const createPlan = (data) =>
  axiosInstance.post('/api/admin-panel/plans/', data);

/** GET /api/admin-panel/plans/:pk/ */
export const getAdminPlan = (pk) =>
  axiosInstance.get(`/api/admin-panel/plans/${pk}/`);

/** PATCH /api/admin-panel/plans/:pk/ */
export const updatePlan = (pk, data) =>
  axiosInstance.patch(`/api/admin-panel/plans/${pk}/`, data);

/** DELETE /api/admin-panel/plans/:pk/ */
export const deletePlan = (pk) =>
  axiosInstance.delete(`/api/admin-panel/plans/${pk}/`);

// ── Users ────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin-panel/users/
 * @param {{ q?: string, role?: string, exclude_role?: string, is_active?: boolean,
 *           is_supervisor?: boolean, page?: number }} params
 */
export const listAdminUsers = (params = {}) =>
  axiosInstance.get('/api/admin-panel/users/', { params });

/**
 * PATCH /api/admin-panel/users/:pk/
 * e.g. { is_active: false } or { role: 'officer' }
 */
export const updateAdminUser = (pk, data) =>
  axiosInstance.patch(`/api/admin-panel/users/${pk}/`, data);

// ── Documents ────────────────────────────────────────────────────────────────

/**
 * GET /api/admin-panel/documents/
 * @param {{ q?: string, doc_type?: string, status?: string, review_status?: string,
 *           pending_review?: boolean, flagged?: boolean, page?: number }} params
 */
export const listAdminDocuments = (params = {}) =>
  axiosInstance.get('/api/admin-panel/documents/', { params });

/** GET /api/admin-panel/documents/:pk/ */
export const getAdminDocument = (pk) =>
  axiosInstance.get(`/api/admin-panel/documents/${pk}/`);

// ── Activity ─────────────────────────────────────────────────────────────────

/**
 * GET /api/admin-panel/activity/ — paginated audit trail.
 * @param {{ severity?: 'info'|'warning', page?: number }} params
 */
export const listActivity = (params = {}) =>
  axiosInstance.get('/api/admin-panel/activity/', { params });
