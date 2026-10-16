// src/utils/receipt.ts
import type { TFunction } from 'i18next';
import {
  formatDateTime, formatDuration, formatMoneyString, getBillState,
} from './billiard';
import { getPricingSummary } from './pricing';
import type { BillResponse } from '../models/interfaces/Billiard';

const esc = (v: unknown) =>
  String(v ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export function buildReceiptHtml(bill: BillResponse, t: TFunction, shopName = 'Billiard Club'): string {
  const c = bill.currency;
  const state = getBillState(bill);

  //   const productFee = bill.product_fee ?? addDecimalStrings(bill.items.map((i) => i.line_total));
  const title =
    state === 'paid'
      ? t('billiard_tables.receipt.title')
      : t('billiard_tables.receipt.unpaidTitle');

  const pricing = getPricingSummary(bill);
  const billing = [pricing.policyLabel, pricing.paramsText].filter(Boolean).join(' · ');
  // const pricingHtml =
  //   pricing.rate !== null || pricing.ruleName || billing
  //     ? `<hr><div class="muted">
  //   ${pricing.rate !== null ? `Rate: ${esc(formatMoneyString(pricing.rate, c))} / h${pricing.ruleName ? ` (${esc(pricing.ruleName)})` : ''}<br>` : pricing.ruleName ? `Rule: ${esc(pricing.ruleName)}<br>` : ''}
  //   ${billing ? `Billing: ${esc(billing)}` : ''}
  // </div>`
  //     : '';

  const pricingHtml =
    pricing.rate !== null || pricing.ruleName || billing
      ? `<hr><div class="muted">
          ${pricing.rate !== null
        ? `${esc(t('billiard_tables.receipt.rate'))}: ${esc(formatMoneyString(pricing.rate, c))} / ${esc(t('billiard_tables.receipt.hourShort'))}${pricing.ruleName
          ? ` (${esc(pricing.ruleName)})`
          : ''
        }<br>`
        : pricing.ruleName
          ? `${esc(t('billiard_tables.receipt.rule'))}: ${esc(pricing.ruleName)}<br>`
          : ''
      }
          ${billing ? `${esc(t('billiard_tables.receipt.billing'))}: ${esc(billing)}` : ''}
        </div>`
      : '';


  const rows = bill.items
    .map(
      (it) => `
      <tr><td colspan="2">${esc(it.product_name)}</td></tr>
      <tr class="sub"><td>${it.quantity} × ${esc(formatMoneyString(it.unit_price, c))}</td>
          <td class="r">${esc(formatMoneyString(it.total_price, c))}</td></tr>`
    )
    .join('');

  const tableName =
    bill.table_name ??
    t('billiard_tables.receipt.tableNumber', { id: bill.table_id });

  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>
  @page { size: 80mm auto; margin: 4mm; }
  * { box-sizing: border-box; }
  body { font: 12px/1.4 "Courier New", monospace; width: 72mm; margin: 0 auto; color: #000; }
  h1 { font-size: 15px; text-align: center; margin: 0; }
  .c { text-align: center; } .r { text-align: right; }
  .muted { font-size: 11px; }
  hr { border: 0; border-top: 1px dashed #000; margin: 6px 0; }
  table { width: 100%; border-collapse: collapse; }
  .sub td { padding-bottom: 3px; font-size: 11px; }
  .total td { font-weight: bold; font-size: 14px; }
</style></head><body>
  <h1>${esc(shopName)}</h1>
  <div class="c">${esc(title)}</div>
  <hr>
  <div class="muted">
    ${esc(tableName)} · ${esc(t('billiard_tables.receipt.session', { id: bill.session_id }))}<br>
    ${esc(t('billiard_tables.receipt.start'))}:  ${esc(formatDateTime(bill.start_time))}<br>
    ${esc(t('billiard_tables.receipt.end'))}: ${esc(formatDateTime(bill.end_time))}<br>
    ${bill.duration_minutes != null
      ? `${esc(t('billiard_tables.receipt.duration'))}: ${esc(formatDuration(bill.duration_minutes))}`
      : ''
    }
  </div>
  ${pricingHtml}
  <hr>
  <table>
    <tr><td>${esc(t('billiard_tables.receipt.tableFee'))}</td><td class="r">${esc(formatMoneyString(bill.total_table_fee, c))}</td></tr>
    ${rows}
  </table>
  <hr>
  <table>
    <tr><td>${esc(t('billiard_tables.receipt.products'))}</td><td class="r">${esc(formatMoneyString(bill.total_product_fee, c))}</td></tr>
    <tr class="total"><td>${esc(t('billiard_tables.receipt.total'))}</td><td class="r">${esc(formatMoneyString(bill.grand_total, c))}</td></tr>
    ${state === 'paid' && bill.payment_method
      ? `<tr><td>${esc(t('billiard_tables.receipt.paidBy'))}</td><td class="r">${esc(bill.payment_method.replace('_', ' '))}</td></tr>` : ''}
  </table>
  <hr>
  <div class="c muted">
      ${esc(
        state === 'paid'
          ? t('billiard_tables.receipt.thankYou')
          : t('billiard_tables.receipt.checkBillBeforePaying'),
      )}
  </div>
</body></html>`;
}

/** Prints HTML through a hidden iframe so the app's own CSS never leaks into the receipt. */
export function printHtml(html: string) {
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  document.body.appendChild(iframe);

  const win = iframe.contentWindow!;
  win.document.open();
  win.document.write(html);
  win.document.close();

  setTimeout(() => {
    win.focus();
    win.print();
    setTimeout(() => iframe.remove(), 1000);
  }, 150);
}