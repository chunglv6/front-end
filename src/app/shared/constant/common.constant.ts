export const gender = [
  {
    code: '1',
    value: 'Nam',
  },
  {
    code: '2',
    value: 'Nữ',
  },
  {
    code: '3',
    value: 'Không xác định',
  },
];
export const STATUS_CONTRACT = {
  CHUAHOATDONG: '1',
  HOATDONG: '2',
  HUY: '3',
  CHAMDUT: '4',
};
export const STATUS_RFID_VEHICLE = {
  CHUAKICHHOAT: '0',
  HOATDONG: '1',
  HUY: '2',
  DONG: '3',
  MO: '4',
  DACHUYENNHUONG: '5',
};
export const STATUS_BRIEFCASE = {
  CHUATIEPNHAN: '1',
  DAPHEDUYET: '2',
  BITUCHOI: '3',
  BOSUNG: '4',
};
export const OBJECTS_ACTION = {
  TATCA: '',
  KHACHHANG: '1',
  HOPDONG: '2',
  PHUONGTIEN: '3',
  THERFID: '4',
};
// sau co api đại lý,điểm bán sẽ xóa
export const SHOPS = {
  TATCA: '0',
  DaiLY1: '1',
  DAILY2: '2',
  DIEMBAN1: '3',
  DIEMBAN2: '4',
};
export const TYPEFILES = {
  CHUNGTUGOC: '1',
  CHUNGTUTHAYTHE: '2',
};
export const STATUS_DOCUMENT_TYPE = {
  HOATDONG: '1',
  KHONGHOATDONG: '0',
};

export const ACTION_TYPE = {
  DANG_KY_KH: 2,
  DANG_KY_PT: 3,
  THAY_DOI_KH: 4,
  THAY_DOI_PT: 5,
  BO_SUNG_HD: 6,
  BO_SUNG_PT: 7,
  KHOA_TK_KH: 8,
  HUY_KH: 9,
  HUY_LIEN_KET_THANH_TOAN: 10,
  KYMOIHOPDONG: 11,
  KYPHULUCHOPDONG: 12,
  LIEN_KET_VIETTEL_PAY: 13,
  THAY_DOI_HD: 14,
  TACH_HD: 15,
  GOP_HD: 16,
  CHAM_DUT_HD: 17,
  KICHHOATTHE: 18,
  CHUYENTHE: 19,
  KHOATHE: 20,
  MOTHE: 21,
  HUYTHE: 22,
  CHUYEN_CHU_QUYEN_PT: 23,
  MUA_VE_THANG_QUY: 24,
  HUY_VE_THANG_QUY: 25,
  PHE_DUYET_HO_SO: 26,
  DANG_KY_CT_KM_KH: 27,
  DANG_KY_CT_KM_PT: 28,
  DANG_KY_NGOAI_LE_PT: 29,
  DANG_KY_UUTIEN_PT: 30,
  DANG_KY_CAM_PT: 31,
  NAP_TIEN_VAO_TK: 32,
  RESET_MAT_KHAU: 33,
  GAN_THE: 42,
  HUY_VE_CO_HOAN_TIEN: 37,
  HUY_VE_KHONG_HOAN_TIEN: 38,
  DOI_BIEN: 101,
};
export const BUY_TICKET = {
  TRAM_KIN: 0,
  TRAM_MO: 1,
  TINH_THUONG: '1',
  TINH_BLOCK: '2',
  STATUS: 2,
};
export const PASSWORD = {
  RESET_PWD: 'Viettel@2020',
};
export const STATUS_VEHICLE = {
  KHONGHOATDONG: '0',
  HOATDONG: '1',
  IMPORT: '2',
  KHOP: '3',
  KHONGKHOP: '4',
};
export const LIST_FUNC = {
  KICHHOATTHE: 1,
  KHOATHE: 2,
  MOTHE: 3,
  HUYTHE: 4,
};
export const PAYCHARGE = {
  PAY: 24,
  OFFERLEVEL: 2,
  QUANTITY: 1,
  OFFERID: 899,
};
export const STATUS_CONTRACT_PROFILE = {
  CT_DACO: 1,
  CT_THIEU: 2,
  CT_GIAMAO: 3,
};
export const STATUS_VEHICLE_PROFILE = {
  CT_DACO: 1,
  CT_THIEU: 2,
  CT_GIAMAO: 3,
};
export const STATION_TYPE = {
  TRAM_KIN: '0',
  TRAM_MO: '1',
};
export const TICKET_TYPE = {
  VE_THANG: 4,
  VE_QUY: 5,
};
export const QUARTER_YEAR = {
  QUY1: 1,
  QUY2: 2,
  QUY3: 3,
  QUY4: 4,
};
export const STATUS_ACTION = {
  THANHCONG: 1,
  KHONGTHANHCONG: 2,
};

