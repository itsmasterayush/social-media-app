import api from './api';

export const getPosts = async (params = {}) => {
  const response = await api.get('/posts', { params });
  return response.data;
};

export const getTopPosts = async (limit = 10) => {
  const response = await api.get('/posts/top', { params: { limit } });
  return response.data;
};

export const getPostById = async (id) => {
  const response = await api.get(`/posts/${id}`);
  return response.data;
};

export const createPost = async (postData) => {
  const response = await api.post('/posts', postData);
  return response.data;
};

export const updatePost = async (id, postData) => {
  const response = await api.put(`/posts/${id}`, postData);
  return response.data;
};

export const deletePost = async (id) => {
  const response = await api.delete(`/posts/${id}`);
  return response.data;
};

export const toggleLikePost = async (id) => {
  const response = await api.post(`/posts/${id}/like`);
  return response.data;
};

export const getUserDashboardStats = async () => {
  const response = await api.get('/posts/dashboard/user');
  return response.data;
};
