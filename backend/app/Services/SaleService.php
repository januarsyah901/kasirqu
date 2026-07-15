<?php

namespace App\Services;

use App\Models\Item;
use App\Models\ItemQuantity;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\SaleItemTax;
use App\Models\SalePayment;
use Illuminate\Support\Facades\DB;

/**
 * Sale business logic: per-line/totals calculation, atomic sale creation
 * (sale + sale_items + sale_payments + stock decrement), and receipt building.
 *
 * Extracted from SaleController so the money math is unit-testable without an
 * HTTP request.
 */
class SaleService
{
    public function __construct(private TaxService $taxService)
    {
    }

    /**
     * Compute per-line and sale-wide monetary totals for a set of items.
     *
     * @param  array<int, array{item_id:int,quantity_purchased:float,item_unit_price:float,discount_percent?:float}>  $items
     */
    public function calculateTotals(array $items): array
    {
        $lines = [];
        $subtotal = 0.0;
        $totalTax = 0.0;

        foreach ($items as $idx => $line) {
            $item = Item::findOrFail($line['item_id']);
            $qty = (float) $line['quantity_purchased'];
            $price = (float) $line['item_unit_price'];
            $discount = (float) ($line['discount_percent'] ?? 0);

            $amount = $this->taxService->lineAmount($qty, $price, $discount);
            $tax = $this->taxService->lineTaxAmount($item, $qty, $price, $discount);

            $lines[] = [
                'line' => $idx + 1,
                'item_id' => $item->item_id,
                'quantity_purchased' => $qty,
                'item_unit_price' => $price,
                'discount_percent' => $discount,
                'amount' => $amount,
                'tax' => $tax,
            ];

            $subtotal += $amount;
            $totalTax += $tax;
        }

        return [
            'lines' => $lines,
            'subtotal' => round($subtotal, 2),
            'total_tax' => round($totalTax, 2),
            'total' => round($subtotal + $totalTax, 2),
        ];
    }

    /**
     * Create a sale inside a DB transaction: sale row, sale_items (with real
     * cost price + applied tax), sale_payments, and a stock decrement per line.
     *
     * @param  array{customer_id?:?int,employee_id:int,comment?:string,invoice_number?:?string,sale_type?:string,items:array,payments?:array}  $data
     */
    public function createSale(array $data): Sale
    {
        $totals = $this->calculateTotals($data['items']);

        $sale = DB::transaction(function () use ($data, $totals) {
            $sale = Sale::create([
                'customer_id' => $data['customer_id'] ?? null,
                'employee_id' => $data['employee_id'],
                'comment' => $data['comment'] ?? '',
                'invoice_number' => $data['invoice_number'] ?? null,
                'sale_type' => $data['sale_type'] ?? 'SALE',
            ]);

            foreach ($totals['lines'] as $line) {
                $original = $data['items'][$line['line'] - 1];
                $item = Item::findOrFail($line['item_id']);

                SaleItem::create([
                    'sale_id' => $sale->sale_id,
                    'item_id' => $item->item_id,
                    'line' => $line['line'],
                    'description' => $original['description'] ?? '',
                    'quantity_purchased' => $line['quantity_purchased'],
                    'item_unit_price' => $line['item_unit_price'],
                    'item_cost_price' => $item->cost_price,
                    'discount_percent' => $line['discount_percent'],
                    'item_location' => $original['item_location'],
                ]);

                $this->recordAppliedTax($sale->sale_id, $item, $line);
                $this->decrementStock($item->item_id, (int) $original['item_location'], $line['quantity_purchased']);
            }

            foreach ($data['payments'] ?? [] as $payment) {
                SalePayment::create([
                    'sale_id' => $sale->sale_id,
                    'payment_type' => $payment['payment_type'],
                    'payment_amount' => $payment['payment_amount'],
                ]);
            }

            return $sale;
        });

        return $sale->load(['items', 'payments', 'customer.person', 'employee.person']);
    }

    /**
     * Record which tax applied to a sale line in sales_items_taxes
     * (name + percent), mirroring OSPOS. No-op when the item is not taxable.
     */
    protected function recordAppliedTax(int $saleId, Item $item, array $line): void
    {
        $applied = $this->taxService->appliedTax($item);
        if ($applied === null) {
            return;
        }

        SaleItemTax::create([
            'sale_id' => $saleId,
            'item_id' => $item->item_id,
            'line' => $line['line'],
            'name' => $applied['name'],
            'percent' => $applied['percent'],
        ]);
    }

    /**
     * Decrement on-hand quantity for the item at the given location.
     * Matches OSPOS: overselling is allowed, so a missing/empty row goes
     * negative rather than failing.
     */
    protected function decrementStock(int $itemId, int $locationId, float $qty): void
    {
        $iq = ItemQuantity::where('item_id', $itemId)
            ->where('location_id', $locationId)
            ->first();

        if ($iq === null) {
            ItemQuantity::create([
                'item_id' => $itemId,
                'location_id' => $locationId,
                'quantity' => -$qty,
            ]);

            return;
        }

        $iq->decrement('quantity', $qty);
    }

    /**
     * Build a receipt-style summary for a sale, recomputing line tax from the
     * stored applied-tax percent (faithful to OSPOS, which computes at read time).
     */
    public function buildReceipt(Sale $sale): array
    {
        $sale->loadMissing(['items', 'payments', 'customer.person']);

        $items = [];
        $subtotal = 0.0;
        $totalTax = 0.0;
        $totalPaid = 0.0;

        foreach ($sale->items as $si) {
            $amount = $this->taxService->lineAmount(
                (float) $si->quantity_purchased,
                (float) $si->item_unit_price,
                (float) $si->discount_percent
            );

            $percent = (float) (SaleItemTax::where('sale_id', $sale->sale_id)
                ->where('item_id', $si->item_id)
                ->where('line', $si->line)
                ->value('percent') ?? 0);
            $tax = round($amount * ($percent / 100), 2);

            $subtotal += $amount;
            $totalTax += $tax;

            $items[] = [
                'item_id' => $si->item_id,
                'line' => $si->line,
                'quantity_purchased' => $si->quantity_purchased,
                'item_unit_price' => $si->item_unit_price,
                'discount_percent' => $si->discount_percent,
                'amount' => round($amount, 2),
                'tax' => $tax,
            ];
        }

        foreach ($sale->payments as $p) {
            $totalPaid += (float) $p->payment_amount;
        }

        $total = $subtotal + $totalTax;

        $person = $sale->customer?->person;

        return [
            'sale_id' => $sale->sale_id,
            'sale_time' => $sale->sale_time,
            'customer' => $person ? trim($person->first_name.' '.$person->last_name) : null,
            'items' => $items,
            'subtotal' => round($subtotal, 2),
            'total_tax' => round($totalTax, 2),
            'total' => round($total, 2),
            'amount_paid' => round($totalPaid, 2),
            'change' => round($totalPaid - $total, 2),
        ];
    }
}
