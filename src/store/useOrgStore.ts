import { create } from 'zustand';
import { Organization } from '../types';
import { orgRepository } from '../database/repositories/orgRepository';
import { getDatabase } from '../database/db';

interface OrgState {
  organizations: Organization[];
  activeOrg: Organization | null;
  isLoading: boolean;
  error: string | null;
  
  initialize: () => Promise<void>;
  loadOrganizations: () => Promise<void>;
  setActiveOrg: (orgId: string) => Promise<void>;
  createOrg: (org: Omit<Organization, 'createdAt' | 'updatedAt'>) => Promise<Organization>;
  updateOrg: (id: string, updates: Partial<Organization>) => Promise<void>;
  deleteOrg: (id: string) => Promise<void>;
}

export const useOrgStore = create<OrgState>((set, get) => ({
  organizations: [],
  activeOrg: null,
  isLoading: false,
  error: null,

  initialize: async () => {
    set({ isLoading: true, error: null });
    try {
      await getDatabase();
      const orgs = await orgRepository.getAll();
      const active = await orgRepository.getActive();
      set({ organizations: orgs, activeOrg: active || orgs[0] || null, isLoading: false });
    } catch (err: any) {
      console.error('Failed to initialize organizations:', err);
      set({ error: err.message || 'Initialization failed', isLoading: false });
    }
  },

  loadOrganizations: async () => {
    set({ isLoading: true });
    try {
      const orgs = await orgRepository.getAll();
      const active = await orgRepository.getActive();
      set({ organizations: orgs, activeOrg: active || orgs[0] || null, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  setActiveOrg: async (orgId: string) => {
    try {
      await orgRepository.setActive(orgId);
      const updatedActive = await orgRepository.getById(orgId);
      const orgs = await orgRepository.getAll();
      set({ activeOrg: updatedActive, organizations: orgs });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  createOrg: async (orgData) => {
    set({ isLoading: true });
    try {
      const newOrg = await orgRepository.create(orgData);
      await get().loadOrganizations();
      return newOrg;
    } finally {
      set({ isLoading: false });
    }
  },

  updateOrg: async (id, updates) => {
    set({ isLoading: true });
    try {
      await orgRepository.update(id, updates);
      await get().loadOrganizations();
    } finally {
      set({ isLoading: false });
    }
  },

  deleteOrg: async (id) => {
    set({ isLoading: true });
    try {
      await orgRepository.delete(id);
      await get().loadOrganizations();
    } finally {
      set({ isLoading: false });
    }
  },
}));
