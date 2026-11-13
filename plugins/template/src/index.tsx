import { findByStoreName } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import { storage } from "@vendetta/plugin";
import { Forms } from "@vendetta/ui/components";
import { useProxy } from "@vendetta/storage";

const { FormSection, FormInput } = Forms;
const UserStore = findByStoreName("UserStore");

storage.customUsername ??= "custom_user";
storage.customDisplayName ??= "Custom Display Name";

let unpatchGetUser: () => boolean;
let unpatchCurrentUser: () => boolean;

function applySpoof(user: any) {
  const currentUser = UserStore.getCurrentUser?.();
  if (user && currentUser && user.id === currentUser.id) {
    if (storage.customUsername) user.username = storage.customUsername;
    if (storage.customDisplayName) user.globalName = storage.customDisplayName;
  }
  return user;
}

export default {
  onLoad: () => {
    unpatchGetUser = after("getUser", UserStore, (_args, res) => applySpoof(res));
    unpatchCurrentUser = after("getCurrentUser", UserStore, (_args, res) => applySpoof(res));
  },
  onUnload: () => {
    unpatchGetUser?.();
    unpatchCurrentUser?.();
  },
  settings: () => {
    useProxy(storage);
    return (
      <FormSection title="Local Profile Spoofer">
        <FormInput
          title="Custom @Username"
          placeholder="Enter any @username"
          value={storage.customUsername}
          onChange={(v: string) => (storage.customUsername = v)}
        />
        <FormInput
          title="Custom Display Name"
          placeholder="Enter any display name"
          value={storage.customDisplayName}
          onChange={(v: string) => (storage.customDisplayName = v)}
        />
      </FormSection>
    );
  },
};
