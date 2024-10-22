class UserModel {
    constructor({ id, name, email, phoneNumber, status, dateCreated, image, addresses }) {
        this.id = id || ''; // ID của người dùng, mặc định là chuỗi rỗng nếu không có
        this.name = name || 'Chưa xác định'; // Tên người dùng, mặc định là 'Chưa xác định'
        this.email = email || 'Chưa có email'; // Email người dùng, mặc định là 'Chưa có email'
        this.phoneNumber = phoneNumber || 'Chưa có số điện thoại'; // Số điện thoại người dùng
        this.status = status || 'Không hoạt động'; // Trạng thái của người dùng, mặc định là 'Không hoạt động'
        this.dateCreated = dateCreated || new Date().toISOString(); // Ngày tạo người dùng, mặc định là ngày hiện tại
        this.image = image || ''; // URL ảnh của người dùng
        this.addresses = addresses || []; // Danh sách địa chỉ, mặc định là mảng rỗng nếu không có
    }

    // Phương thức kiểm tra xem người dùng có đang hoạt động không
    isActive() {
        return this.status === 'Hoạt động';
    }

    // Phương thức định dạng ngày tạo
    getFormattedDate() {
        const date = new Date(this.dateCreated);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    }

    // Phương thức lấy thông tin tóm tắt của người dùng
    getSummary() {
        return `Người dùng ${this.name} (Email: ${this.email}) có trạng thái: ${this.status}`;
    }

    // Phương thức lấy ảnh đại diện người dùng, trả về URL mặc định nếu không có
    getAvatar() {
        return this.image || 'https://via.placeholder.com/150';
    }

    // Phương thức thêm địa chỉ mới
    addAddress(newAddress) {
        this.addresses.push(newAddress);
    }

    // Phương thức lấy địa chỉ đầu tiên (nếu có)
    getPrimaryAddress() {
        if (this.addresses.length > 0) {
            return this.addresses[0];
        }
        return null;
    }

    // Phương thức trả về danh sách tất cả địa chỉ
    getAllAddresses() {
        return this.addresses;
    }

    // Phương thức định dạng thông tin địa chỉ
    getFormattedAddresses() {
        return this.addresses.map((address, index) => {
            return `Địa chỉ ${index + 1}: ${address.addressUser}, Người nhận: ${address.nameAddressUser}, SĐT: ${address.phoneAddressUser}`;
        }).join('\n');
    }
}

export default UserModel;
