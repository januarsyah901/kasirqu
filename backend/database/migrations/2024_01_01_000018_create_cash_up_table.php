<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_up', function (Blueprint $table) {
            $table->id('cashup_id');
            $table->decimal('open_amount', 15, 2)->default(0);
            $table->decimal('close_amount', 15, 2)->default(0);
            $table->decimal('cash_sales_amount', 15, 2)->default(0);
            $table->date('open_date')->nullable();
            $table->date('close_date')->nullable();
            $table->unsignedBigInteger('employee_id')->nullable();
            $table->unsignedBigInteger('location_id')->nullable();
            $table->boolean('deleted')->default(false);
            $table->timestamps();

            $table->index('employee_id');
            $table->index('location_id');
            $table->index('deleted');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_up');
    }
};
