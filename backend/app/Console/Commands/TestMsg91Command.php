<?php

namespace App\Console\Commands;

use App\Services\Msg91Service;
use Illuminate\Console\Command;

class TestMsg91Command extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'msg91:test {mobile : The mobile number to send test OTP to}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test MSG91 SMS OTP sending and display raw API response';

    /**
     * Execute the console command.
     */
    public function handle(Msg91Service $msg91Service): int
    {
        $mobile = $this->argument('mobile');
        $otp = sprintf('%06d', random_int(100000, 999999));

        $this->info("----------------------------------------");
        $this->info("Testing MSG91 OTP Sending");
        $this->info("Mobile: {$mobile}");
        $this->info("Test OTP: {$otp}");
        $this->info("Auth Key Configured: " . (config('services.msg91.auth_key') ? 'YES' : 'NO (EMPTY)'));
        $this->info("Sender ID: " . config('services.msg91.sender_id'));
        $this->info("Template ID: " . config('services.msg91.template_id'));
        $this->info("----------------------------------------");

        $sent = $msg91Service->sendOtpSms($mobile, $otp);

        if ($sent) {
            $this->info("SUCCESS: MSG91 reported SMS sent successfully!");
            return Command::SUCCESS;
        } else {
            $this->error("FAILED: MSG91 failed to send SMS. Check storage/logs/laravel.log for full output.");
            return Command::FAILURE;
        }
    }
}
