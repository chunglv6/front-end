import { Routes, RouterModule } from '@angular/router';
import { BriefcaseIndexComponent } from './briefcase-index/briefcase-index.component';
import { NgModule } from '@angular/core';
import { BriefcaseApproveComponent } from './briefcase-approve/briefcase-approve.component';
import { BriefcaseAddComponent } from './briefcase-add/briefcase-add.component';
import { BriefcaseDenialComponent } from './briefcase-approve/briefcase-denial/briefcase-denial.component';

const routes: Routes = [
  {
    path: 'search',
    component: BriefcaseIndexComponent,
  },
  {
    path: 'approve',
    component: BriefcaseApproveComponent,
  },
  {
    path: 'additional',
    component: BriefcaseAddComponent,
  },
  {
    path: 'denial',
    component: BriefcaseDenialComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BriefcaseRoutingRoutes {}
