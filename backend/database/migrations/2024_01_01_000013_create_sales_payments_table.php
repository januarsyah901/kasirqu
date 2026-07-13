<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales_payments', function (Blueprint $table) {
            $table->unsignedBigInteger('sale_id');
            $table->string('payment_type');
            $table->decimal('payment_amount', 15, 2)->default(0);
            $table->timestamps();

            $table->primary(['sale_id', 'payment_type']);
            $table->foreign('sale_id')->references('sale_id')->on('sales')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_payments');
    }
};
