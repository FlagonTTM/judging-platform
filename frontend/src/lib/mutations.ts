import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type {
  Criterion,
  Event,
  Score,
  Stage,
  StageStatus,
  Team,
  TeamProgress,
  User,
  UserRole,
} from './types';

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { email: string; password: string }) =>
      (await api.post<User>('/auth/login', vars)).data,
    onSuccess: (user) => qc.setQueryData(['me'], user),
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      email: string;
      password: string;
      name: string;
      role: UserRole;
    }) => (await api.post<User>('/auth/register', vars)).data,
    onSuccess: (user) => qc.setQueryData(['me'], user),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSuccess: () => qc.setQueryData(['me'], null),
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      name: string;
      start_at: string;
      end_at: string;
      deadline?: string | null;
    }) => (await api.post<Event>('/events', vars)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
}

export function useUpdateEvent(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: Partial<Event>) =>
      (await api.patch<Event>(`/events/${eventId}`, vars)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] });
      qc.invalidateQueries({ queryKey: ['events', eventId] });
    },
  });
}

export function useCreateCriterion(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      name: string;
      description?: string;
      weight: number;
      max_score: number;
    }) => (await api.post<Criterion>(`/events/${eventId}/criteria`, vars)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events', eventId, 'criteria'] }),
  });
}

export function useDeleteCriterion(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/criteria/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events', eventId, 'criteria'] }),
  });
}

export function useCreateTeam(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      name: string;
      track?: string | null;
      members?: Array<Record<string, unknown>>;
      contacts?: Record<string, unknown>;
    }) => (await api.post<Team>(`/events/${eventId}/teams`, vars)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events', eventId, 'teams'] }),
  });
}

export function useDeleteTeam(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/teams/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events', eventId, 'teams'] }),
  });
}

export function useUpsertScores(teamId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (items: Array<{ criterion_id: string; value: number; comment?: string }>) =>
      (await api.put<Score[]>(`/teams/${teamId}/scores`, { items })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams', teamId, 'scores', 'me'] }),
  });
}

export function useSubmitScores(teamId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => (await api.post<Score[]>(`/teams/${teamId}/scores/submit`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams', teamId, 'scores', 'me'] }),
  });
}

export const createStage = (eventId: string, name: string, order: number) =>
  api.post<Stage>(`/events/${eventId}/stages`, { name, order }).then((r) => r.data);

export const updateStage = (
  stageId: string,
  patch: { name?: string; order?: number },
) => api.patch<Stage>(`/stages/${stageId}`, patch).then((r) => r.data);

export const deleteStage = (stageId: string) =>
  api.delete(`/stages/${stageId}`).then(() => undefined);

export const setStageStatus = (
  teamId: string,
  stageId: string,
  status: StageStatus,
) =>
  api
    .put<TeamProgress>(`/teams/${teamId}/progress`, { stage_id: stageId, status })
    .then((r) => r.data);
