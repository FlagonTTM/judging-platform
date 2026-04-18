import { useQuery } from '@tanstack/react-query';
import { api } from './api';
import type { Criterion, Event, LeaderboardRow, Score, Team, User } from './types';

export function useMe() {
  return useQuery<User | null>({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        const r = await api.get<User>('/auth/me');
        return r.data;
      } catch {
        return null;
      }
    },
    staleTime: 60_000,
  });
}

export function useEvents() {
  return useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: async () => (await api.get<Event[]>('/events')).data,
  });
}

export function useEvent(eventId: string | undefined) {
  return useQuery<Event>({
    queryKey: ['events', eventId],
    queryFn: async () => (await api.get<Event>(`/events/${eventId}`)).data,
    enabled: !!eventId,
  });
}

export function useCriteria(eventId: string | undefined) {
  return useQuery<Criterion[]>({
    queryKey: ['events', eventId, 'criteria'],
    queryFn: async () => (await api.get<Criterion[]>(`/events/${eventId}/criteria`)).data,
    enabled: !!eventId,
  });
}

export function useTeams(eventId: string | undefined) {
  return useQuery<Team[]>({
    queryKey: ['events', eventId, 'teams'],
    queryFn: async () => (await api.get<Team[]>(`/events/${eventId}/teams`)).data,
    enabled: !!eventId,
  });
}

export function useMyScores(teamId: string | undefined) {
  return useQuery<Score[]>({
    queryKey: ['teams', teamId, 'scores', 'me'],
    queryFn: async () => (await api.get<Score[]>(`/teams/${teamId}/scores/me`)).data,
    enabled: !!teamId,
  });
}

export function useLeaderboard(eventId: string | undefined) {
  return useQuery<LeaderboardRow[]>({
    queryKey: ['events', eventId, 'leaderboard'],
    queryFn: async () => (await api.get<LeaderboardRow[]>(`/events/${eventId}/leaderboard`)).data,
    enabled: !!eventId,
    refetchInterval: 10_000,
  });
}
