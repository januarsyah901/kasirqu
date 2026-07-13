<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales_items_taxes', function (Blueprint $table) {
            $table->unsignedBigInteger('sale_id');
            $table->unsignedBigInteger('item_id');
            $table->integer('line')->default(0);
            $table->string('name');
            $table->decimal('percent', 15, 3)->default(0);
            $table->timestamps();

            $table->primary(['sale_id', 'item_id', 'line', 'name', 'percent']);
            $table->foreign('sale_id')->references('sale_id')->on('sales')->cascadeOnDelete();
            $table->foreign('item_id')->references('item_id')->on('items')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_items_taxes');
    }
};
