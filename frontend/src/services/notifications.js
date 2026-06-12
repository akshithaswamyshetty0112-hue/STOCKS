import api from "./api";

export const fetchNotifications = async () => {
  const resp = await api.get("/notifications");
  return resp.data;
};

export const markNotificationRead = async (id) => {
  const resp = await api.post("/notifications/mark-read", { id });
  return resp.data;
};
