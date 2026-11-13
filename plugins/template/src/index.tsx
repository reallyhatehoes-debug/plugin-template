import { findByStoreName } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { React, ReactNative } from "@vendetta/metro/common";

const { View, Text, TextInput } = ReactNative;
const UserStore = findByStoreName("UserStore");

storage.customUsername ??= "custom_user";
storage.customDisplayName ??= "Custom Display Name";

let unpatchGetUser: () => boolean;
let unpatchCurrentUser: () => boolean;
let myId: string | undefined;

function applySpoof(user: any) {
  if (user && myId && user.id === myId) {
    if (storage.customUsername) user.username = storage.customUsername;
    if (storage.customDisplayName) user.globalName = storage.customDisplayName;
  }
  return user;
}

export default {
  onLoad: () => {
    myId = UserStore?.getCurrentUser?.()?.id;
    if (UserStore) {
      unpatchGetUser = after("getUser", UserStore, (_args, res) => applySpoof(res));
      unpatchCurrentUser = after("getCurrentUser", UserStore, (_args, res) => applySpoof(res));
    }
  },
  onUnload: () => {
    unpatchGetUser?.();
    unpatchCurrentUser?.();
  },
  settings: () => {
    useProxy(storage);
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
          Custom @Username
        </Text>
        <TextInput
          style={{
            backgroundColor: "#1e1f22",
            color: "#ffffff",
            padding: 12,
            borderRadius: 8,
            marginBottom: 20,
          }}
          placeholder="Enter any @username"
          placeholderTextColor="#80848e"
          value={storage.customUsername}
          onChangeText={(v: string) => (storage.customUsername = v)}
        />
        <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
          Custom Display Name
        </Text>
        <TextInput
          style={{
            backgroundColor: "#1e1f22",
            color: "#ffffff",
            padding: 12,
            borderRadius: 8,
          }}
          placeholder="Enter any display name"
          placeholderTextColor="#80848e"
          value={storage.customDisplayName}
          onChangeText={(v: string) => (storage.customDisplayName = v)}
        />
      </View>
    );
  },
};

