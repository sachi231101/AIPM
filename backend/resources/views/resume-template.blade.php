<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ $student->user?->name ?? 'Student' }} – Resume</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
  <style>
    @media print {
      .no-print { display: none !important; }
      body { background: white !important; padding: 0 !important; }
      .resume-container { box-shadow: none !important; margin: 0 !important; max-width: 100% !important; }
    }
    body { background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2d3748; }
    .resume-container { max-width: 850px; margin: 30px auto; background: #ffffff; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); padding: 40px; }
    .header-name { font-size: 2rem; font-weight: 700; color: #0f4c81; margin-bottom: 4px; }
    .section-title { font-size: 1.1rem; font-weight: 700; color: #0f4c81; text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 2px solid #0f4c81; padding-bottom: 6px; margin-top: 24px; margin-bottom: 14px; }
    .skill-badge { background-color: #eef2f6; color: #0f4c81; font-weight: 600; font-size: 0.85rem; padding: 5px 12px; border-radius: 20px; margin-right: 6px; margin-bottom: 8px; display: inline-block; }
    .meta-text { font-size: 0.9rem; color: #6c757d; }
  </style>
</head>
<body>
  <!-- Action Bar -->
  <div class="container text-end pt-3 no-print" style="max-width: 850px;">
    <button onclick="window.print()" class="btn btn-primary btn-sm rounded-pill px-3">
      <i className="bi bi-printer me-1"></i> Print / Save as PDF
    </button>
  </div>

  <div class="resume-container">
    @php
      $personal = $content['personalInfo'] ?? [];
      $fullName = $personal['fullName'] ?? $student->user?->name ?? 'Student Name';
      $email = $personal['email'] ?? $student->user?->email ?? '';
      $phone = $personal['phone'] ?? $student->mobile ?? '';
      $location = $personal['address'] ?? $personal['location'] ?? $student->address ?? '';
      $linkedin = $personal['linkedin'] ?? $student->linkedin ?? '';
      $github = $personal['github'] ?? $student->github ?? '';
      $summary = $content['summary'] ?? $content['professionalSummary'] ?? '';
    @endphp

    <!-- Header -->
    <div class="border-bottom pb-3">
      <h1 class="header-name">{{ $fullName }}</h1>
      <div class="meta-text d-flex flex-wrap gap-3 mt-2">
        @if($email) <span><i class="bi bi-envelope me-1"></i>{{ $email }}</span> @endif
        @if($phone) <span><i class="bi bi-telephone me-1"></i>{{ $phone }}</span> @endif
        @if($location) <span><i class="bi bi-geo-alt me-1"></i>{{ $location }}</span> @endif
        @if($linkedin) <span><i class="bi bi-linkedin me-1"></i>{{ $linkedin }}</span> @endif
        @if($github) <span><i class="bi bi-github me-1"></i>{{ $github }}</span> @endif
      </div>
      @if($student->institute)
        <div class="meta-text mt-1 text-primary fw-medium">
          <i class="bi bi-bank2 me-1"></i>{{ $student->institute->name }}
        </div>
      @endif
    </div>

    <!-- Summary -->
    @if(!empty($summary))
      <div class="section-title">Professional Summary</div>
      <p class="text-secondary" style="font-size: 0.95rem; line-height: 1.6;">
        {{ is_array($summary) ? implode(' ', $summary) : $summary }}
      </p>
    @endif

    <!-- Education -->
    @php $education = $content['education'] ?? []; @endphp
    @if(!empty($education) && is_array($education))
      <div class="section-title">Education</div>
      @foreach($education as $edu)
        <div class="mb-3">
          <div class="d-flex justify-content-between align-items-baseline">
            <h6 class="fw-bold mb-0 text-dark">{{ $edu['degree'] ?? $edu['course'] ?? 'Degree' }}</h6>
            <span class="badge bg-light text-dark border">{{ $edu['year'] ?? $edu['batch'] ?? '' }}</span>
          </div>
          <p class="mb-0 small text-muted">{{ $edu['institution'] ?? $edu['school'] ?? $student->institute?->name ?? '' }}</p>
          @if(!empty($edu['score']) || !empty($edu['cgpa']))
            <small class="text-success fw-medium">CGPA / Score: {{ $edu['score'] ?? $edu['cgpa'] }}</small>
          @endif
        </div>
      @endforeach
    @endif

    <!-- Experience -->
    @php $experience = $content['experience'] ?? []; @endphp
    @if(!empty($experience) && is_array($experience))
      <div class="section-title">Experience & Internships</div>
      @foreach($experience as $exp)
        <div class="mb-3">
          <div class="d-flex justify-content-between align-items-baseline">
            <h6 class="fw-bold mb-0 text-dark">{{ $exp['role'] ?? $exp['title'] ?? 'Role' }}</h6>
            <span class="badge bg-light text-dark border">{{ $exp['duration'] ?? $exp['dates'] ?? '' }}</span>
          </div>
          <p class="mb-1 small text-primary font-monospace">{{ $exp['company'] ?? $exp['organization'] ?? '' }}</p>
          @if(!empty($exp['description']))
            <p class="small text-secondary mb-0">{{ is_array($exp['description']) ? implode(' ', $exp['description']) : $exp['description'] }}</p>
          @endif
        </div>
      @endforeach
    @endif

    <!-- Projects -->
    @php $projects = $content['projects'] ?? []; @endphp
    @if(!empty($projects) && is_array($projects))
      <div class="section-title">Projects</div>
      @foreach($projects as $proj)
        <div class="mb-3">
          <h6 class="fw-bold mb-0 text-dark">{{ $proj['title'] ?? $proj['name'] ?? 'Project' }}</h6>
          @if(!empty($proj['techStack']) || !empty($proj['technologies']))
            <small class="text-muted d-block mb-1">Tech: {{ is_array($proj['techStack'] ?? $proj['technologies']) ? implode(', ', $proj['techStack'] ?? $proj['technologies']) : ($proj['techStack'] ?? $proj['technologies']) }}</small>
          @endif
          @if(!empty($proj['description']))
            <p class="small text-secondary mb-0">{{ is_array($proj['description']) ? implode(' ', $proj['description']) : $proj['description'] }}</p>
          @endif
        </div>
      @endforeach
    @endif

    <!-- Skills -->
    @php
      $skills = $content['skills'] ?? [];
      $skillsList = is_array($skills) ? (isset($skills[0]) ? $skills : array_merge(...array_values($skills))) : [];
    @endphp
    @if(!empty($skillsList))
      <div class="section-title">Skills & Competencies</div>
      <div class="pt-1">
        @foreach($skillsList as $sk)
          @if(is_string($sk))
            <span class="skill-badge">{{ $sk }}</span>
          @elseif(is_array($sk) && isset($sk['name']))
            <span class="skill-badge">{{ $sk['name'] }}</span>
          @endif
        @endforeach
      </div>
    @endif

    <!-- Certifications -->
    @php $certifications = $content['certifications'] ?? []; @endphp
    @if(!empty($certifications) && is_array($certifications))
      <div class="section-title">Certifications & Achievements</div>
      <ul class="small text-secondary ps-3 mb-0">
        @foreach($certifications as $cert)
          <li>{{ is_array($cert) ? ($cert['title'] ?? $cert['name'] ?? implode(', ', $cert)) : $cert }}</li>
        @endforeach
      </ul>
    @endif
  </div>
</body>
</html>
