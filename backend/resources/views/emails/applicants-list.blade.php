<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
  .header { background: #0F4C81; color: white; padding: 20px 30px; }
  .body { padding: 30px; }
  .footer { background: #f4f4f4; padding: 15px 30px; font-size: 12px; color: #777; }
  .info-box { background: #f9f9f9; border-left: 4px solid #0F4C81; padding: 15px; margin: 20px 0; }
</style></head>
<body>
  <div class="header">
    <h2 style="margin:0">Aadya Placements — Applicant List</h2>
  </div>
  <div class="body">
    <p>Dear <strong>{{ $job->company->hr_name }}</strong>,</p>
    <p>Please find attached the list of students who have applied for the following placement drive:</p>
    <div class="info-box">
      <strong>Position:</strong> {{ $job->title }}<br>
      <strong>Location:</strong> {{ $job->location ?? 'N/A' }}<br>
      <strong>Last Date:</strong> {{ $job->last_date?->format('d M Y') ?? 'N/A' }}
    </div>
    <p>
      The attached Excel file contains the following information for each applicant:
      <ul>
        <li>Student Name</li>
        <li>Institute</li>
        <li>Course</li>
        <li>Phone</li>
        <li>Email</li>
        <li>Resume Download Link</li>
        <li>Applied Date</li>
      </ul>
    </p>
    <p>Please review the applicants and reach out to us if you need any additional information.</p>
    <p>Best regards,<br><strong>Aadya Placements Team</strong></p>
  </div>
  <div class="footer">
    © {{ date('Y') }} Aadya Institution Placement Cell | rakshith@edifyinstitution.com<br>
    183, 2nd Floor, 1st Main Road, Ramamurthy Nagar, Bengaluru – 560016
  </div>
</body>
</html>
