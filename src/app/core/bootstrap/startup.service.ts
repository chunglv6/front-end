import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

import { MenuService } from './menu.service';
import { AppStorage } from '../services/AppStorage';

@Injectable({
  providedIn: 'root',
})
export class StartupService {
  constructor(private _menu: MenuService, private _http: HttpClient) { }

  load(): Promise<any> {
    return new Promise((resolve, reject) => {
      let menuJson = 'assets/data/menu.json';
      if (AppStorage.getPartnerCode() == 'VIETTEL_POST') {
        menuJson = 'assets/data/menu-vtpost.json';
      } else if (AppStorage.getPartnerCode() && AppStorage.getPartnerCode().includes('BOT')) {
        menuJson = 'assets/data/menu-station.json';
      }
      this._http
        .get(menuJson + '?_t=' + Date.now())
        .pipe(
          catchError(res => {
            resolve();
            return res;
          })
        )
        .subscribe(
          (res: any) => {
            this._menu.recursMenuForTranslation(res.menu, 'menu');
            this._menu.set(res.menu);
          },
          () => {
            reject();
          },
          () => {
            resolve();
          }
        );
    });
  }
}
