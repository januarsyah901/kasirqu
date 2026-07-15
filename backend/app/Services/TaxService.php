<?php

namespace App\Services;

use App\Models\Item;

/**
 * Tax calculation logic extracted from the sale flow so it can be unit-tested
 * independently of the HTTP layer.
 *
 * Mirrors OpenSourcePOS behaviour: an item's effective tax rate comes from its
 * tax category; if item-level taxes are attached, the highest rate wins.
 */
class TaxService
{
    /**
     * Effective tax rate (percent) for an item. Returns 0.0 when no tax applies.
     */
    public function effectiveTaxRate(Item $item): float
    {
        $applied = $this->appliedTax($item);

        return $applied === null ? 0.0 : (float) $applied['percent'];
    }

    /**
     * The single tax that actually applies to an item (highest rate wins),
     * as {name, percent}. Returns null when the item is not taxable.
     */
    public function appliedTax(Item $item): ?array
    {
        $candidates = [];

        if ($item->taxCategory !== null) {
            $candidates[] = [
                'name' => $item->taxCategory->name ?? 'Tax',
                'percent' => (float) $item->taxCategory->tax_rate,
            ];
        }

        foreach ($item->itemTaxes as $itemTax) {
            $candidates[] = [
                'name' => $itemTax->name ?? 'Item Tax',
                'percent' => (float) $itemTax->percent,
            ];
        }

        if ($candidates === []) {
            return null;
        }

        // Highest rate wins, matching OSPOS tax selection.
        return array_reduce(
            $candidates,
            static fn (array $best, array $c): array => $c['percent'] > $best['percent'] ? $c : $best,
            $candidates[0]
        );
    }

    /**
     * Line amount after discount, before tax.
     */
    public function lineAmount(float $quantity, float $unitPrice, float $discountPercent = 0): float
    {
        return round($quantity * $unitPrice * (1 - ($discountPercent / 100)), 2);
    }

    /**
     * Tax amount for a single sales line, rounded to 2 decimals.
     */
    public function lineTaxAmount(Item $item, float $quantity, float $unitPrice, float $discountPercent = 0): float
    {
        $taxable = $this->lineAmount($quantity, $unitPrice, $discountPercent);
        $rate = $this->effectiveTaxRate($item);

        return round($taxable * ($rate / 100), 2);
    }
}