export const CUSTOMER_TYPE = {
  CA_NHAN: 1,
  DOANH_NGHIEP: 2,
};
export const CUSTOMER_TYPE_ID = {
  CA_NHAN_TRONG_NUOC: 1,
  CONG_TY_CO_PHAN: 2,
  CONG_TY_TNHH: 3,
  DOANH_NGHIEP_NHA_NUOC: 4,
  DOANH_NGHIEP_TU_NHAN: 5,
  CO_QUAN_NHA_NUOC: 6,
  CA_NHAN_NUOC_NGOAI: 7,
};
export const TYPEFEES = {
  THUPHIKIN: 0,
  THUPHIMO: 1,
};
export const HTTP_CODE = {
  SUCCESS: 1, // Thành công
  ALREADY_EXIST_DOCUMENT_NO: 3, // Đã tồn tại số giấy tờ
  ALREADY_EXIST_EMAIL: 21, // Đã tồn tại email
  SERIAL_NOT_FOUND: 179,
  UNDEFINED: 500,
  ALREADY_EXIST_TAX_NO: 173, // Đã tồn tại mã số thuế
  TOKEN_DEAD: 401, // Token hết hạn
  ALREADY_EXIST_PLATE_NUMBER: 181,
  ALREADY_EXIST_SERIAL: 54,
  NOT_FOUND_GROUP_VEHICLE: 43,
  NOT_EXIT_VEHICLE_GROUP: 5,
  ALREADY_EXIST_PLATE_NUMBER_OCS: 58,
  ERROR_CALL_IM: 33,
  STATUS_ERROR: 84,
  VEHICLE_CAN_NOT_DELETE: 10,
};
export const SCOPE = {
  TOANQUOC: 1,
  DOAN: 4,
  TRAM: 3,
};
export const STATUS_HANDLE = {
  CHODUYET: 1,
  DADUYET: 2,
  TUCHODUYET: 3,
  DAHUYHIEULUC: 4,
};
export const CONTRACT_PROFILE_STATUS = {
  CHOTIEPNHAN: 1,
  DADUYET: 2,
  TUCHOI: 3,
  BOSUNG: 4,
};
export const IMPORT_FILE = {
  CMT: 1,
  ACCEPT_ACCOUNT: 2,
};
export const CONNECT_VTP = {
  ACTIONTYPE: 13,
};
export const SOURCE_MONEYVTP = {
  VIETTEL_PAY: 'MB',
  MOBILE_MM: 'MM',
};
export const IC_VTP = {
  CMND: 'CMND',
  CMQD: 'CMQĐ',
  HC: 'HC',
  CCCD: 'TCC',
};
export const IS_OCS = {
  CO_DAU_NOI: 1,
  KHONG_DAU_NOI: 0,
};
export const LIST_OCS = [
  {
    code: '1',
    value: 'Có',
  },
  {
    code: '0',
    value: 'Không',
  },
];
export const STATUS = [
  {
    code: '1',
    value: 'Hoạt động',
  },
  {
    code: '0',
    value: 'Không hoạt động',
  },
];
export const STATUS_SPECIAL_VEHICLE = {
  CREATE_NEW: 1, // tạo mới
  PENDING: 2, // chờ duyệt
  REJECT: 3, // từ chối duyệt
  APPROVED: 4, // đã duyệt
  ACTIVATED: 5, // đang hiệu lực
  INACTIVED: 6, // hết hiệu lực
  CANCELLED_EXPIRE: 7, // đã hủy hiệu lực
};

export const SPECIAL_PRIORITY = {
  VEHICLE: 1,
  TICKET: 2,
  PRIORITY: 3,
  FORBIDDEN: 4,
};

export const STATUS_PROMOTION = {
  MOITAO: 0,
  HIEULUC: 1,
  HETHIEULUC: 2,
};

export const STATUS_MANAGE_FEE = {
  TAOMOI: 0,
  DADUYET: 1,
};

export const TYPE_PROMOTION = {
  KHUYENMAI: 1,
  CHIETKHAU: 2,
  MIENGIAM: 3,
};

export const METHOD_PROMOTION = {
  SOTIEN: 1,
  PHANTRAM: 2,
};

export const TYPE_OBJECT = {
  CUSTOMER: '0',
  CONTRACT: '1',
  VEHICLE: '2',
};
export const TRANSACTION_STATUS = {
  UNPAID: 1,
  PAID_NO_INVOICE: 2,
  BILLED: 3,
  CANCEL: 4,
};
export const BOT_COMFIRM = {
  SUCCESS: 1,
  REJECT: 2,
  RECEIVED: 3,
};
export const PLATE_TYPE_COLOR = {
  WHITE: '1',
  YELLOW: '6',
  BLUE: '2',
};
