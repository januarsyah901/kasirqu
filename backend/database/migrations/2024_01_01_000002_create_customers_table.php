<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->foreignId('person_id')->constrained('people', 'person_id')->cascadeOnDelete();
            $table->string('company_name')->nullable();
            $table->string('account_number')->nullable()->unique();
            $table->boolean('taxable')->default(true);
            $table->string('tax_id')->nullable();
            $table->unsignedBigInteger('sales_tax_code_id')->nullable();
            $table->boolean('deleted')->default(false);
            $table->decimal('discount', 15, 2)->default(0);
            $table->string('discount_type')->default('fixed');
            $table->string('package_id')->nullable();
            $table->integer('points')->default(0);
            $table->timestamp('date')->nullable();
            $table->unsignedBigInteger('employee_id')->nullable();
            $table->boolean('consent')->default(false);
            $table->timestamps();

            $table->index('deleted');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
