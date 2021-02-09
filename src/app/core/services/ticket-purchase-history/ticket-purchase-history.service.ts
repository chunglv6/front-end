import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from '@app/shared/services/helper.service';
import { environment } from '@env/environment';
import { BasicService } from '../basic.service';

@Injectable({
  providedIn: 'root'
})
export class TicketPurchaseHistoryService extends BasicService {

  constructor(public httpClient: HttpClient, public helperService: HelperService) {
    super(environment.serverUrl.api, environment.API_PATH.BASE_API_PATH, httpClient, helperService);
  }
  /**
   * lấy danh sách vé theo id hợp đồng
   * @param idContract id hợp đồng
   */
  getTicketbyContractId(idContract: number, startRecord: number, pageSize: number) {
    const url = `${this.serviceUrl}/ticket-purchase-efficiency-histories?contractId=${idContract}&startRecord=${startRecord}&pageSize=${pageSize}`;
    return this.getRequest(url);
  }
  /**
   * danh sách các vé tháng quý yêu cầu hủy
   * @param subscriptionTicketId id mua vé
   * @param saleTransDelBoo1DTO body
   */
  destroyTicketRefund(subscriptionTicketId: number, saleTransDelBoo1DTO: any) {
    const url = `${this.serviceUrl}/ticket/destroy/refund/${subscriptionTicketId}`;
    return this.postRequest(url, saleTransDelBoo1DTO);
  }
  /**
   * lấy lịch sử mua vé theo hợp đồng(không hoàn tiền)
   * @param contractId id hợp đồng
   * @param startRecord index
   * @param pageSize limit
   */
  searchTicketHistories(contractId: number, startRecord: any, pageSize: number) {
    const url = `${this.serviceUrl}/ticket-histories?contractId=${contractId}&startRecord=${startRecord}&pageSize=${pageSize}`;
    return this.getRequest(url);
  }
  /**
   * hủy vé không hoàn tiền
   * @param saleTransDetailId  saleTransDetailId
   * @param saleTransDetailDTO body
   */
  destroyTicketNotRefund(saleTransDetailId: number, saleTransDetailDTO: any) {
    const url = `${this.serviceUrl}/ticket/destroy/not-refund/${saleTransDetailId}`;
    return this.postRequest(url, saleTransDetailDTO);
  }
  /**
   * Hủy gia hạn tự động
   * @param saleTransDetailId  saleTransDetailId
   * @param saleTransDetailDTO  saleTransDetailDTO
   */
  cancelAutoRenew(saleTransDetailId: number, saleTransDetailDTO: any) {
    const url = `${this.serviceUrl}/ticket/cancel/autoRenew/${saleTransDetailId}`;
    return this.postRequest(url, saleTransDetailDTO);
  }
  /**
   * Gia hạn tự động
   * @param saleTransDetailId saleTransDetailId
   * @param saleTransDetailDTO saleTransDetailDTO
   */
  registerAutoRenew(saleTransDetailId: number, saleTransDetailDTO: any) {
    const url = `${this.serviceUrl}/ticket/auto-renew/${saleTransDetailId}`;
    return this.postRequest(url, saleTransDetailDTO);
  }
}
