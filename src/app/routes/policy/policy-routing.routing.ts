import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanDeactivateGuard } from '@app/core/guards/can-dead-active';
import { ManageFeeComponent } from './manage-fee/manage-fee.component';
import { AddNewComponent } from './pricelist-add/add-new-pricelist/add-new-pricelist.component';
import { PricelistAddComponent } from './pricelist-add/pricelist-add.component';
import { PriceListIndexComponent } from './pricelist-index/pricelist-index.component';
import { PromotionAddEditComponent } from './promotion-add-edit/promotion-add-edit.component';
import { PromotionComponent } from './promotion/promotion.component';

const routes: Routes = [
  {
    path: 'promotion',
    component: PromotionComponent,
    data: {
      title: 'menu.policy.promotion'
    }
  },
  {
    path: 'promotion/:id/:view',
    component: PromotionAddEditComponent,
    data: {
      title: 'menu.policy.promotion'
    },
    canDeactivate: [CanDeactivateGuard]
  },
  {
    path: 'manage-fee',
    component: ManageFeeComponent,
    data: {
      title: 'menu.policy.servicefee'
    }
  },
  {
    path: 'pricelist',
    component: PriceListIndexComponent,
    data: {
      title: 'menu.policy.pricelist'
    }
  },
  {
    path: 'pricelist_add',
    component: PricelistAddComponent,
    canDeactivate: [CanDeactivateGuard]
  },
  {
    path: 'pricelist_edit/:servicePlanId',
    component: AddNewComponent,
    canDeactivate: [CanDeactivateGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [CanDeactivateGuard]
})

export class PolicyRoutingRoutes { }
