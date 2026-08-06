<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CompanyOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $otp;
    public string $actionType; // 'registration' or 'login'
    public string $companyName;

    /**
     * Create a new message instance.
     */
    public function __construct(string $otp, string $actionType = 'login', string $companyName = '')
    {
        $this->otp = $otp;
        $this->actionType = $actionType;
        $this->companyName = $companyName;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = $this->actionType === 'registration'
            ? 'Your Company Registration Verification Code - Aadya Institution'
            : 'Your Recruiter Portal Verification Code - Aadya Institution';

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.company_otp',
            with: [
                'otp' => $this->otp,
                'actionType' => $this->actionType,
                'companyName' => $this->companyName,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}
