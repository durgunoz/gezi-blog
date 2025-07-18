import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

export const getPosts = async () => {
  const res = await axios.get(`${API}/posts`);
  return res.data;
};

export const createPost = async (post) => {
  const res = await axios.post(`${API}/posts`, post);
  return res.data;
};
