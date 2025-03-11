import { create } from "zustand";

const store = (set) => ({
    selfDetails: null,
    setSelfDetails: (details) => set({ selfDetails: details }),
})

const useSelfDetailsStore = create(store);
export default useSelfDetailsStore;