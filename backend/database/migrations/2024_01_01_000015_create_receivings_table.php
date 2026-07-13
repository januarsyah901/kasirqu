<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('receivings', function (Blueprint $table) {
            $table->id('receiving_id');
            $table->unsignedBigInteger('supplier_id')->nullable();
            $table->unsignedBigInteger('employee_id')->nullable();
            $table->timestamp('receiving_time')->nullable();
            $table->string('comment')->default('');
            $table->string('payment_type')->default('Cash');
            $table->decimal('amount_tendered', 15, 2)->default(0);
            $table->decimal('amount_owed', 15, 2)->default(0);
            $table->string('reference')->nullable();
            $table->unsignedBigInteger('location_id')->nullable();
            $table->boolean('deleted')->default(false);
            $table->timestamps();

            $table->index('supplier_id');
            $table->index('employee_id');
            $table->index('location_id');
            $table->index('deleted');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('receivings');
    }
};
