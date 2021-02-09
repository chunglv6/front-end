import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared/shared.module';
import { PriceListIndexComponent} from './pricelist-index/pricelist-index.component'
import { PolicyRoutingRoutes } from './policy-routing.routing';
import { AddNewComponent } from './pricelist-add/add-new-pricelist/add-new-pricelist.component';
import { ImportPricesListComponent } from './pricelist-add/import-prices-list/import-prices-list.component';
import { PricelistAddComponent } from './pricelist-add/pricelist-add.component';
import { PricelistComponent } from './pricelist/pricelist.component';
import { PromotionComponent } from './promotion/promotion.component';
import { PromotionAddEditComponent} from './promotion-add-edit/promotion-add-edit.component';
import { ManageFeeComponent} from './manage-fee/manage-fee.component';
import { ManageFeeAddEditComponent} from'./manage-fee-add-edit/manage-fee-add-edit.component';
import { PromotionAssignComponent } from './promotion-assign/promotion-assign.component';

@NgModule({
  declarations: [
    PriceListIndexComponent,
    PromotionComponent,
    PricelistComponent,
    PricelistAddComponent,
    AddNewComponent,
    ImportPricesListComponent,
    PromotionAddEditComponent,
    ManageFeeComponent,
    ManageFeeAddEditComponent,
    PromotionAssignComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    PolicyRoutingRoutes,
  ],
  entryComponents: []
})
export class PolicyModule { }
