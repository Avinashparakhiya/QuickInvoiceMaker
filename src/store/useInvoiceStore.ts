import { create } from 'zustand';
import { Invoice, InvoiceItem, KPISummary } from '../types';
import { invoiceRepository } from '../database/repositories/invoiceRepository';

interface InvoiceState {
  invoices: Invoice[];
  dueSoonInvoices: Invoice[];
  recentInvoices: Invoice[];
  kpiSummary: KPISummary | null;
  selectedInvoice: Invoice | null;
  filterStatus: string;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;

  setFilterStatus: (status: string) => void;
  setSearchQuery: (query: string) => void;
  loadInvoices: (orgId: string) => Promise<void>;
  loadDashboardData: (orgId: string) => Promise<void>;
  loadInvoiceById: (id: string) => Promise<Invoice | null>;
  createInvoice: (
    invoice: Omit<Invoice, 'createdAt' | 'updatedAt'>,
    items: Omit<InvoiceItem, 'id' | 'invoiceId'>[]
  ) => Promise<Invoice>;
  updateInvoice: (
    id: string,
    invoice: Partial<Invoice>,
    items?: Omit<InvoiceItem, 'id' | 'invoiceId'>[]
  ) => Promise<void>;
  deleteInvoice: (id: string, orgId: string) => Promise<void>;
}

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  invoices: [],
  dueSoonInvoices: [],
  recentInvoices: [],
  kpiSummary: null,
  selectedInvoice: null,
  filterStatus: 'ALL',
  searchQuery: '',
  isLoading: false,
  error: null,

  setFilterStatus: (status: string) => {
    set({ filterStatus: status });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  loadInvoices: async (orgId: string) => {
    const { filterStatus, searchQuery } = get();
    set({ isLoading: true, error: null });
    try {
      const invoices = await invoiceRepository.getAll({
        orgId,
        status: filterStatus,
        search: searchQuery,
      });
      set({ invoices, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  loadDashboardData: async (orgId: string) => {
    try {
      const [kpi, dueSoon, recent] = await Promise.all([
        invoiceRepository.getKPISummary(orgId),
        invoiceRepository.getDueSoon(orgId),
        invoiceRepository.getRecent(orgId, 6),
      ]);
      set({ kpiSummary: kpi, dueSoonInvoices: dueSoon, recentInvoices: recent });
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
    }
  },

  loadInvoiceById: async (id: string) => {
    set({ isLoading: true });
    try {
      const inv = await invoiceRepository.getById(id);
      set({ selectedInvoice: inv, isLoading: false });
      return inv;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return null;
    }
  },

  createInvoice: async (invoiceData, items) => {
    set({ isLoading: true });
    try {
      const created = await invoiceRepository.create(invoiceData, items);
      await get().loadDashboardData(invoiceData.organizationId);
      await get().loadInvoices(invoiceData.organizationId);
      return created;
    } finally {
      set({ isLoading: false });
    }
  },

  updateInvoice: async (id, invoiceData, items) => {
    set({ isLoading: true });
    try {
      await invoiceRepository.update(id, invoiceData, items);
      if (invoiceData.organizationId) {
        await get().loadDashboardData(invoiceData.organizationId);
        await get().loadInvoices(invoiceData.organizationId);
      }
    } finally {
      set({ isLoading: false });
    }
  },

  deleteInvoice: async (id, orgId) => {
    set({ isLoading: true });
    try {
      await invoiceRepository.delete(id);
      await get().loadDashboardData(orgId);
      await get().loadInvoices(orgId);
    } finally {
      set({ isLoading: false });
    }
  },
}));
