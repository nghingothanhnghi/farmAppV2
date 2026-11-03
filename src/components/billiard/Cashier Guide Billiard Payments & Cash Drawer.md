# Cashier Guide: Billiard Payments & Cash Drawer

Oct 22, 2026 · @Someone

## Before you start

You can take a payment once the table's session is stopped and the bill is on screen. Any logged-in user can take payments; only managers can void a payment or use the Bank inbox.

1. Log in and go to **Billiard**.
2. Click the table to open its session page.
3. Press **Stop** on a running session. The page now shows the bill and a **Pay** button.
4. Open a cash shift first (**Billiard → Cash drawer**, see "Cash drawer" below). Some clubs refuse payment until a shift is open, and the Pay window warns "No cash shift is open" with an **Open a shift** link.

Never type the bill total. The Pay window title shows the amount to collect, for example "Pay 310.000 ₫". If part of the bill is already paid, it shows only what is left.

## Paying cash

For cash, type what the customer hands over and the screen shows the change.

1. Press **Pay** and choose **Cash**.
2. Enter the amount the customer hands over in **Amount handed over**, or tap a quick button: **Exact**, 50.000, 100.000, 200.000 or 500.000.
3. Read the **Change** line under the field and give that change back.
4. Press **Pay**. The receipt appears.

Leaving the field empty (or pressing **Exact**) records an exact payment with no change. If the amount is below the bill, a red "Short by…" message appears and **Pay** stays disabled.

## Paying by bank transfer

The customer scans a QR code and the system usually confirms the money by itself within seconds.

1. Press **Pay**, choose **Bank transfer**, press **Pay**. The page switches to **Waiting for bank transfer** and the bill shows "Payment in progress".
2. Show the QR code to the customer, who scans it in their banking app.
3. Check that the customer's transfer has the right **amount** and the **memo** (transfer note, for example PAY7L2). The memo must stay unchanged, because the system matches the payment by it.
4. Wait. The page refreshes every 4 seconds. When the bank reports the money, the bill turns **Paid** and the receipt appears on its own. You do not need to press anything.

**If there is no QR code:** the page shows the bank, account number and account name instead. The customer types these in, with the amount and the memo.

**If the customer shows a successful transfer but the page has not changed:** open your bank app and check that the money arrived. Only then press **Received**. Never press Received without seeing the money.

**QR timer:** "QR valid for mm:ss" counts down. After it ends the QR is greyed out, but **Received** and **Cancel** still work, because the customer may have paid already.

**If the customer did not pay or wants another method:** press **Cancel** (a reason is optional). The bill goes back to unpaid, and you can pay again, which creates a new QR.

## Split payment

Use a split when the customer pays with more than one method, for example part cash and part transfer. The lines must add up exactly to what is owed.

1. Press **Pay** and choose **Split**.
2. On line 1, choose **Cash** or **Bank transfer** and type the amount. For cash you can also type the amount handed over.
3. Press **Add line** for each further part (up to 6 lines). A new line is prefilled with the amount still remaining.
4. Watch **Remaining**. It must be exactly 0 and turns green. **Pay** stays disabled until then.
5. Press **Pay**. Cash lines are paid at once. A bank transfer line moves to the waiting screen: follow "Paying by bank transfer" for that part.

Good to know:

- Card (Stripe) cannot be part of a split.
- Every amount must be above 0, and cash handed over cannot be less than that line's amount.
- If a transfer is cancelled, the cash part stays paid. The bill shows **Paid so far** and **Balance due**, and **Pay** opens for the balance only.

## Card payment (Stripe)

Card is a separate method from cash and transfer, and it can only be used for the whole bill.

1. Press **Pay**, choose **Card (Stripe)**, press **Pay**.
2. The window moves to the card step. Complete the card payment through Stripe.
3. When Stripe shows success, press **Confirm payment**. The bill turns **Paid** and the receipt appears.

If the page is reloaded or closed before you confirm, the bill shows "Payment in progress" with a **Confirm payment** button. Only press it after Stripe has accepted the card.

Note for the club owner: the app does not yet have its own card form built in, so the window shows "Complete the card payment, then confirm to settle the bill" and the Confirm payment button. If your club does not use Stripe, ask your developer to hide the Card option.

## After payment: receipt, part payments and mistakes

When a bill is paid, the **Receipt** card lists every payment line with its method and amount. Cash lines show the amount handed over and the change. It also shows when the bill was paid and who received it: your name, or "Confirmed automatically by the bank" when the bank feed settled it. Use **Print receipt** for the customer's copy. Very old bills show "Settled" with no line detail, which is normal.

A bill that is only partly paid shows a **Payments** card with **Paid so far** and **Balance due**. Press **Pay** to collect the rest.

Each payment line has a status:

| Status | What it means | What you do |
| --- | --- | --- |
| Waiting | A bank transfer is expected | Wait, then Received or Cancel |
| Paid | Money recorded | Nothing |
| Cancelled | You cancelled the transfer (greyed out) | Pay again if still owed |
| Voided | A manager reversed it (greyed out, with the reason) | Pay again if still owed |
| Failed | "This payment could not be recorded" | Pay the balance again |

