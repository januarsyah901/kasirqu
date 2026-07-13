<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales_items', function (Blueprint $table) {
            $table->unsignedBigInteger('sale_id');
            $table->unsignedBigInteger('item_id');
            $table->string('description')->nullable();
            $table->string('serialnumber')->nullable();
            $table->integer('line')->default(0);
            $table->decimal('quantity_purchased', 15, 3)->default(0);
            $table->decimal('item_cost_price', 15, 2)->default(0);
            $table->decimal('item_unit_price', 15, 2)->default(0);
            $table->decimal('discount_percent', 15, 2)->default(0);
            $table->unsignedBigInteger('item_location');
            $table->timestamps();

            $table->primary(['sale_id', 'item_id', 'line']);
            $table->foreign('sale_id')->references('sale_id')->on('sales')->cascadeOnDelete();
            $table->foreign('item_id')->references('item_id')->on('items')->cascadeOnDelete();
            $table->foreign('item_location')->references('id')->on('stock_locations')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_items');
    }
};
