import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { InforRegisterVehicleModel } from '@app/core/models/customer-register.model';
import { CreateVehicleSuccessModel } from '@app/core/models/common.model';

@Injectable({
  providedIn: 'root'
})
export class RouteStore {

  private _backToRegisterVehicle = new BehaviorSubject<boolean>(null);
  currentBackToRegisterVehicle$ = this._backToRegisterVehicle.asObservable();

  private _backToRegisterContract = new BehaviorSubject<boolean>(null);
  currentBackToRegisterContract$ = this._backToRegisterContract.asObservable();

  private _sendToBuyTicket = new BehaviorSubject<any>(null);
  sendToBuyTicket$ = this._sendToBuyTicket.asObservable();

  private _sendInforRegisterVehicle = new BehaviorSubject<InforRegisterVehicleModel>(null);
  sendInforRegisterVehicle$ = this._sendInforRegisterVehicle.asObservable();

  private _assignStatusRfid = new BehaviorSubject<boolean>(null);
  assignStatusRfid$ = this._assignStatusRfid.asObservable();

  private _changeImportVehicleSuccess = new BehaviorSubject<boolean>(null);
  changeImportVehicleSuccess$ = this._changeImportVehicleSuccess.asObservable();

  private _sendToCustomerInfo = new BehaviorSubject<CreateVehicleSuccessModel>(null);
  sendToCustomerInfor$ = this._sendToCustomerInfo.asObservable();

  private _fireEventImportVehicle = new BehaviorSubject<CreateVehicleSuccessModel>(null);
  eventImportVehicle$ = this._fireEventImportVehicle.asObservable();
  constructor() { }

  changeBackToRegisterVehicle(value: boolean) {
    this._backToRegisterVehicle.next(value);
  }

  changeBackToRegisterContract(value: boolean) {
    this._backToRegisterContract.next(value);
  }

  sendToBuyTicket(value: any) {
    this._sendToBuyTicket.next(value);
  }

  sendInforRegisterVehicle(param: InforRegisterVehicleModel) {
    this._sendInforRegisterVehicle.next(param);
  }

  successAssignStatusRfid(value: boolean) {
    this._assignStatusRfid.next(value);
  }

  changeImportVehicleSuccess(value: boolean) {
    this._changeImportVehicleSuccess.next(value);
  }

  changeSendToCustomerInfor(param: CreateVehicleSuccessModel) {
    this._sendToCustomerInfo.next(param);
  }
  /**
   * Bắn từ router khác sang màn import phương tiện thành công(chưa thành công cũng sang)
   * @param param gồm custId & contractID
   */
  fireEventImportVehicle(param: CreateVehicleSuccessModel) {
    this._fireEventImportVehicle.next(param);
  }
}
