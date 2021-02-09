import { Injectable } from '@angular/core';
import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';
import { HelperService } from '@app/shared/services/helper.service';
import { environment } from '@env/environment';
import { CommonUtils } from '@app/shared/services/common-utils.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TicketPricesService extends BasicService {

  constructor(public httpClient: HttpClient, public helperService: HelperService) {
    super(environment.serverUrl.api, environment.API_PATH.BASE_API_PATH, httpClient, helperService);
  }

  // Thien tra cứu giá vé ,bảng cước
  searchTicketPrices(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/ticket-prices`;
    return this.getRequest(url, { params: buildParams });
  }

  // Thiện thêm service phê duyệt giá vé
  approvalOrRejectTicketPrices(data: any, controller?: string) {
    const url = `${this.serviceUrl}/ticket-prices/${controller}`;
    return this.putRequest(url, data);
  }
  // Thiện thêm service export excel
  exportExcel(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const url = `${this.serviceUrl}/ticket-prices/exports`;
    return this.postRequestFile2(url, searchData);
  }

  // service dowload file dữ liệu mẫu
  downloadTemplateTicketPrice() {
    const url = `${this.serviceUrl}/ticket-prices/download-template`;
    return this.postRequestFile(url);
  }

  // import file price ticket
  importFilePriceList(data: any) {
    const url = `${this.serviceUrl}/ticket-prices/import`;
    return this.postRequestFile2(url, data);
  }

  // Thiện thêm service save giá vé ,bảng cước
  addNewTicketPrices(data: any) {
    const url = `${this.serviceUrl}/ticket-prices`;
    return this.postRequest(url, CommonUtils.convertData(data));
  }

  // Thiện thêm service save giá vé ,bảng cước
  updateTicketPrices(data: any, servicePlanId: number) {
    const url = `${this.serviceUrl}/ticket-prices/${servicePlanId}`;
    return this.putRequest(url, CommonUtils.convertData(data));
  }

  // xóa bản ghi theo id
  deleteTicketPricesById(servicePlanId: number) {
    const url = `${this.serviceUrl}/ticket-prices/${servicePlanId}`;
    return this.deleteRequest(url);
  }

  // huy ban ghi co trang thai da duyet
  cancelApprovalTicketPricesById(id: number) {
    const url = `${this.serviceUrl}/ticket-prices/${id}/cancel`;
    return this.putRequest(url);
  }
  // get record price theo id
  findTicketPricesById(servicePlanId: number) {
    const url = `${this.serviceUrl}/ticket-prices/${servicePlanId}`;
    return this.getRequest(url);
  }

  downloadProfileTicketPrices(profileId: number) {
    const url = `${this.serviceUrl}/ticket-prices/profiles/${profileId}/download`;
    return this.postRequestFile(url);
  }

  deleteProfilesTicketPrices(profileId: number) {
    const url = `${this.serviceUrl}/ticket-prices/profiles/${profileId}`;
    return this.putRequest(url);
  }
}
@Injectable({
  providedIn: 'root'
})
export class DataService  {

  private messageSource = new BehaviorSubject<any>(['']);
  currentMessage = this.messageSource.asObservable();

  constructor( ) {
    // super(environment.serverUrl.api, environment.API_PATH.CategoriesListController, httpClient, helperService);
  }

  changeMessage(message: any) {
    this.messageSource.next(message);
  }
}
