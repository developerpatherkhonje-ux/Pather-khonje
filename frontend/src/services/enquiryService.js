import api from "./api";

export const submitEnquiry = async (data) => {
  const response = await api.post("/enquiries", data);
  return response.data;
};

export const getEnquiries = async () => {
  const response = await api.get("/enquiries");
  return response.data;
};

export const updateEnquiryStatus = async (id, status) => {
  const response = await api.patch(`/enquiries/${id}`, { status });
  return response.data;
};
