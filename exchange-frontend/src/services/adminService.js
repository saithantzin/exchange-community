import api from './api';

const adminService = {
  async getMembers() {
    const response = await api.get('/admin/members');
    return response.data;
  },

  async updateMemberStatus(memberId, statusData) {
    const response = await api.patch(`/admin/members/${memberId}/status`, statusData);
    return response.data;
  }
};

export default adminService;