**Wrong amount or change given by mistake?** Only a manager can reverse a paid line. The manager presses **Void** on that line and types a reason of at least 3 characters (for example "gave too much change"). The bill reopens and can be paid again. If you press it yourself you see "Only a manager can do this."

## Cash drawer (shifts)

A shift is one cashier's period with the drawer, from the opening count to the closing count. Find it under **Billiard → Cash drawer**.

**Open a shift (start of work)**

1. Count the cash in the drawer.
2. Enter it as the **Opening float** (empty counts as 0). Add a note if you like.
3. Press **Open shift**. If a shift is already open, you see a message and that shift loads instead.

**During the shift**

The page shows the **Expected cash in drawer** and the figures behind it: opening float, cash sales, cash voids, pay-ins, pay-outs, and totals per payment method. Change you gave is already taken out of cash sales.

- **Pay in** records cash you put into the drawer.
- **Pay out** records cash you take out, for example to buy supplies.
- Both ask for an amount and a reason of at least 3 characters, and appear under **Cash movements**.

**Close the shift (end of work)**

1. Count all the cash in the drawer.
2. Press **Close shift**, enter the **Counted cash** (and a note if needed), press **Close shift**.
3. Read the result: expected cash, counted cash and **Variance** (counted minus expected).

| Variance | Colour | Meaning |
| --- | --- | --- |
| 0 | Green | The drawer matches |
| Negative | Red, "cash missing" | Less cash than expected |
| Positive | Amber | More cash than expected |

Only the person who opened the shift, or a manager, can close it. **History** lists the last 30 shifts; press **Load more** for older ones, or click a row to see its full detail.

## Bank inbox (managers only)

The Bank inbox (**Billiard → Bank inbox**) lists incoming bank transfers that the system could not settle on its own. Only managers and admins see it. Cashiers do not need it for normal payments.

| Tab | What is in it | Actions |
| --- | --- | --- |
| Needs review | A code was found, but the amount differs, the line was already paid, or it was cancelled or voided. Read the reason on the row. | Assign, Ignore |
| Unmatched | No code, or an unknown code | Assign, Ignore |
| Matched | The transfer settled a payment line | None |
| Ignored | Outgoing transfers, other accounts, or ones a manager dismissed (see the note) | None |

**Ignore** a transaction that is not a customer payment: press **Ignore**, type a note (for example "supplier refund") and confirm.

**Assign** a transaction to a bill that is waiting for a transfer:

1. Press **Assign** on the transaction.
2. Type the **session number** of the bill and press **Find bill**.
3. Select the waiting bank-transfer line. Its number, memo and amount are shown.
4. Compare the amounts. If the line's amount differs from the transaction's, a red message appears and **Assign** stays disabled.
5. Press **Assign**. The line is settled, and the bill turns **Paid** if nothing else is owed.

If the bill has no waiting transfer line (for example the cashier cancelled it), the window says so. Ask the cashier to start a new bank transfer on that bill first, then assign the transaction to the new line.

## Troubleshooting and cheat sheet

Most problems come from a screen that is out of date. When a message appears, the page reloads the bill, so read the screen again before retrying.

| You see or hear | Why | What to do |
| --- | --- | --- |
| "This action is not allowed in the current state." | The bill changed: already paid, a payment is in progress, the session is not stopped, or no shift is open | Read the reloaded bill and continue from there |
| "Only a manager can do this." | Void and Bank inbox are for managers | Ask a manager |
| Pay is disabled in Cash | Handed-over amount is below the bill | Enter the right amount, or press Exact |
| Pay is disabled in Split | Remaining is not 0, or a line is incomplete | Adjust amounts until Remaining is 0 |
| "No cash shift is open" | No shift today | Press Open a shift |
| Customer paid by transfer, page still waiting | Bank has not reported it yet | Check your bank app, then press Received |
| QR expired | The time ran out | Press Received if paid; otherwise Cancel and pay again |
| Line shows Failed | The payment could not be recorded | Pay the balance again |
| Pressed Pay twice | Only one payment is created; the second is refused | Wait and check the receipt |
| Asked to log in | Your session expired | Log in again and reopen the bill |

**One-page cheat sheet**

| Customer wants to pay | Press | Then |
| --- | --- | --- |
| Cash, no change needed | Pay → Cash → Pay | Done |
| Cash with a big note | Pay → Cash, enter or tap the amount | Give the change shown, press Pay |
| Bank transfer | Pay → Bank transfer → Pay | Show the QR, wait for Paid (or press Received after checking) |
| Part cash, part transfer | Pay → Split | Remaining 0, press Pay, then handle the transfer |
| Card | Pay → Card (Stripe) → Pay | Complete in Stripe, press Confirm payment |
| Start of work | Billiard → Cash drawer → Open shift | Enter the counted float |
| End of work | Cash drawer → Close shift | Enter the counted cash, read the variance |
|  |  |  |
