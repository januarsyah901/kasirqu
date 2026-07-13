<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('items', function (Blueprint $table) {
            $table->id('item_id');
            $table->string('name');
            $table->string('category')->default('');
            $table->unsignedBigInteger('supplier_id')->nullable();
            $table->string('item_number')->nullable()->unique();
            $table->string('description')->default('');
            $table->decimal('cost_price', 15, 2)->default(0);
            $table->decimal('unit_price', 15, 2)->default(0);
            $table->decimal('reorder_level', 15, 3)->default(0);
            $table->decimal('receiving_quantity', 15, 3)->default(1);
            $table->unsignedBigInteger('pic_id')->nullable();
            $table->boolean('allow_alt_description')->default(false);
            $table->boolean('is_serialized')->default(false);
            $table->boolean('deleted')->default(false);
            $table->string('custom1')->nullable();
            $table->string('custom2')->nullable();
            $table->string('custom3')->nullable();
            $table->string('custom4')->nullable();
            $table->string('custom5')->nullable();
            $table->string('custom6')->nullable();
            $table->string('custom7')->nullable();
            $table->string('custom8')->nullable();
            $table->string('custom9')->nullable();
            $table->string('custom10')->nullable();
            $table->string('stock_type')->default('STOCK');
            $table->string('item_type')->default('NORMAL');
            $table->unsignedBigInteger('tax_category_id')->nullable();
            $table->string('pic_filename')->nullable();
            $table->decimal('qty_per_pack', 15, 3)->nullable();
            $table->string('pack_name')->nullable();
            $table->unsignedBigInteger('low_sell_item_id')->nullable();
            $table->string('hsn_code')->nullable();
            $table->timestamps();

            $table->index('deleted');
            $table->index('supplier_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};
