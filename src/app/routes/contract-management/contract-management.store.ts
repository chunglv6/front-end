import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContractManagementStore {

  private _listContractDetach = new BehaviorSubject<any>(null);
  currentListContractDetach$ = this._listContractDetach.asObservable();
  constructor() { }
  changeListContractDetach(listContract) {
    this._listContractDetach.next(listContract);
  }

}
