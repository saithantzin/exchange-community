import api from './api';

export const reviewService = {
  async getTestimonials() {
    const response = await api.get('/testimonials');
    return response.data.data;
  }
};

export default reviewService;
