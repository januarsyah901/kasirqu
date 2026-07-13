<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->id('sale_id');
            $table->timestamp('sale_time')->useCurrent();
            $table->unsignedBigInteger('customer_id')->nullable();
            $table->unsignedBigInteger('employee_id')->default(0);
            $table->text('comment')->nullable();
            $table->string('quote_number')->nullable();
            $table->string('sale_status')->nullable();
            $table->string('invoice_number')->nullable()->unique();
            $table->unsignedBigInteger('dinner_table_id')->nullable();
            $table->string('work_order_number')->nullable();
            $table->string('sale_type')->default('SALE');
            $table->timestamps();

            $table->index('customer_id');
            $table->index('employee_id');
            $table->index('sale_time');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
