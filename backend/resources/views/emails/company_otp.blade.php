<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Code - Aadya Institution</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f6f9;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
        }
        .container {
            max-width: 580px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        }
        .header {
            background: #0f172a;
            color: #ffffff;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 22px;
            font-weight: 700;
            letter-spacing: 0.5px;
        }
        .header p {
            margin: 6px 0 0 0;
            color: #94a3b8;
            font-size: 13px;
        }
        .content {
            padding: 35px 30px;
            color: #334155;
            line-height: 1.6;
        }
        .greeting {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 12px;
            color: #0f172a;
        }
        .otp-box {
            background: #f8fafc;
            border: 2px dashed #0284c7;
            border-radius: 10px;
            text-align: center;
            padding: 24px;
            margin: 25px 0;
        }
        .otp-code {
            font-size: 36px;
            font-weight: 800;
            letter-spacing: 8px;
            color: #0284c7;
            font-family: monospace;
            display: inline-block;
        }
        .otp-note {
            font-size: 12px;
            color: #64748b;
            margin-top: 8px;
        }
        .warning {
            background-color: #fffbebf3;
            border-left: 4px solid #f59e0b;
            padding: 12px 16px;
            font-size: 13px;
            color: #92400e;
            border-radius: 4px;
            margin-top: 20px;
        }
        .footer {
            background-color: #f8fafc;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Aadya & Edify Institution</h1>
            <p>Placement & Corporate Relations Cell</p>
        </div>
        <div class="content">
            <div class="greeting">
                Hello {{ $companyName ? $companyName : 'Recruiter' }},
            </div>
            
            <p>
                @if($actionType === 'registration')
                    Thank you for registering your company on the Aadya Institution Placement Portal. Please use the following 6-digit verification code to complete your registration process:
                @else
                    You have requested access to your Company Recruiter Portal account. Please use the verification code below to complete your 2-Step verification login:
                @endif
            </p>

            <div class="otp-box">
                <div class="otp-code">{{ $otp }}</div>
                <div class="otp-note">Valid for 10 minutes. Do not share this code with anyone.</div>
            </div>

            <div class="warning">
                <strong>Security Notice:</strong> If you did not initiate this request, please ignore this email or contact our placement team immediately.
            </div>

            <p style="margin-top: 25px; font-size: 14px; color: #475569;">
                Best regards,<br>
                <strong>Placement & Corporate Relations Cell</strong><br>
                Aadya & Edify Institution
            </p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Aadya Institution Placement Portal. All rights reserved.<br>
            Automated notification — Please do not reply directly to this email.
        </div>
    </div>
</body>
</html>
