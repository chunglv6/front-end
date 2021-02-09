export const PERMISSION_CODE: any = {
  // action tac dong
  'action.view': 'VIEW',
  'action.insert': 'INSERT',
  'action.update': 'UPDATE',
  'action.delete': 'DELETE',
  'action.import': 'IMPORT',
  'action.export': 'EXPORT',
};

export enum RESOURCE {
  CUSTOMER = 'CUSTOMER',
  RFID = 'RFID',
  CONTRACT = 'CONTRACT',
  PROFILE = 'PROFILE',
  EXCEPTION = 'EXCEPTION',
  CATEGORY = 'CATEGORY',
  POLICY = 'POLICY',
  SEARCH = 'SEARCH',
  REPORT = 'REPORT',
  TOPUP = 'TOPUP',
};

export enum PERMISSION {
  VIEW = 'action.view',
  INSERT = 'action.insert',
  DELETE = 'action.delete',
  UPDATE = 'action.update',
  CRM_CUST_01 = 'CRM_CUST_01', //Đăng ký thông tin khách hàng cá nhân (KHCN)
  CRM_CUST_02 = 'CRM_CUST_02', //Đăng ký thông tin khách hàng doanh nghiệp (KHDN)
  CRM_CUST_03 = 'CRM_CUST_03', //Đăng ký thông tin phương tiện
  CRM_CUST_04 = 'CRM_CUST_04', //Import danh sách phương tiện
  CRM_CUST_05 = 'CRM_CUST_05', //Kiểm tra thông tin đăng kiểm
  CRM_CUST_06 = 'CRM_CUST_06', //Xuất danh sách xe dán thẻ
  CRM_CUST_07 = 'CRM_CUST_07', //Liên kết Viettelpay
  CRM_CUST_08 = 'CRM_CUST_08', //Hủy liên kết tài khoản thanh toán
  CRM_CUST_09 = 'CRM_CUST_09', //Tra cứu thông tin khách hàng
  CRM_CUST_10 = 'CRM_CUST_10', //Tra cứu thông tin phương tiện
  CRM_CUST_11 = 'CRM_CUST_11', //Thay đổi thông tin khách hàng cá nhân (KHCN)
  CRM_CUST_12 = 'CRM_CUST_12', //Thay đổi thông tin khách hàng doanh nghiệp (KHDN)
  CRM_CUST_13 = 'CRM_CUST_13', //Thay đổi thông tin phương tiện
  CRM_CUST_14 = 'CRM_CUST_14', //Xem chi tiết thông tin KHCN
  CRM_CUST_15 = 'CRM_CUST_15', //Xem chi tiết thông tin KHDN
  CRM_CUST_16 = 'CRM_CUST_16', //Xem chi tiết thông tin phương tiện
  CRM_CUST_17 = 'CRM_CUST_17', //Xem lịch sử thông tin khách hàng
  CRM_CUST_18 = 'CRM_CUST_18', //Xem lịch sử thông tin phương tiện
  CRM_CUST_19 = 'CRM_CUST_19', //Xem lịch sử thẻ RFID
  CRM_CUST_20 = 'CRM_CUST_20', //Xem lịch sử thay đổi tài khoản ETC
  CRM_CUST_21 = 'CRM_CUST_21', //Xem lịch sử giao dịch qua trạm
  CRM_CUST_22 = 'CRM_CUST_22', //Xem lịch sử mua vé tháng/quý
  CRM_CUST_23 = 'CRM_CUST_23', //Xem lịch sử giao dịch khác
  CRM_CUST_24 = 'CRM_CUST_24', //Xem lịch sử hóa đơn
  CRM_CUST_25 = 'CRM_CUST_25', //Xem lịch sử chương trình khuyến mại
  CRM_CUST_26 = 'CRM_CUST_26', //Reset mật khẩu tài khoản cho khách hàng
  CRM_CUST_27 = 'CRM_CUST_27', //Khóa tài khoản khách hàng
  CRM_CUST_28 = 'CRM_CUST_28', //Mua vé tháng/ quý
  CRM_CUST_29 = 'CRM_CUST_29', //Hủy vé tháng/ quý
  CRM_CUST_30 = 'CRM_CUST_30',   // hủy vé tháng quý không hoàn tiền
  CRM_CUST_31 = 'CRM_CUST_31', // hủy vé tháng quý có hoàn tiền
  CRM_RFID_01 = 'CRM_RFID_01', //Kích hoạt thẻ RFID
  CRM_RFID_02 = 'CRM_RFID_02', //Đổi thẻ RFID
  CRM_RFID_03 = 'CRM_RFID_03', //Đóng/ mở thẻ RFID
  CRM_RFID_04 = 'CRM_RFID_04', //Hủy thẻ RFID
  CRM_RFID_05 = 'CRM_RFID_05', //Chuyển chủ quyền phương tiện
  CRM_RFID_06 = 'CRM_RFID_06', //Cập nhật trạng thái thẻ RFID
  CRM_CONTRACT_01 = 'CRM_CONTRACT_01', //Tra cứu hợp đồng
  CRM_CONTRACT_02 = 'CRM_CONTRACT_02', //Xem chi tiết hợp đồng
  CRM_CONTRACT_03 = 'CRM_CONTRACT_03', //Ký mới hợp đồng
  CRM_CONTRACT_04 = 'CRM_CONTRACT_04', //Ký phụ lục hợp đồng
  CRM_CONTRACT_05 = 'CRM_CONTRACT_05', //Thay đổi thông tin hợp đồng
  CRM_CONTRACT_06 = 'CRM_CONTRACT_06', //Tách hợp đồng
  CRM_CONTRACT_07 = 'CRM_CONTRACT_07', //Gộp hợp đồng
  CRM_CONTRACT_08 = 'CRM_CONTRACT_08', //Chấm dứt hợp đồng
  CRM_PROFILE_01 = 'CRM_PROFILE_01', //Tra cứu hồ sơ
  CRM_PROFILE_02 = 'CRM_PROFILE_02', //Phê duyệt hồ sơ
  CRM_PROFILE_03 = 'CRM_PROFILE_03', //Bổ sung hồ sơ
  CRM_PROFILE_04 = 'CRM_PROFILE_04', //Service tự động đóng thẻ
  CRM_EXCEPTION_01 = 'CRM_EXCEPTION_01', //Quản lý danh sách phương tiện ưu tiên/cấm (whilelist/backlist)
  CRM_EXCEPTION_02 = 'CRM_EXCEPTION_02', //Quản lý danh sách ngoại lệ
  CRM_CATEGORY_01 = 'CRM_CATEGORY_01', //Danh mục loại tác động
  CRM_CATEGORY_02 = 'CRM_CATEGORY_02', //Danh mục lý do tác động
  CRM_CATEGORY_03 = 'CRM_CATEGORY_03', //Cấu hình chứng từ theo loại tác động
  CRM_CATEGORY_04 = 'CRM_CATEGORY_04', //Cấu hình chứng từ cho loại khách hàng
  CRM_POLICY_01 = 'CRM_POLICY_01', //Quản lý chiết khấu/ khuyến mại
  CRM_POLICY_02 = 'CRM_POLICY_02', //Danh mục phí dịch vụ
  CRM_POLICY_03 = 'CRM_POLICY_03', //Quản lý giá vé, bảng cước
  CRM_SEARCH_01 = 'CRM_SEARCH_01', //Tra cứu thông tin thẻ RFID
  CRM_SEARCH_02 = 'CRM_SEARCH_02', //Xem chi tiết thông tin thẻ RFID
  CRM_SEARCH_03 = 'CRM_SEARCH_03', //Tra cứu đại lý/ điểm bán
  CRM_SEARCH_04 = 'CRM_SEARCH_04', //Tra cứu lịch sử tác động
  CRM_SEARCH_05 = 'CRM_SEARCH_05', //Xem chi tiết lịch sử tác động
  CRM_SEARCH_06 = 'CRM_SEARCH_06', //Tra cứu lịch sử xe qua trạm
  CRM_SEARCH_07 = 'CRM_SEARCH_07', //Xem chi tiết thông tin điểm cung cấp dịch vụ
  CRM_REPORT_01 = 'CRM_REPORT_01', //Báo cáo tổng hợp tác động sau bán
  CRM_REPORT_02 = 'CRM_REPORT_02', //Báo cáo chi tiết tác động sau bán
  CRM_REPORT_03 = 'CRM_REPORT_03', //Báo cáo giao dịch theo Khách hàng
  CRM_REPORT_04 = 'CRM_REPORT_04', //Báo cáo thống kê thẻ RFID
  CRM_REPORT_05 = 'CRM_REPORT_05', //Báo cáo phương tiện đặc biệt
  CRM_REPORT_06 = 'CRM_REPORT_06', //Báo cáo chi tiết phát triển khách hàng
  CRM_REPORT_07 = 'CRM_REPORT_07', //Báo cáo tổng hợp phát triển khách hàng
  CRM_REPORT_08 = 'CRM_REPORT_08', //Báo cáo tổng hợp khách hàng
  TOPUP_01 = 'TOPUP_01', //Cấu hình hạn mức
  TOPUP_02 = 'TOPUP_02', //Chuyển tiền cho trạm trưởng
};
