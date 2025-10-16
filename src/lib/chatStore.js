import { create } from "zustand";
import { useUserStore } from "./userStore";

export const useChatStore = create((set) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,

  changeChat: (chatId, user) => {
    console.log("changeChat called with:", { chatId, user });
    const currentUser = useUserStore.getState().currentUser;
    console.log("useChatStore new state:", useChatStore.getState());

    // Defensive checks
    if (!chatId) {
      return set({ chatId: null, user: null });
    }

    if (!user || !currentUser) {
      // If no user info available, just set chatId and clear user
      return set({ chatId, user: user || null, isCurrentUserBlocked: false, isReceiverBlocked: false });
    }

    // If the other user has blocked the current user
    if (Array.isArray(user.blocked) && user.blocked.includes(currentUser.id)) {
      return set({ chatId, user: null, isCurrentUserBlocked: true, isReceiverBlocked: false });
    }

    // If the current user has blocked the other user
    if (Array.isArray(currentUser.blocked) && currentUser.blocked.includes(user.id)) {
      return set({ chatId, user, isCurrentUserBlocked: false, isReceiverBlocked: true });
    }

    // Default: set chat normally
    return set({ chatId, user, isCurrentUserBlocked: false, isReceiverBlocked: false });
  },

  changeBlock: () => {
    set((state) => ({ ...state, isReceiverBlocked: !state.isReceiverBlocked }));
  },
}));