import { Routes, RouterModule } from '@angular/router';
import { SearchTagRFIDComponent } from './search-tag-rfid/search-tag-rfid.component';
import { VehicleHistoryViaStationComponent } from './vehicle-history-via-station/vehicle-history-via-station.component';
import { SearchHistoryActionComponent } from './search-history-action/search-history-action.component';
import { SearchAgencyComponent } from './search-agency/search-agency.component';
import { CustRegisComponent } from './cust-regis/cust-regis.component';
import { TopupEtcComponent } from './topup-etc/topup-etc.component';

const routes: Routes = [
  {
    path: 'search-tag-rfid', component: SearchTagRFIDComponent,
    data: {
      title: 'menu.search-info.search-rfid'
    }
  },
  {
    path: 'vehicle-history-via-station', component: VehicleHistoryViaStationComponent,
    data: {
      title: 'menu.search-info.vehicle-history-via-station'
    }
  },
  {
    path: 'search-history-action', component: SearchHistoryActionComponent,
    data: {
      title: 'menu.search-info.search-history-action'
    }
  },
  {
    path: 'search-agency', component: SearchAgencyComponent,
    data: {
      title: 'menu.search-info.search-agency'
    }
  },
  {
    path: 'search-transaction',
    loadChildren: () =>
      import('./transaction/transaction.module').then(
        m => m.TransactionModule
      ),
    data: {
      title: 'menu.search-info.search-transaction',
    },
  },
  {
    path: 'cust-regis', component: CustRegisComponent,
    data: {
      title: 'menu.search-info.cust-regis'
    }
  },
  {
    path: 'topup-etc', component: TopupEtcComponent,
    data: {
      title: 'menu.search-info.topup-etc'
    }
  }
];

export const SearchInformationRoutes = RouterModule.forChild(routes);
