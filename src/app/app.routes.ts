import { Routes } from '@angular/router';
import { Customerpremiumschedule } from './customerpremiumschedule/customerpremiumschedule';
import { Adminpremium } from './adminpremium/adminpremium';
import { Customerrefund } from './customerrefund/customerrefund';
import { Adminrefund } from './adminrefund/adminrefund';
import { Paymenthistory } from './paymenthistory/paymenthistory';
import { Paymentreceipt } from './paymentreceipt/paymentreceipt';

export const routes: Routes = [
 

  {
  path: 'customer-premium-schedule',
  component: Customerpremiumschedule
},
{
  path: 'admin-premium',
  component: Adminpremium
},
{
  path: 'customer-refund',
  component: Customerrefund
},
{
  path: 'admin-refund',
  component: Adminrefund
},

{
  path: 'payment-history',
  component: Paymenthistory
},
{
  path: 'payment-receipts',
  component: Paymentreceipt
}


];