import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from '@app/shared/services/helper.service';
import { environment } from '@env/environment';
import { BasicService } from '../basic.service';

@Injectable({
  providedIn: 'root'
})
export class TopupMoneyService extends BasicService {

  constructor(public httpClient: HttpClient, public helperService: HelperService) {
    super(environment.serverUrl.api, environment.API_PATH.BASE_API_PATH, httpClient, helperService);
  }
  getUserTopups(accountUser: string, topupDate: string, startrecord?: number, pagesize?: number) {
    const url = `${this.serviceUrl}/topup-ctv/users?accountUser=${accountUser}&topupDate=${topupDate}&startrecord=${startrecord}&pagesize=${pagesize}`;
    return this.getRequest(url);
  }
  getAccount(user: string) {
    const url = `${this.serviceUrl}/topup-ctv/users?user=${user}`;
    return this.getRequest(url);
  }
  topUpMoney(body: any) {
    const url = `${this.serviceUrl}/topup-ctv/add-balance`;
    return this.postRequest(url, body);
  }
  getMember(accountUser: string) {
    const url = `${this.serviceUrl}/topup-ctv/members?accountUser=${accountUser}`;
    return this.getRequest(url);
  }
  getDetailUser(accountUser: string) {
    const url = `${this.serviceUrl}/topup-ctv/users/${accountUser}`;
    return this.getRequest(url);
  }
  updateConfig(body: any) {
    const url = `${this.serviceUrl}/topup-ctv/users`;
    return this.putRequest(url, body);
  }
  addConfig(body: any) {
    const url = `${this.serviceUrl}/topup-ctv/users`;
    return this.postRequest(url, body);
  }
  deleteConfig(accountUser: string) {
    const url = `${this.serviceUrl}/topup-ctv/users/${accountUser}`;
    return this.deleteRequest(url);
  }
}

