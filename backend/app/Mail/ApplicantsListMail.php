<?php

namespace App\Mail;

use App\Models\PlacementJob;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;

class ApplicantsListMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public PlacementJob $job,
        public string $excelPath
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Applicant List – ' . $this->job->title . ' | Aadya Placements',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.applicants-list',
        );
    }

    public function attachments(): array
    {
        return [
            Attachment::fromPath($this->excelPath)
                ->as('applicants_' . str_replace(' ', '_', $this->job->title) . '.xlsx')
                ->withMime('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
        ];
    }
}
